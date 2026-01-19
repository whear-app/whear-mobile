# Hướng dẫn Fix Google OAuth Error 400: invalid_request

## Vấn đề
Khi bấm "Đăng nhập với Google", bạn thấy lỗi:
- **"Access blocked: Authorization error"**
- **Error 400: invalid_request**

Nguyên nhân: Redirect URI không khớp với Google Console.

## Bước 1: Lấy Redirect URI từ App

1. **Mở Metro console** (terminal chạy `npm start`)
2. **Bấm nút "Đăng nhập với Google"** trong app
3. **Tìm log** có dạng:
   ```
   [GOOGLE_AUTH] Redirect URI: https://auth.expo.io/@your-username/whear-v2
   ```
4. **Copy URI này** (ví dụ: `https://auth.expo.io/@your-username/whear-v2`)

## Bước 2: Thêm Redirect URI vào Google Console

### 2.1. Truy cập Google Cloud Console
1. Vào: https://console.cloud.google.com/
2. Chọn project của bạn (hoặc tạo mới)
3. Vào **APIs & Services** > **Credentials**

### 2.2. Tìm OAuth 2.0 Client ID (Web)
1. Tìm client ID có **Type = "Web application"**
2. Client ID của bạn: `281953107236-e6rb6kh021dojjbg6dtmfkkb30kb3eh1.apps.googleusercontent.com`
3. **Click vào client ID** để edit

### 2.3. Thêm Authorized redirect URIs
1. Scroll xuống phần **"Authorized redirect URIs"**
2. Click **"+ ADD URI"**
3. Paste URI bạn copy từ Metro console (ví dụ):
   ```
   https://auth.expo.io/@your-username/whear-v2
   ```
4. **Lưu ý**: URI phải khớp **chính xác** (không có trailing slash, không có query params)
5. Click **"SAVE"**

### 2.4. Kiểm tra OAuth Consent Screen
1. Vào **APIs & Services** > **OAuth consent screen**
2. Đảm bảo:
   - **User Type**: External (hoặc Internal nếu dùng Google Workspace)
   - **App name**: Whear (hoặc tên bạn muốn)
   - **Scopes**: `openid`, `profile`, `email` (đã được thêm tự động)
   - **Test users**: Nếu app ở chế độ Testing, thêm email của bạn vào "Test users"

## Bước 3: Restart App

1. **Stop Metro** (Ctrl+C)
2. **Restart lại**:
   ```bash
   npm start -- --clear
   ```
3. **Reload app** trong Expo Go
4. **Thử lại** "Đăng nhập với Google"

## Bước 4: Nếu vẫn lỗi

### Kiểm tra Client ID Type
- ✅ **PHẢI DÙNG**: Web application client ID
- ❌ **KHÔNG DÙNG**: iOS client ID hoặc Android client ID

### Kiểm tra Redirect URI Format
Với Expo Go + AuthSession proxy, redirect URI sẽ có dạng:
```
https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_APP_SLUG
```

Trong đó:
- `YOUR_EXPO_USERNAME`: Username Expo của bạn (xem trong `package.json` hoặc Expo account)
- `YOUR_APP_SLUG`: Giá trị `slug` trong `app.config.js` (hiện tại là `whear-v2`)

### Debug Redirect URI
Nếu không thấy log `[GOOGLE_AUTH] Redirect URI`, thêm vào `src/hooks/useGoogleAuth.ts`:
```typescript
console.log('Redirect URI:', redirectUri);
```

## Lưu ý quan trọng

1. **Redirect URI phải khớp chính xác** (case-sensitive, không có trailing slash)
2. **Chỉ dùng Web client ID** cho Expo Go
3. **Nếu app ở chế độ Testing**, bạn phải thêm email vào "Test users"
4. **Sau khi thêm redirect URI**, có thể mất vài phút để Google cập nhật

## Tài liệu tham khảo

- Expo AuthSession: https://docs.expo.dev/versions/latest/sdk/auth-session/
- Google OAuth Setup: https://developers.google.com/identity/protocols/oauth2

