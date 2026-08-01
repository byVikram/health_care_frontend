// src/components/common/Card/SectionCard.tsx

import { ReactNode } from 'react'
import { Card, CardContent, Typography, Box, SxProps, Theme } from '@mui/material'

interface SectionCardProps {
	title: string
	stepNumber?: number
	children: ReactNode
	sx?: SxProps<Theme>
}

export default function SectionCard({ title, stepNumber, children, sx = {} }: SectionCardProps) {
	return (
		<Card
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '14px',
				boxShadow: '0 4px 20px rgba(15, 23, 42, 0.015)',
				transition: 'transform 0.2s ease, box-shadow 0.2s ease',
				'&:hover': {
					boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
				},
				height: '100%',
				...sx
			}}
		>
			<CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
					{stepNumber !== undefined && (
						<Box
							sx={{
								width: 26,
								height: 26,
								borderRadius: '50%',
								bgcolor: '#0d9488',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								flexShrink: 0,
								boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)',
							}}
						>
							<Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{stepNumber}</Typography>
						</Box>
					)}
					<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
						{title}
					</Typography>
				</Box>
				{children}
			</CardContent>
		</Card>
	)
}
