// src/features/doctor/doctorService.ts
import ApiService from '../../services/apiService'
import dayjs from 'dayjs'
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
import { DoctorProfile, DoctorAchievementItem, DoctorAchievementType } from '../../types/doctor-profile'
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
	latitude?: number
	longitude?: number
	nearby?: boolean
	radius?: number
}

export interface CreateAppointmentPayload {
	doctor_id: string
	hospital_id?: string
	appointment_mode: 'clinic_visit' | 'video_call'
	appointment_date: string
	start_time: string
	patient_id?: string
	consent_version_id: string
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

export const getDoctors = async (params?: DoctorSearchParams, signal?: AbortSignal): Promise<DoctorSearchResponse> => {
	const res = await ApiService.getWithParams<DoctorSearchResponse>(
		API_ENDPOINTS.DOCTORS.SEARCH,
		(params ?? {}) as Record<string, unknown>,
		{ signal }
	)
	return res.data
}



export const getDoctorById = async (id: string, latitude?: number, longitude?: number, signal?: AbortSignal): Promise<DoctorDetailResponse> => {
	const params: Record<string, unknown> = {}
	if (latitude !== undefined) params.latitude = latitude
	if (longitude !== undefined) params.longitude = longitude
	const res = await ApiService.getWithParams<DoctorDetailResponse>(
		API_ENDPOINTS.DOCTORS.DETAIL(id),
		params,
		{ signal }
	)
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

export interface ActiveConsentResponse {
	success: boolean
	data: {
		id: string
		version: string
		content: { points: string[] } | string
		is_active: boolean
	}
}

export const getActiveConsent = async (): Promise<ActiveConsentResponse['data']> => {
	const res = await ApiService.get<ActiveConsentResponse>(API_ENDPOINTS.APPOINTMENTS.ACTIVE_CONSENT)
	return res.data.data
}

export interface DoctorStatusResponse {
	success: boolean
	data: {
		profile_completed: boolean
		is_verified: boolean
	}
}

export const getDoctorStatus = async (): Promise<DoctorStatusResponse['data']> => {
	const res = await ApiService.get<DoctorStatusResponse>(API_ENDPOINTS.DOCTOR_PROFILE.STATUS)
	return res.data.data
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

export const updatePersonalDetails = async (data: Record<string, unknown>) => {
	const res = await ApiService.patch(API_ENDPOINTS.DOCTOR_PROFILE.PERSONAL_DETAILS, data)
	return res.data
}

export const updateProfessionalDetails = async (data: Record<string, unknown>) => {
	const res = await ApiService.patch(API_ENDPOINTS.DOCTOR_PROFILE.PROFESSIONAL_DETAILS, data)
	return res.data
}

export const updateAdditionalDetails = async (data: Record<string, unknown>) => {
	const res = await ApiService.patch(API_ENDPOINTS.DOCTOR_PROFILE.ADDITIONAL_DETAILS, data)
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
				video_consultation_fee: h.hospital?.video_consultation_fee ?? 0,
				clinic_consultation_fee: h.hospital?.clinic_consultation_fee ?? 0,
				phone_number: h.hospital?.contact_number ?? '',
				free_followup_validity_days:
					h.appointment_rules?.free_followup_validity_days ?? h.free_followup_validity_days ?? 7,
				reschedule_allowed_until_hours:
					h.appointment_rules?.reschedule_allowed_until_hours ?? h.reschedule_allowed_until_hours ?? 2,
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
			contactNumber: pd?.contact_number ?? '',
			contactVerified: false,
			email: pd?.email ?? '',
			emailVerified: false,
			gender: pd?.gender ?? '',
			dateOfBirth: pd?.date_of_birth ? dayjs(pd.date_of_birth, 'YYYY-MM-DD').format('DD/MM/YYYY') : '',
			location: pd?.location ?? '',
			instagram: pd?.social_media_handles?.instagram ?? '',
			facebook: pd?.social_media_handles?.facebook ?? '',
			twitter: pd?.social_media_handles?.twitter ?? '',
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
			degrees: Array.isArray(prof?.degrees)
				? prof.degrees.map((d) => ({
						id: d.id,
						degree: d.degree,
						specialization: d.specialization || '',
						college: d.college,
						yearOfPassing: d.year_of_passing,
						qualificationProof: d.qualification_proof_s3_key || '',
					}))
				: [],
			registrationNumber: prof?.registration_number ?? '',
			registrationProof: prof?.registration_proof_s3_key ?? '',
			about: prof?.about ?? '',
		},
		hospitals,
		availability,
		additionalDetail: {
			treatments: data?.additionalDetail?.treatments ?? [],
			areas_of_expertise: data?.additionalDetail?.areas_of_expertise ?? [],
		},
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

export const getAreaOfExpertise = async () => {
	const res = await ApiService.get(API_ENDPOINTS.AREA_OF_EXPERTISE.LIST)
	return res.data
}

export const getTreatmentOfferings = async () => {
	const res = await ApiService.get(API_ENDPOINTS.TREATMENT_OFFERINGS.LIST)
	return res.data
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

// -- Patient Favourite doctors ---------------------------------------------------------

export const getPatientFavouriteDoctors = async (): Promise<FavouritesResponse> => {
	const res = await ApiService.get<FavouritesResponse>(API_ENDPOINTS.PATIENT.FAVOURITES)
	return res.data
}

export const togglePatientFavouriteDoctor = async (publicId: string): Promise<ToggleFavouriteResponse> => {
	const res = await ApiService.post<ToggleFavouriteResponse>(API_ENDPOINTS.PATIENT.TOGGLE_FAVOURITE(publicId), {})
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
		public_id: string
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

export interface BulkAvailabilityPayload {
	hospital_id: string
	availability: Record<number, Record<string, unknown>>
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

export const updateWeeklyAvailability = async (payload: BulkAvailabilityPayload) => {
	return ApiService.patch(API_ENDPOINTS.DOCTOR_PROFILE.UPDATE_AVAILABILITY, payload)
}

// ----pre-intake --------------------------------------------------------------

export interface PreIntakePayload {
	symptoms?: string
	duration?: string
	severity?: 'mild' | 'moderate' | 'severe'
}

export const updatePreIntake = async (appointmentId: string, payload: PreIntakePayload) => {
	const res = await ApiService.patch(API_ENDPOINTS.APPOINTMENTS.PRE_INTAKE(appointmentId), payload)

	return res.data
}

// -- Doctor achievements --------------------------------------------------------

export interface AchievementsResponse {
	success: boolean
	message: string
	data: DoctorAchievementItem[]
}

export interface AchievementResponse {
	success: boolean
	message: string
	data: DoctorAchievementItem
}

export interface AchievementPayload {
	title: string
	achievement_type: DoctorAchievementType
	organization?: string | null
	achievement_date?: string | null // YYYY-MM-DD
	description?: string | null
	document_s3_key?: string | null
	is_public?: boolean
}

export const getAchievements = async (): Promise<AchievementsResponse> => {
	const res = await ApiService.get<AchievementsResponse>(API_ENDPOINTS.DOCTOR_PROFILE.ACHIEVEMENTS)
	return res.data
}

export const createAchievement = async (payload: AchievementPayload): Promise<AchievementResponse> => {
	const res = await ApiService.post<AchievementResponse>(API_ENDPOINTS.DOCTOR_PROFILE.ACHIEVEMENTS, payload)
	return res.data
}

export const updateAchievement = async (
	publicId: string,
	payload: Partial<AchievementPayload>
): Promise<AchievementResponse> => {
	const res = await ApiService.put<AchievementResponse>(
		API_ENDPOINTS.DOCTOR_PROFILE.ACHIEVEMENT_BY_ID(publicId),
		payload
	)
	return res.data
}

export const deleteAchievement = async (publicId: string) => {
	const res = await ApiService.delete(API_ENDPOINTS.DOCTOR_PROFILE.ACHIEVEMENT_BY_ID(publicId))
	return res.data
}
