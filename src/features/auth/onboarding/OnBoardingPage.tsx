// features/auth/onboarding/OnBoardingPage.tsx
import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import { onboardingData, type UserRole } from '../../../data/onboardingData'
import AppButton from '../../../components/common/Button/AppButton'

interface Props {
	role: UserRole
	roleId: string
	onFinish: (roleId: string) => void
	onBack?: () => void
	// The flow stops at the last slide for now: Skip jumps to the last slide instead of finishing (the caller decides what
	// the last button does).
	holdAtLastSlide?: boolean
}

export default function OnBoardingPage({ role, roleId, onFinish, onBack, holdAtLastSlide = false }: Props) {
	const slides = onboardingData[role].screens
	const [currentIndex, setCurrentIndex] = useState(0)

	const currentSlide = slides[currentIndex]
	const isLast = currentIndex === slides.length - 1
	const isFirst = currentIndex === 0

	const handleNext = () => {
		if (isLast) onFinish(roleId)
		else setCurrentIndex((prev) => prev + 1)
	}

	const handleSkip = () => {
		if (holdAtLastSlide) setCurrentIndex(slides.length - 1)
		else onFinish(roleId)
	}

	const handleBack = () => {
		if (!isFirst) setCurrentIndex((prev) => prev - 1)
		else if (onBack) onBack()
	}

	return (
		<Box
			sx={{
				width: '100%',
				minHeight: '100vh',
				boxSizing: 'border-box',
				background: 'linear-gradient(160deg, #2d7d7d 0%, #1a4f4f 60%, #0f3333 100%)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				px: 2,
				py: 2,
			}}
		>
			<Box
				sx={{
					width: '100%',
					maxWidth: 600,
					bgcolor: 'transparent',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					px: 6,
					pt: 1,
					pb: 2,
					gap: 2.5,
				}}
			>
				{/* Top bar */}
				<Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<ArrowBackIcon
						onClick={handleBack}
						sx={{
							color: '#fff',
							cursor: (isFirst && !onBack) ? 'default' : 'pointer',
							opacity: (isFirst && !onBack) ? 0.3 : 1,
							fontSize: 28,
							transition: 'transform 0.2s ease',
							'&:hover': { transform: (isFirst && !onBack) ? 'none' : 'scale(1.1)' },
						}}
					/>
					<AppButton
						onClick={handleSkip}
						label="Skip"
						endIcon={<KeyboardDoubleArrowRightIcon sx={{ fontSize: '1.2rem !important' }} />}
						disableRipple
						sx={{
							color: '#fff',
							fontWeight: 500,
							textTransform: 'none',
							fontSize: '1rem',
							bgcolor: 'transparent',
							border: 'none',
							p: 0,
							minWidth: 0,
							boxShadow: 'none',
							'&:hover': { bgcolor: 'transparent', opacity: 0.8 },
						}}
					/>
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

				{/* Bold heading + title */}
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
					{currentSlide.heading && (
						<Typography
							align="center"
							sx={{
								color: '#fff',
								fontSize: { xs: '1.05rem', sm: '1.2rem' },
								fontWeight: 700,
								lineHeight: 1.6,
								letterSpacing: '0.04em',
								textTransform: 'uppercase',
								px: 2,
							}}
						>
							{currentSlide.heading}
						</Typography>
					)}
					<Typography
						align="center"
						sx={{
							color: '#fff',
							fontSize: { xs: '1.05rem', sm: '1.2rem' },
							fontWeight: 500,
							lineHeight: 1.6,
							px: 2,
						}}
					>
						{currentSlide.title}
					</Typography>
				</Box>

				{/* Dot indicators */}
				<Box sx={{ display: 'flex', gap: 1 }}>
					{slides.map((_, i) => (
						<Box
							key={i}
							sx={{
								width: i === currentIndex ? 28 : 8,
								height: 8,
								borderRadius: 2,
								bgcolor: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.35)',
								transition: 'width 0.3s ease',
							}}
						/>
					))}
				</Box>

				{/* Next / Get Started button */}
				<AppButton
					fullWidth
					onClick={handleNext}
					label={isLast ? 'Get Started' : 'Next'}
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
				/>
			</Box>
		</Box>
	)
}
