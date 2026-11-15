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

let statusIdsByLabel: Map<string, string> | null = null

/** The id of an appointment status by its label ('cancelled', 'no_show', ...): the update-status call takes ids, not labels. */
export const getAppointmentStatusId = async (label: string): Promise<string> => {
	if (!statusIdsByLabel) {
		const res = await ApiService.get<{ success: boolean; data: { id: string; label: string }[] }>(
			API_ENDPOINTS.APPOINTMENTS.STATUSES
		)
		const loaded = new Map((res.data?.data ?? []).map((s) => [s.label.toLowerCase(), s.id]))
		// An empty answer is not kept: it would make every later cancel or no-show fail until the page is reloaded.
		if (loaded.size === 0) throw new Error('Could not load the appointment statuses')
		statusIdsByLabel = loaded
	}
	const id = statusIdsByLabel.get(label.toLowerCase())
	if (!id) throw new Error(`Unknown appointment status: ${label}`)
	return id
}

/** Doctor-only check-in toggle: `true` checks the patient in, `false` undoes a check-in tapped by mistake. */
export const setAppointmentCheckIn = async (
	appointmentId: string,
	checkedIn: boolean
): Promise<AppointmentStatusUpdateResponse> => {
	const res = await ApiService.post<AppointmentStatusUpdateResponse>(API_ENDPOINTS.APPOINTMENTS.CHECK_IN(appointmentId), {
		checked_in: checkedIn,
	})
	return res.data
}

export interface BookingRestriction {
	restricted: boolean
	/** YYYY-MM-DD */
	until: string | null
	message: string | null
}

/**
 * Whether online booking is paused for the signed-in patient (repeated valid no-shows). Patients only (the server answers any other
 * role with a 403). The error toast is off: a failed lookup must never get in the way of booking, the server enforces the pause anyway.
 */
export const getBookingRestriction = async (): Promise<BookingRestriction> => {
	const res = await ApiService.get<{ data: BookingRestriction }>(API_ENDPOINTS.APPOINTMENTS.BOOKING_RESTRICTION, {
		suppressErrorToast: true,
	})
	return res.data.data
}

export const RESCHEDULE_REASON_MAX_LENGTH = 500

/**
 * Doctor "reschedule": the doctor does not pick a slot, they ask the PATIENT to choose a new time. Same endpoint as a patient's
 * reschedule, but only `appointment_id` (+ an optional reason) is sent: the backend answers a doctor's date, time or hospital with
 * a 400. The appointment becomes `reschedule_required` and the patient is emailed; asking again is a harmless no-op.
 */
export const askPatientToReschedule = async (
	appointmentId: string,
	reason?: string
): Promise<AppointmentStatusUpdateResponse> => {
	const trimmed = reason?.trim().slice(0, RESCHEDULE_REASON_MAX_LENGTH)
	const res = await ApiService.post<AppointmentStatusUpdateResponse>(API_ENDPOINTS.APPOINTMENTS.RESCHEDULE, {
		appointment_id: appointmentId,
		...(trimmed ? { reason: trimmed } : {}),
	})
	return res.data
}
