const WaterLog = require('../models/WaterLog');
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const DailyScore = require('../models/DailyScore');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');

// @route   POST /api/water/add
const addWater = async (req, res, next) => {
  try {
    const { amount, source = 'water' } = req.body;
    if (!amount || amount <= 0) return sendError(res, 'Amount must be positive.', 400);

    const date = new Date().toISOString().split('T')[0];
    const user = await User.findById(req.user._id);
    const goal = user.goals.waterGoal || 2500;

    let log = await WaterLog.findOne({ user: req.user._id, date });

    const wasGoalAchievedBefore = log?.goalAchieved || false;

    if (log) {
      log.entries.push({ amount, source, loggedAt: new Date() });
      log.totalAmount += amount;
      log.goalAchieved = log.totalAmount >= goal;
      await log.save();
    } else {
      log = await WaterLog.create({
        user: req.user._id,
        date,
        goal,
        entries: [{ amount, source, loggedAt: new Date() }],
        totalAmount: amount,
        goalAchieved: amount >= goal,
      });
    }

    let xpEarned = 0;
    // Award XP when goal is first achieved
    if (log.goalAchieved && !wasGoalAchievedBefore) {
      xpEarned = 15;
      log.xpEarned = xpEarned;
      await log.save();

      const newXP = user.xp + xpEarned;
      const levelInfo = calculateLevel(newXP);
      await User.findByIdAndUpdate(req.user._id, {
        xp: newXP,
        level: levelInfo.level,
        totalXPEarned: user.totalXPEarned + xpEarned,
      });

      await XPLog.create({
        user: req.user._id,
        date,
        amount: xpEarned,
        source: 'daily_goal',
        sourceName: 'Water Goal Achieved',
        xpBefore: user.xp,
        xpAfter: newXP,
      });
    }

    // Update daily score water component
    const waterScore = Math.min((log.totalAmount / goal) * 100, 100);
    await DailyScore.findOneAndUpdate(
      { user: req.user._id, date },
      { waterScore: Math.round(waterScore) },
      { upsert: true }
    );

    return sendSuccess(res, {
      log,
      xpEarned,
      goalAchieved: log.goalAchieved,
      remaining: Math.max(goal - log.totalAmount, 0),
      percentage: Math.round(waterScore),
    }, 'Water logged');
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/water/entry/:entryId
const removeWaterEntry = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const log = await WaterLog.findOne({ user: req.user._id, date });
    if (!log) return sendError(res, 'No water log for today.', 404);

    const entry = log.entries.id(req.params.entryId);
    if (!entry) return sendError(res, 'Entry not found.', 404);

    log.totalAmount = Math.max(log.totalAmount - entry.amount, 0);
    entry.deleteOne();

    const user = await User.findById(req.user._id);
    log.goalAchieved = log.totalAmount >= (user.goals.waterGoal || 2500);
    await log.save();

    return sendSuccess(res, { log }, 'Entry removed');
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/water/today
const getTodayWater = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const user = await User.findById(req.user._id);
    const log = await WaterLog.findOne({ user: req.user._id, date });
    const goal = user.goals.waterGoal || 2500;

    return sendSuccess(res, {
      log,
      goal,
      totalAmount: log?.totalAmount || 0,
      remaining: Math.max(goal - (log?.totalAmount || 0), 0),
      percentage: log ? Math.round(Math.min((log.totalAmount / goal) * 100, 100)) : 0,
      goalAchieved: log?.goalAchieved || false,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/water/history
const getWaterHistory = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    const startDateStr = startDate.toISOString().split('T')[0];

    const logs = await WaterLog.find({
      user: req.user._id,
      date: { $gte: startDateStr },
    }).sort({ date: -1 });

    const avg = logs.reduce((sum, l) => sum + l.totalAmount, 0) / (logs.length || 1);
    const goalDays = logs.filter((l) => l.goalAchieved).length;

    return sendSuccess(res, {
      logs,
      stats: {
        avgAmount: Math.round(avg),
        goalAchievedDays: goalDays,
        totalDays: logs.length,
        goalAchievedRate: logs.length ? Math.round((goalDays / logs.length) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addWater, removeWaterEntry, getTodayWater, getWaterHistory };
