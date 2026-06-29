const Activity = require('../models/Activity');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');

// @route   GET /api/activities
const getActivities = async (req, res, next) => {
  try {
    const { category, enabled } = req.query;
    const filter = { user: req.user._id };
    if (category) filter.category = category;
    if (enabled !== undefined) filter.isEnabled = enabled === 'true';

    const activities = await Activity.find(filter).sort({ order: 1, scheduledTime: 1 });
    return sendSuccess(res, { activities });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/activities
const createActivity = async (req, res, next) => {
  try {
    const {
      name, icon, color, category, description, scheduledTime,
      estimatedDuration, repeatSchedule, xpReward, priority, reminder,
    } = req.body;

    const count = await Activity.countDocuments({ user: req.user._id });

    const activity = await Activity.create({
      user: req.user._id,
      name, icon, color, category, description, scheduledTime,
      estimatedDuration, repeatSchedule, xpReward, priority, reminder,
      order: count + 1,
    });

    return sendSuccess(res, { activity }, 'Activity created', 201);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/activities/:id
const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, user: req.user._id });
    if (!activity) return sendError(res, 'Activity not found.', 404);

    const allowedFields = [
      'name', 'icon', 'color', 'category', 'description', 'scheduledTime',
      'estimatedDuration', 'repeatSchedule', 'xpReward', 'priority', 'reminder',
      'isEnabled', 'order',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        activity[field] = req.body[field];
      }
    });

    await activity.save();
    return sendSuccess(res, { activity }, 'Activity updated');
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/activities/:id
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, user: req.user._id });
    if (!activity) return sendError(res, 'Activity not found.', 404);
    if (activity.isDefault) return sendError(res, 'Cannot delete default activities. Disable instead.', 400);

    await Activity.deleteOne({ _id: activity._id });
    await ActivityLog.deleteMany({ activity: activity._id });

    return sendSuccess(res, {}, 'Activity deleted');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/activities/:id/duplicate
const duplicateActivity = async (req, res, next) => {
  try {
    const original = await Activity.findOne({ _id: req.params.id, user: req.user._id });
    if (!original) return sendError(res, 'Activity not found.', 404);

    const duplicate = await Activity.create({
      user: req.user._id,
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

    return sendSuccess(res, { activity: duplicate }, 'Activity duplicated', 201);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/activities/logs?date=YYYY-MM-DD
const getDayLogs = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const logs = await ActivityLog.find({
      user: req.user._id,
      date,
    }).populate('activity');

    return sendSuccess(res, { logs, date });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/activities/logs/:id/complete
const completeActivity = async (req, res, next) => {
  try {
    const { notes, mood, rating, actualDuration } = req.body;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const activity = await Activity.findOne({ _id: req.params.id, user: req.user._id });
    if (!activity) return sendError(res, 'Activity not found.', 404);

    let log = await ActivityLog.findOne({ user: req.user._id, activity: req.params.id, date });

    const user = await User.findById(req.user._id);
    const levelBefore = user.level;
    const xpBefore = user.xp;

    if (log) {
      if (log.status === 'completed') {
        return sendError(res, 'Activity already completed for today.', 400);
      }
      log.status = 'completed';
      log.completedAt = new Date();
      log.xpEarned = activity.xpReward;
      log.notes = notes;
      log.mood = mood;
      log.rating = rating;
      log.actualDuration = actualDuration || activity.estimatedDuration;
      await log.save();
    } else {
      log = await ActivityLog.create({
        user: req.user._id,
        activity: req.params.id,
        date,
        status: 'completed',
        completedAt: new Date(),
        xpEarned: activity.xpReward,
        notes,
        mood,
        rating,
        actualDuration: actualDuration || activity.estimatedDuration,
        scheduledTime: activity.scheduledTime,
      });
    }

    // Award XP
    const newXP = user.xp + activity.xpReward;
    const levelInfo = calculateLevel(newXP);

    await User.findByIdAndUpdate(req.user._id, {
      xp: newXP,
      level: levelInfo.level,
      totalXPEarned: user.totalXPEarned + activity.xpReward,
      lastActiveDate: new Date(),
    });

    await XPLog.create({
      user: req.user._id,
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

    return sendSuccess(res, {
      log,
      xpEarned: activity.xpReward,
      totalXP: newXP,
      levelInfo,
      leveledUp: levelInfo.level > levelBefore,
    }, 'Activity completed');
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/activities/logs/:logId/status
const updateLogStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const log = await ActivityLog.findOne({ _id: req.params.logId, user: req.user._id });
    if (!log) return sendError(res, 'Log not found.', 404);

    log.status = status;
    if (notes) log.notes = notes;
    await log.save();

    return sendSuccess(res, { log }, 'Status updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities, createActivity, updateActivity, deleteActivity,
  duplicateActivity, getDayLogs, completeActivity, updateLogStatus,
};
