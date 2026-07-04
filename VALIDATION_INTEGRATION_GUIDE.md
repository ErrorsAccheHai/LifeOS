// Integration Guide: Adding Validation Middleware to Routes

// =========================================
// ACTIVITY ROUTES - /backend/src/routes/activityRoutes.js
// =========================================

// Add at top:
// const { validate } = require('../middleware/validate');
// const schemas = require('../validators/schemas');

// Before: router.post('/activities', createActivity);
// After:  router.post('/activities', validate(schemas.createActivity), createActivity);

// Before: router.put('/activities/:id', updateActivity);
// After:  router.put('/activities/:id', validate(schemas.updateActivity), updateActivity);

// Before: router.post('/activities/logs/:id/complete', completeActivity);
// After:  router.post('/activities/logs/:id/complete', validate(schemas.completeActivity), completeActivity);

// Before: router.get('/activities/logs', getDayLogs);
// After:  router.get('/activities/logs', validate(schemas.dateQuery), getDayLogs);

// =========================================
// WATER ROUTES - /backend/src/routes/waterRoutes.js
// =========================================

// Add at top:
// const { validate } = require('../middleware/validate');
// const schemas = require('../validators/schemas');

// Before: router.post('/add', addWater);
// After:  router.post('/add', validate(schemas.addWater), addWater);

// Before: router.get('/history', getWaterHistory);
// After:  router.get('/history', validate(schemas.periodQuery), getWaterHistory);

// =========================================
// SLEEP ROUTES - /backend/src/routes/sleepRoutes.js
// =========================================

// Before: router.post('/log', logSleep);
// After:  router.post('/log', validate(schemas.logSleep), logSleep);

// =========================================
// WORKOUT ROUTES - /backend/src/routes/workoutRoutes.js
// =========================================

// Before: router.post('/log', logWorkout);
// After:  router.post('/log', validate(schemas.logWorkout), logWorkout);

// =========================================
// STUDY ROUTES - /backend/src/routes/studyRoutes.js
// =========================================

// Before: router.post('/log', logStudy);
// After:  router.post('/log', validate(schemas.logStudy), logStudy);

// =========================================
// WEIGHT ROUTES - /backend/src/routes/weightRoutes.js
// =========================================

// Before: router.post('/log', logWeight);
// After:  router.post('/log', validate(schemas.logWeight), logWeight);

// =========================================
// MEAL ROUTES - /backend/src/routes/mealRoutes.js
// =========================================

// Before: router.post('/log', logMeal);
// After:  router.post('/log', validate(schemas.logMeal), logMeal);

// =========================================
// VALIDATE MIDDLEWARE - /backend/src/middleware/validate.js
// =========================================

// This middleware is likely already in place. It should work like:
// exports.validate = (schema) => {
//   return async (req, res, next) => {
//     try {
//       await schema.run(req);
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return sendError(res, 'Validation failed', 400, errors.array());
//       }
//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };
