const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 }, // grams
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
});

const mealLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'],
      required: true,
    },
    items: [mealItemSchema],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    loggedAt: { type: Date, default: Date.now },
    photo: { type: String }, // cloudinary URL
    notes: { type: String, maxlength: 500 },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

mealLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('MealLog', mealLogSchema);
