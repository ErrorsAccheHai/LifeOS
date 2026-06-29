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
 * - Mark pending activities as missed
 * - Calculate final life score
 * - Update streaks
 * - Generate AI daily report
 */
const dailyMidnightJob = cron.schedule('0 0 * * *', async () => {
  logger.info('Running daily midnight cron job...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  try {
    // Mark all pending logs from yesterday as missed
    await ActivityLog.updateMany(
      { date: yesterdayStr, status: { $in: ['pending', 'in_progress'] } },
      { status: 'missed' }
    );

    // Update streaks for all users
    const users = await User.find({ isActive: true });

    for (const user of users) {
      const yesterdayScore = await DailyScore.findOne({
        user: user._id,
        date: yesterdayStr,
      });

      const hadActivity = yesterdayScore?.activitiesCompleted > 0;

      if (hadActivity) {
        const lastDate = user.lastActiveDate
          ? new Date(user.lastActiveDate).toISOString().split('T')[0]
          : null;

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        let newStreak = user.currentStreak;

        if (!lastDate || lastDate === twoDaysAgoStr) {
          newStreak = user.currentStreak + 1;
        } else if (lastDate !== yesterdayStr) {
          newStreak = 1;
        }

        await User.findByIdAndUpdate(user._id, {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak),
        });
      } else if (user.currentStreak > 0) {
        await User.findByIdAndUpdate(user._id, { currentStreak: 0 });
      }
    }

    logger.info('Daily midnight job completed');
  } catch (error) {
    logger.error(`Daily midnight job error: ${error.message}`);
  }
}, { timezone: 'UTC' });

/**
 * Generate daily scores at 11:50 PM
 */
const dailyScoreJob = cron.schedule('50 23 * * *', async () => {
  logger.info('Generating daily scores...');
  const today = new Date().toISOString().split('T')[0];

  try {
    const users = await User.find({ isActive: true }).limit(1000);

    for (const user of users) {
      const existingScore = await DailyScore.findOne({ user: user._id, date: today });
      if (existingScore) {
        const score = calculateLifeScore({
          sleepScore: existingScore.sleepScore,
          exerciseScore: existingScore.exerciseScore,
          mealsScore: existingScore.mealsScore,
          waterScore: existingScore.waterScore,
          studyScore: existingScore.studyScore,
          screenTimeScore: existingScore.screenTimeScore,
          moodScore: existingScore.moodScore,
        });
        const grade = getScoreGrade(score);

        await DailyScore.findByIdAndUpdate(existingScore._id, {
          totalScore: score,
          grade: grade.grade,
        });
      }
    }

    logger.info('Daily scores generated');
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
