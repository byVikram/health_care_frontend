// src/components/common/Switch/AppSegmentedToggle.tsx
import type { ReactNode } from 'react'
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
	/** Every option gets the width of the widest one, so the segments are the same size whatever their wording. */
	equalWidth?: boolean
	size?: 'small' | 'medium' | 'large'
	/**
	 * 'default': a light grey bar. 'pill': a teal rounded pill with a white knob on the selected option, the same
	 * look as the appointment-type toggle in the booking date picker.
	 */
	variant?: 'default' | 'pill'
	disabled?: boolean
	sx?: SxProps<Theme>
}

export default function AppSegmentedToggle<T extends string | number = string>({
	value,
	onChange,
	options,
	label,
	fullWidth = true,
	equalWidth = false,
	size = 'medium',
	variant = 'default',
	disabled = false,
	sx = {},
}: AppSegmentedToggleProps<T>) {
	const isPill = variant === 'pill'

	const sizeStyles = {
		small: { py: 0.5, px: 1.5, fontSize: '0.78rem' },
		medium: { py: 0.85, px: 2, fontSize: '0.85rem' },
		large: { py: 1.15, px: 2.5, fontSize: '0.95rem' },
	}

	const containerStyles = isPill
		? { p: '3px', borderRadius: '50px', bgcolor: 'primary.main', border: 0, gap: '3px' }
		: { p: '4px', borderRadius: '10px', bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', gap: '4px' }

	const buttonStyles = (isSelected: boolean) =>
		isPill
			? {
					py: 0.85,
					px: 3,
					fontSize: '12px',
					lineHeight: 1.3,
					borderRadius: '50px',
					textTransform: 'none',
					fontWeight: 600,
					color: isSelected ? 'text.primary' : '#ffffff',
					bgcolor: isSelected ? '#ffffff' : 'transparent',
					boxShadow: 'none',
					transition: 'all 0.2s',
					'&:hover': {
						bgcolor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.14)',
						color: isSelected ? 'text.primary' : '#ffffff',
					},
					'&.Mui-disabled': {
						color: 'rgba(255,255,255,0.5)',
					},
				}
			: {
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
				}

	return (
		<Box
			sx={{
				width: fullWidth ? '100%' : 'auto',
				display: fullWidth ? 'flex' : 'inline-flex',
				flexDirection: 'column',
			}}
		>
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
					...containerStyles,
					display: equalWidth ? (fullWidth ? 'grid' : 'inline-grid') : fullWidth ? 'flex' : 'inline-flex',
					...(equalWidth && { gridAutoFlow: 'column', gridAutoColumns: '1fr' }),
					width: fullWidth ? '100%' : 'auto',
					...sx,
				}}
			>
				{options.map((option) => {
					const isSelected = option.value === value
					const isDisabled = disabled || option.disabled

					return (
						<Button
							key={String(option.value)}
							fullWidth={fullWidth || equalWidth}
							disabled={isDisabled}
							onClick={() => !isDisabled && onChange(option.value)}
							startIcon={option.icon}
							sx={buttonStyles(isSelected)}
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
