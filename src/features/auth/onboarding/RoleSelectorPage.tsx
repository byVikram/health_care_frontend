import { Box, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import pharmacyImg from '../../../assets/onboarding/pharmacy.png'
import laboratoryImg from '../../../assets/onboarding/laboartory.png'
import radiologyImg from '../../../assets/onboarding/radiology.png'
import patientImg from '../../../assets/onboarding/patient.png'
import { UserRole } from '../../../data/onboardingData'

const roles: { role: UserRole; label: string; image: string; bg: string }[] = [
	{ role: 'PHARMACIST', label: 'Pharmacy',   image: pharmacyImg,   bg: '#fff8f0' },
	{ role: 'LABORATORY', label: 'Laboratory', image: laboratoryImg, bg: '#fdf0f8' },
	{ role: 'RADIOLOGY',  label: 'Radiology',  image: radiologyImg,  bg: '#f0f4ff' },
	{ role: 'PATIENT',    label: 'Patient',    image: patientImg,    bg: '#f0fdf6' },
]

interface Props {
	onSelectRole: (role: UserRole) => void
}

export default function RoleSelectorPage({ onSelectRole }: Props) {
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
			{/* Wave blobs — same as OnBoardingPage */}
			<Box sx={{
				position: 'absolute', top: -100, right: -100,
				width: 340, height: 340, borderRadius: '50%',
				bgcolor: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
			}} />
			<Box sx={{
				position: 'absolute', top: 60, right: -60,
				width: 200, height: 200, borderRadius: '50%',
				bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
			}} />
			<Box sx={{
				position: 'absolute', bottom: -80, left: -80,
				width: 260, height: 260, borderRadius: '50%',
				bgcolor: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
			}} />
			<Box sx={{
				position: 'absolute', bottom: 60, left: -40,
				width: 150, height: 150, borderRadius: '50%',
				bgcolor: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
			}} />

			{/* Invisible card container — same style as OnBoardingPage */}
			<Box
				sx={{
					width: '100%',
					maxWidth: 480,
					minHeight: 580,
					bgcolor: 'transparent',
					borderRadius: 0,
					border: 'none',
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
				{/* Role cards */}
				{roles.map(({ role, label, image, bg }) => (
					<Box
						key={role}
						onClick={() => onSelectRole(role)}
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
						{/* Icon */}
						<Box
							sx={{
								width: 56, height: 56, borderRadius: '12px',
								bgcolor: 'rgba(0,0,0,0.05)',
								display: 'flex', alignItems: 'center', justifyContent: 'center',
								flexShrink: 0, overflow: 'hidden',
							}}
						>
							<Box component="img" src={image} alt={label}
								sx={{ width: 44, height: 44, objectFit: 'contain' }} />
						</Box>

						{/* Text */}
						<Box sx={{ flex: 1 }}>
							<Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', lineHeight: 1.3 }}>
								{label}
							</Typography>
							<Typography sx={{ fontSize: '12px', color: '#888', mt: 0.2 }}>
								login
							</Typography>
						</Box>

						<ChevronRightIcon sx={{ color: '#aaa', fontSize: 22 }} />
					</Box>
				))}

				{/* Footer */}
				<Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', mt: 5 }}>
					© 2025 Whisper ai. All rights reserved.
				</Typography>
			</Box>
		</Box>
	)
}
