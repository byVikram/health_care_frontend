// src/hooks/useAuth.ts
export type UserRole = 'doctor' | 'patient'

export interface AuthUser {
	id?: string
	name: string
	email?: string
	avatar?: string
	profileCompletion?: number
	profilePath?: string
	showQr?: boolean
}

export interface AuthState {
	role: UserRole | null
	user: AuthUser | null
	accessToken: string | null
	refreshToken: string | null
}

export function useAuth(): AuthState {
	try {
		const role = localStorage.getItem('role') as UserRole | null
		const raw = localStorage.getItem('user')
		const user = raw ? (JSON.parse(raw) as AuthUser) : null
		const accessToken = localStorage.getItem('access_token')
		const refreshToken = localStorage.getItem('refresh_token')
		return { role, user, accessToken, refreshToken }
	} catch {
		return { role: null, user: null, accessToken: null, refreshToken: null }
	}
}

export function setAuth(role: UserRole, user: AuthUser, accessToken: string, refreshToken: string): void {
	localStorage.setItem('role', role)
	localStorage.setItem('user', JSON.stringify(user))
	localStorage.setItem('access_token', accessToken)
	localStorage.setItem('refresh_token', refreshToken)
}

export function clearAuth(): void {
	localStorage.removeItem('role')
	localStorage.removeItem('user')
	localStorage.removeItem('access_token')
	localStorage.removeItem('refresh_token')
}

export function getAccessToken(): string | null {
	return localStorage.getItem('access_token')
}
