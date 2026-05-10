// features/auth/RegisterPage.tsx
import { Box } from '@mui/material'
import { useState } from 'react'
import RegisterForm from './components/RegisterForm'
import OtpForm from './components/OtpForm'
import AccountSuccess from './components/AccountSuccess'
import WelcomePage from './WelcomePage'
import RoleSelectorPage from './onboarding/RoleSelectorPage'
import OnBoardingPage from './onboarding/OnBoardingPage'
import { UserRole, onboardingData } from '../../data/onboardingData'

// ── Map API label → onboarding slide key ────────────────────────────────────
// If the label doesn't match any key we fall back to PATIENT slides.
function labelToUserRole(label: string): UserRole {
	const map: Record<string, UserRole> = {
		patient: 'PATIENT',
		doctor: 'PATIENT',   // no DOCTOR slides yet — reuse PATIENT
		pharmacist: 'PHARMACIST',
		pharmacy: 'PHARMACIST',
		laboratory: 'LABORATORY',
		radiology: 'RADIOLOGY',
	}
	return map[label.toLowerCase()] ?? 'PATIENT'
}

type Step = 'roleSelect' | 'onboarding' | 'register' | 'otp' | 'success' | 'welcome'

export default function RegisterPage() {
	const [step, setStep] = useState<Step>('roleSelect')

	// Selected from RoleSelectorPage
	const [selectedRoleId, setSelectedRoleId] = useState<string>('')
	const [selectedRoleLabel, setSelectedRoleLabel] = useState<string>('')

	// Contact captured from RegisterForm → passed to OtpForm
	const [contactNumber, setContactNumber] = useState('')

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleRoleSelect = (roleId: string, label: string) => {
		setSelectedRoleId(roleId)
		setSelectedRoleLabel(label)

		const userRole = labelToUserRole(label)
		// Only show onboarding slides if we have data for this role
		const hasSlides = onboardingData[userRole]?.screens?.length > 0
		setStep(hasSlides ? 'onboarding' : 'register')
	}

	const handleOnboardingFinish = () => {
		setStep('register')
	}

	const handleRegisterSubmit = (mobile: string) => {
		setContactNumber(mobile)
		setStep('otp')
	}

	// ── Render ────────────────────────────────────────────────────────────────

	if (step === 'roleSelect') {
		return <RoleSelectorPage onSelectRole={handleRoleSelect} />
	}

	if (step === 'onboarding') {
		const userRole = labelToUserRole(selectedRoleLabel)
		return (
			<OnBoardingPage
				role={userRole}
				roleId={selectedRoleId}
				onFinish={handleOnboardingFinish}
			/>
		)
	}

	return (
		<Box>
			{step === 'register' && (
				<RegisterForm
					onSubmit={handleRegisterSubmit}
					roleId={selectedRoleId}
				/>
			)}
			{step === 'otp' && (
				<OtpForm onVerify={() => setStep('success')} contactNumber={contactNumber} />
			)}
			{step === 'success' && (
				<AccountSuccess onContinue={() => setStep('welcome')} />
			)}
			{step === 'welcome' && <WelcomePage onContinue={() => { }} />}
		</Box>
	)
}
