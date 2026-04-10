// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { SpecialitiesResponse } from '../types/speciality'
import { AppointmentStatus } from '../types/appointment'

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

// Matches backend GET /api/lookup -> data.hospitals[]
export interface LookupHospital {
	id: string | number
	name: string
	location: string
}

export interface LookupData {
	appoinment_statuses: AppointmentStatus[]
	specialities: SpecialitiesResponse[]
	hospitals: LookupHospital[]
}

export interface AuthState {
	role: UserRole | null
	user: AuthUser | null
	accessToken: string | null
	refreshToken: string | null
	lookupData: LookupData | null
}

// ---------------------------------------------------------------------------
// Read snapshot from localStorage (pure, no React)
// ---------------------------------------------------------------------------
function readAuthSnapshot(): AuthState {
	try {
		const role = localStorage.getItem('role') as UserRole | null
		const raw = localStorage.getItem('user')
		const user = raw ? (JSON.parse(raw) as AuthUser) : null
		const accessToken = localStorage.getItem('access_token')
		const refreshToken = localStorage.getItem('refresh_token')
		const lookupRaw = localStorage.getItem('lookup')
		const lookupData: LookupData | null = lookupRaw ? (JSON.parse(lookupRaw) as LookupData) : null
		return { role, user, accessToken, refreshToken, lookupData }
	} catch {
		return { role: null, user: null, accessToken: null, refreshToken: null, lookupData: null }
	}
}

// ---------------------------------------------------------------------------
// Reactive hook - re-renders when auth changes
// ---------------------------------------------------------------------------
export function useAuth(): AuthState {
	const [auth, setAuth_] = useState<AuthState>(readAuthSnapshot)

	useEffect(() => {
		// Listen for storage events from OTHER tabs
		const onStorage = (e: StorageEvent) => {
			if (['role', 'user', 'access_token', 'refresh_token', 'lookup'].includes(e.key ?? '')) {
				setAuth_(readAuthSnapshot())
			}
		}
		// Listen for our own custom event (same tab)
		const onAuthChange = () => setAuth_(readAuthSnapshot())

		window.addEventListener('storage', onStorage)
		window.addEventListener('auth-changed', onAuthChange)
		return () => {
			window.removeEventListener('storage', onStorage)
			window.removeEventListener('auth-changed', onAuthChange)
		}
	}, [])

	return auth
}

// ---------------------------------------------------------------------------
// setAuth - stores to localStorage then fires event so useAuth hooks update
// ---------------------------------------------------------------------------
export function setAuth(
	role: UserRole,
	user: AuthUser,
	accessToken: string,
	refreshToken: string,
	lookupData?: LookupData | null
): void {
	localStorage.setItem('role', role)
	localStorage.setItem('user', JSON.stringify(user))
	localStorage.setItem('access_token', accessToken)
	localStorage.setItem('refresh_token', refreshToken)
	if (lookupData != null) {
		localStorage.setItem('lookup', JSON.stringify(lookupData))
	}
	// Notify all useAuth() hooks in this tab to re-read
	window.dispatchEvent(new Event('auth-changed'))
}

export function clearAuth(): void {
	localStorage.removeItem('role')
	localStorage.removeItem('user')
	localStorage.removeItem('access_token')
	localStorage.removeItem('refresh_token')
	localStorage.removeItem('lookup')
	window.dispatchEvent(new Event('auth-changed'))
}

export function getAccessToken(): string | null {
	return localStorage.getItem('access_token')
}