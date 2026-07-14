// src/services/apiService.ts
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { clearAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

// Extends the standard axios config with app-specific opt-outs, e.g. to
// silence the global error toast for requests where a non-2xx response
// (like a 404) is an expected, handled state rather than a real error.
export interface ApiRequestConfig extends AxiosRequestConfig {
	suppressErrorToast?: boolean
}

// ── Axios instance ────────────────────────────────────────────────────────────
const API_BASE_URL = (import.meta.env.VITE_API_ENDPOINT as string | undefined)?.replace(/\/+$/, '')

const axiosInstance = axios.create({
	baseURL: API_BASE_URL || undefined,
})

// ── Request interceptor — attach Bearer token automatically ───────────────────
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('access_token')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => Promise.reject(error)
)

// ── Response interceptor — handle 401 automatically ──────────────────────────
axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response?.status
		const message = error.response?.data?.message || 'Something went wrong'

		if (status === 401) {
			clearAuth()
			window.location.href = '/login'
		} else if (!error.config?.suppressErrorToast) {
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

	getWithParams<T = unknown>(url: string, params: Record<string, unknown>): Promise<AxiosResponse<T>> {
		return axiosInstance.get<T>(url, { params })

	},

	post<T = unknown>(url: string, body: unknown): Promise<AxiosResponse<T>> {
		return axiosInstance.post<T>(url, body)
	},

	patch<T = unknown>(url: string, body: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return axiosInstance.patch<T>(url, body, config)
	},

	put<T = unknown>(url: string, body: unknown): Promise<AxiosResponse<T>> {
		return axiosInstance.put<T>(url, body)
	},

	delete<T = unknown>(url: string): Promise<AxiosResponse<T>> {
		return axiosInstance.delete<T>(url)
	},

	deleteWithBody<T = unknown>(url: string, body: unknown): Promise<AxiosResponse<T>> {
		return axiosInstance.delete<T>(url, { data: body })
	},
}

export default ApiService
