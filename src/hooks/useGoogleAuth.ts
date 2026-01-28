import { useCallback, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ROUTES } from '../constants/routes';
import { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../features/authStore';
import { useSnackbar } from './useSnackbar';
import { ENV, assertEnv } from '../config/env';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

type UseGoogleAuthResult = {
  isReady: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  authorizationCode: string | null;
  codeVerifier: string | null;
};

// IMPORTANT: For Expo Go, you MUST use Authorization Code flow (not Implicit flow)
// Implicit flow doesn't work reliably with Expo's auth proxy
const USE_CODE_FLOW = true;

export function useGoogleAuth(): UseGoogleAuthResult {
  const navigation = useNavigation<NavigationProp>();
  const { loginWithGoogle, isLoading: isAuthStoreLoading } = useAuthStore();
  const { showSnackbar } = useSnackbar();
  const [isProcessing, setIsProcessing] = useState(false);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);

  // Generate redirect URI using Expo's standard method
  // In Expo Go, this returns exp://... which needs to use the auth proxy
  // In dev builds/standalone, this uses the custom scheme from app.config.js
  const redirectUri = AuthSession.makeRedirectUri();

  // Check if we need to use the Expo auth proxy
  // Expo Go uses exp:// scheme which requires the proxy
  const needsProxy = redirectUri.startsWith('exp://');

  // For the actual OAuth request, we need to use the proxy URL when in Expo Go
  // Manually construct the proxy URL from ENV to avoid projectNameForProxy requirement
  const proxyRedirectUri = needsProxy && ENV.expoProjectFullName
    ? `https://auth.expo.io/${ENV.expoProjectFullName}`
    : redirectUri;

  const finalRedirectUri = proxyRedirectUri;

  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

  // Log redirect URI for Google Console setup (only in dev)
  useEffect(() => {
    if (__DEV__) {
      console.log(
        `[GOOGLE_AUTH] ==================== SETUP INFO ====================\n` +
        `[GOOGLE_AUTH] Flow: Authorization Code with PKCE\n` +
        `[GOOGLE_AUTH] Redirect URI: ${finalRedirectUri}\n` +
        `[GOOGLE_AUTH] =====================================================\n` +
        `[GOOGLE_AUTH] ⚠️  IMPORTANT - ADD TO GOOGLE CONSOLE:\n` +
        `[GOOGLE_AUTH] 1. Go to: https://console.cloud.google.com/apis/credentials\n` +
        `[GOOGLE_AUTH] 2. Edit your WEB client ID (not Android/iOS)\n` +
        `[GOOGLE_AUTH] 3. Add BOTH of these to "Authorized redirect URIs":\n` +
        `[GOOGLE_AUTH]    - ${finalRedirectUri}\n` +
        `[GOOGLE_AUTH]    - ${finalRedirectUri}/\n` +
        `[GOOGLE_AUTH] 4. If OAuth is in Testing mode, add your email to Test Users\n` +
        `[GOOGLE_AUTH] 5. Wait 5-10 minutes after saving changes\n` +
        `[GOOGLE_AUTH] =====================================================`
      );
    }
  }, [finalRedirectUri]);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: ENV.googleWebClientId,
      redirectUri: finalRedirectUri,
      scopes: ['openid', 'profile', 'email'],
      // Use Authorization Code flow for better compatibility with Expo Go
      responseType: 'code',
      // Enable PKCE for security
      usePKCE: true,
      // Add extra params for better compatibility
      extraParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
    discovery
  );

  // Store code verifier when request is created (for code flow)
  useEffect(() => {
    if (request && (request as any).codeVerifier) {
      const verifier = (request as any).codeVerifier;
      setCodeVerifier(verifier);
      if (__DEV__) {
        console.log('[GOOGLE_AUTH] 🔑 Code verifier stored (truncated):', `${verifier.slice(0, 12)}...`);
      }
    }
  }, [request]);

  // Validate environment on mount
  useEffect(() => {
    try {
      assertEnv();
    } catch (e) {
      showSnackbar((e as Error).message, 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exchange authorization code for access token
  const exchangeCodeForToken = async (code: string, verifier: string | null) => {
    if (!discovery?.tokenEndpoint) {
      throw new Error('Token endpoint not available');
    }

    if (__DEV__) {
      console.log('[GOOGLE_AUTH] 🔄 Exchanging code for token...');
      console.log('[GOOGLE_AUTH] Token endpoint:', discovery.tokenEndpoint);
      console.log('[GOOGLE_AUTH] Code (truncated):', `${code.slice(0, 12)}...`);
      console.log('[GOOGLE_AUTH] Code verifier present:', !!verifier);
      console.log('[GOOGLE_AUTH] Redirect URI:', redirectUri);
    }

    const params = new URLSearchParams({
      client_id: ENV.googleWebClientId,
      code,
      redirect_uri: finalRedirectUri,
      grant_type: 'authorization_code',
    });

    // Add code verifier for PKCE flow
    if (verifier) {
      params.append('code_verifier', verifier);
    }

    const response = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GOOGLE_AUTH] ❌ Token exchange failed:', errorText);

      // Parse error for better debugging
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Token exchange failed: ${errorJson.error_description || errorJson.error || errorText}`);
      } catch (e) {
        throw new Error(`Token exchange failed: ${errorText}`);
      }
    }

    return response.json();
  };

  // Handle auth response from Google
  useEffect(() => {
    const handleAuthResponse = async () => {
      if (!response) return;

      if (__DEV__) {
        console.log('[GOOGLE_AUTH] 📨 Received response type:', response.type);
      }

      if (response.type === 'error') {
        console.error('[GOOGLE_AUTH] ❌ Auth error:', response.error);
        console.error('[GOOGLE_AUTH] Error params:', response.params);
        showSnackbar(
          response.error?.message || 'Google authentication failed',
          'error'
        );
        setIsProcessing(false);
        return;
      }

      if (response.type === 'cancel') {
        console.log('[GOOGLE_AUTH] ℹ️  User cancelled authentication');
        setIsProcessing(false);
        return;
      }

      if (response.type !== 'success') {
        console.log('[GOOGLE_AUTH] ℹ️  Unexpected response type:', response.type);
        setIsProcessing(false);
        return;
      }

      try {
        setIsProcessing(true);
        assertEnv();

        if (__DEV__) {
          console.log('[GOOGLE_AUTH] ✅ Auth success! Processing...');
          console.log('[GOOGLE_AUTH] Response params keys:', Object.keys(response.params));
        }

        let accessToken: string;

        // Handle Authorization Code flow
        if (response.params.code) {
          const code = response.params.code;
          setAuthorizationCode(code);

          if (__DEV__) {
            console.log('[GOOGLE_AUTH] 🔐 Authorization code received (truncated):', `${code.slice(0, 12)}...`);
          }

          // Exchange code for token
          const tokenResponse = await exchangeCodeForToken(code, codeVerifier);
          accessToken = tokenResponse.access_token;

          if (__DEV__) {
            console.log('[GOOGLE_AUTH] ✅ Token exchange successful');
            console.log('[GOOGLE_AUTH] Token type:', tokenResponse.token_type);
            console.log('[GOOGLE_AUTH] Expires in:', tokenResponse.expires_in);
          }
        }
        // Handle Implicit flow (fallback)
        else if (response.params.access_token) {
          accessToken = response.params.access_token;
          if (__DEV__) {
            console.log('[GOOGLE_AUTH] ✅ Access token from implicit flow (truncated):', `${accessToken.slice(0, 12)}...`);
          }
        }
        else {
          throw new Error('Google login failed: no authorization code or access token in response');
        }

        if (!accessToken) {
          throw new Error('Failed to obtain access token');
        }

        if (__DEV__) {
          console.log('[GOOGLE_AUTH] 📡 Fetching user info from Google...');
        }

        // Fetch user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text();
          console.error('[GOOGLE_AUTH] ❌ Failed to fetch user info:', errorText);
          throw new Error('Failed to fetch Google user info');
        }

        const userInfo = await userInfoResponse.json();

        if (__DEV__) {
          console.log('[GOOGLE_AUTH] ✅ Google userInfo:', {
            sub: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            email_verified: userInfo.email_verified,
          });
        }

        // Login with Google (this will create/update user in backend)
        if (__DEV__) {
          console.log('[GOOGLE_AUTH] 🔄 Calling loginWithGoogle...');
        }

        await loginWithGoogle({
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name || userInfo.email,
          accessToken,
        });

        if (__DEV__) {
          console.log('[GOOGLE_AUTH] ✅ loginWithGoogle completed successfully');
        }

        // Show success message
        showSnackbar('Successfully signed in with Google', 'success');

        // Navigate to onboarding flow
        navigation.navigate(ROUTES.ONBOARDING_FLOW);

      } catch (error) {
        console.error('[GOOGLE_AUTH] ❌ Error processing Google auth:', error);

        // More detailed error logging
        if (error instanceof Error) {
          console.error('[GOOGLE_AUTH] Error message:', error.message);
          console.error('[GOOGLE_AUTH] Error stack:', error.stack);
        }

        showSnackbar(
          (error as Error).message || 'Failed to sign in with Google',
          'error'
        );
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthResponse();
  }, [response, loginWithGoogle, navigation, showSnackbar, codeVerifier, redirectUri]);

  const signInWithGoogle = useCallback(async () => {
    try {
      assertEnv();

      if (!discovery) {
        throw new Error('Google auth is not ready yet (discovery not loaded). Please try again.');
      }

      if (!finalRedirectUri) {
        throw new Error(
          'Cannot determine redirect URI. Make sure you have set up your app.config.js correctly with owner and slug, then restart Metro with --clear.'
        );
      }

      if (needsProxy && !ENV.expoProjectFullName) {
        throw new Error(
          'Cannot use AuthSession proxy: EXPO_PUBLIC_EXPO_PROJECT_FULL_NAME is not set in .env.local. ' +
          'Please set it to @owner/slug (e.g., @tunmse161130/whear-v2) and restart Metro with --clear.'
        );
      }

      if (!request) {
        throw new Error(
          'Google auth is not ready yet. Make sure you created a `.env` file (NOT env.example) and restarted Metro with `--clear`.'
        );
      }

      // Debug: Show the redirect URI that will be sent to Google
      if (__DEV__) {
        console.log('[GOOGLE_AUTH] ==================== AUTH START ====================');
        console.log('[GOOGLE_AUTH] Flow: Authorization Code with PKCE');
        console.log('[GOOGLE_AUTH] Redirect URI:', finalRedirectUri);
        console.log('[GOOGLE_AUTH] Client ID (truncated):', `${ENV.googleWebClientId.slice(0, 20)}...`);
        console.log('[GOOGLE_AUTH] ⚠️  Make sure this URI is in Google Console!');
        console.log('[GOOGLE_AUTH] ========================================================');
      }

      // Reset states before new auth attempt
      setAuthorizationCode(null);
      setIsProcessing(true);

      // Trigger the auth flow
      const result = await promptAsync({
        showInRecents: true,
      });

      if (__DEV__) {
        console.log('[GOOGLE_AUTH] 📥 promptAsync result type:', result.type);
      }

      // If user cancels or there's an error, reset processing state
      // Success case is handled in the useEffect above
      if (result.type !== 'success') {
        setIsProcessing(false);
      }

    } catch (e) {
      console.error('[GOOGLE_AUTH] ❌ Error starting Google auth:', e);

      if (e instanceof Error) {
        console.error('[GOOGLE_AUTH] Error details:', e.message);
      }

      setIsProcessing(false);
      showSnackbar(
        (e as Error).message || 'Failed to start Google authentication',
        'error'
      );
    }
  }, [
    promptAsync,
    request,
    showSnackbar,
    discovery,
    finalRedirectUri,
  ]);

  // Combine all loading states
  const isLoading = isProcessing || isAuthStoreLoading;

  return {
    isReady: !!request && !!discovery,
    isLoading,
    signInWithGoogle,
    authorizationCode,
    codeVerifier,
  };
}