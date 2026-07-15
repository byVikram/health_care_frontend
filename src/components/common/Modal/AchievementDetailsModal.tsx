// src/components/common/Modal/AchievementDetailsModal.tsx
import { Box, Typography, Chip } from '@mui/material'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import AppModal from './AppModal'
import { getAchievementTypeMeta } from '../../../utils/achievementTypeMeta'
import { AchievementCardData } from '../Card/AchievementCard'

interface AchievementDetailsModalProps {
	open: boolean
	onClose: () => void
	achievement: AchievementCardData | null
}

const formatFullDate = (value?: string | null): string | null => {
	if (!value) return null
	const parsed = new Date(value)
	if (Number.isNaN(parsed.getTime())) return null
	return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AchievementDetailsModal({ open, onClose, achievement }: AchievementDetailsModalProps) {
	if (!achievement) return null

	const meta = getAchievementTypeMeta(achievement.achievement_type)
	const dateLabel = formatFullDate(achievement.achievement_date)

	return (
		<AppModal open={open} onClose={onClose} title="Achievement Details" maxWidth="sm" fullWidth>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Box
					sx={{
						height: { xs: 160, sm: 220 },
						borderRadius: '12px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						bgcolor: `${meta.color}14`,
						color: meta.color,
						'& svg': { fontSize: { xs: 64, sm: 88 } },
					}}
				>
					{meta.icon}
				</Box>

				<Box>
					<Chip
						label={achievement.achievement_type}
						size="small"
						sx={{
							bgcolor: `${meta.color}18`,
							color: meta.color,
							fontWeight: 700,
							fontSize: '0.7rem',
							mb: 1,
						}}
					/>
					<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
						{achievement.title}
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
					{achievement.organization && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
							<ApartmentOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
							<Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
								{achievement.organization}
							</Typography>
						</Box>
					)}
					{dateLabel && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
							<CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
							<Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{dateLabel}</Typography>
						</Box>
					)}
				</Box>

				{achievement.description && (
					<Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, mb: 1 }}>
						{achievement.description}
					</Typography>
				)}
			</Box>
		</AppModal>
	)
}
