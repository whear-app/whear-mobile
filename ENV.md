# Environment setup

Create either a `.env` file **or** an `env.local` file at the project root (same level as `package.json`) with:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_GOOGLE_USE_PROXY=true
EXPO_PUBLIC_EXPO_PROJECT_FULL_NAME=@your-expo-username/whear-v2
```

Notes:
- `.env` and `env.local` are gitignored.
- `env.example` is normally just a template; however this project will also read `env.example` as a **last fallback** to reduce setup friction.
- For Expo Go with `expo-auth-session`, using the **Web** client id + proxy is the simplest setup.
- Docs: `https://docs.expo.dev/versions/latest/sdk/auth-session/`


