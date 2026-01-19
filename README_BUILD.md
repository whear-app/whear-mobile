# Build Native Apps Guide

Hướng dẫn build Android và iOS apps từ Expo project này.

## 🎯 Tổng Quan

Dự án này hỗ trợ 2 cách build:

1. **Expo Workflow** (Managed) - Development nhanh với Expo Go
2. **Bare Workflow** (Prebuild) - Build native code để deploy production

## 📋 Yêu Cầu

### Cho Android:
- Node.js 18+
- Java JDK 17+
- Android Studio
- Android SDK
- Gradle

### Cho iOS:
- Mac OS X
- Xcode 14+
- CocoaPods (`sudo gem install cocoapods`)

## 🚀 Quick Start

### 1. Development với Expo (Recommended)

```bash
# Cài đặt dependencies
npm install

# Chạy với Expo Go
npm start

# Hoặc chạy trực tiếp
npm run android  # Android
npm run ios      # iOS
```

### 2. Tạo Native Code (Prebuild)

Lần đầu tiên hoặc khi cần tạo lại native code:

```bash
# Tạo cả Android và iOS
npm run prebuild

# Chỉ Android
npm run prebuild:android

# Chỉ iOS  
npm run prebuild:ios

# Clean và tạo lại
npm run prebuild:clean
```

Sau lệnh này, bạn sẽ có:
- `android/` - Android Studio project
- `ios/` - Xcode project

### 3. Build Production Apps

#### Android (APK)

```bash
# Build Release APK
npm run build:android

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

Hoặc mở `android/` trong Android Studio và build từ IDE.

#### Android (AAB - Play Store)

```bash
cd android
./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

#### iOS (Xcode)

1. Mở `ios/Whear.xcworkspace` trong Xcode
2. Chọn device/simulator
3. Product → Archive
4. Distribute App

Hoặc command line:

```bash
npm run build:ios
```

## 📱 Build Commands

```bash
# Prebuild
npm run prebuild              # Tạo native code
npm run prebuild:clean        # Clean và tạo lại
npm run prebuild:android      # Chỉ Android
npm run prebuild:ios          # Chỉ iOS

# Build
npm run build:android         # Build Android Release APK
npm run build:android:debug   # Build Android Debug APK
npm run build:ios             # Build iOS (cần Mac)

# Run
npm run run:android           # Chạy Android
npm run run:ios               # Chạy iOS
npm run run:ios:simulator     # Chạy iOS simulator
```

## ⚙️ Configuration

Tất cả cấu hình native nằm trong `app.json`:

- `android.package` - Android package name
- `ios.bundleIdentifier` - iOS bundle ID
- `plugins` - Expo plugins sẽ tự động configure

Sau khi thay đổi `app.json`, chạy lại `prebuild` để apply.

## 🔧 Customization

### Thêm Native Dependencies

1. Cài package: `npm install <package>`
2. Nếu cần native code, chạy: `npm run prebuild`
3. Cấu hình trong `app.json` nếu cần

### Tùy chỉnh Native Code

Bạn có thể chỉnh sửa trực tiếp:
- `android/app/src/main/` - Android source
- `ios/Whear/` - iOS source

**⚠️ Lưu ý:** Khi chạy `prebuild:clean`, code đã chỉnh sửa sẽ bị ghi đè.

### Git Management

Mặc định `android/` và `ios/` được ignore vì có thể generate lại.

Nếu bạn đã customize nhiều và muốn commit:
```bash
# Sửa .gitignore, bỏ comment:
# android/
# ios/

# Commit
git add android/ ios/
git commit -m "Add customized native code"
```

## 🐛 Troubleshooting

### Prebuild lỗi

```bash
# Clean và rebuild
rm -rf android ios
npm run prebuild:clean
```

### Android build fail

```bash
cd android
./gradlew clean
cd ..
npm run prebuild:android
```

### iOS build fail

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run prebuild:ios
```

### Module not found

```bash
# Clean và reinstall
rm -rf node_modules
npm install
npm run prebuild
```

## 📦 Deployment

### Android - Play Store

1. Build AAB:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. Upload `app-release.aab` lên Google Play Console

### iOS - App Store

1. Mở `ios/Whear.xcworkspace` trong Xcode
2. Product → Archive
3. Distribute App → App Store Connect
4. Follow Xcode wizard

## 🌐 EAS Build (Cloud Build - Recommended)

EAS Build tự động build trên cloud, không cần Android Studio/Xcode:

```bash
# Install
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build
eas build --platform android
eas build --platform ios
eas build --platform all
```

EAS Build tự động prebuild và build, phù hợp cho CI/CD.

## 📚 Resources

- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Android Build Guide](https://reactnative.dev/docs/signed-apk-android)
- [iOS Build Guide](https://reactnative.dev/docs/publishing-to-app-store)

## 🎉 Done!

Bây giờ bạn có thể:
- ✅ Develop với Expo (nhanh)
- ✅ Build native apps (production)
- ✅ Deploy lên stores
- ✅ Tùy chỉnh native code khi cần

Lưu ý: Expo vẫn hoạt động bình thường. Bạn có thể chuyển đổi giữa Expo workflow và native builds bất cứ lúc nào!


