const express = require('express');
const router = express.Router();
const { getReport, generateReport, getSuggestions } = require('../controllers/aiCoachController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/report', getReport);
router.post('/generate', generateReport);
router.get('/suggestions', getSuggestions);

module.exports = router;
