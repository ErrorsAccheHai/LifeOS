require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Activity = require('../models/Activity');
const ActivityLog = require('../models/ActivityLog');
const SleepLog = require('../models/SleepLog');
const WaterLog = require('../models/WaterLog');
const WorkoutLog = require('../models/WorkoutLog');
const StudyLog = require('../models/StudyLog');
const WeightLog = require('../models/WeightLog');
const MealLog = require('../models/MealLog');
const DailyScore = require('../models/DailyScore');
const XPLog = require('../models/XPLog');
const { UserBadge } = require('../models/Badge');

// ── helpers ────────────────────────────────────────────────────────────────
const dateStr = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const dateObj = (daysAgo = 0, hour = 0, min = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d;
};

async function seed() {
  console.log('🌱 Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected:', mongoose.connection.host);

  // ── 1. Clean existing demo user ──────────────────────────────────────────
  const DEMO_EMAIL = 'demo@lifeos.app';
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    const uid = existing._id;
    console.log('🧹 Cleaning existing demo data...');
    await Promise.all([
      Activity.deleteMany({ user: uid }),
      ActivityLog.deleteMany({ user: uid }),
      SleepLog.deleteMany({ user: uid }),
      WaterLog.deleteMany({ user: uid }),
      WorkoutLog.deleteMany({ user: uid }),
      StudyLog.deleteMany({ user: uid }),
      WeightLog.deleteMany({ user: uid }),
      MealLog.deleteMany({ user: uid }),
      DailyScore.deleteMany({ user: uid }),
      XPLog.deleteMany({ user: uid }),
      UserBadge.deleteMany({ user: uid }),
      User.deleteOne({ _id: uid }),
    ]);
  }

  // ── 2. Create demo user ──────────────────────────────────────────────────
  console.log('👤 Creating demo user...');
  const user = await User.create({
    name: 'Ashish Kumar',
    email: DEMO_EMAIL,
    password: 'Demo@1234',
    age: 22,
    gender: 'male',
    height: 175,
    currentWeight: 72,
    goalWeight: 68,
    occupation: 'student',
    schedule: {
      wakeTime: '06:00',
      sleepTime: '22:30',
      breakfastTime: '08:00',
      lunchTime: '13:00',
      dinnerTime: '19:30',
      workoutTime: '07:00',
      studyTime: '09:00',
    },
    goals: {
      waterGoal: 2500,
      screenTimeGoal: 120,
      stepGoal: 8000,
      sleepGoal: 480,
      studyGoal: 180,
      calorieGoal: 2200,
    },
    xp: 4250,
    level: 8,
    totalXPEarned: 4250,
    currentStreak: 12,
    longestStreak: 21,
    lastActiveDate: new Date(),
    onboardingCompleted: true,
    isEmailVerified: true,
    settings: { theme: 'dark', notifications: true, smartReminders: true },
  });
  console.log(`   ✅ User: ${user.email} | Password: Demo@1234`);

  // ── 3. Default activities ────────────────────────────────────────────────
  console.log('📋 Creating default activities...');
  const activitiesData = [
    { name: 'Wake Up',       icon: '🌅', color: '#F59E0B', category: 'health',       scheduledTime: '06:00', xpReward: 10,  order: 1 },
    { name: 'Morning Run',   icon: '🏃', color: '#EF4444', category: 'fitness',      scheduledTime: '06:30', xpReward: 25,  order: 2 },
    { name: 'Breakfast',     icon: '🍳', color: '#10B981', category: 'health',       scheduledTime: '08:00', xpReward: 15,  order: 3 },
    { name: 'Study Session', icon: '📚', color: '#6366F1', category: 'study',        scheduledTime: '09:00', xpReward: 40,  order: 4 },
    { name: 'Lunch',         icon: '🍱', color: '#F97316', category: 'health',       scheduledTime: '13:00', xpReward: 15,  order: 5 },
    { name: 'Workout',       icon: '💪', color: '#EC4899', category: 'fitness',      scheduledTime: '17:00', xpReward: 30,  order: 6 },
    { name: 'Evening Walk',  icon: '🚶', color: '#14B8A6', category: 'fitness',      scheduledTime: '18:00', xpReward: 15,  order: 7 },
    { name: 'Dinner',        icon: '🍽️', color: '#8B5CF6', category: 'health',       scheduledTime: '19:30', xpReward: 15,  order: 8 },
    { name: 'Reading',       icon: '📖', color: '#3B82F6', category: 'personal',     scheduledTime: '20:30', xpReward: 10,  order: 9 },
    { name: 'Meditation',    icon: '🧘', color: '#06B6D4', category: 'health',       scheduledTime: '21:30', xpReward: 15,  order: 10 },
    { name: 'Sleep',         icon: '😴', color: '#1D4ED8', category: 'health',       scheduledTime: '22:30', xpReward: 20,  order: 11 },
  ];

  const activities = await Activity.insertMany(
    activitiesData.map(a => ({
      ...a,
      user: user._id,
      isDefault: true,
      estimatedDuration: 30,
      repeatSchedule: { type: 'daily', days: [0,1,2,3,4,5,6] },
      reminder: { enabled: true, minutesBefore: 10 },
    }))
  );
  console.log(`   ✅ ${activities.length} activities created`);

  // ── 4. Last 7 days of activity logs ──────────────────────────────────────
  console.log('📅 Seeding 7 days of activity logs...');
  const completionChance = [1, 0.9, 0.85, 0.95, 0.8, 1, 0.9]; // day 0..6 ago
  for (let day = 6; day >= 0; day--) {
    const date = dateStr(day);
    const chance = completionChance[day];
    const logs = [];
    for (const act of activities) {
      const completed = Math.random() < chance;
      logs.push({
        user: user._id,
        activity: act._id,
        date,
        scheduledTime: act.scheduledTime,
        status: completed ? 'completed' : (day === 0 ? 'pending' : 'missed'),
        completedAt: completed ? dateObj(day, parseInt(act.scheduledTime), 10) : undefined,
        xpEarned: completed ? act.xpReward : 0,
      });
    }
    await ActivityLog.insertMany(logs);
  }
  console.log('   ✅ Activity logs created');

  // ── 5. Sleep logs ─────────────────────────────────────────────────────────
  console.log('😴 Seeding sleep logs...');
  const sleepData = [
    { ago: 1, duration: 440, quality: 4, score: 82 },
    { ago: 2, duration: 390, quality: 3, score: 65 },
    { ago: 3, duration: 470, quality: 5, score: 95 },
    { ago: 4, duration: 420, quality: 4, score: 80 },
    { ago: 5, duration: 360, quality: 2, score: 55 },
    { ago: 6, duration: 480, quality: 5, score: 98 },
    { ago: 7, duration: 450, quality: 4, score: 88 },
  ];
  await SleepLog.insertMany(sleepData.map(s => ({
    user: user._id,
    date: dateStr(s.ago),
    bedTime: dateObj(s.ago, 22, 30),
    wakeTime: dateObj(s.ago - 1, 6, 0),
    duration: s.duration,
    quality: s.quality,
    score: s.score,
    isLateNight: false,
    isLateWakeup: false,
    xpEarned: 20,
  })));
  console.log('   ✅ Sleep logs created');

  // ── 6. Water logs ─────────────────────────────────────────────────────────
  console.log('💧 Seeding water logs...');
  for (let day = 7; day >= 0; day--) {
    const amounts = [300, 350, 250, 400, 300, 350, 250, 300];
    const entries = amounts.map((amount, i) => ({
      amount,
      source: 'water',
      loggedAt: dateObj(day, 8 + i * 2, 0),
    }));
    const total = entries.reduce((s, e) => s + e.amount, 0);
    await WaterLog.create({
      user: user._id,
      date: dateStr(day),
      entries,
      totalAmount: total,
      goal: 2500,
      goalAchieved: total >= 2500,
      xpEarned: total >= 2500 ? 15 : 0,
    });
  }
  console.log('   ✅ Water logs created');

  // ── 7. Workout logs ───────────────────────────────────────────────────────
  console.log('💪 Seeding workout logs...');
  const workouts = [
    { ago: 1, title: 'Chest & Triceps', type: 'gym',    duration: 55, calories: 380, intensity: 'high' },
    { ago: 2, title: 'Morning Run 5K',  type: 'cardio', duration: 32, calories: 280, intensity: 'medium' },
    { ago: 3, title: 'Back & Biceps',   type: 'gym',    duration: 50, calories: 350, intensity: 'high' },
    { ago: 5, title: 'Legs Day',        type: 'gym',    duration: 60, calories: 420, intensity: 'extreme' },
    { ago: 6, title: 'Yoga Flow',       type: 'yoga',   duration: 40, calories: 180, intensity: 'low' },
  ];
  await WorkoutLog.insertMany(workouts.map(w => ({
    user: user._id,
    date: dateStr(w.ago),
    workoutType: w.type,
    title: w.title,
    duration: w.duration,
    caloriesBurned: w.calories,
    intensity: w.intensity,
    xpEarned: Math.round(30 * (w.duration / 30)),
    rating: 4,
    exercises: [],
  })));
  console.log('   ✅ Workout logs created');

  // ── 8. Study logs ─────────────────────────────────────────────────────────
  console.log('📚 Seeding study logs...');
  for (let day = 7; day >= 1; day--) {
    const dur = [180, 120, 240, 150, 200, 90, 270][day - 1] || 150;
    await StudyLog.create({
      user: user._id,
      date: dateStr(day),
      sessions: [{
        subject: ['Mathematics', 'Physics', 'Coding', 'DSA', 'Algorithms', 'Chemistry', 'English'][day - 1],
        startTime: dateObj(day, 9, 0),
        endTime: dateObj(day, 9 + Math.floor(dur / 60), dur % 60),
        duration: dur,
        type: 'deep_work',
      }],
      totalDuration: dur,
      goal: 180,
      goalAchieved: dur >= 180,
      xpEarned: dur >= 60 ? 20 : 0,
      location: 'library',
    });
  }
  console.log('   ✅ Study logs created');

  // ── 9. Weight logs ────────────────────────────────────────────────────────
  console.log('⚖️  Seeding weight logs...');
  const weights = [73.2, 73.0, 72.8, 72.9, 72.6, 72.4, 72.1, 72.0];
  await WeightLog.insertMany(weights.map((w, i) => ({
    user: user._id,
    date: dateStr(weights.length - 1 - i),
    weight: w,
    bmi: Math.round((w / (1.75 * 1.75)) * 10) / 10,
  })));
  console.log('   ✅ Weight logs created');

  // ── 10. Meal logs ─────────────────────────────────────────────────────────
  console.log('🍽️  Seeding meal logs...');
  const todayMeals = [
    { mealType: 'breakfast', items: [{ name: 'Oats with milk', calories: 280, protein: 12, carbs: 45, fat: 6 }, { name: 'Banana', calories: 90, protein: 1, carbs: 23, fat: 0 }] },
    { mealType: 'lunch',     items: [{ name: 'Rice & Dal', calories: 420, protein: 18, carbs: 72, fat: 8 }, { name: 'Sabzi', calories: 120, protein: 4, carbs: 18, fat: 4 }] },
    { mealType: 'snack',     items: [{ name: 'Protein Bar', calories: 200, protein: 20, carbs: 22, fat: 6 }] },
  ];
  for (const meal of todayMeals) {
    const totalCalories = meal.items.reduce((s, i) => s + i.calories, 0);
    const totalProtein  = meal.items.reduce((s, i) => s + i.protein, 0);
    const totalCarbs    = meal.items.reduce((s, i) => s + i.carbs, 0);
    const totalFat      = meal.items.reduce((s, i) => s + i.fat, 0);
    await MealLog.create({
      user: user._id,
      date: dateStr(0),
      mealType: meal.mealType,
      items: meal.items,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      xpEarned: 15,
    });
  }
  console.log('   ✅ Meal logs created');

  // ── 11. Daily scores (last 7 days) ────────────────────────────────────────
  console.log('📊 Seeding daily scores...');
  const scores = [
    { ago: 0, sleep: 75, exercise: 60, meals: 85, water: 88, study: 70, screen: 80, mood: 4, total: 76 },
    { ago: 1, sleep: 82, exercise: 90, meals: 100, water: 92, study: 100, screen: 75, mood: 5, total: 89 },
    { ago: 2, sleep: 65, exercise: 85, meals: 67, water: 78, study: 67, screen: 60, mood: 3, total: 70 },
    { ago: 3, sleep: 95, exercise: 90, meals: 100, water: 95, study: 100, screen: 90, mood: 5, total: 95 },
    { ago: 4, sleep: 80, exercise: 0,  meals: 100, water: 85, study: 83, screen: 70, mood: 4, total: 72 },
    { ago: 5, sleep: 55, exercise: 95, meals: 67,  water: 70, study: 50, screen: 50, mood: 3, total: 64 },
    { ago: 6, sleep: 88, exercise: 80, meals: 100, water: 100, study: 100, screen: 85, mood: 5, total: 91 },
  ];
  await DailyScore.insertMany(scores.map(s => ({
    user: user._id,
    date: dateStr(s.ago),
    sleepScore: s.sleep,
    exerciseScore: s.exercise,
    mealsScore: s.meals,
    waterScore: s.water,
    studyScore: s.study,
    screenTimeScore: s.screen,
    moodScore: s.mood * 20,
    mood: s.mood,
    totalScore: s.total,
    grade: s.total >= 90 ? 'S' : s.total >= 80 ? 'A' : s.total >= 70 ? 'B' : s.total >= 60 ? 'C' : 'D',
    xpEarned: Math.round(s.total * 1.5),
    activitiesCompleted: Math.round(activities.length * s.total / 100),
    activitiesTotal: activities.length,
  })));
  console.log('   ✅ Daily scores created');

  // ── 12. XP logs ───────────────────────────────────────────────────────────
  console.log('⚡ Seeding XP logs...');
  await XPLog.insertMany([
    { user: user._id, date: dateStr(0), amount: 135, source: 'activity', sourceName: 'Daily Activities', xpBefore: 4115, xpAfter: 4250 },
    { user: user._id, date: dateStr(1), amount: 180, source: 'activity', sourceName: 'Daily Activities', xpBefore: 3935, xpAfter: 4115 },
    { user: user._id, date: dateStr(2), amount: 120, source: 'activity', sourceName: 'Daily Activities', xpBefore: 3815, xpAfter: 3935 },
    { user: user._id, date: dateStr(3), amount: 200, source: 'activity', sourceName: 'Perfect Day Bonus', xpBefore: 3615, xpAfter: 3815 },
    { user: user._id, date: dateStr(6), amount: 50,  source: 'streak_bonus', sourceName: '7-Day Streak Bonus', xpBefore: 3565, xpAfter: 3615 },
  ]);
  console.log('   ✅ XP logs created');

  // ── 13. Badges ────────────────────────────────────────────────────────────
  console.log('🏅 Seeding badges...');
  await UserBadge.insertMany([
    { user: user._id, badgeKey: 'early_bird',    name: 'Early Bird',       description: '30 Early Wakeups', icon: '🌅', category: 'health',   rarity: 'rare',      xpReward: 100, earnedAt: dateObj(15) },
    { user: user._id, badgeKey: 'hydration_hero', name: 'Hydration Hero',  description: '7-Day Water Goal', icon: '💧', category: 'health',   rarity: 'common',    xpReward: 50,  earnedAt: dateObj(5) },
    { user: user._id, badgeKey: 'study_7',        name: 'Study Streak',    description: '7-Day Study Streak', icon: '📚', category: 'study', rarity: 'rare',      xpReward: 100, earnedAt: dateObj(3) },
    { user: user._id, badgeKey: 'streak_7',       name: '7-Day Warrior',   description: '7 Day Streak',    icon: '🔥', category: 'personal', rarity: 'common',    xpReward: 50,  earnedAt: dateObj(1) },
    { user: user._id, badgeKey: 'first_workout',  name: 'First Workout',   description: 'First Workout',   icon: '💪', category: 'fitness',  rarity: 'common',    xpReward: 25,  earnedAt: dateObj(10) },
  ]);
  console.log('   ✅ Badges created');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log('🎉  SEED COMPLETE!');
  console.log('═'.repeat(50));
  console.log('📧  Email   : demo@lifeos.app');
  console.log('🔑  Password: Demo@1234');
  console.log(`⚡  XP      : ${user.xp} (Level ${user.level})`);
  console.log(`🔥  Streak  : ${user.currentStreak} days`);
  console.log('📊  7 days of full activity data seeded');
  console.log('═'.repeat(50));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
