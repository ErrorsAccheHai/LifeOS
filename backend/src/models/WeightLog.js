const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    weight: { type: Number, required: true }, // kg
    bmi: { type: Number },
    bodyFat: { type: Number }, // percentage
    muscleMass: { type: Number }, // kg
    waist: { type: Number }, // cm
    chest: { type: Number }, // cm
    hips: { type: Number }, // cm
    arms: { type: Number }, // cm
    thighs: { type: Number }, // cm
    notes: { type: String, maxlength: 500 },
    photo: { type: String },
  },
  { timestamps: true }
);

weightLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WeightLog', weightLogSchema);
