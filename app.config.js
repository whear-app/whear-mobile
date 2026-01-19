// Expo config with JavaScript for dynamic configuration
// This file takes precedence over app.json

module.exports = {
  expo: {
    name: "Whear",
    slug: "whear-v2",
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
      }
    },
    // Suppress Android SDK warnings
    _internal: {
      skipAndroidSDKCheck: true,
    }
  }
};


