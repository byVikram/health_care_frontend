
import { useState, useEffect } from 'react'
import { SpecialitiesResponse } from '../types/speciality'
import { AppointmentStatus } from '../types/appointment'
import { UserRole as OnboardingUserRole } from '../data/onboardingData'

export type UserRole = 'doctor' | 'patient' | 'laboratory' | 'pharmacy' | 'radiology'

export interface AuthUser {
	id?: string
	name: string
	email?: string
	avatar?: string
	profileCompletion?: number
	profilePath?: string
	showQr?: boolean
}

export interface LookupHospital {
	id: string
	label: string
	address?: string
}

export interface PatientProfile {
	id: string
	name: string
	relation: string
	avatar_s3_key?: string
	is_self: boolean
}

export interface LookupData {
	appointment_statuses: AppointmentStatus[]
	appoinment_statuses?: AppointmentStatus[]
	specialities: SpecialitiesResponse[]
	hospitals: LookupHospital[]
	patient_profiles: PatientProfile[]
}

export interface AuthState {
	role: UserRole | null
	user: AuthUser | null
	accessToken: string | null
	refreshToken: string | null
	lookupData: LookupData | null
}

function readAuthSnapshot(): AuthState {
	try {
		const role = localStorage.getItem('role') as UserRole | null
		const raw = localStorage.getItem('user')
		const user = raw ? (JSON.parse(raw) as AuthUser) : null
		const accessToken = localStorage.getItem('access_token')
		const refreshToken = localStorage.getItem('refresh_token')
		const lookupRaw = localStorage.getItem('lookup')
		const lookupData = normalizeLookupData(lookupRaw ? (JSON.parse(lookupRaw) as Partial<LookupData>) : null)
		return { role, user, accessToken, refreshToken, lookupData }
	} catch {
		return { role: null, user: null, accessToken: null, refreshToken: null, lookupData: null }
	}
}

function normalizeLookupData(data: Partial<LookupData> | null): LookupData | null {
	if (!data) return null
	return {
		appointment_statuses: data.appointment_statuses ?? data.appoinment_statuses ?? [],
		specialities: data.specialities ?? [],
		hospitals: data.hospitals ?? [],
		patient_profiles: data.patient_profiles ?? [],
	}
}

export function useAuth(): AuthState {
	const [auth, setAuth_] = useState<AuthState>(readAuthSnapshot)

	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (['role', 'user', 'access_token', 'refresh_token', 'lookup'].includes(e.key ?? '')) {
				setAuth_(readAuthSnapshot())
			}
		}
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
		localStorage.setItem('lookup', JSON.stringify(normalizeLookupData(lookupData)))
	}
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


export const ROLE_ID_MAP: Record<OnboardingUserRole, number> = {
	PATIENT:    1,
	DOCTOR:     2,
	LABORATORY: 3,
	PHARMACY: 4,
	RADIOLOGY:  5,
}

export interface OnboardingFlow {
	selectedRole:           OnboardingUserRole | null
	selectedRoleId:         number | null
	onboardingStep:         'roleSelect' | 'onboarding' | 'register'
	handleRoleSelect:       (role: OnboardingUserRole) => void
	handleOnboardingFinish: (roleId: number) => void
	goToRegister:           () => void
}


export function useOnboardingFlow(): OnboardingFlow {
	
	const [selectedRole, setSelectedRole] = useState<OnboardingUserRole | null>(null)

	
	const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

	
	const [onboardingStep, setOnboardingStep] = useState<'roleSelect' | 'onboarding' | 'register'>('roleSelect')

	
	const handleRoleSelect = (role: OnboardingUserRole) => {
		const roleId = ROLE_ID_MAP[role]
		setSelectedRole(role)
		setSelectedRoleId(roleId)
		setOnboardingStep('onboarding')
	}

	
	const handleOnboardingFinish = (roleId: number) => {
		setSelectedRoleId(roleId)
		setOnboardingStep('register')
	}

	
	const goToRegister = () => setOnboardingStep('register')

	return {
		selectedRole,
		selectedRoleId,
		onboardingStep,
		handleRoleSelect,
		handleOnboardingFinish,
		goToRegister,
	}
}

