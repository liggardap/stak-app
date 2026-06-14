import { View, Text, Pressable } from 'react-native';
import { useLogout } from '@/hooks/useAuthMutations';

export default function AppHomeScreen() {
  const logout = useLogout();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-semibold text-foreground mb-8">Welcome to Stak</Text>
      <Pressable
        onPress={() => logout.mutate()}
        className="bg-primary-foreground px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-medium">Log out</Text>
      </Pressable>
    </View>
  );
}
