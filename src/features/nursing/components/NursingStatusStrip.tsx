// src/features/nursing/components/NursingStatusStrip.tsx
//
// The visit's progress as the SERVER decides it (Booked > Confirmed > On the way > In progress > Done): a finished step is a teal circle with a
// check, the current one a teal-outlined circle, a coming one a grey outline, and a step that was MISSED (the nurse was at the door) a red one.
// A visit that ended without being completed shows the server's words ("Visit cancelled") in place of the strip. The page only draws it.
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import type { StatusTimeline } from '../nursingService'

export default function NursingStatusStrip({ timeline }: { timeline: StatusTimeline }) {
	if (timeline.outcome && timeline.outcome_text) {
		return (
			<Box component="section" aria-label="Visit status" sx={{ bgcolor: DESK.raised, border: `1px solid ${DESK.cardLine}`, borderRadius: '18px', p: '18px 22px', fontSize: 15, fontWeight: 800, color: timeline.outcome === 'cancelled' || timeline.outcome === 'missed' ? DESK.danger : DESK.ink }}>
				{timeline.outcome_text}
			</Box>
		)
	}
	const steps = timeline.steps
	return (
		<Box component="section" aria-label="Visit progress" sx={{ bgcolor: DESK.raised, border: `1px solid ${DESK.cardLine}`, borderRadius: '18px', p: '22px 24px' }}>
			<Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', alignItems: 'flex-start' }}>
				{steps.map((step, index) => {
					const done = step.state === 'done'
					const current = step.state === 'current'
					const stopped = step.state === 'stopped'
					const last = index === steps.length - 1
					return (
						<Box component="li" key={step.key} aria-current={current ? 'step' : undefined} sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Box
									component="span"
									sx={{
										width: 30,
										height: 30,
										boxSizing: 'border-box',
										borderRadius: '9999px',
										bgcolor: done ? DESK.primary : stopped ? DESK.dangerSoft : DESK.raised,
										border: `2px solid ${done || current ? DESK.primary : stopped ? DESK.danger : '#C9D6D7'}`,
										color: done ? '#FFFFFF' : current ? DESK.primary : stopped ? DESK.danger : DESK.faint,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 12,
										fontWeight: 800,
									}}
								>
									{done ? <DeskIcon d={DESK_ICONS.check} size={14} strokeWidth={3} /> : stopped ? <DeskIcon d={DESK_ICONS.close} size={13} strokeWidth={3} /> : index + 1}
								</Box>
								<Box component="span" sx={{ flexGrow: 1, height: 2, mx: '8px', bgcolor: done ? DESK.primary : DESK.lineStrong, visibility: last ? 'hidden' : 'visible' }} />
							</Box>
							<Box component="b" sx={{ pr: '12px', fontSize: 14, color: done || current ? DESK.ink : stopped ? DESK.danger : DESK.faint }}>
								{stopped ? 'Missed' : step.label}
							</Box>
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}
