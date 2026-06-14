import { View, ActivityIndicator, Image } from 'react-native';

export function SplashScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d9488' }}>
      <Image
        source={require('../../../assets/logo.png')}
        style={{ width: 96, height: 96, marginBottom: 32 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#99f6e4" />
    </View>
  );
}
