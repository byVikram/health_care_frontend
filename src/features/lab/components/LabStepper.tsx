// src/features/lab/components/LabStepper.tsx
//
// The 3-step "Cart & slot / Review & pay / Booked" stepper at the top of the checkout pages: the current step is a filled teal circle with
// its number, a finished one a teal circle with a check, a coming one an outlined grey circle; a line joins the steps (teal once passed).
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'

const STEPS = ['Cart & slot', 'Review & pay', 'Booked'] as const

interface LabStepperProps {
	/** The step the page is on (1 = Cart & slot, 2 = Review & pay, 3 = Booked). */
	current: 1 | 2 | 3
}

export default function LabStepper({ current }: LabStepperProps) {
	return (
		<Box
			role="list"
			aria-label="Booking steps"
			sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
		>
			{STEPS.map((label, index) => {
				const number = index + 1
				const done = number < current
				const active = number === current
				return (
					<Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						{index > 0 ? (
							<Box
								component="span"
								sx={{ width: 64, height: 2, bgcolor: number <= current ? DESK.primary : DESK.lineStrong }}
							/>
						) : null}
						<Box
							role="listitem"
							aria-current={active ? 'step' : undefined}
							sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}
						>
							<Box
								component="span"
								sx={{
									width: 28,
									height: 28,
									boxSizing: 'border-box',
									borderRadius: '9999px',
									bgcolor: done || active ? DESK.primary : DESK.raised,
									border: `2px solid ${done || active ? DESK.primary : '#C9D6D7'}`,
									color: done || active ? '#FFFFFF' : DESK.faint,
									fontSize: 13,
									fontWeight: 800,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								{done ? <DeskIcon d={DESK_ICONS.check} size={14} strokeWidth={3} /> : number}
							</Box>
							<Box component="b" sx={{ fontSize: 14, color: done || active ? DESK.ink : DESK.faint }}>
								{label}
							</Box>
						</Box>
					</Box>
				)
			})}
		</Box>
	)
}
