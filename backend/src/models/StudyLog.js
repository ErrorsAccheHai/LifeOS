const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  subject: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number }, // minutes
  type: { type: String, enum: ['pomodoro', 'deep_work', 'review', 'library'], default: 'deep_work' },
  notes: { type: String },
});

const studyLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    sessions: [studySessionSchema],
    totalDuration: { type: Number, default: 0 }, // minutes
    goal: { type: Number, default: 120 }, // minutes
    goalAchieved: { type: Boolean, default: false },
    location: { type: String, enum: ['home', 'library', 'cafe', 'office', 'other'], default: 'home' },
    isLibraryCheckedIn: { type: Boolean, default: false },
    libraryCheckIn: { type: Date },
    libraryCheckOut: { type: Date },
    xpEarned: { type: Number, default: 0 },
    productivity: { type: Number, min: 1, max: 5 }, // self-rated
  },
  { timestamps: true }
);

studyLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('StudyLog', studyLogSchema);
