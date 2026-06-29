const mongoose = require('mongoose');

// Badge definitions (seeded once)
const badgeDefinitionSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  category: { type: String },
  requirement: {
    type: { type: String }, // 'count', 'streak', 'hours'
    activity: { type: String },
    value: { type: Number },
  },
  xpReward: { type: Number, default: 50 },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
});

// User badge (earned)
const userBadgeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    badgeKey: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    category: { type: String },
    rarity: { type: String, default: 'common' },
    xpReward: { type: Number, default: 50 },
    earnedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 100 }, // percentage
  },
  { timestamps: true }
);

userBadgeSchema.index({ user: 1 });
userBadgeSchema.index({ user: 1, badgeKey: 1 }, { unique: true });

const BadgeDefinition = mongoose.model('BadgeDefinition', badgeDefinitionSchema);
const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

module.exports = { BadgeDefinition, UserBadge };
