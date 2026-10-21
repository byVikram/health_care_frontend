# health_care_frontend/ — Web App (React + Vite)

Part of the [healthcare2](../CLAUDE.md) monorepo. See root CLAUDE.md for cross-service context. Package name in `package.json` is `whisper-ai`.

## Stack

- React 19 + TypeScript 5.9, Vite 7 (`@vitejs/plugin-react`, no proxy/alias config)
- UI: Material UI v7 (`@mui/material`, `@mui/x-date-pickers`) + Emotion
- Routing: React Router v7 (`BrowserRouter`)
- HTTP: axios (single wrapped instance)
- Forms: Formik + Yup
- Firebase (push notifications via FCM, `public/firebase-messaging-sw.js`)
- No test runner installed (no Jest/Vitest/RTL, no test files exist)
- Lint/format: ESLint 9 flat config + typescript-eslint + Prettier

## Folder structure (`src/`)

- `assets/` — images by domain (Banner, Laboratory, Pharmacy, Radiology, Services, specialties, icons, etc.)
- `components/`
  - `common/` — generic widgets, one folder per widget (`Button/`, `Modal/`, `Table/`, `Select/`, etc.)
  - `layout/` — `MainLayout`, `NavbarLayout`, `SidebarLayout`, `AdminLayout`, `AppFooter`
  - `admin/`, `staff/` — role-specific shared widgets
  - `ChatBot/` — self-contained chatbot widget
- `config/` — `theme.ts` (MUI theme), `firebase.ts` (FCM init, reads `VITE_FIREBASE_*`)
- `constants/` — `apiUrls.ts` (backend endpoint paths — **the source of truth for API routes**), `routes.ts` (`ROUTES` frontend paths), `constants.ts`, `mockData.ts`
- `features/` — page-level, domain-organized (the bulk of the app): `auth`, `dashboard`, `doctor` (`detail/`, `events/`, `favourites/`, `profile/`, `search/`), `patient`, `appointments`, `consultation`, `laboratory`, `radiology`, `Pharmacy` (⚠️ PascalCase, inconsistent with siblings), `transportation`/`careTransit`, `profile`, `portal` (blog/community/events), `referrals`, `admin` (separate admin section, ~24 pages — now also covers an "ancillary" sub-domain (`AdminAncillaryPage`, `AdminAncillaryCategoriesPage`, `AdminAncillaryDetailPage`) and subadmin/admin management (`AdminAdminsPage`), plus `AdminDashboardPage`, `AdminUserDetailPage`, `AdminVerificationReviewPage`)
- `hooks/` — `useAuth.ts` (auth state via `localStorage` + custom `auth-changed` event — **no Redux/Context store**), `useFormDirty.ts`, `useProfileForm.ts`
- `routes/` — `AppRoutes.tsx` (central route table), `ProtectedRoute.tsx`, `AdminProtectedRoute.tsx`
- `services/` — `apiService.ts` (axios wrapper: attaches `Authorization: Bearer <token>`, handles 401 by clearing auth + redirect, global error toasts), plus one service file per domain (`userService.ts`, `appointmentService.ts`, `blogService.ts`, etc.); some features also keep a local `*Service.ts`
- `styles/` — `commonStyles.ts` (shared MUI `sx` objects)
- `types/` — domain TypeScript types, one file per entity
- `utils/` — `Utils.ts`, `debounce.ts`, `s3.ts` (reads `VITE_S3_BASE_URL`)

## State management

No Redux/Zustand/Context store. Auth/session state lives in `localStorage`, read via `useAuth()` in `src/hooks/useAuth.ts`, which re-renders on `storage` events and a custom `auth-changed` window event.

## Running / building / testing

```bash
npm run dev      # vite --host 0.0.0.0
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview
```
No `test` script exists.

## Routing

Central table: `src/routes/AppRoutes.tsx`, path constants in `src/constants/routes.ts`. Groups: public (`/login`, `/register`, `/welcome*`), admin (`/admin/*`, guarded by `AdminProtectedRoute`), protected patient/doctor routes (guarded by `ProtectedRoute`, split across `MainLayout` and `NavbarLayout`), fallback `*` → `NotFoundPage`. Note: an empty `SidebarProtectedLayout` route and a couple of commented-out routes exist — in-progress wiring, not bugs to "fix" reflexively.

## Env vars

- `VITE_API_ENDPOINT` — **backend base URL**, consumed in `src/services/apiService.ts` (strips trailing slashes)
- `VITE_FIREBASE_*` (API key, auth domain, project id, storage bucket, messaging sender id, app id, VAPID key) — `src/config/firebase.ts`
- `VITE_S3_BASE_URL` — `src/utils/s3.ts`
- No `.env.example` committed; only a local `.env`

## Skills

`.claude/skills/` has directory-scoped Claude Code skills for common tasks: `api-integration`, `feature-page`, `ui-feedback` (mirror the equivalent skills in `health_care_mobile/`, adapted to this app's MUI/toast conventions), plus `add-form` and `add-admin-page`. Note: `add-form` documents that this app's real forms use plain `useState`, not the installed-but-unused `formik`/`yup` dependencies.

## Conventions

- Prettier: tabs, `tabWidth: 4`, no semicolons, single quotes, `printWidth: 120` — matches actual source
- TypeScript `strict: true`; `tsconfig.app.json` (src) / `tsconfig.node.json` (vite config) referenced from root `tsconfig.json`
- Components: PascalCase `.tsx`; pages suffixed `Page.tsx`; services suffixed camelCase `Service.ts`; hooks prefixed `use`
- Feature folders are lowercase except `Pharmacy/` and `ChatBot/` (PascalCase) — known inconsistency, not something to silently "fix" without asking
- Endpoint paths belong in `src/constants/apiUrls.ts` — don't hardcode URLs in components/services
- Stray planning notes exist inside source (`src/components/ChatBot/REWORK_PLAN.md`, root `review.md`/`tasks.md`/`transportation_plan.md`) — dev notes, not generated docs
