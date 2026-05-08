// features/auth/DoctorAccountDetailsPage.tsx
import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AppButton from '../../components/common/Button/AppButton'
import AppSelect from '../../components/common/Select/AppSelect'
import logoImg from '../../assets/logo/logo.png'
import welcomeDoctorImg from '../../assets/Banner/welcome-doctor.png'
import { getSpecialities } from '../doctor/doctorService'
import { ROUTES } from '../../constants/routes'

const LOCATIONS = [
	{ value: 'kr_market',   label: 'Bengaluru, KR Market' },
	{ value: 'koramangala', label: 'Bengaluru, Koramangala' },
	{ value: 'whitefield',  label: 'Bengaluru, Whitefield' },
	{ value: 'jayanagar',   label: 'Bengaluru, Jayanagar' },
	{ value: 'indiranagar', label: 'Bengaluru, Indiranagar' },
]

interface SpecialityOption {
	value: string
	label: string
}

export default function DoctorAccountDetailsPage() {
	const navigate = useNavigate()
	const [location, setLocation] = useState('')
	const [specialization, setSpecialization] = useState('')
	const [specialities, setSpecialities] = useState<SpecialityOption[]>([])

	useEffect(() => {
		getSpecialities()
			.then((res) => {
				const formatted = res.data.map((s: { id: string; label: string }) => ({
					value: s.id,
					label: s.label,
				}))
				setSpecialities(formatted)
			})
			.catch(() => setSpecialities([]))
	}, [])

	const handleContinue = () => {
		const stored = JSON.parse(localStorage.getItem('selected_role') ?? '{}')
		localStorage.setItem('selected_role', JSON.stringify({
			...stored,
			location,
			specialization_id: specialization,
		}))
		localStorage.setItem('show_profile_prompt', 'true')
		navigate(ROUTES.PORTAL.HOME)
	}

	const isValid = location !== '' && specialization !== ''

	return (
		<Box
			sx={{
				width: '100vw',
				minHeight: '100vh',
				backgroundColor: '#fff',
				display: 'flex',
				flexDirection: 'column',
				padding: '32px 48px',
			}}
		>
			{/* Logo */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '38px' }}>
				<Box component="img" src={logoImg} alt="Whisper AI" sx={{ width: 56, height: 56, objectFit: 'contain' }} />
				<Box>
					<Typography sx={{ color: '#0d9488', fontWeight: '500', fontSize: '28px', lineHeight: 1.2 }}>
						Whisper ai.
					</Typography>
					<Typography sx={{ color: '#0d9488', fontSize: '13px' }}>Smart Care. Simple Access</Typography>
				</Box>
			</Box>

			{/* Main content — equal halves */}
			<Box sx={{ display: 'flex', flex: 1, gap: '40px', alignItems: 'center' }}>
				{/* Left half — form */}
				<Box sx={{ flex: 1 }}>
					<Typography variant="h4" sx={{ fontWeight: '700', fontSize: '40px', mb: 1 }}>
						Account Details
					</Typography>
					<Typography sx={{ fontSize: '15px', color: '#666', mb: 5 }}>
						We just need some more details before we can get you started
					</Typography>

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
						{/* Location */}
						<Box>
							<Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#444', mb: 1 }}>
								Location<Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>*</Box>
							</Typography>
							<AppSelect
								placeholder="Select your location"
								value={location}
								options={LOCATIONS}
								onChange={(e) => setLocation(e.target.value as string)}
								startIcon={<LocationOnIcon sx={{ color: '#0d9488', fontSize: 20 }} />}
								size="medium"
								sx={{
									'& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '15px' },
								}}
							/>
						</Box>

						{/* Specialization */}
						<Box>
							<Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#444', mb: 1 }}>
								Speciality<Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>*</Box>
							</Typography>
							<AppSelect
								placeholder="Select specialization"
								value={specialization}
								options={specialities}
								onChange={(e) => setSpecialization(e.target.value as string)}
								size="medium"
								sx={{
									'& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '15px' },
								}}
							/>
						</Box>

						<AppButton
							onClick={handleContinue}
							label="Continue"
							disabled={!isValid}
							sx={{ mt: 1, py: 2, fontSize: '17px', fontWeight: 600, borderRadius: '10px' }}
						/>
					</Box>
				</Box>

				{/* Right half — bigger illustration */}
				<Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Box
						component="img"
						src={welcomeDoctorImg}
						alt="Doctor illustration"
						sx={{ width: '100%', maxWidth: '560px', objectFit: 'contain' }}
					/>
				</Box>
			</Box>

			<Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#aaa', pt: 3 }}>
				© 2025 Whisper ai. All rights reserved.
			</Typography>
		</Box>
	)
}
