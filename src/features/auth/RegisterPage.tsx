// features/auth/RegisterPage.tsx
import { Box } from '@mui/material'
import { useState } from 'react'
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom'
import RegisterForm from './components/RegisterForm'
import OtpForm from './components/OtpForm'
import { ROUTES } from '../../constants/routes'

export default function RegisterPage() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()

	// Primary source: URL param. Fallback: localStorage saved on role select
	const urlRoleId = searchParams.get('roleId')
	const stored = localStorage.getItem('selected_role')
	const storedRoleId = stored ? JSON.parse(stored).id : null
	const roleId: string | null = urlRoleId ?? storedRoleId

	const [step, setStep] = useState<'register' | 'otp'>('register')
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
			{step === 'otp' && (
				<OtpForm onVerify={() => navigate(ROUTES.PUBLIC.WELCOME_DOCTOR)} contactNumber={contactNumber} />
			)}
		</Box>
	)
}
