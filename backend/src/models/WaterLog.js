const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    entries: [
      {
        amount: { type: Number, required: true }, // ml
        loggedAt: { type: Date, default: Date.now },
        source: { type: String, enum: ['water', 'juice', 'tea', 'coffee', 'other'], default: 'water' },
      },
    ],
    totalAmount: { type: Number, default: 0 }, // ml
    goal: { type: Number, default: 2500 }, // ml
    goalAchieved: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

waterLogSchema.index({ user: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('WaterLog', waterLogSchema);
