import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Alert, Animated } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconMailCheck } from '@tabler/icons-react-native';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { KeyboardAwareView } from '@/components/ui/KeyboardAwareView';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas/forgot-password.schema';
import { useForgotPassword } from '@/hooks/useAuthMutations';

const COOLDOWN_SECONDS = 60;

export default function ForgotPasswordScreen() {
  const forgotPassword = useForgotPassword();
  const [succeeded, setSucceeded] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { control, handleSubmit, getValues, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  function showSuccess(email: string) {
    setSubmittedEmail(email);
    setSucceeded(true);
    setCooldown(COOLDOWN_SECONDS);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }

  function onSubmit(data: ForgotPasswordFormData) {
    forgotPassword.mutate(data.email, {
      onSuccess: () => showSuccess(data.email),
      onError: () => {
        // Always show success to prevent email enumeration
        showSuccess(data.email);
      },
    });
  }

  function onResend() {
    if (cooldown > 0) return;
    forgotPassword.mutate(submittedEmail, {
      onSuccess: () => setCooldown(COOLDOWN_SECONDS),
      onError: () => setCooldown(COOLDOWN_SECONDS),
    });
  }

  if (succeeded) {
    return (
      <View className="flex-1 bg-background">
        <AuthHeader />
        <Animated.View
          style={{ flex: 1, opacity: fadeAnim }}
          className="items-center justify-center px-8 pb-12"
        >
          <IconMailCheck size={64} color="#0d9488" />
          <Text className="text-2xl font-sans-semibold text-foreground mt-6 mb-3 text-center">
            Check your inbox
          </Text>
          <Text className="text-sm font-sans text-muted-foreground text-center leading-6">
            If an account exists for{' '}
            <Text className="font-sans-semibold text-foreground">{submittedEmail}</Text>
            , a reset link has been sent.
          </Text>

          <Pressable
            onPress={onResend}
            disabled={cooldown > 0}
            className="mt-8"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              className={`text-sm font-sans-semibold ${cooldown > 0 ? 'text-muted-foreground' : 'text-primary-foreground'}`}
            >
              {cooldown > 0 ? `Resend email (${cooldown}s)` : 'Resend email'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            className="mt-4"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-sm font-sans text-muted-foreground">
              Back to login
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <AuthHeader />
      <KeyboardAwareView>
        <View className="flex-1 px-6 pt-8 pb-6">
          <Text className="text-2xl font-sans-semibold text-foreground mb-1">
            Forgot your password?
          </Text>
          <Text className="text-sm font-sans text-muted-foreground mb-8">
            Enter your email and we'll send you a reset link.
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Email address"
                error={errors.email?.message}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                placeholder="you@example.com"
              />
            )}
          />

          <Button
            title="Send reset link"
            loading={forgotPassword.isPending}
            onPress={handleSubmit(onSubmit)}
            style={{ marginTop: 8 }}
          />

          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            className="items-center mt-6"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-sm font-sans text-muted-foreground">
              ← Back to login
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareView>
    </View>
  );
}
