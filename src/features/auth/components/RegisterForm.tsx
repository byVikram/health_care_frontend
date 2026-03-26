// features/auth/components/LoginForm.tsx
import AppInput from '../../../components/common/Input/AppInput'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
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

export default function RegisterForm({ onSubmit }: { onSubmit: (mobile: string) => void }) {
	const [registerAs, setRegisterAs] = useState('')
	const navigate = useNavigate()
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
				// setRoles(res.data)
				const formattedRoles = res.data.map((role: RoleId) => ({
					value: role.id, // or role.id if you prefer
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

		// Validation
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

		const payload = {
			role_id: registerAs,
			name,
			email,
			contact_number: mobile,
		}

		console.log('API Payload:', payload)

		try {
			setLoading(true)

			const res = await createUser(payload)

			console.log('API Response:', res)

			if (res.success) {
				onSubmit(mobile) // proceed to next step (OTP maybe)
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
				{/* Logo */}
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

				{/* Doctor Image */}
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

				{/* Copyright */}
				<Typography sx={{ color: 'white', fontSize: '12px' }}>
					© 2025 Whisper ai. All rights reserved.
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
					{/* Title */}
					<Typography variant="h4" sx={{ fontWeight: '600', marginBottom: '32px', fontSize: '32px' }}>
						Register
					</Typography>

					{/* Register For Dropdown */}
					{/* <Typography sx={{ fontSize: '14px', marginBottom: '8px', fontWeight: '400' }}>
						Register for
					</Typography> */}
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
						// size="small"
					/>

					{/* Name Input */}
					{/* <Typography sx={{ mt: 2 }}>Enter your name</Typography> */}
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

					{/* Mobile Input */}
					{/* <Typography sx={{ fontSize: '14px', marginTop: '16px', marginBottom: '8px' }}>
						Enter your mobile number
					</Typography> */}
					{/* <Box sx={{ display: 'flex', gap: '8px', mt: 2 }}> */}
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
					{/* </Box> */}

					{/* Terms */}
					<Typography variant="caption" sx={{ color: '#666', display: 'block', margin: '20px 0' }}>
						By continuing, you agree to our{' '}
						<a href="#" style={{ color: '#0d9488' }}>
							Terms & Conditions
						</a>
					</Typography>

					{/* Login Link */}
					<Typography
						variant="caption"
						sx={{ color: '#666', display: 'block', marginBottom: '16px', fontSize: '0.95rem' }}
					>
						Already have an account?{' '}
						<span
							onClick={() => navigate('/login')}
							style={{
								color: '#0d9488',
								cursor: 'pointer',
								fontWeight: '600',
								textDecoration: 'underline',
							}}
						>
							Login
						</span>
					</Typography>

					{/* Buttons */}
					<Box sx={{ display: 'flex', gap: '12px' }}>
						<Button
							onClick={handleRegister}
							variant="contained"
							fullWidth
							sx={{
								backgroundColor: '#0d9488',
								'&:hover': { backgroundColor: '#0f766e' },
								padding: '12px',
							}}
						>
							Register
						</Button>
					</Box>
					{formError && (
						<Typography sx={{ mt: 1.5, color: 'error.main', fontSize: '0.9rem' }}>
							{formError}
						</Typography>
					)}
				</Box>
			</Box>
		</Box>
	)
}
