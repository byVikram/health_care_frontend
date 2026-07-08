// src/components/common/Modal/AchievementDetailsModal.tsx
import { useState, useEffect } from 'react'
import {
	Box,
	Typography,
	Button,
	Dialog,
	IconButton,
	Chip,
	Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { AchievementCardData } from '../Card/AchievementCard'
import { getAchievementTypeMeta } from '../../../utils/achievementTypeMeta'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

interface AchievementDetailsModalProps {
	open: boolean
	onClose: () => void
	achievement: AchievementCardData | null
}

const formatDate = (value?: string | null): string | null => {
	if (!value) return null
	const parsed = new Date(value)
	if (Number.isNaN(parsed.getTime())) return null
	return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AchievementDetailsModal({ open, onClose, achievement }: AchievementDetailsModalProps) {
	const [imageFailed, setImageFailed] = useState(false)

	// Reset image failure state when achievement changes or modal opens
	useEffect(() => {
		if (open) {
			setImageFailed(false)
		}
	}, [open, achievement])

	if (!achievement) return null

	const meta = getAchievementTypeMeta(achievement.achievement_type)
	const dateLabel = formatDate(achievement.achievement_date)
	const isPdf = achievement.document_s3_key?.toLowerCase().endsWith('.pdf')
	const hasImage = achievement.document_s3_key && !isPdf && !imageFailed

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth={false}
			PaperProps={{
				sx: {
					width: '100%',
					maxWidth: 520,
					borderRadius: '16px',
					overflow: 'hidden',
					m: { xs: 2, sm: 3 },
				},
			}}
		>
			{/* Hero Banner */}
			<Box
				sx={{
					height: 180,
					width: '100%',
					position: 'relative',
					bgcolor: `${meta.color}12`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
					flexShrink: 0,
				}}
			>
				{hasImage ? (
					<Box
						component="img"
						src={achievement.document_s3_key}
						alt={achievement.title}
						sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
						onError={() => setImageFailed(true)}
					/>
				) : (
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 1,
							opacity: 0.85,
						}}
					>
						<Box sx={{ fontSize: 56, '& svg': { fontSize: 56 }, color: meta.color }}>
							{meta.icon}
						</Box>
					</Box>
				)}

				{/* Close button overlaid top-right */}
				<IconButton
					onClick={onClose}
					size="small"
					aria-label="Close achievement details"
					sx={{
						position: 'absolute',
						top: 10,
						right: 10,
						bgcolor: 'rgba(0,0,0,0.35)',
						color: '#fff',
						backdropFilter: 'blur(4px)',
						'&:hover': { bgcolor: 'rgba(0,0,0,0.55)' },
					}}
				>
					<CloseIcon fontSize="small" />
				</IconButton>
			</Box>

			{/* Content body */}
			<Box
				sx={{
					px: { xs: 3, sm: 4 },
					pt: 3,
					pb: 3.5,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{/* Category chip */}
				<Chip
					label={achievement.achievement_type}
					size="small"
					icon={
						<Box
							sx={{
								'& svg': { fontSize: '14px !important', color: `${meta.color} !important` },
								display: 'flex',
								alignItems: 'center',
								pl: 0.5,
							}}
						>
							{meta.icon}
						</Box>
					}
					sx={{
						alignSelf: 'flex-start',
						mb: 1.5,
						fontWeight: 600,
						fontSize: '0.72rem',
						letterSpacing: 0.4,
						bgcolor: `${meta.color}14`,
						color: meta.color,
						border: `1px solid ${meta.color}30`,
						height: 26,
						'& .MuiChip-icon': { ml: 0.25 },
					}}
				/>

				{/* Title */}
				<Typography
					variant="h6"
					sx={{
						fontWeight: 700,
						fontSize: { xs: '1.05rem', sm: '1.15rem' },
						color: 'text.primary',
						lineHeight: 1.35,
						mb: 2,
					}}
				>
					{achievement.title}
				</Typography>

				{/* Metadata rows */}
				{(achievement.organization || dateLabel) && (
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 1,
							mb: achievement.description ? 2.5 : 1,
						}}
					>
						{achievement.organization && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<ApartmentOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
								<Typography sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
									<Box component="span" sx={{ color: 'text.disabled', mr: 0.5 }}>Organization:</Box>
									<Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
										{achievement.organization}
									</Box>
								</Typography>
							</Box>
						)}
						{dateLabel && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
								<Typography sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
									<Box component="span" sx={{ color: 'text.disabled', mr: 0.5 }}>Date:</Box>
									<Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
										{dateLabel}
									</Box>
								</Typography>
							</Box>
						)}
					</Box>
				)}

				{/* Description */}
				{achievement.description && (
					<>
						<Divider sx={{ mb: 2 }} />
						<Box>
							<Typography
								variant="overline"
								sx={{
									fontSize: '0.7rem',
									fontWeight: 700,
									letterSpacing: 1,
									color: 'text.disabled',
									display: 'block',
									mb: 0.75,
								}}
							>
								Description
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: 'text.secondary',
									fontSize: '0.875rem',
									lineHeight: 1.7,
									whiteSpace: 'pre-wrap',
								}}
							>
								{achievement.description}
							</Typography>
						</Box>
					</>
				)}

				{/* Document link */}
				{achievement.document_s3_key && (
					<Box sx={{ mt: achievement.description ? 2.5 : 1 }}>
						<Button
							variant="outlined"
							color="primary"
							size="small"
							startIcon={isPdf ? <InsertDriveFileOutlinedIcon /> : <OpenInNewIcon />}
							href={achievement.document_s3_key}
							target="_blank"
							rel="noopener noreferrer"
							sx={{
								borderRadius: '8px',
								textTransform: 'none',
								fontWeight: 600,
								fontSize: '0.8rem',
							}}
						>
							{isPdf ? 'View PDF Document' : 'View Verification Document'}
						</Button>
					</Box>
				)}
			</Box>
		</Dialog>
	)
}
