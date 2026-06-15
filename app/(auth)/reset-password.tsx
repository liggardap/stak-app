import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Alert, TextInput as RNTextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconAlertCircle } from '@tabler/icons-react-native';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { KeyboardAwareView } from '@/components/ui/KeyboardAwareView';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/reset-password.schema';
import { useResetPassword } from '@/hooks/useAuthMutations';
import { extractProblem, firstFieldError } from '@/lib/error';

export default function ResetPasswordScreen() {
  const { token, email } = useLocalSearchParams<{ token: string; email: string }>();
  const resetPassword = useResetPassword();
  const confirmRef = useRef<RNTextInput>(null);

  // Redirect to forgot-password if params are missing
  useEffect(() => {
    if (!token || !email) {
      router.replace('/(auth)/forgot-password');
    }
  }, [token, email]);

  const { control, handleSubmit, setError, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  });

  const password = useWatch({ control, name: 'password' });
  const passwordConfirmation = useWatch({ control, name: 'password_confirmation' });
  const passwordsMatch =
    password.length > 0 &&
    passwordConfirmation.length > 0 &&
    password === passwordConfirmation;

  function onSubmit(data: ResetPasswordFormData) {
    resetPassword.mutate(
      {
        token: token!,
        email: email!,
        password: data.password,
        password_confirmation: data.password_confirmation,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Password reset. You can now log in.', [
            { text: 'OK', onPress: () => router.replace('/(auth)/login') },
          ]);
        },
        onError: (err) => {
          const problem = extractProblem(err);
          if (problem?.status === 422) {
            const passErr = firstFieldError(problem, 'password');
            const confirmErr = firstFieldError(problem, 'password_confirmation');
            if (passErr) setError('password', { message: passErr });
            if (confirmErr) setError('password_confirmation', { message: confirmErr });
          } else if (problem?.status === 400) {
            // handled via UI — token expired state shown below
          } else {
            Alert.alert('Error', 'Something went wrong. Please try again.');
          }
        },
      },
    );
  }

  const isExpired = resetPassword.isError && extractProblem(resetPassword.error)?.status === 400;

  if (!token || !email) return null;

  return (
    <View className="flex-1 bg-background">
      <AuthHeader />
      <KeyboardAwareView>
        <View className="flex-1 px-6 pt-8 pb-6">
          <Text className="text-2xl font-sans-semibold text-foreground mb-1">
            Set a new password
          </Text>
          <Text className="text-sm font-sans text-muted-foreground mb-8">
            Must be at least 8 characters.
          </Text>

          {isExpired && (
            <View className="flex-row items-start gap-3 bg-destructive rounded-xl p-4 mb-6">
              <IconAlertCircle size={20} color="#dc2626" style={{ marginTop: 1 }} />
              <View className="flex-1">
                <Text className="text-sm font-sans text-destructive-foreground">
                  This reset link has expired.{' '}
                </Text>
                <Pressable
                  onPress={() => router.replace('/(auth)/forgot-password')}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Text className="text-sm font-sans-semibold text-destructive-foreground underline">
                    Request a new one.
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="New password"
                error={errors.password?.message}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secure
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                placeholder="••••••••"
                helper="At least 8 characters"
              />
            )}
          />

          <Controller
            control={control}
            name="password_confirmation"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Confirm new password"
                error={errors.password_confirmation?.message}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                ref={confirmRef}
                secure
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                placeholder="••••••••"
              />
            )}
          />

          {/* Real-time match indicator */}
          {passwordConfirmation.length > 0 && (
            <Text className={`text-xs font-sans -mt-2 mb-4 ${passwordsMatch ? 'text-success-foreground' : 'text-destructive-foreground'}`}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </Text>
          )}

          <Button
            title="Reset password"
            loading={resetPassword.isPending}
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
