// features/auth/onboarding/OnBoardingScreens.tsx
import { useState } from 'react'
import { Box, Typography, Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import { onboardingData, UserRole } from '../../../data/onboardingData'

interface Props {
	role: UserRole
	onFinish: () => void
}

export default function OnBoardingScreens({ role, onFinish }: Props) {
	const slides = onboardingData[role].screens
	const [currentIndex, setCurrentIndex] = useState(0)

	const currentSlide = slides[currentIndex]
	const isLast = currentIndex === slides.length - 1
	const isFirst = currentIndex === 0

	const handleNext = () => {
		if (isLast) {
			onFinish()
		} else {
			setCurrentIndex((prev) => prev + 1)
		}
	}

	const handleBack = () => {
		if (!isFirst) setCurrentIndex((prev) => prev - 1)
	}

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
			}}
		>
			{/* Invisible card container */}
			<Box
				sx={{
					width: '100%',
					maxWidth: 600,
					minHeight: 580,
					bgcolor: 'transparent',
					borderRadius: 0,
					backdropFilter: 'none',
					border: 'none',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					px: 6,
					pt: 3,
					pb: 5,
					gap: 4,
				}}
			>
				{/* Top bar — Back left, Skip >> right */}
				<Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<ArrowBackIcon
						onClick={!isFirst ? handleBack : undefined}
						sx={{
							color: '#fff',
							cursor: isFirst ? 'default' : 'pointer',
							opacity: isFirst ? 0.3 : 1,
							fontSize: 28,
							transition: 'transform 0.2s ease',
							'&:hover': {
								transform: isFirst ? 'none' : 'scale(1.1)',
							},
						}}
					/>

					{/* Skip with double-chevron — plain text, no background */}
					<Button
						onClick={onFinish}
						endIcon={<KeyboardDoubleArrowRightIcon sx={{ fontSize: '1.2rem !important' }} />}
						sx={{
							color: '#fff',
							fontWeight: 500,
							textTransform: 'none',
							fontSize: '1.5rem',
							bgcolor: 'transparent',
							border: 'none',
							p: 0,
							minWidth: 0,
							letterSpacing: 0.3,
							'&:hover': {
								bgcolor: 'transparent',
								opacity: 0.8,
							},
						}}
						disableRipple
					>
						Skip
					</Button>
				</Box>

				{/* Image */}
				<Box
					component="img"
					src={currentSlide.image}
					alt={currentSlide.title}
					sx={{
						width: { xs: 240, sm: 300 },
						height: { xs: 240, sm: 300 },
						objectFit: 'contain',
					}}
				/>

				{/* Title */}
				<Typography
					align="center"
					sx={{
						color: '#fff',
						fontSize: { xs: '1.2rem', sm: '1.4rem' },
						fontWeight: 500,
						lineHeight: 1.6,
						px: 2,
					}}
				>
					{currentSlide.title}
				</Typography>

				{/* Dot indicators */}
				<Box sx={{ display: 'flex', gap: 1 }}>
					{slides.map((_, i) => (
						<Box
							key={i}
							sx={{
								width: i === currentIndex ? 28 : 8,
								height: 8,
								borderRadius: 4,
								bgcolor: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.35)',
								transition: 'width 0.3s ease',
							}}
						/>
					))}
				</Box>

				{/* Next / Get Started button */}
				<Button
					fullWidth
					onClick={handleNext}
					sx={{
						bgcolor: '#fff',
						color: '#1a4f4f',
						fontWeight: 600,
						fontSize: '1rem',
						py: 1.5,
						borderRadius: 2,
						textTransform: 'none',
						'&:hover': { bgcolor: '#f0fafa' },
					}}
				>
					{isLast ? 'Get Started' : 'Next'}
				</Button>
			</Box>
		</Box>
	)
}
