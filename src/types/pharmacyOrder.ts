// src/types/pharmacyOrder.ts

/** A past doctor consultation the patient can attach to a pharmacy order. */
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

/** Delivery type for a pharmacy order. Mirrors PharmacyOrderCreatePayload['delivery_type']. */
export type DeliveryType = 'pickup' | 'home_delivery'

/** Dropdown-friendly option shape used by AppSelect across this page. */
export interface SelectOption {
	value: string
	label: string
}
