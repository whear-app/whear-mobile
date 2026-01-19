#!/usr/bin/env node
/**
 * Script to start Expo without Android SDK warnings
 * Filters out Android SDK errors from output (for Expo Go development)
 */

const { spawn } = require('child_process');

// Get command arguments
const args = process.argv.slice(2);

// For Windows, use cmd.exe for better compatibility
const isWindows = process.platform === 'win32';
const command = isWindows ? 'npx.cmd' : 'npx';

// Patterns to filter out (Android SDK warnings)
const androidSDKPatterns = [
  /Failed to resolve the Android SDK path/i,
  /adb.*is not recognized/i,
  /ANDROID_HOME/i,
  /ANDROID_SDK_ROOT/i,
  /'adb'.*is not recognized as an internal or external command/i,
];

// Filter function to suppress Android SDK warnings
function shouldSuppressLine(line) {
  return androidSDKPatterns.some(pattern => pattern.test(line));
}

// Start Expo with filtered output
const expoProcess = spawn(command, ['expo', 'start', ...args], {
  stdio: ['inherit', 'pipe', 'pipe'], // stdin inherit, stdout/stderr pipe for filtering
  env: process.env,
  shell: !isWindows,
  windowsVerbatimArguments: false,
});

// Filter stdout
expoProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (!shouldSuppressLine(line)) {
      process.stdout.write(line + '\n');
    }
  });
});

// Filter stderr (where Android SDK errors typically appear)
expoProcess.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (!shouldSuppressLine(line)) {
      process.stderr.write(line + '\n');
    }
  });
});

expoProcess.on('error', (error) => {
  // Suppress Android SDK related spawn errors
  if (error.message && (error.message.includes('adb') || error.message.includes('ANDROID'))) {
    // These errors are OK for Expo Go - just continue silently
    return;
  }
  // Other errors should be shown
  console.error('Error:', error.message);
});

expoProcess.on('exit', (code) => {
  // Exit with code 0 even if Android SDK warnings occurred
  // Only fail on actual errors (code !== 0 && not related to Android SDK)
  process.exit(code || 0);
});

