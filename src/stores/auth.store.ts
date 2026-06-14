import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage, secureStore, TOKEN_KEY } from '@/lib/secure-store';
import type { UserResource } from '@/types/user';

interface AuthState {
  token: string | null;
  user: UserResource | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  setAuth: (token: string, user: UserResource) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      setToken: (token) =>
        set({ token }),

      clearAuth: () => {
        secureStore.delete(TOKEN_KEY);
        set({ token: null, user: null, isAuthenticated: false });
      },

      setHydrated: () =>
        set({ isHydrated: true }),
    }),
    {
      name: 'stak-auth',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
