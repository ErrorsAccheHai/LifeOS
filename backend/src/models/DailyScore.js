const mongoose = require('mongoose');

const dailyScoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD

    // Component scores (0-100 each)
    sleepScore: { type: Number, default: 0 },
    exerciseScore: { type: Number, default: 0 },
    mealsScore: { type: Number, default: 0 },
    waterScore: { type: Number, default: 0 },
    studyScore: { type: Number, default: 0 },
    screenTimeScore: { type: Number, default: 0 },
    moodScore: { type: Number, default: 0 },

    // Overall
    totalScore: { type: Number, default: 0 },
    grade: { type: String, default: 'F' },

    // Activity tracking
    activitiesCompleted: { type: Number, default: 0 },
    activitiesTotal: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },

    // Mood
    mood: { type: Number, min: 1, max: 5 },
    moodNote: { type: String },

    // Steps
    steps: { type: Number, default: 0 },
  },
  { timestamps: true }
);

dailyScoreSchema.index({ user: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('DailyScore', dailyScoreSchema);
