import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { Patient, PatientLifeStyle, PatientMedical, PatientPersonal } from '../../types/patient'
import { buildS3Url } from '../../utils/s3'
import type { TreatmentRecord } from '../../types/pharmacyOrder'

export interface PatientUpdateResponse {
	success: boolean
	message: string
	data?: unknown
}

export interface PatientProfileApiResponse {
	success: boolean
	message: string
	data: Patient
}

export type PatientUpdatePayload = Partial<PatientPersonal> | Partial<PatientMedical> | Partial<PatientLifeStyle>

export const updatePatientProfile = async (
	patientId: string,
	payload: PatientUpdatePayload
): Promise<PatientUpdateResponse> => {
	const res = await ApiService.patch<PatientUpdateResponse>(API_ENDPOINTS.PATIENT.UPDATE, payload, {
		params: {
			patient_id: patientId,
		},
	})
	return res.data
}

export const getPatientDetails = async (patientId: string): Promise<PatientProfileApiResponse> => {
	const res = await ApiService.get<PatientProfileApiResponse>(API_ENDPOINTS.PATIENT.ME, {
		params: {
			patient_id: patientId,
		},
	})

	return res.data
}

export interface PatientAddressOut {
	id: string
	label: string
	address_line: string
	city: string
	state: string
	pincode: string
	latitude?: number | null
	longitude?: number | null
	is_default: boolean
	created_at: string
}

export interface PatientAddressCreate {
	label: string
	address_line: string
	city: string
	state: string
	pincode: string
	latitude?: number | null
	longitude?: number | null
	is_default?: boolean
}

export const getPatientAddresses = async (): Promise<{ success: boolean; data: PatientAddressOut[] }> => {
	const res = await ApiService.get<{ success: boolean; data: PatientAddressOut[] }>(API_ENDPOINTS.PATIENT.ADDRESSES)
	return res.data
}

export interface PatientAddressResponse {
	success: boolean
	message: string
	data: PatientAddressOut
}

export const addPatientAddress = async (payload: PatientAddressCreate): Promise<PatientAddressResponse> => {
	const res = await ApiService.post<PatientAddressResponse>(API_ENDPOINTS.PATIENT.ADDRESSES, payload)
	return res.data
}

export const updatePatientAddress = async (
	id: string,
	payload: Partial<PatientAddressCreate>
): Promise<PatientAddressResponse> => {
	const res = await ApiService.patch<PatientAddressResponse>(API_ENDPOINTS.PATIENT.ADDRESS_UPDATE(id), payload)
	return res.data
}

export type PastMedicalHistoryCategory = 'prescription' | 'laboratory' | 'radiology' | 'ancillary'

export interface PastMedicalHistoryItem {
	id: string
	category: PastMedicalHistoryCategory
	date: string
	fileUrl: string | null
	notes: string | null
	title?: string | null
}

interface ApiListResponse<T> {
	success: boolean
	message?: string
	data?: T[] | null
}

interface TreatmentHistoryResponse {
	success?: boolean
	message?: string
	data?: TreatmentHistoryRecord[] | { history?: TreatmentHistoryRecord[]; treatments?: TreatmentHistoryRecord[] } | null
}

interface TreatmentHistoryRecord {
	id?: string | number
	public_id?: string
	appointment_id?: string | number
	appointment_public_id?: string
	appointment_date?: string | null
	created_at?: string | null
	updated_at?: string | null
	prescription_s3_key?: string | null
	notes?: string | null
	diagnosis?: string | null
	follow_up_date?: string | null
}

interface LaboratoryReportRecord {
	id: number
	public_id: string
	booking_id: number
	patient_id: number
	report_pdf_s3_key: string
	result_values?: Record<string, unknown> | null
	report_images_s3_keys?: string[] | null
	summary_findings?: string | null
	uploaded_at: string
}

interface RadiologyReportRecord {
	id: number
	public_id: string
	booking_id: number
	patient_id: number
	report_pdf_s3_key: string
	dicom_images_s3_keys?: string[] | null
	scan_images_s3_keys?: string[] | null
	summary_findings?: string | null
	uploaded_at: string
}

function getTreatmentHistoryList(response: TreatmentHistoryResponse): TreatmentHistoryRecord[] {
	const data = response.data

	if (Array.isArray(data)) {
		return data
	}

	return data?.history ?? data?.treatments ?? []
}

function sortHistoryDesc(a: PastMedicalHistoryItem, b: PastMedicalHistoryItem): number {
	const aTime = new Date(a.date).getTime()
	const bTime = new Date(b.date).getTime()

	return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
}

export const getPatientPrescriptionHistory = async (
	patientPublicId: string
): Promise<PastMedicalHistoryItem[]> => {
	const res = await ApiService.get<TreatmentHistoryResponse>(
		API_ENDPOINTS.TREATMENTS.PATIENT_HISTORY(patientPublicId)
	)

	return getTreatmentHistoryList(res.data)
		.filter((item) => !!item.prescription_s3_key)
		.map<PastMedicalHistoryItem>((item) => ({
			id: String(
				item.public_id ??
					item.id ??
					item.appointment_public_id ??
					item.appointment_id ??
					item.prescription_s3_key
			),
			category: 'prescription',
			date: item.appointment_date ?? item.created_at ?? item.updated_at ?? '',
			fileUrl: buildS3Url(item.prescription_s3_key),
			notes: item.notes ?? item.diagnosis ?? null,
			title: item.follow_up_date ? `Follow-up: ${item.follow_up_date}` : null,
		}))
		.sort(sortHistoryDesc)
}

export const getPatientLaboratoryHistory = async (
	patientPublicId: string
): Promise<PastMedicalHistoryItem[]> => {
	const res = await ApiService.get<ApiListResponse<LaboratoryReportRecord>>(
		API_ENDPOINTS.PATIENT.LABORATORY_REPORTS(patientPublicId)
	)

	return (res.data.data ?? [])
		.map<PastMedicalHistoryItem>((item) => ({
			id: item.public_id,
			category: 'laboratory',
			date: item.uploaded_at,
			fileUrl: buildS3Url(item.report_pdf_s3_key),
			notes: item.summary_findings ?? null,
		}))
		.sort(sortHistoryDesc)
}

export const getPatientRadiologyHistory = async (
	patientPublicId: string
): Promise<PastMedicalHistoryItem[]> => {
	const res = await ApiService.get<ApiListResponse<RadiologyReportRecord>>(
		API_ENDPOINTS.PATIENT.RADIOLOGY_REPORTS(patientPublicId)
	)

	return (res.data.data ?? [])
		.map<PastMedicalHistoryItem>((item) => ({
			id: item.public_id,
			category: 'radiology',
			date: item.uploaded_at,
			fileUrl: buildS3Url(item.report_pdf_s3_key),
			notes: item.summary_findings ?? null,
		}))
		.sort(sortHistoryDesc)
}

// ── Shared patient prescription / treatment history (used by Pharmacy, Lab & Radiology booking drawers) ──

/**
 * GET /api/treatments/patient/:patientPublicId/history
 * Returns the patient's doctor-consultation history, filtered to records that
 * carry a prescription so the booking drawers can display and link them.
 * Maps each record to TreatmentRecord using the treatment's public_id as `id`.
 */
export const fetchPatientTreatmentHistory = async (
	patientPublicId: string,
): Promise<TreatmentRecord[]> => {
	const res = await ApiService.get<any>(
		API_ENDPOINTS.TREATMENTS.PATIENT_HISTORY(patientPublicId),
	)
	const responseData = res.data?.data
	const records: any[] = Array.isArray(responseData)
		? responseData
		: (responseData?.history ?? responseData?.treatments ?? [])

	return records
		.filter((record) => !!record.prescription_s3_key)
		.map((record): TreatmentRecord => ({
			id: String(record.public_id ?? record.id),
			created_at: record.appointment_date ?? record.created_at ?? record.updated_at ?? new Date().toISOString(),
			doctor_name: record.doctor_name || record.doctor?.name || null,
			hospital_name: record.hospital_name || record.hospital?.name || null,
			notes: record.notes ?? record.diagnosis ?? null,
			prescription_s3_key: record.prescription_s3_key,
			source: 'treatment',
		}))
}
