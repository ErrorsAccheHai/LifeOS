const cron = require('node-cron');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Activity = require('../models/Activity');
const DailyScore = require('../models/DailyScore');
const Report = require('../models/Report');
const { calculateLifeScore, getScoreGrade } = require('../utils/lifeScore');
const logger = require('../utils/logger');

/**
 * Daily midnight job: Close out the day
 * ✅ OPTIMIZED: Uses batch MongoDB operations instead of loops
 * - Mark pending activities as missed (single updateMany)
 * - Calculate streaks using aggregation pipeline
 * - Batch update streaks (updateMany instead of findByIdAndUpdate loop)
 */
const dailyMidnightJob = cron.schedule('0 0 * * *', async () => {
  logger.info('Running daily midnight cron job (optimized)...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  try {
    // ✅ Mark all pending logs from yesterday as missed (single batch operation)
    const updateResult = await ActivityLog.updateMany(
      { date: yesterdayStr, status: { $in: ['pending', 'in_progress'] } },
      { status: 'missed' }
    );
    logger.info(`Marked ${updateResult.modifiedCount} pending activities as missed`);

    // ✅ Optimized: Use aggregation to find users with activity + calculate streaks in one pass
    const usersWithActivity = await DailyScore.aggregate([
      { $match: { date: yesterdayStr, activitiesCompleted: { $gt: 0 } } },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userData' } },
      { $unwind: '$userData' },
      { $project: { userId: '$user', userData: 1, activitiesCompleted: 1 } }
    ]);

    // ✅ Prepare batch updates for users with activity
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    const bulkOps = usersWithActivity.map(({ userId, userData }) => {
      const lastDate = userData.lastActiveDate
        ? new Date(userData.lastActiveDate).toISOString().split('T')[0]
        : null;

      let newStreak = userData.currentStreak;

      if (!lastDate || lastDate === twoDaysAgoStr) {
        newStreak = userData.currentStreak + 1;
      } else if (lastDate !== yesterdayStr) {
        newStreak = 1;
      }

      return {
        updateOne: {
          filter: { _id: userId },
          update: {
            $set: {
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, userData.longestStreak),
              lastActiveDate: new Date(yesterdayStr),
            },
          },
        },
      };
    });

    // ✅ Execute bulk update for active users
    if (bulkOps.length > 0) {
      const bulkResult = await User.bulkWrite(bulkOps);
      logger.info(`Updated streaks for ${bulkResult.modifiedCount} users`);
    }

    // ✅ Reset streak for inactive users (single batch operation)
    const resetResult = await User.updateMany(
      {
        _id: { $nin: usersWithActivity.map((u) => u.userId) },
        currentStreak: { $gt: 0 },
        isActive: true,
      },
      { $set: { currentStreak: 0 } }
    );
    logger.info(`Reset streak for ${resetResult.modifiedCount} inactive users`);

    logger.info('Daily midnight job completed (optimized)');
  } catch (error) {
    logger.error(`Daily midnight job error: ${error.message}`);
  }
}, { timezone: 'UTC' });

/**
 * Generate daily scores at 11:50 PM
 * ✅ OPTIMIZED: Uses batch operations and aggregation
 */
const dailyScoreJob = cron.schedule('50 23 * * *', async () => {
  logger.info('Generating daily scores (optimized)...');
  const today = new Date().toISOString().split('T')[0];

  try {
    // ✅ Fetch all existing scores for today in single query
    const existingScores = await DailyScore.find({ date: today }).select('_id user totalScore');
    const scoreMap = new Map(existingScores.map((s) => [s.user.toString(), s]));

    // ✅ Fetch all daily scores with needed fields
    const allScores = await DailyScore.find({ date: today });

    // ✅ Prepare bulk updates
    const bulkOps = allScores.map((score) => {
      const calculatedScore = calculateLifeScore({
        sleepScore: score.sleepScore,
        exerciseScore: score.exerciseScore,
        mealsScore: score.mealsScore,
        waterScore: score.waterScore,
        studyScore: score.studyScore,
        screenTimeScore: score.screenTimeScore,
        moodScore: score.moodScore,
      });
      const grade = getScoreGrade(calculatedScore);

      return {
        updateOne: {
          filter: { _id: score._id },
          update: {
            $set: {
              totalScore: calculatedScore,
              grade: grade.grade,
            },
          },
        },
      };
    });

    // ✅ Execute bulk update
    if (bulkOps.length > 0) {
      const bulkResult = await DailyScore.bulkWrite(bulkOps);
      logger.info(`Updated daily scores for ${bulkResult.modifiedCount} users`);
    }

    logger.info('Daily scores generated (optimized)');
  } catch (error) {
    logger.error(`Daily score job error: ${error.message}`);
  }
}, { timezone: 'UTC' });

const initCronJobs = () => {
  dailyMidnightJob.start();
  dailyScoreJob.start();
  logger.info('Cron jobs initialized');
};

module.exports = { initCronJobs };
