// src/components/admin/AdminEmptyState.tsx
import { ReactNode } from 'react'
import { Box, Typography, SxProps, Theme } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'

interface AdminEmptyStateProps {
	icon?: ReactNode
	title?: string
	description?: string
	action?: ReactNode
	sx?: SxProps<Theme>
}

export default function AdminEmptyState({
	icon,
	title = 'No records found',
	description = 'Nothing to display right now.',
	action,
	sx = {},
}: AdminEmptyStateProps) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				py: 8,
				px: 3,
				textAlign: 'center',
				...sx,
			}}
		>
			<Box
				sx={{
					width: 64,
					height: 64,
					borderRadius: '16px',
					bgcolor: '#f1f5f9',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					mb: 2.5,
					'& .MuiSvgIcon-root': { fontSize: 32, color: '#94a3b8' },
				}}
			>
				{icon ?? <InboxIcon />}
			</Box>
			<Typography variant="subtitle1" fontWeight={700} color="#0f172a" sx={{ mb: 0.75 }}>
				{title}
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, lineHeight: 1.6 }}>
				{description}
			</Typography>
			{action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
		</Box>
	)
}
