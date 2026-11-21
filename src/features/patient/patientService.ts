import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { Patient, PatientLifeStyle, PatientMedical, PatientPersonal } from '../../types/patient'
import { buildS3Url } from '../../utils/s3'
import type { TreatmentRecord } from '../../types/treatment'

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

/** One entry of GET /api/patients/family-members: the signed-in patient (`is_self`) or one of their family members. */
export interface FamilyMemberApi {
	/** The person's public id: what the backend takes as `patient_id`. */
	id: string
	name: string
	relation: string
	relationship?: string
	is_self: boolean
	age?: number | null
	gender?: string | null
	blood_group?: string | null
	avatar_s3_key?: string | null
	date_of_birth?: string | null
	contact_number?: string | null
	/** The member's own Karola ID */
	patient_code?: string | null
	/** Date of birth and gender are filled in */
	is_complete?: boolean
}

export const getFamilyMembers = async (): Promise<FamilyMemberApi[]> => {
	const res = await ApiService.get<{ data?: FamilyMemberApi[] }>(API_ENDPOINTS.PATIENT.FAMILY_MEMBERS)
	return res.data?.data ?? []
}

export interface FamilyMemberInput {
	name: string
	/** Upper-case relation, e.g. 'SPOUSE' (the backend also accepts any case). */
	relation: string
	gender?: string
	/** YYYY-MM-DD */
	date_of_birth?: string | null
	contact_number?: string | null
}

export const createFamilyMember = async (input: FamilyMemberInput): Promise<FamilyMemberApi> => {
	const res = await ApiService.post<{ data: FamilyMemberApi }>(API_ENDPOINTS.PATIENT.FAMILY_MEMBERS, input)
	return res.data.data
}

/** What PATCH /api/patients/family-members/{id} takes: the basics plus the health fields (all optional). */
export interface MedicationItem {
	name: string
	dose: string
	frequency: string
}

export interface FamilyMemberUpdate extends Partial<FamilyMemberInput> {
	blood_group?: string
	height?: number
	weight?: number
	allergies?: string[]
	chronic_conditions?: string[]
	/** The full list of current medicines (replaces what is saved) */
	medications?: MedicationItem[]
}

export const updateFamilyMember = async (memberId: string, patch: FamilyMemberUpdate): Promise<void> => {
	await ApiService.patch(API_ENDPOINTS.PATIENT.FAMILY_MEMBER_BY_ID(memberId), patch)
}

/** One family member: GET /api/patients/family-members/{id} */
export const getFamilyMember = async (memberId: string): Promise<FamilyMemberApi> => {
	const res = await ApiService.get<{ data: FamilyMemberApi }>(API_ENDPOINTS.PATIENT.FAMILY_MEMBER_BY_ID(memberId))
	return res.data.data
}

/** The health part of a member's details: GET /api/patients/me/details?patient_id={id} */
export interface MemberHealthDetails {
	personal: { blood_group?: string | null; height?: number | string | null; weight?: number | string | null }
	medical: {
		allergies?: string[] | null
		chronic_conditions?: string[] | null
		medications?: MedicationItem[] | null
		current_medications?: string[] | null
	}
}

export const getMemberHealthDetails = async (memberId: string): Promise<MemberHealthDetails> => {
	const res = await ApiService.get<{ data: MemberHealthDetails }>(API_ENDPOINTS.PATIENT.ME, {
		params: { patient_id: memberId },
	})
	return res.data.data
}

/** Soft delete on the backend: the member's past bookings and reports are kept. */
export const removeFamilyMember = async (memberId: string): Promise<void> => {
	await ApiService.delete(API_ENDPOINTS.PATIENT.FAMILY_MEMBER_BY_ID(memberId))
}

/** A member's government ID. The file is private: `url` is a short-lived signed link. */
export interface IdentityDocument {
	id: string
	file_name: string | null
	type_label: string
	/** pending | approved | rejected | reupload */
	status: string
	url: string | null
}

export const IDENTITY_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024
export const IDENTITY_DOCUMENT_ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

/** Returns an error message when the file can't be used as an ID document, otherwise null. */
export const validateIdentityDocument = (file: File): string | null => {
	if (!IDENTITY_DOCUMENT_ACCEPTED_TYPES.includes(file.type)) return 'Please choose a PDF, JPG or PNG file.'
	if (file.size === 0) return 'That file is empty.'
	if (file.size > IDENTITY_DOCUMENT_MAX_BYTES) return 'The document must be 10 MB or smaller.'
	return null
}

/** GET /api/patients/family-members/{id}/identity-document -- null when none has been uploaded */
export const getIdentityDocument = async (memberId: string): Promise<IdentityDocument | null> => {
	const res = await ApiService.get<{ data: IdentityDocument | null }>(
		API_ENDPOINTS.PATIENT.FAMILY_MEMBER_IDENTITY_DOCUMENT(memberId)
	)
	return res.data.data
}

/**
 * PUT the picked file as the member's ID document (replaces the previous one). The server stores it privately.
 * The caller shows the failure itself, so the global error toast is off (it would repeat the same message).
 */
export const uploadIdentityDocument = async (memberId: string, file: File): Promise<IdentityDocument> => {
	const form = new FormData()
	form.append('file', file)
	const res = await ApiService.put<{ data: IdentityDocument }>(
		API_ENDPOINTS.PATIENT.FAMILY_MEMBER_IDENTITY_DOCUMENT(memberId),
		form,
		{ suppressErrorToast: true }
	)
	return res.data.data
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

export type PastMedicalHistoryCategory = 'prescription' | 'laboratory'

export interface PastMedicalHistoryItem {
	id: string
	category: PastMedicalHistoryCategory
	date: string
	fileUrl: string | null
	notes: string | null
	title?: string | null
	/** A prescription: who wrote it, where, when the follow-up is, and the visit's id (a fresh link is asked for with it). */
	doctorName?: string | null
	hospitalName?: string | null
	followUpDate?: string | null
	appointmentId?: string | null
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
	/** The prescription image drawn from the notes the doctor submitted: a signed link that expires after about 5 minutes. */
	notes_image_url?: string | null
	notes_submitted_at?: string | null
	doctor_name?: string | null
	hospital_name?: string | null
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

/**
 * The patient's past prescriptions: the visits of GET /api/treatments/patient/{id}/history whose doctor submitted notes (the
 * signed `notes_image_url`), plus older visits that only have a stored `prescription_s3_key`. The signed links expire after about
 * 5 minutes, so the section does not keep this list (see PastMedicalHistory).
 */
export const getPatientPrescriptionHistory = async (
	patientPublicId: string
): Promise<PastMedicalHistoryItem[]> => {
	const res = await ApiService.get<TreatmentHistoryResponse>(
		API_ENDPOINTS.TREATMENTS.PATIENT_HISTORY(patientPublicId)
	)

	return getTreatmentHistoryList(res.data)
		.filter((item) => !!item.notes_image_url || !!item.prescription_s3_key)
		.map<PastMedicalHistoryItem>((item) => {
			const doctor = item.doctor_name?.trim()
			return {
				id: String(
					item.public_id ??
						item.id ??
						item.appointment_public_id ??
						item.appointment_id ??
						item.notes_image_url ??
						item.prescription_s3_key
				),
				category: 'prescription',
				date: item.appointment_date ?? item.created_at ?? item.updated_at ?? '',
				fileUrl: item.notes_image_url || buildS3Url(item.prescription_s3_key),
				notes: item.notes ?? item.diagnosis ?? null,
				doctorName: doctor ? (/^dr\.?\s/i.test(doctor) ? doctor : `Dr. ${doctor}`) : null,
				hospitalName: item.hospital_name?.trim() || null,
				followUpDate: item.follow_up_date ?? null,
				appointmentId: item.appointment_public_id ?? null,
			}
		})
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
