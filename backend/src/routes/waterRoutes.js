const express = require('express');
const router = express.Router();
const { addWater, removeWaterEntry, getTodayWater, getWaterHistory } = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/today', getTodayWater);
router.get('/history', getWaterHistory);
router.post('/add', addWater);
router.delete('/entry/:entryId', removeWaterEntry);

module.exports = router;
