// src/features/radiology/radiologyService.ts
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { RadiologyProfile } from './profile/RadiologyProfilePage'
import { RadiologySearchResultItem } from '../../types/radiology-search'
import { EMPTY_RADIOLOGY_PROFESSIONAL } from '../../types/radiology-profile'

export interface RadiologyDetailsApiPersonal {
	id: number
	public_id: string
	owner_name: string | null
	alternate_mobile: string | null
	whatsapp_number: string | null
	email: string | null
	contact_number: string | null
	avatar_s3_key: string | null
}

export interface RadiologyDetailsApiDetails {
	id: number
	name: string | null
	logo_s3_key: string | null
	license_number: string | null
	license_proof_s3_key: string | null
	gst_number: string | null
	address: string | null
	city: string | null
	state: string | null
	pincode: string | null
	latitude: number | null
	longitude: number | null
	operating_hours: Record<string, string>
	open_days: number[]
	payment_methods: string[]
}

export interface RadiologyDetailsApiData {
	id: number
	public_id: string
	owner_name: string
	alternate_mobile: string | null
	whatsapp_number: string | null
	avatar_s3_key: string | null
	email: string
	contact_number: string | null
	is_verified: boolean
	details: RadiologyDetailsApiDetails | null
}

export interface RadiologyDetailsApiResponse {
	success: boolean
	message: string
	data: RadiologyDetailsApiData
}

export interface RadiologyUpdateResponse {
	success: boolean
	message: string
}

// Maps API response -> RadiologyProfile shape used by frontend
export const mapRadiologyDetailsApi = (
	data: RadiologyDetailsApiData,
	localOverrides: Partial<RadiologyProfile['professional']> = {}
): RadiologyProfile => {
	const det = data.details

	return {
		id: data.public_id ?? '',
		personal: {
			name: data.owner_name ?? '',
			contactNumber: data.contact_number ?? '',
			contactVerified: !!data.contact_number,
			email: data.email ?? '',
			emailVerified: !!data.email,
			alternateMobile: data.alternate_mobile ?? '',
			whatsappNumber: data.whatsapp_number ?? '',
			avatar: data.avatar_s3_key ?? '',
		},
		professional: {
			...EMPTY_RADIOLOGY_PROFESSIONAL,
			...localOverrides,
			currentHospital: det?.name ?? localOverrides.currentHospital ?? '',
			registrationNumber: det?.license_number ?? localOverrides.registrationNumber ?? '',
		},
	}
}

export const getStoredRadiologyProfessionalOverrides = (): Partial<RadiologyProfile['professional']> => {
	if (typeof window === 'undefined') {
		return {}
	}

	try {
		const stored = window.localStorage.getItem('radiology_professional_tab')
		if (!stored) {
			return {}
		}

		const parsed = JSON.parse(stored) as Partial<RadiologyProfile['professional']>
		return parsed ?? {}
	} catch {
		return {}
	}
}

/** GET /api/radiology/profile — fetch full profile details */
export const getMyRadiologyProfile = async (): Promise<RadiologyDetailsApiResponse> => {
	const res = await ApiService.get<RadiologyDetailsApiResponse>(API_ENDPOINTS.RADIOLOGY_PROFILE.DETAILS)
	return res.data
}

/** PATCH /api/radiology/profile — update profile personal / details settings */
export const updateMyRadiologyProfile = async (
	payload: {
		owner_name?: string
		alternate_mobile?: string | null
		whatsapp_number?: string | null
		logo_s3_key?: string | null
	}
): Promise<RadiologyUpdateResponse> => {
	const res = await ApiService.patch<RadiologyUpdateResponse>(API_ENDPOINTS.RADIOLOGY_PROFILE.UPDATE, payload)
	return res.data
}

export interface ScanType {
	id: number
	name: string
	description: string | null
}

export interface RadiologyScan {
	id: number
	scan_type: ScanType
	pricing_model: 'fixed' | 'starting_from' | 'quote_required'
	base_price: number | null
	price_details: string | null
	is_available: boolean
}

export interface ScanTypesResponse {
	success: boolean
	message: string
	data: ScanType[]
}

export interface MyScansResponse {
	success: boolean
	message: string
	data: RadiologyScan[]
}

export interface ScanSetupItem {
	scan_type_id: number
	pricing_model: string
	base_price: number | null
	price_details: string | null
	is_available: boolean
}

/** GET /api/radiology/scan-types — fetch public list of scan categories */
export const getScanTypes = async (): Promise<ScanTypesResponse> => {
	const res = await ApiService.get<ScanTypesResponse>(API_ENDPOINTS.RADIOLOGY_PROFILE.SCAN_TYPES)
	return res.data
}

/** GET /api/radiology/scans — fetch this clinic's scan catalog configurations */
export const getMyScans = async (): Promise<MyScansResponse> => {
	const res = await ApiService.get<MyScansResponse>(API_ENDPOINTS.RADIOLOGY_PROFILE.SCANS)
	return res.data
}

/** PATCH /api/radiology/scans — update/configure this clinic's scan catalog */
export const updateMyScans = async (payload: { scans: ScanSetupItem[] }): Promise<MyScansResponse> => {
	const res = await ApiService.patch<MyScansResponse>(API_ENDPOINTS.RADIOLOGY_PROFILE.SCANS, payload)
	return res.data
}

/**
 * GET /api/radiology/scans?radiology_id=:id — fetch the bookable scan catalog for a specific
 * (public-facing) radiology center. Used by the patient-facing booking drawer (RadiologyBookingPage)
 * so a patient can pick from every scan offered at that center, not just the one they clicked
 * "Book Scan" on. Mirrors mobile's RadiologyService.fetchRadiologyScans.
 */
export const fetchRadiologyScansForCenter = async (radiologyId: string): Promise<MyScansResponse> => {
	const res = await ApiService.getWithParams<MyScansResponse>(API_ENDPOINTS.RADIOLOGY_PROFILE.SCANS, {
		radiology_id: radiologyId,
	})
	return res.data
}

export interface RadiologyBookingItem {
	id: number
	radiology_scan: RadiologyScan
	custom_scan_name: string | null
	quoted_price: number | null
}

export interface RadiologyBooking {
	id: number
	public_id: string
	patient_id: number
	patient_name: string
	patient_phone: string | null
	radiology_name: string
	radiology_public_id: string
	radiology_phone: string | null
	doctor_phone: string | null
	booking_date: string
	booking_time: string
	status: string
	payment_status: string
	prescription_verified: boolean
	verified_by_user_id: number | null
	verified_by_name: string | null
	verified_at: string | null
	total_price: number | null
	notes: string | null
	external_prescription_s3_key: string | null
	booking_items: RadiologyBookingItem[]
	created_at: string

	// Rich nested objects returned by the detail endpoint
	patient?: {
		id: string
		name: string
		phone: string | null
		age: number | null
		gender: string | null
		avatar_s3_key?: string | null
	}
	clinic?: {
		name: string
		phone: string | null
		address: string | null
	}
	radiology?: {
		id: string
		name: string
		phone: string | null
		address: string | null
	}
}

export interface RadiologyReport {
	id: number
	public_id: string
	booking_id: number
	patient_id: number
	report_pdf_s3_key: string
	dicom_images_s3_keys: string[] | null
	scan_images_s3_keys: string[] | null
	summary_findings: string | null
	uploaded_at: string
}

export interface BookingsResponse {
	success: boolean
	message: string
	data: RadiologyBooking[]
}

export interface BookingResponse {
	success: boolean
	message: string
	data: RadiologyBooking
}

export interface QuotePayload {
	items: Array<{
		booking_item_id: number
		custom_scan_name?: string
		quoted_price: number
	}>
	prescription_verified?: boolean
	notes?: string
}

export interface ReportPayload {
	report_pdf_s3_key: string
	dicom_images_s3_keys?: string[]
	scan_images_s3_keys?: string[]
	summary_findings?: string
}

export interface ReportResponse {
	success: boolean
	message: string
	data: RadiologyReport
}

/** GET /api/radiology/bookings — fetch booking queue for this diagnostic center */
export const getRadiologyBookings = async (status?: string): Promise<BookingsResponse> => {
	const params = status ? { status } : {}
	const res = await ApiService.getWithParams<BookingsResponse>(
		API_ENDPOINTS.RADIOLOGY_PROFILE.BOOKINGS,
		params
	)
	return res.data
}

/** GET /api/radiology/bookings/:id — fetch a specific booking order details */
export const getRadiologyBookingById = async (bookingId: string): Promise<BookingResponse> => {
	const res = await ApiService.get<BookingResponse>(API_ENDPOINTS.RADIOLOGY_PROFILE.BOOKING_DETAIL(bookingId))
	return res.data
}

/** PATCH /api/radiology/bookings/:id/quote — submit pricing quote for booking items */
export const submitRadiologyBookingQuote = async (
	bookingId: string,
	payload: QuotePayload
): Promise<RadiologyUpdateResponse> => {
	const res = await ApiService.patch<RadiologyUpdateResponse>(
		API_ENDPOINTS.RADIOLOGY_PROFILE.SUBMIT_QUOTE(bookingId),
		payload
	)
	return res.data
}

/** PATCH /api/radiology/bookings/:id/verify — verify booking prescription */
export const verifyRadiologyPrescription = async (bookingId: string): Promise<RadiologyUpdateResponse> => {
	const res = await ApiService.patch<RadiologyUpdateResponse>(
		API_ENDPOINTS.RADIOLOGY_PROFILE.VERIFY_PRESCRIPTION(bookingId),
		{}
	)
	return res.data
}

/** POST /api/radiology/bookings/:id/report — upload clinical scan report and complete booking */
export const uploadRadiologyReport = async (
	bookingId: string,
	payload: ReportPayload
): Promise<ReportResponse> => {
	const res = await ApiService.post<ReportResponse>(
		API_ENDPOINTS.RADIOLOGY_PROFILE.UPLOAD_REPORT(bookingId),
		payload
	)
	return res.data
}

// export interface RadiologySearchResponse {
// 	success: boolean
// 	message: string
// 	data: RadiologySearchResultItem[]
// }

export interface RadiologySearchResponse {
	success: boolean
	message: string
	data: RadiologySearchResultItem[]
	meta: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

// export const searchRadiologyCenters = async (params: {
// 	scan_type_id?: number
// 	city?: string


export const searchRadiologyCenters = async (params: {
	scan_type_id?: number
	city?: string
	search?: string
	page?: number
	limit?: number
	max_price?: number
	radiology_id?: string
}): Promise<RadiologySearchResponse> => {
	const res = await ApiService.getWithParams<RadiologySearchResponse>(
		API_ENDPOINTS.RADIOLOGY_PROFILE.SEARCH,
		params
	)

    return res.data
}

export interface RadiologyBookingCreatePayload {
	radiology_id: string
	scan_ids: number[]
	booking_date: string
	booking_time: string
	treatment_id?: string
	external_prescription_s3_key?: string
	notes?: string
}

export const createRadiologyBooking = async (
	payload: RadiologyBookingCreatePayload
): Promise<BookingResponse> => {
	const res = await ApiService.post<BookingResponse>(
		API_ENDPOINTS.RADIOLOGY_PROFILE.BOOKINGS,
		payload
	)
	return res.data
}

/** PATCH /api/radiology/bookings/:id/status — update booking status (radiology staff) */
export const updateRadiologyBookingStatus = async (
	bookingId: string,
	status: string
): Promise<{ success: boolean; message: string }> => {
	const res = await ApiService.patch<{ success: boolean; message: string }>(
		API_ENDPOINTS.RADIOLOGY_PROFILE.UPDATE_STATUS(bookingId),
		{ status }
	)
	return res.data
}
