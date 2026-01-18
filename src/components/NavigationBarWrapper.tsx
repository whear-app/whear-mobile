import React from 'react';
import { useNavigationState } from '@react-navigation/native';
import { BottomNavigationBar } from './BottomNavigationBar';
import { ROUTES } from '../constants/routes';

// Routes where navbar should be hidden
const HIDDEN_ROUTES = [
  ROUTES.WEAR_TODAY,
  ROUTES.ONBOARDING_FLOW,
  ROUTES.ONBOARDING,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.VERIFY_ACCOUNT,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  'HomeTab', // Hide on WearTodayScreen (HomeTab)
];

export const NavigationBarWrapper: React.FC = () => {
  // Get current route name from navigation state
  const currentRouteName = useNavigationState((state) => {
    if (!state) return null;
    
    // Helper to get the deepest route name
    const getActiveRouteName = (navState: any): string | null => {
      if (!navState) return null;
      
      // If we have routes array, get the active route
      if (navState.routes && navState.routes.length > 0) {
        const activeRoute = navState.routes[navState.index ?? navState.routes.length - 1];
        
        // If this route has nested state, recurse
        if (activeRoute.state) {
          return getActiveRouteName(activeRoute.state);
        }
        
        return activeRoute.name;
      }
      
      return navState.routeName || null;
    };
    
    return getActiveRouteName(state);
  });

  // Hide navbar for specific routes
  if (!currentRouteName || HIDDEN_ROUTES.includes(currentRouteName as any)) {
    return null;
  }

  return <BottomNavigationBar currentRouteName={currentRouteName} />;
};

