// features/auth/RegisterPage.tsx
import { Box } from '@mui/material'
import { useState } from 'react'
import RegisterForm from './components/RegisterForm'
import OtpForm from './components/OtpForm'
import AccountSuccess from './components/AccountSuccess'
import WelcomePage from './WelcomePage'

interface Props {
	roleId?: number | null   // DB id from user_role table (e.g. 1=patient, 3=laboratory, 4=pharmacy, 5=radiology)
}

export default function RegisterPage({ roleId }: Props = {}) {
	const [step, setStep] = useState<'register' | 'otp' | 'verified' | 'success' | 'welcome'>('register')
	const [contactNumber, setContactNumber] = useState('')

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
