import { create } from 'zustand';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type { WaterLog } from '@/types';

interface WaterState {
  todayLog: WaterLog | null;
  goal: number;
  totalAmount: number;
  remaining: number;
  percentage: number;
  goalAchieved: boolean;
  isLoading: boolean;

  fetchToday: () => Promise<void>;
  addWater: (amount: number, source?: string) => Promise<{ xpEarned: number; goalAchieved: boolean }>;
  removeEntry: (entryId: string) => Promise<void>;
}

export const useWaterStore = create<WaterState>((set, get) => ({
  todayLog: null,
  goal: 2500,
  totalAmount: 0,
  remaining: 2500,
  percentage: 0,
  goalAchieved: false,
  isLoading: false,

  fetchToday: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get(ENDPOINTS.WATER.TODAY);
      const { log, goal, totalAmount, remaining, percentage, goalAchieved } = response.data.data;
      set({ todayLog: log, goal, totalAmount, remaining, percentage, goalAchieved, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addWater: async (amount, source = 'water') => {
    const response = await api.post(ENDPOINTS.WATER.ADD, { amount, source });
    const { log, remaining, percentage, goalAchieved, xpEarned } = response.data.data;
    set({
      todayLog: log,
      totalAmount: log.totalAmount,
      remaining,
      percentage,
      goalAchieved,
    });
    return { xpEarned, goalAchieved };
  },

  removeEntry: async (entryId) => {
    const response = await api.delete(ENDPOINTS.WATER.REMOVE(entryId));
    const { log } = response.data.data;
    const goal = get().goal;
    set({
      todayLog: log,
      totalAmount: log.totalAmount,
      remaining: Math.max(goal - log.totalAmount, 0),
      percentage: Math.round(Math.min((log.totalAmount / goal) * 100, 100)),
      goalAchieved: log.goalAchieved,
    });
  },
}));
