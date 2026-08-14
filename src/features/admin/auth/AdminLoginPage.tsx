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
				toast.success(`OTP sent to ${cleaned}`)
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
				bgcolor: '#f8fafc',
				backgroundImage:
					'radial-gradient(at 20% 20%, rgba(13, 148, 136, 0.06) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(15, 23, 42, 0.04) 0px, transparent 50%)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				p: 2.5,
			}}
		>
			<Container maxWidth={false} sx={{ maxWidth: step === 'otp' ? 500 : 440 }}>
				<Card
					elevation={0}
					sx={{
						borderRadius: '16px',
						p: { xs: 3.5, sm: 4.5 },
						bgcolor: '#ffffff',
						color: '#0f172a',
						border: '1px solid #e2e8f0',
						boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
					}}
				>
					<Stack alignItems="center" spacing={2} sx={{ mb: 3.5 }}>
						<Avatar
							sx={{
								width: 60,
								height: 60,
								bgcolor: 'rgba(13, 148, 136, 0.08)',
								border: '2px solid #0d9488',
								color: '#0d9488',
							}}
						>
							<AdminPanelSettingsIcon sx={{ fontSize: 34 }} />
						</Avatar>
						<Box textAlign="center">
							<Typography variant="h5" fontWeight={700} sx={{ color: '#0f172a', letterSpacing: -0.4 }}>
								Admin Portal Login
							</Typography>
							<Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.875rem' }}>
								Healthcare Management & Oversight System
							</Typography>
						</Box>
					</Stack>

					{errorMessage && (
						<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
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
											bgcolor: '#ffffff',
											color: '#0f172a',
											borderRadius: '10px',
											'& fieldset': { borderColor: '#cbd5e1' },
											'&:hover fieldset': { borderColor: '#0d9488' },
											'&.Mui-focused fieldset': { borderColor: '#0d9488' },
										},
										'& .MuiInputLabel-root': { color: '#475569', fontWeight: 500 },
										'& input:-webkit-autofill': {
											WebkitBoxShadow: '0 0 0 100px #ffffff inset',
											WebkitTextFillColor: '#0f172a',
											caretColor: '#0f172a',
										},
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
										color: '#ffffff',
										fontWeight: 700,
										fontSize: 15,
										borderRadius: '10px',
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
									sx={{ color: '#0d9488', p: 0.5, '&:hover': { bgcolor: 'rgba(13, 148, 136, 0.08)' } }}
								>
									<ArrowBackIcon />
								</IconButton>
							</Box>
							<Box
								sx={{
									bgcolor: 'transparent',
									borderRadius: 2,
									overflowX: 'hidden',
								}}
							>
								<OtpForm mode="modal" contactNumber={contactNumber} onVerify={handleVerified} variant="light" />
							</Box>
						</Box>
					)}
				</Card>
			</Container>
		</Box>
	)
}
