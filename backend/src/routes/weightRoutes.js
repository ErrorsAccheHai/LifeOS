const express = require('express');
const router = express.Router();
const { logWeight, getWeightHistory, getLatestWeight } = require('../controllers/weightController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/latest', getLatestWeight);
router.get('/history', getWeightHistory);
router.post('/', logWeight);

module.exports = router;
