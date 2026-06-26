# Claude Code Instructions

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

---

## Project

React Native mobile app (Expo managed workflow) for the Stak platform.
Consumes `stak-be` REST API. Phase 1: auth only.

**References:**
- Backend: `/Users/prayoga/Development/stak-be`
- Web client: `/Users/prayoga/Development/stak-fe`
- PRD: `docs/prds/prd-app-phase-1.md`

---

## Workflow Rules

- **Never commit or push automatically.** Wait for explicit instruction before running `git commit` or `git push`.
- **Always branch from the correct base.** Check the current branch before `git checkout -b`. Creating a branch from a feature branch silently carries its unmerged commits into the new branch.

---

## Git Workflow

### Three Protected Branches

| Branch | Environment | Purpose |
|---|---|---|
| `main` | Production | Stable, released code. Only accepts merges from `stg`. |
| `stg` | Staging | Pre-release validation. Merges from `dev` after QA sign-off. |
| `dev` | Development | Active integration branch. All feature/fix branches merge here first. |

### Branching Rules

- **Always branch from the environment you are targeting**, never from your current working branch.
  - Targeting `dev` → branch from `origin/dev`
  - Targeting `stg` → branch from `origin/stg`
  - Targeting `main` → branch from `origin/main`
- Before `git checkout -b`, always run `git branch --show-current` to confirm where you are.

### Branch Naming Convention

```
feature/<short-description>     # New functionality
fix/<short-description>         # Bug fix
chore/<short-description>       # Non-functional (deps, config, tooling)
hotfix/<short-description>      # Urgent production fix — branch from main
```

### Promotion Flow

```
feature/* → dev → stg → main
```

- Feature and fix branches merge into `dev` first.
- `dev` is promoted to `stg` for staging validation.
- `stg` is promoted to `main` for production release.
- **Never merge a feature branch directly into `stg` or `main`.**

### Hotfixes

1. Branch from `origin/main`: `git checkout -b hotfix/<name> origin/main`
2. Fix and merge into `main`.
3. Cherry-pick the fix commit(s) onto `stg` and `dev` separately to keep all environments in sync.
4. **Never** create the hotfix from `dev` or a feature branch.

### Commit Messages

Follow the Conventional Commits format:

```
<type>(<scope>): <short summary>

- change one
- change two

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`.

### Pull Requests

When creating a PR with `gh pr create`, always include:

- **Summary** — 1–3 sentences describing what the PR does
- **Type** — `feat`, `fix`, `refactor`, `chore`, `test`, or `docs`
- **Target Branch** — which environment the PR targets (`dev`, `stg`, or `main`)
- **Linked Task** — Task Master `#id`
- **Changes** — bullet list focused on the WHY
- **Test Plan** — manual testing steps on Samsung A34 and iPhone 15

---

## Package Manager

**Always use `yarn`.** Never `npm install`.

```bash
yarn add <package>
yarn add -D <package>
yarn install
```

For Expo-managed packages (resolves correct version for the SDK):
```bash
npx expo install <package>
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo SDK ~52 (managed workflow) |
| Router | expo-router ~4 (file-based) |
| State | Zustand ^5 |
| Server state | TanStack Query v5 |
| HTTP | Axios ^1.7 |
| Token storage | expo-secure-store (never AsyncStorage for tokens) |
| Styling | NativeWind v4 (Tailwind syntax) |
| Icons | @tabler/icons-react-native (same names as stak-fe's @tabler/icons-vue) |
| Forms | react-hook-form + zod |
| i18n | i18next + react-i18next |

---

## Project Structure

```
app/              expo-router file-based routes
  (auth)/         public auth screens
  (app)/          protected screens (requires auth)
src/
  api/            Axios client + endpoint modules
  stores/         Zustand stores
  hooks/          TanStack Query mutations/queries
  schemas/        zod validation schemas
  components/
    ui/           primitive components (Button, Input, FormField)
    auth/         auth-specific components
  types/          TypeScript types (UserResource, ProblemDetail, etc.)
  lib/            secure-store helpers, query-client config
  locales/        i18n JSON files (en-US, nl, id, jv)
  constants/      api.ts (BASE_URL)
assets/           static assets (logo, icons)
docs/prds/        product requirements documents
```

---

## Key Rules

### Token Storage
- **MUST** use `expo-secure-store` for JWT tokens — never `AsyncStorage`
- Token key: `stak_jwt`
- Zustand auth store persists via `zustandStorage` adapter (backed by SecureStore)

### Navigation
- Always `router.replace()` after login/logout — never `router.push()`
- Auth gate lives in `app/_layout.tsx` — no screen renders until `isHydrated: true`
- Route groups: `(auth)` for public screens, `(app)` for protected screens

### API Client
- Base URL from `EXPO_PUBLIC_API_URL` — use machine's LAN IP, not `localhost` (localhost resolves to the device itself on physical hardware)
- Refresh queue pattern for concurrent 401s — only one refresh fires at a time
- stak-be errors are RFC 9457 `application/problem+json` — parse via `extractProblem()` in `src/lib/error.ts`

### Icons
- Use `@tabler/icons-react-native` — identical names to stak-fe's `@tabler/icons-vue`
- Requires `react-native-svg` as peer dep

### Styling
- NativeWind v4 Tailwind classes on React Native components
- Brand primary: `#0d9488` (teal deep) / `#99f6e4` (teal pastel)
- Minimum touch target: 44×44dp — use `hitSlop` on small icons

### Platform Differences (Samsung A34 vs iPhone 15)
- `KeyboardAvoidingView`: `behavior="padding"` on iOS, `behavior="height"` on Android
- Samsung A34: `autoComplete="new-password"` on password fields suppresses Samsung Keyboard autocomplete overlay on confirm-password fields
- Eye toggle: always set `hitSlop` — native default tap area is too small

---

## Environment Variables

```bash
# .env.local (never commit)
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000   # dev machine LAN IP
EXPO_PUBLIC_APP_ENV=local
```

---

## Device Setup

**No simulators — physical devices only.**

**Samsung Galaxy A34 (Android):**
1. Settings → About phone → tap Build number 7× → Developer Options enabled
2. Developer Options → USB Debugging → ON
3. `adb devices` → confirm `device` (not `unauthorized`)

**iPhone 15 (iOS):**
1. Connect USB → tap "Trust" on iPhone
2. Xcode → Devices & Simulators → verify it appears

WiFi dev: scan QR from `yarn start` on each device.

---

## Dev Commands

```bash
yarn start          # Expo dev server (scan QR on device)
yarn android        # run on Android via USB
yarn ios            # run on iOS via USB
yarn typecheck      # tsc --noEmit
yarn lint           # ESLint
```

---

## Deep Linking

Custom scheme: `stak://`

| URL | Screen |
|---|---|
| `stak://auth/email/verify?id=...&hash=...` | `app/(auth)/verify-email.tsx` |
| `stak://auth/reset-password?token=...&email=...` | `app/(auth)/reset-password.tsx` |

Parse with `useLocalSearchParams()` from expo-router.

---

## Color System

Mirrors `stak-be` §5.8.1 — single source of truth.

| Token | Pastel | Deep |
|---|---|---|
| primary | `#99f6e4` | `#0d9488` |
| secondary | `#e2e8f0` | `#475569` |
| success | `#bbf7d0` | `#16a34a` |
| warning | `#fef08a` | `#ca8a04` |
| danger | `#fecaca` | `#dc2626` |
| info | `#bae6fd` | `#0284c7` |

---

## Error Handling

stak-be returns RFC 9457 `application/problem+json` for all errors:

```typescript
interface ProblemDetail {
  type: string
  title: string
  status: number
  detail?: string
  instance?: string
  errors?: Record<string, string[]>  // field-level validation errors
}
```

---

## Phase Scope

| Phase | Scope |
|---|---|
| **Phase 1 (current)** | Auth: login, register, forgot/reset password, email verification |
| Phase 2 | Participant portal: account settings, entities, avatar, biometrics |
| Phase 3 | Admin portal: entities list/detail, users list |
| Phase 4 | Circles, Portfolios, Invitations, push notifications |
