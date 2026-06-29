const WeightLog = require('../models/WeightLog');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @route   POST /api/weight
const logWeight = async (req, res, next) => {
  try {
    const { weight, bodyFat, muscleMass, waist, chest, hips, arms, thighs, notes } = req.body;
    const date = req.body.date || new Date().toISOString().split('T')[0];

    const user = await User.findById(req.user._id);
    const heightM = user.height ? user.height / 100 : null;
    const bmi = heightM ? Math.round((weight / (heightM * heightM)) * 10) / 10 : null;

    const log = await WeightLog.findOneAndUpdate(
      { user: req.user._id, date },
      { weight, bmi, bodyFat, muscleMass, waist, chest, hips, arms, thighs, notes },
      { upsert: true, new: true }
    );

    // Update user's current weight
    await User.findByIdAndUpdate(req.user._id, { currentWeight: weight });

    return sendSuccess(res, { log, bmi }, 'Weight logged');
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/weight/history
const getWeightHistory = async (req, res, next) => {
  try {
    const { days = 90 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const logs = await WeightLog.find({
      user: req.user._id,
      date: { $gte: startDate.toISOString().split('T')[0] },
    }).sort({ date: 1 });

    const user = await User.findById(req.user._id);
    const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : user.currentWeight;
    const startWeight = logs.length > 0 ? logs[0].weight : user.currentWeight;
    const goalWeight = user.goalWeight;

    const progress = goalWeight && startWeight
      ? Math.abs(startWeight - goalWeight) > 0
        ? Math.round(((startWeight - latestWeight) / (startWeight - goalWeight)) * 100)
        : 100
      : 0;

    return sendSuccess(res, {
      logs,
      stats: {
        currentWeight: latestWeight,
        startWeight,
        goalWeight,
        change: Math.round((latestWeight - startWeight) * 10) / 10,
        progress: Math.min(Math.max(progress, 0), 100),
        bmi: logs.length > 0 ? logs[logs.length - 1].bmi : user.bmi,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/weight/latest
const getLatestWeight = async (req, res, next) => {
  try {
    const log = await WeightLog.findOne({ user: req.user._id }).sort({ date: -1 });
    return sendSuccess(res, { log });
  } catch (error) {
    next(error);
  }
};

module.exports = { logWeight, getWeightHistory, getLatestWeight };
