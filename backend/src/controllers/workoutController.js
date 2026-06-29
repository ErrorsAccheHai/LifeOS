const WorkoutLog = require('../models/WorkoutLog');
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const DailyScore = require('../models/DailyScore');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');

// @route   POST /api/workout
const logWorkout = async (req, res, next) => {
  try {
    const {
      workoutType, title, exercises, duration, caloriesBurned,
      intensity, startTime, endTime, notes, rating,
    } = req.body;

    const date = new Date().toISOString().split('T')[0];
    const user = await User.findById(req.user._id);

    // Calculate XP based on duration and intensity
    const intensityMultiplier = { low: 0.8, medium: 1, high: 1.3, extreme: 1.6 };
    const xpEarned = Math.round(30 * (duration / 30) * (intensityMultiplier[intensity] || 1));

    const log = await WorkoutLog.create({
      user: req.user._id,
      date,
      workoutType,
      title,
      exercises: exercises || [],
      duration,
      caloriesBurned,
      intensity,
      startTime,
      endTime,
      notes,
      rating,
      xpEarned,
    });

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
      source: 'activity',
      sourceName: `Workout: ${title}`,
      xpBefore: user.xp,
      xpAfter: newXP,
    });

    await DailyScore.findOneAndUpdate(
      { user: req.user._id, date },
      { exerciseScore: Math.min(Math.round((duration / 45) * 100), 100) },
      { upsert: true }
    );

    return sendSuccess(res, { log, xpEarned, levelInfo }, 'Workout logged', 201);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/workout/history
const getWorkoutHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { user: req.user._id };
    if (type) filter.workoutType = type;

    const [logs, total] = await Promise.all([
      WorkoutLog.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      WorkoutLog.countDocuments(filter),
    ]);

    const totalMinutes = logs.reduce((sum, l) => sum + l.duration, 0);
    const totalCalories = logs.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);

    return sendSuccess(res, {
      logs,
      stats: {
        totalWorkouts: total,
        totalMinutes,
        totalCalories,
        avgDuration: Math.round(totalMinutes / (logs.length || 1)),
      },
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/workout/today
const getTodayWorkout = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const logs = await WorkoutLog.find({ user: req.user._id, date });
    return sendSuccess(res, { logs });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/workout/:id
const updateWorkout = async (req, res, next) => {
  try {
    const log = await WorkoutLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return sendError(res, 'Workout not found.', 404);

    const allowedFields = ['title', 'exercises', 'duration', 'caloriesBurned', 'intensity', 'notes', 'rating'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) log[field] = req.body[field];
    });

    await log.save();
    return sendSuccess(res, { log }, 'Workout updated');
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/workout/:id
const deleteWorkout = async (req, res, next) => {
  try {
    const log = await WorkoutLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) return sendError(res, 'Workout not found.', 404);
    return sendSuccess(res, {}, 'Workout deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { logWorkout, getWorkoutHistory, getTodayWorkout, updateWorkout, deleteWorkout };
