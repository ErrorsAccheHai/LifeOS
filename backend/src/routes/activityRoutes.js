const express = require('express');
const router = express.Router();
const {
  getActivities, createActivity, updateActivity, deleteActivity,
  duplicateActivity, getDayLogs, completeActivity, updateLogStatus,
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getActivities);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);
router.post('/:id/duplicate', duplicateActivity);

router.get('/logs', getDayLogs);
router.post('/logs/:id/complete', completeActivity);
router.put('/logs/:logId/status', updateLogStatus);

module.exports = router;
