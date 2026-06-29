const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (start of period)
    period: {
      start: { type: String },
      end: { type: String },
    },

    // Life score
    lifeScore: { type: Number },
    lifeScorePrevious: { type: Number },
    lifeScoreChange: { type: Number },

    // Summary data
    summary: {
      activitiesCompleted: { type: Number, default: 0 },
      activitiesTotal: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      xpEarned: { type: Number, default: 0 },
      streakDays: { type: Number, default: 0 },
      totalSleepHours: { type: Number, default: 0 },
      avgSleepQuality: { type: Number },
      totalWorkoutMinutes: { type: Number, default: 0 },
      totalStudyMinutes: { type: Number, default: 0 },
      totalWaterMl: { type: Number, default: 0 },
      avgCalories: { type: Number },
      avgScreenTime: { type: Number },
    },

    // AI Generated content
    aiSummary: { type: String },
    aiSuggestions: [{ type: String }],
    highlights: [{ type: String }],
    improvements: [{ type: String }],

    generatedAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reportSchema.index({ user: 1, type: 1, date: -1 });

module.exports = mongoose.model('Report', reportSchema);
