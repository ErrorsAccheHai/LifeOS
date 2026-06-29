const express = require('express');
const router = express.Router();
const { getDashboard, getStreak, logMood } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getDashboard);
router.get('/streak', getStreak);
router.post('/mood', logMood);

module.exports = router;
