// src/features/laboratory/laboratoryService.ts
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { LaboratoryProfile, LaboratoryProfilePersonal, LaboratoryProfileProfessional, LaboratoryService } from '../../types/laboratory-profile'

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
	registration_number?: string
	registration_proof?: string
	accreditation_body?: string
	accreditation_number?: string
	accreditation_proof?: string
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
			labName: data.lab_name ?? '',
			registrationNumber: data.registration_number ?? '',
			registrationProof: data.registration_proof ?? '',
			accreditationBody: data.accreditation_body ?? '',
			accreditationNumber: data.accreditation_number ?? '',
			accreditationProof: data.accreditation_proof ?? '',
			about: data.about ?? '',
			operatingSince: data.operating_since ?? '',
		},
		services: data.services ?? [],
	}
}

// ── API calls ──────────────────────────────────────────────────────────────
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
			lab_name: payload.labName,
			registration_number: payload.registrationNumber,
			accreditation_body: payload.accreditationBody,
			accreditation_number: payload.accreditationNumber,
			about: payload.about,
			operating_since: payload.operatingSince,
		}
	)
	return res.data
}
