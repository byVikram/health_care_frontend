// src/components/common/Button/AppButton.tsx
import { Button, CircularProgress, SxProps, Theme } from '@mui/material'
import { ReactNode, MouseEvent } from 'react'

interface AppButtonProps {
	label?: ReactNode
	loading?: boolean
	disabled?: boolean
	variant?: 'contained' | 'outlined' | 'text'
	color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | 'inherit'
	fullWidth?: boolean
	borderRadius?: string
	startIcon?: ReactNode
	endIcon?: ReactNode
	onClick?: (e: MouseEvent<HTMLButtonElement>) => void
	sx?: SxProps<Theme>
	size?: 'small' | 'medium' | 'large'
	children?: ReactNode
	[key: string]: unknown
}

export default function AppButton({
	label,
	loading = false,
	disabled = false,
	variant = 'contained',
	color = 'primary',
	fullWidth = false,
	borderRadius = '8px',
	startIcon,
	endIcon,
	onClick,
	sx = {},
	size = 'medium',
	children,
	...rest
}: AppButtonProps) {
	const sizeStyles = {
		small: { minWidth: 80, fontSize: 13, padding: '2px 10px' },
		medium: { minWidth: 100, fontSize: 14, padding: '8px 12px' },
		large: { minWidth: 120, fontSize: 16, padding: '6px 16px' },
	}

	const displayContent = label ?? children

	return (
		<Button
			variant={variant}
			color={color}
			fullWidth={fullWidth}
			disabled={disabled || loading}
			startIcon={loading ? null : startIcon}
			endIcon={loading ? null : endIcon}
			onClick={onClick}
			sx={{
				// minWidth: 100,
				position: 'relative',
				letterSpacing: '0.02em',
				boxShadow: 'none',
				fontWeight: 400,
				borderRadius: borderRadius,
				'&:focus': { outline: 'none' },
				bgcolor: variant === 'text' ? '#fff' : '',
				border: variant === 'outlined' ? '2px solid' : undefined, // <-- added
				...sizeStyles[size],
				...sx,
			}}
			{...rest}
		>
			{loading ? (
				<>
					<CircularProgress size={16} thickness={5} sx={{ color: 'inherit', mr: 1 }} />
					Loading
				</>
			) : (
				displayContent
			)}
		</Button>
	)
}
