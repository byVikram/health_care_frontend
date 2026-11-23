// Login / register / OTP in one pop-up, so a signed-out visitor can sign in without leaving the page (same flow the doctor
// page uses when booking). `useLoginPrompt` (own file) is the usual way in: call `prompt(after)` when an action needs a login, render `modal`.
import { useState } from 'react'
import AppModal from '../Modal/AppModal'
import LoginForm from '../../../features/auth/components/LoginForm'
import RegisterForm from '../../../features/auth/components/RegisterForm'
import OtpForm from '../../../features/auth/components/OtpForm'

type View = 'login' | 'register' | 'otp'

interface AuthModalProps {
	open: boolean
	onClose: () => void
	onVerified: () => void
	/** Title of the login step, e.g. 'Login to join'. */
	loginTitle?: string
}

export default function AuthModal({ open, onClose, onVerified, loginTitle = 'Login to continue' }: AuthModalProps) {
	const [view, setView] = useState<View>('login')
	const [contactNumber, setContactNumber] = useState('')

	const reset = () => {
		setView('login')
		setContactNumber('')
	}
	const close = () => {
		onClose()
		reset()
	}
	const next = (number: string) => {
		setContactNumber(number)
		setView('otp')
	}
	const verified = () => {
		onVerified()
		reset()
	}

	const title = view === 'register' ? 'Register to continue' : view === 'otp' ? 'Verify OTP' : loginTitle

	return (
		<AppModal open={open} onClose={close} title={title} maxWidth="xs" fullWidth>
			{view === 'login' && <LoginForm mode="modal" onSubmit={next} onSwitchToRegister={() => setView('register')} />}
			{view === 'register' && <RegisterForm mode="modal" onSubmit={next} onSwitchToLogin={() => setView('login')} />}
			{view === 'otp' && <OtpForm mode="modal" contactNumber={contactNumber} onVerify={verified} />}
		</AppModal>
	)
}
