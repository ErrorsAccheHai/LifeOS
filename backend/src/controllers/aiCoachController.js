const OpenAI = require('openai');
const Report = require('../models/Report');
const DailyScore = require('../models/DailyScore');
const SleepLog = require('../models/SleepLog');
const WaterLog = require('../models/WaterLog');
const WorkoutLog = require('../models/WorkoutLog');
const StudyLog = require('../models/StudyLog');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const generateAISummary = async (userData, reportData, period) => {
  if (!openai) {
    return generateFallbackSummary(userData, reportData, period);
  }

  const prompt = `You are a personal life coach AI for the LifeOS app. Generate an encouraging, actionable ${period} summary for ${userData.name}.

Data Summary:
- Life Score: ${reportData.lifeScore}/100 (${reportData.lifeScore > (reportData.lifeScorePrevious || 70) ? 'up' : 'down'} from previous)
- Activities Completed: ${reportData.summary.activitiesCompleted}/${reportData.summary.activitiesTotal}
- Completion Rate: ${Math.round(reportData.summary.completionRate)}%
- Sleep: ${Math.round(reportData.summary.totalSleepHours)}h total, avg quality ${reportData.summary.avgSleepQuality?.toFixed(1) || 'N/A'}/5
- Workouts: ${reportData.summary.totalWorkoutMinutes} minutes total
- Study: ${Math.round(reportData.summary.totalStudyMinutes / 60)} hours total
- Water: ${Math.round(reportData.summary.totalWaterMl / 1000)}L consumed
- XP Earned: ${reportData.summary.xpEarned}
- Streak: ${reportData.summary.streakDays} days

Provide:
1. A warm, personal 3-4 sentence summary of their ${period}
2. 3 specific achievements to celebrate
3. 3 actionable improvement suggestions
4. One motivational insight

Keep the tone encouraging and conversational. Be specific with numbers.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    logger.error(`OpenAI API error: ${error.message}`);
    return generateFallbackSummary(userData, reportData, period);
  }
};

const generateFallbackSummary = (userData, reportData, period) => {
  const score = reportData.lifeScore;
  const completion = Math.round(reportData.summary.completionRate);

  let summary = `Great work this ${period}, ${userData.name}! `;

  if (score >= 80) {
    summary += `You achieved an outstanding Life Score of ${score}/100. `;
  } else if (score >= 60) {
    summary += `You had a solid ${period} with a Life Score of ${score}/100. `;
  } else {
    summary += `Your Life Score was ${score}/100 — there's exciting room for growth. `;
  }

  summary += `You completed ${completion}% of your scheduled activities`;
  if (reportData.summary.streakDays > 0) {
    summary += ` and maintained a ${reportData.summary.streakDays}-day streak`;
  }
  summary += '.';

  return summary;
};

// @route   GET /api/ai-coach/report?type=daily|weekly|monthly
const getReport = async (req, res, next) => {
  try {
    const { type = 'daily', date } = req.query;
    const queryDate = date || new Date().toISOString().split('T')[0];

    // Check for existing report
    const existingReport = await Report.findOne({
      user: req.user._id,
      type,
      date: queryDate,
    });

    if (existingReport) {
      return sendSuccess(res, { report: existingReport });
    }

    return sendError(res, 'Report not generated yet. Check back after midnight.', 404);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/ai-coach/generate
const generateReport = async (req, res, next) => {
  try {
    const { type = 'daily' } = req.body;
    const userId = req.user._id;
    const date = new Date().toISOString().split('T')[0];

    const user = await User.findById(userId);

    // Gather data for the period
    let startDate = date;
    if (type === 'weekly') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().split('T')[0];
    } else if (type === 'monthly') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      startDate = d.toISOString().split('T')[0];
    }

    const [scores, sleepLogs, waterLogs, workoutLogs, studyLogs, activityLogs] = await Promise.all([
      DailyScore.find({ user: userId, date: { $gte: startDate, $lte: date } }),
      SleepLog.find({ user: userId, date: { $gte: startDate, $lte: date } }),
      WaterLog.find({ user: userId, date: { $gte: startDate, $lte: date } }),
      WorkoutLog.find({ user: userId, date: { $gte: startDate, $lte: date } }),
      StudyLog.find({ user: userId, date: { $gte: startDate, $lte: date } }),
      ActivityLog.find({ user: userId, date: { $gte: startDate, $lte: date } }),
    ]);

    const lifeScore = scores.length
      ? Math.round(scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length)
      : 0;

    const activitiesCompleted = activityLogs.filter((l) => l.status === 'completed').length;
    const activitiesTotal = activityLogs.length;
    const xpEarned = scores.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
    const totalSleepHours = sleepLogs.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    const avgSleepQuality = sleepLogs.length
      ? sleepLogs.reduce((sum, s) => sum + (s.quality || 0), 0) / sleepLogs.filter((s) => s.quality).length
      : null;
    const totalWorkoutMinutes = workoutLogs.reduce((sum, w) => sum + w.duration, 0);
    const totalStudyMinutes = studyLogs.reduce((sum, s) => sum + s.totalDuration, 0);
    const totalWaterMl = waterLogs.reduce((sum, w) => sum + w.totalAmount, 0);

    const reportData = {
      lifeScore,
      lifeScorePrevious: 0,
      summary: {
        activitiesCompleted,
        activitiesTotal,
        completionRate: activitiesTotal > 0 ? (activitiesCompleted / activitiesTotal) * 100 : 0,
        xpEarned,
        streakDays: user.currentStreak,
        totalSleepHours: Math.round(totalSleepHours * 10) / 10,
        avgSleepQuality,
        totalWorkoutMinutes,
        totalStudyMinutes,
        totalWaterMl,
      },
    };

    const aiSummary = await generateAISummary(user, reportData, type);

    const report = await Report.findOneAndUpdate(
      { user: userId, type, date },
      {
        ...reportData,
        period: { start: startDate, end: date },
        aiSummary,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return sendSuccess(res, { report }, 'Report generated');
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/ai-coach/suggestions
const getSuggestions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const [yesterdayScore, user] = await Promise.all([
      DailyScore.findOne({ user: userId, date: yesterdayStr }),
      User.findById(userId),
    ]);

    const suggestions = [];
    const now = new Date();
    const hour = now.getHours();

    // Time-based suggestions
    if (hour >= 6 && hour <= 9) {
      suggestions.push({ type: 'morning', message: 'Good morning! Start your day with a glass of water 💧', priority: 'high' });
    }
    if (hour >= 12 && hour <= 13) {
      suggestions.push({ type: 'meal', message: "It's lunchtime! Don't forget to log your meal 🍱", priority: 'medium' });
    }
    if (hour >= 21) {
      suggestions.push({ type: 'sleep', message: 'Wind down your screen time for better sleep quality 📱', priority: 'high' });
    }

    // Score-based suggestions
    if (yesterdayScore) {
      if (yesterdayScore.sleepScore < 60) {
        suggestions.push({ type: 'sleep', message: 'Your sleep score was low yesterday. Aim for 7-8 hours tonight 😴', priority: 'high' });
      }
      if (yesterdayScore.exerciseScore < 50) {
        suggestions.push({ type: 'fitness', message: "You missed your workout yesterday. Even a 20-minute walk counts 🚶", priority: 'medium' });
      }
      if (yesterdayScore.waterScore < 70) {
        suggestions.push({ type: 'hydration', message: "You were under-hydrated yesterday. Keep your water bottle handy 💧", priority: 'medium' });
      }
    }

    // Streak suggestions
    if (user.currentStreak >= 7) {
      suggestions.push({ type: 'streak', message: `🔥 Amazing! You're on a ${user.currentStreak}-day streak! Keep it going!`, priority: 'high' });
    }

    return sendSuccess(res, {
      suggestions: suggestions.slice(0, 5),
      streak: user.currentStreak,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReport, generateReport, getSuggestions };
