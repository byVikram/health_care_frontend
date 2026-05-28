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
