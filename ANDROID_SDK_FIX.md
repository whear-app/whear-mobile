# Fix Android SDK Warnings

## Vấn đề

Khi chạy `npm start`, bạn thấy warnings về Android SDK:
- "Failed to resolve the Android SDK path"
- "'adb' is not recognized"

## ✅ Giải pháp nhanh: Bỏ qua warnings (Recommended)

**Các warnings này KHÔNG ảnh hưởng đến development với Expo Go!**

Expo Go không cần Android SDK để chạy. Bạn vẫn có thể:
- ✅ Scan QR code với Expo Go app
- ✅ Development bình thường
- ✅ Hot reload hoạt động

**Chỉ cần ignore warnings này và tiếp tục work!**

## Nếu muốn tắt warnings (Optional)

### Option 1: Set environment variable (Temporary - mỗi session)

**Windows PowerShell:**
```powershell
$env:ANDROID_HOME = $null
$env:ANDROID_SDK_ROOT = $null
npm start
```

**Windows CMD:**
```cmd
set ANDROID_HOME=
set ANDROID_SDK_ROOT=
npm start
```

### Option 2: Dùng Expo CLI với flags

```bash
# Start mà không check Android
npx expo start --no-dev-client
```

### Option 3: Cài Android Studio (Nếu muốn build native)

Nếu bạn muốn build Android apps native (không dùng Expo Go):

1. **Download Android Studio:** https://developer.android.com/studio
2. **Cài đặt và mở Android Studio**
3. **SDK Manager:** More Actions → SDK Manager
4. **Cài:** Android SDK Platform-Tools, Build-Tools
5. **Set Environment Variables (Permanent):**

   **PowerShell (Admin):**
   ```powershell
   # Tìm SDK path (thường là)
   # C:\Users\<YourUsername>\AppData\Local\Android\Sdk
   
   [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\LENOVO\AppData\Local\Android\Sdk', 'User')
   [System.Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', 'C:\Users\LENOVO\AppData\Local\Android\Sdk', 'User')
   
   # Add to PATH
   $currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
   $platformTools = "C:\Users\LENOVO\AppData\Local\Android\Sdk\platform-tools"
   if ($currentPath -notlike "*$platformTools*") {
       [System.Environment]::SetEnvironmentVariable('Path', "$currentPath;$platformTools", 'User')
   }
   ```

   **Restart terminal sau khi set**

6. **Verify:**
   ```powershell
   echo $env:ANDROID_HOME
   adb version
   ```

## 🎯 Recommendation

**Cho Development với Expo Go:** 
- ✅ **Bỏ qua warnings** - không cần làm gì cả
- ✅ Warnings không ảnh hưởng đến functionality
- ✅ Expo Go hoạt động hoàn toàn bình thường

**Cho Native Build:**
- ⚙️ Cài Android Studio và set environment variables như Option 3

## 📝 Lưu ý

- Warnings ≠ Errors: Warnings không ngăn app chạy
- Expo Go không cần Android SDK
- Chỉ cần Android SDK khi build native apps
- Có thể suppress warnings nhưng không bắt buộc

## 🔍 Verify Expo hoạt động

Nếu bạn thấy:
```
Metro waiting on exp://192.168.x.x:8081
```

Thì mọi thứ đã hoạt động! Warnings về Android SDK không quan trọng.


