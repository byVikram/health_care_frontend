// features/auth/RegisterPage.tsx
import { Box } from '@mui/material'
import { useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import RegisterForm from './components/RegisterForm'
import OtpForm from './components/OtpForm'
import AccountSuccess from './components/AccountSuccess'
import WelcomePage from './WelcomePage'
import { ROUTES } from '../../constants/routes'

export default function RegisterPage() {
	const [searchParams] = useSearchParams()

	// Primary source: URL param. Fallback: localStorage saved on role select
	const urlRoleId = searchParams.get('roleId')
	const stored = localStorage.getItem('selected_role')
	const storedRoleId = stored ? JSON.parse(stored).id : null
	const roleId: string | null = urlRoleId ?? storedRoleId

	const [step, setStep] = useState<'register' | 'otp' | 'verified' | 'success' | 'welcome'>('register')
	const [contactNumber, setContactNumber] = useState('')

	// Guard: must come through onboarding to reach register
	if (!roleId) {
		return <Navigate to={ROUTES.ROLE_SELECT} replace />
	}

	return (
		<Box>
			{step === 'register' && (
				<RegisterForm
					onSubmit={(mobile) => {
						setContactNumber(mobile)
						setStep('otp')
					}}
					roleId={roleId}
				/>
			)}
			{step === 'otp' && <OtpForm onVerify={() => setStep('success')} contactNumber={contactNumber} />}
			{step === 'success' && <AccountSuccess onContinue={() => setStep('welcome')} />}
			{step === 'welcome' && <WelcomePage onContinue={() => {}} />}
		</Box>
	)
}
