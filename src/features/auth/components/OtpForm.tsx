// features/auth/components/OtpForm.tsx
import { Box, Button, Typography, CircularProgress } from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { verifyOtp, sendOtp } from '../authService'
import { setAuth, } from '../../../hooks/useAuth'
import { getLookupData } from '../authService'

interface OtpFormProps {
	contactNumber: string
	onVerify: () => void
	mode?: 'page' | 'modal'
	// Optional: if provided, this is called instead of the default auth verifyOtp.
	// Receives the 6-digit OTP string. Return true = success, false = failure.
	onCustomVerify?: (otp: string) => Promise<boolean>
}

export default function OtpForm({ contactNumber, onVerify, mode = 'page', onCustomVerify }: OtpFormProps) {
	const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
	const [error, setError] = useState('')
	const [apiError, setApiError] = useState('')
	const [loading, setLoading] = useState(false)
	const [timer, setTimer] = useState(29)
	const inputRefs = useRef<(HTMLInputElement | null)[]>([])

	// -- Countdown -------------------------------------------------------------
	useEffect(() => {
		if (timer <= 0) return
		const interval = setInterval(() => setTimer((t) => t - 1), 1000)
		return () => clearInterval(interval)
	}, [timer])

	// -- OTP input handlers ----------------------------------------------------
	const handleOtpChange = (index: number, value: string) => {
		if (!/^\d?$/.test(value)) return
		const updated = [...otp]
		updated[index] = value
		setOtp(updated)
		if (error) setError('')
		if (apiError) setApiError('')
		if (value && index < 5) inputRefs.current[index + 1]?.focus()
	}

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus()
		}
		if (e.key === 'Enter') handleVerify()
	}

	const handlePaste = (e: React.ClipboardEvent) => {
		const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
		if (pasted.length === 6) {
			setOtp(pasted.split(''))
			inputRefs.current[5]?.focus()
		}
		e.preventDefault()
	}

	// -- Validation -------------------------------------------------------------
	const validate = (): boolean => {
		const joined = otp.join('')
		if (joined.length < 6) {
			setError('Please enter the 6-digit OTP')
			return false
		}
		setError('')
		return true
	}

	// -- Verify -----------------------------------------------------------------
	const handleVerify = async () => {
		if (!validate()) return

		setApiError('')
		setLoading(true)

		try {
			// If a custom verify function is provided (e.g. consultation OTP), use it
			if (onCustomVerify) {
				const success = await onCustomVerify(otp.join(''))
				if (success) {
					onVerify()
				} else {
					setApiError('Invalid OTP. Please try again.')
				}
				return
			}

			// Default: auth login OTP flow
			const res = await verifyOtp(contactNumber, otp.join(''))

			if (res.success) {
				const { user, access_token, refresh_token } = res.data

				localStorage.setItem('access_token', access_token)

				const lookupData = await getLookupData()

				setAuth(
					user.role,
					{
						id: user.id,
						name: user.name,
						email: user.email,
						avatar: user.avatar,
						showQr: user.role === 'patient',
						profilePath: '/profile',
					},
					access_token,
					refresh_token,
					lookupData.data
				)

				onVerify()
			} else {
				setApiError(res.message ?? 'Invalid OTP. Please try again.')
			}
		} catch {
			setApiError('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	// -- Resend -----------------------------------------------------------------
	const handleResend = async () => {
		if (timer > 0) return
		try {
			await sendOtp(contactNumber)
			setTimer(180)
			setOtp(Array(6).fill(''))
			setError('')
			setApiError('')
			inputRefs.current[0]?.focus()
		} catch {
			setApiError('Failed to resend OTP. Please try again.')
		}
	}

	// -- OTP Boxes UI (shared between modal and page) ---------------------------
	const otpBoxes = (
		<Box sx={{ display: 'flex', gap: '10px', marginBottom: '8px' }} onPaste={handlePaste}>
			{otp.map((digit, i) => (
				<input
					key={i}
					ref={(el) => { inputRefs.current[i] = el }}
					maxLength={1}
					value={digit}
					onChange={(e) => handleOtpChange(i, e.target.value)}
					onKeyDown={(e) => handleKeyDown(i, e)}
					autoFocus={i === 0}
					style={{
						width: '45px',
						height: '45px',
						textAlign: 'center',
						fontSize: '18px',
						fontWeight: '500',
						border: error ? '1.5px solid #d32f2f' : '1.5px solid #ccc',
						borderRadius: '8px',
						outline: 'none',
						transition: 'border-color 0.2s',
						color: '#000',
					}}
					onFocus={(e) => (e.target.style.borderColor = error ? '#d32f2f' : '#0d9488')}
					onBlur={(e) => (e.target.style.borderColor = error ? '#d32f2f' : '#ccc')}
				/>
			))}
		</Box>
	)

	const resendSection = (
		<>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', marginTop: '8px' }}>
				<Typography sx={{ fontSize: '13px', color: '#666' }}>
					Didn&apos;t receive the OTP?{' '}
					<span
						onClick={handleResend}
						style={{
							color: timer > 0 ? '#999' : '#000',
							fontWeight: '600',
							cursor: timer > 0 ? 'not-allowed' : 'pointer',
						}}
					>
						Resend
					</span>
				</Typography>
				{timer > 0 && (
					<Typography sx={{ fontSize: '13px', color: '#0d9488', fontWeight: '500' }}>
						00:{timer < 10 ? `0${timer}` : timer}
					</Typography>
				)}
			</Box>
			<Typography sx={{ fontSize: '13px', color: '#0d9488', cursor: 'pointer', marginBottom: '24px' }}>
				Get OTP on call
			</Typography>
		</>
	)

	// -- Modal mode ------------------------------------------------------------
	if (mode === 'modal') {
		return (
			<Box sx={{ width: '100%' }}>
				<Typography variant="h5" sx={{ mb: 1 }}>
					OTP Verification
				</Typography>
				<Typography sx={{ fontSize: '14px', color: '#666', mb: 3 }}>
					Enter the OTP sent to verify the consultation
				</Typography>
				{otpBoxes}
				{error && <Typography sx={{ color: 'error.main', fontSize: '12px', mb: 1 }}>{error}</Typography>}
				{apiError && <Typography sx={{ color: 'error.main', fontSize: '12px', mb: 1 }}>{apiError}</Typography>}
				{resendSection}
				<Button
					onClick={handleVerify}
					variant="contained"
					fullWidth
					disabled={loading}
					sx={{ backgroundColor: '#0d9488', '&:hover': { backgroundColor: '#0f766e' }, padding: '12px' }}
				>
					{loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Verify'}
				</Button>
			</Box>
		)
	}

	// -- Page mode -------------------------------------------------------------
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
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', alignSelf: 'center', marginLeft: '30px' }}>
					<img src="/src/assets/logo.png" alt="Whisper AI" style={{ width: '80px' }} />
					<Box>
						<Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '30px' }}>Whisper ai.</Typography>
						<Typography sx={{ color: 'white', fontSize: '12px' }}>Smart Care. Simple Access</Typography>
					</Box>
				</Box>
				<img
					src="/src/assets/Banner/banner.png"
					alt="Doctor"
					style={{ width: '70%', height: '60%', objectFit: 'contain', marginLeft: '40px', marginBottom: '30px' }}
				/>
				<Typography sx={{ color: 'white', fontSize: '12px' }}>
					&copy; 2025 Whisper ai. All rights reserved.
				</Typography>
			</Box>

			{/* Right Side */}
			<Box sx={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
				<Box sx={{ width: '380px' }}>
					<Typography variant="h4" sx={{ fontWeight: '600', marginBottom: '8px', fontSize: '32px' }}>
						OTP Verification
					</Typography>
					<Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
						Enter the OTP received on{' '}
						<span style={{ fontWeight: 'bold', color: '#000' }}>+91 {contactNumber}</span>
					</Typography>
					{otpBoxes}
					{error && <Typography sx={{ color: 'error.main', fontSize: '12px', mb: 1 }}>{error}</Typography>}
					{apiError && <Typography sx={{ color: 'error.main', fontSize: '12px', mb: 1 }}>{apiError}</Typography>}
					{resendSection}
					<Button
						onClick={handleVerify}
						variant="contained"
						fullWidth
						disabled={loading}
						sx={{ backgroundColor: '#0d9488', '&:hover': { backgroundColor: '#0f766e' }, padding: '12px' }}
					>
						{loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Verify'}
					</Button>
				</Box>
			</Box>
		</Box>
	)
}
