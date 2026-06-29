const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    icon: { type: String, default: '✅' },
    color: { type: String, default: '#6366F1' },
    category: {
      type: String,
      enum: ['health', 'fitness', 'study', 'work', 'personal', 'religion', 'finance', 'entertainment', 'custom'],
      default: 'personal',
    },
    frequency: {
      type: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
      days: [{ type: Number, min: 0, max: 6 }], // for weekly
      timesPerPeriod: { type: Number, default: 1 },
    },
    targetCount: { type: Number, default: 1 }, // e.g., drink 8 glasses
    unit: { type: String, default: 'times' },
    reminderTime: { type: String }, // HH:MM
    xpReward: { type: Number, default: 5 },

    // Stats
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }, // percentage

    isActive: { type: Boolean, default: true },
    startDate: { type: String }, // YYYY-MM-DD
    endDate: { type: String },
    lastCompletedDate: { type: String },
  },
  { timestamps: true }
);

habitSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Habit', habitSchema);
