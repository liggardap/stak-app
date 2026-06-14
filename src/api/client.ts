import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { BASE_URL } from '@/constants/api';
import { secureStore, TOKEN_KEY } from '@/lib/secure-store';
import { useAuthStore } from '@/stores/auth.store';

type FailedQueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let failedQueue: FailedQueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15_000,
});

// Attach JWT — read from Zustand (sync) first, SecureStore (async) as fallback
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token ?? (await secureStore.get(TOKEN_KEY));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → refresh → retry (queue pattern prevents concurrent refresh storms)
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const currentToken = useAuthStore.getState().token;
      // Use a standalone axios call to avoid triggering this interceptor recursively
      const { data } = await axios.post(
        `${BASE_URL}/api/v1/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );
      const newToken: string = data.data.token;

      useAuthStore.getState().setToken(newToken);
      await secureStore.set(TOKEN_KEY, newToken);

      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
