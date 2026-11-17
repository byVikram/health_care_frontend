# Whisper AI — Healthcare Web Portal

The web app of the Karolahealth platform: one React app with portals for **patients** (find a doctor, book and manage appointments, pharmacy and radiology orders, family members, medical profile), **doctors** (schedule, booking requests, consultations, profile and availability) and **admins** (verification, users, content, appointments). It talks to the FastAPI backend in `../health_care_backend` and shares that backend with the mobile app in `../health_care_mobile`.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 (strict) |
| Bundler | Vite 7 |
| UI | Material UI v7 + Emotion |
| Routing | React Router v7 |
| HTTP | Axios (one wrapped instance) |
| Notifications | Firebase Cloud Messaging, react-toastify |
| Lint / format | ESLint 9 + typescript-eslint, Prettier |

## Getting started

Prerequisites: Node.js 20.19 or newer and npm.

```bash
npm install
```

Create a `.env` file in this folder (it is gitignored):

```env
# Backend base URL (a local backend, or the hosted dev one)
VITE_API_ENDPOINT=http://127.0.0.1:8000

# Optional: base URL for image keys the backend returns without a full URL
# VITE_S3_BASE_URL=

# Firebase web push (all optional; push is off without them)
# VITE_FIREBASE_API_KEY=
# VITE_FIREBASE_AUTH_DOMAIN=
# VITE_FIREBASE_PROJECT_ID=
# VITE_FIREBASE_STORAGE_BUCKET=
# VITE_FIREBASE_MESSAGING_SENDER_ID=
# VITE_FIREBASE_APP_ID=
# VITE_FIREBASE_VAPID_KEY=
```

Ask a teammate for the real values. Pointing `VITE_API_ENDPOINT` at the hosted dev backend means real data.

## Scripts

```bash
npm run dev        # dev server on all interfaces (vite --host 0.0.0.0)
npm run build      # tsc -b && vite build
npm run preview    # serve the production build
npm run lint       # eslint .
```

Known issue: `npm run build` currently stops at the TypeScript step because older files carry about 363 type errors (mostly type-only imports and unused variables). To check your own change use `npx tsc -p tsconfig.app.json --noEmit` and look only at the files you touched, and `npx vite build` to confirm the app still bundles. There is no automated test suite.

## Project layout

```
src/
├── components/
│   ├── common/      # shared widgets, one folder each (Button, Modal, Table, Select, Tabs, AccountMenu ...)
│   ├── layout/      # NavbarLayout, SidebarLayout, AdminLayout, MainLayout, AppFooter
│   ├── admin/ staff/ ChatBot/
├── features/        # pages by domain: auth, dashboard, doctor, patient, appointments,
│                    # bookings, schedule, account, consultation, radiology, Pharmacy,
│                    # profile, portal, referrals, admin
├── hooks/           # useAuth, useFamilyMembers, ...
├── services/        # apiService.ts (axios wrapper) and one service per domain
├── constants/       # apiUrls.ts (every endpoint path), routes.ts, constants.ts
├── routes/          # AppRoutes.tsx (the route table), ProtectedRoute, AdminProtectedRoute
├── styles/          # commonStyles.ts, deskTokens.ts (colours of the desktop designs)
├── config/          # theme.ts (MUI theme), firebase.ts
├── types/  utils/  data/  pagination/
public/              # firebase-messaging-sw.js (web push service worker)
```

## Routes

All routes live in `src/routes/AppRoutes.tsx`, with the paths in `src/constants/routes.ts`. Groups: public pages (login, register, welcome, health questions), the admin area (`/admin/*`, admin sign-in required), and the signed-in patient and doctor pages. Two desktop pages are role specific: patients get **My bookings** at `/bookings`, doctors get **Schedule** at `/schedule` (each redirects the other role). The account menu under the avatar shows the rows the backend sends for the user's role.

## How it talks to the backend

Every request goes through `src/services/apiService.ts`: it adds the bearer token, clears the session and redirects to login on a 401, and shows the server's error message as a toast. Tokens and the signed-in user are kept in `localStorage` and read with `useAuth()`. Endpoint paths are only defined in `src/constants/apiUrls.ts`. The API itself is described by the backend's Swagger page (`/docs` on a non-production backend).

## Push notifications

The browser registers with Firebase Cloud Messaging (`src/config/firebase.ts`, service worker `public/firebase-messaging-sw.js`) after the user allows notifications. Push needs the `VITE_FIREBASE_*` values above.

## Contributing

Conventions, the shared component kit and the working agreements are in [CLAUDE.md](CLAUDE.md). In short: Prettier (tabs, no semicolons, single quotes), `async/await` instead of `.then()`, reuse `components/common`, and keep API paths in `constants/apiUrls.ts`.

## License

Private — all rights reserved.
