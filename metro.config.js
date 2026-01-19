// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Suppress Android SDK warnings (not needed for Expo Go)
config.watchFolders = config.watchFolders || [];
config.server = config.server || {};

module.exports = config;


