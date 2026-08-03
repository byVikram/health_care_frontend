// src/components/admin/AdminStatCard.tsx
import { ReactNode } from 'react'
import { Box, Typography, Stack, Avatar, SxProps, Theme } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

interface AdminStatCardProps {
	label: string
	value: number | string
	icon: ReactNode
	iconColor: string
	iconBg: string
	description?: string
	trend?: number
	onClick?: () => void
	sx?: SxProps<Theme>
}

export default function AdminStatCard({
	label,
	value,
	icon,
	iconColor,
	iconBg,
	description,
	trend,
	onClick,
	sx = {},
}: AdminStatCardProps) {
	return (
		<Box
			onClick={onClick}
			sx={{
				p: 2.5,
				borderRadius: '14px',
				border: '1px solid #e2e8f0',
				bgcolor: '#ffffff',
				cursor: onClick ? 'pointer' : 'default',
				transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
				'&:hover': onClick
					? {
							boxShadow: '0 8px 24px -8px rgba(15, 23, 42, 0.18)',
							transform: 'translateY(-2px)',
							borderColor: iconColor,
						}
					: {},
				height: '100%',
				boxSizing: 'border-box',
				...sx,
			}}
		>
			<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						variant="caption"
						sx={{
							color: '#64748b',
							fontWeight: 600,
							fontSize: '0.7rem',
							textTransform: 'uppercase',
							letterSpacing: '0.06em',
						}}
					>
						{label}
					</Typography>
					<Typography
						variant="h3"
						fontWeight={800}
						sx={{
							color: '#0f172a',
							letterSpacing: -1,
							lineHeight: 1.1,
							mt: 0.5,
							fontSize: { xs: '1.8rem', md: '2.2rem' },
						}}
					>
						{typeof value === 'number' ? value.toLocaleString() : value}
					</Typography>
					{description && (
						<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
							{description}
						</Typography>
					)}
					{trend !== undefined && (
						<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
							<TrendingUpIcon sx={{ fontSize: 14, color: '#10b981' }} />
							<Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>
								{trend > 0 ? '+' : ''}
								{trend}%
							</Typography>
						</Stack>
					)}
				</Box>
				<Avatar
					sx={{
						bgcolor: iconBg,
						width: 48,
						height: 48,
						flexShrink: 0,
						ml: 2,
						'& .MuiSvgIcon-root': { color: iconColor, fontSize: 24 },
					}}
				>
					{icon}
				</Avatar>
			</Stack>
		</Box>
	)
}
