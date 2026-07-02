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
	experience: string
	languages: string[]
}

export interface DoctorDegree {
	id?: number
	degree: string
	specialization?: string
	college: string
	yearOfPassing: string
	qualificationProof?: string
}

export interface DoctorProfileProfessional {
	specialization_id: string
	specialization_label: string
	degree?: string
	college?: string
	yearOfPassing?: string
	qualificationProof?: string
	degrees: DoctorDegree[]
	registrationNumber: string
	registrationProof: string
	about: string
}

export type AppointmentType = 'clinic' | 'video'

export type TimeSlot = { start: string; end: string }

export type SectionSlots = {
	morning: TimeSlot[]
	afternoon: TimeSlot[]
	evening: TimeSlot[]
}

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
	availability?: Record<number, Record<AppointmentType, WorkingHoursState>>
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

export interface DoctorAdditionalDetail {
	treatments: string[]
	areas_of_expertise: string[]
}
