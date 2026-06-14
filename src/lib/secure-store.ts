import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

export const TOKEN_KEY = 'stak_jwt';

export const secureStore = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  delete: (key: string) => SecureStore.deleteItemAsync(key),
};

export const zustandStorage: StateStorage = {
  getItem: (name) => SecureStore.getItem(name) ?? null,
  setItem: (name, value) => SecureStore.setItem(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
};
