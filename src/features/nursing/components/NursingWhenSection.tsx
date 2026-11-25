// src/features/nursing/components/NursingWhenSection.tsx
//
// Step 3 of the booking page: when. "Book now" (a provider as soon as possible) or "Schedule for later": the SAME shared DateSlotPicker the doctor booking flow
// uses (week strip + "Select Time" grid), in its multi-day mode so up to 7 days of the next 14 can be picked (a repeat visit), with the hourly times of the day
// (7 AM - 9 PM). With more than one day the patient chooses the same time every day or a time per day. A time that starts less than an hour from now (to the
// second, Mumbai's clock) is greyed out and cannot be picked, like the native app.
import { Box } from '@mui/material'
import { toast } from 'react-toastify'
import { useEffect, useMemo, useState } from 'react'
import { DESK } from '../../../styles/deskTokens'
import DateSlotPicker from '../../../components/common/DateSlotPicker/DateSlotPicker'
import { slotGroupsFromTimes } from '../../../components/common/DateSlotPicker/slotGroups'
import AppSegmentedToggle, { type SegmentedToggleOption } from '../../../components/common/Switch/AppSegmentedToggle'
import CartSection from '../../booking/CartSection'
import { plural, toIso } from '../../booking/bookingFormat'
import type { BookingMode } from '../nursingBookingStore'
import { MAX_VISITS } from '../nursingService'
import { SLOT_GROUPS, chipTime, dayLabel, istTodayIso, leadText, minutesOf, slotTooSoon } from '../nursingTime'
import { useCareService } from '../useCareService'
import { browserOutsideIndia } from '../../../utils/istTime'

const ALL_TIMES = SLOT_GROUPS.flatMap((g) => g.slots)

const dateOf = (iso: string) => {
	const [y, m, d] = iso.split('-').map(Number)
	return new Date(y, m - 1, d)
}

interface NursingWhenSectionProps {
	mode: BookingMode
	onMode: (mode: BookingMode) => void
	dates: string[]
	onDates: (dates: string[]) => void
	sameTime: boolean
	onSameTime: (same: boolean) => void
	time: string | null
	onTime: (time: string) => void
	timesByDate: Record<string, string>
	onDayTime: (date: string, time: string) => void
	/** Minutes before a visit within which it cannot be booked (60). */
	leadMinutes: number
	/** How long one visit lasts (the services added up): a time that would end after midnight is not offered. */
	visitMinutes: number
}

const pillSx = (on: boolean) =>
	({
		height: 38,
		px: '14px',
		borderRadius: '9999px',
		border: `1.5px solid ${on ? DESK.primary : DESK.lineChoice}`,
		bgcolor: on ? DESK.primaryTint : DESK.raised,
		color: on ? DESK.primary : DESK.ink,
		fontFamily: 'inherit',
		fontSize: 13,
		fontWeight: 800,
		cursor: 'pointer',
	}) as const

export default function NursingWhenSection({ mode, onMode, dates, onDates, sameTime, onSameTime, time, onTime, timesByDate, onDayTime, leadMinutes, visitMinutes }: NursingWhenSectionProps) {
	const care = useCareService()
	const MODES: SegmentedToggleOption<BookingMode>[] = [
		{ value: 'now', label: 'Book now' },
		{ value: 'later', label: 'Schedule for later' },
	]

	// The slots that are "too soon" change as the minutes pass: refresh every 15 seconds like the app.
	const [now, setNow] = useState(() => new Date())
	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 15_000)
		return () => clearInterval(id)
	}, [])

	const [activeDay, setActiveDay] = useState<string | null>(null)
	const editingDay = !sameTime ? (dates.includes(activeDay ?? '') ? (activeDay as string) : dates[0]) : null
	const picked = sameTime ? time : editingDay ? (timesByDate[editingDay] ?? null) : null

	const toggleDay = (iso: string) => {
		if (dates.includes(iso)) {
			onDates(dates.filter((d) => d !== iso))
			return
		}
		if (dates.length >= MAX_VISITS) {
			toast.info(`You can pick up to ${MAX_VISITS} days.`)
			return
		}
		onDates([...dates, iso].sort())
	}

	// the days a picked time must work for: every picked day (same time), or just the day being set
	const tooSoonDays = sameTime ? dates : editingDay ? [editingDay] : []
	const slotGroups = useMemo(
		() =>
			slotGroupsFromTimes(
				ALL_TIMES,
				// too soon, or a visit that would run past midnight (the end time cannot be after 23:59)
				(t) => minutesOf(t) + visitMinutes > 24 * 60 - 1 || tooSoonDays.some((d) => slotTooSoon(d, minutesOf(t), leadMinutes, now))
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[tooSoonDays.join(','), leadMinutes, now, visitMinutes]
	)

	const pickedDates = useMemo(() => dates.map(dateOf), [dates])
	const calendarDay = editingDay ? dateOf(editingDay) : (pickedDates[0] ?? dateOf(istTodayIso(now)))

	return (
		<CartSection
			step={3}
			title={`When should the ${care.noun} come?`}
			sub={mode === 'now' ? `A nearby ${care.noun} accepts your request and comes as soon as possible.` : `Pick up to ${MAX_VISITS} days in the next 14. A ${care.noun} is assigned ${leadText(leadMinutes)} before each visit.`}
		>
			{/* in a row, so it is as wide as its two options (the section stacks its children full-width) */}
			<Box sx={{ display: 'flex' }}>
				<AppSegmentedToggle variant="pill" fullWidth={false} equalWidth value={mode} onChange={onMode} options={MODES} />
			</Box>

			{mode === 'now' ? (
				<Box component="span" sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.primarySoft, color: DESK.ink, fontSize: 14, lineHeight: '20px' }}>
					Now · as soon as possible. We ask nearby {care.nouns}; the first to accept comes to you. You can add a tip while we search, and nothing is charged until after the visit.
				</Box>
			) : (
				<>
					{dates.length > 1 ? (
						<>
							<Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
								<Box component="button" type="button" onClick={() => onSameTime(true)} sx={pillSx(sameTime)}>
									Same time daily
								</Box>
								<Box component="button" type="button" onClick={() => onSameTime(false)} sx={pillSx(!sameTime)}>
									Different times
								</Box>
							</Box>
							{!sameTime ? (
								<Box role="tablist" aria-label="Day to set a time for" sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
									{dates.map((d) => (
										<Box key={d} component="button" type="button" role="tab" aria-selected={d === editingDay} onClick={() => setActiveDay(d)} sx={pillSx(d === editingDay)}>
											{dayLabel(d, now).replace(/^(Today|Tomorrow), /, '')}
											{timesByDate[d] ? ` · ${chipTime(timesByDate[d])}` : ''}
										</Box>
									))}
								</Box>
							) : null}
						</>
					) : null}

					<DateSlotPicker
						selectedDate={calendarDay}
						onDateChange={(date) => toggleDay(toIso(date))}
						selectedDates={pickedDates}
						onDateToggle={(date) => toggleDay(toIso(date))}
						selectedTime={picked ?? ''}
						// a second click on the picked time would clear it: the booking keeps it
						onTimeChange={(t) => {
							if (!t) return
							if (sameTime) onTime(t)
							else if (editingDay) onDayTime(editingDay, t)
						}}
						dateLabel={dates.length === 0 ? 'Which days?' : `Which days? · ${plural(dates.length, 'day', 'days')} picked`}
						timeLabel="What time?"
						maxDaysAhead={14}
						// India's date, not the browser's: the day grid and the 14-day window must match what the server accepts
						today={dateOf(istTodayIso())}
						timeSlotColumns={5}
						hideLegend
						// no times to pick until a day is picked
						availableSlots={dates.length > 0 ? slotGroups : undefined}
					/>
					{browserOutsideIndia() ? (
						<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
							Times are in India Standard Time (IST), not your device's time zone.
						</Box>
					) : null}
					{dates.length === 0 ? (
						<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
							Pick one day, or several for a repeat visit, to see the times.
						</Box>
					) : null}
				</>
			)}
		</CartSection>
	)
}
