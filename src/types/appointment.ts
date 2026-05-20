// src/types/appointment.ts

export type AppointmentStatusValue = 'pending' | 'confirmed' | 'completed' | 'cancelled' | string

export interface AppointmentStatus {
	id: string
	label: AppointmentStatusValue
}

export interface AppointmentDoctor {
	id: string
	name: string
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
	appointment_mode: 'offline' | 'online'
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
  appointment_date?: string;
  appSearch?: string;  
}
