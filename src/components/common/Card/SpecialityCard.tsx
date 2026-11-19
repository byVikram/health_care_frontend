// src/components/common/Card/SpecialityCard.tsx
import { Box, Typography } from '@mui/material'

interface SpecialityCardProps {
	/** An illustration (url). Give this OR `iconPath`. */
	image?: string
	/** A 24x24 stroke icon path (drawn in `iconColor`) shown instead of `image`, on `iconBg`. */
	iconPath?: string
	iconColor?: string
	/** Background of the 120px tile when `iconPath` is used; the illustrations bring their own look on the default tint. */
	iconBg?: string
	title: string
	onConsult?: () => void
}

export default function SpecialityCard({ image, iconPath, iconColor, iconBg, title, onConsult }: SpecialityCardProps) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 1,
				cursor: 'pointer',
				'&:hover .speciality-img-box': {
					transform: 'translateY(-3px)',
					boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
				},
			}}
			onClick={onConsult}
		>
			{/* Image Box */}
			<Box
				className="speciality-img-box"
				sx={{
					width: 120,
					height: 120,
					borderRadius: '16px',
					bgcolor: iconPath ? (iconBg ?? '#f0f4f8') : '#f0f4f8',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
					transition: 'transform 0.2s ease, box-shadow 0.2s ease',
				}}
			>
				{iconPath ? (
					<svg
						width={56}
						height={56}
						viewBox="0 0 24 24"
						fill="none"
						stroke={iconColor ?? 'currentColor'}
						strokeWidth={1.8}
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d={iconPath} />
					</svg>
				) : (
					<Box
						component="img"
						src={image}
						alt={title}
						// sx={{ width: '96%', height: '96%', objectFit: 'contain' }}
					/>
				)}
			</Box>

			{/* Title */}
			<Typography
				variant="body2"
				align="center"
				sx={{
					fontWeight: 500,
					color: 'text.primary',
					fontSize: '13px',
					lineHeight: 1.4,
					maxWidth: 110,
				}}
			>
				{title}
			</Typography>

			{/* Consult Now */}
			{/* <Typography
				variant="body2"
				fontSize={'16px'}
				sx={{
					color: 'neutral.main',
					fontWeight: 500,
					cursor: 'pointer',
					'&:hover': { textDecoration: 'underline' },
				}}
			>
				Consult Now
			</Typography> */}
		</Box>
	)
}
