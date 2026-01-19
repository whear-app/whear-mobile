/**
 * Script to check if Android SDK is available
 * Suppresses Android SDK errors if not available (for Expo Go development)
 */

// Only check Android SDK if explicitly requested via --check-android flag
if (process.argv.includes('--check-android')) {
  const { execSync } = require('child_process');
  try {
    execSync('adb version', { stdio: 'ignore' });
    process.exit(0);
  } catch (e) {
    // Android SDK not available - this is OK for Expo Go
    process.exit(0);
  }
}


