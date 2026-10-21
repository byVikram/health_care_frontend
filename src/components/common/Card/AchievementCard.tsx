// src/components/common/Card/AchievementCard.tsx

import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { getAchievementTypeMeta } from '../../../utils/achievementTypeMeta'

export interface AchievementCardData {
	id: string
	title: string
	achievement_type: string
	organization?: string | null
	achievement_date?: string |null
	description?: string | null
	document_s3_key?: string | null
}

interface AchievementCardProps {
	achievement: AchievementCardData
	onClick?: (achievement: AchievementCardData) => void
	width?: number
}

const formatDate = (value?: string | null): string | null => {
	if (!value) return null

	const parsed = new Date(value)
	if (Number.isNaN(parsed.getTime())) return null

	return parsed.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

export default function AchievementCard({
	achievement,
	onClick,
	width = 260,
}: AchievementCardProps) {
	const [imageFailed, setImageFailed] = useState(false)

	const meta = getAchievementTypeMeta(achievement.achievement_type)
	const dateLabel = formatDate(achievement.achievement_date)
	const isPdf = achievement.document_s3_key?.toLowerCase().endsWith('.pdf')

	return (
		<Box
			onClick={() => onClick?.(achievement)}
			sx={{
				width,
				height: 430,
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: 2,
				overflow: 'hidden',
				cursor: onClick ? 'pointer' : 'default',
				display: 'flex',
				flexDirection: 'column',
				transition: 'all .2s ease',
				'&:hover': onClick
					? {
							boxShadow: '0 6px 18px rgba(0,0,0,.12)',
							transform: 'translateY(-2px)',
					  }
					: undefined,
			}}
		>
			{/* Header */}
			<Box
				sx={{
					height: 150,
					bgcolor: `${meta.color}14`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
				}}
			>
				{achievement.document_s3_key && !isPdf && !imageFailed ? (
					<Box
						component="img"
						src={achievement.document_s3_key}
						alt={achievement.title}
						onError={() => setImageFailed(true)}
						sx={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
					/>
				) : (
					<Box
						sx={{
							color: meta.color,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							'& svg': {
								fontSize: 48,
							},
						}}
					>
						{meta.icon}
					</Box>
				)}
			</Box>

			{/* Content */}
			<Box
				sx={{
					p: 2,
					display: 'flex',
					flexDirection: 'column',
					flex: 1,
					gap: 1,
				}}
			>
				{/* Title */}
				<Typography
					variant="subtitle1"
					sx={{
						fontWeight: 700,
						fontSize: '1rem',
						lineHeight: 1.35,
						height: 54,
						overflow: 'hidden',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
					}}
				>
					{achievement.title}
				</Typography>

				{/* Organization */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'flex-start',
						gap: 0.75,
						height: 38,
					}}
				>
					<ApartmentOutlinedIcon
						sx={{
							fontSize: 15,
							mt: '2px',
							color: 'text.secondary',
							flexShrink: 0,
						}}
					/>

					<Typography
						sx={{
							fontSize: '0.78rem',
							color: 'text.secondary',
							lineHeight: 1.35,
							overflow: 'hidden',
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
						}}
					>
						{achievement.organization || 'â€”'}
					</Typography>
				</Box>

				{/* Date */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 0.75,
						height: 22,
					}}
				>
					<CalendarTodayOutlinedIcon
						sx={{
							fontSize: 14,
							color: 'text.secondary',
						}}
					/>

					<Typography
						sx={{
							fontSize: '0.78rem',
							color: 'text.secondary',
						}}
					>
						{dateLabel || 'â€”'}
					</Typography>
				</Box>

				{/* Description */}
				<Typography
					variant="body2"
					sx={{
						fontSize: '0.82rem',
						color: 'text.secondary',
						lineHeight: 1.5,
						height: 72,
						overflow: 'hidden',
						display: '-webkit-box',
						WebkitLineClamp: 3,
						WebkitBoxOrient: 'vertical',
					}}
				>
					{achievement.description || 'No description available.'}
				</Typography>
			</Box>
		</Box>
	)
}