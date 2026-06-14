import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

export const TOKEN_KEY = 'stak_jwt';

export const secureStore = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  delete: (key: string) => SecureStore.deleteItemAsync(key),
};

// Async adapter — avoids SecureStore.getItem() sync issues on Android/Expo Go
export const zustandStorage: StateStorage = {
  getItem: async (name) => {
    return await SecureStore.getItemAsync(name) ?? null;
  },
  setItem: async (name, value) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name);
  },
};
