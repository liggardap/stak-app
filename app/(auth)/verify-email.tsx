import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { IconAlertCircle } from '@tabler/icons-react-native';
import { useVerifyEmail, useResendVerification } from '@/hooks/useAuthMutations';
import { extractProblem } from '@/lib/error';

type ScreenState = 'verifying' | 'error' | 'missing';

export default function VerifyEmailScreen() {
  const { id, hash, expires, signature } = useLocalSearchParams<{
    id: string;
    hash: string;
    expires: string;
    signature: string;
  }>();

  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  const [state, setState] = useState<ScreenState>(
    id && hash && expires && signature ? 'verifying' : 'missing',
  );

  useEffect(() => {
    if (state !== 'verifying') return;
    verifyEmail.mutate(
      { id: id!, hash: hash!, expires: expires!, signature: signature! },
      {
        onSuccess: () => {
          Alert.alert('Email verified!', 'Welcome to Stak.', [
            { text: 'Continue', onPress: () => router.replace('/(app)') },
          ]);
        },
        onError: () => {
          setState('error');
        },
      },
    );
  }, []);

  function onResend() {
    resendVerification.mutate(undefined, {
      onSuccess: () => {
        Alert.alert('Sent', 'A new verification link has been sent to your email.');
      },
      onError: () => {
        Alert.alert('Error', 'Could not resend the verification email. Please try again.');
      },
    });
  }

  if (state === 'verifying') {
    return (
      <View className="flex-1 bg-background items-center justify-center gap-4">
        <ActivityIndicator size="large" color="#0d9488" />
        <Text className="text-sm font-sans text-muted-foreground">
          Verifying your email...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      <View className="w-full bg-destructive rounded-xl p-5 gap-3">
        <View className="flex-row items-center gap-2">
          <IconAlertCircle size={20} color="#dc2626" />
          <Text className="text-sm font-sans-semibold text-destructive-foreground">
            {state === 'missing' ? 'Invalid verification link' : 'This link has expired'}
          </Text>
        </View>
        <Text className="text-sm font-sans text-destructive-foreground">
          {state === 'missing'
            ? 'The verification link is incomplete or invalid. Please use the link from your email.'
            : 'Request a new verification link and check your inbox.'}
        </Text>
        {state === 'error' && (
          <Pressable
            onPress={onResend}
            disabled={resendVerification.isPending}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-sm font-sans-semibold text-destructive-foreground underline">
              {resendVerification.isPending ? 'Sending...' : 'Resend verification email'}
            </Text>
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={() => router.replace('/(auth)/login')}
        className="mt-6"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text className="text-sm font-sans text-muted-foreground">
          ← Back to login
        </Text>
      </Pressable>
    </View>
  );
}
