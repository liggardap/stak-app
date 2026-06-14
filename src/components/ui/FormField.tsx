import { View, Text, type TextInputProps } from 'react-native';
import { Input } from './Input';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  secure?: boolean;
}

export function FormField({ label, error, secure, ...inputProps }: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-foreground text-sm font-sans-medium mb-1.5">{label}</Text>
      <Input {...inputProps} secure={secure} error={!!error} />
      {error ? (
        <Text className="text-destructive-foreground text-xs mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
