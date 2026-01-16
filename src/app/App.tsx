import 'expo-constants';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Cormorant_300Light,
  Cormorant_400Regular,
  Cormorant_500Medium,
  Cormorant_600SemiBold,
  Cormorant_700Bold,
} from '@expo-google-fonts/cormorant';
import { lightTheme, darkTheme } from '../constants/theme';
import { AuthStack } from '../navigation/AuthStack';
import { MainStack } from '../navigation/MainStack';
import { useAuthStore } from '../features/authStore';
import { useProfileStore } from '../features/profileStore';
import { useThemeStore } from '../features/themeStore';
import 'react-native-gesture-handler';


const App: React.FC = () => {
  const { isAuthenticated, checkAuth, isLoading, user, justLoggedIn, clearJustLoggedIn } = useAuthStore();
  const { fetchProfile, profile } = useProfileStore();
  const { themeMode } = useThemeStore();
  const systemColorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    Cormorant_300Light,
    Cormorant_400Regular,
    Cormorant_500Medium,
    Cormorant_600SemiBold,
    Cormorant_700Bold,
  });

  useEffect(() => {
    // Ensure React Native runtime is ready
    const initApp = async () => {
      try {
        await checkAuth();
        // Small delay to ensure all modules are loaded
        setTimeout(() => {
          setIsReady(true);
        }, 100);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsReady(true); // Still allow app to render
      }
    };
    initApp();
  }, [checkAuth]); // Only run once on mount

  // Check onboarding status when app is ready and user is authenticated
  // This handles persisted sessions (user already logged in from before)
  // IMPORTANT: If user just logged in (justLoggedIn = true), skip this check
  // They should go through onboarding flow first
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Only check if:
      // 1. App is ready
      // 2. User is authenticated
      // 3. User exists
      // 4. User did NOT just log in (justLoggedIn = false) - this means persisted session
      // 5. We haven't checked onboarding yet
      if (isReady && isAuthenticated && user && !justLoggedIn && !hasCheckedOnboarding) {
        try {
          await fetchProfile(user.id);
          setHasCheckedOnboarding(true);
        } catch (error) {
          // Profile doesn't exist, user needs onboarding
          setHasCheckedOnboarding(true);
        }
      }
    };
    checkOnboardingStatus();
  }, [isReady, isAuthenticated, user, justLoggedIn, hasCheckedOnboarding, fetchProfile]);

  // Reset hasCheckedOnboarding when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasCheckedOnboarding(false);
    }
  }, [isAuthenticated]);

  // When profile is updated after onboarding, set hasCheckedOnboarding to true
  // This allows App.tsx to switch to MainStack
  useEffect(() => {
    if (isAuthenticated && user && profile && justLoggedIn) {
      // User just logged in and completed onboarding
      // Check if profile is complete
      if (
        profile.gender &&
        profile.height &&
        profile.weight &&
        profile.stylePreferences &&
        profile.stylePreferences.length > 0
      ) {
        setHasCheckedOnboarding(true);
        clearJustLoggedIn(); // Clear the flag
      }
    }
  }, [profile, isAuthenticated, user, justLoggedIn, clearJustLoggedIn]);

  // Determine if user should see MainStack or AuthStack
  // CRITICAL LOGIC:
  // 1. If user just logged in (justLoggedIn = true), ALWAYS stay in AuthStack for onboarding
  // 2. If user already logged in before (justLoggedIn = false), check profile completeness
  // 3. Only show MainStack if:
  //    - User is authenticated
  //    - User did NOT just log in (justLoggedIn = false)
  //    - We have checked onboarding status (hasCheckedOnboarding = true)
  //    - Profile is complete
  const shouldShowMainStack = isAuthenticated && 
    !justLoggedIn && // CRITICAL: Never show MainStack if user just logged in
    hasCheckedOnboarding && (
      profile?.gender &&
      profile?.height &&
      profile?.weight &&
      profile?.stylePreferences &&
      profile.stylePreferences.length > 0
    );

  const getTheme = () => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  // Show loading while checking auth, runtime not ready, or fonts not loaded
  if (isLoading || !isReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={getTheme()}>
          <NavigationContainer>
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
            {shouldShowMainStack ? <MainStack /> : <AuthStack />}
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

App.displayName = 'App';

export default App;

