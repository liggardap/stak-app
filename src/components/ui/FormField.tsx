import { forwardRef } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { Input } from './Input';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helper?: string;
  secure?: boolean;
}

export const FormField = forwardRef<TextInput, FormFieldProps>(
  function FormField({ label, error, helper, secure, ...inputProps }, ref) {
    return (
      <View className="mb-4">
        <Text className="text-foreground text-sm font-sans-medium mb-1.5">{label}</Text>
        <Input ref={ref} {...inputProps} secure={secure} error={!!error} />
        {error ? (
          <Text className="text-destructive-foreground text-xs mt-1">{error}</Text>
        ) : helper ? (
          <Text className="text-muted-foreground text-xs mt-1">{helper}</Text>
        ) : null}
      </View>
    );
  }
);
