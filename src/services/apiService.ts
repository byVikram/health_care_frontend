// src/services/apiService.ts
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { clearAuth, getRefreshToken, setAuthTokens } from '../hooks/useAuth'
import { API_ENDPOINTS } from '../constants/apiUrls'
import { toast } from 'react-toastify'

// Augment AxiosRequestConfig so internal retry/refresh flags are typed
declare module 'axios' {
	export interface AxiosRequestConfig {
		suppressErrorToast?: boolean
		_skipAuthRefresh?: boolean
		_retry?: boolean
	}
}

// Extends the standard axios config with app-specific opt-outs, e.g. to
// silence the global error toast for requests where a non-2xx response
// (like a 404) is an expected, handled state rather than a real error.
export interface ApiRequestConfig extends AxiosRequestConfig {
	suppressErrorToast?: boolean
	_skipAuthRefresh?: boolean
	_retry?: boolean
}

// ── Axios instance ────────────────────────────────────────────────────────────
export const API_BASE_URL = (import.meta.env.VITE_API_ENDPOINT as string | undefined)?.replace(/\/+$/, '')

const axiosInstance = axios.create({
	baseURL: API_BASE_URL || undefined,
})

// ── Refresh state & single-flight queue ──────────────────────────────────────
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null
let isRedirecting = false

const handleAuthFailure = () => {
	clearAuth()
	if (!isRedirecting) {
		isRedirecting = true
		if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
			window.location.href = '/login'
		}
	}
}

// ── Request interceptor — attach Bearer token automatically ───────────────────
axiosInstance.interceptors.request.use(
	(config) => {
		if (!config._skipAuthRefresh) {
			const token = localStorage.getItem('access_token')
			if (token) {
				config.headers.Authorization = `Bearer ${token}`
			}
		}
		return config
	},
	(error) => Promise.reject(error)
)

// ── Response interceptor — handle 401 automatically with silent refresh ───────
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (axios.isCancel(error)) {
			return Promise.reject(error)
		}

		const status = error.response?.status
		const originalRequest = error.config

		if (status === 401) {
			const url = originalRequest?.url || ''
			const isAuthEndpoint =
				url.includes(API_ENDPOINTS.AUTH.REFRESH) ||
				url.includes(API_ENDPOINTS.AUTH.LOGOUT) ||
				url.includes(API_ENDPOINTS.AUTH.VERIFY_OTP) ||
				url.includes(API_ENDPOINTS.AUTH.SEND_OTP)

			const storedRefreshToken = getRefreshToken()

			const isEligible =
				Boolean(originalRequest) &&
				!originalRequest._retry &&
				!originalRequest._skipAuthRefresh &&
				!isAuthEndpoint &&
				Boolean(storedRefreshToken)

			if (!isEligible) {
				handleAuthFailure()
				return Promise.reject(error)
			}

			originalRequest._retry = true

			if (!isRefreshing) {
				isRefreshing = true
				refreshPromise = (async () => {
					try {
						const refreshUrl = `${API_BASE_URL || ''}${API_ENDPOINTS.AUTH.REFRESH}`
						const response = await axios.post<{
							success: boolean
							message: string
							data: {
								access_token: string
								refresh_token: string
							}
						}>(
							refreshUrl,
							{ refresh_token: storedRefreshToken },
							{
								headers: {
									'Content-Type': 'application/json',
								},
							}
						)

						const newAccessToken = response.data?.data?.access_token
						const newRefreshToken = response.data?.data?.refresh_token

						if (!newAccessToken) {
							throw new Error('No access token returned in refresh response')
						}

						setAuthTokens(newAccessToken, newRefreshToken)
						return newAccessToken
					} catch {
						handleAuthFailure()
						return null
					} finally {
						isRefreshing = false
						refreshPromise = null
					}
				})()
			}

			try {
				const token = await refreshPromise
				if (!token) {
					return Promise.reject(error)
				}

				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${token}`
				}

				return axiosInstance(originalRequest)
			} catch (retryError) {
				return Promise.reject(retryError)
			}
		}

		const message = error.response?.data?.message || 'Something went wrong'
		if (!originalRequest?.suppressErrorToast) {
			// Callers can opt out (e.g. when a 404 is an expected "not found yet"
			// state rather than a real error) by passing { suppressErrorToast: true }.
			toast.error(message) // 👈 global toast
		}

		return Promise.reject(error)
	}
)

// ── ApiService ────────────────────────────────────────────────────────────────
const ApiService = {
	get<T = unknown>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
		return axiosInstance.get<T>(url, config)
	},

	getWithParams<T = unknown>(url: string, params: Record<string, unknown>, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
		return axiosInstance.get<T>(url, { params, ...config })
	},

	post<T = unknown>(url: string, body: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
		return axiosInstance.post<T>(url, body, config)
	},

	patch<T = unknown>(url: string, body: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
		return axiosInstance.patch<T>(url, body, config)
	},

	put<T = unknown>(url: string, body: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
		return axiosInstance.put<T>(url, body, config)
	},

	delete<T = unknown>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
		return axiosInstance.delete<T>(url, config)
	},

	deleteWithBody<T = unknown>(url: string, body: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
		return axiosInstance.delete<T>(url, { data: body, ...config })
	},
}

export default ApiService
