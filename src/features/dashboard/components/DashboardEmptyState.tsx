// src/features/dashboard/components/DashboardEmptyState.tsx
import { Box, Typography } from '@mui/material'

interface DashboardEmptyStateProps {
	message: string
	/** Vertical padding around the message. Defaults to a compact size for inline grid slots. */
	py?: number
}

/**
 * Shared "nothing to show yet" placeholder for dashboard sections, so an
 * empty API response reads as "there's genuinely nothing here" rather than
 * looking like a broken/incomplete page (a blank grid with no explanation).
 */
export default function DashboardEmptyState({ message, py = 3 }: DashboardEmptyStateProps) {
	return (
		<Box sx={{ p: py, textAlign: 'center', width: '100%' }}>
			<Typography variant="body2" color="text.secondary">
				{message}
			</Typography>
		</Box>
	)
}
