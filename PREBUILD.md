# Expo Prebuild Guide

Dự án này sử dụng Expo Prebuild để tạo native code (Android/iOS) từ Expo config, cho phép bạn:

- ✅ Vẫn giữ được Expo SDK và development workflow
- ✅ Build trực tiếp Android/iOS apps không cần Expo Go
- ✅ Tùy chỉnh native code khi cần
- ✅ Deploy lên App Store / Play Store dễ dàng hơn

## Workflow

### 1. Development với Expo (Recommended)

```bash
# Chạy với Expo Go (như bình thường)
npm start

# Hoặc
npm run android
npm run ios
```

### 2. Tạo Native Code lần đầu

```bash
# Tạo cả Android và iOS
npm run prebuild

# Chỉ tạo Android
npm run prebuild:android

# Chỉ tạo iOS
npm run prebuild:ios

# Tạo lại từ đầu (clean)
npm run prebuild:clean
```

Sau khi chạy `prebuild`, bạn sẽ có:
- `android/` folder - Android native project
- `ios/` folder - iOS native project

### 3. Build Native Apps

#### Android

```bash
# Build Release APK
npm run build:android

# Build Debug APK
npm run build:android:debug

# Hoặc chạy trực tiếp trên device/emulator
npm run run:android
```

APK sẽ nằm tại: `android/app/build/outputs/apk/release/app-release.apk`

#### iOS

```bash
# Build với Xcode (cần Mac)
npm run build:ios

# Chạy trên simulator
npm run run:ios:simulator

# Hoặc chạy trực tiếp
npm run run:ios
```

### 4. Development với Native Code

Sau khi prebuild, bạn có thể:

**Vẫn dùng Expo:**
```bash
npm start
```

**Hoặc dùng React Native CLI:**
```bash
# Android
npm run run:android

# iOS
npm run run:ios
```

### 5. Tùy chỉnh Native Code

Bạn có thể chỉnh sửa trực tiếp trong:
- `android/` - Android native code
- `ios/` - iOS native code

**Lưu ý quan trọng:**
- Nếu chạy `prebuild:clean`, native code đã chỉnh sửa sẽ bị ghi đè
- Nên commit native code vào git nếu bạn đã customize nhiều
- Hoặc sử dụng Expo config plugins để tự động hóa

### 6. Git Management

Thư mục `android/` và `ios/` đã được thêm vào `.gitignore` vì:
- Chúng có thể được generate lại từ `app.json`
- Kích thước lớn

Nếu bạn muốn commit native code (sau khi customize), bỏ comment trong `.gitignore`:

```
# android/
# ios/
```

## Best Practices

1. **Development:** Sử dụng Expo (`npm start`) cho nhanh
2. **Build:** Sử dụng prebuild khi cần customize hoặc build production
3. **Testing:** Test trên cả Expo Go và native builds
4. **Deployment:** Build native apps cho App Store / Play Store

## Troubleshooting

### Prebuild bị lỗi
```bash
# Clean và rebuild
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
pod install
cd ..
npm run prebuild:ios
```

## EAS Build (Alternative)

Bạn cũng có thể sử dụng EAS Build để build trên cloud:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build --platform android
eas build --platform ios
```

EAS Build sẽ tự động prebuild và build app trên cloud, không cần setup Android Studio / Xcode.


