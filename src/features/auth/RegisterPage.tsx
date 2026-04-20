// features/auth/RegisterPage.tsx
import { Box } from '@mui/material'
import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import RegisterForm from './components/RegisterForm'
import OtpForm from './components/OtpForm'
// import OtpVerified from './components/OtpVerified'
import AccountSuccess from './components/AccountSuccess'
import WelcomePage from './WelcomePage'

export default function RegisterPage() {
	// const navigate = useNavigate()
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
				/>
			)}
			{step === 'otp' && <OtpForm onVerify={() => setStep('success')} contactNumber={contactNumber} />}
			{/* {step === 'verified' && <OtpVerified />} */}
			{step === 'success' && <AccountSuccess onContinue={() => setStep('welcome')} />}
			{step === 'welcome' && <WelcomePage onContinue={() => {}} />}
		</Box>
	)
}
