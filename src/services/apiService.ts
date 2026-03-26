// src/services/apiService.ts
import axios, { AxiosResponse } from 'axios'
import { clearAuth } from '../hooks/useAuth'

// ── Axios instance ────────────────────────────────────────────────────────────
const axiosInstance = axios.create()

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
		if (error.response?.status === 401) {
			clearAuth()
			window.location.href = '/login'
		}
		return Promise.reject(error)
	}
)

// ── ApiService ────────────────────────────────────────────────────────────────
const ApiService = {
	get<T = unknown>(url: string): Promise<AxiosResponse<T>> {
		return axiosInstance.get<T>(url)
	},

	getWithParams<T = unknown>(url: string, params: Record<string, unknown>): Promise<AxiosResponse<T>> {
		return axiosInstance.get<T>(url, { params })
	},

	post<T = unknown>(url: string, body: unknown): Promise<AxiosResponse<T>> {
		return axiosInstance.post<T>(url, body)
	},

	patch<T = unknown>(url: string, body: unknown): Promise<AxiosResponse<T>> {
		return axiosInstance.patch<T>(url, body)
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
