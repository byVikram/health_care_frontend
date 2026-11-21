// src/types/treatment.ts

/** A past doctor consultation (or a report the patient uploaded) the patient can attach to a booking. */
export interface TreatmentRecord {
	id: string
	created_at: string
	doctor_name?: string | null
	hospital_name?: string | null
	report_type?: string | null
	notes?: string | null
	prescription_s3_key?: string | null
	source?: 'treatment' | 'patient_report'
}

/** Dropdown-friendly option shape used by AppSelect. */
export interface SelectOption {
	value: string
	label: string
}
