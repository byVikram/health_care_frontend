// src/features/admin/adminService.ts
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'

// ── 1. Interfaces ─────────────────────────────────────────────────────────────

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
}

export interface AdminAppointmentItem {
	id: string
	public_id?: string
	appointment_date: string
	start_time: string
	status: string
	fees?: number
	patient_id?: number
	doctor_id?: number
	patient_name?: string
	doctor_name?: string
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
	new_value?: any
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

// ── 2. Service API Functions ──────────────────────────────────────────────────

/** GET /api/admin/doctors/verification-queue */
export const getDoctorsVerificationQueue = async () => {
	const res = await ApiService.get<{ success: boolean; data: DoctorVerificationItem[] }>(
		API_ENDPOINTS.ADMIN.DOCTORS_VERIFICATION_QUEUE
	)
	return res.data
}

/** POST /api/admin/doctors/:doctor_id/verify */
export const verifyDoctor = async (doctorId: string, payload: DoctorVerifyPayload) => {
	const res = await ApiService.post<{ success: boolean; message: string; data: any }>(
		API_ENDPOINTS.ADMIN.VERIFY_DOCTOR(doctorId),
		payload
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
	const res = await ApiService.post<{ success: boolean; message: string; data: any }>(
		API_ENDPOINTS.ADMIN.VERIFY_PROVIDER(providerType, providerId),
		payload
	)
	return res.data
}

/** GET /api/admin/users */
export const listUsers = async (role?: string) => {
	const params = role ? { role } : {}
	const res = await ApiService.getWithParams<{ success: boolean; data: AdminUserItem[] }>(
		API_ENDPOINTS.ADMIN.USERS,
		params
	)
	return res.data
}

/** POST /api/admin/users/:user_public_id/suspend */
export const suspendUser = async (userPublicId: string) => {
	const res = await ApiService.post<{ success: boolean; message: string; data: any }>(
		API_ENDPOINTS.ADMIN.SUSPEND_USER(userPublicId),
		{}
	)
	return res.data
}

/** POST /api/admin/users/:user_public_id/reset-otp */
export const resetUserOtp = async (userPublicId: string) => {
	const res = await ApiService.post<{ success: boolean; message: string; data: any }>(
		API_ENDPOINTS.ADMIN.RESET_USER_OTP(userPublicId),
		{}
	)
	return res.data
}

/** GET /api/admin/appointments */
export const listAdminAppointments = async () => {
	const res = await ApiService.get<{ success: boolean; data: AdminAppointmentItem[] }>(
		API_ENDPOINTS.ADMIN.APPOINTMENTS
	)
	return res.data
}

/** POST /api/admin/appointments/:appointment_public_id/cancel */
export const cancelAdminAppointment = async (appointmentPublicId: string) => {
	const res = await ApiService.post<{ success: boolean; message: string; data: any }>(
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
	const res = await ApiService.post<{ success: boolean; message: string; data: any }>(
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
	const res = await ApiService.post<{ success: boolean; message: string; data: any }>(
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
	const res = await ApiService.delete<{ success: boolean; message: string; data: any }>(
		API_ENDPOINTS.ADMIN.CLEAR_CHATBOT_MEMORY(sessionId)
	)
	return res.data
}

/** DELETE /api/admin/reviews/:review_public_id */
export const deleteReview = async (reviewPublicId: string) => {
	const res = await ApiService.delete<{ success: boolean; message: string; data: any }>(
		API_ENDPOINTS.ADMIN.DELETE_REVIEW(reviewPublicId)
	)
	return res.data
}

/** POST /api/admin/specialities */
export const createSpeciality = async (payload: SpecialityCreatePayload) => {
	const res = await ApiService.post<{ success: boolean; message: string; data: any }>(
		API_ENDPOINTS.ADMIN.SPECIALITIES,
		payload
	)
	return res.data
}
