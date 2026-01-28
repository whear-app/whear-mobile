import { useCallback } from 'react';
import { Snackbar, useTheme } from 'react-native-paper';

let snackbarRef: Snackbar | null = null;

export const setSnackbarRef = (ref: Snackbar | null) => {
  snackbarRef = ref;
};

export const useSnackbar = () => {
  const showSnackbar = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Always log so devs can see errors even if snackbar UI isn't wired up yet.
    // (snackbarRef is currently not mounted in this app.)
    console.log(`[${type.toUpperCase()}] ${message}`);
  }, []);

  return { showSnackbar };
};




