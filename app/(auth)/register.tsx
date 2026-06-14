import { useRef, useState } from 'react';
import { View, Text, Pressable, Alert, Animated, TextInput as RNTextInput } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconMailCheck } from '@tabler/icons-react-native';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { KeyboardAwareView } from '@/components/ui/KeyboardAwareView';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { registerSchema, type RegisterFormData } from '@/schemas/register.schema';
import { useRegister } from '@/hooks/useAuthMutations';
import { extractProblem, firstFieldError } from '@/lib/error';

export default function RegisterScreen() {
  const register = useRegister();
  const [succeeded, setSucceeded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const lastNameRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmRef = useRef<RNTextInput>(null);

  const { control, handleSubmit, setError, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  function showSuccess() {
    setSucceeded(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }

  function onSubmit(data: RegisterFormData) {
    register.mutate(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      },
      {
        onSuccess: () => showSuccess(),
        onError: (err) => {
          const problem = extractProblem(err);
          if (problem?.status === 422) {
            const fieldMap: [keyof RegisterFormData, string][] = [
              ['first_name', 'first_name'],
              ['last_name', 'last_name'],
              ['email', 'email'],
              ['password', 'password'],
              ['password_confirmation', 'password_confirmation'],
            ];
            fieldMap.forEach(([formKey, apiKey]) => {
              const msg = firstFieldError(problem, apiKey);
              if (msg) setError(formKey, { message: msg });
            });
          } else if (problem?.status === 429) {
            Alert.alert('Too many attempts', 'Please wait a moment and try again.');
          } else {
            Alert.alert('Error', 'Something went wrong. Please try again.');
          }
        },
      },
    );
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
            We've sent a verification link to your email. You can log in now — some features require a verified address.
          </Text>
          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            className="mt-8"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-sm font-sans-semibold text-primary-foreground">
              Go to login
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
            Create your account
          </Text>
          <Text className="text-sm font-sans text-muted-foreground mb-8">
            Get started — it only takes a minute.
          </Text>

          {/* First + Last name row */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="First name"
                    error={errors.first_name?.message}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    autoComplete="given-name"
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    placeholder="Jane"
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Last name"
                    error={errors.last_name?.message}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    ref={lastNameRef}
                    autoCapitalize="words"
                    autoComplete="family-name"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    placeholder="Doe"
                  />
                )}
              />
            </View>
          </View>

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
                ref={emailRef}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                placeholder="you@example.com"
              />
            )}
          />

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
                ref={passwordRef}
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
                label="Confirm password"
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

          <Button
            title="Create account"
            loading={register.isPending}
            onPress={handleSubmit(onSubmit)}
            style={{ marginTop: 8 }}
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm font-sans text-muted-foreground">
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text className="text-sm font-sans-semibold text-primary-foreground">
                  Log in
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAwareView>
    </View>
  );
}
