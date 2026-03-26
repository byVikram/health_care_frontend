// features/auth/WelcomePage.tsx
import { Box, Typography } from '@mui/material'
import AppButton from '../../components/common/Button/AppButton'

export default function WelcomePage({ onContinue }: { onContinue: () => void }) {
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
				<img src="/src/assets/logo.png" alt="Whisper AI" style={{ width: '99', height: '90' }} />
				<Box>
					<Typography sx={{ color: '#0d9488', fontWeight: '500', fontSize: '46px' }}>Whisper ai.</Typography>
					<Typography sx={{ color: '#0d9488', fontSize: '18px' }}>Smart Care. Simple Access</Typography>
				</Box>
			</Box>

			{/* Main Content */}
			<Box
				sx={{
					display: 'flex',
					flex: 1,
					gap: '40px',
					alignItems: 'center',
				}}
			>
				{/* Left Side */}
				<Box sx={{ flex: 1.2 }}>
					{' '}
					{/* change from flex: 1 to flex: 1.2 to enlarge left */}
					{/* Title */}
					<Typography variant="h4" sx={{ fontWeight: '600', marginBottom: '12px', fontSize: '40px' }}>
						Welcome Doctor! 👋
					</Typography>
					{/* Subtitle */}
					<Typography sx={{ fontSize: '17px', color: '#555', marginBottom: '36px' }}>
						Let's help you get started on Whisper ai by making your Doctor Profile.
					</Typography>
					{/* Feature List */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '48px' }}>
						{features.map((feature, i) => (
							<Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
								<Box
									sx={{
										width: '55px',
										height: '55px',
										borderRadius: '50%',
										backgroundColor: '#e6f7f6',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										flexShrink: 0,
									}}
								>
									<img
										src={feature.icon}
										alt={feature.title}
										style={{ width: '30px', height: '30px' }}
									/>
								</Box>
								<Typography sx={{ fontSize: '14px', color: '#333', lineHeight: 1.6 }}>
									<span style={{ fontWeight: 'bold' }}>{feature.title}</span> - {feature.description}
								</Typography>
							</Box>
						))}
					</Box>
					{/* Button */}
					<AppButton onClick={onContinue} label="Create free profile" />
				</Box>

				{/* Right Side - Illustration */}

				<Box
					sx={{
						flex: 0.8, // change from flex: 1 to flex: 0.8
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<img
						src="/src/assets/doctors.png"
						alt="Doctors"
						style={{
							width: '100%',
							maxWidth: '460px',
							objectFit: 'contain',
						}}
					/>
				</Box>
			</Box>

			{/* Copyright */}
			<Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#aaa', paddingTop: '24px' }}>
				© 2025 Whisper ai. All rights reserved.
			</Typography>
		</Box>
	)
}
