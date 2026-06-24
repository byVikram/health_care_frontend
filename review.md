## Project: Karola Health Web App

This report presents a thorough structural, architectural, and quality analysis of the frontend codebase. Issues are categorized by severity along with concrete code examples, impact analysis, and actionable refactoring recommendations.

---

## Executive Summary of Findings

| Severity     | Count | Primary Impact Areas                         | Key Issues                                                                                                                                                       |
| :----------- | :---: | :------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** |   2   | Security, Reliability                        | Hardcoded Auth Bypass, Endpoint Config Fragility                                                                                                                 |
| **High**     |   3   | Maintainability, Usability, Domain Integrity | Blocked Radiology Onboarding, LocalStorage Mapper Pollution, Copy-Paste Settings Tab (Drift & Data Leak)                                                         |
| **Medium**   |   4   | Reusability, Styling Consistency, Clean Code | Duplicated `buildS3Url`, Custom Local Layout Cards (`SectionCard`), Style Inconsistencies (`AppSwitch` omission), File Extension mismatch (`Utils.tsx` vs `.ts`) |
| **Low**      |   2   | Redundancy                                   | Duplicate Routes, Direct `localStorage` usage in UI Components                                                                                                   |

---

## 1. Critical Severity Issues

### 1.1. Hardcoded Security Bypass for All Protected Routes

- **Vulnerability Type**: Authentication & Authorization Bypass
- **Location:** [AppRoutes.tsx](src/routes/AppRoutes.tsx#L57)

#### Context & Impact

In `AppRoutes.tsx`, the user authentication check is bypassed by a hardcoded constant:

```tsx
export default function AppRoutes() {
	const isAuthenticated = true // 🔴 Hardcoded bypass
    ...
```

This bypass prevents `ProtectedRoute` from redirecting unauthenticated users to `/login`. Unauthenticated users can access diagnostic results, patient profiles, scheduling systems, and order requests, exposing a major security flaw.

#### Refactoring Recommendation

Derive authentication status reactively using the `useAuth` hook:

```diff
 export default function AppRoutes() {
-	const isAuthenticated = true
+	const { accessToken } = useAuth()
+	const isAuthenticated = !!accessToken
```

---

### 1.2. REST API URL Construction Redundancy & Axios Instance Misconfiguration

- **Issue Type**: Architectural Inefficiency & Fragility
- **Location:** [apiUrls.ts](src/constants/apiUrls.ts) and [apiService.ts](src/services/apiService.ts#L7)

#### Context & Impact

The base URL is hardcoded into every endpoint string within `apiUrls.ts`:

```typescript
export const BASE_URL = import.meta.env.VITE_API_ENDPOINT as string

export const API_ENDPOINTS = {
	AUTH: {
		SEND_OTP: `${BASE_URL}/api/auth/send-otp`, // 🔴 Redundant base URL template literal
        ...
```

Meanwhile, the global Axios instance in `apiService.ts` is created without a `baseURL`:

```typescript
const axiosInstance = axios.create() // 🔴 Missing baseURL option
```

This forces developers to prepend `${BASE_URL}` to every single route string. It also breaks if `BASE_URL` contains a trailing slash, leading to double-slashed paths (e.g., `http://api//api/auth`).

#### Refactoring Recommendation

1. Configure `baseURL` directly on the Axios instance in `apiService.ts`:

```typescript
const axiosInstance = axios.create({
	baseURL: (import.meta.env.VITE_API_ENDPOINT as string) || '/',
})
```

2. Remove base URL formatting from `apiUrls.ts`:

```typescript
export const API_ENDPOINTS = {
	AUTH: {
		SEND_OTP: '/api/auth/send-otp', // Clean and relative
		VERIFY_OTP: '/api/auth/verify-otp',
        ...
```

---

## 2. High Severity Issues

### 2.1. Blocked Radiology Onboarding Flow

- **Issue Type**: Functional Block / Business Logic Defect
- **Location:** [useAuth.ts](src/hooks/useAuth.ts#L145-L151)

#### Context & Impact

Inside the onboarding control hook `useOnboardingFlow`, role selection returns early if the selected role is `'RADIOLOGY'`:

```typescript
const handleRoleSelect = (role: OnboardingUserRole) => {
	if (role === 'RADIOLOGY') return // 🔴 Early exit prevents onboarding execution
	const roleId = ROLE_ID_MAP[role]
	setSelectedRole(role)
	setSelectedRoleId(roleId)
	setOnboardingStep('onboarding')
}
```

This prevents diagnostic centers and radiologists from completing their onboarding process.

#### Refactoring Recommendation

Enable radiology onboarding by mapping it to its onboarding steps:

```diff
 const handleRoleSelect = (role: OnboardingUserRole) => {
-	if (role === 'RADIOLOGY') return
 	const roleId = ROLE_ID_MAP[role]
 	setSelectedRole(role)
 	setSelectedRoleId(roleId)
 	setOnboardingStep('onboarding')
 }
```

---

### 2.2. Side-Effects in Pure Mapper (Separation of Concerns Violation)

- **Issue Type**: Architectural Code Pollution
- **Location:** [radiologyService.ts](src/features/radiology/radiologyService.ts#L65-L94)

#### Context & Impact

In `radiologyService.ts`, the map function `mapRadiologyDetailsApi` reads directly from browser `localStorage`:

```typescript
export const mapRadiologyDetailsApi = (data: RadiologyDetailsApiData): RadiologyProfile => {
	...
	let professionalMock = { ... }
	try {
		const stored = localStorage.getItem('radiology_professional_tab') // 🔴 Direct Side Effect
		if (stored) {
			professionalMock = JSON.parse(stored)
		}
	} catch { ... }
    ...
```

A data mapping utility must be a pure function. Coupling it to `localStorage` breaks testability, makes server-side rendering (SSR) impossible, and causes silent state sync failures.

#### Refactoring Recommendation

Pass optional local overrides to the mapper function, keeping the mapper pure:

```typescript
export const mapRadiologyDetailsApi = (
	data: RadiologyDetailsApiData,
	localOverrides?: Partial<RadiologyProfile['professional']>
): RadiologyProfile => {
	const det = data.details
	return {
		id: data.public_id ?? '',
		personal: { ... },
		professional: {
			degree: '',
			registrationNumber: det?.license_number ?? '',
			...localOverrides
		}
	}
}
```

---

### 2.3. Copy-Paste Settings Tab Drift & Naming Mismatch

- **Issue Type**: High Code Drift & Component Naming Collision
- **Locations**:
    - `src/features/radiology/profile/components/SettingsTab.tsx`
    - `src/features/laboratory/profile/components/LabSettingsTab.tsx`

#### Context & Impact

1. **Naming Mismatch**: Both settings components export a component named `PatientSettingTab`, leading to incorrect references during import:
    ```typescript
    // Inside radiology/profile/components/SettingsTab.tsx
    export default function PatientSettingTab() { ... } // 🔴 Mismatched name
    ```
2. **Text Drift & Data Leak (Crucial)**: In the Radiology Settings Tab, the settings labels are hardcoded for the **Pharmacy** module:
    ```typescript
    const notifRows = [
        { label: 'Get notifications for new prescription orders', ... }, // 🔴 Pharmacy domain
        { label: 'Get notified about low stock or inventory updates', ... }, // 🔴 Pharmacy domain
        { label: 'Receive pharmacy updates and health alerts', ... }, // 🔴 Pharmacy domain
    ]
    ```
    A radiologist or diagnostic technician will see notification settings related to prescription orders and inventory, which is confusing and functionally incorrect.

#### Refactoring Recommendation

Rename components to match their files and feature folders, and correct the domain-specific labels for each user role. For example, for Radiology:

```typescript
export default function RadiologySettingTab() {
    ...
    const notifRows = [
        { label: 'Get notifications for new scan bookings', ... },
        { label: 'Get alerts for pending report uploads', ... },
        { label: 'Receive radiology updates and diagnostic alerts', ... },
    ]
    ...
}
```

---

## 3. Medium Severity Issues

### 3.1. Duplicated S3 URL Builder Helper

- **Issue Type**: DRY (Don't Repeat Yourself) Principle Violation
- **Locations**:
    - `src/features/radiology/bookings/RadiologyBookingPage.tsx`
    - `src/features/radiology/bookings/BookingDetailPage.tsx#L141-L148`
    - `src/features/Pharmacy/orders/PlaceOrderPage.tsx#L49-L53`
    - `src/features/Pharmacy/orders/OrderDeatailPage.tsx#L218-L225`

#### Context & Impact

The `buildS3Url` helper is duplicated across at least four files. Some files contain a fallback S3 URL, while others do not. For example, the pharmacy version checks for existing full URL prefixes (`http://` or `https://`), but the radiology details page version does not. This leaves radiology open to broken image links if the backend returns a full URL.

#### Refactoring Recommendation

Move this helper to a single file, e.g., `src/utils/s3.ts`:

```typescript
// src/utils/s3.ts
const S3_BASE_URL = (import.meta.env.VITE_S3_BASE_URL as string) || ''

export const buildS3Url = (key?: string | null): string => {
	if (!key) return ''
	if (key.startsWith('http://') || key.startsWith('https://')) return key
	return `${S3_BASE_URL.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}
```

---

### 3.2. Local Component Re-declarations (`SectionCard`)

- **Issue Type**: UI Inconsistency and Duplicate Code
- **Locations**:
    - `src/features/radiology/bookings/BookingDetailPage.tsx#L57-L66`
    - `src/features/Pharmacy/orders/OrderDeatailPage.tsx#L175-L184`
    - `src/features/Pharmacy/orders/PlaceOrderPage.tsx#L720-L760`

#### Context & Impact

Each of these files defines a local `SectionCard` component. The inner padding, margins, and headings differ slightly between files (e.g., `p: 2` vs `p: 1.75`), which leads to inconsistent UI styling across the application's detail screens.

#### Refactoring Recommendation

Extract this into a generic component in `src/components/common/Card/SectionCard.tsx`:

```tsx
// src/components/common/Card/SectionCard.tsx
import { ReactNode } from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'
import { customCardStyle } from '../../../styles/commonStyles'

interface SectionCardProps {
	title: string
	stepNumber?: number
	children: ReactNode
}

export default function SectionCard({ title, stepNumber, children }: SectionCardProps) {
	return (
		<Card sx={{ ...customCardStyle, height: '100%', mb: 2 }}>
			<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
					{stepNumber !== undefined && (
						<Box
							sx={{
								width: 24,
								height: 24,
								borderRadius: '50%',
								bgcolor: 'primary.main',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{stepNumber}</Typography>
						</Box>
					)}
					<Typography variant="subtitle2" fontWeight={700} color="#1E2A2A">
						{title}
					</Typography>
				</Box>
				{children}
			</CardContent>
		</Card>
	)
}
```

---

### 3.3. Design System Bypasses (Inline Custom Switch Customization)

- **Issue Type**: Theme Divergence
- **Location**: `src/features/laboratory/profile/components/LabSettingsTab.tsx#L27-L62`

#### Context & Impact

Instead of using the standard `AppSwitch` component from `src/components/common/Switch/AppSwitch.tsx`, the `LabSettingsTab` manually redefines switch styles in a `switchSx` object. This bypasses the project's central design token controls and creates style redundancy.

#### Refactoring Recommendation

Import and use `AppSwitch`:

```diff
-import { Switch } from '@mui/material'
-const switchSx = { ... }
+import AppSwitch from '../../../../components/common/Switch/AppSwitch'

...
- <Switch checked={row.value} onChange={(e) => row.setter(e.target.checked)} sx={switchSx} />
+ <AppSwitch checked={row.value} onChange={(e) => row.setter(e.target.checked)} />
```

---

### 3.4. Incorrect File Extension for Plain TypeScript Utility

- **Issue Type**: Coding Standard Violation
- **Location**: `src/utils/Utils.tsx`

#### Context & Impact

The file `src/utils/Utils.tsx` contains only a formatting function `formatINR` and contains no JSX syntax. Files with no UI elements should use the `.ts` extension to prevent confusion and keep build/lint scopes accurate.

#### Refactoring Recommendation

Rename `src/utils/Utils.tsx` to `src/utils/Utils.ts` and update related import paths.

---

## 4. Low Severity Issues

### 4.1. Duplicate Route Registration

- **Issue Type**: Routing Redundancy
- **Location**: `src/routes/AppRoutes.tsx`

#### Context & Impact

In `AppRoutes.tsx`, the route path `ROUTES.PHARMACY.ORDER_DETAIL` is registered twice:

- Line 99: `<Route path={ROUTES.PHARMACY.ORDER_DETAIL} element={<OrderDetailPage />} />`
- Line 101: `<Route path={ROUTES.PHARMACY.ORDER_DETAIL} element={<OrderDetailPage />} />`

Similarly, `ROUTES.PHARMACY.ORDERS` is defined twice (lines 100 and 105). This is redundant and makes the routing map harder to maintain.

#### Refactoring Recommendation

Remove duplicate route elements from `AppRoutes.tsx`.

---

### 4.2. Inconsistent Feature Directory Casing

- **Issue Type**: Directory Casing Inconsistency
- **Location**: `src/features/`

#### Context & Impact

All feature directories are named in lowercase (e.g., `appointments`, `auth`, `doctor`, `radiology`, etc.), except for `src/features/Pharmacy` which is capitalized. This casing difference can cause issues on case-sensitive filesystems (like Linux-based CI/CD pipelines).

#### Refactoring Recommendation

Rename `src/features/Pharmacy` to `src/features/pharmacy` and update imports.
