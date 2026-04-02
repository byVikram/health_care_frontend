import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { PatientLifeStyle, PatientMedical, PatientPersonal } from '../../types/patient'

export interface PatientUpdateResponse {
	success: boolean
	message: string
	data?: unknown
}

export type PatientUpdatePayload = Partial<PatientPersonal> | Partial<PatientMedical> | Partial<PatientLifeStyle>

export const updatePatientProfile = async (
	patientId: string,
	payload: PatientUpdatePayload
): Promise<PatientUpdateResponse> => {
	const res = await ApiService.patch<PatientUpdateResponse>(API_ENDPOINTS.USERS.UPDATE(patientId), payload)
	return res.data
}
