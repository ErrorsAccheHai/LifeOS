const express = require('express');
const router = express.Router();
const { startSleep, endSleep, getSleepHistory, getTodaySleep } = require('../controllers/sleepController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/today', getTodaySleep);
router.get('/history', getSleepHistory);
router.post('/start', startSleep);
router.post('/end', endSleep);

module.exports = router;
