// features/auth/RegisterPage.tsx
import { Box } from '@mui/material'
import { useState } from 'react'
import RegisterForm from './components/RegisterForm'
import OtpForm from './components/OtpForm'
import OtpVerified from './components/OtpVerified'
import RoleSelectorPage from './onboarding/RoleSelectorPage'
import OnBoardingPage from './onboarding/OnBoardingPage'
import { type UserRole, onboardingData } from '../../data/onboardingData'

// The roles that register through the app. A role not listed here has no intro slides (it goes straight to the form).
function labelToUserRole(label: string): UserRole | undefined {
	const map: Record<string, UserRole> = {
		patient:    'PATIENT',
		doctor:     'DOCTOR',
		ancillary:  'ANCILLARY', // the healthcare provider; the kind of provider goes separately as `specialty_id`
	}
	return map[label.trim().toLowerCase()]
}

type Step = 'roleSelect' | 'onboarding' | 'register' | 'otp' | 'success'

export default function RegisterPage() {
	const [step, setStep] = useState<Step>('roleSelect')
	const [selectedRoleId, setSelectedRoleId] = useState<string>('')
	const [selectedRoleLabel, setSelectedRoleLabel] = useState<string>('')
	// The kind of healthcare provider (Nurse, ...): the backend needs it to register one.
	const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
	const [contactNumber, setContactNumber] = useState('')

	// Lifted form state — persists when user clicks pencil icon to go back
	const [savedName, setSavedName] = useState('')
	const [savedEmail, setSavedEmail] = useState('')
	const [savedMobile, setSavedMobile] = useState('')

	const handleRoleSelect = (roleId: string, label: string, specialty?: string) => {
		setSelectedRoleId(roleId)
		setSelectedRoleLabel(label)
		setSelectedSpecialty(specialty ?? '')
		const userRole = labelToUserRole(label)
		const hasSlides = !!userRole && onboardingData[userRole].screens.length > 0
		setStep(hasSlides ? 'onboarding' : 'register')
	}

	// Healthcare provider (ancillary) sign-up stops at the last intro slide for now: its screens are not designed yet, so
	// "Get Started" does nothing. The backend flow (role_id + specialty_id) is unchanged.
	const handleOnboardingFinish = () => {
		if (labelToUserRole(selectedRoleLabel) === 'ANCILLARY') return
		setStep('register')
	}
	const handleOnboardingBack = () => setStep('roleSelect')
	const handleOtpEdit = () => setStep('register')

	const handleRegisterSubmit = (mobile: string, name: string, email: string) => {
		setContactNumber(mobile)
		setSavedName(name)
		setSavedEmail(email)
		setSavedMobile(mobile)
		setStep('otp')
	}

	if (step === 'roleSelect') {
		return <RoleSelectorPage onSelectRole={handleRoleSelect} />
	}

	const onboardingRole = labelToUserRole(selectedRoleLabel)
	if (step === 'onboarding' && onboardingRole) {
		return (
			<OnBoardingPage
				role={onboardingRole}
				roleId={selectedRoleId}
				onFinish={handleOnboardingFinish}
				onBack={handleOnboardingBack}
				holdAtLastSlide={onboardingRole === 'ANCILLARY'}
			/>
		)
	}

	return (
		<Box>
			{step === 'register' && (
				<RegisterForm
					onSubmit={handleRegisterSubmit}
					roleId={selectedRoleId}
					specialty={selectedSpecialty || undefined}
					initialName={savedName}
					initialEmail={savedEmail}
					initialMobile={savedMobile}
				/>
			)}
			{step === 'otp' && (
				<OtpForm onVerify={() => setStep('success')} contactNumber={contactNumber} onEdit={handleOtpEdit} />
			)}
			{step === 'success' && (
				<OtpVerified role={selectedRoleLabel} />
			)}
		</Box>
	)
}
