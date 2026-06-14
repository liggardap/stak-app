import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as api from '@/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { queryClient } from '@/lib/query-client';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: api.login,
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      router.replace('/(app)');
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: api.register,
    // PRD §8.3: do NOT auto-login after register — show success state only
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: api.logout,
    onSettled: () => {
      // Best-effort — clear local state regardless of API result
      clearAuth();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: api.resetPassword,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: api.verifyEmail,
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: api.resendVerification,
  });
}
