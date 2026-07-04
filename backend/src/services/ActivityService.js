/**
 * Activity Service - Business logic for activity operations
 * Handles atomic operations, XP calculations, and data consistency
 */

const Activity = require('../models/Activity');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const { calculateLevel } = require('../utils/xpCalculator');
const logger = require('../utils/logger');

/**
 * Complete an activity atomically to prevent double XP
 * Uses MongoDB conditional update to prevent race conditions
 */
const completeActivityAtomic = async (userId, activityId, date, logData = {}) => {
  try {
    // Verify activity exists and belongs to user
    const activity = await Activity.findOne({
      _id: activityId,
      user: userId,
    });

    if (!activity) {
      return {
        success: false,
        error: 'Activity not found',
        statusCode: 404,
      };
    }

    // Atomic findOneAndUpdate - prevents double completion
    // Only updates if status is NOT already 'completed'
    const log = await ActivityLog.findOneAndUpdate(
      {
        user: userId,
        activity: activityId,
        date,
        status: { $ne: 'completed' }, // Condition: must not be completed
      },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          xpEarned: activity.xpReward,
          ...logData, // notes, mood, rating, actualDuration
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    if (!log) {
      return {
        success: false,
        error: 'Activity already completed for today',
        statusCode: 400,
      };
    }

    // Award XP only if this was newly created or previously not completed
    const user = await User.findById(userId);
    const levelBefore = user.level;
    const xpBefore = user.xp;
    const newXP = user.xp + activity.xpReward;
    const levelInfo = calculateLevel(newXP);

    // Update user atomically
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { xp: activity.xpReward, totalXPEarned: activity.xpReward },
        level: levelInfo.level,
        lastActiveDate: new Date(),
      },
      { new: true }
    );

    // Create audit log
    await XPLog.create({
      user: userId,
      date,
      amount: activity.xpReward,
      source: 'activity',
      sourceId: activity._id,
      sourceName: activity.name,
      levelBefore,
      levelAfter: levelInfo.level,
      xpBefore,
      xpAfter: newXP,
    });

    logger.info(`Activity completed: ${userId} - ${activity.name}`);

    return {
      success: true,
      data: {
        log,
        xpEarned: activity.xpReward,
        totalXP: newXP,
        levelInfo,
        leveledUp: levelInfo.level > levelBefore,
      },
    };
  } catch (error) {
    logger.error(`Error completing activity: ${error.message}`);
    return {
      success: false,
      error: error.message,
      statusCode: 500,
    };
  }
};

/**
 * Get activities for user with pagination
 * Prevents loading 100+ activities at once
 */
const getActivitiesWithPagination = async (
  userId,
  { category, enabled, page = 1, limit = 50 } = {}
) => {
  try {
    const filter = { user: userId };
    if (category) filter.category = category;
    if (enabled !== undefined) filter.isEnabled = enabled === 'true';

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .sort({ order: 1, scheduledTime: 1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);

    return {
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    logger.error(`Error fetching activities: ${error.message}`);
    return {
      success: false,
      error: error.message,
      statusCode: 500,
    };
  }
};

/**
 * Get today's activity logs with activity details
 * Optimized with single populate query
 */
const getTodayActivityLogs = async (userId, date) => {
  try {
    const logs = await ActivityLog.find({
      user: userId,
      date,
    })
      .populate('activity', 'name icon color category xpReward scheduledTime')
      .lean(); // Lean query for faster response

    return {
      success: true,
      data: { logs, date },
    };
  } catch (error) {
    logger.error(`Error fetching logs: ${error.message}`);
    return {
      success: false,
      error: error.message,
      statusCode: 500,
    };
  }
};

/**
 * Update activity status atomically
 * Prevents inconsistent state
 */
const updateActivityStatus = async (userId, logId, status, notes = null) => {
  try {
    const validStatuses = ['pending', 'in_progress', 'completed', 'skipped', 'late', 'missed'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        statusCode: 400,
      };
    }

    const updateData = { $set: { status } };
    if (notes) updateData.$set.notes = notes;

    const log = await ActivityLog.findOneAndUpdate(
      { _id: logId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!log) {
      return {
        success: false,
        error: 'Activity log not found',
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: { log },
    };
  } catch (error) {
    logger.error(`Error updating status: ${error.message}`);
    return {
      success: false,
      error: error.message,
      statusCode: 500,
    };
  }
};

/**
 * Duplicate an activity with new data
 */
const duplicateActivity = async (userId, activityId) => {
  try {
    const original = await Activity.findOne({
      _id: activityId,
      user: userId,
    });

    if (!original) {
      return {
        success: false,
        error: 'Activity not found',
        statusCode: 404,
      };
    }

    const duplicate = await Activity.create({
      user: userId,
      name: `${original.name} (Copy)`,
      icon: original.icon,
      color: original.color,
      category: original.category,
      description: original.description,
      scheduledTime: original.scheduledTime,
      estimatedDuration: original.estimatedDuration,
      repeatSchedule: original.repeatSchedule,
      xpReward: original.xpReward,
      priority: original.priority,
      reminder: original.reminder,
      isDefault: false,
    });

    return {
      success: true,
      data: { activity: duplicate },
      message: 'Activity duplicated successfully',
    };
  } catch (error) {
    logger.error(`Error duplicating activity: ${error.message}`);
    return {
      success: false,
      error: error.message,
      statusCode: 500,
    };
  }
};

module.exports = {
  completeActivityAtomic,
  getActivitiesWithPagination,
  getTodayActivityLogs,
  updateActivityStatus,
  duplicateActivity,
};
