const Activity = require('../models/Activity');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');
const ActivityService = require('../services/ActivityService');
const logger = require('../utils/logger');

// @route   GET /api/activities?page=1&limit=50&category=health&enabled=true
const getActivities = async (req, res, next) => {
  try {
    const { category, enabled, page = 1, limit = 50 } = req.query;
    
    const result = await ActivityService.getActivitiesWithPagination(req.user._id, {
      category,
      enabled,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    if (!result.success) {
      return sendError(res, result.error, result.statusCode);
    }

    return sendSuccess(res, result.data);
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
    const result = await ActivityService.duplicateActivity(req.user._id, req.params.id);

    if (!result.success) {
      return sendError(res, result.error, result.statusCode);
    }

    return sendSuccess(res, result.data, result.message, 201);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/activities/logs?date=YYYY-MM-DD
const getDayLogs = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const result = await ActivityService.getTodayActivityLogs(req.user._id, date);

    if (!result.success) {
      return sendError(res, result.error, result.statusCode);
    }

    return sendSuccess(res, result.data);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/activities/logs/:id/complete
// ✅ FIXED: Atomic operation prevents race condition and double XP
const completeActivity = async (req, res, next) => {
  try {
    const { notes, mood, rating, actualDuration } = req.body;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const logData = { notes, mood, rating };
    if (actualDuration) logData.actualDuration = actualDuration;

    const result = await ActivityService.completeActivityAtomic(
      req.user._id,
      req.params.id,
      date,
      logData
    );

    if (!result.success) {
      return sendError(res, result.error, result.statusCode);
    }

    return sendSuccess(res, result.data, 'Activity completed');
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/activities/logs/:logId/status
const updateLogStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const result = await ActivityService.updateActivityStatus(
      req.user._id,
      req.params.logId,
      status,
      notes
    );

    if (!result.success) {
      return sendError(res, result.error, result.statusCode);
    }

    return sendSuccess(res, result.data, 'Status updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities, createActivity, updateActivity, deleteActivity,
  duplicateActivity, getDayLogs, completeActivity, updateLogStatus,
};
