// features/dashboard/EmergencyBannerSection.tsx
import { Box, Button, Typography } from '@mui/material'
import SirenImg from '../../../assets/Banner/siren.png'
import SosImg from '../../../assets/Banner/sos.png'

export default function EmergencyBannerSection() {
	return (
		<Box
			sx={{
				backgroundColor: '#0c7c7c',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				px: { xs: 4, md: 8 },
				py: { xs: 3, md: 1 },
				gap: { xs: 3, md: 6 },
				width: '100%',
			}}
		>
			{/* Siren image */}
			<Box
				component="img"
				src={SirenImg}
				alt="Siren"
				sx={{ width: { xs: 60, md: 80 }, height: { xs: 60, md: 80 }, objectFit: 'contain' }}
			/>

			{/* Text */}
			<Typography
				sx={{
					color: '#fff',
					fontWeight: 700,
					fontSize: { xs: '20px', md: '28px' },
					letterSpacing: 0.5,
					textAlign: 'center',
				}}
			>
				24×7 Emergency Support
			</Typography>

			{/* SOS Button with image */}
			<Button
				onClick={() => {}}
				sx={{
					p: 0,
					minWidth: 0,
					background: 'none',
					border: 'none',
					'&:hover': { opacity: 0.85, background: 'none' },
				}}
			>
				<Box
					component="img"
					src={SosImg}
					alt="SOS"
					sx={{
						width: { xs: 110, md: 140 },
						height: { xs: 110, md: 140 },
						objectFit: 'contain',
					}}
				/>
			</Button>
		</Box>
	)
}
