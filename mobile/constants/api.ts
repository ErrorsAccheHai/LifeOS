export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
    CHANGE_PASSWORD: '/users/change-password',
    ONBOARDING: '/users/onboarding',
    FCM_TOKEN: '/users/fcm-token',
    DELETE: '/users/account',
  },

  // Dashboard
  DASHBOARD: {
    INDEX: '/dashboard',
    STREAK: '/dashboard/streak',
    MOOD: '/dashboard/mood',
  },

  // Activities
  ACTIVITIES: {
    LIST: '/activities',
    LOGS: '/activities/logs',
    COMPLETE: (id: string) => `/activities/logs/${id}/complete`,
    UPDATE_STATUS: (logId: string) => `/activities/logs/${logId}/status`,
    DUPLICATE: (id: string) => `/activities/${id}/duplicate`,
    BY_ID: (id: string) => `/activities/${id}`,
  },

  // Sleep
  SLEEP: {
    TODAY: '/sleep/today',
    HISTORY: '/sleep/history',
    START: '/sleep/start',
    END: '/sleep/end',
  },

  // Water
  WATER: {
    TODAY: '/water/today',
    HISTORY: '/water/history',
    ADD: '/water/add',
    REMOVE: (id: string) => `/water/entry/${id}`,
  },

  // Workout
  WORKOUT: {
    TODAY: '/workout/today',
    HISTORY: '/workout/history',
    LOG: '/workout',
    BY_ID: (id: string) => `/workout/${id}`,
  },

  // Study
  STUDY: {
    TODAY: '/study/today',
    HISTORY: '/study/history',
    START: '/study/start',
    END: '/study/end',
    LIBRARY_IN: '/study/library/checkin',
    LIBRARY_OUT: '/study/library/checkout',
  },

  // Weight
  WEIGHT: {
    LATEST: '/weight/latest',
    HISTORY: '/weight/history',
    LOG: '/weight',
  },

  // Meals
  MEALS: {
    TODAY: '/meals/today',
    HISTORY: '/meals/history',
    LOG: '/meals',
    BY_ID: (id: string) => `/meals/${id}`,
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    STREAKS: '/analytics/streaks',
  },

  // AI Coach
  AI_COACH: {
    REPORT: '/ai-coach/report',
    GENERATE: '/ai-coach/generate',
    SUGGESTIONS: '/ai-coach/suggestions',
  },
} as const;
