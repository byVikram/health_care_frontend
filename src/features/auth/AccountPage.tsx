// features/auth/AccountPage.tsx
// features/auth/AccountPage.tsx
import { Box } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AccountForm from './components/AccountForm'
import AccountSuccess from './components/AccountSuccess'
import WelcomePage from './WelcomePage'

export default function AccountPage() {
	const navigate = useNavigate()
	const [step, setStep] = useState<'account' | 'success' | 'welcome'>('account')

	return (
		<Box>
			{step === 'account' && <AccountForm onSubmit={() => setStep('success')} />}
			{step === 'success' && <AccountSuccess onContinue={() => setStep('welcome')} />}
			{step === 'welcome' && <WelcomePage onContinue={() => navigate('/dashboard')} />}
		</Box>
	)
}
