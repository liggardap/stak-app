import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth.store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  // Fallback: force hydration after 2s if onRehydrateStorage never fires
  useEffect(() => {
    const timer = setTimeout(() => setHydrated(), 2000);
    return () => clearTimeout(timer);
  }, [setHydrated]);

  // Hide native splash once auth state is resolved
  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
