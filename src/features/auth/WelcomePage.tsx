// features/auth/WelcomePage.tsx
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AppButton from '../../components/common/Button/AppButton'
import logoImg from '../../assets/logo/logo.png'
import welcomeDoctorImg from '../../assets/Banner/welcome-doctor.png'
import { ROUTES } from '../../constants/routes'

const features = [
	{
		icon: 'https://cdn-icons-png.flaticon.com/128/9439/9439123.png',
		title: 'Profile',
		description: 'Makes you visible to the hundreds of patients searching on Whisper ai.com',
	},
	{
		icon: 'https://cdn-icons-png.flaticon.com/128/15756/15756013.png',
		title: 'Consult',
		description: 'Online consultations are convenient and a great way to maximise your earnings',
	},
	{
		icon: 'https://cdn-icons-png.flaticon.com/128/15869/15869487.png',
		title: 'Feedback',
		description: "You can view and reply to patients' feedback here",
	},
]

export default function WelcomePage({ onContinue }: { onContinue?: () => void }) {
	const navigate = useNavigate()

	const handleContinue = () => {
		if (onContinue) onContinue()
		else navigate(ROUTES.DOCTOR_ACCOUNT_DETAILS)
	}

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
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '38px' }}>
				<Box component="img" src={logoImg} alt="Whisper AI" sx={{ width: 56, height: 56, objectFit: 'contain' }} />
				<Box>
					<Typography sx={{ color: '#0d9488', fontWeight: '500', fontSize: '28px', lineHeight: 1.2 }}>
						Whisper ai.
					</Typography>
					<Typography sx={{ color: '#0d9488', fontSize: '13px' }}>Smart Care. Simple Access</Typography>
				</Box>
			</Box>

			{/* Main Content — equal halves */}
			<Box sx={{ display: 'flex', flex: 1, gap: '40px', alignItems: 'center' }}>
				{/* Left half */}
				<Box sx={{ flex: 1 }}>
					<Typography variant="h4" sx={{ fontWeight: '700', mb: 1.5, fontSize: '40px' }}>
						Welcome Doctor! 👋
					</Typography>
					<Typography sx={{ fontSize: '17px', color: '#555', mb: 4 }}>
						Let's help you get started on Whisper ai by making your Doctor Profile.
					</Typography>

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '28px', mb: 5 }}>
						{features.map((feature, i) => (
							<Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
								<Box
									sx={{
										width: 55, height: 55, borderRadius: '50%',
										backgroundColor: '#e6f7f6',
										display: 'flex', alignItems: 'center', justifyContent: 'center',
										flexShrink: 0,
									}}
								>
									<img src={feature.icon} alt={feature.title} style={{ width: 30, height: 30 }} />
								</Box>
								<Typography sx={{ fontSize: '15px', color: '#333', lineHeight: 1.6 }}>
									<span style={{ fontWeight: 'bold' }}>{feature.title}</span> - {feature.description}
								</Typography>
							</Box>
						))}
					</Box>

					<AppButton
						onClick={handleContinue}
						label="Create a Free Profile"
						sx={{ py: 2, px: 5, fontSize: '17px', fontWeight: 600, borderRadius: '10px' }}
					/>
				</Box>

				{/* Right half — equal size, bigger image */}
				<Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Box
						component="img"
						src={welcomeDoctorImg}
						alt="Welcome Doctor"
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
