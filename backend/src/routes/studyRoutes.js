const express = require('express');
const router = express.Router();
const { startStudy, endStudy, libraryCheckIn, libraryCheckOut, getTodayStudy, getStudyHistory } = require('../controllers/studyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/today', getTodayStudy);
router.get('/history', getStudyHistory);
router.post('/start', startStudy);
router.post('/end', endStudy);
router.post('/library/checkin', libraryCheckIn);
router.post('/library/checkout', libraryCheckOut);

module.exports = router;
