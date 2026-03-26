// features/auth/components/LoginForm.tsx
import { useState } from 'react'
import { Box, Button, Typography, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AppInput from '../../../components/common/Input/AppInput'
import { sendOtp } from '../authService'

interface LoginFormProps {
	onSubmit: (contactNumber: string) => void
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
	const navigate = useNavigate()

	const [contactNumber, setContactNumber] = useState('')
	const [error, setError] = useState('')
	const [apiError, setApiError] = useState('')
	const [loading, setLoading] = useState(false)

	// -- Validation --------------------------------------------------------------
	const validate = (): boolean => {
		if (!contactNumber.trim()) {
			setError('Mobile number is required')
			return false
		}
		if (!/^[6-9]\d{9}$/.test(contactNumber.trim())) {
			setError('Enter a valid 10-digit mobile number')
			return false
		}
		setError('')
		return true
	}

	const handleBlur = () => validate()

	// -- Submit -------------------------------------------------------------------
	const handleSubmit = async () => {
		if (!validate()) return
		setApiError('')
		setLoading(true)
		try {
			const res = await sendOtp(contactNumber.trim())
			window.alert(`Otp for the testing purpose is :${res.data.otp}`)
			if (res.success) {
				onSubmit(contactNumber.trim())
			} else {
				setApiError(res.message ?? 'Failed to send OTP. Please try again.')
			}
		} catch {
			setApiError('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Box sx={{ display: 'flex', width: '100vw', height: '100vh' }}>
			{/* Left Side */}
			<Box
				sx={{
					width: '50%',
					background: '#528C91',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '40px',
				}}
			>
				<Box
					sx={{ display: 'flex', alignItems: 'center', gap: '16px', alignSelf: 'center', marginLeft: '30px' }}
				>
					<img src="/src/assets/logo.png" alt="Whisper AI" style={{ width: '80px' }} />
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
					style={{
						width: '70%',
						height: '60%',
						objectFit: 'contain',
						marginLeft: '40px',
						marginBottom: '30px',
					}}
				/>
				<Typography sx={{ color: 'white', fontSize: '12px' }}>
					&copy; 2025 Whisper ai. All rights reserved.
				</Typography>
			</Box>

			{/* Right Side */}
			<Box
				sx={{
					width: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#fff',
				}}
			>
				<Box sx={{ width: '380px' }}>
					<Typography variant="h4" sx={{ fontWeight: '600', marginBottom: '32px', fontSize: '32px' }}>
						Login
					</Typography>

					<Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>Enter your mobile number</Typography>

					<AppInput
						placeholder="Mobile Number"
						fullWidth
						value={contactNumber}
						onChange={(e) => {
							setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
							if (error) setError('')
							if (apiError) setApiError('')
						}}
						onBlur={handleBlur}
						error={!!error}
						helperText={error}
						inputProps={{ maxLength: 10 }}
						onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
					/>

					{/* API error */}
					{apiError && (
						<Typography sx={{ color: 'error.main', fontSize: '12px', mt: 1 }}>{apiError}</Typography>
					)}

					<Box sx={{ textAlign: 'right', marginTop: '8px' }}>
						<a href="#" style={{ fontSize: '12px', color: '#0d9488' }}>
							Forgot password?
						</a>
					</Box>

					<Typography
						variant="caption"
						sx={{ color: '#666', display: 'block', margin: '20px 0', fontSize: '0.85rem' }}
					>
						By continuing, you agree to our{' '}
						<a href="#" style={{ color: '#0d9488' }}>
							Terms & Conditions
						</a>
					</Typography>

					<Typography
						variant="caption"
						sx={{ color: '#666', display: 'block', marginBottom: '16px', fontSize: '0.95rem' }}
					>
						Don&apos;t have an account?{' '}
						<span
							onClick={() => navigate('/register')}
							style={{
								color: '#0d9488',
								cursor: 'pointer',
								fontWeight: '600',
								textDecoration: 'underline',
							}}
						>
							Register
						</span>
					</Typography>

					<Button
						onClick={handleSubmit}
						variant="contained"
						fullWidth
						disabled={loading}
						sx={{ backgroundColor: '#0d9488', '&:hover': { backgroundColor: '#0f766e' }, padding: '12px' }}
					>
						{loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Login'}
					</Button>
				</Box>
			</Box>
		</Box>
	)
}
