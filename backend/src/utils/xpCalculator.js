/**
 * XP and Level calculation utilities
 */

const XP_TABLE = {
  wake_up: 10,
  workout: 30,
  breakfast: 15,
  lunch: 15,
  dinner: 15,
  study_1h: 20,
  study_2h: 40,
  water_goal: 15,
  sleep_on_time: 20,
  meditation: 15,
  jogging: 25,
  custom_activity: 10,
  habit_completion: 5,
  streak_bonus_7: 50,
  streak_bonus_30: 200,
  streak_bonus_100: 500,
};

const LEVEL_XP_REQUIREMENTS = (level) => {
  // XP required to reach next level: base 100, increases 50 per level
  return Math.floor(100 * level + 50 * Math.pow(level - 1, 1.5));
};

const calculateLevel = (totalXP) => {
  let level = 1;
  let xpAccumulated = 0;

  while (true) {
    const required = LEVEL_XP_REQUIREMENTS(level);
    if (xpAccumulated + required > totalXP) break;
    xpAccumulated += required;
    level++;
    if (level > 9999) break; // safety cap
  }

  const currentLevelXP = totalXP - xpAccumulated;
  const nextLevelXP = LEVEL_XP_REQUIREMENTS(level);
  const progress = Math.min((currentLevelXP / nextLevelXP) * 100, 100);

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    progress: Math.round(progress),
    totalXP,
  };
};

const getActivityXP = (activityType, customXP = null) => {
  if (customXP !== null) return customXP;
  return XP_TABLE[activityType] || XP_TABLE.custom_activity;
};

const getLevelTitle = (level) => {
  if (level < 5) return 'Beginner';
  if (level < 10) return 'Apprentice';
  if (level < 20) return 'Practitioner';
  if (level < 30) return 'Expert';
  if (level < 50) return 'Master';
  if (level < 75) return 'Grandmaster';
  if (level < 100) return 'Legend';
  return 'Mythic';
};

module.exports = { calculateLevel, getActivityXP, getLevelTitle, XP_TABLE, LEVEL_XP_REQUIREMENTS };
