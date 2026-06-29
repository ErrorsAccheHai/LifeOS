const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number },
  reps: { type: Number },
  weight: { type: Number }, // kg
  duration: { type: Number }, // minutes for cardio
  distance: { type: Number }, // km for cardio
  calories: { type: Number },
  notes: { type: String },
});

const workoutLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    workoutType: {
      type: String,
      enum: ['home', 'gym', 'cardio', 'yoga', 'sports', 'custom'],
      default: 'gym',
    },
    title: { type: String, required: true },
    exercises: [exerciseSchema],
    duration: { type: Number, required: true }, // minutes
    caloriesBurned: { type: Number },
    intensity: { type: String, enum: ['low', 'medium', 'high', 'extreme'], default: 'medium' },
    startTime: { type: Date },
    endTime: { type: Date },
    notes: { type: String, maxlength: 1000 },
    xpEarned: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

workoutLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
