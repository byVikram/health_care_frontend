// src/features/laboratory/laboratoryService.ts
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { LaboratoryProfile, LaboratoryProfilePersonal, LaboratoryProfileProfessional, LaboratoryService } from '../../types/laboratory-profile'
import { LaboratorySearchResultItem } from '../../types/laboratory-search'

// ── Shape of what the API returns ──────────────────────────────────────────
interface LaboratoryProfileApiResponse {
	id: string
	lab_type?: string
	name?: string
	contact_number?: string
	contact_verified?: boolean
	email?: string
	email_verified?: boolean
	gender?: string
	date_of_birth?: string
	location?: string
	avatar?: string
	instagram?: string
	facebook?: string
	lab_name?: string
	specialization_id?: string
	specialization_label?: string
	degree?: string
	institute?: string
	year_of_passing?: string
	qualification_proof?: string
	registration_number?: string
	registration_proof?: string
	accreditation_body?: string
	accreditation_number?: string
	accreditation_proof?: string
	certification_authority?: string
	license_expiry_date?: string
	current_lab?: string
	years_of_experience?: string
	previous_organization?: string
	area_of_expertise?: string
	skills?: string[]
	lab_license_proof?: string
	training_certificate_proof?: string
	internship_proof?: string
	id_verification_proof?: string
	about?: string
	operating_since?: string
	services?: LaboratoryService[]
}

// ── Map API → local shape ────────────────────────────────────────────────
export function mapLaboratoryProfileApi(data: LaboratoryProfileApiResponse): LaboratoryProfile {
	return {
		id: data.id ?? '',
		labType: data.lab_type ?? '',
		personal: {
			name: data.name ?? '',
			contactNumber: data.contact_number ?? '',
			contactVerified: data.contact_verified ?? false,
			email: data.email ?? '',
			emailVerified: data.email_verified ?? false,
			gender: data.gender ?? '',
			dateOfBirth: data.date_of_birth ?? '',
			location: data.location ?? '',
			avatar: data.avatar ?? '',
			instagram: data.instagram ?? '',
			facebook: data.facebook ?? '',
		},
		professional: {
			specializationId: data.specialization_id ?? '',
			specializationLabel: data.specialization_label ?? '',
			degree: data.degree ?? '',
			institute: data.institute ?? '',
			yearOfPassing: data.year_of_passing ?? '',
			qualificationProof: data.qualification_proof ?? '',
			registrationNumber: data.registration_number ?? '',
			certificationAuthority: data.certification_authority ?? data.accreditation_body ?? '',
			licenseExpiryDate: data.license_expiry_date ?? data.accreditation_number ?? '',
			registrationProof: data.registration_proof ?? '',
			currentLab: data.current_lab ?? data.lab_name ?? '',
			yearsOfExperience: data.years_of_experience ?? data.operating_since ?? '',
			previousOrganization: data.previous_organization ?? '',
			areaOfExpertise: data.area_of_expertise ?? '',
			skills: data.skills ?? [],
			labLicenseProof: data.lab_license_proof ?? '',
			trainingCertificateProof: data.training_certificate_proof ?? '',
			internshipProof: data.internship_proof ?? '',
			idVerificationProof: data.id_verification_proof ?? '',
			about: data.about ?? '',
		},
		services: data.services ?? [],
	}
}

// ── Profile API calls (existing — untouched) ───────────────────────────────
export async function getLaboratoryProfile(): Promise<{ success: boolean; data: LaboratoryProfileApiResponse; message: string }> {
	const res = await ApiService.get<{ success: boolean; data: LaboratoryProfileApiResponse; message: string }>(
		API_ENDPOINTS.LABORATORY_PROFILE.DETAILS
	)
	return res.data
}

export async function updateLaboratoryPersonalDetails(payload: Partial<LaboratoryProfilePersonal>): Promise<{ success: boolean; message: string }> {
	const res = await ApiService.put<{ success: boolean; message: string }>(
		API_ENDPOINTS.LABORATORY_PROFILE.DETAILS,
		{
			name: payload.name,
			email: payload.email,
			gender: payload.gender,
			date_of_birth: payload.dateOfBirth,
			location: payload.location,
			instagram: payload.instagram,
			facebook: payload.facebook,
		}
	)
	return res.data
}

export async function updateLaboratoryProfessionalDetails(payload: Partial<LaboratoryProfileProfessional>): Promise<{ success: boolean; message: string }> {
	const res = await ApiService.put<{ success: boolean; message: string }>(
		API_ENDPOINTS.LABORATORY_PROFILE.PROFESSIONAL_DETAILS,
		{
			specialization_id: payload.specializationId,
			specialization_label: payload.specializationLabel,
			degree: payload.degree,
			institute: payload.institute,
			year_of_passing: payload.yearOfPassing,
			qualification_proof: payload.qualificationProof,
			registration_number: payload.registrationNumber,
			certification_authority: payload.certificationAuthority,
			license_expiry_date: payload.licenseExpiryDate,
			registration_proof: payload.registrationProof,
			current_lab: payload.currentLab,
			years_of_experience: payload.yearsOfExperience,
			previous_organization: payload.previousOrganization,
			area_of_expertise: payload.areaOfExpertise,
			skills: payload.skills,
			lab_license_proof: payload.labLicenseProof,
			training_certificate_proof: payload.trainingCertificateProof,
			internship_proof: payload.internshipProof,
			id_verification_proof: payload.idVerificationProof,
			about: payload.about,
		}
	)
	return res.data
}

// ── Search & Booking types (new) ───────────────────────────────────────────

export interface LaboratoryTestType {
	id: number
	name: string
	description: string | null
}

export interface LaboratoryTest {
	id: number
	test_type: LaboratoryTestType
	pricing_model: 'fixed' | 'starting_from' | 'quote_required'
	base_price: number | null
	price_details: string | null
	is_available: boolean
}

export interface LaboratoryTestTypesResponse {
	success: boolean
	message: string
	data: LaboratoryTestType[]
}

export interface LaboratoryTestsResponse {
	success: boolean
	message: string
	data: LaboratoryTest[]
}

export interface LaboratorySearchResponse {
	success: boolean
	message: string
	data: LaboratorySearchResultItem[]
	meta: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface LaboratoryBookingItem {
	id: number
	laboratory_test: LaboratoryTest
	custom_test_name: string | null
	quoted_price: number | null
}

export interface LaboratoryBooking {
	id: number
	public_id: string
	patient_id: number
	patient_name: string
	laboratory_name: string
	laboratory_public_id: string
	booking_date: string
	booking_time: string
	status: string
	payment_status: string
	prescription_verified: boolean
	verified_by_user_id: number | null
	verified_at: string | null
	total_price: number | null
	notes: string | null
	external_prescription_s3_key: string | null
	booking_items: LaboratoryBookingItem[]
	created_at: string
}

export interface LaboratoryBookingResponse {
	success: boolean
	message: string
	data: LaboratoryBooking
}

export interface LaboratoryBookingsResponse {
	success: boolean
	message: string
	data: LaboratoryBooking[]
}

export interface LaboratoryBookingCreatePayload {
	laboratory_id: string
	test_ids: number[]
	booking_date: string
	booking_time: string
	treatment_id?: string
	external_prescription_s3_key?: string
	notes?: string
}

export interface LaboratoryUpdateResponse {
	success: boolean
	message: string
}

// ── Search & Catalog API calls (new) ──────────────────────────────────────

/** GET /api/laboratory/test-types */
export const getLaboratoryTestTypes = async (): Promise<LaboratoryTestTypesResponse> => {
	const res = await ApiService.get<LaboratoryTestTypesResponse>(API_ENDPOINTS.LABORATORY.TEST_TYPES)
	return res.data
}

export interface LaboratoryTestSetupItem {
	test_type_id: number
	pricing_model: string
	base_price: number | null
	price_details: string | null
	is_available: boolean
}

/** GET /api/laboratory/tests - fetch this laboratory's own test catalog configuration */
export const getMyLaboratoryTests = async (): Promise<LaboratoryTestsResponse> => {
	const res = await ApiService.get<LaboratoryTestsResponse>(API_ENDPOINTS.LABORATORY.TESTS)
	return res.data
}

/** PATCH /api/laboratory/tests - update/configure this laboratory's test catalog */
export const updateMyLaboratoryTests = async (
	payload: { tests: LaboratoryTestSetupItem[] }
): Promise<LaboratoryTestsResponse> => {
	const res = await ApiService.patch<LaboratoryTestsResponse>(API_ENDPOINTS.LABORATORY.TESTS, payload)
	return res.data
}

/** GET /api/laboratory/search */
export const searchLaboratories = async (params: {
	test_type_id?: number
	city?: string
	search?: string
	page?: number
	limit?: number
	max_price?: number
}): Promise<LaboratorySearchResponse> => {
	const res = await ApiService.getWithParams<LaboratorySearchResponse>(
		API_ENDPOINTS.LABORATORY.SEARCH,
		params,
	)
	return res.data
}

/**
 * GET /api/laboratory/tests?laboratory_id=:id
 * Fetches the full test catalog for a given lab center (patient-facing, for the booking drawer).
 */
export const fetchLaboratoryTestsForCenter = async (laboratoryId: string): Promise<LaboratoryTestsResponse> => {
	const res = await ApiService.getWithParams<LaboratoryTestsResponse>(
		API_ENDPOINTS.LABORATORY.TESTS,
		{ laboratory_id: laboratoryId },
	)
	return res.data
}

/** POST /api/laboratory/bookings */
export const createLaboratoryBooking = async (
	payload: LaboratoryBookingCreatePayload,
): Promise<LaboratoryBookingResponse> => {
	const res = await ApiService.post<LaboratoryBookingResponse>(
		API_ENDPOINTS.LABORATORY.BOOKINGS,
		payload,
	)
	return res.data
}
