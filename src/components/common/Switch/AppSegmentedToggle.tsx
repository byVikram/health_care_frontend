// src/components/common/Switch/AppSegmentedToggle.tsx
import React, { ReactNode } from 'react'
import { Box, Button, Typography, SxProps, Theme } from '@mui/material'

export interface SegmentedToggleOption<T extends string | number = string> {
	value: T
	label: ReactNode
	icon?: ReactNode
	disabled?: boolean
	badge?: ReactNode
}

export interface AppSegmentedToggleProps<T extends string | number = string> {
	value: T
	onChange: (value: T) => void
	options: SegmentedToggleOption<T>[]
	label?: string
	fullWidth?: boolean
	size?: 'small' | 'medium' | 'large'
	disabled?: boolean
	sx?: SxProps<Theme>
}

export default function AppSegmentedToggle<T extends string | number = string>({
	value,
	onChange,
	options,
	label,
	fullWidth = true,
	size = 'medium',
	disabled = false,
	sx = {},
}: AppSegmentedToggleProps<T>) {
	const sizeStyles = {
		small: { py: 0.5, px: 1.5, fontSize: '0.78rem' },
		medium: { py: 0.85, px: 2, fontSize: '0.85rem' },
		large: { py: 1.15, px: 2.5, fontSize: '0.95rem' },
	}

	return (
		<Box sx={{ width: fullWidth ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}>
			{label && (
				<Typography
					variant="subtitle2"
					fontWeight={700}
					color="#0f172a"
					sx={{ mb: 1, letterSpacing: '0.01em' }}
				>
					{label}
				</Typography>
			)}
			<Box
				sx={{
					p: '4px',
					borderRadius: '10px',
					bgcolor: '#f1f5f9',
					display: 'flex',
					width: fullWidth ? '100%' : 'auto',
					border: '1px solid #e2e8f0',
					gap: '4px',
					...sx,
				}}
			>
				{options.map((option) => {
					const isSelected = option.value === value
					const isDisabled = disabled || option.disabled

					return (
						<Button
							key={String(option.value)}
							fullWidth={fullWidth}
							disabled={isDisabled}
							onClick={() => !isDisabled && onChange(option.value)}
							startIcon={option.icon}
							sx={{
								...sizeStyles[size],
								borderRadius: '8px',
								textTransform: 'none',
								fontWeight: isSelected ? 700 : 500,
								color: isSelected ? '#0f766e' : '#64748b',
								bgcolor: isSelected ? '#ffffff' : 'transparent',
								boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
								border: isSelected ? '1px solid #ccfbf1' : '1px solid transparent',
								transition: 'all 0.15s ease',
								'&:hover': {
									bgcolor: isSelected ? '#ffffff' : '#e2e8f0',
									color: isSelected ? '#0f766e' : '#334155',
								},
								'&.Mui-disabled': {
									color: '#94a3b8',
								},
							}}
						>
							{option.label}
							{option.badge}
						</Button>
					)
				})}
			</Box>
		</Box>
	)
}
