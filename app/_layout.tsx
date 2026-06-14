import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth.store';
import { SplashScreen } from '@/components/ui/SplashScreen';

export default function RootLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  // Fallback: if onRehydrateStorage never fires (e.g. Expo Go on Android),
  // force hydration after 2s so the splash doesn't get stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      setHydrated();
    }, 2000);
    return () => clearTimeout(timer);
  }, [setHydrated]);

  if (!isHydrated) {
    return (
      <SafeAreaProvider>
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
