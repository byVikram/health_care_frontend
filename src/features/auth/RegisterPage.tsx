// features/auth/RegisterPage.tsx
import { Box } from '@mui/material'
import { useState } from 'react'
import RegisterForm from './components/RegisterForm'
import OtpForm from './components/OtpForm'
import OtpVerified from './components/OtpVerified'
import RoleSelectorPage from './onboarding/RoleSelectorPage'
import OnBoardingPage from './onboarding/OnBoardingPage'
import { UserRole, onboardingData } from '../../data/onboardingData'

function labelToUserRole(label: string): UserRole {
	const map: Record<string, UserRole> = {
		patient:    'PATIENT',
		doctor:     'PATIENT',
		pharmacist: 'PHARMACIST',
		pharmacy:   'PHARMACIST',
		laboratory: 'LABORATORY',
		radiology:  'RADIOLOGY',
	}
	return map[label.toLowerCase()] ?? 'PATIENT'
}

type Step = 'roleSelect' | 'onboarding' | 'register' | 'otp' | 'success'

export default function RegisterPage() {
	const [step, setStep] = useState<Step>('roleSelect')
	const [selectedRoleId, setSelectedRoleId] = useState<string>('')
	const [selectedRoleLabel, setSelectedRoleLabel] = useState<string>('')
	const [contactNumber, setContactNumber] = useState('')

	const isDoctor = selectedRoleLabel.toLowerCase() === 'doctor'

	const handleRoleSelect = (roleId: string, label: string) => {
		setSelectedRoleId(roleId)
		setSelectedRoleLabel(label)
		const userRole = labelToUserRole(label)
		const hasSlides = onboardingData[userRole]?.screens?.length > 0
		setStep(hasSlides ? 'onboarding' : 'register')
	}

	const handleOnboardingFinish = () => setStep('register')

	const handleRegisterSubmit = (mobile: string) => {
		setContactNumber(mobile)
		setStep('otp')
	}

	if (step === 'roleSelect') {
		return <RoleSelectorPage onSelectRole={handleRoleSelect} />
	}

	if (step === 'onboarding') {
		return (
			<OnBoardingPage
				role={labelToUserRole(selectedRoleLabel)}
				roleId={selectedRoleId}
				onFinish={handleOnboardingFinish}
			/>
		)
	}

	return (
		<Box>
			{step === 'register' && (
				<RegisterForm onSubmit={handleRegisterSubmit} roleId={selectedRoleId} />
			)}
			{step === 'otp' && (
				<OtpForm onVerify={() => setStep('success')} contactNumber={contactNumber} />
			)}
			{step === 'success' && (
				<OtpVerified isDoctor={isDoctor} />
			)}
		</Box>
	)
}
