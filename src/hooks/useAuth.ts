// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { SpecialitiesResponse } from '../types/speciality'
import { AppointmentStatus } from '../types/appointment'
import { UserRole as OnboardingUserRole } from '../data/onboardingData'

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

export interface LookupHospital {
	id: string
	label: string
	address?: string
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
		localStorage.setItem('lookup', JSON.stringify(lookupData))
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

// ---------------------------------------------------------------------------
// DB ids from the user_role table
//   1 = patient | 2 = doctor | 3 = laboratory | 4 = pharmacy | 5 = radiology
// ---------------------------------------------------------------------------
const ROLE_ID_MAP: Record<OnboardingUserRole, number> = {
	PATIENT:    1,
	LABORATORY: 3,
	PHARMACIST: 4,
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

// ---------------------------------------------------------------------------
// useOnboardingFlow
//
// Holds all state and logic for the signup journey:
//   RoleSelectorPage -> OnBoardingPage -> RegisterPage
//
// Moved here from AppRoutes so AppRoutes only defines URL routes.
// AppRoutes imports this hook and uses what it returns.
// ---------------------------------------------------------------------------
export function useOnboardingFlow(): OnboardingFlow {
	// Which role the user picked from RoleSelectorPage (e.g. 'PATIENT')
	const [selectedRole, setSelectedRole] = useState<OnboardingUserRole | null>(null)

	// The matching DB id for that role (e.g. 1 for PATIENT)
	const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

	// Which screen to show right now:
	//   'roleSelect' -> RoleSelectorPage  (default starting point)
	//   'onboarding' -> OnBoardingPage slides
	//   'register'   -> RegisterPage
	const [onboardingStep, setOnboardingStep] = useState<'roleSelect' | 'onboarding' | 'register'>('roleSelect')

	// Called when user taps a role card in RoleSelectorPage
	const handleRoleSelect = (role: OnboardingUserRole) => {
		if (role === 'RADIOLOGY') return
		const roleId = ROLE_ID_MAP[role]
		setSelectedRole(role)
		setSelectedRoleId(roleId)
		setOnboardingStep('onboarding')
	}

	// Called when user clicks "Get Started" or "Skip" in OnBoardingPage
	const handleOnboardingFinish = (roleId: number) => {
		setSelectedRoleId(roleId)
		setOnboardingStep('register')
	}

	// Called from WelcomePage onContinue - jumps straight to register
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
