const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    icon: { type: String, default: '⚡' },
    color: { type: String, default: '#6366F1' },
    category: {
      type: String,
      enum: ['health', 'fitness', 'study', 'work', 'personal', 'religion', 'finance', 'entertainment', 'custom'],
      default: 'personal',
    },
    description: { type: String, maxlength: 500 },

    // Scheduling
    scheduledTime: { type: String }, // HH:MM format
    estimatedDuration: { type: Number, default: 30 }, // minutes
    repeatSchedule: {
      type: { type: String, enum: ['daily', 'weekly', 'monthly', 'custom', 'none'], default: 'daily' },
      days: [{ type: Number, min: 0, max: 6 }], // 0=Sun, 6=Sat
    },

    // XP & Priority
    xpReward: { type: Number, default: 10, min: 0, max: 500 },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },

    // Reminder
    reminder: {
      enabled: { type: Boolean, default: true },
      minutesBefore: { type: Number, default: 10 },
    },

    // State
    isEnabled: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false }, // System-generated defaults
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

activitySchema.index({ user: 1, isEnabled: 1 });
activitySchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Activity', activitySchema);
