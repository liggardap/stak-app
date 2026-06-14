import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
}

export function Button({ title, loading = false, variant = 'primary', disabled, ...props }: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle = {
    primary: 'bg-primary-foreground rounded-xl h-14 items-center justify-center px-6',
    outline: 'border border-primary-foreground rounded-xl h-14 items-center justify-center px-6',
    ghost: 'rounded-xl h-14 items-center justify-center px-6',
  }[variant];

  const textStyle = {
    primary: 'text-white font-semibold text-base',
    outline: 'text-primary-foreground font-semibold text-base',
    ghost: 'text-primary-foreground font-semibold text-base',
  }[variant];

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      className={`${containerStyle} ${isDisabled ? 'opacity-50' : 'active:opacity-80'}`}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#0d9488'} />
        : <Text className={textStyle}>{title}</Text>
      }
    </Pressable>
  );
}
