const express = require('express');
const router = express.Router();
const { logMeal, getTodayMeals, getMealHistory, deleteMeal } = require('../controllers/mealController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/today', getTodayMeals);
router.get('/history', getMealHistory);
router.post('/', logMeal);
router.delete('/:id', deleteMeal);

module.exports = router;
