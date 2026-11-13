// features/auth/components/RegisterForm.tsx
import AppInput from '../../../components/common/Input/AppInput'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { createUser } from '../authService'
import { providerKindLabel } from '../roleDisplay'
import axios from 'axios'

interface RegisterFormProps {
	onSubmit: (mobile: string, name: string, email: string) => void
	mode?: 'page' | 'modal'
	onSwitchToLogin?: () => void
	roleId?: string   // UUID from api/auth/get-roles
	specialty?: string // the kind of healthcare provider (Nurse, ...): only for that role

	initialName?: string
	initialEmail?: string
	initialMobile?: string
}

export default function RegisterForm({ onSubmit, mode = 'page', onSwitchToLogin, roleId, specialty, initialName = '', initialEmail = '', initialMobile = '' }: RegisterFormProps) {
	// Pre-select the role if roleId was passed in from the onboarding flow
	// const registerAs = useState(roleId ?? '')
	const navigate = useNavigate()

	const handleSwitchToLogin = () => {
		if (onSwitchToLogin) {
			onSwitchToLogin()
			return
		}
		navigate('/login')
	}

	const [loading, setLoading] = useState(false)
	const [formError, setFormError] = useState('')
	const [mobileError, setMobileError] = useState('')
	const [nameError, setNameError] = useState('')
	const [emailError, setEmailError] = useState('')
	const [name, setName] = useState(initialName)
	const [email, setEmail] = useState(initialEmail)
	const [mobile, setMobile] = useState(initialMobile)

	const handleRegister = async () => {
		setFormError('')
		setMobileError('')
		setNameError('')
		setEmailError('')

		if (!name.trim()) {
			setNameError('Name is required')
			return
		}
		if (!email.trim()) {
			setEmailError('Email is required')
			return
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			setEmailError('Enter a valid email address')
			return
		}
		if (!mobile.trim()) {
			setMobileError('Mobile number is required')
			return
		}
		if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
			setMobileError('Enter a valid 10-digit mobile number')
			return
		}

		// roleId comes from the onboarding flow (passed as prop, never changes)
		const payload = { role_id: roleId ?? '', name, email, contact_number: mobile, ...(specialty ? { specialty_id: specialty } : {}) }

		try {
			setLoading(true)
			const res = await createUser(payload)
			if (res.success) {
				onSubmit(mobile, name, email)
			} else {
				setFormError(res.message || 'Failed to create user')
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const serverMessage = err.response?.data
				if (serverMessage && typeof serverMessage === 'object' && 'message' in serverMessage) {
					setFormError(String(serverMessage.message))
				} else {
					setFormError('Failed to create user')
				}
			} else {
				setFormError('Failed to create user')
			}
		} finally {
			setLoading(false)
		}
	}

	const formFields = (
		<>
			{mode === 'page' && (
				<Typography variant="h4" sx={{ fontWeight: '600', marginBottom: '32px', fontSize: '32px' }}>
					Register
				</Typography>
			)}

			{mode === 'page' && providerKindLabel(specialty) && (
				<Typography sx={{ color: '#0d9488', fontWeight: 600, marginTop: '-20px', marginBottom: '8px' }}>
					Registering as {providerKindLabel(specialty)}
				</Typography>
			)}

			<AppInput
				sx={{ mt: 2 }}
				placeholder="Enter your name"
				fullWidth
				value={name}
				onChange={(e) => {
					setName(e.target.value)
					if (nameError) setNameError('')
					if (formError) setFormError('')
				}}
				error={!!nameError}
				helperText={nameError}
			/>

			<AppInput
				sx={{ mt: 2 }}
				placeholder="Enter your mail address"
				fullWidth
				value={email}
				onChange={(e) => {
					setEmail(e.target.value)
					if (emailError) setEmailError('')
					if (formError) setFormError('')
				}}
				error={!!emailError}
				helperText={emailError}
			/>

			<AppInput
				sx={{ mt: 2 }}
				placeholder="Mobile Number"
				fullWidth
				value={mobile}
				onChange={(e) => {
					setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
					if (mobileError) setMobileError('')
					if (formError) setFormError('')
				}}
				error={!!mobileError}
				helperText={mobileError}
				inputProps={{ maxLength: 10 }}
			/>

			<Typography variant="caption" sx={{ color: '#666', display: 'block', margin: '20px 0' }}>
				By continuing, you agree to our{' '}
				<a href="#" style={{ color: '#0d9488' }}>
					Terms &amp; Conditions
				</a>
			</Typography>

			<Typography
				variant="caption"
				sx={{ color: '#666', display: 'block', marginBottom: '16px', fontSize: '0.95rem' }}
			>
				Already have an account?{' '}
				<span
					onClick={handleSwitchToLogin}
					style={{ color: '#0d9488', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
				>
					Login
				</span>
			</Typography>

			<Box sx={{ display: 'flex', gap: '12px' }}>
				<Button
					onClick={handleRegister}
					variant="contained"
					fullWidth
					disabled={loading}
					sx={{ backgroundColor: '#0d9488', '&:hover': { backgroundColor: '#0f766e' }, padding: '12px' }}
				>
					{loading ? 'Registering...' : 'Register'}
				</Button>
			</Box>

			{formError && (
				<Typography sx={{ mt: 1.5, color: 'error.main', fontSize: '0.9rem' }}>{formError}</Typography>
			)}
		</>
	)

	if (mode === 'modal') {
		return <Box sx={{ width: '100%' }}>{formFields}</Box>
	}

	// DESKTOP layout — 50/50 side-by-side
	return (
		<Grid container sx={{ height: { xs: '50vh', md: '100vh' } }}>
			{/* Left Side — teal */}
			<Grid size={{ xs: 12, md: 6 }}>
				<Box
					sx={{
						width: '100%',
						height: '100%',
						background: '#528C91',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '40px',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', alignSelf: 'center', marginLeft: '30px' }}>
						<img src="/src/assets/Banner/logo.png" alt="Whisper AI" style={{ width: '80px' }} />
						<Box>
							<Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '30px' }}>
								Whisper ai.
							</Typography>
							<Typography sx={{ color: 'white', fontSize: '12px' }}>Smart Care. Simple Access</Typography>
						</Box>
					</Box>

					<img
						src="/src/assets/Banner/banner.png"
						alt="Doctor"
						style={{ width: '70%', height: '60%', objectFit: 'contain', marginLeft: '40px', marginBottom: '30px' }}
					/>

					<Typography sx={{ color: 'white', fontSize: '12px' }}>
						&copy; {new Date().getFullYear()} Whisper ai. All rights reserved.
					</Typography>
				</Box>
			</Grid>

			{/* Right Side — white form */}
			<Grid size={{ xs: 12, md: 6 }}>
				<Box
					sx={{
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#fff',
					}}
				>
					<Box sx={{ width: '380px' }}>
						{formFields}
					</Box>
				</Box>
			</Grid>
		</Grid>
	)
}


