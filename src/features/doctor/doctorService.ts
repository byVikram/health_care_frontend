// src/features/doctor/doctorService.ts
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { AppointmentsResponse } from '../../types/appointment'
import { DoctorSearchResponse } from '../../types/doctor-search'
import { DoctorDetailResponse } from '../../types/doctor-detail'
import { SpecialitiesResponse } from '../../types/speciality'
import {
	DoctorProfileApiResponse,
	DoctorProfileApiData,
	DoctorProfileApiHospital,
	DoctorProfileApiAvailability,
} from '../../types/doctor-profile-api'
import { DoctorProfile } from '../../types/doctor-profile'
import { SlotGroup } from '../../components/common/DateSlotPicker/DateSlotPicker'

export interface AppointmentParams {
	page?: number
	limit?: number
	appointment_date?: string
	search?: string
	hospital_id?: string
	status?: string
	appSearch?: string
	variant?: 'all' | 'upcoming'
}

export interface DoctorSearchParams {
	page?: number
	limit?: number
	search?: string
	speciality_id?: string
	consultation_type?: 'clinic' | 'video' | 'all'
	min_rating?: number
	max_price?: number
	sort?: string
}

export interface CreateAppointmentPayload {
	doctor_id: string
	hospital_id?: string
	appointment_mode: 'clinic_visit' | 'video_call'
	appointment_date: string
	start_time: string
	patient_id?: string
}

export interface CreateAppointmentResponse {
	success: boolean
	message: string
	data?: unknown
}

export const getAppointments = async (params?: AppointmentParams): Promise<AppointmentsResponse> => {
	const res = await ApiService.getWithParams<AppointmentsResponse>(
		API_ENDPOINTS.APPOINTMENTS.GET,
		(params ?? {}) as Record<string, unknown>
	)
	return res.data
}

export const createAppointment = async (payload: CreateAppointmentPayload): Promise<CreateAppointmentResponse> => {
	const res = await ApiService.post<CreateAppointmentResponse>(API_ENDPOINTS.APPOINTMENTS.CREATE, payload)
	return res.data
}

export const getDoctors = async (params?: DoctorSearchParams): Promise<DoctorSearchResponse> => {
	const res = await ApiService.getWithParams<DoctorSearchResponse>(
		API_ENDPOINTS.DOCTORS.SEARCH,
		(params ?? {}) as Record<string, unknown>
	)
	return res.data
}

export const getDoctorById = async (id: string): Promise<DoctorDetailResponse> => {
	const res = await ApiService.get<DoctorDetailResponse>(API_ENDPOINTS.DOCTORS.DETAIL(id))
	return res.data
}

export const getSpecialities = async (): Promise<SpecialitiesResponse> => {
	const res = await ApiService.get<SpecialitiesResponse>(API_ENDPOINTS.SPECIALITIES.LIST)
	return res.data
}

export type ApiAvailabilityMode = 'clinic_visit' | 'video_call'

export interface AvailabilityModeBlock {
	appointment_mode?: ApiAvailabilityMode
	sessions?: SlotGroup[]
}

export interface AvailabilityResponse {
	data?: SlotGroup[] | AvailabilityModeBlock[]
}

export type DoctorAvailabilityResponse = SlotGroup[] | AvailabilityModeBlock[] | AvailabilityResponse

export const isAvailabilityModeBlock = (item: unknown): item is AvailabilityModeBlock =>
	typeof item === 'object' && item !== null && ('appointment_mode' in item || 'sessions' in item)

export const getAvailabilityModeBlocks = (response: DoctorAvailabilityResponse): AvailabilityModeBlock[] => {
	const items = Array.isArray(response) ? response : Array.isArray(response.data) ? response.data : []
	return items.filter(isAvailabilityModeBlock)
}

export const getDoctorAvailability = async (params: {
	doctor_id?: string
	hospital_id: number | string
	date: string
}): Promise<DoctorAvailabilityResponse> => {
	const res = await ApiService.getWithParams<DoctorAvailabilityResponse>(
		API_ENDPOINTS.DOCTORS.AVAILABILITY,
		params as Record<string, unknown>
	)
	return res.data
}

// ── Slot overrides ────────────────────────────────────────────────────────────

export interface SlotOverridePayload {
	hospital_id?: string | null
	date: string // "YYYY-MM-DD"
	start_time: string // "HH:MM"
	end_time: string // "HH:MM"
	is_blocked: boolean
	reason?: string
}

export interface SlotOverrideBatchPayload {
	hospital_id?: string | null
	date: string // "YYYY-MM-DD"
	slots: Array<{
		start_time: string // "HH:MM"
		end_time: string // "HH:MM"
		is_blocked: boolean
	}>
	reason?: string
	appointment_mode?: string
}

export interface SlotOverrideResponse {
	success: boolean
	message: string
}

export const createSlotOverride = async (payload: SlotOverridePayload): Promise<SlotOverrideResponse> => {
	const res = await ApiService.post<SlotOverrideResponse>(API_ENDPOINTS.DOCTORS.OVERRIDES, payload)
	return res.data
}

export const createSlotOverrideBatch = async (payload: SlotOverrideBatchPayload): Promise<SlotOverrideResponse> => {
	const res = await ApiService.post<SlotOverrideResponse>(API_ENDPOINTS.DOCTORS.OVERRIDES, payload)
	return res.data
}

// -- Doctor profile -------------------------------------------------------------
export const getDoctorProfile = async (): Promise<DoctorProfileApiResponse> => {
	const res = await ApiService.get<DoctorProfileApiResponse>(API_ENDPOINTS.DOCTOR_PROFILE.DETAILS)
	return res.data
}

export const updateProfessionalDetails = async (data: Record<string, unknown>) => {
	const res = await ApiService.patch(API_ENDPOINTS.DOCTOR_PROFILE.PROFESSIONAL_DETAILS, data)
	return res.data
}

// Maps API response -> DoctorProfile (used by DoctorProfilePage)
const DAY_MAP: Record<number, keyof DoctorProfile['availability']> = {
	0: 'sunday',
	1: 'monday',
	2: 'tuesday',
	3: 'wednesday',
	4: 'thursday',
	5: 'friday',
	6: 'saturday',
}

export const mapDoctorProfileApi = (data: DoctorProfileApiData): DoctorProfile => {
	// Build availability: day_of_week -> slot_time[]
	const availability: DoctorProfile['availability'] = {
		sunday: [],
		monday: [],
		tuesday: [],
		wednesday: [],
		thursday: [],
		friday: [],
		saturday: [],
	}

	if (Array.isArray(data?.availability)) {
		data.availability.forEach((slot: DoctorProfileApiAvailability) => {
			const dayKey = DAY_MAP[slot.day_of_week]
			if (dayKey && slot.is_active && slot.slot_time) {
				const [h, m] = slot.slot_time.split(':').map(Number)
				const suffix = h >= 12 ? 'PM' : 'AM'
				const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
				const timeStr = `${String(hour).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}${suffix}`
				availability[dayKey].push(timeStr)
			}
		})
	}

	// Build hospitals — include all appointment-rules fields
	const hospitals: DoctorProfile['hospitals'] = Array.isArray(data?.hospitals)
		? data.hospitals.map((h: DoctorProfileApiHospital) => ({
				id: h.hospital?.id ?? h.id,
				name: h.hospital?.name ?? '',
				location: h.hospital?.address ?? '',
				fullAddress: h.hospital?.address ?? '',
				isPrimary: h.is_primary ?? false,
				video_consultation_fee: h.hospital?.video_consultation_fee ?? '',
				clinic_consultation_fee: h.hospital?.clinic_consultation_fee ?? '',
				phone_number: h.hospital?.contact_number ?? '',
				free_followup_validity_days: h.appointment_rules?.free_followup_validity_days ?? h.free_followup_validity_days ?? 7,
				reschedule_allowed_until_hours: h.appointment_rules?.reschedule_allowed_until_hours ?? h.reschedule_allowed_until_hours ?? 2,
				allow_pay_later: h.appointment_rules?.allow_pay_later ?? h.allow_pay_later ?? false,
				availability: h.availability,
			}))
		: []

	const pd = data?.personal_details
	const prof = data?.professional_details

	return {
		id: '',
		specialization: prof?.specialities?.[0]?.label ?? '',
		personal: {
			name: pd?.name ?? '',
			contactNumber: '',
			contactVerified: false,
			email: pd?.email ?? '',
			emailVerified: false,
			gender: pd?.gender ?? '',
			dateOfBirth: pd?.date_of_birth ?? '',
			location: pd?.location ?? '',
			instagram: pd?.instagram ?? '',
			facebook: pd?.facebook ?? '',
			twitter: pd?.twitter ?? '',
			avatar: pd?.avatar_s3_key ?? '',
			experience: String(prof?.experience_years ?? 0),
			languages: pd?.languages ?? [],
		},
		professional: {
			specialization_id: prof?.specialities?.[0]?.id ?? '',
			specialization_label: prof?.specialities?.[0]?.label ?? '',
			degree: prof?.degree ?? '',
			college: prof?.college ?? '',
			yearOfPassing: prof?.year_of_passing ?? '',
			qualificationProof: prof?.qualification_proof_s3_key ?? '',
			registrationNumber: prof?.registration_number ?? '',
			registrationProof: prof?.registration_proof_s3_key ?? '',
			about: prof?.about ?? '',
		},
		hospitals,
		availability,
	}
}

// -- Favourite doctors ---------------------------------------------------------

export interface FavouriteDoctor {
	id: string
	name: string
	is_verified: boolean
	avatar_s3_key: string | null
	location: string | null
	experience_years: number | null
	specialities: string[]
}

export interface FavouritesResponse {
	success: boolean
	message: string
	data: {
		favourites: FavouriteDoctor[]
		favourite_ids: string[]
	}
}

export interface ToggleFavouriteResponse {
	success: boolean
	message: string
	data: {
		action: 'added' | 'removed'
		favourite_ids: string[]
	}
}

export const getFavouriteDoctors = async (): Promise<FavouritesResponse> => {
	const res = await ApiService.get<FavouritesResponse>(API_ENDPOINTS.DOCTORS_FAVOURITES.GET)
	return res.data
}

export const toggleFavouriteDoctor = async (publicId: string): Promise<ToggleFavouriteResponse> => {
	const res = await ApiService.post<ToggleFavouriteResponse>(API_ENDPOINTS.DOCTORS_FAVOURITES.TOGGLE(publicId), {})
	return res.data
}

// -- Hospitals ---------------------------------------------------------

export interface CreateHospitalPayload {
	name: string
	phone_number?: string
	full_address?: string
	video_consultation_fee?: string
	offline_consultation_fee?: string
	is_primary?: boolean
}

export interface CreateHospitalResponse {
	message: string
	data: {
		hospital_id: string
		public_id : string
	}
}

export interface UpdateHospitalPayload {
	hospital_id: string
	// Hospital table fields
	name?: string
	full_address?: string
	phone_number?: string
	// DoctorHospital link fields
	is_primary?: boolean
	video_consultation_fee?: string
	offline_consultation_fee?: string
	available_days?: string[]
	working_hours?: string
	free_followup_validity_days?: number
	reschedule_allowed_until_hours?: number
	allow_pay_later?: boolean
}

export interface AvailabilitySlot {
	start_time: string
	end_time: string
	slot_duration: number
	buffer_time: number
}

export interface UpdateAvailabilityPayload {
	hospital_id: string
	day_of_week: number
	appointment_mode: string
	slots: AvailabilitySlot[]
	is_active?: boolean
}


export const createHospital = async (data: CreateHospitalPayload): Promise<CreateHospitalResponse> => {
	const res = await ApiService.post<CreateHospitalResponse>(API_ENDPOINTS.DOCTOR_PROFILE.HOSPITALS, data)
	return res.data
}

export const updateHospital = async (payload: UpdateHospitalPayload) => {
	return ApiService.patch(API_ENDPOINTS.DOCTOR_PROFILE.UPDATE_HOSPITAL, payload)
}

export const updateAvailability = async (payload: UpdateAvailabilityPayload) => {
	return ApiService.patch(API_ENDPOINTS.DOCTOR_PROFILE.UPDATE_AVAILABILITY, payload)
}
