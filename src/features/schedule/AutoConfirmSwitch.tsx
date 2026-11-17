// src/features/schedule/AutoConfirmSwitch.tsx
//
// The "Auto-confirm bookings" switch of the Booking requests column: a grey button holding the wording and a 38x22 track switch.
// `enabled` is null until the server has said (the switch then waits).
import { Box } from '@mui/material'
import { DESK } from '../../styles/deskTokens'

interface AutoConfirmSwitchProps {
	enabled: boolean | null
	busy: boolean
	onChange: (enabled: boolean) => void
}

export default function AutoConfirmSwitch({ enabled, busy, onChange }: AutoConfirmSwitchProps) {
	const on = enabled === true
	const locked = enabled === null || busy
	return (
		<Box
			component="button"
			type="button"
			role="switch"
			aria-checked={on}
			disabled={locked}
			onClick={() => onChange(!on)}
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: '10px',
				p: '10px 12px',
				border: `1px solid ${DESK.line}`,
				borderRadius: '10px',
				bgcolor: DESK.page,
				textAlign: 'left',
				fontFamily: 'inherit',
				cursor: locked ? 'default' : 'pointer',
				opacity: locked ? 0.7 : 1,
			}}
		>
			<Box component="span" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
				<Box component="b" sx={{ fontSize: 13, color: DESK.ink }}>
					Auto-confirm bookings
				</Box>
				<Box component="span" sx={{ fontSize: 11, color: DESK.muted }}>
					Open slots confirm instantly. Red-flag requests still come to you.
				</Box>
			</Box>
			<Box
				component="span"
				aria-hidden="true"
				sx={{
					position: 'relative',
					flexShrink: 0,
					width: 38,
					height: 22,
					borderRadius: '9999px',
					bgcolor: on ? DESK.primary : DESK.field,
				}}
			>
				<Box
					component="span"
					sx={{
						position: 'absolute',
						top: 3,
						left: on ? '19px' : '3px',
						width: 16,
						height: 16,
						borderRadius: '9999px',
						bgcolor: '#FFFFFF',
					}}
				/>
			</Box>
		</Box>
	)
}
