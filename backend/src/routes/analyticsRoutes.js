const express = require('express');
const router = express.Router();
const { getOverview, getStreakData } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', getOverview);
router.get('/streaks', getStreakData);

module.exports = router;
