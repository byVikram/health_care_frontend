// src/components/OrderCard.tsx
import React from 'react'
import { Box, Typography, Paper, Stack, SxProps, Theme } from '@mui/material'
import { customCardStyle } from '../../../styles/commonStyles'

export interface OrderCardProps {
	imageSrc: string

	title: string

	stats: string | number

	iconBgColor?: string

	onClick?: () => void

	sx?: SxProps<Theme>
}

export const OrderCard: React.FC<OrderCardProps> = ({
	imageSrc,
	title,
	stats,
	iconBgColor = '#F4F6F8',
	onClick,
	sx,
}) => {
	return (
		<Paper
			elevation={0}
			onClick={onClick}
			sx={{
				...customCardStyle,
				// p: 2,
				// borderRadius: 2,
				// bgcolor: '#fff',
				// boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
				// transition: 'transform 0.2s, box-shadow 0.2s',
				// cursor: onClick ? 'pointer' : 'default',
				'&:hover': {
					transform: 'translateY(-4px)',
					boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
				},
				...sx,
			}}
		>
			<Stack direction="row" alignItems="center" spacing={1.5}>
				<Box
					sx={{
						width: 48,
						height: 48,
						borderRadius: 2,
						bgcolor: iconBgColor,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<img src={imageSrc} width={32} height={32} alt={title} />
				</Box>

				<Box>
					<Typography variant="body2" sx={{ color: '#6B7A82', mb: 0.5, fontWeight: 500 }}>
						{title}
					</Typography>
					<Typography variant="h6" sx={{ fontWeight: 700, color: '#1A2C33', lineHeight: 1.3 }}>
						{stats}
					</Typography>
				</Box>
			</Stack>
		</Paper>
	)
}
