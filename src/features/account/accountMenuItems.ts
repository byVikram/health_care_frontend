// src/features/account/accountMenuItems.ts
//
// The web's answer to "what does this row open?". The server sends rows by stable KEY (appointments, medicine_orders, settings ...);
// the app keeps its own key -> page table and skips a key it does not know, so the same list can serve the mobile app, which has
// pages the web does not (lab bookings, home care orders ...): a row with no page here is simply not shown, never a dead link.
import { ROUTES } from '../../constants/routes'
import { USER_ROLES } from '../../constants/constants'
import type { NavigationRow } from './accountMenuService'

/** The path of the profile page (both profiles have tabs: ?tab=settings, and for the doctor ?tab=availability). */
const PROFILE = ROUTES.PORTAL.PROFILE

/** The page a row opens for this role, or null when the web has none (the row is then left out). `#help-line` scrolls to the help line. */
export function targetOf(key: string, role: string): string | null {
	const doctor = role === USER_ROLES.DOCTOR
	switch (key) {
		case 'appointments':
			return doctor ? ROUTES.SCHEDULE : ROUTES.BOOKINGS
		case 'medicine_orders':
			return doctor ? null : ROUTES.PHARMACY.ORDERS
		// No pages of their own on the web: they open My bookings on that category (the list holds lab, home-care, pharmacy and doctor
		// bookings together), and the treatment history is the doctor visits already finished.
		case 'lab_bookings':
			return doctor ? null : `${ROUTES.BOOKINGS}?category=lab`
		case 'home_care_orders':
			return doctor ? null : `${ROUTES.BOOKINGS}?category=ancillary`
		case 'treatment_history':
			return doctor ? null : `${ROUTES.BOOKINGS}?when=past&category=doctor`
		case 'radiology_bookings':
			return doctor ? null : ROUTES.RADIOLOGY.BOOKINGS
		case 'doctor_availability':
			return doctor ? `${PROFILE}?tab=availability` : null
		case 'settings':
			return `${PROFILE}?tab=settings`
		case 'help':
			return '#help-line'
		default:
			return null
	}
}

/** What the menu shows while the server's list is loading, when it fails, or when it is empty: the shipped rows for each role (the
 * backend's `navigation_defaults.py`). */
export const DEFAULT_ROWS: Record<string, NavigationRow[]> = {
	patient: [
		{ key: 'appointments', label: 'Appointments', icon: 'appointments', group: 'BOOKINGS & ORDERS' },
		{ key: 'medicine_orders', label: 'Medicine Orders', icon: 'medicine', group: 'BOOKINGS & ORDERS' },
		{ key: 'lab_bookings', label: 'Lab Bookings', icon: 'lab', group: 'BOOKINGS & ORDERS' },
		{ key: 'radiology_bookings', label: 'Radiology Bookings', icon: 'radiology', group: 'BOOKINGS & ORDERS' },
		{ key: 'home_care_orders', label: 'Home Care Orders', icon: 'home-care', group: 'BOOKINGS & ORDERS' },
		{ key: 'care_ai', label: 'Care AI', icon: 'care-ai', group: 'HEALTH' },
		{ key: 'treatment_history', label: 'Treatment History', icon: 'treatment', group: 'HEALTH' },
		{ key: 'help', label: 'Help & Support', icon: 'help', group: 'SUPPORT' },
		{ key: 'settings', label: 'Settings', icon: 'settings', group: 'SUPPORT' },
	],
	doctor: [
		{ key: 'appointments', label: 'Appointments', icon: 'appointments', group: null },
		{ key: 'doctor_past_visits', label: 'Past Visits', icon: 'past-visits', group: null },
		{ key: 'doctor_availability', label: 'Availability', icon: 'availability', group: null },
		{ key: 'notifications', label: 'Notifications', icon: 'notifications', group: null },
		{ key: 'help', label: 'Help & Support', icon: 'help', group: null },
		{ key: 'settings', label: 'Settings', icon: 'settings', group: null },
	],
}

/** The icon key -> SVG path (24x24) table: the paths of the design's menu, the rest drawn in the same style. */
export const ICON_PATHS: Record<string, string> = {
	appointments: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
	medicine: 'M10.5 20.5a4.95 4.95 0 0 1-7-7l6-6a4.95 4.95 0 0 1 7 7zM8.5 8.5l7 7',
	lab: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 15h9',
	radiology: 'M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4M12 7v10M9 9h6M8.5 12h7M9 15h6',
	'home-care': 'M3 11l9-7 9 7M5 10v10h14V10M12 17.5s-3-1.8-3-4a1.5 1.5 0 0 1 3-.8 1.5 1.5 0 0 1 3 .8c0 2.2-3 4-3 4z',
	'care-ai':
		'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
	treatment: 'M14 3v5h5M6 3h8l5 5v13H6zM9 13h6M9 17h6',
	help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01',
	settings:
		'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1',
	'past-visits': 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2 2M5 3L2 6M19 3l3 3',
	availability: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
	notifications: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0',
	bookings: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
	earnings: 'M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14.5h.01',
}
/** An icon key this table does not know gets a plain circle. */
export const FALLBACK_ICON = 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z'
