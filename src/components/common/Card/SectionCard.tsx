// src/components/common/Card/SectionCard.tsx

import { ReactNode } from 'react'
import { Card, CardContent, Typography, Box, Stack, Divider, SxProps, Theme } from '@mui/material'

interface SectionCardProps {
	title: string
	subtitle?: string
	stepNumber?: number
	action?: ReactNode
	children: ReactNode
	sx?: SxProps<Theme>
	noPadding?: boolean
}

export default function SectionCard({
	title,
	subtitle,
	stepNumber,
	action,
	children,
	sx = {},
	noPadding = false,
}: SectionCardProps) {
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
				...sx,
			}}
		>
			<CardContent sx={{ p: noPadding ? 0 : 3, '&:last-child': { pb: noPadding ? 0 : 3 } }}>
				{/* Header row */}
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems={subtitle ? 'flex-start' : 'center'}
				// sx={{ mb: 2 }}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
						<Box>
							<Typography variant="subtitle1" sx={{ p: 2 }} fontWeight={900} color="#0f172a">
								{title}
							</Typography>
							{subtitle && (
								<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
									{subtitle}
								</Typography>
							)}
						</Box>
					</Box>
					{action && <Box sx={{ flexShrink: 0, ml: 2 }}>{action}</Box>}
				</Stack>

				{(title || subtitle || action) && !noPadding && (
					<Divider sx={{ mb: 2.5, borderColor: '#f1f5f9' }} />
				)}

				{children}
			</CardContent>
		</Card>
	)
}
