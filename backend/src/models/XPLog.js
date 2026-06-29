const mongoose = require('mongoose');

const xpLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    amount: { type: Number, required: true },
    source: {
      type: String,
      enum: ['activity', 'habit', 'streak_bonus', 'badge', 'daily_goal', 'challenge', 'manual'],
      required: true,
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId }, // reference to activity/habit
    sourceName: { type: String },
    levelBefore: { type: Number },
    levelAfter: { type: Number },
    xpBefore: { type: Number },
    xpAfter: { type: Number },
  },
  { timestamps: true }
);

xpLogSchema.index({ user: 1, date: -1 });
xpLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('XPLog', xpLogSchema);
