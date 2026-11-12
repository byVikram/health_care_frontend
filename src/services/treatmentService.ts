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
	/** Set once the doctor has submitted the notes: from then on they cannot change. */
	notes_submitted_at?: string | null
	/** A signed link (about 5 minutes) to the prescription image drawn from the submitted notes. */
	notes_image_url?: string | null
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

export interface SubmitNotesPayload {
	/** Typed (or dictated) notes, up to 5000 characters. */
	notes?: string
	/** Shown in the patient grid of the prescription, up to 300 characters. */
	diagnosis?: string
}

/**
 * The assigned doctor submits the consultation notes (POST /api/treatments/appointment/{id}/notes). The server draws them onto
 * one prescription image, stores it privately and links it to the appointment's treatment record; the app sends no storage key.
 * FINAL: a second submission, or any later edit of the notes, answers 409. Only a confirmed, checked-in or completed appointment
 * accepts notes (400 otherwise); the server's reason is shown by the shared API client.
 */
export async function submitConsultationNotes(appointmentId: string, payload: SubmitNotesPayload): Promise<Treatment> {
	const form = new FormData()
	if (payload.notes?.trim()) form.append('notes', payload.notes.trim())
	if (payload.diagnosis?.trim()) form.append('diagnosis', payload.diagnosis.trim())
	const res = await ApiService.post<TreatmentResponse>(API_ENDPOINTS.TREATMENTS.SUBMIT_NOTES(appointmentId), form)
	return res.data.data
}

/**
 * The doctor's follow-up date for a visit ("YYYY-MM-DD"), saved on the visit's treatment record: the same call the mobile app makes
 * (the record is created when the visit has none, else updated: the backend allows one record per appointment). The server also
 * schedules the patient's follow-up reminder from it, and it works after the notes are submitted (only the notes are final).
 */
export async function saveFollowUpDate(appointmentId: string, followUpDate: string): Promise<Treatment> {
	const existing = await getTreatmentByAppointment(appointmentId)
	if (existing) {
		const res = await ApiService.patch<TreatmentResponse>(API_ENDPOINTS.TREATMENTS.GET_BY_APPOINTMENT(appointmentId), {
			follow_up_date: followUpDate,
		})
		return res.data.data
	}
	const res = await ApiService.post<TreatmentResponse>(API_ENDPOINTS.TREATMENTS.CREATE, {
		appointment_id: appointmentId,
		follow_up_date: followUpDate,
	})
	return res.data.data
}

/** A fresh signed link to the submitted prescription image, or null when none has been submitted yet (404). Ask again at every open. */
export async function getPrescriptionLink(appointmentId: string): Promise<string | null> {
	try {
		const res = await ApiService.get<{ success: boolean; data: { prescription_url: string } }>(
			API_ENDPOINTS.TREATMENTS.PRESCRIPTION(appointmentId),
			{ suppressErrorToast: true }
		)
		return res.data?.data?.prescription_url ?? null
	} catch (err) {
		if (axios.isAxiosError(err) && err.response?.status === 404) return null
		throw err
	}
}
