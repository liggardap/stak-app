import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { I18nextProvider } from 'react-i18next';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth.store';
import i18n, { initI18n } from '@/lib/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const user = useAuthStore((s) => s.user);
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [i18nReady, setI18nReady] = useState(false);

  // Fallback: force hydration after 2s if onRehydrateStorage never fires
  useEffect(() => {
    const timer = setTimeout(() => setHydrated(), 2000);
    return () => clearTimeout(timer);
  }, [setHydrated]);

  // Init i18n once store is hydrated (so we have user.locale if authenticated)
  useEffect(() => {
    if (!isHydrated) return;
    initI18n(user?.locale).then(() => setI18nReady(true));
  }, [isHydrated]);

  // Sync i18n when user locale changes (login / account switch)
  useEffect(() => {
    if (user?.locale) {
      i18n.changeLanguage(user.locale);
    }
  }, [user?.locale]);

  // Hide native splash once everything is ready
  useEffect(() => {
    if (isHydrated && fontsLoaded && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated, fontsLoaded, i18nReady]);

  if (!isHydrated || !fontsLoaded || !i18nReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
