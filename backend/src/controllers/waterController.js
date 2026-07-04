const WaterLog = require('../models/WaterLog');
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const DailyScore = require('../models/DailyScore');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');
const WaterService = require('../services/WaterService');
const logger = require('../utils/logger');

// @route   POST /api/water/add
// ✅ FIXED: Prevents double XP award on water goal
const addWater = async (req, res, next) => {
  try {
    const { amount, source = 'water' } = req.body;
    const date = new Date().toISOString().split('T')[0];

    const result = await WaterService.addWaterEntry(req.user._id, amount, source, date);

    if (!result.success) {
      return sendError(res, result.error, result.statusCode);
    }

    return sendSuccess(res, result.data, 'Water logged');
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/water/entry/:entryId
// ✅ FIXED: Properly handles XP reversal when removing entries
const removeWaterEntry = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];

    const result = await WaterService.removeWaterEntry(req.user._id, req.params.entryId, date);

    if (!result.success) {
      return sendError(res, result.error, result.statusCode);
    }

    return sendSuccess(res, result.data, 'Entry removed');
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/water/today
const getTodayWater = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];

    const result = await WaterService.getTodayWaterLog(req.user._id, date);

    if (!result.success) {
      return sendError(res, result.error, result.statusCode);
    }

    return sendSuccess(res, result.data);
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
