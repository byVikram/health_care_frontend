// src/features/account/accountMenuService.ts
//
// What the account menu (the panel under the avatar in the navbar) is made of, from the two calls the mobile app's drawer uses:
//   GET /api/lookup/navigation   the rows of the menu, chosen by the signed-in user's role (stable keys, never routes)
//   GET /api/patients/me/summary the patient's card: name, display id, photo, how complete the profile is
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'

/** One sidebar row: `key` is what the app maps to a page, `icon` a stable icon key, `group` the capitals heading above it (null = none). */
export interface NavigationRow {
	key: string
	label: string
	icon: string
	group: string | null
}

export interface PatientSummary {
	public_id: string
	display_id: string
	name: string
	avatar_url?: string | null
	profile_completion: number
	family_count: number
}

interface Envelope<T> {
	success: boolean
	message?: string
	data: T
}

/** The user's sidebar rows, in display order. A failed call is the caller's to handle (the menu then shows its built-in rows). */
export const getNavigationRows = async (): Promise<NavigationRow[]> => {
	const res = await ApiService.get<Envelope<{ sidebar?: NavigationRow[] }>>(API_ENDPOINTS.LOOKUP.NAVIGATION, {
		suppressErrorToast: true,
	})
	return res.data.data?.sidebar ?? []
}

/** The signed-in patient's card data (patients only: the server answers any other role with a 403). */
export const getPatientSummary = async (): Promise<PatientSummary> => {
	const res = await ApiService.get<Envelope<PatientSummary>>(API_ENDPOINTS.PATIENT.SUMMARY, {
		suppressErrorToast: true,
	})
	return res.data.data
}
