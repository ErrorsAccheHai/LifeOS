// ============================================================
// CORE TYPES
// ============================================================

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  height?: number;
  currentWeight?: number;
  goalWeight?: number;
  occupation?: 'student' | 'working' | 'other';
  schedule: UserSchedule;
  goals: UserGoals;
  xp: number;
  level: number;
  totalXPEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string;
  settings: UserSettings;
  onboardingCompleted: boolean;
  bmi?: number;
  levelInfo?: LevelInfo;
  createdAt: string;
}

export interface UserSchedule {
  wakeTime: string;
  sleepTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  workoutTime: string;
  studyTime: string;
}

export interface UserGoals {
  waterGoal: number;
  screenTimeGoal: number;
  stepGoal: number;
  sleepGoal: number;
  studyGoal: number;
  calorieGoal: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  smartReminders: boolean;
  language: string;
  timezone: string;
}

export interface LevelInfo {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
  totalXP: number;
}

// ============================================================
// ACTIVITY TYPES
// ============================================================

export type ActivityCategory =
  | 'health' | 'fitness' | 'study' | 'work'
  | 'personal' | 'religion' | 'finance' | 'entertainment' | 'custom';

export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'late' | 'missed';

export interface Activity {
  _id: string;
  user: string;
  name: string;
  icon: string;
  color: string;
  category: ActivityCategory;
  description?: string;
  scheduledTime?: string;
  estimatedDuration: number;
  repeatSchedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom' | 'none';
    days: number[];
  };
  xpReward: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reminder: {
    enabled: boolean;
    minutesBefore: number;
  };
  isEnabled: boolean;
  isDefault: boolean;
  order: number;
}

export interface ActivityLog {
  _id: string;
  user: string;
  activity: Activity;
  date: string;
  scheduledTime?: string;
  startTime?: string;
  endTime?: string;
  actualDuration?: number;
  status: ActivityStatus;
  completedAt?: string;
  xpEarned: number;
  notes?: string;
  mood?: number;
  rating?: number;
}

export interface TimelineItem {
  activity: Activity;
  log: ActivityLog | null;
  status: ActivityStatus;
}

// ============================================================
// HEALTH TRACKING TYPES
// ============================================================

export interface SleepLog {
  _id: string;
  date: string;
  bedTime: string;
  wakeTime?: string;
  duration?: number;
  quality?: number;
  notes?: string;
  isLateNight: boolean;
  isLateWakeup: boolean;
  score?: number;
  xpEarned: number;
}

export interface WaterLog {
  _id: string;
  date: string;
  entries: WaterEntry[];
  totalAmount: number;
  goal: number;
  goalAchieved: boolean;
  xpEarned: number;
}

export interface WaterEntry {
  _id: string;
  amount: number;
  source: string;
  loggedAt: string;
}

export interface WorkoutLog {
  _id: string;
  date: string;
  workoutType: 'home' | 'gym' | 'cardio' | 'yoga' | 'sports' | 'custom';
  title: string;
  exercises: Exercise[];
  duration: number;
  caloriesBurned?: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  startTime?: string;
  endTime?: string;
  notes?: string;
  rating?: number;
  xpEarned: number;
}

export interface Exercise {
  _id?: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  calories?: number;
  notes?: string;
}

export interface StudyLog {
  _id: string;
  date: string;
  sessions: StudySession[];
  totalDuration: number;
  goal: number;
  goalAchieved: boolean;
  location: string;
  isLibraryCheckedIn: boolean;
  libraryCheckIn?: string;
  libraryCheckOut?: string;
  xpEarned: number;
  productivity?: number;
}

export interface StudySession {
  _id: string;
  subject?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  type: string;
  notes?: string;
}

export interface WeightLog {
  _id: string;
  date: string;
  weight: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  waist?: number;
  chest?: number;
  hips?: number;
  notes?: string;
}

export interface MealLog {
  _id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  loggedAt: string;
  photo?: string;
  notes?: string;
  xpEarned: number;
}

export interface MealItem {
  _id?: string;
  name: string;
  quantity?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface DashboardData {
  user: {
    name: string;
    avatar?: string;
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    levelInfo: LevelInfo;
  };
  today: {
    date: string;
    lifeScore: number;
    grade: ScoreGrade;
    activitiesCompleted: number;
    activitiesTotal: number;
    routineCompletion: number;
    xpEarned: number;
    mood?: number;
    steps: number;
  };
  timeline: TimelineItem[];
  upcoming: TimelineItem[];
  cards: {
    sleep: SleepLog | null;
    water: { amount: number; goal: number; percentage: number };
    workout: WorkoutLog | null;
    study: StudyLog | null;
    weight: WeightLog | null;
  };
  recentBadges: Badge[];
}

export interface ScoreGrade {
  grade: string;
  label: string;
  color: string;
}

// ============================================================
// GAMIFICATION TYPES
// ============================================================

export interface Badge {
  _id: string;
  badgeKey: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  earnedAt: string;
}

export interface XPLog {
  _id: string;
  date: string;
  amount: number;
  source: string;
  sourceName: string;
  xpBefore: number;
  xpAfter: number;
}

// ============================================================
// ANALYTICS TYPES
// ============================================================

export interface AnalyticsData {
  period: string;
  dateRange: { start: string; end: string };
  charts: {
    lifeScore: ChartPoint[];
    sleep: SleepChartPoint[];
    water: WaterChartPoint[];
    workout: WorkoutChartPoint[];
    study: StudyChartPoint[];
    weight: WeightChartPoint[];
    xp: XPChartPoint[];
  };
  summary: {
    avgLifeScore: number;
    totalXP: number;
    totalWorkouts: number;
    totalStudyHours: number;
    avgSleepHours: number;
    avgWaterMl: number;
    waterGoalDays: number;
    activeDays: number;
  };
}

export interface ChartPoint { date: string; score: number; grade?: string }
export interface SleepChartPoint { date: string; duration: number; quality: number; score: number }
export interface WaterChartPoint { date: string; amount: number; goal: number; percentage: number }
export interface WorkoutChartPoint { date: string; duration: number; calories: number; type: string }
export interface StudyChartPoint { date: string; minutes: number; hours: number }
export interface WeightChartPoint { date: string; weight: number; bmi?: number }
export interface XPChartPoint { date: string; xp: number }

// ============================================================
// API TYPES
// ============================================================

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ============================================================
// REPORT TYPES
// ============================================================

export interface Report {
  _id: string;
  type: 'daily' | 'weekly' | 'monthly';
  date: string;
  period: { start: string; end: string };
  lifeScore: number;
  summary: {
    activitiesCompleted: number;
    activitiesTotal: number;
    completionRate: number;
    xpEarned: number;
    streakDays: number;
    totalSleepHours: number;
    avgSleepQuality: number;
    totalWorkoutMinutes: number;
    totalStudyMinutes: number;
    totalWaterMl: number;
  };
  aiSummary: string;
  aiSuggestions: string[];
  highlights: string[];
  improvements: string[];
  generatedAt: string;
  isRead: boolean;
}

// ============================================================
// HABIT TYPES
// ============================================================

export interface Habit {
  _id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: ActivityCategory;
  frequency: {
    type: 'daily' | 'weekly' | 'monthly';
    days: number[];
    timesPerPeriod: number;
  };
  targetCount: number;
  unit: string;
  reminderTime?: string;
  xpReward: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  isActive: boolean;
}
