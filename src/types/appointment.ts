// src/types/appointment.ts

export interface AppointmentHistoryEntry {
	action: string          // e.g. 'created' | 'rescheduled' | 'confirmed' | 'cancelled'
	actor_type: string      // 'doctor' | 'patient' | 'system'
	// Backend may return a plain string OR a slot object {appointment_date, start_time, end_time}
	old_value: unknown
	new_value: unknown
	reason: string | null
	created_at: string      // ISO timestamp
}

export type AppointmentStatusValue = 'pending' | 'confirmed' | 'completed' | 'cancelled' | string

export interface AppointmentStatus {
	id: string
	label: AppointmentStatusValue
}

export interface AppointmentDoctor {
	id: string
	name: string
	avatar_s3_key: string | undefined
	degree?: string | null
	speciality?: string | null // key returned by GET /api/appointments/{id}
	specialty?: string          // legacy/alternate key kept for backward compatibility
	specialization?: string     // alternate key some backends use
	experience_years?: number | null
	languages?: string[] | null
	about?: string | null
}

export interface AppointmentPatient {
	id: string
	name: string
	avatar_s3_key: string | null
	age: number
	gender: string
}

export interface AppointmentHospital {
	id: string
	name: string
	address: string
}

export interface Appointment {
	id: string
	public_id: string
	booking_id?: string
	appointment_mode: 'clinic visit' | 'video call' | 'clinic_visit' | 'video_call'
	appointment_date: string
	start_time: string
	end_time: string
	fees: number
	created_at: string
	status: AppointmentStatusValue | AppointmentStatus
	doctor: AppointmentDoctor
	patient: AppointmentPatient | null
	hospital: AppointmentHospital | null
	symptoms?: string | null
	duration?: string | null
	severity?: 'mild' | 'moderate' | 'severe' | null
	pre_intake?: {
		symptoms?: string
		duration?: string
		severity?: string
	} | null
	history?: AppointmentHistoryEntry[]
	rescheduled_by?: string | null
	/** The patient has already given this doctor the consultation code for this appointment (no new code is asked for). */
	access_verified?: boolean
	// Reason selected by the doctor when rejecting (or otherwise changing the status of) the appointment.
	reason?: string | null
	/** Why the appointment is cancelled / rescheduled / asked to be rescheduled, as the person who did it wrote it (null otherwise). */
	status_reason?: string | null
	/** Who gave that reason: 'doctor', 'patient', an admin role or 'system'. */
	status_changed_by?: string | null
	/** 'Cancelled by you' / 'Cancelled by the doctor' ...: the line for `status_reason`, worded for the person asking. */
	status_reason_title?: string | null
	referral?: {
		id: string
		referring_doctor: {
			id: string
			name: string
			avatar_s3_key?: string | null
			avatar_url?: string | null
			avatar?: string | null
			profile_picture?: string | null
			photo_url?: string | null
			image_url?: string | null
		}
		notes: string | null
		status: string
	} | null
}

export interface AppointmentsResponse {
	success: boolean
	message: string
	data: Appointment[]
	total: number
	page: number
	limit: number
	pages: number
}

export interface AppointmentParams {
	appointment_date?: string
	appSearch?: string
}
