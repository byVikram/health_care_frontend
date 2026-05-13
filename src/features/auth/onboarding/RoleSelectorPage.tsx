// features/auth/onboarding/RoleSelectorPage.tsx
import { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useNavigate } from 'react-router-dom'
import pharmacyImg from '../../../assets/onboarding/pharmacy.png'
import laboratoryImg from '../../../assets/onboarding/laboartory.png'
import radiologyImg from '../../../assets/onboarding/radiology.png'
import patientImg from '../../../assets/onboarding/patient.png'
import doctorImg from '../../../assets/onboarding/doctor-team.png'
import { getRoles } from '../authService'

// ── Local image / bg mapping (keyed on lowercase label) ───────────────────────
const ROLE_VISUALS: Record<string, { image: string; bg: string }> = {
	patient: { image: patientImg, bg: '#f0fdf6' },
	doctor: { image: doctorImg, bg: '#f0f8ff' },
	pharmacist: { image: pharmacyImg, bg: '#fff8f0' },
	pharmacy: { image: pharmacyImg, bg: '#fff8f0' },
	laboratory: { image: laboratoryImg, bg: '#fdf0f8' },
	radiology: { image: radiologyImg, bg: '#f0f4ff' },
}

const fallbackVisual = { image: patientImg, bg: '#f5f5f5' }

interface Role {
	id: string
	label: string
}

interface Props {
	onSelectRole: (roleId: string, label: string) => void
}

export default function RoleSelectorPage({ onSelectRole }: Props) {
	const [roles, setRoles] = useState<Role[]>([])
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()
	const [error, setError] = useState('')

	useEffect(() => {
		getRoles()
			.then((res) => {
				if (res.success) {
					setRoles(Array.isArray(res.data) ? res.data : [res.data])
				} else {
					setError(res.message || 'Failed to load roles')
				}
			})
			.catch(() => setError('Failed to load roles. Please try again.'))
			.finally(() => setLoading(false))
	}, [])

	return (
		<Box
			sx={{
				width: '100vw',
				minHeight: '100vh',
				background: 'linear-gradient(160deg, #2d7d7d 0%, #1a4f4f 60%, #0f3333 100%)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				px: 2,
				py: 4,
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Decorative blobs */}
			{[
				{ top: -100, right: -100, size: 340, opacity: 0.05 },
				{ top: 60, right: -60, size: 200, opacity: 0.04 },
				{ bottom: -80, left: -80, size: 260, opacity: 0.05 },
				{ bottom: 60, left: -40, size: 150, opacity: 0.03 },
			].map((b, i) => (
				<Box
					key={i}
					sx={{
						position: 'absolute',
						...b,
						width: b.size,
						height: b.size,
						borderRadius: '50%',
						bgcolor: `rgba(255,255,255,${b.opacity})`,
						pointerEvents: 'none',
					}}
				/>
			))}

			<Box
				sx={{
					width: '100%',
					maxWidth: 480,
					minHeight: 580,
					bgcolor: 'transparent',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					px: 4,
					pt: 3,
					pb: 5,
					gap: 2,
				}}
			>
				{/* Heading */}
				<Typography
					sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', mb: 1, alignSelf: 'flex-start' }}
				>
					Who are you?
				</Typography>

				{/* Loading */}
				{loading && <CircularProgress sx={{ color: '#fff', mt: 4 }} />}

				{/* Error */}
				{!loading && error && (
					<Typography sx={{ color: '#ffcccc', fontSize: '0.95rem', textAlign: 'center' }}>
						{error}
					</Typography>
				)}

				{/* Role cards */}
				{!loading && !error && roles.map(({ id, label }) => {
					const { image, bg } = ROLE_VISUALS[label.toLowerCase()] ?? fallbackVisual

					return (
						<Box
							key={id}
							onClick={() => onSelectRole(id, label)}
							sx={{
								width: '100%',
								display: 'flex',
								alignItems: 'center',
								gap: 2,
								bgcolor: bg,
								borderRadius: '16px',
								px: 2,
								py: 1.5,
								cursor: 'pointer',
								boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
								transition: 'transform 0.15s, box-shadow 0.15s',
								'&:hover': {
									transform: 'translateY(-2px)',
									boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
								},
								'&:active': { transform: 'scale(0.98)' },
							}}
						>
							<Box
								sx={{
									width: 56,
									height: 56,
									borderRadius: '12px',
									bgcolor: 'rgba(0,0,0,0.05)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
									overflow: 'hidden',
								}}
							>
								<Box
									component="img"
									src={image}
									alt={label}
									sx={{ width: 44, height: 44, objectFit: 'contain' }}
								/>
							</Box>

							<Box sx={{ flex: 1 }}>
								<Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', lineHeight: 1.3 }}>
									{label}
								</Typography>
								<Typography sx={{ fontSize: '12px', color: '#888', mt: 0.2 }}>
									Register as {label}
								</Typography>
							</Box>

							<ChevronRightIcon sx={{ color: '#aaa', fontSize: 22 }} />
						</Box>
					)
				})}


			{/* Already have an account */}
			<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', mt: 2}}>
				Already have an account?{' '}
				<Box
					component="span"
					onClick={() => navigate('/login')}
					sx={{
						cursor: 'pointer',
						color: '#fff',
						fontWeight: 600,
						textDecoration: 'underline',
						'&:hover': { opacity: 0.8 },
					}}
				>
					Login
				</Box>
			</Typography>
				{/* Footer */}
				<Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', mt: 2 }}>
					© 2025 Whisper ai. All rights reserved.
				</Typography>
			</Box>
		</Box>
	)
}
