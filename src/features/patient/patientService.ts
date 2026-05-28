import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { Patient, PatientLifeStyle, PatientMedical, PatientPersonal } from '../../types/patient'

export interface PatientUpdateResponse {
	success: boolean
	message: string
	data?: unknown
}

export interface PatientProfileApiResponse {
	success: boolean
	message: string
	data: Patient
}

export type PatientUpdatePayload = Partial<PatientPersonal> | Partial<PatientMedical> | Partial<PatientLifeStyle>

export const updatePatientProfile = async (
	patientId: string,
	payload: PatientUpdatePayload
): Promise<PatientUpdateResponse> => {
	const res = await ApiService.patch<PatientUpdateResponse>(API_ENDPOINTS.PATIENT.UPDATE, payload, {
		params: {
			patient_id: patientId,
		},
	})
	return res.data
}

export const getPatientDetails = async (patientId: string): Promise<PatientProfileApiResponse> => {
	const res = await ApiService.get<PatientProfileApiResponse>(API_ENDPOINTS.PATIENT.ME, {
		params: {
			patient_id: patientId,
		},
	})

	return res.data
}

export interface PatientAddressOut {
	id: string
	label: string
	address_line: string
	city: string
	state: string
	pincode: string
	latitude?: number | null
	longitude?: number | null
	is_default: boolean
	created_at: string
}

export interface PatientAddressCreate {
	label: string
	address_line: string
	city: string
	state: string
	pincode: string
	latitude?: number | null
	longitude?: number | null
	is_default?: boolean
}

export const getPatientAddresses = async (): Promise<{ success: boolean; data: PatientAddressOut[] }> => {
	const res = await ApiService.get<{ success: boolean; data: PatientAddressOut[] }>(API_ENDPOINTS.PATIENT.ADDRESSES)
	return res.data
}

export interface PatientAddressResponse {
	success: boolean
	message: string
	data: PatientAddressOut
}

export const addPatientAddress = async (payload: PatientAddressCreate): Promise<PatientAddressResponse> => {
	const res = await ApiService.post<PatientAddressResponse>(API_ENDPOINTS.PATIENT.ADDRESSES, payload)
	return res.data
}

export const updatePatientAddress = async (
	id: string,
	payload: Partial<PatientAddressCreate>
): Promise<PatientAddressResponse> => {
	const res = await ApiService.patch<PatientAddressResponse>(API_ENDPOINTS.PATIENT.ADDRESS_UPDATE(id), payload)
	return res.data
}
