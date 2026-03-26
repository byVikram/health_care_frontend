// src/components/common/Card/ConsultCard.tsx
import { Box, Typography } from '@mui/material'

interface ConsultCardProps {
	image: string
	title: string
	description: string
	onConsult?: () => void
}

export default function ConsultCard({ image, title, description, onConsult }: ConsultCardProps) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
				cursor: 'pointer',
				'&:hover .consult-img-box': {
					transform: 'translateY(-3px)',
					boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
				},
			}}
			onClick={onConsult}
		>
			{/* Image Card */}
			<Box
				className="consult-img-box"
				sx={{
					width: '100%',
					aspectRatio: '4/3',
					borderRadius: '6px',
					overflow: 'hidden',
					transition: 'transform 0.2s ease, box-shadow 0.2s ease',
					bgcolor: '#f0f4f8',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Box
					component="img"
					src={image}
					alt={title}
					// sx={{ width: '60%', height: '60%', objectFit: 'contain' }}
				/>
			</Box>

			{/* Title */}
			<Typography
				variant="subtitle1"
				sx={{ fontWeight: 700, color: 'text.primary', fontSize: '15px', lineHeight: 1.4 }}
			>
				{title}
			</Typography>

			{/* Description */}
			<Typography
				variant="body2"
				sx={{ color: 'text.secondary', fontSize: '13px', lineHeight: 1.5, minHeight: 40 }}
			>
				{description}
			</Typography>

			{/* Consult Now */}
			<Typography
				variant="body2"
				sx={{
					color: 'neutral.main',
					fontWeight: 500,
					cursor: 'pointer',
					'&:hover': { textDecoration: 'underline' },
				}}
			>
				Consult Now
			</Typography>
		</Box>
	)
}
