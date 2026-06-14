import { Redirect, Slot } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Slot />;
}
