const User = require('../models/User');
const DailyScore = require('../models/DailyScore');
const XPLog = require('../models/XPLog');
const { UserBadge } = require('../models/Badge');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');
const { cloudinary } = require('../config/cloudinary');

// @route   GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const levelInfo = calculateLevel(user.xp);
    const badges = await UserBadge.find({ user: req.user._id }).sort({ earnedAt: -1 }).limit(10);

    return sendSuccess(res, { user: { ...user.toJSON(), levelInfo }, badges });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'age', 'gender', 'height', 'currentWeight', 'goalWeight',
      'occupation', 'schedule', 'goals', 'settings',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    const levelInfo = calculateLevel(user.xp);
    return sendSuccess(res, { user: { ...user.toJSON(), levelInfo } }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/avatar
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided.', 400);
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: req.file.path,
        avatarPublicId: req.file.filename,
      },
      { new: true }
    );

    return sendSuccess(res, { avatar: updatedUser.avatar }, 'Avatar updated successfully');
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return sendError(res, 'No password set. Use Google login.', 400);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, {}, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/users/complete-onboarding
const completeOnboarding = async (req, res, next) => {
  try {
    const {
      name, age, gender, height, currentWeight, goalWeight,
      occupation, schedule, goals,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name, age, gender, height, currentWeight, goalWeight,
        occupation,
        schedule: schedule || {},
        goals: goals || {},
        onboardingCompleted: true,
      },
      { new: true, runValidators: true }
    );

    const levelInfo = calculateLevel(user.xp);
    return sendSuccess(res, { user: { ...user.toJSON(), levelInfo } }, 'Onboarding completed');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/users/fcm-token
const updateFCMToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return sendError(res, 'FCM token required.', 400);

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { fcmTokens: token },
    });

    return sendSuccess(res, {}, 'FCM token updated');
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/users/account
const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    return sendSuccess(res, {}, 'Account deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile, updateProfile, updateAvatar, changePassword,
  completeOnboarding, updateFCMToken, deleteAccount,
};
