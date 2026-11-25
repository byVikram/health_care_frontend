// src/features/nursing/nursingTime.ts
//
// The clock rules of a nursing visit, the way the server counts them (the native app's utils/visitSlots.ts): days are counted in Mumbai
// (IST, +05:30, no daylight saving) whatever zone the browser is in, a slot today must start at least the lead time (60 minutes) from now
// to the second, and the day's slots are hourly from 7 AM to 9 PM in Morning / Afternoon / Evening groups.
import { istSecondsNow, istTodayIso } from '../../utils/istTime'
import { commaDate, longDate, timeLabel, toIso } from '../booking/bookingFormat'
import { BOOKING_WINDOW_DAYS } from './nursingService'

// the India-time helpers are shared with the Lab flow (utils/istTime.ts); they are re-exported here for the home-care files that import them from this file
export { istTodayIso, istSecondsNow }

/** The booking window: today and the next 13 days in Mumbai, as 'YYYY-MM-DD'. */
export const bookingDays = (now: Date = new Date()): string[] => {
	const [y, m, d] = istTodayIso(now).split('-').map(Number)
	return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => toIso(new Date(y, m - 1, d + i)))
}

/** "HH:MM" for minutes since midnight (clamped to the end of the day). */
export const hhmm = (minutes: number): string => {
	const m = Math.min(Math.max(minutes, 0), 23 * 60 + 59)
	return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** Minutes since midnight for "HH:MM". */
export const minutesOf = (value: string): number => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5))

/**
 * A slot is too soon when it starts less than `leadMinutes` after now, in Mumbai time to the second: at 11:45 the 12:00 and 12:30 slots
 * are too soon and 1 PM is the first that can be picked.
 */
export const slotTooSoon = (iso: string, startMinutes: number, leadMinutes: number, now: Date = new Date()): boolean => {
	const today = istTodayIso(now)
	// a day that has already passed in India is always too soon (a browser behind India can still show it as today)
	if (iso < today) return true
	if (iso > today) return false
	return startMinutes * 60 < istSecondsNow(now) + leadMinutes * 60
}

export type SlotGroup = { label: string; slots: string[] }

/** The day's slots (7 AM - 9 PM, hourly), grouped. */
export const SLOT_GROUPS: SlotGroup[] = [
	{ label: 'Morning', fromHour: 7, toHour: 11 },
	{ label: 'Afternoon', fromHour: 12, toHour: 16 },
	{ label: 'Evening', fromHour: 17, toHour: 21 },
].map((g) => ({ label: g.label, slots: Array.from({ length: g.toHour - g.fromHour + 1 }, (_, i) => hhmm((g.fromHour + i) * 60)) }))

/** "7 PM" / "7:30 PM" (the chip label). */
export const chipTime = (value: string): string => timeLabel(value).replace(':00', '')

/** "7:00 – 7:45 PM" / "11:30 AM – 12:15 PM". */
export const rangeLabel = (start: string, end?: string | null): string => {
	const from = timeLabel(start)
	if (!end) return from
	const to = timeLabel(end)
	return from.slice(-2) === to.slice(-2) ? `${from.slice(0, -3)} – ${to}` : `${from} – ${to}`
}

/** "Today, Thu 25 Sep" / "Tomorrow, Fri 26 Sep" / "Sat 27 Sep". */
export const dayLabel = (iso: string, now: Date = new Date()): string => {
	const today = istTodayIso(now)
	if (iso === today) return `Today, ${longDate(iso)}`
	const [y, m, d] = today.split('-').map(Number)
	if (iso === toIso(new Date(y, m - 1, d + 1))) return `Tomorrow, ${longDate(iso)}`
	return longDate(iso)
}

/** "1 hr" / "2 hrs" / "45 min". */
export const leadText = (minutes: number): string => {
	if (minutes % 60 === 0) {
		const h = minutes / 60
		return `${h} hr${h === 1 ? '' : 's'}`
	}
	return `${minutes} min`
}

/** "6:00 PM today" / "6:00 PM, Fri": when a nurse is assigned to the visit that starts at `start` on `date`. */
export const assignedAtLabel = (date: string, start: string, leadMinutes: number, now: Date = new Date()): string => {
	const at = minutesOf(start) - leadMinutes
	const dayShift = at < 0 ? -1 : 0
	const clock = timeLabel(hhmm(((at % 1440) + 1440) % 1440))
	const [y, m, d] = date.split('-').map(Number)
	const iso = toIso(new Date(y, m - 1, d + dayShift))
	return iso === istTodayIso(now) ? `${clock} today` : `${clock}, ${commaDate(iso).split(',')[0]}`
}
