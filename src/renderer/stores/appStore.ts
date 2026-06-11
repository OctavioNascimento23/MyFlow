import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  language: 'en',
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
}));

// Made with Bob
