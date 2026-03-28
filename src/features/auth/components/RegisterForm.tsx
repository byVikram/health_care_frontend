// features/auth/components/RegisterForm.tsx
import AppInput from '../../../components/common/Input/AppInput'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, useMediaQuery } from '@mui/material'
import AppSelect from '../../../components/common/Select/AppSelect'
import { createUser, getRoles } from '../authService'
import axios from 'axios'

type Role = {
	value: string
	label: string
}

type RoleId = {
	id: string
	label: string
}

interface RegisterFormProps {
	onSubmit: (mobile: string) => void
	mode?: 'page' | 'modal'
	onSwitchToLogin?: () => void
}

export default function RegisterForm({ onSubmit, mode = 'page', onSwitchToLogin }: RegisterFormProps) {
	const [registerAs, setRegisterAs] = useState('')
	const navigate = useNavigate()
	const isMobile = useMediaQuery('(max-width: 600px)') // ← true on phone, false on desktop

	const handleSwitchToLogin = () => {
		if (onSwitchToLogin) {
			onSwitchToLogin()
			return
		}
		navigate('/login')
	}
	const [loading, setLoading] = useState(false)
	const [roles, setRoles] = useState<Role[]>([])
	const [formError, setFormError] = useState('')
	const [mobileError, setMobileError] = useState('')
	const [roleError, setRoleError] = useState('')
	const [nameError, setNameError] = useState('')
	const [emailError, setEmailError] = useState('')

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [mobile, setMobile] = useState('')

	useEffect(() => {
		setLoading(true)
		const fetchSpecialities = async () => {
			try {
				const res = await getRoles()
				const rawData = Array.isArray(res.data) ? res.data : [res.data]
				const formattedRoles = rawData.map((role: RoleId) => ({
					value: role.id,
					label: role.label,
				}))
				setRoles(formattedRoles)
			} catch (err) {
				console.log(err)
			} finally {
				setLoading(false)
			}
		}
		fetchSpecialities()
	}, [])

	const handleRegister = async () => {
		setFormError('')
		setMobileError('')
		setRoleError('')
		setNameError('')
		setEmailError('')

		if (!registerAs) {
			setRoleError('Role is required')
			return
		}
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

		const payload = { role_id: registerAs, name, email, contact_number: mobile }
		console.log('API Payload:', payload)

		try {
			setLoading(true)
			const res = await createUser(payload)
			console.log('API Response:', res)
			if (res.success) {
				onSubmit(mobile)
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

	// ── Shared form fields (used in BOTH layouts) ──────────────────────────────
	const formFields = (
		<>
			{mode === 'page' && (
				<Typography variant="h4" sx={{ fontWeight: '600', marginBottom: '32px', fontSize: '32px' }}>
					Register
				</Typography>
			)}

			<AppSelect
				label="Role"
				value={registerAs}
				options={roles}
				disabled={loading}
				placeholder="Select a role"
				onChange={(e) => {
					setRegisterAs(e.target.value)
					if (roleError) setRoleError('')
					if (formError) setFormError('')
				}}
				error={!!roleError}
				helperText={roleError}
				sx={{ mt: 1 }}
			/>

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
					sx={{ backgroundColor: '#0d9488', '&:hover': { backgroundColor: '#0f766e' }, padding: '12px' }}
				>
					Register
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

	if (isMobile) {
		return (
			<div style={grid.pageWrapper}>
				<div style={grid.phoneCard}>
					{/* ROW 1 — teal hero banner */}
					<div style={grid.hero}>
						{/* brand: logo | title */}
						<div style={grid.brandRow}>
							<img src="/src/assets/Banner/logo.png" alt="Whisper AI" style={grid.logo} />
							<div>
								<Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '24px', lineHeight: 1.15 }}>
									Whisper ai.
								</Typography>
								<Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
									Smart Care. Simple Access
								</Typography>
							</div>
						</div>

						{/* banner image pushed to bottom of hero */}
						<div style={grid.bannerRow}>
							<img src="/src/assets/Banner/banner.png" alt="Doctor" style={grid.bannerImg} />
						</div>
					</div>

					{/* ROW 2 — white form panel */}
					<div style={grid.formPanel}>
						{formFields}
						<Typography sx={{ fontSize: '11px', color: '#bbb', textAlign: 'center', mt: '16px' }}>
							&copy; 2025 Whisper ai. All rights reserved.
						</Typography>
					</div>
				</div>
			</div>
		)
	}

	// ════════════════════════════════════════════════════════════════════════════
	// DESKTOP layout — original Box version, 50/50 side-by-side
	// Shown when screen width > 600px  (unchanged from original)
	// ════════════════════════════════════════════════════════════════════════════
	return (
		<Box sx={{ display: 'flex', width: '100vw', height: '100vh' }}>
			{/* Left Side — teal */}
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
					style={{
						width: '70%',
						height: '60%',
						objectFit: 'contain',
						marginLeft: '40px',
						marginBottom: '30px',
					}}
				/>

				<Typography sx={{ color: 'white', fontSize: '12px' }}>
					© 2025 Whisper ai. All rights reserved.
				</Typography>
			</Box>

			{/* Right Side — white form */}
			<Box
				sx={{
					width: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#fff',
				}}
			>
				<Box sx={{ width: '380px' }}>{formFields}</Box>
			</Box>
		</Box>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Grid styles — used ONLY by the mobile layout
// ─────────────────────────────────────────────────────────────────────────────
const grid: Record<string, React.CSSProperties> = {
	// Full-viewport wrapper — centres the card on desktop
	pageWrapper: {
		display: 'grid',
		placeItems: 'center',
		minHeight: '100vh',
		backgroundColor: '#eef7f7',
	},

	// 2 rows: hero (240px fixed) | form (fills rest)
	phoneCard: {
		display: 'grid',
		gridTemplateRows: '240px 1fr',
		width: '100%',
		maxWidth: '390px',
		minHeight: '100vh',
		backgroundColor: '#ffffff',
		overflow: 'hidden',
	},

	// hero: 2 rows — brandRow (auto) | bannerRow (1fr pushes image down)
	hero: {
		display: 'grid',
		gridTemplateRows: 'auto 1fr',
		background: 'linear-gradient(160deg, #528C91 0%, #3a7d82 100%)',
		padding: '28px 16px 0 20px',
		overflow: 'hidden',
	},

	// brandRow: 2 columns — logo (64px) | title+tagline
	brandRow: {
		display: 'grid',
		gridTemplateColumns: '64px 1fr',
		alignItems: 'center',
		gap: '12px',
	},

	logo: {
		width: '60px',
		height: '60px',
		objectFit: 'contain',
	},

	bannerRow: {
		display: 'grid',
		alignItems: 'end',
		justifyItems: 'center',
	},

	bannerImg: {
		width: '72%',
		maxHeight: '170px',
		objectFit: 'contain',
		display: 'block',
	},

	// formPanel: stacked rows for each form section
	formPanel: {
		display: 'grid',
		gridTemplateRows: 'auto auto auto auto auto',
		alignContent: 'start',
		padding: '28px 24px 20px',
		overflowY: 'auto',
	},
}
