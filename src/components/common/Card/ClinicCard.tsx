// src/components/common/Card/ClinicCard.tsx
import { Box, Typography, Button } from '@mui/material'

interface ClinicCardProps {
	image: string
	title: string
	description: string
	onConsult?: () => void
}

export default function ClinicCard({ image, title, description, onConsult }: ClinicCardProps) {
	return (
		<Box sx={{ cursor: 'pointer' }}>
			{/* Photo */}
			<Box
				sx={{
					width: '100%',
					aspectRatio: '4/3',
					borderRadius: 3,
					overflow: 'hidden',
					mb: 1.5,
				}}
			>
				<img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</Box>

			{/* Title */}
			<Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
				{title}
			</Typography>

			{/* Description */}
			<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, minHeight: 40 }}>
				{description}
			</Typography>

			{/* Consult Now */}
			<Button
				size="small"
				onClick={onConsult}
				sx={{
					color: 'primary.main',
					fontWeight: 600,
					textTransform: 'none',
					p: 0,
					fontSize: '0.9rem',
					minWidth: 0,
					'&:hover': { background: 'none', textDecoration: 'underline' },
				}}
			>
				Consult Now
			</Button>
		</Box>
	)
}
