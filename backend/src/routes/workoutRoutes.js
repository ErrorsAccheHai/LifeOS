const express = require('express');
const router = express.Router();
const { logWorkout, getWorkoutHistory, getTodayWorkout, updateWorkout, deleteWorkout } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/today', getTodayWorkout);
router.get('/history', getWorkoutHistory);
router.post('/', logWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;
