import { View } from 'react-native';
import { Redirect, Slot } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { VerificationBanner } from '@/components/auth/VerificationBanner';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <VerificationBanner />
      <Slot />
    </View>
  );
}
