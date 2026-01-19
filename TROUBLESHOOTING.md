# Troubleshooting Guide

## Android SDK Path Errors

### Lỗi: "Failed to resolve the Android SDK path"

Lỗi này xuất hiện khi Expo không tìm thấy Android SDK. **Đây không phải lỗi nghiêm trọng** nếu bạn chỉ dùng Expo Go để development.

### Giải pháp:

#### Option 1: Bỏ qua (Recommended cho Expo Go Development)

Nếu bạn chỉ develop với Expo Go (scan QR code), có thể bỏ qua lỗi này. Expo Go không cần Android SDK.

#### Option 2: Cài đặt Android Studio (Cần cho Native Build)

Nếu muốn build Android apps hoặc chạy trên emulator:

1. **Cài Android Studio:**
   - Download từ: https://developer.android.com/studio
   - Cài đặt và mở Android Studio
   - Chọn "More Actions" → "SDK Manager"
   - Cài "Android SDK Platform-Tools" và "Android SDK Build-Tools"

2. **Set Environment Variables (Windows):**

   Mở PowerShell as Administrator:
   ```powershell
   # Tìm Android SDK path (thường là)
   # C:\Users\<YourUsername>\AppData\Local\Android\Sdk
   
   # Set user environment variable
   [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\LENOVO\AppData\Local\Android\Sdk', 'User')
   [System.Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', 'C:\Users\LENOVO\AppData\Local\Android\Sdk', 'User')
   
   # Add to PATH
   $currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
   $newPath = "$currentPath;C:\Users\LENOVO\AppData\Local\Android\Sdk\platform-tools"
   [System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
   ```

   Sau đó restart terminal/PowerShell.

3. **Verify:**
   ```powershell
   echo $env:ANDROID_HOME
   adb version
   ```

#### Option 3: Chỉ định path trong app.json (Temporary)

Không khuyến khích, nhưng có thể set trong code nếu cần.

### Lỗi: "'adb' is not recognized"

Lỗi này xuất hiện vì `adb` (Android Debug Bridge) không có trong PATH.

**Giải pháp:** Làm theo Option 2 ở trên để cài Android SDK Platform-Tools.

**Lưu ý:** Nếu chỉ dùng Expo Go, không cần fix lỗi này.

## Update Expo Packages

### Lỗi: "The following packages should be updated"

Chạy lệnh sau để update:

```bash
npm install expo@~54.0.31 expo-constants@~18.0.13
```

Hoặc:

```bash
npx expo install expo@latest expo-constants@latest
```

## Metro Bundler Warnings

### "Using src/app as the root directory for Expo Router"

Nếu bạn không dùng Expo Router, có thể bỏ qua warning này. Đây chỉ là warning, không phải lỗi.

## Common Issues

### 1. Expo Go không connect được

```bash
# Reset Metro cache
npm start -- --reset-cache
```

### 2. Packages không tương thích

```bash
# Check và fix compatibility
npx expo install --fix
```

### 3. Node modules issues

```bash
# Clean install
rm -rf node_modules
npm install
```

### 4. Build fails

```bash
# Clear Expo cache
npx expo start --clear
```

## Quick Fixes

```bash
# Update all Expo packages to compatible versions
npx expo install --fix

# Clear all caches
npm start -- --clear
# hoặc
npx expo start --clear --reset-cache
```

## Development vs Production

- **Development với Expo Go:** Không cần Android SDK
- **Build Native Apps:** Cần Android Studio + Android SDK
- **iOS Development:** Cần Mac + Xcode (không thể develop trên Windows)

## Still Having Issues?

1. Check Expo version: `npx expo --version`
2. Check Node version: `node --version` (cần 18+)
3. Clear cache: `npm start -- --clear`
4. Reinstall: `rm -rf node_modules && npm install`


