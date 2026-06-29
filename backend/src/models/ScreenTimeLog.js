const mongoose = require('mongoose');

const appUsageSchema = new mongoose.Schema({
  appName: { type: String, required: true },
  packageName: { type: String },
  duration: { type: Number, required: true }, // minutes
  category: { type: String },
  icon: { type: String },
});

const screenTimeLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    totalScreenTime: { type: Number, default: 0 }, // minutes
    unlockCount: { type: Number, default: 0 },
    goal: { type: Number, default: 120 }, // minutes
    goalAchieved: { type: Boolean, default: false },
    appUsage: [appUsageSchema],
    mostUsedApp: { type: String },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

screenTimeLogSchema.index({ user: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('ScreenTimeLog', screenTimeLogSchema);
