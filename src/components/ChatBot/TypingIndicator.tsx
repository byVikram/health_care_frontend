import React from 'react'
import { Box } from '@mui/material'

export default function TypingIndicator() {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 1.5, pl: 2 }}>
			{/* Small dots with staggered animation delays */}
			<Box
				sx={{
					width: 7,
					height: 7,
					borderRadius: '50%',
					bgcolor: 'text.secondary',
					opacity: 0.5,
					animation: 'typing-bounce 1.4s infinite ease-in-out both',
					'@keyframes typing-bounce': {
						'0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.3 },
						'40%': { transform: 'scale(1.2)', opacity: 0.8 },
					},
				}}
			/>
			<Box
				sx={{
					width: 7,
					height: 7,
					borderRadius: '50%',
					bgcolor: 'text.secondary',
					opacity: 0.5,
					animation: 'typing-bounce 1.4s infinite ease-in-out both',
					animationDelay: '0.2s',
				}}
			/>
			<Box
				sx={{
					width: 7,
					height: 7,
					borderRadius: '50%',
					bgcolor: 'text.secondary',
					opacity: 0.5,
					animation: 'typing-bounce 1.4s infinite ease-in-out both',
					animationDelay: '0.4s',
				}}
			/>
		</Box>
	)
}
