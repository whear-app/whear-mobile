import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguage } from '../i18n/config';

export type Language = 'en' | 'vi';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: async (language: Language) => {
        await saveLanguage(language);
        set({ language });
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
