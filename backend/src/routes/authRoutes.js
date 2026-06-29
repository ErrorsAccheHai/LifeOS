const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register, login, refreshToken, logout,
  forgotPassword, resetPassword, getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);
router.post('/reset-password/:token', [body('password').isLength({ min: 8 })], validate, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
