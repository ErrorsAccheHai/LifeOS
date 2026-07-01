import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@/constants/api';

const TOKEN_KEY = 'lifeos_access_token';
const REFRESH_TOKEN_KEY = 'lifeos_refresh_token';

// ── Platform-safe storage ──────────────────────────────────────────────────
// expo-secure-store only works on iOS/Android. Use localStorage on web.
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    const SecureStore = await import('expo-secure-store');
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    const SecureStore = await import('expo-secure-store');
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(key); } catch {}
      return;
    }
    const SecureStore = await import('expo-secure-store');
    return SecureStore.deleteItemAsync(key);
  },
};

// ── Token helpers ──────────────────────────────────────────────────────────
export const tokenStorage = {
  getAccessToken: () => storage.getItem(TOKEN_KEY),
  getRefreshToken: () => storage.getItem(REFRESH_TOKEN_KEY),
  setTokens: async (access: string, refresh: string) => {
    await storage.setItem(TOKEN_KEY, access);
    await storage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clearTokens: async () => {
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(REFRESH_TOKEN_KEY);
  },
};

// ── Axios instance ─────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Request: attach token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: handle 401 + silent refresh
let isRefreshing = false;
let failedQueue: { resolve: (t: string) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refresh = await tokenStorage.getRefreshToken();
        if (!refresh) throw new Error('No refresh token');
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: refresh });
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        await tokenStorage.setTokens(accessToken, newRefresh);
        processQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch (e) {
        processQueue(e, null);
        await tokenStorage.clearTokens();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ── Generic helpers ────────────────────────────────────────────────────────
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<any, AxiosResponse<{ success: boolean; data: T; message: string }>>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<any, AxiosResponse<{ success: boolean; data: T; message: string }>>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<any, AxiosResponse<{ success: boolean; data: T; message: string }>>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<any, AxiosResponse<{ success: boolean; data: T; message: string }>>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<any, AxiosResponse<{ success: boolean; data: T; message: string }>>(url, config),
};

export default apiClient;
