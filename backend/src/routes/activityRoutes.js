const express = require('express');
const router = express.Router();
const {
  getActivities, createActivity, updateActivity, deleteActivity,
  duplicateActivity, getDayLogs, completeActivity, updateLogStatus,
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

// ── Specific routes FIRST (before /:id) ──────────────────────────────────
router.get('/logs', getDayLogs);
router.post('/logs/:id/complete', completeActivity);
router.put('/logs/:logId/status', updateLogStatus);

// ── Collection routes ──────────────────────────────────────────────────────
router.get('/', getActivities);
router.post('/', createActivity);

// ── Dynamic param routes LAST ──────────────────────────────────────────────
router.post('/:id/duplicate', duplicateActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;
