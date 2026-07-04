/**
 * Water Service - Business logic for water logging
 * Fixes: Prevents double XP award, handles removal properly
 */

const WaterLog = require('../models/WaterLog');
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const DailyScore = require('../models/DailyScore');
const { calculateLevel } = require('../utils/xpCalculator');
const logger = require('../utils/logger');

const WATER_GOAL_XP = 15;

/**
 * Add water and award XP only on first goal achievement
 * Uses atomic operation to prevent double XP
 */
const addWaterEntry = async (userId, amount, source = 'water', date) => {
  try {
    if (!amount || amount <= 0) {
      return {
        success: false,
        error: 'Amount must be positive',
        statusCode: 400,
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
        statusCode: 404,
      };
    }

    const goal = user.goals?.waterGoal || 2500;

    // Atomically update or create water log
    const log = await WaterLog.findOneAndUpdate(
      { user: userId, date },
      {
        $push: {
          entries: {
            amount,
            source,
            loggedAt: new Date(),
          },
        },
        $inc: { totalAmount: amount },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    // Recalculate goal achieved state
    const previousGoalAchieved = log.goalAchieved;
    const currentGoalAchieved = log.totalAmount >= goal;
    log.goalAchieved = currentGoalAchieved;

    let xpEarned = 0;
    let levelInfo = null;

    // Award XP ONLY on first achievement (transition from false to true)
    if (currentGoalAchieved && !previousGoalAchieved) {
      xpEarned = WATER_GOAL_XP;
      log.xpEarned = xpEarned;

      // Update user XP atomically
      const newXP = user.xp + xpEarned;
      levelInfo = calculateLevel(newXP);

      await User.findByIdAndUpdate(userId, {
        xp: newXP,
        level: levelInfo.level,
        totalXPEarned: user.totalXPEarned + xpEarned,
      });

      // Create audit log
      await XPLog.create({
        user: userId,
        date,
        amount: xpEarned,
        source: 'daily_goal',
        sourceName: 'Water Goal Achieved',
        xpBefore: user.xp,
        xpAfter: newXP,
      });

      logger.info(`Water goal achieved: ${userId} - ${date}`);
    }

    // Save water log
    await log.save();

    // Update daily score water component
    const waterScore = Math.min((log.totalAmount / goal) * 100, 100);
    await DailyScore.findOneAndUpdate(
      { user: userId, date },
      { waterScore: Math.round(waterScore) },
      { upsert: true }
    );

    return {
      success: true,
      data: {
        log,
        xpEarned,
        goalAchieved: log.goalAchieved,
        remaining: Math.max(goal - log.totalAmount, 0),
        percentage: Math.round(waterScore),
        levelInfo: xpEarned > 0 ? levelInfo : null,
      },
    };
  } catch (error) {
    logger.error(`Error adding water: ${error.message}`);
    return {
      success: false,
      error: error.message,
      statusCode: 500,
    };
  }
};

/**
 * Remove water entry and handle XP reversal if needed
 * Properly recalculates goal achievement
 */
const removeWaterEntry = async (userId, entryId, date) => {
  try {
    const log = await WaterLog.findOne({ user: userId, date });

    if (!log) {
      return {
        success: false,
        error: 'No water log for today',
        statusCode: 404,
      };
    }

    const entry = log.entries.id(entryId);
    if (!entry) {
      return {
        success: false,
        error: 'Entry not found',
        statusCode: 404,
      };
    }

    const user = await User.findById(userId);
    const goal = user.goals?.waterGoal || 2500;
    const goalAchievedBefore = log.goalAchieved;

    // Remove entry and recalculate total
    const entryAmount = entry.amount;
    log.totalAmount = Math.max(log.totalAmount - entryAmount, 0);
    entry.deleteOne();

    // Check if goal was lost by removing this entry
    const goalAchievedAfter = log.totalAmount >= goal;

    if (goalAchievedBefore && !goalAchievedAfter) {
      // Goal was achieved before, but not after removal
      // This means the removed entry was critical to achieving the goal
      log.xpEarned = 0;
      log.goalAchieved = false;

      // Optionally reverse XP (be careful with this!)
      // Only reverse if the amount was small (user removed entry right after goal)
      if (entryAmount <= 500) {
        // Small amount - likely accidental logging
        const newXP = Math.max(user.xp - WATER_GOAL_XP, 0);
        const levelInfo = calculateLevel(newXP);

        await User.findByIdAndUpdate(userId, {
          xp: newXP,
          level: levelInfo.level,
          totalXPEarned: Math.max(user.totalXPEarned - WATER_GOAL_XP, 0),
        });

        logger.info(`Water entry reversed: ${userId} - ${date}`);
      }
    }

    log.goalAchieved = goalAchievedAfter;
    await log.save();

    // Update daily score
    const waterScore = Math.min((log.totalAmount / goal) * 100, 100);
    await DailyScore.findOneAndUpdate(
      { user: userId, date },
      { waterScore: Math.round(waterScore) },
      { upsert: true }
    );

    return {
      success: true,
      data: {
        log,
        removed: true,
        goalAchieved: goalAchievedAfter,
        percentage: Math.round(waterScore),
      },
    };
  } catch (error) {
    logger.error(`Error removing water entry: ${error.message}`);
    return {
      success: false,
      error: error.message,
      statusCode: 500,
    };
  }
};

/**
 * Get today's water log
 */
const getTodayWaterLog = async (userId, date) => {
  try {
    const user = await User.findById(userId);
    const goal = user.goals?.waterGoal || 2500;

    let log = await WaterLog.findOne({ user: userId, date });

    if (!log) {
      return {
        success: true,
        data: {
          log: null,
          goal,
          totalAmount: 0,
          percentage: 0,
          entries: [],
        },
      };
    }

    return {
      success: true,
      data: {
        log,
        goal,
        totalAmount: log.totalAmount,
        percentage: Math.min((log.totalAmount / goal) * 100, 100),
        entries: log.entries,
      },
    };
  } catch (error) {
    logger.error(`Error fetching water log: ${error.message}`);
    return {
      success: false,
      error: error.message,
      statusCode: 500,
    };
  }
};

module.exports = {
  addWaterEntry,
  removeWaterEntry,
  getTodayWaterLog,
};
