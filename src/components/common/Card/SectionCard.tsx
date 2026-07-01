// src/components/common/Card/SectionCard.tsx

import { ReactNode } from 'react'
import { Card, CardContent, Typography, Box, SxProps, Theme } from '@mui/material'
import { customCardStyle } from '../../../styles/commonStyles'

interface SectionCardProps {
	title: string
	stepNumber?: number
	children: ReactNode
	sx?: SxProps<Theme>
}

export default function SectionCard({ title, stepNumber, children, sx = {} }: SectionCardProps) {
	return (
		<Card sx={{ ...customCardStyle, height: '100%', ...sx }}>
			<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
					{stepNumber !== undefined && (
						<Box
							sx={{
								width: 24,
								height: 24,
								borderRadius: '50%',
								bgcolor: 'primary.main',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								flexShrink: 0,
							}}
						>
							<Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{stepNumber}</Typography>
						</Box>
					)}
					<Typography variant="subtitle2" fontWeight={700} color="#1E2A2A">
						{title}
					</Typography>
				</Box>
				{children}
			</CardContent>
		</Card>
	)
}
