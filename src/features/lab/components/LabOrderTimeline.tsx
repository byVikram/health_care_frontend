// src/features/lab/components/LabOrderTimeline.tsx
//
// The order's progress as the server sends it (Order placed > Phlebotomist assigned > Sample collected > ...): a finished step is a teal
// circle with a check, the current one a teal-outlined circle with its number, a coming one a grey outline; a line joins the steps.
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import { stampLabel } from '../../booking/bookingFormat'
import type { ApiTimelineStep } from '../labService'

export default function LabOrderTimeline({ steps }: { steps: ApiTimelineStep[] }) {
	return (
		<Box
			component="section"
			aria-label="Order progress"
			sx={{ bgcolor: DESK.raised, border: `1px solid ${DESK.cardLine}`, borderRadius: '18px', p: '22px 24px' }}
		>
			<Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', alignItems: 'flex-start' }}>
				{steps.map((step, index) => {
					const done = step.state === 'done'
					const current = step.state === 'current'
					const last = index === steps.length - 1
					const sub = [step.sub, step.at ? stampLabel(step.at) : null].filter(Boolean).join(' · ')
					return (
						<Box
							component="li"
							key={step.key}
							aria-current={current ? 'step' : undefined}
							sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}
						>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Box
									component="span"
									sx={{
										width: 30,
										height: 30,
										boxSizing: 'border-box',
										borderRadius: '9999px',
										bgcolor: done ? DESK.primary : DESK.raised,
										border: `2px solid ${done || current ? DESK.primary : DESK.lineChoice}`,
										color: done ? '#FFFFFF' : current ? DESK.primary : DESK.faint,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 12,
										fontWeight: 800,
									}}
								>
									{done ? <DeskIcon d={DESK_ICONS.check} size={14} strokeWidth={3} /> : index + 1}
								</Box>
								<Box
									component="span"
									sx={{
										flexGrow: 1,
										height: 2,
										mx: '8px',
										bgcolor: done ? DESK.primary : DESK.lineStrong,
										visibility: last ? 'hidden' : 'visible',
									}}
								/>
							</Box>
							<Box component="span" sx={{ pr: '12px', display: 'flex', flexDirection: 'column' }}>
								<Box component="b" sx={{ fontSize: 14, color: done || current ? DESK.ink : DESK.faint }}>
									{step.title}
								</Box>
								{sub ? (
									<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
										{sub}
									</Box>
								) : null}
							</Box>
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}
