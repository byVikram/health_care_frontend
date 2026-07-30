// src/types/doctor-detail.ts

export interface DoctorDetailHospital {
	id: string
	is_primary: boolean
	video_consultation_fee: number
	offline_consultation_fee: number
	available_days: string[]
	working_hours: string
	hospital: {
		id: string
		name: string
		address: string
		contact_number: string
		distance: string
		latitude: number
		longitude: number
	}
}

export interface DoctorAchievement {
	id: string
	title: string
	achievement_type: string
	organization: string | null
	achievement_date: string | null
	description: string | null
	document_s3_key: string | null
}

export interface DoctorAvailability {
	hospital_id: string
	day_of_week: number
	slot_time: string
	is_active: boolean
	status?: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED'
	is_booked?: boolean
	is_enabled?: boolean
	can_toggle?: boolean
}

/** A single educational qualification returned by the public doctor detail API */
export interface DoctorDetailDegree {
	degree: string
	specialization?: string | null
	college: string
	year_of_passing: string
}

export interface DoctorDetailData {
	id: string
	name: string
	is_verified: boolean
	details: {
		avatar_s3_key: string | null
		location: string
		experience_years: number
		languages: string[]
		/** Primary / legacy single-degree fields */
		degree: string
		college: string
		year_of_passing: string
		about: string
		registration_number: string
		social_media_handles?: {
			instagram?: string | null
			facebook?: string | null
			twitter?: string | null
		}
		/** Full degrees list — optional until the public API exposes it */
		degrees?: DoctorDetailDegree[]
	}
	specialities: string[]
	hospitals: DoctorDetailHospital[]
	achievements: DoctorAchievement[]
	availability: DoctorAvailability[]
	is_favourited?: boolean
	additionalDetail?: {
		areas_of_expertise: { id: string; label: string }[]
		treatments: { id: string; label: string }[]
	}
}

export interface DoctorDetailResponse {
	success: boolean
	message: string
	data: DoctorDetailData
}
