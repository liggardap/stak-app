# STAK-APP — Product Requirements Document

**Project:** `stak-app`
**Version:** 1.1.0
**Date:** 2026-06-15
**Author:** Liggar Prayoga
**Status:** Draft

---

## 1. Overview

Phase 1.1 closes the parity gap between `stak-fe` / `stak-be` Phase 1 and the mobile app. Phase 1 delivered the full authentication ceremony; Phase 1.1 delivers the **minimum viable post-auth session** — the first screen a user sees after login, with their identity visible, their language switchable, and a clear way to sign out.

All required API endpoints are already live in `stak-be` Phase 1. The i18n infrastructure (i18next, 4 locales, `useLocale` hook) is already wired in the app. This phase is UI surface only.

**References:**

- **Phase 1 PRD** → `docs/prds/prd-app-phase-1.md`
- **API** → `stak-be` (`/Users/prayoga/Development/stak-be`)
- **Web client** → `stak-fe` (`/Users/prayoga/Development/stak-fe`)

---

## 2. Goals

- Give authenticated users a real home screen (not a blank stub)
- Match the language-switching capability that `stak-fe` ships in Phase 1
- Provide a reachable logout action
- Lay the navigation shell (header with avatar + overflow menu) that Phase 2 will extend

---

## 3. Non-Goals

- No profile editing (Phase 2)
- No avatar upload (Phase 2)
- No bottom tab navigation (Phase 2)
- No account settings screen (Phase 2)
- No biometric login (Phase 2)
- No entity/portfolio screens (Phase 2+)
- No dark mode (Phase 2)

---

## 4. Gap Map — Web Phase 1 vs Mobile Phase 1

| Capability | BE | stak-fe Web | stak-app Phase 1 | stak-app Phase 1.1 |
|---|---|---|---|---|
| Login / Register / Forgot-Reset PW / Email Verify | ✅ | ✅ | ✅ Done | — |
| View own profile (name, email, locale) | ✅ `GET /me` | ✅ | ❌ | ✅ |
| Locale switcher UI | ✅ `PATCH /me/locale` | ✅ | ❌ Infrastructure only | ✅ |
| Logout UI | ✅ `POST /auth/logout` | ✅ | ❌ | ✅ |
| Home screen (post-auth landing) | ✅ | ✅ | ❌ Empty stub | ✅ |

---

## 5. API Endpoints Used

All endpoints are already live in `stak-be` Phase 1. No new backend work required.

| Endpoint | Method | Auth | Usage |
|---|---|---|---|
| `/api/v1/me` | GET | Bearer | Fetch user profile on home screen load |
| `/api/v1/me/locale` | PATCH | Bearer | Update locale preference |
| `/api/v1/auth/logout` | POST | Bearer | Sign out |

---

## 6. Feature Requirements

### 6.1 Home Screen

**Route:** `(app)/index.tsx`
**API:** `GET /api/v1/me`

Replace the empty stub with a minimal identity screen.

**Layout:**

```
┌─────────────────────────────────────┐
│  [LP]              stak     🌐   ⋮  │  ← App header (48dp)
├─────────────────────────────────────┤
│                                     │
│            ◉  LP                    │  ← 64dp teal circle, initials
│      Good morning, Liggar           │  ← time-aware greeting, 20sp semibold
│      liggardev@gmail.com            │  ← muted, 14sp regular
│                                     │
└─────────────────────────────────────┘
```

**App header spec:**
- Left: user initials avatar (36dp teal circle, white initials, Inter 600) — tap does nothing in Phase 1.1 (Phase 2 → profile screen)
- Center: wordmark "stak" in teal `#0d9488`, Inter 600
- Right: `IconWorld` (language trigger) + `IconDotsVertical` (overflow menu)
- Background: white, bottom border `#e2e8f0`
- Safe area aware (no overlap with status bar on A34 notch or iPhone Dynamic Island)

**Home card spec:**
- Large avatar: 64dp circle, background `avatarColor` from `UserResource`, white initials (`user.initials`), Inter 700
- Greeting: time-based (`Good morning` 05:00–11:59 / `Good afternoon` 12:00–17:59 / `Good evening` 18:00–04:59), 20sp semibold teal `#0d9488`
- Full name: `user.firstName + ' ' + user.lastName`, 16sp regular, `#1e293b`
- Email: `user.email`, 14sp regular, muted `#64748b`

**Data loading:**
- Call `GET /me` on mount via TanStack Query
- Show skeleton loaders (avatar circle + two text lines) while loading
- On error: inline error card with "Retry" button

**Acceptance criteria:**
- [ ] Initials avatar shows correct background color from `user.avatarColor`
- [ ] Greeting updates based on device local time
- [ ] Loading skeleton shown while `GET /me` is in flight
- [ ] Error state with retry when network fails
- [ ] Header safe area correct on both Samsung A34 and iPhone 15

---

### 6.2 Language Switcher

**Trigger:** `IconWorld` in the app header
**API:** `PATCH /api/v1/me/locale`

**Bottom sheet spec:**

```
┌──────────────────────────────┐
│  Language              ╳    │  ← drag handle + close button
│  ──────────────────────────  │
│  🇺🇸  English (US)        ✓  │  ← active locale: teal checkmark
│  🇳🇱  Nederlands              │
│  🇮🇩  Bahasa Indonesia        │
│  ✦   Basa Jawa               │  ← no flag: regional language
└──────────────────────────────┘
```

- Each row: 56dp tall, `IconCheck` (teal `#0d9488`) on active row, neutral on others
- Row text: 16sp regular Inter; language name in its own language
- Javanese: label "Basa Jawa", `✦` character as visual marker (no country flag)
- Tap row → immediate locale switch (no confirm step)
- Locale change flow:
  1. Call `PATCH /api/v1/me/locale` with `{ locale: 'nl' }`
  2. On success: `i18n.changeLanguage(locale)` + update `user.locale` in Zustand store + persist to AsyncStorage
  3. Close bottom sheet
  4. Screen text re-renders in new locale immediately
- On API error: Toast "Could not update language. Please try again." — locale reverts to previous

**Acceptance criteria:**
- [ ] Bottom sheet opens on `IconWorld` tap
- [ ] Active locale shown with teal checkmark
- [ ] Selecting a locale switches the UI language instantly
- [ ] `PATCH /me/locale` called on selection
- [ ] Error reverts locale and shows toast
- [ ] Bottom sheet dismissable by swipe-down or close button

---

### 6.3 Logout

**Trigger:** `IconDotsVertical` overflow menu in app header → "Sign out"
**API:** `POST /api/v1/auth/logout`

**Overflow menu spec:**
- Opens a small dropdown/action sheet below the overflow icon
- Single item in Phase 1.1: `IconLogout` + "Sign out"
- (Phase 2 will add: "Profile", "Settings", "Help")

**Logout flow:**
1. User taps "Sign out"
2. Show confirmation: `Alert.alert('Sign out', 'Are you sure?', [Cancel, 'Sign out'])`
3. On confirm:
   - Call `POST /api/v1/auth/logout` (best effort — proceed even if it fails)
   - `useAuthStore.getState().clearAuth()`
   - Delete `stak_jwt` from SecureStore
   - `router.replace('/(auth)/login')`

**Acceptance criteria:**
- [ ] Overflow menu opens on `IconDotsVertical` tap
- [ ] Confirmation alert shown before logout
- [ ] Token cleared from SecureStore on logout
- [ ] Zustand auth state cleared
- [ ] Redirected to login screen
- [ ] Logging back in works immediately after logout

---

## 7. Navigation Shell

Phase 1.1 introduces the `AppHeader` component that Phase 2+ will reuse across all protected screens.

```
src/components/ui/AppHeader.tsx
```

**Props:**
```typescript
interface AppHeaderProps {
  title?: string           // defaults to 'stak' wordmark
  showLanguage?: boolean   // defaults to true
  showOverflow?: boolean   // defaults to true
}
```

Phase 2 screens pass `title="Entities"` etc. The header is not a navigation header (no back button) — expo-router's `Stack.Screen` `headerShown: false` remains.

---

## 8. New Files

```
app/(app)/index.tsx              ← replace stub with home screen
src/components/ui/AppHeader.tsx  ← reusable header shell
src/components/ui/LanguageSheet.tsx  ← bottom sheet locale picker
src/hooks/useMe.ts               ← TanStack Query for GET /me
src/api/me.ts                    ← GET /me endpoint function
```

---

## 9. Reused Infrastructure (no changes needed)

| Piece | Location | Status |
|---|---|---|
| `useLocale` hook | `src/hooks/useLocale.ts` | ✅ Built in Phase 1 |
| `usePatchLocale` mutation | `src/hooks/useAuthMutations.ts` | ✅ Built in Phase 1 |
| i18n config + 4 locales | `src/lib/i18n.ts` | ✅ Built in Phase 1 |
| `clearAuth` action | `src/stores/auth.store.ts` | ✅ Built in Phase 1 |
| `SecureStore` delete helper | `src/lib/secure-store.ts` | ✅ Built in Phase 1 |
| Auth Axios client | `src/api/client.ts` | ✅ Built in Phase 1 |

---

## 10. Localization Keys — Phase 1.1 Additions

Add to all 4 locale files (`en-US.json`, `nl.json`, `id.json`, `jv.json`):

```json
{
  "home": {
    "greeting_morning": "Good morning",
    "greeting_afternoon": "Good afternoon",
    "greeting_evening": "Good evening"
  },
  "language": {
    "title": "Language",
    "en_us": "English (US)",
    "nl": "Nederlands",
    "id": "Bahasa Indonesia",
    "jv": "Basa Jawa"
  },
  "logout": {
    "label": "Sign out",
    "confirm_title": "Sign out",
    "confirm_message": "Are you sure you want to sign out?",
    "confirm_button": "Sign out"
  }
}
```

---

## 11. Acceptance Criteria — Phase 1.1 Complete

- [ ] Home screen shows user initials, name, email, and time-aware greeting after login
- [ ] Avatar background uses `user.avatarColor` from UserResource
- [ ] Language switcher opens as bottom sheet, lists all 4 locales
- [ ] Selecting a locale switches app language immediately and persists
- [ ] `PATCH /me/locale` called on locale change; error reverts and shows toast
- [ ] Logout confirmation shown before signing out
- [ ] Logout clears SecureStore + Zustand + redirects to login
- [ ] All Phase 1.1 text translated in all 4 locales
- [ ] Header safe area correct on Samsung A34 (Android) and iPhone 15 (iOS)
- [ ] All touch targets ≥ 44×44dp

---

## 12. Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Bottom sheet for locale picker | Thumb-reachable on 6.6" A34; native feel on both platforms |
| 2026-06-15 | No flag for Javanese | Javanese is a regional/ethnic language, not a nation-state; using 🇮🇩 would be incorrect |
| 2026-06-15 | Overflow menu for logout | Keeps header uncluttered; container is reusable when Phase 2 adds more actions |
| 2026-06-15 | Best-effort logout API call | Network failure shouldn't trap the user — local auth state is cleared regardless |
| 2026-06-15 | Time-aware greeting | Zero API cost, makes the app feel present and alive before Phase 2 content arrives |
