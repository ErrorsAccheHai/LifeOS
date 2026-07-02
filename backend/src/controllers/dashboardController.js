const Activity = require('../models/Activity');
const ActivityLog = require('../models/ActivityLog');
const DailyScore = require('../models/DailyScore');
const WaterLog = require('../models/WaterLog');
const SleepLog = require('../models/SleepLog');
const WorkoutLog = require('../models/WorkoutLog');
const StudyLog = require('../models/StudyLog');
const WeightLog = require('../models/WeightLog');
const { UserBadge } = require('../models/Badge');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');
const { calculateLifeScore, getScoreGrade } = require('../utils/lifeScore');

// @route   GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    // Run all queries in parallel
    const [
      user,
      activities,
      todayLogs,
      dailyScore,
      waterLog,
      sleepLog,
      workoutLogs,
      studyLog,
      weightLog,
      recentBadges,
    ] = await Promise.all([
      User.findById(userId),
      Activity.find({ user: userId, isEnabled: true }).sort({ order: 1 }),
      ActivityLog.find({ user: userId, date: today }).populate('activity'),
      DailyScore.findOne({ user: userId, date: today }),
      WaterLog.findOne({ user: userId, date: today }),
      SleepLog.findOne({ user: userId, date: today }),
      WorkoutLog.find({ user: userId, date: today }),
      StudyLog.findOne({ user: userId, date: today }),
      WeightLog.findOne({ user: userId }).sort({ date: -1 }),
      UserBadge.find({ user: userId }).sort({ earnedAt: -1 }).limit(5),
    ]);

    const levelInfo = calculateLevel(user.xp);

    // Build timeline from activities
    const logsMap = {};
    todayLogs.forEach((log) => {
      logsMap[log.activity?._id?.toString()] = log;
    });

    const timeline = activities.map((activity) => {
      const log = logsMap[activity._id.toString()];
      return {
        activity,
        log: log || null,
        status: log?.status || 'pending',
      };
    });

    // Upcoming activities (pending, sorted by time)
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const upcoming = timeline
      .filter((t) => t.status === 'pending' && t.activity.scheduledTime >= currentTimeStr)
      .slice(0, 3);

    // Compute life score components
    const completedCount = todayLogs.filter((l) => l.status === 'completed').length;
    const totalCount = activities.length;
    const routineCompletion = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const waterGoal = waterLog?.goal || user.goals?.waterGoal || 2500;
    const waterScore = waterLog
      ? Math.min((waterLog.totalAmount / waterGoal) * 100, 100)
      : 0;

    // Derive exercise score live if not stored
    const exerciseScore = (dailyScore?.exerciseScore != null)
      ? dailyScore.exerciseScore
      : (workoutLogs.length > 0 ? Math.min(Math.round((workoutLogs[0].duration / 45) * 100), 100) : 0);

    // Derive study score live if not stored
    const studyGoalMin = studyLog?.goal || user.goals?.studyGoal || 120;
    const studyScore = (dailyScore?.studyScore != null)
      ? dailyScore.studyScore
      : (studyLog ? Math.min(Math.round((studyLog.totalDuration / studyGoalMin) * 100), 100) : 0);

    const lifeScoreData = calculateLifeScore({
      sleepScore: dailyScore?.sleepScore || 0,
      exerciseScore,
      mealsScore: dailyScore?.mealsScore || 0,
      waterScore: Math.round(waterScore),
      studyScore,
      screenTimeScore: dailyScore?.screenTimeScore || 50,
      moodScore: dailyScore?.moodScore || 50,
    });

    const grade = getScoreGrade(lifeScoreData);

    return sendSuccess(res, {
      user: {
        name: user.name,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        levelInfo,
      },
      today: {
        date: today,
        lifeScore: lifeScoreData,
        grade,
        activitiesCompleted: completedCount,
        activitiesTotal: totalCount,
        routineCompletion: Math.round(routineCompletion),
        xpEarned: dailyScore?.xpEarned || 0,
        mood: dailyScore?.mood || null,
        steps: dailyScore?.steps || 0,
      },
      timeline,
      upcoming,
      cards: {
        sleep: sleepLog || null,
        water: {
          amount: waterLog?.totalAmount || 0,
          goal: waterLog?.goal || user.goals.waterGoal || 2500,
          percentage: Math.round(waterScore),
        },
        workout: workoutLogs.length > 0 ? workoutLogs[0] : null,
        study: studyLog || null,
        weight: weightLog || null,
      },
      recentBadges,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/dashboard/streak
const getStreak = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/dashboard/mood
const logMood = async (req, res, next) => {
  try {
    const { mood, note } = req.body;
    const date = new Date().toISOString().split('T')[0];

    await DailyScore.findOneAndUpdate(
      { user: req.user._id, date },
      { mood, moodNote: note, $setOnInsert: { date } },
      { upsert: true, new: true }
    );

    return sendSuccess(res, { mood }, 'Mood logged');
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getStreak, logMood };
