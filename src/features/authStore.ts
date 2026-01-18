import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../models';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  justLoggedIn: boolean; // Flag to track if user just logged in (not persisted)
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearJustLoggedIn: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      justLoggedIn: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(email, password);
          set({ user: response.data, isAuthenticated: true, isLoading: false, justLoggedIn: true });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(email, password, name);
          set({ user: response.data, isAuthenticated: true, isLoading: false, justLoggedIn: true });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: async () => {
        await authService.logout();
        set({ user: null, isAuthenticated: false, justLoggedIn: false });
      },
      clearJustLoggedIn: () => set({ justLoggedIn: false }),
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          // When checking auth on app startup, clear justLoggedIn flag
          // This ensures persisted sessions don't trigger onboarding
          set({ user, isAuthenticated: !!user, isLoading: false, justLoggedIn: false });
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false, justLoggedIn: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist user and isAuthenticated, NOT justLoggedIn
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);




