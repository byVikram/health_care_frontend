import { WorkingHoursState, AppointmentType } from './doctor-profile'

export interface DoctorProfileApiSpeciality {
	id: string
	label: string
}

export interface SocialMediaHandles {
	instagram?: string
	facebook?: string
	twitter?: string
}

export interface DoctorProfileApiHospital {
	id: string
	is_primary: boolean
	available_days: string[]
	working_hours: string
	free_followup_validity_days?: number
	reschedule_allowed_until_hours?: number
	allow_pay_later?: boolean
	appointment_rules?: {
		free_followup_validity_days: number
		reschedule_allowed_until_hours: number
		allow_pay_later: boolean
	}
	availability?: Record<number, Record<AppointmentType, WorkingHoursState>>
	hospital: {
		id: string
		name: string
		address: string
		contact_number: string
		distance: string
		latitude: number
		longitude: number
		video_consultation_fee: number
		clinic_consultation_fee: number
	}
}

export interface DoctorProfileApiAvailability {
	day_of_week: number
	slot_time: string
	is_active: boolean
	hospital_id: string
	hospital_name: string
}

export interface DoctorDegreeApi {
	id?: number
	degree: string
	specialization?: string
	college: string
	year_of_passing: string
	qualification_proof_s3_key?: string | null
}

export interface DoctorProfileApiData {
	personal_details: {
		name: string
		email: string
		is_verified: boolean
		avatar_s3_key: string | null
		gender: string
		date_of_birth: string
		location: string
		languages: string[]
		social_media_handles?: SocialMediaHandles
		contact_number?: string
	}
	professional_details: {
		experience_years: number
		degree?: string
		college?: string
		year_of_passing?: string
		qualification_proof_s3_key?: string | null
		degrees: DoctorDegreeApi[]
		registration_number: string
		registration_proof_s3_key?: string | null
		about: string
		specialities: DoctorProfileApiSpeciality[]
	}
	hospitals: DoctorProfileApiHospital[]
	availability: DoctorProfileApiAvailability[]
	additionalDetail?: {
		treatments: { id: string; label: string }[]
		areas_of_expertise: { id: string; label: string }[]
	}
}

export interface DoctorProfileApiResponse {
	success: boolean
	message: string
	data: DoctorProfileApiData
}
