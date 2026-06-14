import { forwardRef, useState } from 'react';
import { View, TextInput, Pressable, type TextInputProps } from 'react-native';
import { IconEye, IconEyeOff } from '@tabler/icons-react-native';

interface InputProps extends TextInputProps {
  secure?: boolean;
  error?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  function Input({ secure = false, error = false, style, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    const borderColor = error ? '#dc2626' : '#e2e8f0';

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor,
          borderRadius: 12,
          paddingHorizontal: 16,
          backgroundColor: '#ffffff',
          overflow: 'visible',
        }}
      >
        <TextInput
          {...props}
          ref={ref}
          secureTextEntry={secure && !visible}
          style={{
            flex: 1,
            fontSize: 16,
            color: '#1e293b',
            paddingTop: 14,
            paddingBottom: 14,
          }}
          placeholderTextColor="#64748b"
        />
        {secure && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ marginLeft: 8 }}
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
);
