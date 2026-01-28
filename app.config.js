// Expo config with JavaScript for dynamic configuration
// This file takes precedence over app.json

// Load env values (do NOT commit secrets)
// Prefer `.env`, but also support `env.local` (useful when dotfiles are blocked by tooling).
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const root = __dirname;
const dotenvPath = path.join(root, '.env');
const envLocalPath = path.join(root, 'env.local');
const envExamplePath = path.join(root, 'env.example');

if (fs.existsSync(dotenvPath)) {
  dotenv.config({ path: dotenvPath });
} else if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envExamplePath)) {
  // Convenience fallback (not recommended for real secrets)
  // This helps local dev when dotfiles are blocked by tooling.
  dotenv.config({ path: envExamplePath });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[config] No .env or env.local found. Google Auth may be disabled until you add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.'
  );
}

const EXPO_OWNER = process.env.EXPO_PUBLIC_EXPO_OWNER || '';
const EXPO_SLUG = 'whear-v2';

module.exports = {
  expo: {
    name: "Whear",
    slug: EXPO_SLUG,
    // Recommended for AuthSession proxy redirect URI (https://auth.expo.io/@owner/slug)
    // This should be your Expo account username (owner), NOT your app name.
    owner: EXPO_OWNER || undefined,
    // Recommended for deep linking / auth redirects in production builds
    scheme: "whear",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    splash: {
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.whear.app",
      buildNumber: "1"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      package: "com.whear.app",
      versionCode: 1
    },
    web: {},
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to add items to your closet."
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "The app uses your location to provide weather context for outfit suggestions."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: ""
      },
      // Env-driven config (see .env.example)
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
      googleUseProxy: process.env.EXPO_PUBLIC_GOOGLE_USE_PROXY || "true",
      // Prefer explicit full name. Otherwise derive from EXPO_PUBLIC_EXPO_OWNER + slug.
      // Format must be: @owner/slug
      expoProjectFullName:
        process.env.EXPO_PUBLIC_EXPO_PROJECT_FULL_NAME ||
        (EXPO_OWNER ? `@${EXPO_OWNER}/${EXPO_SLUG}` : "")
    },
    // Suppress Android SDK warnings
    _internal: {
      skipAndroidSDKCheck: true,
    }
  }
};


