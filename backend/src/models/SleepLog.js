const mongoose = require('mongoose');

const sleepLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (the night of)
    bedTime: { type: Date, required: true },
    wakeTime: { type: Date },
    duration: { type: Number }, // minutes, calculated
    quality: { type: Number, min: 1, max: 5 }, // 1=poor, 5=excellent
    notes: { type: String, maxlength: 500 },
    isLateNight: { type: Boolean, default: false }, // slept after target time
    isLateWakeup: { type: Boolean, default: false }, // woke after target time
    deepSleepMinutes: { type: Number },
    remSleepMinutes: { type: Number },
    xpEarned: { type: Number, default: 0 },
    score: { type: Number, min: 0, max: 100 }, // calculated sleep score
  },
  { timestamps: true }
);

sleepLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('SleepLog', sleepLogSchema);
