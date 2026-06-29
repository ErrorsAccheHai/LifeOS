const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');
const logger = require('../utils/logger');

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
};

// Create default activities for new users
const createDefaultActivities = async (userId, schedule) => {
  const defaults = [
    { name: 'Wake Up', icon: '🌅', color: '#F59E0B', category: 'health', scheduledTime: schedule.wakeTime || '06:00', xpReward: 10, order: 1 },
    { name: 'Morning Workout', icon: '💪', color: '#EF4444', category: 'fitness', scheduledTime: schedule.workoutTime || '07:00', xpReward: 30, order: 2 },
    { name: 'Breakfast', icon: '🍳', color: '#10B981', category: 'health', scheduledTime: schedule.breakfastTime || '08:00', xpReward: 15, order: 3 },
    { name: 'Study / Work', icon: '📚', color: '#6366F1', category: 'study', scheduledTime: schedule.studyTime || '09:00', xpReward: 40, order: 4 },
    { name: 'Lunch', icon: '🍱', color: '#F97316', category: 'health', scheduledTime: schedule.lunchTime || '13:00', xpReward: 15, order: 5 },
    { name: 'Evening Walk', icon: '🚶', color: '#14B8A6', category: 'fitness', scheduledTime: '17:00', xpReward: 15, order: 6 },
    { name: 'Dinner', icon: '🍽️', color: '#8B5CF6', category: 'health', scheduledTime: schedule.dinnerTime || '19:00', xpReward: 15, order: 7 },
    { name: 'Reading', icon: '📖', color: '#EC4899', category: 'personal', scheduledTime: '20:00', xpReward: 10, order: 8 },
    { name: 'Sleep', icon: '😴', color: '#3B82F6', category: 'health', scheduledTime: schedule.sleepTime || '22:00', xpReward: 20, order: 9 },
  ];

  const activities = defaults.map((a) => ({
    ...a,
    user: userId,
    isDefault: true,
    repeatSchedule: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] },
    reminder: { enabled: true, minutesBefore: 10 },
  }));

  await Activity.insertMany(activities);
};

// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, age, gender, height, currentWeight, goalWeight, occupation, schedule, goals } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'Email already registered. Please login.', 409);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      age,
      gender,
      height,
      currentWeight,
      goalWeight,
      occupation,
      schedule: schedule || {},
      goals: goals || {},
    });

    // Create default activities
    await createDefaultActivities(user._id, user.schedule);

    const { accessToken, refreshToken } = generateTokens(user._id);

    await User.findByIdAndUpdate(user._id, { refreshToken });

    const levelInfo = calculateLevel(user.xp);

    logger.info(`New user registered: ${user.email}`);

    return sendSuccess(
      res,
      {
        user: { ...user.toJSON(), levelInfo },
        accessToken,
        refreshToken,
      },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.password) {
      return sendError(res, 'Please login with Google or reset your password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account deactivated. Please contact support.', 403);
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, {
      refreshToken,
      lastLogin: new Date(),
    });

    const levelInfo = calculateLevel(user.xp);

    logger.info(`User logged in: ${user.email}`);

    return sendSuccess(res, {
      user: { ...user.toJSON(), levelInfo },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return sendError(res, 'Refresh token required.', 400);

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return sendError(res, 'Invalid refresh token.', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    return sendSuccess(res, { accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Refresh token expired. Please login again.', 401);
    }
    next(error);
  }
};

// @route   POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success (security: don't reveal if email exists)
    if (!user) {
      return sendSuccess(res, {}, 'If that email exists, a reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // In production: send email with reset link
    // For now, return token in dev mode
    const response = {};
    if (process.env.NODE_ENV === 'development') {
      response.resetToken = resetToken;
    }

    return sendSuccess(res, response, 'If that email exists, a reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired reset token.', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return sendSuccess(res, {}, 'Password reset successful. Please login.');
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const levelInfo = calculateLevel(user.xp);
    return sendSuccess(res, { user: { ...user.toJSON(), levelInfo } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword, getMe };
