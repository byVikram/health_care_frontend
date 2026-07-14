import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { Patient, PatientLifeStyle, PatientMedical, PatientPersonal } from '../../types/patient'
import { buildS3Url } from '../../utils/s3'

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

export const getPatientPastMedicalHistory = async (
	patientPublicId: string
): Promise<PastMedicalHistoryItem[]> => {
	const [treatmentsRes, laboratoryRes, radiologyRes] = await Promise.all([
		ApiService.get<TreatmentHistoryResponse>(API_ENDPOINTS.TREATMENTS.PATIENT_HISTORY(patientPublicId)),
		ApiService.get<ApiListResponse<LaboratoryReportRecord>>(API_ENDPOINTS.PATIENT.LABORATORY_REPORTS(patientPublicId)),
		ApiService.get<ApiListResponse<RadiologyReportRecord>>(API_ENDPOINTS.PATIENT.RADIOLOGY_REPORTS(patientPublicId)),
	])

	const prescriptions = getTreatmentHistoryList(treatmentsRes.data)
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

	const laboratoryReports = (laboratoryRes.data.data ?? []).map<PastMedicalHistoryItem>((item) => ({
		id: item.public_id,
		category: 'laboratory',
		date: item.uploaded_at,
		fileUrl: buildS3Url(item.report_pdf_s3_key),
		notes: item.summary_findings ?? null,
	}))

	const radiologyReports = (radiologyRes.data.data ?? []).map<PastMedicalHistoryItem>((item) => ({
		id: item.public_id,
		category: 'radiology',
		date: item.uploaded_at,
		fileUrl: buildS3Url(item.report_pdf_s3_key),
		notes: item.summary_findings ?? null,
	}))

	return [...prescriptions, ...laboratoryReports, ...radiologyReports].sort(sortHistoryDesc)
}
