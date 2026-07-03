import { create } from 'zustand';
import { api } from '@/services/api';
import type { Habit } from '@/types';

// Habits use the activities system on the backend — habits are recurring activities
// We treat them as a filtered view of activities with repeat schedules

interface HabitsState {
  habits: Habit[];
  completedToday: string[]; // activity IDs completed today
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    completedToday: number;
    avgStreak: number;
    avgRate: number;
  };

  fetchHabits: () => Promise<void>;
  completeHabit: (habitId: string) => Promise<{ xpEarned: number }>;
  skipHabit: (habitId: string, reason?: string) => Promise<void>;
  createHabit: (data: CreateHabitData) => Promise<void>;
  updateHabit: (id: string, data: Partial<CreateHabitData>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface CreateHabitData {
  name: string;
  icon: string;
  color: string;
  category: string;
  frequency: 'daily' | 'weekly';
  days: number[];
  xpReward: number;
  reminderEnabled: boolean;
  reminderTime?: string;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  completedToday: [],
  isLoading: false,
  error: null,
  stats: { total: 0, completedToday: 0, avgStreak: 0, avgRate: 0 },

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      // Habits are recurring activities — fetch from activities endpoint
      const today = new Date().toISOString().split('T')[0];
      const [activitiesRes, logsRes] = await Promise.all([
        api.get('/activities?type=recurring'),
        api.get(`/activities/logs?date=${today}`),
      ]);

      const activities = activitiesRes.data.data?.activities || activitiesRes.data.data || [];
      const logs = logsRes.data.data?.logs || logsRes.data.data || [];

      // Map activities to Habit shape
      const habits: Habit[] = activities
        .filter((a: any) => a.repeatSchedule?.type !== 'none')
        .map((a: any) => ({
          _id: a._id,
          name: a.name,
          icon: a.icon,
          color: a.color,
          category: a.category,
          description: a.description,
          frequency: {
            type: a.repeatSchedule?.type === 'weekly' ? 'weekly' : 'daily',
            days: a.repeatSchedule?.days || [0, 1, 2, 3, 4, 5, 6],
            timesPerPeriod: 1,
          },
          targetCount: 1,
          unit: 'times',
          xpReward: a.xpReward,
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          completionRate: 0,
          isActive: a.isEnabled,
          reminderTime: a.reminder?.enabled ? a.scheduledTime : undefined,
        }));

      // Determine completed today from logs
      const completedToday = logs
        .filter((l: any) => l.status === 'completed')
        .map((l: any) => l.activity?._id || l.activity);

      // Compute stats
      const total = habits.length;
      const completedCount = completedToday.length;
      const avgStreak = total > 0
        ? Math.round(habits.reduce((s, h) => s + h.currentStreak, 0) / total)
        : 0;
      const avgRate = total > 0
        ? Math.round(habits.reduce((s, h) => s + h.completionRate, 0) / total)
        : 0;

      set({
        habits,
        completedToday,
        isLoading: false,
        stats: { total, completedToday: completedCount, avgStreak, avgRate },
      });
    } catch (e: any) {
      set({ isLoading: false, error: e.response?.data?.message || 'Failed to load habits' });
    }
  },

  completeHabit: async (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    const res = await api.post(`/activities/logs/${habitId}/complete?date=${today}`, {});
    const { xpEarned } = res.data.data;

    set(state => ({
      completedToday: [...state.completedToday, habitId],
      stats: { ...state.stats, completedToday: state.stats.completedToday + 1 },
    }));

    return { xpEarned };
  },

  skipHabit: async (habitId, reason) => {
    const today = new Date().toISOString().split('T')[0];
    await api.patch(`/activities/logs/${habitId}/status`, { status: 'skipped', date: today, notes: reason });

    set(state => ({
      completedToday: state.completedToday.filter(id => id !== habitId),
    }));
  },

  createHabit: async (data) => {
    await api.post('/activities', {
      name: data.name,
      icon: data.icon,
      color: data.color,
      category: data.category,
      xpReward: data.xpReward,
      estimatedDuration: 30,
      repeatSchedule: {
        type: data.frequency,
        days: data.days,
      },
      reminder: {
        enabled: data.reminderEnabled,
        minutesBefore: 15,
      },
    });
    await get().fetchHabits();
  },

  updateHabit: async (id, data) => {
    await api.put(`/activities/${id}`, {
      name: data.name,
      icon: data.icon,
      color: data.color,
      category: data.category,
      xpReward: data.xpReward,
      repeatSchedule: data.days ? {
        type: data.frequency,
        days: data.days,
      } : undefined,
    });
    await get().fetchHabits();
  },

  deleteHabit: async (id) => {
    await api.delete(`/activities/${id}`);
    set(state => ({
      habits: state.habits.filter(h => h._id !== id),
      stats: { ...state.stats, total: state.stats.total - 1 },
    }));
  },

  refresh: async () => {
    await get().fetchHabits();
  },
}));
