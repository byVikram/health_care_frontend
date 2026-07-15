import React from 'react'
import { Box, Typography } from '@mui/material'

interface SuggestedActionsProps {
	onActionClick: (action: string) => void
}

export default function SuggestedActions({ onActionClick }: SuggestedActionsProps) {
	const actions = [
		'Find a Doctor',
		'Book an Appointment',
		'View Health Tips',
		'Ask a Health Question',
	]

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, width: '100%', px: 3.5, mb: 3 }}>
			{actions.map((action, index) => (
				<Box
					key={index}
					onClick={() => onActionClick(action)}
					sx={{
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'divider',
						borderRadius: '12px',
						py: 1.75,
						px: 2.5,
						cursor: 'pointer',
						transition: 'all 0.2s ease',
						boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
						'&:hover': {
							transform: 'translateY(-1.5px)',
							borderColor: 'primary.main',
							boxShadow: '0 4px 12px rgba(43, 111, 113, 0.08)',
						},
					}}
				>
					<Typography
						variant="body1"
						sx={{
							fontWeight: 700,
							color: 'text.primary',
							fontSize: '13.5px',
							letterSpacing: '-0.01em',
						}}
					>
						{action}
					</Typography>
				</Box>
			))}
		</Box>
	)
}
