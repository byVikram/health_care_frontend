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

export interface DoctorVerifyPayload {
	is_verified: boolean
	rejection_reason?: string
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
}

export interface AdminUserItem {
	id: number
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

export interface AdminPatientDetail {
	personal_info: AdminPatientPersonalInfo
	reviews: AdminPatientReviewItem[]
	linked_profiles: AdminPatientLinkedProfile[]
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
}

export interface AdminAppointmentListResult {
	items: AdminAppointmentItem[]
	total: number
	page: number
	page_size: number
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
	experience_years?: number
	registration_number?: string
	languages?: string[]
	about?: string
	hospital?: string
	consultation_fee?: number
	documents: DoctorVerificationDocument[]
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
	symptoms?: string[]
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 2. Service API Functions ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

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

/** GET /api/admin/users */
export const listUsers = async (params: AdminUserListParams = {}) => {
	const { role, page = 1, pageSize = 10 } = params
	const queryParams: Record<string, unknown> = { page, page_size: pageSize }
	if (role) queryParams.role = role
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
	const { page = 1, pageSize = 10, search } = params
	const res = await ApiService.getWithParams<{ success: boolean; data: AdminAppointmentListResult }>(
		API_ENDPOINTS.ADMIN.APPOINTMENTS,
		{ page, page_size: pageSize, ...(search ? { search } : {}) }
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
	const res = await ApiService.post<AdminMutationResponse>(
		API_ENDPOINTS.ADMIN.SPECIALITIES,
		payload
	)
	return res.data
}
