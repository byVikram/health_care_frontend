// features/auth/components/AccountSuccess.tsx
import { Box, Typography, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useNavigate } from 'react-router-dom'

export default function AccountSuccess({ onContinue }: { onContinue: () => void }) {
	const navigate = useNavigate()

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
				<Box sx={{ width: '380px', textAlign: 'center' }}>
					{/* Success Icon */}
					<Box
						sx={{
							width: '90px',
							height: '90px',
							borderRadius: '50%',
							backgroundColor: '#e6f7f6',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							margin: '0 auto 24px auto',
						}}
					>
						<CheckCircleIcon sx={{ fontSize: '52px', color: '#0d9488' }} />
					</Box>

					{/* Title */}
					<Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '12px' }}>
						Doctor's Account Saved Successfully!
					</Typography>

					{/* Subtitle */}
					<Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '32px' }}>
						Your account has been set up. You can now start using Whisper AI.
					</Typography>

					{/* Button */}
					<Button
						onClick={() => navigate('/welcome-doctor')}
						variant="contained"
						fullWidth
						sx={{
							backgroundColor: '#0d9488',
							'&:hover': { backgroundColor: '#0f766e' },
							padding: '12px',
						}}
					>
						Welcome Doctor
					</Button>
				</Box>
			</Box>
		</Box>
	)
}
