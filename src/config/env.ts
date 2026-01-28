import Constants from 'expo-constants';

type Extra = {
  googleWebClientId?: string;
  googleUseProxy?: string;
  expoProjectFullName?: string;
};

function getExtra(): Extra {
  // expo-constants supports both expoConfig (new) and manifest2 (older runtimes)
  const expoConfig = (Constants as any)?.expoConfig;
  const manifest2 = (Constants as any)?.manifest2;
  const extra = expoConfig?.extra ?? manifest2?.extra ?? {};
  return extra as Extra;
}

const extra = getExtra();

export const ENV = {
  googleWebClientId: extra.googleWebClientId ?? '',
  googleUseProxy: (extra.googleUseProxy ?? 'true') !== 'false',
  expoProjectFullName: extra.expoProjectFullName ?? '',
} as const;

export function assertEnv() {
  if (!ENV.googleWebClientId) {
    throw new Error(
      'Missing Google client id. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env (see ENV.md).'
    );
  }
}


