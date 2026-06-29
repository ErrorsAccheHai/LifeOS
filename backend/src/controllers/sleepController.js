const SleepLog = require('../models/SleepLog');
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const DailyScore = require('../models/DailyScore');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');

const calculateSleepScore = (log, goalMinutes = 480) => {
  if (!log.wakeTime || !log.duration) return 0;

  let score = 0;
  const duration = log.duration;

  // Duration score (max 60 points)
  if (duration >= goalMinutes) score += 60;
  else if (duration >= goalMinutes * 0.8) score += 40;
  else if (duration >= goalMinutes * 0.6) score += 20;

  // Timing score (max 20 points)
  if (!log.isLateNight) score += 10;
  if (!log.isLateWakeup) score += 10;

  // Quality score (max 20 points)
  if (log.quality) score += (log.quality / 5) * 20;

  return Math.min(Math.round(score), 100);
};

// @route   POST /api/sleep/start
const startSleep = async (req, res, next) => {
  try {
    const { bedTime } = req.body;
    const date = new Date().toISOString().split('T')[0];

    const user = await User.findById(req.user._id);
    const targetSleepTime = user.schedule.sleepTime || '22:00';
    const [targetH, targetM] = targetSleepTime.split(':').map(Number);

    const bedTimeDate = bedTime ? new Date(bedTime) : new Date();
    const isLate = bedTimeDate.getHours() > targetH ||
      (bedTimeDate.getHours() === targetH && bedTimeDate.getMinutes() > targetM);

    const log = await SleepLog.findOneAndUpdate(
      { user: req.user._id, date },
      { bedTime: bedTimeDate, isLateNight: isLate },
      { upsert: true, new: true }
    );

    return sendSuccess(res, { log }, 'Sleep started');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/sleep/end
const endSleep = async (req, res, next) => {
  try {
    const { wakeTime, quality, notes } = req.body;
    const date = new Date().toISOString().split('T')[0];

    const wakeTimeDate = wakeTime ? new Date(wakeTime) : new Date();
    let log = await SleepLog.findOne({ user: req.user._id, date });

    if (!log) {
      return sendError(res, 'No sleep session found for today. Start sleep first.', 404);
    }

    const user = await User.findById(req.user._id);
    const targetWakeTime = user.schedule.wakeTime || '06:00';
    const [targetH, targetM] = targetWakeTime.split(':').map(Number);

    const duration = Math.round((wakeTimeDate - new Date(log.bedTime)) / (1000 * 60));
    const isLateWakeup = wakeTimeDate.getHours() > targetH ||
      (wakeTimeDate.getHours() === targetH && wakeTimeDate.getMinutes() > targetM);

    log.wakeTime = wakeTimeDate;
    log.duration = Math.max(duration, 0);
    log.quality = quality;
    log.notes = notes;
    log.isLateWakeup = isLateWakeup;

    const sleepScore = calculateSleepScore(log, user.goals.sleepGoal || 480);
    log.score = sleepScore;

    // XP for good sleep
    let xpEarned = 0;
    if (!log.isLateNight && !log.isLateWakeup && duration >= 420) {
      xpEarned = 20;
      log.xpEarned = xpEarned;

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
        sourceName: 'Good Sleep',
        xpBefore: user.xp,
        xpAfter: newXP,
      });
    }

    await log.save();

    await DailyScore.findOneAndUpdate(
      { user: req.user._id, date },
      { sleepScore },
      { upsert: true }
    );

    return sendSuccess(res, { log, xpEarned, sleepScore }, 'Sleep ended');
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/sleep/history
const getSleepHistory = async (req, res, next) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      SleepLog.find({ user: req.user._id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SleepLog.countDocuments({ user: req.user._id }),
    ]);

    const avgDuration = logs.reduce((sum, l) => sum + (l.duration || 0), 0) / (logs.length || 1);
    const avgQuality = logs.reduce((sum, l) => sum + (l.quality || 0), 0) / (logs.filter((l) => l.quality).length || 1);

    return sendSuccess(res, {
      logs,
      stats: {
        avgDuration: Math.round(avgDuration),
        avgQuality: Math.round(avgQuality * 10) / 10,
        totalNights: total,
      },
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/sleep/today
const getTodaySleep = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const log = await SleepLog.findOne({ user: req.user._id, date });
    return sendSuccess(res, { log });
  } catch (error) {
    next(error);
  }
};

module.exports = { startSleep, endSleep, getSleepHistory, getTodaySleep };
