export const COLORS = {
  // Primary
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  // Background (dark mode default)
  background: '#0F0F23',
  backgroundSecondary: '#1A1A2E',
  surface: '#1E1E3A',
  surfaceLight: '#252547',
  surfaceLighter: '#2D2D5A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  textInverse: '#0F0F23',

  // Accent colors
  accentPink: '#EC4899',
  accentCyan: '#06B6D4',
  accentEmerald: '#10B981',
  accentAmber: '#F59E0B',
  accentRose: '#F43F5E',
  accentViolet: '#8B5CF6',
  accentOrange: '#F97316',
  accentBlue: '#3B82F6',
  accentTeal: '#14B8A6',

  // Category colors
  health: '#10B981',
  fitness: '#EF4444',
  study: '#6366F1',
  work: '#3B82F6',
  personal: '#8B5CF6',
  religion: '#F59E0B',
  finance: '#10B981',
  entertainment: '#EC4899',
  custom: '#06B6D4',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders
  border: '#2D2D5A',
  borderLight: '#3D3D6A',

  // Grade colors
  gradeS: '#FFD700',
  gradeA: '#10B981',
  gradeB: '#3B82F6',
  gradeC: '#F97316',
  gradeD: '#EF4444',
  gradeF: '#6B7280',

  // Mood colors
  mood1: '#EF4444',
  mood2: '#F97316',
  mood3: '#F59E0B',
  mood4: '#10B981',
  mood5: '#6366F1',

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
} as const;

export const GRADIENTS = {
  primary: ['#6366F1', '#8B5CF6'],
  pink: ['#EC4899', '#F43F5E'],
  cyan: ['#06B6D4', '#3B82F6'],
  emerald: ['#10B981', '#06B6D4'],
  amber: ['#F59E0B', '#F97316'],
  dark: ['#1A1A2E', '#0F0F23'],
  card: ['#1E1E3A', '#16163A'],
  sleep: ['#3B82F6', '#6366F1'],
  water: ['#06B6D4', '#3B82F6'],
  workout: ['#EF4444', '#F97316'],
  study: ['#6366F1', '#8B5CF6'],
  health: ['#10B981', '#06B6D4'],
  gold: ['#F59E0B', '#FFD700'],
  life: ['#6366F1', '#EC4899'],
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
} as const;

export const CATEGORY_CONFIG = {
  health: { color: '#10B981', icon: '❤️', gradient: ['#10B981', '#06B6D4'] },
  fitness: { color: '#EF4444', icon: '💪', gradient: ['#EF4444', '#F97316'] },
  study: { color: '#6366F1', icon: '📚', gradient: ['#6366F1', '#8B5CF6'] },
  work: { color: '#3B82F6', icon: '💼', gradient: ['#3B82F6', '#06B6D4'] },
  personal: { color: '#8B5CF6', icon: '⭐', gradient: ['#8B5CF6', '#EC4899'] },
  religion: { color: '#F59E0B', icon: '🙏', gradient: ['#F59E0B', '#F97316'] },
  finance: { color: '#10B981', icon: '💰', gradient: ['#10B981', '#3B82F6'] },
  entertainment: { color: '#EC4899', icon: '🎮', gradient: ['#EC4899', '#8B5CF6'] },
  custom: { color: '#06B6D4', icon: '✨', gradient: ['#06B6D4', '#6366F1'] },
} as const;

export const MOOD_CONFIG = [
  { value: 1, emoji: '😞', label: 'Terrible', color: '#EF4444' },
  { value: 2, emoji: '😕', label: 'Bad', color: '#F97316' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#F59E0B' },
  { value: 4, emoji: '😊', label: 'Good', color: '#10B981' },
  { value: 5, emoji: '😄', label: 'Amazing', color: '#6366F1' },
] as const;

export const WATER_AMOUNTS = [150, 200, 250, 350, 500, 750] as const;

export const BADGE_RARITY_COLORS = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
} as const;
