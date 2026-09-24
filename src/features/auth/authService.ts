// src/features/auth/authService.ts
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { LookupData, clearAuth, getRefreshToken } from '../../hooks/useAuth'

export interface SendOtpResponse {
	success: boolean
	message: string
	data: Record<string, unknown>
}

export interface VerifyOtpRequest {
	contact_number: string
	otp: string
	device_type: string
	device_name?: string
	fcm_token?: string | null
	device_metadata?: Record<string, unknown>
}

export interface VerifyOtpUser {
	id: string
	name: string
	email: string
	role: 'doctor' | 'patient'
	avatar?: string
}

export interface VerifyOtpResponse {
	success: boolean
	message: string
	data: {
		user: VerifyOtpUser
		access_token: string
		refresh_token: string
		token_type: string
		expires_in: number
		notification_prompt_shown?: boolean
	}
}

export interface VerifyLookupResponse {
	success: boolean
	message: string
	data: LookupData
}

export interface Role {
	id: string
	label: string
}

export interface VerifyRolesResponse {
	success: boolean
	message: string
	data: Role[]
}

export interface CreateUserRequest {
	contact_number?: string
	email: string
	name: string
	role_id?: string
	password?: string
}

export interface VerifyUserCreationResponse {
	success: boolean
	message: string
}

export const sendOtp = async (contactNumber: string): Promise<SendOtpResponse> => {
	const res = await ApiService.post<SendOtpResponse>(API_ENDPOINTS.AUTH.SEND_OTP, { contact_number: contactNumber })
	return res.data
}

export const verifyOtp = async (request: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
	const res = await ApiService.post<VerifyOtpResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, request)
	return res.data
}

export const getLookupData = async (): Promise<VerifyLookupResponse> => {
	const res = await ApiService.get<VerifyLookupResponse>(API_ENDPOINTS.LOOKUP.GET)
	return res.data
}

export const getRoles = async (): Promise<VerifyRolesResponse> => {
	const res = await ApiService.get<VerifyRolesResponse>(API_ENDPOINTS.AUTH.GET_ROLES)
	return res.data
}

export const createUser = async (data: CreateUserRequest): Promise<VerifyUserCreationResponse> => {
	const res = await ApiService.post<VerifyUserCreationResponse>(API_ENDPOINTS.AUTH.CREATE_USER, data)
	return res.data
}

export interface RefreshTokenRequest {
	refresh_token: string
}

export interface RefreshTokenResponse {
	success: boolean
	message: string
	data: {
		user: VerifyOtpUser
		access_token: string
		refresh_token: string
		token_type: string
		expires_in: number
		notification_prompt_shown?: boolean
	}
}

export const refreshToken = async (refreshTokenValue: string): Promise<RefreshTokenResponse> => {
	const res = await ApiService.post<RefreshTokenResponse>(
		API_ENDPOINTS.AUTH.REFRESH,
		{ refresh_token: refreshTokenValue },
		{ _skipAuthRefresh: true }
	)
	return res.data
}

export interface LogoutRequest {
	refresh_token: string
}

export interface LogoutResponse {
	message: string
}

let logoutPromise: Promise<void> | null = null

export const logout = async (): Promise<void> => {
	if (logoutPromise) {
		return logoutPromise
	}

	logoutPromise = (async () => {
		const refreshTokenValue = getRefreshToken()
		if (refreshTokenValue) {
			try {
				await ApiService.post<LogoutResponse>(
					API_ENDPOINTS.AUTH.LOGOUT,
					{ refresh_token: refreshTokenValue },
					{ _skipAuthRefresh: true, suppressErrorToast: true }
				)
			} catch (error) {
				console.error('Server-side logout failed:', error)
			}
		}
		clearAuth()
	})().finally(() => {
		logoutPromise = null
	})

	return logoutPromise
}


