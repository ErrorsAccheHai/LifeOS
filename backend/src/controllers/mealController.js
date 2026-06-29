const MealLog = require('../models/MealLog');
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const DailyScore = require('../models/DailyScore');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');

// @route   POST /api/meals
const logMeal = async (req, res, next) => {
  try {
    const { mealType, items, notes } = req.body;
    const date = req.body.date || new Date().toISOString().split('T')[0];

    const totalCalories = items?.reduce((sum, i) => sum + (i.calories || 0), 0) || 0;
    const totalProtein = items?.reduce((sum, i) => sum + (i.protein || 0), 0) || 0;
    const totalCarbs = items?.reduce((sum, i) => sum + (i.carbs || 0), 0) || 0;
    const totalFat = items?.reduce((sum, i) => sum + (i.fat || 0), 0) || 0;

    const xpEarned = 15; // Base XP per meal logged

    const log = await MealLog.create({
      user: req.user._id,
      date,
      mealType,
      items: items || [],
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      notes,
      xpEarned,
      photo: req.file?.path,
    });

    const user = await User.findById(req.user._id);
    const newXP = user.xp + xpEarned;
    const levelInfo = calculateLevel(newXP);

    await User.findByIdAndUpdate(req.user._id, {
      xp: newXP,
      level: levelInfo.level,
      totalXPEarned: user.totalXPEarned + xpEarned,
    });

    await XPLog.create({
      user: req.user._id,
      date,
      amount: xpEarned,
      source: 'activity',
      sourceName: `Meal: ${mealType}`,
      xpBefore: user.xp,
      xpAfter: newXP,
    });

    // Update meals score
    const todayMeals = await MealLog.find({ user: req.user._id, date });
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const loggedTypes = todayMeals.map((m) => m.mealType);
    const completedMainMeals = mealTypes.filter((t) => loggedTypes.includes(t)).length;
    const mealsScore = Math.round((completedMainMeals / 3) * 100);

    await DailyScore.findOneAndUpdate(
      { user: req.user._id, date },
      { mealsScore },
      { upsert: true }
    );

    return sendSuccess(res, { log, xpEarned, levelInfo }, 'Meal logged', 201);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/meals/today
const getTodayMeals = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const meals = await MealLog.find({ user: req.user._id, date }).sort({ loggedAt: 1 });

    const totals = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.totalCalories,
        protein: acc.protein + m.totalProtein,
        carbs: acc.carbs + m.totalCarbs,
        fat: acc.fat + m.totalFat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const user = await User.findById(req.user._id);

    return sendSuccess(res, {
      meals,
      totals,
      calorieGoal: user.goals.calorieGoal || 2000,
      calorieProgress: Math.round((totals.calories / (user.goals.calorieGoal || 2000)) * 100),
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/meals/history
const getMealHistory = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const meals = await MealLog.find({
      user: req.user._id,
      date: { $gte: startDate.toISOString().split('T')[0] },
    }).sort({ date: -1, loggedAt: -1 });

    return sendSuccess(res, { meals });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/meals/:id
const deleteMeal = async (req, res, next) => {
  try {
    const meal = await MealLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meal) return sendError(res, 'Meal not found.', 404);
    return sendSuccess(res, {}, 'Meal deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { logMeal, getTodayMeals, getMealHistory, deleteMeal };
