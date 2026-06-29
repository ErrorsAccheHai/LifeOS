import { create } from 'zustand';
import { api, tokenStorage } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  height?: number;
  currentWeight?: number;
  goalWeight?: number;
  occupation?: string;
  schedule?: any;
  goals?: any;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      await tokenStorage.setTokens(accessToken, refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, data);
      const { user, accessToken, refreshToken } = response.data.data;

      await tokenStorage.setTokens(accessToken, refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {}
    await tokenStorage.clearTokens();
    set({ user: null, isAuthenticated: false, error: null });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const response = await api.get(ENDPOINTS.AUTH.ME);
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await tokenStorage.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (updates) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updates } });
    }
  },

  clearError: () => set({ error: null }),
}));
