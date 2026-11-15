// src/types/doctor-profile.ts

export interface DoctorProfilePersonal {
	name: string
	contactNumber: string
	contactVerified: boolean
	email: string
	emailVerified: boolean
	gender: string
	avatar: string
	dateOfBirth: string
	location: string
	instagram: string
	facebook: string
	twitter: string
	languages: string[]
}

export interface DoctorDegree {
	id?: number
	degree: string
	specialization?: string
	college: string
	yearOfPassing: string
	/** What the server stored for this degree (or the picked file's name until it is saved). */
	qualificationProof?: string
	/** A certificate picked in the browser and not saved yet. Uploaded together with the rest on save. */
	qualificationFile?: File
}

export interface DoctorProfileProfessional {
	specialization_id: string
	specialization_label: string
	/** Years of experience as a string for the select ('' until the doctor sets it). */
	experience: string
	degree?: string
	college?: string
	yearOfPassing?: string
	qualificationProof?: string
	degrees: DoctorDegree[]
	registrationNumber: string
	/** What the server stored (or the picked file's name until it is saved). */
	registrationProof: string
	/** A registration proof picked in the browser and not saved yet. */
	registrationFile?: File
	about: string
}

export type AppointmentType = 'clinic' | 'video'

export type TimeSlot = { start: string; end: string }

/** One day's blocks of working hours, keyed by session ('morning' | 'afternoon' | 'evening': the keys the server sends). */
export type SectionSlots = Record<string, TimeSlot[]>

export type WorkingHoursState = {
	sections: SectionSlots
	slotDuration: number
}

export interface DoctorHospital {
	id: string
	name: string
	location: string
	fullAddress: string
	isPrimary: boolean
	phone_number?: string
	video_consultation_fee?: number
	clinic_consultation_fee?: number
	free_followup_validity_days?: number
	reschedule_allowed_until_hours?: number
	allow_pay_later?: boolean
}

/** A hospital's weekly working hours: day 0 (Sunday) to 6 -> clinic | video -> the day's blocks and slot length. */
export type WeeklyAvailability = Record<number, Record<AppointmentType, WorkingHoursState>>

/** One of the doctor's hospitals with its weekly working hours (from GET /api/doctors/hospitals). */
export interface DoctorHospitalHours {
	hospitalId: string
	name: string
	availability: WeeklyAvailability
}


export interface DoctorAvailability {
	monday: string[]
	tuesday: string[]
	wednesday: string[]
	thursday: string[]
	friday: string[]
	saturday: string[]
	sunday: string[]
}

export interface DoctorProfile {
	id: string
	specialization: string
	personal: DoctorProfilePersonal
	professional: DoctorProfileProfessional
	hospitals: DoctorHospital[]
	availability: DoctorAvailability
	additionalDetail: DoctorAdditionalDetail
}

export interface OptionItem {
	id: string
	label: string
}

export interface DoctorAdditionalDetail {
	treatments: OptionItem[]
	areas_of_expertise: OptionItem[]
}

export type DoctorAchievementType =
	| 'Award'
	| 'Certification'
	| 'Research'
	| 'Publication'
	| 'Conference'
	| 'Recognition'

export interface DoctorAchievementItem {
	id: string // public_id
	title: string
	achievement_type: DoctorAchievementType
	organization?: string | null
	achievement_date?: string | null // YYYY-MM-DD
	description?: string | null
	document_s3_key?: string | null
	is_public: boolean
	created_at?: string | null
	updated_at?: string | null
}
