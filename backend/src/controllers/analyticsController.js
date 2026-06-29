const DailyScore = require('../models/DailyScore');
const SleepLog = require('../models/SleepLog');
const WaterLog = require('../models/WaterLog');
const WorkoutLog = require('../models/WorkoutLog');
const StudyLog = require('../models/StudyLog');
const WeightLog = require('../models/WeightLog');
const MealLog = require('../models/MealLog');
const XPLog = require('../models/XPLog');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess } = require('../utils/apiResponse');

const getDateRange = (period, date) => {
  const d = date ? new Date(date) : new Date();
  let start, end;

  if (period === 'week') {
    const day = d.getDay();
    start = new Date(d);
    start.setDate(d.getDate() - day);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else if (period === 'month') {
    start = new Date(d.getFullYear(), d.getMonth(), 1);
    end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  } else if (period === 'year') {
    start = new Date(d.getFullYear(), 0, 1);
    end = new Date(d.getFullYear(), 11, 31);
  } else {
    // day
    start = new Date(d);
    start.setHours(0, 0, 0, 0);
    end = new Date(d);
    end.setHours(23, 59, 59, 999);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

// @route   GET /api/analytics/overview?period=week|month|year
const getOverview = async (req, res, next) => {
  try {
    const { period = 'week', date } = req.query;
    const { start, end } = getDateRange(period, date);
    const userId = req.user._id;

    const [scores, sleepLogs, waterLogs, workoutLogs, studyLogs, weightLogs, xpLogs] = await Promise.all([
      DailyScore.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
      SleepLog.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
      WaterLog.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
      WorkoutLog.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
      StudyLog.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
      WeightLog.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
      XPLog.find({ user: userId, date: { $gte: start, $lte: end } }),
    ]);

    // Life score chart data
    const lifeScoreChart = scores.map((s) => ({
      date: s.date,
      score: s.totalScore,
      grade: s.grade,
    }));

    // Sleep chart
    const sleepChart = sleepLogs.map((s) => ({
      date: s.date,
      duration: Math.round((s.duration || 0) / 60 * 10) / 10, // hours
      quality: s.quality || 0,
      score: s.score || 0,
    }));

    // Water chart
    const waterChart = waterLogs.map((w) => ({
      date: w.date,
      amount: w.totalAmount,
      goal: w.goal,
      percentage: Math.round((w.totalAmount / w.goal) * 100),
    }));

    // Workout chart
    const workoutChart = workoutLogs.map((w) => ({
      date: w.date,
      duration: w.duration,
      calories: w.caloriesBurned || 0,
      type: w.workoutType,
    }));

    // Study chart
    const studyChart = studyLogs.map((s) => ({
      date: s.date,
      minutes: s.totalDuration,
      hours: Math.round(s.totalDuration / 60 * 10) / 10,
    }));

    // Weight chart
    const weightChart = weightLogs.map((w) => ({
      date: w.date,
      weight: w.weight,
      bmi: w.bmi,
    }));

    // XP chart
    const xpByDate = {};
    xpLogs.forEach((x) => {
      xpByDate[x.date] = (xpByDate[x.date] || 0) + x.amount;
    });
    const xpChart = Object.entries(xpByDate)
      .map(([date, xp]) => ({ date, xp }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Summary stats
    const avgLifeScore = scores.length
      ? Math.round(scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length)
      : 0;
    const totalXP = xpLogs.reduce((sum, x) => sum + x.amount, 0);
    const totalWorkouts = workoutLogs.length;
    const totalStudyHours = Math.round(studyLogs.reduce((sum, s) => sum + s.totalDuration, 0) / 60);
    const avgSleepHours = sleepLogs.length
      ? Math.round(sleepLogs.reduce((sum, s) => sum + (s.duration || 0), 0) / sleepLogs.length / 60 * 10) / 10
      : 0;
    const avgWaterMl = waterLogs.length
      ? Math.round(waterLogs.reduce((sum, w) => sum + w.totalAmount, 0) / waterLogs.length)
      : 0;
    const waterGoalDays = waterLogs.filter((w) => w.goalAchieved).length;

    return sendSuccess(res, {
      period,
      dateRange: { start, end },
      charts: {
        lifeScore: lifeScoreChart,
        sleep: sleepChart,
        water: waterChart,
        workout: workoutChart,
        study: studyChart,
        weight: weightChart,
        xp: xpChart,
      },
      summary: {
        avgLifeScore,
        totalXP,
        totalWorkouts,
        totalStudyHours,
        avgSleepHours,
        avgWaterMl,
        waterGoalDays,
        activeDays: scores.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/analytics/streaks
const getStreakData = async (req, res, next) => {
  try {
    const { days = 90 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const scores = await DailyScore.find({
      user: req.user._id,
      date: { $gte: startDate.toISOString().split('T')[0] },
    }).sort({ date: 1 });

    const activityMap = {};
    scores.forEach((s) => {
      activityMap[s.date] = s.activitiesCompleted > 0;
    });

    return sendSuccess(res, {
      activityMap,
      scores: scores.map((s) => ({
        date: s.date,
        score: s.totalScore,
        completed: s.activitiesCompleted,
        total: s.activitiesTotal,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview, getStreakData };
