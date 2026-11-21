// features/auth/onboarding/RoleSelectorPage.tsx
import { useEffect, useState } from 'react'
import { Box, Chip, Typography, CircularProgress } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useNavigate } from 'react-router-dom'
import radiologyImg from '../../../assets/onboarding/radiology.png'
import patientImg from '../../../assets/onboarding/patient.png'
import doctorImg from '../../../assets/onboarding/doctor-team.png'
import homeCareImg from '../../../assets/ancillary/home-care.png'
import { getRoles } from '../authService'
import { PROVIDER_KINDS, isProviderRole } from '../roleDisplay'

// ── Local image / bg mapping (keyed on lowercase label) ───────────────────────
const ROLE_VISUALS: Record<string, { image: string; bg: string }> = {
	patient: { image: patientImg, bg: '#f0fdf6' },
	doctor: { image: doctorImg, bg: '#f0f8ff' },
	
	radiology: { image: radiologyImg, bg: '#f0f4ff' },
	ancillary: { image: homeCareImg, bg: '#f0fdfa' },
}

const fallbackVisual = { image: patientImg, bg: '#f5f5f5' }

interface Role {
	id: string
	label: string
}

interface Props {
	/** `specialty`: the kind of provider, only for the healthcare-provider role. */
	onSelectRole: (roleId: string, label: string, specialty?: string) => void
}

export default function RoleSelectorPage({ onSelectRole }: Props) {
	const [roles, setRoles] = useState<Role[]>([])
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()
	const [error, setError] = useState('')
	// The healthcare-provider card opens its kinds (Nurse, ...) instead of going on: a provider must say what they are.
	const [openProviderId, setOpenProviderId] = useState<string | null>(null)

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
					const provider = isProviderRole(label)
					const { image, bg } = ROLE_VISUALS[label.toLowerCase()] ?? fallbackVisual
					const open = provider && openProviderId === id
					const title = provider ? 'Healthcare provider' : label
					const subtitle = provider ? 'Nurse, physio, care attendant or rehab · home visits' : `Register as ${label}`

					return (
						<Box key={id} sx={{ width: '100%' }}>
							<Box
								onClick={() => (provider ? setOpenProviderId(open ? null : id) : onSelectRole(id, label))}
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
										alt={title}
										sx={{ width: 44, height: 44, objectFit: 'contain' }}
									/>
								</Box>

								<Box sx={{ flex: 1 }}>
									<Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', lineHeight: 1.3 }}>
										{title}
									</Typography>
									<Typography sx={{ fontSize: '12px', color: '#888', mt: 0.2 }}>{subtitle}</Typography>
								</Box>

								{provider ? (
									<ExpandMoreIcon
										sx={{ color: '#aaa', fontSize: 22, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
									/>
								) : (
									<ChevronRightIcon sx={{ color: '#aaa', fontSize: 22 }} />
								)}
							</Box>

							{open && (
								<Box sx={{ mt: 1.5, px: 0.5 }}>
									<Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', mb: 1 }}>What do you do?</Typography>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
										{PROVIDER_KINDS.map((kind) => (
											<Chip
												key={kind.key}
												label={kind.label}
												clickable
												onClick={() => onSelectRole(id, label, kind.key)}
												sx={{ bgcolor: '#fff', color: '#1a4f4f', fontWeight: 600, '&:hover': { bgcolor: '#e6f7f6' } }}
											/>
										))}
									</Box>
								</Box>
							)}
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
					© {new Date().getFullYear()} Whisper ai. All rights reserved.
				</Typography>
			</Box>
		</Box>
	)
}
