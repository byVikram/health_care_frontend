// src/components/common/Button/DeskButton.tsx
//
// The buttons of the desktop designs: teal (primary), white with a grey outline (secondary) and white with a red outline (danger),
// in three heights. Renders a link when given `href` (Get directions, View report).
import { Box, CircularProgress } from '@mui/material'
import type { MouseEvent, ReactNode } from 'react'
import DeskIcon from '../Icon/DeskIcon'
import { DESK } from '../../../styles/deskTokens'

export type DeskButtonKind = 'primary' | 'secondary' | 'danger' | 'info'

interface DeskButtonProps {
	label: string
	kind?: DeskButtonKind
	/** 'lg' 42px (detail panel), 'md' 38px (cards), 'sm' 36px (list rows). */
	size?: 'lg' | 'md' | 'sm'
	/** SVG path of a leading icon (DESK_ICONS). */
	icon?: string
	onClick?: (event: MouseEvent<HTMLElement>) => void
	href?: string
	/** Opens the link in a new tab. */
	external?: boolean
	loading?: boolean
	disabled?: boolean
	fullWidth?: boolean
	children?: ReactNode
}

const HEIGHT = { lg: 42, md: 38, sm: 36 } as const

const PALETTE: Record<DeskButtonKind, { bg: string; fg: string; border: string }> = {
	primary: { bg: DESK.primary, fg: '#FFFFFF', border: DESK.primary },
	info: { bg: DESK.info, fg: '#FFFFFF', border: DESK.info },
	secondary: { bg: DESK.raised, fg: DESK.ink, border: DESK.lineStrong },
	danger: { bg: DESK.raised, fg: DESK.danger, border: DESK.dangerLine },
}

export default function DeskButton({
	label,
	kind = 'secondary',
	size = 'lg',
	icon,
	onClick,
	href,
	external = false,
	loading = false,
	disabled = false,
	fullWidth = true,
}: DeskButtonProps) {
	const palette = PALETTE[kind]
	const sx = {
		height: HEIGHT[size],
		px: size === 'lg' ? '14px' : '16px',
		borderRadius: '10px',
		border: `1px solid ${palette.border}`,
		bgcolor: palette.bg,
		color: palette.fg,
		fontFamily: 'inherit',
		fontSize: size === 'sm' ? 13 : 14,
		fontWeight: 800,
		display: fullWidth ? 'flex' : 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '6px',
		textDecoration: 'none',
		whiteSpace: 'nowrap',
		cursor: disabled || loading ? 'default' : 'pointer',
		opacity: disabled ? 0.55 : 1,
		'&:hover': { color: palette.fg, filter: disabled ? 'none' : 'brightness(0.97)' },
	} as const
	const content = loading ? (
		<CircularProgress size={16} thickness={5} sx={{ color: 'inherit' }} />
	) : (
		<>
			{icon ? <DeskIcon d={icon} size={size === 'sm' ? 14 : 15} strokeWidth={2.4} /> : null}
			{label}
		</>
	)
	if (href && !disabled) {
		return (
			<Box
				component="a"
				href={href}
				target={external ? '_blank' : undefined}
				rel={external ? 'noopener noreferrer' : undefined}
				sx={sx}
			>
				{content}
			</Box>
		)
	}
	return (
		<Box
			component="button"
			type="button"
			onClick={disabled || loading ? undefined : onClick}
			aria-disabled={disabled || undefined}
			sx={sx}
		>
			{content}
		</Box>
	)
}
