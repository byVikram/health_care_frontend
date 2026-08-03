// src/components/admin/AdminPageHeader.tsx
import { ReactNode } from 'react'
import { Box, Typography, Chip, Stack, SxProps, Theme } from '@mui/material'

interface AdminPageHeaderProps {
	title: string
	leading?: ReactNode
	subtitle?: string
	count?: number
	countLabel?: string
	actions?: ReactNode
	sx?: SxProps<Theme>
}

export default function AdminPageHeader({
	title,
	leading,
	subtitle,
	count,
	countLabel = 'total',
	actions,
	sx = {},
}: AdminPageHeaderProps) {
	return (
		<Stack
			direction={{ xs: 'column', sm: 'row' }}
			justifyContent="space-between"
			alignItems={{ xs: 'flex-start', sm: 'center' }}
			spacing={2}
			sx={{ mb: 3.5, ...sx }}
		>
			<Box>
				<Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
					{leading}
					<Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ letterSpacing: -0.4 }}>
						{title}
					</Typography>
					{count !== undefined && (
						<Chip
							label={`${count.toLocaleString()} ${countLabel}`}
							size="small"
							sx={{
								bgcolor: 'rgba(13, 148, 136, 0.1)',
								color: '#0d9488',
								fontWeight: 700,
								fontSize: '0.7rem',
								height: 22,
								borderRadius: '6px',
							}}
						/>
					)}
				</Stack>
				{subtitle && (
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
						{subtitle}
					</Typography>
				)}
			</Box>

			{actions && (
				<Stack direction="row" spacing={1.5} flexShrink={0}>
					{actions}
				</Stack>
			)}
		</Stack>
	)
}
