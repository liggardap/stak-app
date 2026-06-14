import { View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AuthHeader() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#0d9488', '#065f46']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingTop: insets.top + 24, paddingBottom: 32, alignItems: 'center' }}
    >
      <Image
        source={require('../../../assets/logo.png')}
        style={{ width: 80, height: 80 }}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}
