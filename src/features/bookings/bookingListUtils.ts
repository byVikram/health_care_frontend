// src/features/bookings/bookingListUtils.ts
//
// Pure helpers for the My bookings page: grouping (upcoming by day bucket, past by month), the "when" line, the status tone, the
// category tiles and the doctor-appointment rules. Ported from the mobile app's bookingListUtils.
import { DESK_ICONS, DESK_TILES, type DeskTone } from '../../styles/deskTokens'
import type { BookingCategory, BookingItem, BookingsCategoryFilter, BookingsWhen } from './bookingsTypes'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_LONG = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]
const DAY_MS = 86_400_000

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
/** Whole calendar days from `from` to `d`; negative when `d` is in the past. */
const dayDiff = (d: Date, from = new Date()) =>
	Math.round((startOfDay(d).getTime() - startOfDay(from).getTime()) / DAY_MS)
const formatClock = (d: Date) =>
	`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`

const relativeDayLabel = (d: Date) => {
	const diff = dayDiff(d)
	if (diff === 0) return 'Today'
	if (diff === 1) return 'Tomorrow'
	return `${DOW[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}

/** A local Date for a 'YYYY-MM-DD' date and an optional 'HH:mm[:ss]' time. */
const combineDateTime = (date?: string | null, time?: string | null): Date | null => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? '')
	if (!match) return null
	const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
	const t = /^(\d{1,2}):(\d{2})/.exec(time ?? '')
	if (t) d.setHours(Number(t[1]), Number(t[2]), 0, 0)
	return d
}

/**
 * starts_at as a local Date. A naive ISO ("2026-09-26T07:00:00", clinic-local) or a date-only value is read as local time; a value
 * with a zone ("…Z" / "+05:30") goes through Date.
 */
export const parseStartsAt = (value?: string | null): { date: Date; hasTime: boolean } | null => {
	if (!value) return null
	const rest = value.slice(10)
	if (/(z|[+-]\d{2}:?\d{2})$/i.test(rest)) {
		const d = new Date(value)
		return Number.isNaN(d.getTime()) ? null : { date: d, hasTime: true }
	}
	const [datePart, timePart] = value.split(/[T ]/)
	const d = combineDateTime(datePart, timePart)
	return d ? { date: d, hasTime: !!timePart } : null
}

/** Server label first ("Fri 26 Sep, 7–9 AM"), else "Today, 5:30 PM" / "Sat 27 Sep, 8:30 PM" from starts_at. */
export const whenLabel = (item: BookingItem): string | undefined => {
	if (item.time_label) return item.time_label
	const start = parseStartsAt(item.starts_at)
	if (!start) return undefined
	const day = relativeDayLabel(start.date)
	return start.hasTime ? `${day}, ${formatClock(start.date)}` : day
}

/** "For Asha (Daughter)" for a booking made for a family member; nothing for the patient's own. */
export const patientLabel = (item: BookingItem): string | undefined => {
	const p = item.patient
	if (!p?.name) return undefined
	const rel = p.relation?.trim()
	return rel && rel.toLowerCase() !== 'self' ? `For ${p.name} (${rel})` : `For ${p.name}`
}

export type BookingSection = { title: string; data: BookingItem[] }

const UPCOMING_ORDER = ['TODAY', 'TOMORROW', 'LATER THIS WEEK', 'LATER', 'IN PROGRESS']

const upcomingBucket = (item: BookingItem, now: Date) => {
	const start = parseStartsAt(item.starts_at)
	if (!start) return 'IN PROGRESS'
	const diff = dayDiff(start.date, now)
	if (diff < 0) return 'IN PROGRESS'
	if (diff === 0) return 'TODAY'
	if (diff === 1) return 'TOMORROW'
	if (diff <= 6) return 'LATER THIS WEEK'
	return 'LATER'
}

const pastBucket = (item: BookingItem) => {
	const start = parseStartsAt(item.starts_at)
	if (!start) return 'EARLIER'
	return `${MONTH_LONG[start.date.getMonth()].toUpperCase()} ${start.date.getFullYear()}`
}

/**
 * Upcoming: TODAY / TOMORROW / LATER THIS WEEK (next 2-6 days) / LATER, and IN PROGRESS for items without a time. Past: one section
 * per month ("SEPTEMBER 2026"), newest first as the server sorts them; EARLIER last.
 */
export function groupBookings(items: BookingItem[], when: BookingsWhen, now = new Date()): BookingSection[] {
	const map = new Map<string, BookingItem[]>()
	for (const item of items) {
		const title = when === 'upcoming' ? upcomingBucket(item, now) : pastBucket(item)
		const list = map.get(title)
		if (list) list.push(item)
		else map.set(title, [item])
	}
	const keys = [...map.keys()]
	const titles =
		when === 'upcoming'
			? UPCOMING_ORDER.filter((t) => map.has(t))
			: [...keys.filter((t) => t !== 'EARLIER'), ...keys.filter((t) => t === 'EARLIER')]
	return titles.map((title) => ({ title, data: map.get(title) ?? [] }))
}

/** The server labels a doctor appointment the doctor marked as missed "No-show" (tone 'done'). */
export const isNoShowLabel = (label?: string | null): boolean => /^no[\s_-]?show\b/i.test((label ?? '').trim())

/**
 * The chip tone for a booking's status: the server's tone, except a cancelled / rejected booking is red (the server only says "done"
 * for every closed booking, so those are told apart by their label) and a missed appointment is amber.
 */
export const statusTone = (status: { label: string; tone: string }): DeskTone => {
	if (/^(cancelled|rejected)\b/i.test(status.label)) return 'bad'
	if (isNoShowLabel(status.label)) return 'wait'
	switch (status.tone) {
		case 'ok':
			return 'ok'
		case 'wait':
			return 'wait'
		case 'move':
			return 'move'
		default:
			return 'done'
	}
}

/** The category rail, in the design's order: label, the tile colours and the icon. */
export const CATEGORY_RAIL: {
	id: BookingsCategoryFilter
	label: string
	icon: string
	tile: { bg: string; ink: string }
}[] = [
	{ id: 'all', label: 'All', icon: DESK_ICONS.grid, tile: DESK_TILES.all },
	{ id: 'doctor', label: 'Doctor', icon: DESK_ICONS.stethoscope, tile: DESK_TILES.doctor },
	{ id: 'ancillary', label: 'Home care', icon: DESK_ICONS.homeCare, tile: DESK_TILES.care },
	{ id: 'lab', label: 'Lab', icon: DESK_ICONS.lab, tile: DESK_TILES.lab },
	{ id: 'pharmacy', label: 'Pharmacy', icon: DESK_ICONS.pill, tile: DESK_TILES.pharmacy },
]

/** Tile colours and icon of a booking's own category. */
export const categoryLook = (category: BookingCategory) =>
	CATEGORY_RAIL.find((c) => c.id === category) ?? CATEGORY_RAIL[0]

/** The kind of note: amber for home care and lab (a preparation instruction), teal for the rest. */
export const noteColours = (category: BookingCategory) =>
	category === 'ancillary' || category === 'lab' ? { bg: '#FDF1DC', fg: '#8A5300' } : { bg: '#F0F7F7', fg: '#2B6F71' }

/** "Indiranagar clinic · 1.2 km" -> "Indiranagar clinic" (the distance is not part of the place). */
export const placeOf = (where?: string | null): string =>
	(where ?? '').replace(/\s*·\s*[\d.,]+\s*(km|m)\s*$/i, '').trim()

/** A Google Maps search for a place, for the "Get directions" button. */
export const mapsUrl = (place: string): string =>
	`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`

/** A stable key for a booking (an id alone can repeat across categories). */
export const bookingKey = (item: BookingItem): string => `${item.category}:${item.id}`

/**
 * A doctor appointment the patient can still change: not closed (the server's tone is "done" for every closed booking: completed,
 * cancelled, missed). Only these get Reschedule and Cancel.
 */
export const isChangeableAppointment = (item: BookingItem): boolean =>
	item.category === 'doctor' && item.target?.type === 'appointment' && item.status.tone !== 'done'
