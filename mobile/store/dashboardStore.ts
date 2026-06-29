import { create } from 'zustand';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type { DashboardData } from '@/types';

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  fetchDashboard: () => Promise<void>;
  logMood: (mood: number, note?: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(ENDPOINTS.DASHBOARD.INDEX);
      set({
        data: response.data.data,
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load dashboard',
        isLoading: false,
      });
    }
  },

  logMood: async (mood, note) => {
    try {
      await api.post(ENDPOINTS.DASHBOARD.MOOD, { mood, note });
      const current = get().data;
      if (current) {
        set({
          data: {
            ...current,
            today: { ...current.today, mood },
          },
        });
      }
    } catch (error: any) {
      throw error;
    }
  },

  refresh: async () => {
    await get().fetchDashboard();
  },
}));
