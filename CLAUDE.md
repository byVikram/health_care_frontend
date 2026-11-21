# health_care_frontend/ — Web App (React + Vite)

Part of the [healthcare2](../CLAUDE.md) monorepo (own git repo; see the root file for cross-repo context). The web portal for patients, doctors and admins. Package name in `package.json` is `whisper-ai`.

## Stack

- React 19, TypeScript ~6.0 (`strict`, `verbatimModuleSyntax`, `noUnusedLocals`), Vite 7 (plain `@vitejs/plugin-react`, no proxy or path alias)
- UI: Material UI v7 (`@mui/material`, `@mui/x-date-pickers`) + Emotion; icons from `@mui/icons-material`
- Routing: React Router v7 (`BrowserRouter`). HTTP: axios, one wrapped instance. Toasts: `react-toastify`
- Firebase Cloud Messaging for push (`src/config/firebase.ts`, `public/firebase-messaging-sw.js`)
- Forms: plain `useState` (Formik/Yup are installed but unused; see the `add-form` skill). No test runner, no test files
- Lint/format: ESLint 9 flat config + typescript-eslint, Prettier (`.prettierrc`: tabs, width 120, no semicolons, single quotes)

## Commands

```bash
npm run dev        # vite --host 0.0.0.0
npm run build      # tsc -b && vite build  (see the warning below)
npm run lint       # eslint .
npm run preview
```

- **`npm run build` fails at its type-check step today:** `tsc` reports ~363 errors in older files (type-only imports, unused locals). Do not add to them. Check YOUR files: `npx tsc -p tsconfig.app.json --noEmit`, then filter the output to the paths you touched (the count must not grow). Confirm the bundle with `npx vite build` (add `--outDir <scratch>` to leave `dist/` alone).
- Lint only what you touched: `npx eslint <paths>`.

## Environment (`.env`, gitignored; no `.env.example`)

- `VITE_API_ENDPOINT`: backend base URL, read in `src/services/apiService.ts` (trailing slashes stripped). Pointing it at the hosted dev backend means real data: a local mock or local backend is safer for experiments.
- `VITE_S3_BASE_URL`: used by `buildS3Url` (`src/utils/s3.ts`). When unset it falls back to the API URL, which is NOT where profile photos live, so images only work when the backend returns a full URL (it does: `storage.display_url`). A full `http(s):` value passes through untouched.
- `VITE_FIREBASE_*` (API key, auth domain, project id, storage bucket, messaging sender id, app id, VAPID key): `src/config/firebase.ts`.

## Folder map (`src/`)

- `components/common/`: generic widgets, ONE FOLDER PER WIDGET (`Button/`, `Modal/`, `Table/`, `Select/`, `Skeleton/`, `Drawer/`...). `components/layout/`: `MainLayout`, `NavbarLayout` (fixed 64px navbar + content; the navbar is role based), `SidebarLayout`, `AdminLayout`, `AppFooter`. Also `admin/`, `staff/`, `ChatBot/` (self-contained widget).
- Desktop-design kit: `styles/deskTokens.ts` (colours `DESK`, status tones `DESK_TONES`, tile colours, icon paths `DESK_ICONS`) and the components built on it in `components/common/`: `StatusPill`, `Tabs/` (`UnderlineTabs`, `SegmentTabs`), `PillToggle` (the teal two-option pill: doctor slot picker's visit type, lab cart's Home visit / Visit a lab; `size="lg"` is the bigger one), `PersonFilter` (the "For Everyone" card), `Rail/RailItem`, `Avatar/AvatarTile`, `SectionLabel`, `FactList`, `SearchField`, `Calendar/MonthCalendar`, `Button/DeskButton`, `Menu/DeskMenu`, `Modal/` (`DeskDialog`, `ReasonDialog`), `Icon/DeskIcon`, `AccountMenu/AccountMenu`. Use them for new desktop pages instead of one-off styling.
- `features/`: page-level code by domain (`auth`, `dashboard`, `doctor`, `patient`, `appointments`, `bookings`, `schedule`, `account`, `consultation`, `radiology`, `Pharmacy` (PascalCase, a known inconsistency: do not rename silently), `profile`, `portal`, `referrals`, `admin` (~24 pages)).
- `hooks/` (`useAuth`, `useFamilyMembers`, `useAvatarChange`, ...), `services/` (`apiService.ts` + one `*Service.ts` per domain; some features keep a local service), `constants/` (`apiUrls.ts`, `routes.ts`, `constants.ts`), `types/`, `utils/`, `config/` (`theme.ts`, `firebase.ts`), `routes/` (`AppRoutes.tsx`, `ProtectedRoute.tsx`, `AdminProtectedRoute.tsx`).
- `design/` at the repo root: HTML design mockups, GITIGNORED, local reference only (read them, never import them).

## Pages added with the desktop redesign

- **My bookings** (`features/bookings/`, route `ROUTES.BOOKINGS` = `/bookings`, patients): `GET /api/patients/me/bookings` (the same list as the mobile Bookings tab). The server decides each booking's tone and actions. Doctor visits can be rescheduled (`useRescheduleFlow`), cancelled (`ReasonDialog`) or opened; pharmacy orders open their page; a lab booking opens its order page (`/lab-tests/orders/:id`); home care shows details only. Deep links: `?category=lab|ancillary|doctor|pharmacy`, `?when=upcoming|past`, `?appointment_id=`. The "For Everyone" card next to the search box (`PersonFilter`, people from `useFamilyMembers`) sends `patient_id` (the account holder's or a family member's public id) to the same endpoint, so counts and paging are for that person; nothing new is stored, the server uses the patient each booking was saved for.
- **Schedule** (`features/schedule/`, route `ROUTES.SCHEDULE` = `/schedule`, doctors): month calendar, clinic switcher (`GET /api/doctors/clinics`), the day's list from `GET /api/appointments`, Booking requests with the auto-confirm switch (`/api/appointments/me/auto-confirm`). Starting a consultation is `features/doctor/useStartConsultation.tsx` (start-consultation call, then the OTP dialog). Status rules reuse `features/doctor/appointmentRules.ts`.
- **Account menu** (`features/account/`): the panel under the navbar avatar. Rows come from `GET /api/lookup/navigation` by role (the mobile drawer's list) and are mapped by KEY to web pages in `accountMenuItems.ts` (`targetOf`); a key with no web page is hidden, or mapped to a bookings filter (lab, home care, treatment history). The patient card (name, `KH-` id, completion) is `GET /api/patients/me/summary`; the family row is `useFamilyMembers`.
- The old appointments list page is gone: `ROUTES.APPOINTMENTS` (`/portal/appointments`) only redirects to `/schedule` (doctor) or `/bookings` (patient), keeping the query, so old links still work. `/portal/appointments/:appointmentId` is still the appointment detail page.

- **Lab tests** (`features/lab/`, routes `ROUTES.LAB.*` under `/lab-tests`, patients; design: the 10 desktop frames of `design/lab bookings desktop.html`). Browse (`LabBrowsePage`: search, Show / health-concern filters, package and test cards with Add, the sticky cart) -> cart and slot (`LabCartPage`: who the test is for, Home visit or Visit a lab, saved address, lab and day/time) -> review (`LabReviewPage`) -> booked (`LabBookedPage`) -> order (`LabOrderPage`: server timeline, reschedule, cancel, add to calendar) -> report (`LabReportPage`). It uses the backend's `/api/laboratory/*` (catalogue, availability, quote, slots, orders) through `labService.ts`, ported from the mobile app (`health_care_mobile/src/features/laboratory/`); the booking in progress lives in `labBookingStore.ts` (module store, kept in `sessionStorage`, cleared on logout). **Payment is on collection only** (the backend has no online payment): the review step has a single "Pay at collection" option and the button is "Place order". **Reports have no data API yet**: `LabReportPage` shows a "being prepared" state with Download PDF / Share disabled, never sample numbers. Addresses are saved ones or "Type an address" (no GPS / map picker); the catalogue has no images, so cards use tinted icon panels. Fasting is only known once an item's detail was loaded (`fastingKnown`), so screens must not claim "no fasting" when it is unknown.

## Routing and state

- Central table `routes/AppRoutes.tsx`, path constants in `constants/routes.ts` (use `ROUTES.*`, never literals). Groups: public, admin (`AdminProtectedRoute`), protected patient/doctor routes (`ProtectedRoute`, inside `NavbarLayout`). A page for one role redirects the other (`<Navigate>` on `useAuth().role`).
- No Redux or Context store. Auth lives in `localStorage` (`role`, `user`, `access_token`, `refresh_token`, `lookup`), read through `hooks/useAuth.ts`, which re-renders on `storage` and the custom `auth-changed` window event. `apiService.ts` adds the bearer token, clears auth and redirects on 401, and toasts errors (`suppressErrorToast: true` to turn that off for one call).

## Conventions

- Endpoint paths only in `constants/apiUrls.ts` (relative, e.g. `/api/...`); API calls through `ApiService`, never raw axios in components.
- `async`/`await` with try/catch/finally; no `.then()` chains; inside effects write an inner async function. Reuse `components/common` before building something new; a new shared component gets its own folder there.
- Components PascalCase `.tsx`, pages `*Page.tsx`, services `*Service.ts`, hooks `use*`. Type-only imports use `import type` (required by `verbatimModuleSyntax`).
- Messages the user sees come from the server where it sends them (`message`); toast with `react-toastify`.

## Looking at a page without a login

The hosted backend needs a real sign-in, so for layout work run a throwaway mock API (any small script returning `{success, message, data}`) and a second dev server: `VITE_API_ENDPOINT=http://127.0.0.1:<api port> npx vite --port <port>`. Then, in the browser console, set `localStorage` `role`, `user`, `access_token`, `refresh_token`, `lookup` and open the route. Keep the mock out of the repo.

## Working agreements

- Do not commit or push unless asked. When asked: ONE commit per repo, on `dev`, without the `/design` folder.
- For anything bigger than a small fix: say the plan, get the OK, then build.
- Before saying done: tsc filtered to your files, `npx eslint <paths>`, `npx vite build`. There are no automated tests; say what you could not check.

## Skills

`.claude/skills/` has `add-admin-page`, `add-form`, `api-integration`, `feature-page` and `ui-feedback` (they mirror the equivalent skills in `health_care_mobile/`, adapted to MUI and toasts).
