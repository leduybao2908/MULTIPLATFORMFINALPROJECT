This is an Expo/React Native mobile shop app. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing code that touches an Expo, EAS, or React Native API:

1. Read the `expo` version in `package.json` (current: ~58.0.23, React 19 / RN 0.88).
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v58.0.0/`.
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Uses `bun` with `package-lock.json` — use `npx` (not `bunx`) and `bun add`/`bunx` for other packages:

```bash
bun add <package>          # install (keeps package-lock.json)
bunx expo install <package>  # ALWAYS use this instead of `bun add` for expo/* or react-native* — resolves SDK-compatible versions
bun start                  # start the Metro dev server
bun android                # start on Android
bun ios                    # start on iOS
bun tsc --noEmit           # typecheck
```

There are no dedicated `lint`, `test`, or `typecheck` scripts — lint and typecheck are run via `expo lint` (the Expo CLI linter) and `tsc --noEmit` directly.

## Architecture / navigation

**This app does not use Expo Router.** Navigation is React Navigation:

- `App.tsx` → `AuthProvider` → `MainTabs` (root navigator).
- Routes live in `src/navigation/` (`MainTabs.tsx`, `ShopStack.tsx`, `ChatStack.tsx`, `AccountStack.tsx`) as stack/tab navigators.
- Screens live in `src/screens/`, components in `src/components/`, context in `src/context/`, services in `src/service/`, types in `src/types/`, utils in `src/utils/`.
- Import `Link`/`router` from `@react-navigation/native` and use `NavigationContainer` / `createNativeStackNavigator` / `createBottomTabNavigator`.
- Entry points: `index.ts` (Expo root component) and `App.tsx`.

## State / auth

- Auth via Firebase: `src/context/AuthContext.tsx` exposes `{ user, role, loading, login, register, logout }`.
- `role` is `guest` / `buyer` / `seller` / `admin`. The `Chat` and `Notifications` tabs are gated behind login (`LoginRequired` component) via `role === 'guest'`.
- User profile is stored in Firestore `users/{uid}` with fields `role`, `sellerStatus`, `isBanned`. `isBanned` triggers an immediate `signOut` via the realtime listener.
- When adding role-based guards, gate on `useAuth().role === 'guest'` the same way `MainTabs` does.

## Firebase / environment

Firebase config is loaded from `EXPO_PUBLIC_*` env vars in `src/service/firebase.ts`:

```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

Create a `.env` file with these values before the first build/run. `AsyncStorage` persistence is wrapped in try/catch to tolerate hot-reload failures.

## Building

No `ios/` or `android/` yet — Continuous Native Generation creates them on first build. After adding a library with native code, you need a dev build:

```bash
bunx expo run:ios   # or
bunx expo run:android
```

EAS for cloud builds and OTA updates:

```bash
bunx eas-cli build --profile development   # or `eas build`
bunx eas-cli update
```

## Gotchas

- `src/service/firebase.ts` suppresses the React Native AsyncStorage type warning with `// @ts-ignore` — do not remove it.
- `LoginRequired.tsx` uses `navigation.navigate('Account')` — `'Account'` is a tab name, not a screen; deep-screen routes to Account stacks may require `navigate` to the underlying screen.
- `src/utils/format.ts` formats prices with a Vietnamese `₫` suffix — do not internationalize blindly.
- `app.json` references `./assets/icon.png`, `./assets/splash-icon.png`, and the Android icon assets — keep them in sync with the asset folder.
