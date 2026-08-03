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
}

export interface DocumentReviewItemPayload {
	document_id: string
	document_name: string
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

export interface ProviderVerificationItem {
	id: string
	public_id?: string
	provider_type: 'pharmacy' | 'radiology' | 'laboratory'
	name?: string
	owner_name?: string
	email?: string
	contact_number?: string
	license_number?: string
	license_proof_s3_key?: string
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
	document_id?: string
	document_name?: string
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

export interface AdminProviderDetail {
	provider_id: string
	provider_type: 'pharmacy' | 'radiology' | 'laboratory'
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
	gst_number?: string | null
	address?: string | null
	city?: string | null
	state?: string | null
	pincode?: string | null
	registration_date?: string
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
	id: number | string
	name: string
	url: string
	type: string
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
	experience_years?: number
	registration_number?: string
	registration_proof_s3_key?: string
	identity_proof_s3_key?: string
	languages?: string[]
	about?: string
	hospital?: string
	consultation_fee?: number
	documents: DoctorVerificationDocument[]
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

/** GET /api/admin/doctors/verification-queue */
export const getDoctorsVerificationQueue = async () => {
	const res = await ApiService.get<{ success: boolean; data: DoctorVerificationItem[] }>(
		API_ENDPOINTS.ADMIN.DOCTORS_VERIFICATION_QUEUE
	)
	return res.data
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

/** GET /api/admin/providers/verification-queue */
export const getProvidersVerificationQueue = async () => {
	const res = await ApiService.get<{
		success: boolean
		data: {
			pharmacies: Array<{ id: string; owner_name: string; is_verified: boolean; created_at: string }>
			radiology: Array<{ id: string; owner_name: string; is_verified: boolean; created_at: string }>
			laboratories: Array<{ id: string; owner_name: string; is_verified: boolean; created_at: string }>
		}
	}>(API_ENDPOINTS.ADMIN.PROVIDERS_VERIFICATION_QUEUE)

	if (res.data?.success && res.data.data) {
		const { pharmacies = [], radiology = [], laboratories = [] } = res.data.data
		const flattened: ProviderVerificationItem[] = [
			...pharmacies.map((item) => ({
				id: item.id,
				name: item.owner_name || 'Pharmacy',
				owner_name: item.owner_name,
				provider_type: 'pharmacy' as const,
				is_verified: item.is_verified,
				created_at: item.created_at,
			})),
			...radiology.map((item) => ({
				id: item.id,
				name: item.owner_name || 'Radiology Center',
				owner_name: item.owner_name,
				provider_type: 'radiology' as const,
				is_verified: item.is_verified,
				created_at: item.created_at,
			})),
			...laboratories.map((item) => ({
				id: item.id,
				name: item.owner_name || 'Diagnostic Lab',
				owner_name: item.owner_name,
				provider_type: 'laboratory' as const,
				is_verified: item.is_verified,
				created_at: item.created_at,
			})),
		]
		return { success: true, data: flattened }
	}

	return { success: false, data: [] }
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
	document_id: string
	document_name: string
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
	const { page = 1, pageSize = 10, search, patientId, doctorId } = params
	const res = await ApiService.getWithParams<{ success: boolean; data: AdminAppointmentListResult }>(
		API_ENDPOINTS.ADMIN.APPOINTMENTS,
		{
			page,
			page_size: pageSize,
			...(search ? { search } : {}),
			...(patientId ? { patient_id: patientId } : {}),
			...(doctorId ? { doctor_id: doctorId } : {}),
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
