import { View, Text, Pressable, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { KeyboardAwareView } from '@/components/ui/KeyboardAwareView';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { loginSchema, type LoginFormData } from '@/schemas/login.schema';
import { useLogin } from '@/hooks/useAuthMutations';
import { extractProblem, firstFieldError } from '@/lib/error';

export default function LoginScreen() {
  const login = useLogin();

  const { control, handleSubmit, setError, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(data: LoginFormData) {
    login.mutate(
      { email: data.email, password: data.password, audience: 'web' },
      {
        onError: (err) => {
          const problem = extractProblem(err);
          if (problem?.status === 422) {
            const emailErr = firstFieldError(problem, 'email');
            const passErr = firstFieldError(problem, 'password');
            if (emailErr) setError('email', { message: emailErr });
            if (passErr) setError('password', { message: passErr });
          } else if (problem?.status === 401) {
            Alert.alert('Error', 'Invalid email or password.');
          } else if (problem?.status === 429) {
            Alert.alert('Error', 'Too many attempts. Try again later.');
          } else {
            Alert.alert('Error', 'Something went wrong. Please try again.');
          }
        },
      },
    );
  }

  return (
    <View className="flex-1 bg-background">
      <AuthHeader />
      <KeyboardAwareView>
        <View className="flex-1 px-6 pt-8 pb-6">
          {/* Heading */}
          <Text className="text-2xl font-sans-semibold text-foreground mb-1">
            Welcome back
          </Text>
          <Text className="text-sm font-sans text-muted-foreground mb-8">
            Enter your details below.
          </Text>

          {/* Email */}
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
                returnKeyType="next"
                placeholder="you@example.com"
              />
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Password"
                error={errors.password?.message}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secure
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                placeholder="••••••••"
              />
            )}
          />

          {/* Forgot password */}
          <View className="items-end mb-6 -mt-2">
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text className="text-sm text-primary-foreground">
                  Forgot password?
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Submit */}
          <Button
            title="Log in"
            loading={login.isPending}
            onPress={handleSubmit(onSubmit)}
          />

          {/* Register link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-muted-foreground">
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text className="text-sm text-primary-foreground font-medium">
                  Register
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAwareView>
    </View>
  );
}
