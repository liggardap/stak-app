import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { LOCALE_KEY, type SupportedLocale } from '@/lib/i18n';

export function useLocale() {
  const { i18n } = useTranslation();

  async function changeLocale(locale: SupportedLocale) {
    await AsyncStorage.setItem(LOCALE_KEY, locale);
    await i18n.changeLanguage(locale);
  }

  return {
    locale: i18n.language as SupportedLocale,
    changeLocale,
  };
}
