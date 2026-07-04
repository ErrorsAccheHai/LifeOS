/**
 * Validation schemas for common operations
 * Used with express-validator
 */

const { body, param, query } = require('express-validator');

const validationSchemas = {
  // ━━━ Activity Validation ━━━
  createActivity: [
    body('name')
      .trim()
      .notEmpty().withMessage('Activity name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('category')
      .isIn(['health', 'fitness', 'study', 'work', 'personal', 'religion', 'finance', 'entertainment', 'custom'])
      .withMessage('Invalid category'),
    body('xpReward')
      .optional()
      .isInt({ min: 0, max: 500 }).withMessage('XP reward must be 0-500'),
    body('scheduledTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
    body('estimatedDuration')
      .optional()
      .isInt({ min: 1, max: 1440 }).withMessage('Duration must be 1-1440 minutes'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  ],

  updateActivity: [
    param('id').isMongoId().withMessage('Invalid activity ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('category')
      .optional()
      .isIn(['health', 'fitness', 'study', 'work', 'personal', 'religion', 'finance', 'entertainment', 'custom']),
    body('xpReward')
      .optional()
      .isInt({ min: 0, max: 500 }).withMessage('XP reward must be 0-500'),
  ],

  // ━━━ Water Logging ━━━
  addWater: [
    body('amount')
      .isFloat({ min: 0.1, max: 10000 }).withMessage('Amount must be 0.1-10000 ml'),
    body('source')
      .optional()
      .isIn(['water', 'juice', 'tea', 'coffee', 'other']).withMessage('Invalid source'),
  ],

  // ━━━ Activity Log Completion ━━━
  completeActivity: [
    param('id').isMongoId().withMessage('Invalid activity ID'),
    body('actualDuration')
      .optional()
      .isInt({ min: 1, max: 1440 }).withMessage('Duration must be 1-1440 minutes'),
    body('mood')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('Mood must be 1-5'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  ],

  // ━━━ Sleep Logging ━━━
  logSleep: [
    body('bedTime').isISO8601().withMessage('Invalid bed time'),
    body('wakeTime').isISO8601().withMessage('Invalid wake time'),
    body('quality')
      .isInt({ min: 1, max: 5 }).withMessage('Quality must be 1-5'),
    body('deepSleepMinutes')
      .optional()
      .isInt({ min: 0 }).withMessage('Deep sleep must be positive'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  ],

  // ━━━ Workout Logging ━━━
  logWorkout: [
    body('workoutType')
      .notEmpty().withMessage('Workout type required'),
    body('duration')
      .isInt({ min: 1, max: 1440 }).withMessage('Duration must be 1-1440 minutes'),
    body('caloriesBurned')
      .optional()
      .isInt({ min: 0 }).withMessage('Calories must be non-negative'),
    body('intensity')
      .optional()
      .isIn(['light', 'moderate', 'intense']).withMessage('Invalid intensity'),
  ],

  // ━━━ Query Parameters ━━━
  dateQuery: [
    query('date')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD format'),
  ],

  periodQuery: [
    query('period')
      .optional()
      .isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period'),
  ],
};

module.exports = validationSchemas;
