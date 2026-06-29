const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    googleId: { type: String, sparse: true },
    avatar: { type: String, default: null },
    avatarPublicId: { type: String, default: null },

    // Profile
    age: { type: Number, min: 10, max: 120 },
    gender: { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'] },
    height: { type: Number }, // cm
    currentWeight: { type: Number }, // kg
    goalWeight: { type: Number }, // kg
    occupation: { type: String, enum: ['student', 'working', 'other'] },

    // Daily schedule preferences
    schedule: {
      wakeTime: { type: String, default: '06:00' },
      sleepTime: { type: String, default: '22:00' },
      breakfastTime: { type: String, default: '08:00' },
      lunchTime: { type: String, default: '13:00' },
      dinnerTime: { type: String, default: '19:00' },
      workoutTime: { type: String, default: '07:00' },
      studyTime: { type: String, default: '09:00' },
    },

    // Daily goals
    goals: {
      waterGoal: { type: Number, default: 2500 }, // ml
      screenTimeGoal: { type: Number, default: 120 }, // minutes
      stepGoal: { type: Number, default: 8000 },
      sleepGoal: { type: Number, default: 480 }, // minutes
      studyGoal: { type: Number, default: 120 }, // minutes
      calorieGoal: { type: Number, default: 2000 },
    },

    // XP & Levels
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalXPEarned: { type: Number, default: 0 },

    // Streaks
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },

    // Auth
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },

    // Push notifications
    fcmTokens: [{ type: String }],

    // Settings
    settings: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: { type: Boolean, default: true },
      smartReminders: { type: Boolean, default: true },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
    },

    // Onboarding
    onboardingCompleted: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Clean sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

// BMI virtual
userSchema.virtual('bmi').get(function () {
  if (this.currentWeight && this.height) {
    const heightM = this.height / 100;
    return Math.round((this.currentWeight / (heightM * heightM)) * 10) / 10;
  }
  return null;
});

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', userSchema);
