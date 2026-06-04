// src/features/Pharmacy/pharmacyService.ts
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { PharmacyProfile } from '../Pharmacy/profile/PharmacyProfilePage'

// ── Types: Pharmacy list ──────────────────────────────────────────────────────

export interface PharmacyListParams {
	page?: number
	limit?: number
	search?: string
	city?: string
	home_delivery?: boolean
	is_24_x_7?: boolean
	emergency_medicine?: boolean
}

export interface PharmacyListItem {
	id: string
	name: string | null
	owner_name: string | null
	avatar_s3_key: string | null
	address: string | null
	city: string | null
	operating_hours: Record<string, string>
	home_delivery_available: boolean
	is_24_x_7: boolean
	emergency_medicine_available: boolean
}

export interface PharmacyListResponse {
	success: boolean
	message: string
	data: PharmacyListItem[]
	meta: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

// ── Types: Pharmacy details API response (matches service.py output) ───────────

export interface PharmacyDetailsApiPersonal {
	owner_name: string | null
	mobile_number: string | null
	alternate_mobile: string | null
	whatsapp_number: string | null
	email: string | null
	avatar_s3_key: string | null
}

export interface PharmacyDetailsApiPharmacy {
	name: string | null
	logo_s3_key: string | null
	drug_license_number: string | null
	drug_license_s3_key: string | null
	gst_number: string | null
	gst_certificate_s3_key: string | null
	address: string | null
	city: string | null
	state: string | null
	pincode: string | null
	landmark: string | null
	latitude: number | null
	longitude: number | null
}

export interface PharmacyDetailsApiServices {
	operating_hours: Record<string, string>
	open_days: string[]
	payment_methods: string[]
	home_delivery_available: boolean
	delivery_radius_km: number | null
	estimated_delivery_time_mins: number | null
	min_order_amount: number | null
	is_24_x_7: boolean
	emergency_medicine_available: boolean
}

export interface PharmacyDetailsApiData {
	id: string
	is_verified: boolean
	personal: PharmacyDetailsApiPersonal
	pharmacy: PharmacyDetailsApiPharmacy
	services: PharmacyDetailsApiServices
}

export interface PharmacyDetailsApiResponse {
	success: boolean
	message: string
	data: PharmacyDetailsApiData
}

// ── Types: Pharmacy me (basic profile) ────────────────────────────────────────

export interface PharmacyMeApiData {
	id: string
	owner_name: string | null
	avatar_s3_key: string | null
	is_verified: boolean
}

export interface PharmacyMeApiResponse {
	success: boolean
	message: string
	data: PharmacyMeApiData
}

// ── Types: Pharmacy details update payload (matches schema.py) ────────────────

export interface OperatingHours {
	[day: string]: string // e.g. { monday: "09:00-21:00" }
}

export interface PharmacyDetailsUpdatePayload {
	// Personal Info
	owner_name?: string
	alternate_mobile?: string
	whatsapp_number?: string
	// Pharmacy Core
	name?: string
	// Compliance
	drug_license_number?: string
	gst_number?: string
	// Location
	address?: string
	city?: string
	state?: string
	pincode?: string
	landmark?: string
	latitude?: number
	longitude?: number
	// Services
	operating_hours?: OperatingHours
	open_days?: string[]
	payment_methods?: string[]
	home_delivery_available?: boolean
	delivery_radius_km?: number | null
	estimated_delivery_time_mins?: number | null
	min_order_amount?: number | null
	is_24_x_7?: boolean
	emergency_medicine_available?: boolean
}

export interface PharmacyUpdateResponse {
	success: boolean
	message: string
}

// ── Types: Pharmacy orders ────────────────────────────────────────────────────

export interface PharmacyOrderCreatePayload {
	pharmacy_public_id: string
	treatment_public_id?: string
	external_prescription_s3_key?: string
	delivery_type: 'home_delivery' | 'pickup'
	delivery_address_public_id?: string
	notes?: string
}

export interface PharmacyOrderStatusUpdatePayload {
	status: string
	bill_amount?: number
	rejection_reason?: string
}

export interface PharmacyOrderMedicine {
	id?: string
	medication: string
	frequency: string
	totalTablets: number
	purchasedTablets: number
	instructions: string
}

export interface PharmacyOrderMedicinesUpdatePayload {
	medicines: PharmacyOrderMedicine[]
}

export interface PharmacyOrderReminderPayload {
	reminderDate: string
	autoNotify: boolean
}

export interface PharmacyOrderDeliveryAddress {
	id: string
	address_line1: string
	address_line2: string | null
	city: string
	state: string
	pincode: string
	landmark: string | null
}

export interface PharmacyOrder {
	id: string
	created_at: string
	updated_at: string
	status: string
	bill_amount: number
	delivery_type: string
	delivery_address: object | null
	rejection_reason: string | null
	notes: string | null
	treatment_id: string
	external_prescription_s3_key: string
	pharmacy: {
		id: string
		name: string
		avatar_s3_key: string | null
		alternate_mobile: string
		address: string
		city: string
	}
	patient: {
		id: string
		name: string
		avatar_s3_key: string | null
		gender: string | null
		age: number | null
	}
	medicines?: PharmacyOrderMedicine[]
}

export interface PharmacyOrderResponse {
	success: boolean
	message: string
	data: PharmacyOrder
}

export interface PharmacyOrdersListResponse {
	success: boolean
	message: string
	data: PharmacyOrder[]
}

// ── Mapper: API response → local PharmacyProfile shape ───────────────────────

export const mapPharmacyDetailsApi = (data: PharmacyDetailsApiData): PharmacyProfile => {
	const p = data.personal
	const ph = data.pharmacy
	const sv = data.services

	return {
		id: data.id ?? '',
		pharmacyType: ph?.name ?? '',
		personal: {
			name: p?.owner_name ?? '',
			contactNumber: p?.mobile_number ?? '',
			contactVerified: !!p?.mobile_number,
			email: p?.email ?? '',
			emailVerified: !!p?.email,
			alternateMobile: p?.alternate_mobile ?? '',
			whatsappNumber: p?.whatsapp_number ?? '',
			avatar: p?.avatar_s3_key ?? '',
		},
		professional: {
			pharmacyName: ph?.name ?? '',
			logo: ph?.logo_s3_key ?? '',
			drugLicenseNumber: ph?.drug_license_number ?? '',
			drugLicenseProof: ph?.drug_license_s3_key ?? '',
			gstNumber: ph?.gst_number ?? '',
			gstCertificateProof: ph?.gst_certificate_s3_key ?? '',
			address: ph?.address ?? '',
			city: ph?.city ?? '',
			state: ph?.state ?? '',
			pincode: ph?.pincode ?? '',
			landmark: ph?.landmark ?? '',
			latitude: ph?.latitude != null ? String(ph.latitude) : '',
			longitude: ph?.longitude != null ? String(ph.longitude) : '',
		},
		services: {
			is_24_x_7: sv?.is_24_x_7 ?? false,
			open_days: sv?.open_days ?? [],
			operating_hours: sv?.operating_hours ?? {},
			home_delivery_available: sv?.home_delivery_available ?? false,
			delivery_radius_km: sv?.delivery_radius_km != null ? String(sv.delivery_radius_km) : '',
			estimated_delivery_time_mins:
				sv?.estimated_delivery_time_mins != null ? String(sv.estimated_delivery_time_mins) : '',
			min_order_amount: sv?.min_order_amount != null ? String(sv.min_order_amount) : '',
			emergency_medicine_available: sv?.emergency_medicine_available ?? false,
			payment_methods: sv?.payment_methods ?? [],
		},
	}
}

// ── Pharmacy profile API calls ────────────────────────────────────────────────

/** GET /api/pharmacies — public paginated list of verified pharmacies */
export const getPharmacies = async (params?: PharmacyListParams): Promise<PharmacyListResponse> => {
	const res = await ApiService.getWithParams<PharmacyListResponse>(
		API_ENDPOINTS.PHARMACIES.LIST,
		(params ?? {}) as Record<string, unknown>
	)
	return res.data
}

/** GET /api/pharmacies/me — basic profile of the logged-in pharmacy owner */
export const getMyPharmacyProfile = async (): Promise<PharmacyMeApiResponse> => {
	const res = await ApiService.get<PharmacyMeApiResponse>(API_ENDPOINTS.PHARMACY.ME)
	return res.data
}

/** GET /api/pharmacies/me/details — full pharmacy details (personal, pharmacy, services) */
export const getMyPharmacyDetails = async (): Promise<PharmacyDetailsApiResponse> => {
	const res = await ApiService.get<PharmacyDetailsApiResponse>(API_ENDPOINTS.PHARMACY.ME_DETAILS)
	return res.data
}

/** PATCH /api/pharmacies/me/details — update pharmacy details and services */
export const updateMyPharmacyDetails = async (
	payload: PharmacyDetailsUpdatePayload
): Promise<PharmacyUpdateResponse> => {
	const res = await ApiService.patch<PharmacyUpdateResponse>(API_ENDPOINTS.PHARMACY.ME_DETAILS, payload)
	return res.data
}

// ── Pharmacy orders API calls ─────────────────────────────────────────────────

/** POST /api/pharmacy-orders — patient places a new order */
export const createPharmacyOrder = async (payload: PharmacyOrderCreatePayload): Promise<PharmacyOrderResponse> => {
	const res = await ApiService.post<PharmacyOrderResponse>(API_ENDPOINTS.PHARMACY_ORDERS.CREATE, payload)
	return res.data
}

/** GET /api/pharmacy-orders — list orders (patient sees own; pharmacy sees assigned) */
export const getPharmacyOrders = async (): Promise<PharmacyOrdersListResponse> => {
	const res = await ApiService.get<PharmacyOrdersListResponse>(API_ENDPOINTS.PHARMACY_ORDERS.LIST)
	return res.data
}

/** GET /api/pharmacy-orders/:id — get a specific order by public ID */
export const getPharmacyOrderById = async (orderPublicId: string): Promise<PharmacyOrderResponse> => {
	const res = await ApiService.get<PharmacyOrderResponse>(API_ENDPOINTS.PHARMACY_ORDERS.GET_BY_ID(orderPublicId))
	return res.data
}

/** PATCH /api/pharmacy-orders/:id/status — pharmacy updates order status */
export const updatePharmacyOrderStatus = async (
	orderPublicId: string,
	payload: PharmacyOrderStatusUpdatePayload
): Promise<PharmacyOrderResponse> => {
	const res = await ApiService.patch<PharmacyOrderResponse>(
		API_ENDPOINTS.PHARMACY_ORDERS.UPDATE_STATUS(orderPublicId),
		payload
	)
	return res.data
}

/** PUT /api/pharmacy-orders/:id/medicines - update medicines for an order */
export const updatePharmacyOrderMedicines = async (
	orderPublicId: string,
	payload: PharmacyOrderMedicinesUpdatePayload
): Promise<PharmacyOrderResponse> => {
	const res = await ApiService.put<PharmacyOrderResponse>(
		API_ENDPOINTS.PHARMACY_ORDERS.UPDATE_MEDICINES(orderPublicId),
		payload
	)
	return res.data
}

/** POST /api/pharmacy-orders/:id/remind - send medicine reminder */
export const sendPharmacyOrderReminder = async (
	orderPublicId: string,
	payload: PharmacyOrderReminderPayload
): Promise<PharmacyOrderResponse> => {
	const res = await ApiService.post<PharmacyOrderResponse>(
		API_ENDPOINTS.PHARMACY_ORDERS.SEND_REMINDER(orderPublicId),
		payload
	)
	return res.data
}