// src/features/admin/adminService.ts
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'

type AdminMutationResponse<TData = unknown> = {
	success: boolean
	message: string
	data: TData
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 1. Interfaces ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

export interface DoctorVerificationItem {
	id: string
	public_id?: string
	name: string
	email?: string
	contact_number?: string
	speciality?: string
	registration_number?: string
	is_verified: boolean
	created_at: string
	license_proof_s3_key?: string
	assigned_admin_id?: string | null
	assigned_admin_name?: string | null
	assigned_at?: string | null
}

export interface DocumentReviewItemPayload {
	document_id?: string | null
	status: 'verified' | 'requires_reupload' | 'rejected' | 'not_reviewed' | 'flagged' | 'under_review'
	issue_tags?: string[]
}

export interface DoctorVerifyPayload {
	is_verified: boolean
	rejection_reason?: string
	reviewer_notes?: string
	issue_flags?: string[]
	document_reviews?: DocumentReviewItemPayload[]
}

export interface NurseVerificationItem {
	id: string
	public_id?: string
	name: string
	owner_name?: string
	email?: string
	contact_number?: string
	license_number?: string
	license_proof_s3_key?: string
	speciality?: string
	qualifications?: string
	capabilities?: string[]
	verification_status?: string
	is_verified: boolean
	created_at: string
	assigned_admin_id?: string | null
	assigned_admin_name?: string | null
	assigned_at?: string | null
}

export interface ProviderVerificationItem {
	id: string
	public_id?: string
	provider_type: 'pharmacy' | 'radiology' | 'laboratory' | 'ancillary' | 'nurse'
	name?: string
	owner_name?: string
	email?: string
	contact_number?: string
	license_number?: string
	license_proof_s3_key?: string
	specialty?: string
	qualifications?: string
	capabilities?: string[]
	verification_status?: string
	is_verified: boolean
	created_at: string
}

export interface ProviderVerifyPayload {
	is_verified: boolean
	rejection_reason?: string
	reviewer_notes?: string
	issue_flags?: string[]
	document_reviews?: DocumentReviewItemPayload[]
}

export interface AuditHistoryEventItem {
	id: string
	reviewer_name: string
	action: string
	document_id?: string | null
	timestamp: string
	issue_tags?: string[]
	notes?: string
}

export interface AdminUserItem {
	id: string
	public_id?: string
	email?: string
	contact_number?: string
	role: string
	is_suspended: boolean
	created_at: string
	/** Only present for patient-role rows -- opens the patient details drawer. */
	patient_id?: string | null
	/** Only present for doctor-role rows -- opens the doctor details drawer. */
	doctor_id?: string | null
	/** Only present for pharmacy-role rows -- opens the pharmacy details drawer. */
	pharmacy_id?: string | null
	/** Only present for laboratory-role rows -- opens the laboratory details drawer. */
	laboratory_id?: string | null
	/** Only present for radiology-role rows -- opens the radiology details drawer. */
	radiology_id?: string | null
	/** Only present for ancillary/nurse-role rows. */
	ancillary_id?: string | null
}

export interface AdminUserListParams {
	role?: string
	phoneNumber?: string
	page?: number
	pageSize?: number
}

export interface AdminUserListResult {
	items: AdminUserItem[]
	total: number
	page: number
	page_size: number
}

export interface AdminPatientPersonalInfo {
	patient_id: string
	name: string
	relation?: string
	avatar_s3_key?: string | null
	email?: string | null
	contact_number?: string | null
	gender?: string | null
	date_of_birth?: string | null
	age?: number | null
	blood_group?: string | null
	marital_status?: string | null
	occupation?: string | null
	address?: string | null
	registration_date?: string
	is_suspended?: boolean | null
}

export interface AdminPatientReviewItem {
	id: string
	doctor_name?: string
	hospital_name?: string | null
	rating: number
	comment?: string | null
	review_date?: string
}

export interface AdminPatientLinkedProfile {
	patient_id: string
	name: string
	relation?: string
	avatar_s3_key?: string | null
	is_current: boolean
}

export interface AdminUpcomingAppointment {
	id: string
	appointment_date: string
	start_time: string
	status: string
	doctor_name?: string | null
	patient_name?: string | null
	hospital_name?: string | null
}

export interface AdminPatientDetail {
	personal_info: AdminPatientPersonalInfo
	reviews: AdminPatientReviewItem[]
	linked_profiles: AdminPatientLinkedProfile[]
	upcoming_appointments: AdminUpcomingAppointment[]
}

export interface AdminProviderQualificationItem {
	id?: number | string
	qualification: string
	institution?: string
	specialization?: string
	year_of_passing?: string | number
	proof_url?: string | null
	proof_s3_key?: string | null
	qualification_proof_s3_key?: string | null
}

export interface AdminProviderDetail {
	provider_id: string
	provider_type: 'pharmacy' | 'radiology' | 'laboratory' | 'ancillary' | 'nurse' | string
	owner_name: string
	business_name?: string | null
	email?: string | null
	contact_number?: string | null
	alternate_mobile?: string | null
	whatsapp_number?: string | null
	avatar_s3_key?: string | null
	is_verified: boolean
	is_suspended?: boolean | null
	license_number?: string | null
	license_proof_s3_key?: string | null
	gst_number?: string | null
	address?: string | null
	city?: string | null
	state?: string | null
	pincode?: string | null
	registration_date?: string
	specialty?: string | null
	qualifications?: string | null
	qualifications_list?: AdminProviderQualificationItem[]
	capabilities?: string[] | null
	verification_status?: string | null
}

export interface AppointmentActionFlags {
	can_reschedule: boolean
	can_cancel: boolean
	can_refund: boolean
}

export interface AdminAppointmentItem {
	id: string
	public_id?: string
	appointment_date: string
	start_time: string
	status: string
	fees?: number
	patient_id?: string
	doctor_id?: string
	patient_name?: string
	doctor_name?: string
	doctor_speciality?: string
	hospital_id?: string
	hospital_name?: string
	action?: AppointmentActionFlags
}

export interface AdminAppointmentListParams {
	page?: number
	pageSize?: number
	search?: string
	patientId?: string
	doctorId?: string
	status?: string
	sortOrder?: 'newest' | 'oldest'
}

export interface AdminAppointmentListResult {
	items: AdminAppointmentItem[]
	total: number
	page: number
	page_size: number
}

export interface DoctorDegreeItem {
	id?: number | string
	degree: string
	specialization?: string
	college?: string
	year_of_passing?: string | number
	qualification_proof_s3_key?: string | null
}

export interface DoctorVerificationDocument {
	id?: number | string | null
	document_type?: string
	name: string
	url: string
	type: string
}

export interface AdminDoctorReviewItem {
	id: string
	patient_name?: string
	hospital_name?: string | null
	rating: number
	comment?: string | null
	review_date?: string
}

export interface DoctorVerificationDetail {
	id: string
	name: string
	email?: string
	contact_number?: string
	gender?: string
	date_of_birth?: string
	location?: string
	is_verified: boolean
	specialities?: string[]
	qualification?: string
	degrees?: DoctorDegreeItem[]
	qualifications?: DoctorDegreeItem[]
	experience_years?: number
	registration_number?: string
	registration_proof_s3_key?: string
	identity_proof_s3_key?: string
	languages?: string[]
	about?: string
	hospital?: string
	consultation_fee?: number
	documents: DoctorVerificationDocument[]
	reviews?: AdminDoctorReviewItem[]
	upcoming_appointments?: AdminUpcomingAppointment[]
}

export interface AdminReschedulePayload {
	appointment_date: string
	start_time: string
	reason?: string
	hospital_id?: string
}

export interface BillingTransactionItem {
	id: string
	patient_id?: number
	doctor_id?: number
	fees?: number
	status?: string
	created_at?: string
}

export interface OperationalLogItem {
	id: number | string
	admin_user_id: number
	action: string
	target_table?: string
	new_value?: unknown
	created_at: string
}

export interface ChatbotSessionLogItem {
	session_id: string
	title?: string
	created_at: string
	messages?: Array<{ role: string; content: string; created_at: string }>
}

export interface SpecialityCreatePayload {
	label: string
	description?: string
	icon_key?: string
	symptoms?: string[]
}

export interface AdminSpecialityItem {
	id: string
	label: string
	description?: string | null
	icon_key?: string | null
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 2. Service API Functions ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

export interface DashboardStats {
	pending_doctors: number
	pending_providers: number
	total_users: number
	total_appointments: number
}

/** GET /api/admin/dashboard/stats */
export const getDashboardStats = async () => {
	const res = await ApiService.get<{ success: boolean; data: DashboardStats }>(
		API_ENDPOINTS.ADMIN.DASHBOARD_STATS
	)
	return res.data
}

export interface VerificationKpiCounts {
	pending_doctors: number
	pending_ancillary: number
	pending_providers: number
	total_applications: number
}

/** GET /api/admin/verifications/kpi-counts -- Dedicated KPI counts for Verification Center */
export const getVerificationKpiCounts = async () => {
	const res = await ApiService.get<{ success: boolean; data: VerificationKpiCounts }>(
		API_ENDPOINTS.ADMIN.VERIFICATION_KPI_COUNTS
	)
	return res.data
}

export interface VerificationQueueListParams {
	page?: number
	pageSize?: number
	category?: 'doctor' | 'ancillary' | 'provider' | string
	subcategory?: string
}

export interface DoctorVerificationListResult {
	items: DoctorVerificationItem[]
	total: number
}

export interface NurseVerificationListResult {
	items: NurseVerificationItem[]
	total: number
}

/** GET /api/admin/providers/verification-queue?category=ancillary */
export const getNursesVerificationQueue = async (params: VerificationQueueListParams = {}) => {
	const { page = 1, pageSize = 10, subcategory } = params
	try {
		const res = await ApiService.getWithParams<{
			success: boolean
			data: NurseVerificationListResult | { items: any[]; total: number }
		}>(API_ENDPOINTS.ADMIN.PROVIDERS_VERIFICATION_QUEUE, {
			page,
			page_size: pageSize,
			category: 'ancillary',
			subcategory: subcategory || undefined,
		})

		if (res.data?.success && res.data.data) {
			if ('items' in res.data.data && Array.isArray(res.data.data.items)) {
				const items: NurseVerificationItem[] = res.data.data.items.map((p: any) => ({
					id: p.id || p.public_id || '',
					public_id: p.public_id || p.id,
					name: p.name || p.owner_name || 'Nurse',
					owner_name: p.owner_name || p.name,
					email: p.email || '',
					contact_number: p.contact_number || '',
					license_number: p.license_number || '',
					license_proof_s3_key: p.license_proof_s3_key,
					speciality: p.specialty || p.speciality || 'General Nursing',
					qualifications: p.qualifications || '',
					capabilities: Array.isArray(p.capabilities) ? p.capabilities : [],
					verification_status: p.verification_status || (p.is_verified ? 'approved' : 'pending'),
					is_verified: Boolean(p.is_verified),
					created_at: p.created_at || '',
					assigned_admin_id: p.assigned_admin_id ?? null,
					assigned_admin_name: p.assigned_admin_name ?? null,
					assigned_at: p.assigned_at ?? null,
				}))
				return { success: true, data: { items, total: res.data.data.total ?? items.length } }
			}
		}
	} catch (err) {
		console.warn('getNursesVerificationQueue safe catch:', err)
	}

	return { success: true, data: { items: [], total: 0 } }
}

/** POST /api/admin/providers/ancillary/:nurse_id/verify */
export const verifyNurse = async (nurseId: string, payload: ProviderVerifyPayload) => {
	return verifyProvider('ancillary', nurseId, payload)
}

export interface ProviderVerificationListResult {
	items: ProviderVerificationItem[]
	total: number
}

/** GET /api/admin/providers/verification-queue?category=doctor */
export const getDoctorsVerificationQueue = async (params: VerificationQueueListParams = {}) => {
	const { page = 1, pageSize = 10, subcategory } = params
	const res = await ApiService.getWithParams<{
		success: boolean
		data: DoctorVerificationItem[] | DoctorVerificationListResult
	}>(
		API_ENDPOINTS.ADMIN.PROVIDERS_VERIFICATION_QUEUE,
		{ page, page_size: pageSize, category: 'doctor', subcategory: subcategory || undefined }
	)

	if (res.data?.success && res.data.data) {
		if ('items' in res.data.data && Array.isArray(res.data.data.items)) {
			return { success: true, data: res.data.data }
		}
		if (Array.isArray(res.data.data)) {
			const all = res.data.data
			const total = all.length
			const start = (page - 1) * pageSize
			const items = all.slice(start, start + pageSize)
			return { success: true, data: { items, total } }
		}
	}
	return { success: true, data: { items: [], total: 0 } }
}

/** POST /api/admin/doctors/:doctor_id/verify */
export const verifyDoctor = async (doctorId: string, payload: DoctorVerifyPayload) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.VERIFY_DOCTOR(doctorId),
		payload
	)
	return res.data
}


/** GET /api/admin/doctors/:doctor_id/verification-detail */
export const getDoctorVerificationDetail = async (doctorId: string) => {
	const res = await ApiService.get<{ success: boolean; data: DoctorVerificationDetail }>(
		API_ENDPOINTS.ADMIN.DOCTOR_VERIFICATION_DETAIL(doctorId)
	)
	return res.data
}

/** GET /api/admin/providers/verification-queue?category=provider */
export const getProvidersVerificationQueue = async (params: VerificationQueueListParams = {}) => {
	const { page = 1, pageSize = 10, subcategory } = params
	const res = await ApiService.getWithParams<{
		success: boolean
		data: {
			pharmacies?: Array<{ id: string; name?: string; owner_name: string; is_verified: boolean; created_at: string; email?: string; contact_number?: string; license_number?: string }>
			radiology?: Array<{ id: string; name?: string; owner_name: string; is_verified: boolean; created_at: string; email?: string; contact_number?: string; license_number?: string }>
			laboratories?: Array<{ id: string; name?: string; owner_name: string; is_verified: boolean; created_at: string; email?: string; contact_number?: string; license_number?: string }>
		} | ProviderVerificationListResult
	}>(API_ENDPOINTS.ADMIN.PROVIDERS_VERIFICATION_QUEUE, {
		page,
		page_size: pageSize,
		category: 'provider',
		subcategory: subcategory || undefined,
	})

	if (res.data?.success && res.data.data) {
		if ('items' in res.data.data && Array.isArray(res.data.data.items)) {
			const items: ProviderVerificationItem[] = res.data.data.items.map((item: any) => ({
				id: item.id || item.public_id || '',
				public_id: item.public_id || item.id,
				name: item.name || item.owner_name || 'Provider',
				owner_name: item.owner_name,
				provider_type: item.provider_type || 'pharmacy',
				email: item.email || '',
				contact_number: item.contact_number || '',
				license_number: item.license_number || '',
				license_proof_s3_key: item.license_proof_s3_key,
				is_verified: Boolean(item.is_verified),
				created_at: item.created_at || '',
			}))
			return { success: true, data: { items, total: res.data.data.total ?? items.length } }
		}
		const rawData = res.data.data as {
			pharmacies?: Array<{ id: string; name?: string; owner_name: string; is_verified: boolean; created_at: string; email?: string; contact_number?: string; license_number?: string }>
			radiology?: Array<{ id: string; name?: string; owner_name: string; is_verified: boolean; created_at: string; email?: string; contact_number?: string; license_number?: string }>
			laboratories?: Array<{ id: string; name?: string; owner_name: string; is_verified: boolean; created_at: string; email?: string; contact_number?: string; license_number?: string }>
		}
		const { pharmacies = [], radiology = [], laboratories = [] } = rawData

		let flattened: ProviderVerificationItem[] = []
		if (!subcategory || subcategory === 'pharmacy') {
			flattened.push(
				...pharmacies.map((item) => ({
					id: item.id,
					public_id: item.id,
					name: item.name || item.owner_name || 'Pharmacy',
					owner_name: item.owner_name,
					provider_type: 'pharmacy' as const,
					email: item.email || '',
					contact_number: item.contact_number || '',
					license_number: item.license_number || '',
					is_verified: item.is_verified,
					created_at: item.created_at,
				}))
			)
		}
		if (!subcategory || subcategory === 'radiology') {
			flattened.push(
				...radiology.map((item) => ({
					id: item.id,
					public_id: item.id,
					name: item.name || item.owner_name || 'Radiology Center',
					owner_name: item.owner_name,
					provider_type: 'radiology' as const,
					email: item.email || '',
					contact_number: item.contact_number || '',
					license_number: item.license_number || '',
					is_verified: item.is_verified,
					created_at: item.created_at,
				}))
			)
		}
		if (!subcategory || subcategory === 'laboratory') {
			flattened.push(
				...laboratories.map((item) => ({
					id: item.id,
					public_id: item.id,
					name: item.name || item.owner_name || 'Diagnostic Lab',
					owner_name: item.owner_name,
					provider_type: 'laboratory' as const,
					email: item.email || '',
					contact_number: item.contact_number || '',
					license_number: item.license_number || '',
					is_verified: item.is_verified,
					created_at: item.created_at,
				}))
			)
		}
		const total = flattened.length
		const start = (page - 1) * pageSize
		const items = flattened.slice(start, start + pageSize)
		return { success: true, data: { items, total } }
	}
	return { success: true, data: { items: [], total: 0 } }
}

/** POST /api/admin/providers/:provider_type/:provider_id/verify */
export const verifyProvider = async (
	providerType: string,
	providerId: string,
	payload: ProviderVerifyPayload
) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.VERIFY_PROVIDER(providerType, providerId),
		payload
	)
	return res.data
}

/** GET /api/admin/verifications/:target_type/:target_id/audit-history */
export const getVerificationAuditHistory = async (targetType: string, targetId: string) => {
	const res = await ApiService.get<{ success: boolean; data: AuditHistoryEventItem[] }>(
		API_ENDPOINTS.ADMIN.VERIFICATION_AUDIT_HISTORY(targetType, targetId)
	)
	return res.data
}

export interface SingleDocumentReviewPayload {
	target_type: string
	target_id: string
	document_id?: string | null
	status: 'verified' | 'requires_reupload' | 'rejected' | 'not_reviewed' | 'flagged' | 'under_review'
	issue_tags?: string[]
	notes?: string
}

/** POST /api/admin/verifications/document-review */
export const recordSingleDocumentReview = async (payload: SingleDocumentReviewPayload) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.RECORD_DOCUMENT_REVIEW,
		payload
	)
	return res.data
}

/** GET /api/admin/users */
export const listUsers = async (params: AdminUserListParams = {}) => {
	const { role, phoneNumber, page = 1, pageSize = 10 } = params
	const queryParams: Record<string, unknown> = { page, page_size: pageSize }
	if (role) queryParams.role = role
	if (phoneNumber) queryParams.phone_number = phoneNumber
	const res = await ApiService.getWithParams<{ success: boolean; data: AdminUserListResult }>(
		API_ENDPOINTS.ADMIN.USERS,
		queryParams
	)
	return res.data
}

/** POST /api/admin/users/:user_public_id/suspend */
export const suspendUser = async (userPublicId: string) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.SUSPEND_USER(userPublicId),
		{}
	)
	return res.data
}

/** POST /api/admin/users/:user_public_id/reset-otp */
export const resetUserOtp = async (userPublicId: string) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.RESET_USER_OTP(userPublicId),
		{}
	)
	return res.data
}

/** GET /api/admin/patients/:patient_public_id/detail */
export const getPatientAdminDetail = async (patientPublicId: string) => {
	const res = await ApiService.get<{ success: boolean; data: AdminPatientDetail }>(
		API_ENDPOINTS.ADMIN.PATIENT_ADMIN_DETAIL(patientPublicId)
	)
	return res.data
}

/** GET /api/admin/doctors/:doctor_id/moderation-detail */
export const getDoctorAdminDetail = async (doctorId: string) => {
	const res = await ApiService.get<{ success: boolean; data: DoctorVerificationDetail }>(
		API_ENDPOINTS.ADMIN.DOCTOR_ADMIN_DETAIL(doctorId)
	)
	return res.data
}

/** GET /api/admin/providers/:provider_type/:provider_id/detail */
export const getProviderAdminDetail = async (providerType: string, providerId: string) => {
	const res = await ApiService.get<{ success: boolean; data: AdminProviderDetail }>(
		API_ENDPOINTS.ADMIN.PROVIDER_ADMIN_DETAIL(providerType, providerId)
	)
	return res.data
}

/** GET /api/admin/appointments */
export const listAdminAppointments = async (params: AdminAppointmentListParams = {}) => {
	const { page = 1, pageSize = 10, search, patientId, doctorId, status, sortOrder } = params
	const res = await ApiService.getWithParams<{ success: boolean; data: AdminAppointmentListResult }>(
		API_ENDPOINTS.ADMIN.APPOINTMENTS,
		{
			page,
			page_size: pageSize,
			...(search ? { search } : {}),
			...(patientId ? { patient_id: patientId } : {}),
			...(doctorId ? { doctor_id: doctorId } : {}),
			...(status ? { status } : {}),
			...(sortOrder ? { sort_order: sortOrder } : {}),
		}
	)
	return res.data
}

/** POST /api/admin/appointments/:appointment_public_id/cancel */
export const cancelAdminAppointment = async (appointmentPublicId: string) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.CANCEL_APPOINTMENT(appointmentPublicId),
		{}
	)
	return res.data
}

/** POST /api/admin/appointments/:appointment_public_id/reschedule */
export const rescheduleAdminAppointment = async (
	appointmentPublicId: string,
	payload: AdminReschedulePayload
) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.RESCHEDULE_APPOINTMENT(appointmentPublicId),
		payload
	)
	return res.data
}

/** GET /api/admin/billing/transactions */
export const getBillingTransactions = async () => {
	const res = await ApiService.get<{ success: boolean; data: BillingTransactionItem[] }>(
		API_ENDPOINTS.ADMIN.BILLING_TRANSACTIONS
	)
	return res.data
}

/** POST /api/admin/appointments/:appointment_public_id/refund */
export const refundAppointment = async (appointmentPublicId: string) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.REFUND_APPOINTMENT(appointmentPublicId),
		{}
	)
	return res.data
}

/** GET /api/admin/audits/operational-logs */
export const getOperationalLogs = async () => {
	const res = await ApiService.get<{ success: boolean; data: OperationalLogItem[] }>(
		API_ENDPOINTS.ADMIN.OPERATIONAL_LOGS
	)
	return res.data
}

/** GET /api/admin/chatbot/session-logs */
export const getChatbotSessionLogs = async () => {
	const res = await ApiService.get<{ success: boolean; data: ChatbotSessionLogItem[] }>(
		API_ENDPOINTS.ADMIN.CHATBOT_SESSION_LOGS
	)
	return res.data
}

/** DELETE /api/admin/chatbot/sessions/:session_id/memory */
export const clearChatbotSessionMemory = async (sessionId: string) => {
	const res = await ApiService.delete<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.CLEAR_CHATBOT_MEMORY(sessionId)
	)
	return res.data
}

/** DELETE /api/admin/reviews/:review_public_id */
export const deleteReview = async (reviewPublicId: string) => {
	const res = await ApiService.delete<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.DELETE_REVIEW(reviewPublicId)
	)
	return res.data
}

/** POST /api/admin/specialities */
export const createSpeciality = async (payload: SpecialityCreatePayload) => {
	const res = await ApiService.post<AdminMutationResponse<AdminSpecialityItem>>(
		API_ENDPOINTS.ADMIN.SPECIALITIES,
		payload
	)
	return res.data
}

/** GET /api/specialities */
export const listSpecialities = async () => {
	const res = await ApiService.get<{ success: boolean; data: AdminSpecialityItem[] }>(
		API_ENDPOINTS.SPECIALITIES.LIST
	)
	return res.data
}

// ── 5. Blogs, Comments & Ads Management ─────────────────────────────────────

export interface AdminBlogItem {
	id: string
	title: string
	slug: string
	content?: string
	category: string
	status: string
	image_url?: string
	is_featured: boolean
	published_at?: string
	created_at: string
	author_name: string
	comments_count: number
}

export interface AdminCommentItem {
	id: string
	content: string
	status: string
	created_at: string
	user_email: string
	user_name: string
	post_title: string
	post_slug: string
}

export interface AdminAdItem {
	id: string
	title: string
	image_url: string
	target_url: string
	is_active: boolean
	start_date?: string
	end_date?: string
	impressions: number
	clicks: number
	ctr: number
}

export interface AdminAdPlacementItem {
	id: string
	page_route: string
	placement_key: string
	paragraph_index?: number
	category?: string
	ad: {
		id: string
		title: string
		image_url: string
	}
}

export const listAdminBlogs = async () => {
	const res = await ApiService.get<AdminMutationResponse<AdminBlogItem[]>>(
		API_ENDPOINTS.ADMIN.BLOGS
	)
	return res.data
}

export const getAdminBlog = async (blogId: string) => {
	const res = await ApiService.get<AdminMutationResponse<AdminBlogItem>>(
		API_ENDPOINTS.ADMIN.BLOG_DETAIL(blogId)
	)
	return res.data
}

export const createAdminBlog = async (payload: { title: string; content: string; category: string; status?: string; image_url?: string; is_featured?: boolean }) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.BLOGS,
		payload
	)
	return res.data
}

export const updateAdminBlog = async (blogId: string, payload: { title?: string; content?: string; category?: string; status?: string; image_url?: string; is_featured?: boolean }) => {
	const res = await ApiService.put<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.BLOG_DETAIL(blogId),
		payload
	)
	return res.data
}

export const deleteAdminBlog = async (blogId: string) => {
	const res = await ApiService.delete<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.BLOG_DETAIL(blogId)
	)
	return res.data
}

export const listPendingComments = async () => {
	const res = await ApiService.get<AdminMutationResponse<AdminCommentItem[]>>(
		API_ENDPOINTS.ADMIN.PENDING_COMMENTS
	)
	return res.data
}

export const approveComment = async (commentId: string) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.APPROVE_COMMENT(commentId),
		{}
	)
	return res.data
}

export const moderateComment = async (commentId: string, status: 'approved' | 'flagged' | 'hidden') => {
	const res = await ApiService.post<AdminMutationResponse>(
		`${API_ENDPOINTS.ADMIN.MODERATE_COMMENT(commentId)}?status=${status}`,
		{}
	)
	return res.data
}

export type ReviewStatus = 'pending' | 'approved' | 'hidden' | 'deleted'

export interface AdminReviewItem {
	id: string
	patient_name?: string
	doctor_name?: string
	hospital_name?: string | null
	rating: number
	comment?: string | null
	status: ReviewStatus
	review_date?: string
}

export interface AdminReviewListParams {
	page?: number
	pageSize?: number
	search?: string
	status?: ReviewStatus | ''
	sortOrder?: 'newest' | 'oldest'
}

export interface AdminReviewListResult {
	items: AdminReviewItem[]
	total: number
	page: number
	page_size: number
}

/** GET /api/admin/reviews */
export const listReviews = async (params: AdminReviewListParams = {}) => {
	const { page = 1, pageSize = 10, search, status, sortOrder } = params
	const res = await ApiService.getWithParams<{ success: boolean; data: AdminReviewListResult }>(
		API_ENDPOINTS.ADMIN.REVIEWS,
		{
			page,
			page_size: pageSize,
			...(search ? { search } : {}),
			...(status ? { status } : {}),
			...(sortOrder ? { sort_order: sortOrder } : {}),
		}
	)
	return res.data
}

/** PATCH /api/admin/reviews/:review_public_id/status */
export const updateReviewStatus = async (reviewId: string, status: ReviewStatus) => {
	const res = await ApiService.patch<AdminMutationResponse<{ id: string; status: ReviewStatus }>>(
		API_ENDPOINTS.ADMIN.REVIEW_STATUS(reviewId),
		{ status }
	)
	return res.data
}

export const listAllAds = async () => {
	const res = await ApiService.get<AdminMutationResponse<AdminAdItem[]>>(
		API_ENDPOINTS.ADMIN.ADS
	)
	return res.data
}

export const createAd = async (payload: { title: string; image_url: string; target_url: string; is_active?: boolean; start_date?: string; end_date?: string }) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.ADS,
		payload
	)
	return res.data
}

export const updateAd = async (adId: string, payload: { title?: string; image_url?: string; target_url?: string; is_active?: boolean; start_date?: string; end_date?: string }) => {
	const res = await ApiService.put<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.AD_DETAIL(adId),
		payload
	)
	return res.data
}

export const deleteAd = async (adId: string) => {
	const res = await ApiService.delete<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.AD_DETAIL(adId)
	)
	return res.data
}

export const listAdPlacements = async () => {
	const res = await ApiService.get<AdminMutationResponse<AdminAdPlacementItem[]>>(
		API_ENDPOINTS.ADMIN.AD_PLACEMENTS
	)
	return res.data
}

export const createAdPlacement = async (payload: { ad_id: string; page_route: string; placement_key: string; paragraph_index?: number; category?: string }) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.AD_PLACEMENTS,
		payload
	)
	return res.data
}

export const deleteAdPlacement = async (placementId: string) => {
	const res = await ApiService.delete<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.AD_PLACEMENT_DETAIL(placementId)
	)
	return res.data
}

// ── 6. Admin Communities Management ──────────────────────────────────────────

export interface AdminCommunityItem {
	id: string
	name: string
	description?: string
	category: string
	icon_name?: string
	is_featured: boolean
}

export const listAdminCommunities = async () => {
	const res = await ApiService.get<AdminMutationResponse<AdminCommunityItem[]>>(
		API_ENDPOINTS.ADMIN.COMMUNITIES
	)
	return res.data
}

export const createAdminCommunity = async (payload: { name: string; description?: string; category: string; icon_name?: string; is_featured?: boolean }) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.COMMUNITIES,
		payload
	)
	return res.data
}

export const updateAdminCommunity = async (groupId: string, payload: { name?: string; description?: string; category?: string; icon_name?: string; is_featured?: boolean }) => {
	const res = await ApiService.put<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.COMMUNITY_DETAIL(groupId),
		payload
	)
	return res.data
}

export const deleteAdminCommunity = async (groupId: string) => {
	const res = await ApiService.delete<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.COMMUNITY_DETAIL(groupId)
	)
	return res.data
}

// ── Q&A Moderation ────────────────────────────────────────────────────────────

export type QAStatus = 'pending' | 'approved' | 'flagged' | 'hidden'

export interface AdminQAReply {
	id: string
	content: string
	status: QAStatus
	user_name: string
	created_at: string | null
}

export interface AdminQAAnswer {
	id: string
	answer: string
	likes: number
	status: QAStatus
	doctor_name: string
	doctor_id: string | null
	created_at: string | null
	replies: AdminQAReply[]
	replies_count: number
}

export interface AdminQAQuestion {
	id: string
	gender: string
	age: string
	location: string
	tag: string
	question: string
	short_description: string
	full_description: string
	history: string | null
	patient_avatar: string | null
	status: QAStatus
	answers_count: number
	created_at: string | null
}

export interface AdminQAQuestionDetail extends AdminQAQuestion {
	answers: AdminQAAnswer[]
}

export interface AdminQAListResult {
	questions: AdminQAQuestion[]
	total: number
	page: number
	pages: number
}

export const listAdminQAQuestions = async (params: {
	search?: string
	status?: string
	page?: number
	page_size?: number
} = {}) => {
	const { search, status, page = 1, page_size = 20 } = params
	const query: Record<string, unknown> = { page, page_size }
	if (search) query.search = search
	if (status) query.status = status
	const res = await ApiService.getWithParams<{ success: boolean; data: AdminQAListResult }>(
		API_ENDPOINTS.ADMIN.QA_QUESTIONS,
		query
	)
	return res.data
}

export const getAdminQAQuestionDetail = async (questionId: string) => {
	const res = await ApiService.get<{ success: boolean; data: AdminQAQuestionDetail }>(
		API_ENDPOINTS.ADMIN.QA_QUESTION_DETAIL(questionId)
	)
	return res.data
}

export const updateAdminQAQuestionStatus = async (questionId: string, status: QAStatus) => {
	const res = await ApiService.patch<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.QA_QUESTION_STATUS(questionId),
		{ status }
	)
	return res.data
}

export const updateAdminQAAnswerStatus = async (answerId: string, status: QAStatus) => {
	const res = await ApiService.patch<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.QA_ANSWER_STATUS(answerId),
		{ status }
	)
	return res.data
}

export const updateAdminQAReplyStatus = async (replyId: string, status: QAStatus) => {
	const res = await ApiService.patch<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.QA_REPLY_STATUS(replyId),
		{ status }
	)
	return res.data
}

// -- 10. Admin Events Management ------------------------------------------

export interface AdminEventItem {
	id: string
	title: string
	category: string
	category_label?: string
	event_date: string
	event_time: string
	end_time: string
	registration_link?: string
	description: string
	cover_image_url?: string
	status: string
	location_type: string
	location?: string
	is_expired?: boolean
	created_at: string
	updated_at?: string
}

export const listAdminEvents = async () => {
	const res = await ApiService.get<AdminMutationResponse<AdminEventItem[]>>(
		API_ENDPOINTS.ADMIN.EVENTS
	)
	return res.data
}

export const createAdminEvent = async (payload: Partial<AdminEventItem>) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.EVENTS,
		payload
	)
	return res.data
}

export const updateAdminEvent = async (eventId: string, payload: Partial<AdminEventItem>) => {
	const res = await ApiService.put<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.EVENT_DETAIL(eventId),
		payload
	)
	return res.data
}

export const deleteAdminEvent = async (eventId: string) => {
	const res = await ApiService.delete<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.EVENT_DETAIL(eventId)
	)
	return res.data
}

// ── 11. Admin Articles Management ──────────────────────────────────────────

export interface AdminArticleItem {
	id: string
	title: string
	summary: string
	content: string
	category: string
	cover_image?: string
	coverImage?: string
	author: string
	tags?: string
	status: 'draft' | 'published' | string
	publish_date?: string
	publishDate?: string
	created_at: string
	createdAt?: string
}

export const listAdminArticles = async () => {
	const res = await ApiService.get<AdminMutationResponse<AdminArticleItem[]>>(
		API_ENDPOINTS.ADMIN.ARTICLES
	)
	return res.data
}

export const getAdminArticle = async (articleId: string) => {
	const res = await ApiService.get<AdminMutationResponse<AdminArticleItem>>(
		API_ENDPOINTS.ADMIN.ARTICLE_DETAIL(articleId)
	)
	return res.data
}

export const createAdminArticle = async (payload: Partial<AdminArticleItem>) => {
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.ARTICLES,
		payload
	)
	return res.data
}

export const updateAdminArticle = async (articleId: string, payload: Partial<AdminArticleItem>) => {
	const res = await ApiService.put<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.ARTICLE_DETAIL(articleId),
		payload
	)
	return res.data
}

export const deleteAdminArticle = async (articleId: string) => {
	const res = await ApiService.delete<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.ARTICLE_DETAIL(articleId)
	)
	return res.data
}

// ── Admin Management (Sub Admins) ──
export interface SubAdminItem {
	id?: string | number
	public_id: string
	name: string
	email: string
	contact_number: string
	role: 'support_admin' | 'billing_admin' | 'compliance_admin' | string
	department?: string | null
	is_suspended: boolean
	created_at?: string
}

export interface CreateSubAdminPayload {
	name: string
	email: string
	contact_number: string
	password?: string
	role: 'support_admin' | 'billing_admin' | 'compliance_admin'
	department?: string
}

export interface SubAdminListParams {
	role?: string
	page?: number
	pageSize?: number
}

export interface SubAdminListResult {
	items: SubAdminItem[]
	total: number
	page: number
	page_size: number
}

export const listSubAdmins = async (params: SubAdminListParams = {}) => {
	const res = await ApiService.get<AdminMutationResponse<SubAdminListResult>>(
		API_ENDPOINTS.ADMIN.SUB_ADMINS,
		{
			params: {
				role: params.role || undefined,
				page: params.page || 1,
				page_size: params.pageSize || 10,
			},
		}
	)
	return res.data
}

export const createSubAdmin = async (payload: CreateSubAdminPayload) => {
	const res = await ApiService.post<AdminMutationResponse<SubAdminItem>>(
		API_ENDPOINTS.ADMIN.SUB_ADMINS,
		payload
	)
	return res.data
}

export const updateSubAdminStatus = async (publicId: string, isSuspended: boolean) => {
	const res = await ApiService.patch<AdminMutationResponse<SubAdminItem>>(
		API_ENDPOINTS.ADMIN.SUB_ADMIN_STATUS(publicId),
		{ is_suspended: isSuspended }
	)
	return res.data
}


// ── Doctor Verification Assignment ─────────────────────────────────────────────

export interface AssignDoctorsResult {
	assigned_to_id: string
	assigned_count: number
	doctor_ids: string[]
}

/** POST /api/admin/doctors/assign -- Super Admin routes doctors to a compliance_admin Sub Admin. */
export const assignDoctorsToSubadmin = async (doctorIds: string[], assignedToId: string) => {
	const res = await ApiService.post<AdminMutationResponse<AssignDoctorsResult>>(
		API_ENDPOINTS.ADMIN.ASSIGN_DOCTORS,
		{ doctor_ids: doctorIds, assigned_to_id: assignedToId }
	)
	return res.data
}

/** Super Admin routes providers / ancillary applications to a compliance_admin Sub Admin. */
export const assignProvidersToSubadmin = async (
	providerIds: string[],
	assignedToId: string,
	providerType: string = 'ancillary'
) => {
	const res = await ApiService.post<AdminMutationResponse<AssignDoctorsResult>>(
		API_ENDPOINTS.ADMIN.ASSIGN_DOCTORS,
		{ provider_ids: providerIds, doctor_ids: providerIds, assigned_to_id: assignedToId, provider_type: providerType }
	)
	return res.data
}


// ── Admin Ancillary Operations / Service Management ───────────────────────────

export interface AdminAncillaryPatient {
	id: string
	public_id?: string
	name: string
	contact_number?: string
	relationship?: string
	age?: number
	gender?: string
}

export interface AdminAncillaryNurse {
	provider_id: string
	public_id?: string
	name: string
	qualifications?: string
	is_online: boolean
	is_verified: boolean
	license_number?: string
	contact_number?: string
	current_lat?: number
	current_lng?: number
	last_location_update?: string
}

export interface AdminAncillaryServiceInfo {
	specialty_id?: string
	specialty_name?: string
	procedure_id?: string
	procedure_name?: string
	estimated_duration?: string
	medical_notes?: string
	chief_complaint?: string
}

export interface AdminAncillaryLocation {
	street_address: string
	latitude?: number
	longitude?: number
}

export interface AdminAncillaryPayment {
	amount: string
	payment_method: string
	payment_status: string
}

export interface AdminAncillarySessionInfo {
	otp_verified: boolean
	otp_verified_at?: string | null
	checklist?: Record<string, boolean> | null
	clinical_notes?: string | null
}

export type AncillaryRequestStatus =
	| 'SEARCHING'
	| 'SEARCHING_FOR_NURSE'
	| 'SCHEDULED_PENDING'
	| 'REQUESTED'
	| 'OFFERED'
	| 'ASSIGNED'
	| 'NURSE_ASSIGNED'
	| 'EN_ROUTE'
	| 'ARRIVED'
	| 'IN_PROGRESS'
	| 'VERIFICATION_PENDING'
	| 'COMPLETED'
	| 'CANCELLED'
	| 'CANCELLED_BY_PATIENT'
	| 'CANCELLED_BY_PROVIDER'
	| 'EXPIRED'
	| 'FAILED'

export const ANCILLARY_SEARCHING_STATUSES: AncillaryRequestStatus[] = [
	'SEARCHING',
	'SEARCHING_FOR_NURSE',
	'SCHEDULED_PENDING',
	'REQUESTED',
]

export const ANCILLARY_ACTIVE_STATUSES: AncillaryRequestStatus[] = [
	'ASSIGNED',
	'NURSE_ASSIGNED',
	'EN_ROUTE',
	'ARRIVED',
	'IN_PROGRESS',
	'VERIFICATION_PENDING',
]

export const ANCILLARY_CANCELLED_STATUSES: AncillaryRequestStatus[] = [
	'CANCELLED',
	'CANCELLED_BY_PATIENT',
	'CANCELLED_BY_PROVIDER',
	'EXPIRED',
	'FAILED',
]

export const ANCILLARY_TERMINAL_STATUSES: AncillaryRequestStatus[] = [
	'COMPLETED',
	'CANCELLED',
	'CANCELLED_BY_PATIENT',
	'CANCELLED_BY_PROVIDER',
	'EXPIRED',
	'FAILED',
]

export interface AdminAncillaryRequestItem {
	id: string
	public_id: string
	patient: AdminAncillaryPatient
	nurse: AdminAncillaryNurse | null
	service: AdminAncillaryServiceInfo
	location: AdminAncillaryLocation
	booking_type: 'INSTANT' | 'SCHEDULED' | string
	status: AncillaryRequestStatus | string
	assignment: {
		offer_status?: string
	} | null
	payment: AdminAncillaryPayment
	created_at: string
	requires_attention?: boolean
	attention_reason?: string
}

export interface AdminAncillaryStats {
	active_services: number
	searching_unassigned: number
	in_progress: number
	completed_today: number
	cancelled: number
}

export interface AdminAncillaryStatsParams {
	specialtyId?: string
	dateFilter?: string
	startDate?: string
	endDate?: string
}

export interface AdminAncillaryDetail extends AdminAncillaryRequestItem {
	session?: AdminAncillarySessionInfo | null
}

export interface AdminAncillaryListParams {
	page?: number
	pageSize?: number
	search?: string
	status?: string
	bookingType?: string
	specialtyId?: string
	providerId?: string
	dateFilter?: string
	startDate?: string
	endDate?: string
	sortOrder?: 'newest' | 'oldest' | string
}

export interface AdminAncillaryListResult {
	items: AdminAncillaryRequestItem[]
	total: number
	page: number
	page_size: number
	total_pages: number
	stats?: AdminAncillaryStats
}

export interface AvailableAncillaryProviderItem {
	provider_id: string
	public_id: string
	name: string
	qualifications?: string
	specialty_name?: string
	is_online: boolean
	is_verified: boolean
	license_number?: string
	contact_number?: string
}

export interface AncillaryCategoryItem {
	id: string
	code: string
	title: string
	description?: string
	icon?: string
}

/** GET /api/ancillary/categories -- Get active categories / specialties from backend */
export const getAncillaryCategories = async () => {
	const res = await ApiService.get<{ success: boolean; data: AncillaryCategoryItem[] }>(
		'/api/ancillary/categories'
	)
	return res.data
}

/** GET /api/admin/ancillary/requests -- List operational ancillary requests */
export const listAdminAncillaryRequests = async (params: AdminAncillaryListParams = {}) => {
	const res = await ApiService.get<AdminMutationResponse<AdminAncillaryListResult>>(
		API_ENDPOINTS.ADMIN.ANCILLARY_REQUESTS,
		{
			params: {
				page: params.page || 1,
				page_size: params.pageSize || 10,
				search: params.search || undefined,
				status: params.status || undefined,
				booking_type: params.bookingType || undefined,
				specialty_id: params.specialtyId || undefined,
				provider_id: params.providerId || undefined,
				date_filter: params.dateFilter || undefined,
				start_date: params.startDate || undefined,
				end_date: params.endDate || undefined,
				sort_order: params.sortOrder || 'newest',
			},
		}
	)
	return res.data
}

/** GET /api/admin/ancillary/stats -- Dedicated KPI counts for Ancillary Operations */
export const getAncillaryOperationsKpi = async (params: AdminAncillaryStatsParams = {}) => {
	const res = await ApiService.get<{
		success: boolean
		data: AdminAncillaryStats
	}>(API_ENDPOINTS.ADMIN.ANCILLARY_STATS, {
		params: {
			specialty_id: params.specialtyId && params.specialtyId !== 'all' ? params.specialtyId : undefined,
			date_filter: params.dateFilter || undefined,
			start_date: params.startDate || undefined,
			end_date: params.endDate || undefined,
		},
	})
	return res.data
}

/** GET /api/admin/ancillary/stats -- Alias for backward compatibility */
export const getAdminAncillaryStats = getAncillaryOperationsKpi

/** GET /api/admin/ancillary/requests/:requestId -- Fetch full operational detail */
export const getAdminAncillaryRequestDetail = async (requestId: string) => {
	const res = await ApiService.get<AdminMutationResponse<AdminAncillaryDetail>>(
		API_ENDPOINTS.ADMIN.ANCILLARY_DETAIL(requestId)
	)
	return res.data
}

/** POST /api/admin/ancillary/requests/:requestId/cancel -- Admin cancellation */
export const cancelAdminAncillaryRequest = async (requestId: string, reason: string) => {
	const res = await ApiService.post<AdminMutationResponse<{ requestId: string; status: string }>>(
		API_ENDPOINTS.ADMIN.CANCEL_ANCILLARY_REQUEST(requestId),
		{ reason }
	)
	return res.data
}

/** POST /api/admin/ancillary/requests/:requestId/reassign -- Automatic admin nurse reassignment */
export const reassignAdminAncillaryRequest = async (requestId: string, reason?: string) => {
	const res = await ApiService.post<AdminMutationResponse<{ requestId: string; providerId: string; providerName?: string; status: string }>>(
		API_ENDPOINTS.ADMIN.REASSIGN_ANCILLARY_REQUEST(requestId),
		{ reason }
	)
	return res.data
}

/** GET /api/admin/ancillary/available-providers -- List online/verified nurses for reassignment */
export const getAvailableAncillaryProviders = async (procedureId?: string) => {
	const res = await ApiService.get<AdminMutationResponse<AvailableAncillaryProviderItem[]>>(
		API_ENDPOINTS.ADMIN.AVAILABLE_ANCILLARY_PROVIDERS,
		{
			params: {
				procedure_id: procedureId || undefined,
			},
		}
	)
	return res.data
}


