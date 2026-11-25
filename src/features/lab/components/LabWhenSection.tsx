// src/features/lab/components/LabWhenSection.tsx
//
// Step 3 of the cart page: the day and the time. It is the SAME shared DateSlotPicker the doctor booking flow uses (the week strip, "Select Time" and the
// Morning / Afternoon / Evening grid), fed with the next 14 days and the chosen lab's free times of the day (from GET /api/laboratory/slots). A fasting hint
// shows when the cart has a fasting test. Picking a time is what completes the booking's lab + slot.
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import DeskButton from '../../../components/common/Button/DeskButton'
import DateSlotPicker from '../../../components/common/DateSlotPicker/DateSlotPicker'
import { slotGroupsFromTimes } from '../../../components/common/DateSlotPicker/slotGroups'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import CartSection from '../../booking/CartSection'
import { browserOutsideIndia } from '../../../utils/istTime'

const hourOf = (hhmm: string) => Number(hhmm.split(':')[0])

const dateOf = (iso: string) => {
	const [y, m, d] = iso.split('-').map(Number)
	return new Date(y, m - 1, d)
}

interface LabWhenSectionProps {
	sub: string
	/** 'YYYY-MM-DD' for each day offered; the first is today. */
	days: string[]
	dayIdx: number
	onDay: (index: number) => void
	/** The cart has a test that needs fasting. */
	fasting: boolean
	/** A lab is chosen (there is nothing to list before that). */
	hasLab: boolean
	times: string[]
	loading: boolean
	error: string | null
	onRetry: () => void
	/** 'HH:MM' of the picked time when it is the chosen lab on the chosen day. */
	selectedTime: string | null
	onPick: (time: string) => void
}

export default function LabWhenSection({ sub, days, dayIdx, onDay, fasting, hasLab, times, loading, error, onRetry, selectedTime, onPick }: LabWhenSectionProps) {
	const late = fasting && !!selectedTime && hourOf(selectedTime) >= 11
	const selectedDate = dateOf(days[dayIdx] ?? days[0])

	return (
		<CartSection step={3} title="When?" sub={sub}>
			{fasting ? (
				<Box
					component="span"
					sx={{ p: '10px 12px', borderRadius: '10px', bgcolor: late ? DESK.dangerSoft : DESK.warningSoft, color: late ? DESK.danger : DESK.warning, fontSize: 13, lineHeight: '18px', display: 'flex', gap: '8px' }}
				>
					<Box component="span" sx={{ display: 'flex', flexShrink: 0 }}>
						<DeskIcon d={DESK_ICONS.clock} size={16} />
					</Box>
					{late ? 'Your cart has a fasting test. This time means a long fast. A slot before 11 AM is better.' : 'Your cart has a fasting test. A morning slot is best.'}
				</Box>
			) : null}

			{error && hasLab ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
					<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
						{error}
					</Box>
					<Box sx={{ width: 140 }}>
						<DeskButton label="Try again" kind="secondary" size="md" onClick={onRetry} />
					</Box>
				</Box>
			) : (
				<DateSlotPicker
					selectedDate={selectedDate}
					onDateChange={(date) => {
						const index = days.findIndex((iso) => dateOf(iso).getTime() === new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime())
						if (index >= 0) onDay(index)
					}}
					selectedTime={selectedTime ?? ''}
					// a second click on the picked time would clear it: the booking keeps it
					onTimeChange={(time) => {
						if (time) onPick(time)
					}}
					dateLabel=""
					timeLabel="Select Time"
					rollingDays={days.length}
					// India's today (the first day offered), not the browser's
					today={dateOf(days[0])}
					timeSlotColumns={5}
					hideLegend
					slotsLoading={hasLab && loading}
					// without a lab there are no times to list yet: the days still show
					availableSlots={hasLab ? slotGroupsFromTimes(times) : undefined}
				/>
			)}

			{browserOutsideIndia() ? (
				<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
					Times are in India Standard Time (IST), not your device's time zone.
				</Box>
			) : null}

			{!hasLab ? (
				<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
					Choose a lab above to see its times.
				</Box>
			) : null}
		</CartSection>
	)
}
