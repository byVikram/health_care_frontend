// src/services/treatmentService.ts
import axios from 'axios'
import ApiService from './apiService'
import { API_ENDPOINTS } from '../constants/apiUrls'

/**
 * A patient's treatment / consultation record for a single appointment.
 * Mirrors PatientTreatment on the backend (app/models/patient.py) and is
 * created by the doctor during/after a consultation.
 */
export interface Treatment {
	id: string
	appointment_id: number
	vitals: Record<string, unknown> | null
	notes: string | null
	prescription_s3_key: string | null
	follow_up_date: string | null
	created_at: string
}

interface TreatmentResponse {
	success: boolean
	message: string
	data: Treatment
}

/**
 * Fetch the treatment/consultation record for a given appointment (by the
 * appointment's public UUID). Returns `null` if the doctor hasn't recorded
 * a treatment for this appointment yet (backend responds 404) — this is an
 * expected state, not an error, since not every appointment has one.
 */
export async function getTreatmentByAppointment(appointmentId: string): Promise<Treatment | null> {
	try {
		const res = await ApiService.get<TreatmentResponse>(
			API_ENDPOINTS.TREATMENTS.GET_BY_APPOINTMENT(appointmentId),
			{ suppressErrorToast: true }
		)
		return res.data?.data ?? null
	} catch (err) {
		if (axios.isAxiosError(err) && err.response?.status === 404) {
			return null
		}
		throw err
	}
}