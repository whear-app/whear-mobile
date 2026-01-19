#!/usr/bin/env node
/**
 * Monkey patch to suppress Android SDK warnings from Expo CLI
 * This allows development with Expo Go without Android SDK installed
 */

// This will be loaded by Expo CLI to suppress warnings
// Not a perfect solution but works for most cases

// Override console methods to filter Android SDK warnings
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

const androidSDKWarnings = [
  'Failed to resolve the Android SDK path',
  'adb is not recognized',
  'ANDROID_HOME',
  'ANDROID_SDK_ROOT',
];

function shouldSuppress(message) {
  if (typeof message !== 'string') return false;
  return androidSDKWarnings.some(warning => 
    message.includes(warning)
  );
}

console.warn = function(...args) {
  if (!shouldSuppress(args[0])) {
    originalConsoleWarn.apply(console, args);
  }
};

console.error = function(...args) {
  if (!shouldSuppress(args[0])) {
    originalConsoleError.apply(console, args);
  }
};

// Also suppress uncaught exceptions for adb errors
process.on('uncaughtException', (error) => {
  if (error.message && error.message.includes('adb')) {
    // Suppress adb errors - they're not critical for Expo Go
    return;
  }
  throw error;
});

module.exports = {};


