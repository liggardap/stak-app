import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function StakLogo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ gap: 5 }}>
        <View style={{ width: 16, height: 5, backgroundColor: 'white', borderRadius: 2 }} />
        <View style={{ width: 25, height: 5, backgroundColor: 'white', borderRadius: 2 }} />
        <View style={{ width: 34, height: 5, backgroundColor: 'white', borderRadius: 2 }} />
      </View>
      <Text style={{ color: 'white', fontSize: 28, fontWeight: '600', fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 }}>
        Stak
      </Text>
    </View>
  );
}

export function AuthHeader() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#0d9488', '#065f46']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: insets.top + 48,
        paddingBottom: 56,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
      }}
    >
      <StakLogo />
      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 40 }}>
        Your financial instruments, clearly.
      </Text>
    </LinearGradient>
  );
}
