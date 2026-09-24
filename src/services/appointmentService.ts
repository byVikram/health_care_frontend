// src/services/appointmentService.ts
import ApiService from './apiService'
import { API_ENDPOINTS } from '../constants/apiUrls'
import { Appointment } from '../types/appointment'

export interface AppointmentStatusUpdateResponse {
	success: boolean
	message: string
}

/**
 * Fetch a single appointment by its UUID, including the `history` array
 * built from AppointmentAudit entries on the backend.
 *
 * The backend may return the appointment wrapped in { data: {...} } or directly.
 * We handle both shapes defensively.
 */
export async function getAppointmentById(id: string): Promise<Appointment> {
	const res = await ApiService.get<Record<string, unknown>>(API_ENDPOINTS.APPOINTMENTS.GET_BY_ID(id))
	const body = res.data
	// Handle { success, message, data: { ...appointment } } wrapper
	if (body && typeof body === 'object' && 'data' in body && body.data && typeof body.data === 'object') {
		return body.data as Appointment
	}
	// Fallback: backend returned the appointment object directly
	return body as unknown as Appointment
}

export const updateAppointmentsStatus = async (
	appointmentId: string,
	statusId: string,
	reason?: string
): Promise<AppointmentStatusUpdateResponse> => {
	const res = await ApiService.patch<AppointmentStatusUpdateResponse>(API_ENDPOINTS.APPOINTMENTS.UPDATE, {
		appointment_id: appointmentId,
		status_id: statusId,
		...(reason ? { reason } : {}),
	})
	return res.data
}
