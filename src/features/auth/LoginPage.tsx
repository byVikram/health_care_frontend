// features/auth/LoginPage.tsx
import { Box } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import OtpForm from './components/OtpForm'
import { toast } from 'react-toastify'
import { ROUTES } from '../../constants/routes'

// import OtpVerified from './components/OtpVerified'

export default function LoginPage() {
	const [step, setStep] = useState<'login' | 'otp' | 'verified'>('login')
	const [contactNumber, setContactNumber] = useState('')
	const navigate = useNavigate()

	const handleVerified = () => {
		setStep('verified')
		toast.success('Logged in successfully.')
		// const role = localStorage.getItem('role')
		// if (role === 'doctor')
		navigate(ROUTES.PORTAL.HOME, { replace: true })
		// else navigate('/patient')
	}

	return (
		<Box>
			{step === 'login' && (
				<LoginForm
					initialContactNumber={contactNumber}
					onSubmit={(number) => {
						setContactNumber(number)
						setStep('otp')
					}}
				/>
			)}
			{step === 'otp' && <OtpForm contactNumber={contactNumber} onVerify={handleVerified} onBack={() => setStep('login')} />}
			{/* {step === 'verified' && <OtpVerified />} */}
		</Box>
	)
}
