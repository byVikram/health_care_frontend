# Whisper AI � Healthcare Portal

A modern, responsive healthcare web application built with React 19, TypeScript, Vite, and Material UI v7.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Bundler | Vite 7 |
| UI Library | Material UI v7 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Linting | ESLint 9 + TypeScript ESLint |

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd health-care

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_ENDPOINT=http://localhost:5000
```

### Running the App

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Project Structure

```
src/
├── assets/                  # Static images and illustrations
│   ├── Banner/              # Hero banner image
│   └── Services/            # Service section images
│
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button/          # AppButton
│   │   ├── Card/            # AppCard, ServiceCard, SpecialityCard
│   │   ├── Input/           # AppInput
│   │   ├── Loader/          # AppLoader
│   │   ├── Modal/           # AppModal, ConfirmModal
│   │   ├── Navbar/          # AppNavBar
│   │   ├── Select/          # AppSelect
│   │   ├── Sidebar/         # AppSidebar
│   │   ├── Table/           # AppTable
│   │   └── NotFoundPage.tsx
│   │
│   └── layout/              # Layout components
│       ├── MainLayout.tsx   # App shell (Navbar + children + Footer)
│       └── AppFooter.tsx    # Site footer
│
├── config/
│   └── theme.ts             # MUI theme configuration
│
├── constants/
│   └── apiUrls.ts           # Centralised API endpoint constants
│
├── features/                # Page-level feature modules
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   │
│   └── dashboard/
│       ├── DashboardPage.tsx
│       └── SpecialitySection.tsx
│
├── routes/
│   ├── AppRoutes.tsx        # Route definitions
│   └── ProtectedRoute.tsx   # Auth guard
│
├── services/
│   ├── apiService.ts        # Axios wrapper (get, post, put, patch, delete)
│   └── userService.ts       # User CRUD operations
│
├── types/
│   └── images.d.ts          # Image module type declarations
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## Reusable Components

### AppButton
MUI Button wrapper with built-in loading state, size variants, icon support, and custom border radius.

```tsx
<AppButton label="Save" loading={isLoading} startIcon={<SaveIcon />} />
<AppButton variant="outlined" color="error" label="Delete" />
```

### AppInput
MUI TextField wrapper with start/end icon adornments and forwarded ref support.

```tsx
<AppInput label="Search" placeholder="e.g. Cardiology" startIcon={<SearchIcon />} />
```

### AppSelect
MUI Select wrapper accepting an `options` array with value/label pairs.

```tsx
<AppSelect label="Role" options={[{ value: "doctor", label: "Doctor" }]} />
```

### AppModal
Dialog component with title, close button, content slot, and customisable action buttons.

```tsx
<AppModal open={open} onClose={handleClose} title="Edit Patient"
  actions={<AppButton label="Save" onClick={handleSave} />}>
  <AppInput label="Name" />
</AppModal>
```

### ConfirmModal
Pre-styled confirmation dialog with 5 variants: `confirm`, `delete`, `warning`, `success`, `info`.

```tsx
<ConfirmModal open={open} onClose={handleClose} onConfirm={handleDelete}
  variant="delete" title="Delete Record"
  description="This action cannot be undone." />
```

### AppTable
Generic typed table with skeleton loading rows and empty state message.

```tsx
<AppTable columns={columns} rows={data} loading={isLoading} />
```

### AppCard
Stat/info card with icon, accent colour, value, and subtitle.

```tsx
<AppCard title="Total Patients" value={1240} icon={<PeopleIcon />} accent="#2B6F71" />
```

### SpecialityCard
Specialty category card with an illustration, title, and "Consult Now" link.

```tsx
<SpecialityCard image={imgSrc} title="Cold, cough or fever" onConsult={handleConsult} />
```

### AppLoader
Dual-ring circular loader. Supports inline and fullscreen overlay modes.

```tsx
<AppLoader fullScreen message="Please wait..." />
```

---

## Theme

The app uses a custom MUI theme defined in `src/config/theme.ts`.

| Token | Value |
|---|---|
| Primary | `#2B6F71` (teal) |
| Secondary | `#df6fa7` (pink) |
| Neutral | `#13C0C5` (cyan) |
| Background | `#f4f6f9` |
| Font | Inter |

---

## Routing

| Path | Component | Access |
|---|---|---|
| `/` | Redirects to `/dashboard` | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/dashboard` | DashboardPage | Protected |
| `*` | NotFoundPage | Public |

Protected routes require `isAuthenticated` to be `true`. Auth integration is pending.

---

## API Services

All HTTP calls go through `ApiService` (`src/services/apiService.ts`), a thin Axios wrapper:

```ts
ApiService.get<T>(url)
ApiService.post<T>(url, body)
ApiService.put<T>(url, body)
ApiService.patch<T>(url, body)
ApiService.delete<T>(url)
```

API endpoint constants are centralised in `src/constants/apiUrls.ts` and driven by the `VITE_API_ENDPOINT` environment variable.

---

## License

Private  all rights reserved.
