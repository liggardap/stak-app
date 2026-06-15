import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enUS from '@/locales/en-US.json';
import nl from '@/locales/nl.json';
import id from '@/locales/id.json';
import jv from '@/locales/jv.json';

export const LOCALE_KEY = 'stak_locale';

export const SUPPORTED_LOCALES = ['en-US', 'nl', 'id', 'jv'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export function resolveLocale(deviceLocale: string): SupportedLocale {
  if (deviceLocale.startsWith('nl')) return 'nl';
  if (deviceLocale.startsWith('id')) return 'id';
  if (deviceLocale.startsWith('jv')) return 'jv';
  return 'en-US';
}

export async function initI18n(userLocale?: string | null): Promise<void> {
  // Resolution order: user.locale → stored guest pref → device locale → en-US
  let locale: SupportedLocale = 'en-US';

  if (userLocale && SUPPORTED_LOCALES.includes(userLocale as SupportedLocale)) {
    locale = userLocale as SupportedLocale;
  } else {
    const stored = await AsyncStorage.getItem(LOCALE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
      locale = stored as SupportedLocale;
    } else {
      const deviceTag = Localization.getLocales()[0]?.languageTag ?? 'en-US';
      locale = resolveLocale(deviceTag);
    }
  }

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources: {
        'en-US': { translation: enUS },
        nl: { translation: nl },
        id: { translation: id },
        jv: { translation: jv },
      },
      lng: locale,
      fallbackLng: 'en-US',
      interpolation: { escapeValue: false },
    });
  } else {
    await i18n.changeLanguage(locale);
  }
}

export default i18n;
