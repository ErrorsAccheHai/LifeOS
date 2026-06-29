const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    scheduledTime: { type: String }, // HH:MM
    startTime: { type: Date },
    endTime: { type: Date },
    actualDuration: { type: Number }, // minutes
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped', 'late', 'missed'],
      default: 'pending',
    },
    completedAt: { type: Date },
    xpEarned: { type: Number, default: 0 },
    notes: { type: String, maxlength: 1000 },
    mood: { type: Number, min: 1, max: 5 }, // mood after activity
    rating: { type: Number, min: 1, max: 5 }, // personal rating
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ user: 1, date: 1 });
activityLogSchema.index({ user: 1, activity: 1, date: 1 }, { unique: true });
activityLogSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
