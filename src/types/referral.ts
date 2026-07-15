// src/types/referral.ts

export type ReferralStatus = 'pending' | 'appointment_booked' | 'completed' | 'cancelled'

export interface ReferralDoctorBrief {
	id: string
	name: string
	avatar_s3_key?: string | null
	avatar_url?: string | null
	avatar?: string | null
	profile_picture?: string | null
	photo_url?: string | null
	image_url?: string | null
}

export interface ReferralPatientBrief {
	id: string
	name: string
	avatar_s3_key: string | null
}

export interface ReferralAppointmentBrief {
	id: string
	appointment_date: string
	start_time: string
	appointment_mode: string
	status: string
}

export interface Referral {
	id: string
	status: ReferralStatus
	notes: string | null
	is_active: boolean
	created_at: string
	updated_at: string
	referring_doctor: ReferralDoctorBrief
	referred_doctor: ReferralDoctorBrief
	patient: ReferralPatientBrief
	appointment: ReferralAppointmentBrief | null
	referred_appointment: ReferralAppointmentBrief | null
}

export interface ReferralResponse {
	success: boolean
	message: string
	data: Referral
}

export interface ReferralsListResponse {
	success: boolean
	message: string
	data: Referral[]
}

export interface CreateReferralPayload {
	appointment_id: string
	referred_doctor_id: string
	notes?: string
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface AppNotification {
	id: string
	type: string
	title: string
	message: string
	reference_type: string | null
	reference_id: string | null
	redirect_type: string | null
	redirect_id: string | null
	is_read: boolean
	created_at: string
}

export interface NotificationsResponse {
	success: boolean
	message: string
	data: AppNotification[]
}
