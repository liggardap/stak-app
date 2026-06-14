# STAK-APP — Product Requirements Document

**Project:** `stak-app`
**Version:** 1.0.0
**Date:** 2026-06-14
**Author:** Liggar Prayoga
**Status:** Draft

---

## 1. Overview

**STAK-APP** is the React Native mobile client for the Stak platform. It consumes the same `stak-be` REST API as `stak-fe` and provides a native mobile experience for both participants and admins on physical Android and iOS devices.

**References:**

- **API** → `stak-be` (`/Users/prayoga/Development/stak-be`)
- **Web client** → `stak-fe` (`/Users/prayoga/Development/stak-fe`)
- **Backend PRD** → `stak-be/docs/prds/prd-be-phase-1.md`
- **Web PRD** → `stak-fe/docs/prds/prd-fe-phase-1.md`

---

## 2. Goals

- React Native mobile app (Expo managed workflow) consuming `stak-be` Phase 1 endpoints
- Physical device testing only — Samsung Galaxy A34 (Android) and iPhone 15 (iOS)
- JWT authentication with automatic token refresh and secure storage
- Phase 1 scope: auth only (login, register, forgot/reset password, email verification)
- Icon vocabulary identical to `stak-fe` via `@tabler/icons-react-native`
- Color palette and design tokens mirroring `stak-be` §5.8.1 and `stak-fe` §11
- Multi-language support: `en-US`, `nl`, `id`, `jv`
- Runs locally — no production deployment in scope

---

## 3. Non-Goals

- No Android or iOS simulators — physical devices only
- No production deployment — local development only
- No financial instrument screens in Phase 1
- No Circles, Portfolios, or Entities screens in Phase 1
- No push notifications in Phase 1
- No biometric login in Phase 1 (planned Phase 2)
- No admin portal screens in Phase 1

---

## 4. Target Devices

| Device | OS | Connection |
|---|---|---|
| Samsung Galaxy A34 | Android 14 | WiFi (default) or USB/ADB |
| iPhone 15 | iOS 17 | WiFi (default) or USB/Xcode trust |

**WiFi setup:** `npx expo start --dev-client` → scan QR code on each device. Both devices connect simultaneously over LAN.

**USB setup (Android):** Developer Options → USB Debugging enabled → `adb devices` to confirm (`device` status, not `unauthorized`). First connection requires manual trust tap on device.

**USB setup (iOS):** Xcode → Devices & Simulators → trust device once. Alternatively: EAS Build → install `.ipa` via TestFlight (avoids Xcode for day-to-day dev).

---

## 5. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript 5 | Strict mode |
| Framework | React Native via Expo SDK ~52 | Managed workflow |
| Routing | `expo-router` ~4 | File-based, same mental model as Vue Router |
| State | Zustand ^5 | Auth store, persisted to SecureStore |
| Server state | TanStack Query v5 | Mutations + query caching |
| HTTP | Axios ^1.7 | JWT interceptors, 401 refresh loop |
| Token storage | `expo-secure-store` ~14 | Keychain (iOS) / Keystore (Android) — never AsyncStorage |
| Styling | NativeWind v4 | Tailwind CSS syntax |
| Icons | `@tabler/icons-react-native` ^3 | Identical names to `@tabler/icons-vue` |
| Forms | `react-hook-form` ^7 + `zod` ^3 | Schema validation |
| i18n | `i18next` + `react-i18next` | Mirrors `vue-i18n` locale keys |
| Deep linking | `expo-linking` | Custom `stak://` scheme (Phase 1) |
| Build | EAS Build (cloud) | No local Xcode/Android Studio required |

### 5.1 Full Dependency List

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-status-bar": "~2.0.0",
    "expo-linking": "~7.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.0.0",
    "react-native-svg": "15.8.0",
    "@tabler/icons-react-native": "^3.17.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.62.0",
    "axios": "^1.7.9",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.24.0",
    "nativewind": "^4.1.0",
    "tailwindcss": "^3.4.0",
    "i18next": "^23.0.0",
    "react-i18next": "^14.0.0"
  }
}
```

### 5.2 Project Initialization

```bash
npx create-expo-app stak-app --template blank-typescript
cd stak-app
npx expo install expo-secure-store expo-router expo-linking
npm install @tabler/icons-react-native react-native-svg
npm install axios zustand @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install nativewind tailwindcss
npm install i18next react-i18next
npx expo install react-native-screens react-native-safe-area-context
```

---

## 6. Architecture

### 6.1 Directory Structure

```
stak-app/
├── app/
│   ├── _layout.tsx                    # Root layout — hydrates auth, shows splash until resolved
│   ├── (auth)/
│   │   ├── _layout.tsx                # Stack navigator, headerShown: false, redirect if authed
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx         # Token received via deep link params
│   │   └── verify-email.tsx           # Deep link landing — fires verification API call
│   └── (app)/
│       ├── _layout.tsx                # Protected: redirect to (auth)/login if not authed
│       └── index.tsx                  # Phase 1 stub home screen
├── src/
│   ├── api/
│   │   ├── client.ts                  # Axios instance, JWT interceptors, refresh queue
│   │   └── auth.ts                    # All auth endpoint functions
│   ├── stores/
│   │   └── auth.store.ts              # Zustand auth store (token + user + hydration flag)
│   ├── hooks/
│   │   ├── useAuth.ts                 # Thin wrapper over auth store
│   │   └── useAuthMutations.ts        # TanStack Query mutations for auth flows
│   ├── schemas/
│   │   ├── login.schema.ts
│   │   ├── register.schema.ts
│   │   ├── forgot-password.schema.ts
│   │   └── reset-password.schema.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx              # Includes secureTextEntry + eye toggle
│   │   │   └── FormField.tsx          # Label + input + inline error
│   │   └── auth/
│   │       ├── AuthHeader.tsx         # Teal crown + logo
│   │       └── VerificationBanner.tsx # Soft nudge when emailVerifiedAt is null
│   ├── types/
│   │   ├── user.ts                    # UserResource type
│   │   └── api.ts                     # BaseResponse, ProblemDetail
│   ├── lib/
│   │   ├── secure-store.ts            # Typed SecureStore helpers + Zustand persist adapter
│   │   └── query-client.ts            # TanStack QueryClient config
│   ├── locales/
│   │   ├── en-US.json
│   │   ├── nl.json
│   │   ├── id.json
│   │   └── jv.json
│   └── constants/
│       └── api.ts                     # BASE_URL, TOKEN_KEY
├── assets/
│   └── logo.svg
├── .env.local.example
├── app.json
├── babel.config.js
├── tailwind.config.js
└── tsconfig.json
```

### 6.2 Layering

```
Screen → useAuthMutations (TanStack Query) → api/auth.ts → Axios client → stak-be
                 ↕
           Zustand auth.store (token, user, isHydrated)
                 ↕
           expo-secure-store (persisted token)
```

### 6.3 Route Groups

| Group | Protection | Purpose |
|---|---|---|
| `(auth)` | Redirect to `(app)` if already authenticated | Login, register, password flows |
| `(app)` | Redirect to `(auth)/login` if not authenticated | Protected screens (stub in Phase 1) |

Root `_layout.tsx` is the cold-start gate: it reads the token from SecureStore, validates/refreshes, then uses `router.replace()` (never `push()`) to land the user in the correct group. No screen renders until `isHydrated: true`.

### 6.4 Post-Login Redirect

```
Login / Register success
  ↓
Read roles from UserResource.roles
  ↓
roles includes 'superadmin' or 'developer'
  → router.replace('/(app)') [admin home — Phase 2]

roles is empty (regular user)
  → router.replace('/(app)') [participant home — Phase 2]
```

In Phase 1, both personas land on the same `(app)/index.tsx` stub. Role-gated portals are Phase 2.

---

## 7. Authentication

### 7.1 API Endpoints (stak-be)

| Endpoint | Method | Auth | Phase 1 |
|---|---|---|---|
| `/api/v1/auth/register` | POST | Public | ✅ |
| `/api/v1/auth/login` | POST | Public | ✅ |
| `/api/v1/auth/logout` | POST | Bearer | ✅ |
| `/api/v1/auth/refresh` | POST | Bearer (expired-but-valid) | ✅ |
| `/api/v1/auth/forgot-password` | POST | Public | ✅ |
| `/api/v1/auth/reset-password` | POST | Public | ✅ |
| `/api/v1/auth/email/verify` | GET | Signed URL | ✅ |
| `/api/v1/auth/email/resend` | POST | Bearer | ✅ |
| `/api/v1/me` | GET | Bearer | ✅ |
| `/api/v1/me/locale` | PATCH | Bearer | ✅ |

### 7.2 UserResource Shape

```typescript
// src/types/user.ts
export interface UserResource {
  id: number
  email: string
  locale: 'en-US' | 'nl' | 'id' | 'jv'
  roles: string[]
  firstName: string
  lastName: string
  initials: string
  avatarColor: string
  avatarUrl: string | null
  avatarThumbUrl: string | null
}
```

### 7.3 Response Types

```typescript
// src/types/api.ts
export interface BaseResponse<T = unknown> {
  success: boolean
  message: string
  messageCode: string
  messageParam?: Record<string, string>
  data?: T
}

export interface ProblemDetail {
  type: string
  title: string
  status: number
  detail?: string
  instance?: string
  errors?: Record<string, string[]>
}
```

### 7.4 Token Management

- Token stored in `expo-secure-store` — Keychain on iOS, Keystore on Android
- Also held in Zustand state (in-memory) for synchronous read on request interceptor
- Key: `stak_jwt`
- JWT TTL: 60 minutes. Refresh grace window: 2 weeks (via `POST /api/v1/auth/refresh`)
- Logout: calls `POST /api/v1/auth/logout` (best effort), then clears Zustand + SecureStore

```typescript
// src/lib/secure-store.ts
import * as SecureStore from 'expo-secure-store'
import { StateStorage } from 'zustand/middleware'

export const TOKEN_KEY = 'stak_jwt'

export const secureStore = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  delete: (key: string) => SecureStore.deleteItemAsync(key),
}

// Adapter for Zustand persist middleware
export const zustandStorage: StateStorage = {
  getItem: (name) => SecureStore.getItem(name) ?? null,
  setItem: (name, value) => SecureStore.setItem(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
}
```

### 7.5 Zustand Auth Store

```typescript
// src/stores/auth.store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandStorage } from '../lib/secure-store'

interface AuthState {
  token: string | null
  user: UserResource | null
  isAuthenticated: boolean
  isHydrated: boolean          // cold-start gate: do not render until true
}

interface AuthActions {
  setAuth: (token: string, user: UserResource) => void
  setToken: (token: string) => void
  clearAuth: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'stak-auth',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
```

### 7.6 Axios Client

The client mirrors `stak-fe`'s `src/api/client.ts` with adaptations for async SecureStore and RN router.

```typescript
// src/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { secureStore, TOKEN_KEY } from '../lib/secure-store'
import { useAuthStore } from '../stores/auth.store'
import { BASE_URL } from '../constants/api'

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => { error ? p.reject(error) : p.resolve(token!) })
  failedQueue = []
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15_000,
})

// Attach JWT
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token ?? await secureStore.get(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 → refresh → retry (queue pattern for concurrent requests)
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return apiClient(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
      })
      const newToken: string = data.data.token
      useAuthStore.getState().setToken(newToken)
      await secureStore.set(TOKEN_KEY, newToken)
      processQueue(null, newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return apiClient(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().clearAuth()
      // Navigation handled by root _layout.tsx watching isAuthenticated
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
```

### 7.7 Environment Variables

```bash
# .env.local.example
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000    # LAN IP of dev machine — localhost will not work from a physical device
EXPO_PUBLIC_APP_ENV=local
```

```typescript
// src/constants/api.ts
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'
```

---

## 8. Feature Requirements — Phase 1

### 8.1 Auth Layout (Mobile Adaptation)

The `stak-fe` split panel (teal left + white form right) becomes a **teal crown + white card** layout on mobile:

- **Top accent band** (~180–200dp): teal gradient (`#0d9488` → `#065f46`), centered stak logo
- **White card**: fills remaining screen height, soft top-rounded corners (24dp radius), houses the form
- **Outer shell**: `SafeAreaView` → teal gradient band → white form card
- `KeyboardAvoidingView` wraps the card: `behavior="padding"` on iOS, `behavior="height"` on Android

No navbar on auth screens. No confetti on auth screens (matches stak-fe AuthLayout decision).

---

### 8.2 Login

**Route:** `/login` → `app/(auth)/login.tsx`
**API:** `POST /api/v1/auth/login`

**Screen spec:**

- `AuthHeader` component (teal crown + logo)
- White card:
  - Heading: _"Welcome back"_ — 22sp semi-bold, teal `#0d9488`
  - Subtext: _"Enter your details below."_ — muted
  - `Input` — Email address, `keyboardType="email-address"`, `autoComplete="email"`, `returnKeyType="next"`
  - `Input` — Password, `secureTextEntry`, eye toggle (`IconEye` / `IconEyeOff`), `returnKeyType="done"`
  - "Forgot password?" link — right-aligned below password field, minimum touch target 44×44dp
  - `Button` — _"Log in"_, full-width, 56dp tall, teal fill, `type="submit"`
  - Footer: _"Don't have an account?"_ + _"Register"_ teal link → `/register`

**Request payload:**
```json
{ "email": "...", "password": "...", "audience": "web" }
```

**Success behaviour:**
- Store token in `expo-secure-store` + Zustand
- Store `UserResource` in Zustand auth store
- `router.replace('/(app)')` (role-based routing in Phase 2)

**Error handling:**

| Error | Display |
|---|---|
| `422` — validation | Inline field errors below each input |
| `401` — invalid credentials | Toast: _"Invalid email or password."_ |
| `429` — rate limited | Toast: _"Too many attempts. Try again later."_ |
| `500` | Toast: _"Something went wrong. Please try again."_ |

**Acceptance criteria:**

- [ ] Valid credentials → token stored → navigates to app
- [ ] Invalid credentials → toast shown, form stays populated
- [ ] "Forgot password?" link navigates correctly
- [ ] Eye toggle works on both devices
- [ ] CTA visible above keyboard on both Samsung A34 and iPhone 15
- [ ] Token persists across app kill/restart

---

### 8.3 Register

**Route:** `/register` → `app/(auth)/register.tsx`
**API:** `POST /api/v1/auth/register`

**Screen spec:**

- `AuthHeader`
- White card:
  - Heading: _"Create your account"_
  - Subtext: _"Get started — it only takes a minute."_
  - First name + Last name in a side-by-side row (two columns, ~48% width each)
  - `Input` — Email, `keyboardType="email-address"`, `autoComplete="email"`
  - `Input` — Password, `secureTextEntry`, eye toggle, `autoComplete="new-password"`, helper: _"At least 8 characters"_
  - `Input` — Confirm password, `secureTextEntry`, eye toggle, `autoComplete="new-password"`
  - `Button` — _"Create account"_, full-width, primary
  - Footer: _"Already have an account?"_ + _"Log in"_ link → `/login`

**`returnKeyType` sequence:** first name → `"next"` → last name → `"next"` → email → `"next"` → password → `"next"` → confirm → `"done"` (triggers submit)

**Request payload:**
```json
{
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "password": "...",
  "password_confirmation": "..."
}
```

**Success behaviour:**
- Do NOT store token or auto-login
- Show success state (fade transition, same screen):
  - `IconMailCheck` (64dp, teal, centered)
  - Heading: _"Check your inbox"_
  - Body: _"We've sent a verification link to your email. You can log in now — some features require a verified address."_
  - Link: _"Go to login"_ → `/login`

**Error handling:**

| Error | Display |
|---|---|
| `422` — validation | Inline field errors |
| `422` — email taken | Inline on email: _"An account with this email already exists."_ |
| `429` | Toast |
| `500` | Toast |

**Acceptance criteria:**

- [ ] All fields required before submit
- [ ] Passwords must match — client-side zod validation before submit
- [ ] Success state shown — no auto-login
- [ ] Samsung A34: `autoComplete="new-password"` suppresses Samsung Keyboard autocomplete overlap on confirm password field

---

### 8.4 Forgot Password

**Route:** `/forgot-password` → `app/(auth)/forgot-password.tsx`
**API:** `POST /api/v1/auth/forgot-password`

**Screen spec:**

Two states on the same screen (fade transition between them):

**Input state:**
- `AuthHeader`
- White card:
  - Heading: _"Forgot your password?"_
  - Subtext: _"Enter your email and we'll send you a reset link."_
  - `Input` — Email
  - `Button` — _"Send reset link"_, full-width, primary
  - Link: _"← Back to login"_ → `/login`

**Success state:**
- `IconMailCheck` (64dp, teal, centered)
- Heading: _"Check your inbox"_
- Body: _"If an account exists for **email@example.com**, a reset link has been sent."_ (bold the entered email)
- "Resend email" link — 60-second cooldown with visible countdown timer after first send
- Link: _"Back to login"_ → `/login`

**Acceptance criteria:**

- [ ] Success state shown after submit regardless of whether email exists (prevents enumeration)
- [ ] Form disabled + loading state during request
- [ ] Cooldown timer displayed on "Resend" link
- [ ] Back to login works from both states

---

### 8.5 Reset Password

**Route:** `/reset-password` → `app/(auth)/reset-password.tsx`
**API:** `POST /api/v1/auth/reset-password`
**Source:** Deep link `stak://reset-password?token=...&email=...`

**Screen spec:**

- `AuthHeader`
- White card:
  - Heading: _"Set a new password"_
  - Subtext: _"Must be at least 8 characters."_
  - `Input` — New password, `secureTextEntry`, eye toggle
  - `Input` — Confirm new password, `secureTextEntry`, eye toggle
  - Real-time password match indicator between the two fields
  - `Button` — _"Reset password"_, full-width, primary
  - `token` and `email` read from URL params via `useLocalSearchParams()` — not shown in UI

**Success behaviour:**
- Toast: _"Password reset. You can now log in."_
- `router.replace('/(auth)/login')` after 1.5s

**Error handling:**

| Error | Display |
|---|---|
| `422` — validation | Inline field errors |
| `400` — token expired/invalid | Error card: _"This reset link has expired. Request a new one."_ + link to `/forgot-password` |

**Acceptance criteria:**

- [ ] `token` and `email` extracted from deep link params
- [ ] Passwords must match — client-side before submit
- [ ] Expired token shows error card, not crash
- [ ] Success redirects to login after 1.5s

---

### 8.6 Email Verification

**Deep link:** `stak://auth/email/verify?id=...&hash=...&expires=...&signature=...`
**Route:** `/verify-email` → `app/(auth)/verify-email.tsx`
**API:** `GET /api/v1/auth/email/verify?id=...&hash=...&expires=...&signature=...`

**UX flow:**

```
User taps link in email
  ↓
App opens → verify-email.tsx
  ↓
"Verifying..." screen (teal logo + spinner + "Verifying your email...")
  ↓
API call fires with params from deep link
  ↓
Success → navigate to (app) + toast "Email verified! Welcome to Stak."
Failure (expired) → error card: "This link has expired. Request a new one." + "Resend" button
```

Never show a blank screen during verification — even 400ms of blank feels like a crash on mobile.

**Acceptance criteria:**

- [ ] Deep link intercepted via `stak://` scheme
- [ ] Params parsed via `useLocalSearchParams()`
- [ ] "Verifying..." loading state shown immediately
- [ ] Success: toast + navigate to app
- [ ] Expired link: error card with resend option

---

### 8.7 Email Verification Banner

**Shown on:** All `(app)` screens when `user.emailVerifiedAt` is null — soft nudge, not a hard gate
**API:** `POST /api/v1/auth/email/resend`

**Spec:**

- Slim fixed banner (48–52dp) below app header
- Background: `#e6faf8` (lightest teal pastel), teal text
- `IconMailCheck` (left) + _"Please verify your email address to access all features."_ (center) + _"Resend"_ link (right)
- Rate limit: if `429`, "Resend" button disabled for 60s with countdown
- Banner dismissed once email is verified (polling `GET /me` or socket in Phase 2)

**Acceptance criteria:**

- [ ] Banner visible only when email unverified
- [ ] Resend triggers API call
- [ ] Rate limit handled with 60s countdown
- [ ] Never uses a modal or blocking overlay

---

## 9. Deep Linking

### 9.1 Custom URI Scheme (Phase 1)

```json
// app.json
{
  "expo": {
    "scheme": "stak"
  }
}
```

| Deep link | Destination | Params |
|---|---|---|
| `stak://auth/email/verify` | `app/(auth)/verify-email.tsx` | `id`, `hash`, `expires`, `signature` |
| `stak://auth/reset-password` | `app/(auth)/reset-password.tsx` | `token`, `email` |

Parse params in screen via `expo-router`:
```typescript
const { id, hash, signature } = useLocalSearchParams<{
  id: string; hash: string; signature: string;
}>()
```

### 9.2 Phase 2 Migration

Custom `stak://` schemes work for development and testing but are unreliable in email clients (Gmail on Android strips custom schemes). Before any user-facing launch, migrate to:

- **iOS:** Apple Universal Links (`apple-app-site-association` hosted at `/.well-known/`)
- **Android:** App Links (`assetlinks.json` hosted at `/.well-known/`)

---

## 10. Navigation Architecture

### 10.1 Cold-Start Auth Gate

```typescript
// app/_layout.tsx
export default function RootLayout() {
  const { isHydrated, isAuthenticated } = useAuthStore()

  if (!isHydrated) {
    return <SplashScreen />   // show teal logo + spinner until SecureStore hydrates
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" redirect={isAuthenticated} />
      <Stack.Screen name="(app)" redirect={!isAuthenticated} />
    </Stack>
  )
}
```

`isHydrated` is set by Zustand's `onRehydrateStorage` callback when SecureStore read completes. Until then, no screen renders — prevents flash of wrong screen.

### 10.2 Auth Group Layout

```typescript
// app/(auth)/_layout.tsx
export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Redirect href="/(app)" />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
```

### 10.3 App Group Layout

```typescript
// app/(app)/_layout.tsx
export default function AppLayout() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  return <Slot />
}
```

---

## 11. Password Eye Toggle

Custom implementation — do not rely on platform defaults (inconsistent across Android/iOS).

```typescript
// src/components/ui/Input.tsx (pattern)
const [visible, setVisible] = useState(false)

<View style={{ position: 'relative' }}>
  <TextInput
    secureTextEntry={!visible}
    // ...other props
  />
  <Pressable
    onPress={() => setVisible(!visible)}
    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}  // ensures 44x44dp touch target
    style={{ position: 'absolute', right: 12, top: '50%' }}
  >
    {visible
      ? <IconEyeOff size={20} color="#64748b" stroke={1.5} />
      : <IconEye size={20} color="#64748b" stroke={1.5} />
    }
  </Pressable>
</View>
```

`hitSlop` is required — the visual icon is 20×20dp but fingers are not that precise. Minimum effective touch area: 44×44dp (Apple HIG) / 48×48dp (Material Design).

---

## 12. Color System

Mirrors `stak-be` §5.8.1 and `stak-fe` §11 exactly.

### 12.1 Design Palette

| Token | Pastel | Deep | Usage |
|---|---|---|---|
| `primary` | `#99f6e4` | `#0d9488` | Brand, buttons, active states, links |
| `secondary` | `#e2e8f0` | `#475569` | Neutral backgrounds, borders |
| `success` | `#bbf7d0` | `#16a34a` | Confirmations, active status |
| `warning` | `#fef08a` | `#ca8a04` | Caution, pending |
| `danger` | `#fecaca` | `#dc2626` | Errors, destructive |
| `info` | `#bae6fd` | `#0284c7` | Informational notices |

### 12.2 Auth Layout Colors

- Teal crown gradient: `#0d9488` → `#065f46` (135°)
- Form card background: `#ffffff`
- Primary button background: `#0d9488`
- Primary button text: `#ffffff`
- Link color: `#0d9488`

### 12.3 Avatar Color Map

Mirrors `LegalTypeColor.php` and `stak-fe/src/lib/legalTypeColor.ts`:

```typescript
// src/lib/legalTypeColor.ts
const LEGAL_TYPE_COLORS: Record<string, string> = {
  natural_person: '#bbf7d0',
  besloten_vennootschap: '#bae6fd',
  naamloze_vennootschap: '#bae6fd',
  stichting: '#ddd6fe',
  coöperatie: '#99f6e4',
  cooperative: '#99f6e4',
  maatschap: '#fef08a',
  partnership: '#fef08a',
  vereniging: '#fed7aa',
  eenmanszaak: '#e9d5ff',
  publiekrechtelijke_rechtspersoon: '#e2e8f0',
}

const FALLBACK = '#f1f5f9'

export function legalTypeColor(legalType: string): string {
  return LEGAL_TYPE_COLORS[legalType] ?? FALLBACK
}
```

---

## 13. Icons

`@tabler/icons-react-native` — identical icon names to `@tabler/icons-vue` used in stak-fe.

| stak-fe (Vue) | stak-app (RN) | Used in |
|---|---|---|
| `IconMailCheck` | `IconMailCheck` | Register success, Forgot password success |
| `IconEye` | `IconEye` | Password show toggle |
| `IconEyeOff` | `IconEyeOff` | Password hide toggle |
| `IconWorld` | `IconWorld` | Language selector |
| `IconAddressBook` | `IconAddressBook` | Account → Profile tab (Phase 2) |
| `IconKey` | `IconKey` | Account → Password tab (Phase 2) |
| `IconBell` | `IconBell` | Account → Notifications tab (Phase 2) |

Usage:
```tsx
import { IconMailCheck } from '@tabler/icons-react-native'

<IconMailCheck size={64} color="#0d9488" stroke={1.5} />
```

---

## 14. Localization

### 14.1 Supported Locales

| Code | Language | Default |
|---|---|---|
| `en-US` | English (US) | ✅ |
| `nl` | Dutch | — |
| `id` | Indonesian | — |
| `jv` | Javanese | — |

### 14.2 Resolution Order

```
1. user.locale from UserResource (authenticated, from GET /me)
2. AsyncStorage 'stak_locale' (guest preference)
3. expo-localization device locale
4. en-US (fallback)
```

### 14.3 Locale Change

Authenticated: `PATCH /api/v1/me/locale` → update Zustand user + i18next active locale
Guest (Phase 1 scope): stored locally via AsyncStorage, applied to i18next

---

## 15. Error Handling

All stak-be errors follow RFC 9457 `application/problem+json`.

```typescript
// src/lib/error.ts
export function extractProblem(error: unknown): ProblemDetail | null {
  if (!isAxiosError(error)) return null
  const data = error.response?.data
  if (data && 'type' in data && 'status' in data) return data as ProblemDetail
  return null
}

export function firstFieldError(problem: ProblemDetail, field: string): string | undefined {
  return problem.errors?.[field]?.[0]
}
```

**Global rules:**

| Status | UI behaviour |
|---|---|
| `422` | Inline field errors from `problem.errors` |
| `401` | Clear token → `router.replace('/(auth)/login')` |
| `403` | Toast: _"You don't have permission to do that."_ |
| `429` | Toast: _"Too many requests. Try again shortly."_ |
| `500` | Toast: _"Something went wrong. Please try again."_ |

---

## 16. Environment Variables

```bash
# .env.local.example
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000    # Your dev machine's LAN IP
EXPO_PUBLIC_APP_ENV=local
```

> `localhost` resolves to the device itself, not your dev machine. Replace with the actual LAN IP when testing on physical devices.

---

## 17. Development Workflow

### 17.1 Start Dev Server

```bash
npx expo start --dev-client
```

Both devices connect by scanning the QR code over WiFi. Hot reload is automatic.

### 17.2 USB / ADB (Android only, when WiFi is flaky)

```bash
adb devices                          # confirm Galaxy A34 shows as 'device'
adb reverse tcp:8000 tcp:8000        # tunnel local backend port to device
npx expo start --dev-client
```

### 17.3 Initial Device Setup

**Samsung Galaxy A34:**
1. Settings → About phone → tap Build number 7× → Developer Options enabled
2. Developer Options → USB Debugging → ON
3. Connect via USB → accept trust prompt on device
4. `adb devices` → confirms `device` status

**iPhone 15:**
1. Connect via USB → tap "Trust" on iPhone
2. Open Xcode → Window → Devices and Simulators → iPhone 15 appears
3. Or: EAS Build → TestFlight → install dev client `.ipa` without USB

### 17.4 EAS Build (first-time device install)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android    # generates .apk
eas build --profile development --platform ios        # generates .ipa
```

Install `.apk` directly via ADB. Install `.ipa` via TestFlight or direct install with provisioning profile.

---

## 18. Phase Roadmap

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Auth (login, register, forgot/reset password, email verification) + `/me` | **In scope** |
| Phase 2 | Participant portal (account settings, entities view, avatar upload, locale switch, biometric login) | Deferred |
| Phase 3 | Admin portal (entities list/detail, users list) | Deferred |
| Phase 4 | Circles, Portfolios, Invitations, push notifications | Deferred |

---

## 19. Acceptance Criteria — Phase 1 Complete

- [ ] Expo dev client installed and running on Samsung Galaxy A34 via WiFi
- [ ] Expo dev client installed and running on iPhone 15 via WiFi
- [ ] Login flow: valid credentials → JWT stored in SecureStore → navigates to app stub
- [ ] Login flow: invalid credentials → 401 toast shown, form stays populated
- [ ] Register flow: new account → success state shown, no auto-login
- [ ] Forgot password flow: email submitted → success state shown (enumeration-safe)
- [ ] Reset password flow: deep link opens app → params parsed → password updated → redirect to login
- [ ] Email verification flow: deep link opens app → API called → success/expiry state shown
- [ ] Token refresh: 401 triggers silent refresh → original request retried — user never sees login screen
- [ ] Cold start: splash shown until SecureStore hydrated → correct screen shown
- [ ] Eye toggle: password visible/hidden on tap, 44dp touch target, identical on both devices
- [ ] Keyboard: form card visible above keyboard on both devices (no layout overlap)
- [ ] App kill + reopen: user still logged in (token persisted in SecureStore)
- [ ] Logout: token cleared from SecureStore + Zustand → redirected to login

---

## 20. Open Questions

- [ ] `emailVerifiedAt` — `UserResource` must expose this field for the verification banner to work. Confirm with stak-be that it is included in the `GET /me` response shape (not in current stak-be PRD UserResource).
- [ ] Deep link URL scheme for email verification — backend's signed URL must use `stak://` scheme in Phase 1, or a server-hosted redirect that hands off to the app. Coordinate with stak-be.
- [ ] Reset password deep link email — backend `ResetPasswordMail` currently generates a web URL (`http://localhost`). Needs a mobile-aware URL or redirect mechanism.
- [ ] Participant entity scope — `GET /entities` returns all entities. Server-side scoping for participants needed in Phase 2 (stak-be open question).

---

## 21. Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-14 | Expo managed workflow over bare React Native | Lower overhead, OTA updates, EAS cloud builds avoid local Xcode/Android Studio for daily dev |
| 2026-06-14 | expo-router (file-based) | Same mental model as Vue Router; group-based auth gating is clean |
| 2026-06-14 | expo-secure-store for JWT | Keychain/Keystore backed — never AsyncStorage for security tokens |
| 2026-06-14 | Zustand over Redux | Lighter, simpler; same role as Pinia in stak-fe |
| 2026-06-14 | @tabler/icons-react-native | Identical icon vocabulary to stak-fe — visual consistency across web and mobile |
| 2026-06-14 | NativeWind v4 | Tailwind syntax reduces context switching for developers familiar with stak-fe |
| 2026-06-14 | Physical devices only (no simulators) | Catch real-world rendering, keyboard, gesture, and touch issues earlier |
| 2026-06-14 | WiFi as daily dev default, USB for debug | QR-based LAN connection is faster to iterate; USB kept for adb logcat and port tunneling |
| 2026-06-14 | Custom stak:// scheme for Phase 1 deep links | Sufficient for dev and testing; Universal Links migration planned pre-launch |
| 2026-06-14 | Teal crown + white card mobile auth layout | Adapts stak-fe's split panel to single-column native screen; preserves brand presence |
| 2026-06-14 | Phase 1 scope: auth only | Establishes device setup, API client, auth loop, and token management before building feature screens |
