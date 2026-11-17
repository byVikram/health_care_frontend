// src/components/common/Icon/DeskIcon.tsx
//
// A stroke icon drawn from an SVG path (the icon set of the desktop designs: DESK_ICONS in styles/deskTokens.ts). It takes the colour
// of the surrounding text (`currentColor`).
import { Box } from '@mui/material'

interface DeskIconProps {
	/** The path data (24x24 viewBox), e.g. DESK_ICONS.check. */
	d: string
	size?: number
	strokeWidth?: number
	/** Fill the shape instead of stroking it (the three-dots icon). */
	filled?: boolean
}

export default function DeskIcon({ d, size = 16, strokeWidth = 2, filled = false }: DeskIconProps) {
	return (
		<Box
			component="svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill={filled ? 'currentColor' : 'none'}
			stroke={filled ? 'none' : 'currentColor'}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			sx={{ flexShrink: 0, display: 'block' }}
		>
			<path d={d} />
		</Box>
	)
}

/** The three vertical dots of a "more" menu. */
export function DotsIcon({ size = 16 }: { size?: number }) {
	return (
		<Box
			component="svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			sx={{ flexShrink: 0, display: 'block' }}
		>
			<circle cx="12" cy="5" r="1.8" />
			<circle cx="12" cy="12" r="1.8" />
			<circle cx="12" cy="19" r="1.8" />
		</Box>
	)
}
