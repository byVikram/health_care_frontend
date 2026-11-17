// src/components/common/StatusPill/StatusPill.tsx
//
// The small coloured status chip of the desktop lists ("Confirmed", "Nurse assigned", "Not arrived · 1h 30m late"). The tone says the
// colours (DESK_TONES); `bg` / `fg` override them for a one-off colour.
import { Box } from '@mui/material'
import { DESK_TONES, type DeskTone } from '../../../styles/deskTokens'

interface StatusPillProps {
	label: string
	tone?: DeskTone
	bg?: string
	fg?: string
}

export default function StatusPill({ label, tone = 'done', bg, fg }: StatusPillProps) {
	const colours = DESK_TONES[tone]
	return (
		<Box
			component="span"
			sx={{
				flexShrink: 0,
				height: 22,
				px: '8px',
				borderRadius: '6px',
				fontSize: 11,
				fontWeight: 800,
				display: 'inline-flex',
				alignItems: 'center',
				whiteSpace: 'nowrap',
				bgcolor: bg ?? colours.bg,
				color: fg ?? colours.fg,
			}}
		>
			{label}
		</Box>
	)
}
