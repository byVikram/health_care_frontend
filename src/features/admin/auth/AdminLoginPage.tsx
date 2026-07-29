// src/features/admin/auth/AdminLoginPage.tsx
import { useState } from 'react'
import { Box, Container, Typography, Card, Stack, Avatar, Alert, IconButton } from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SecurityIcon from '@mui/icons-material/Security'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'
import OtpForm from '../../auth/components/OtpForm'
import { useAuth, clearAuth } from '../../../hooks/useAuth'
import { ADMIN_ROLES } from '../../../constants/constants'
import { ROUTES } from '../../../constants/routes'
import { sendOtp } from '../../auth/authService'

type AdminRole = (typeof ADMIN_ROLES)[number]

const isAdminRole = (value: string | null): value is AdminRole =>
	value !== null && ADMIN_ROLES.includes(value as AdminRole)

export default function AdminLoginPage() {
	const navigate = useNavigate()
	const { accessToken, role } = useAuth()
	const [step, setStep] = useState<'login' | 'otp'>('login')
	const [contactNumber, setContactNumber] = useState('')
	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	// If already logged in as admin, redirect to dashboard
	if (accessToken && isAdminRole(role)) {
		navigate(ROUTES.ADMIN.DASHBOARD, { replace: true })
	}

	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault()
		const cleaned = contactNumber.trim()
		if (!cleaned || cleaned.length < 10) {
			setErrorMessage('Please enter a valid 10-digit mobile number')
			return
		}

		setLoading(true)
		setErrorMessage(null)
		try {
			const res = await sendOtp(cleaned)
			if (res.success) {
				toast.info(`OTP sent to ${cleaned}`)
				setStep('otp')
			} else {
				setErrorMessage(res.message || 'Failed to send OTP')
			}
		} catch (err: unknown) {
			setErrorMessage(err instanceof Error ? err.message : 'Failed to send OTP')
		} finally {
			setLoading(false)
		}
	}

	const handleVerified = () => {
		const storedRole = localStorage.getItem('role')
		if (isAdminRole(storedRole)) {
			toast.success('Admin authentication successful.')
			navigate(ROUTES.ADMIN.DASHBOARD, { replace: true })
		} else {
			clearAuth()
			toast.error('Access Denied: This portal requires administrator privileges.')
			setErrorMessage('Unauthorized: The account verified is not an administrator.')
			setStep('login')
		}
	}

	return (
		<Box
			sx={{
				minHeight: '100vh',
				bgcolor: '#0f172a',
				backgroundImage:
					'radial-gradient(at 40% 20%, rgba(30, 58, 138, 0.4) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(13, 148, 136, 0.3) 0px, transparent 50%)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				p: 2,
			}}
		>
			<Container maxWidth={false} sx={{ maxWidth: step === 'otp' ? 520 : 444 }}>
				<Card
					elevation={step === 'otp' ? 0 : 12}
					sx={{
						borderRadius: 4,
						p: 4,
						bgcolor: step === 'otp' ? '#0f172a' : '#1e293b',
						color: '#f8fafc',
						border: step === 'otp' ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)',
						boxShadow: step === 'otp' ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
					}}
				>
					<Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
						<Avatar
							sx={{
								width: 64,
								height: 64,
								bgcolor: 'rgba(13, 148, 136, 0.2)',
								border: '2px solid #0d9488',
								color: '#2dd4bf',
							}}
						>
							<AdminPanelSettingsIcon sx={{ fontSize: 36 }} />
						</Avatar>
						<Box textAlign="center">
							<Typography variant="h5" fontWeight={700} sx={{ color: '#f8fafc', letterSpacing: -0.5 }}>
								Admin Portal Login
							</Typography>
							<Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
								Healthcare Management & Oversight System
							</Typography>
						</Box>
					</Stack>

					{errorMessage && (
						<Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
							{errorMessage}
						</Alert>
					)}

					{step === 'login' ? (
						<form onSubmit={handleSendOtp}>
							<Stack spacing={2.5}>
								<AppInput
									label="Admin Mobile Number"
									placeholder="Enter 10-digit mobile number"
									value={contactNumber}
									onChange={(e) => setContactNumber(e.target.value)}
									fullWidth
									size="medium"
									sx={{
										'& .MuiOutlinedInput-root': {
											bgcolor: '#0f172a',
											color: '#ffffff',
											'& fieldset': { borderColor: '#334155' },
											'&:hover fieldset': { borderColor: '#0d9488' },
											'&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
										},
										'& .MuiInputLabel-root': { color: '#94a3b8' },
									}}
								/>

								<AppButton
									label={loading ? 'Sending OTP...' : 'Continue to Verification'}
									type="submit"
									disabled={loading}
									fullWidth
									startIcon={<SecurityIcon />}
									sx={{
										py: 1.4,
										bgcolor: '#0d9488',
										fontWeight: 700,
										fontSize: 15,
										borderRadius: 2,
										'&:hover': { bgcolor: '#0f766e' },
									}}
								/>
							</Stack>
						</form>
					) : (
						<Box>
							<Box sx={{ mb: 2 }}>
								<IconButton
									onClick={() => setStep('login')}
									aria-label="Back to mobile input"
									sx={{ color: '#2dd4bf', p: 0.5, '&:hover': { bgcolor: 'rgba(45, 212, 191, 0.1)' } }}
								>
									<ArrowBackIcon />
								</IconButton>
							</Box>
							<Box
								sx={{
									bgcolor: 'transparent',
									borderRadius: 3,
									overflowX: 'hidden',
								}}
							>
								<OtpForm mode="modal" contactNumber={contactNumber} onVerify={handleVerified} variant="dark" />
							</Box>
						</Box>
					)}
				</Card>
			</Container>
		</Box>
	)
}
