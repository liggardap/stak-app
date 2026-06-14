import { useState } from 'react';
import { View, TextInput, Pressable, type TextInputProps } from 'react-native';
import { IconEye, IconEyeOff } from '@tabler/icons-react-native';

interface InputProps extends TextInputProps {
  secure?: boolean;
  error?: boolean;
}

export function Input({ secure = false, error = false, style, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);

  const borderColor = error ? 'border-destructive-foreground' : 'border-border';

  return (
    <View className={`flex-row items-center border rounded-xl px-4 h-14 bg-background ${borderColor}`}>
      <TextInput
        {...props}
        secureTextEntry={secure && !visible}
        className="flex-1 text-foreground text-base"
        placeholderTextColor="#64748b"
      />
      {secure && (
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="ml-2"
        >
          {visible
            ? <IconEyeOff size={20} color="#64748b" />
            : <IconEye size={20} color="#64748b" />
          }
        </Pressable>
      )}
    </View>
  );
}
