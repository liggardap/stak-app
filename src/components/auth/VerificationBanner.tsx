import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { IconMailCheck } from '@tabler/icons-react-native';
import { useAuthStore } from '@/stores/auth.store';
import { useResendVerification } from '@/hooks/useAuthMutations';
import { extractProblem } from '@/lib/error';

const COOLDOWN_SECONDS = 60;

export function VerificationBanner() {
  const user = useAuthStore((s) => s.user);
  const resend = useResendVerification();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  if (!user || user.emailVerifiedAt !== null) return null;

  function onResend() {
    if (cooldown > 0) return;
    resend.mutate(undefined, {
      onSuccess: () => {
        setCooldown(COOLDOWN_SECONDS);
        Alert.alert('Sent', 'A verification link has been sent to your email.');
      },
      onError: (err) => {
        const problem = extractProblem(err);
        if (problem?.status === 429) {
          setCooldown(COOLDOWN_SECONDS);
        } else {
          Alert.alert('Error', 'Could not send verification email. Please try again.');
        }
      },
    });
  }

  return (
    <View
      style={{
        backgroundColor: '#e6faf8',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
      }}
    >
      <IconMailCheck size={18} color="#0d9488" />
      <Text
        style={{ flex: 1, fontSize: 12, color: '#0d9488', fontFamily: 'Inter_400Regular' }}
        numberOfLines={2}
      >
        Please verify your email address to access all features.
      </Text>
      <Pressable
        onPress={onResend}
        disabled={cooldown > 0 || resend.isPending}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Inter_600SemiBold',
            color: cooldown > 0 ? '#64748b' : '#0d9488',
          }}
        >
          {cooldown > 0 ? `${cooldown}s` : 'Resend'}
        </Text>
      </Pressable>
    </View>
  );
}
