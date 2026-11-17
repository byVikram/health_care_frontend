// src/features/schedule/scheduleUtils.ts
//
// The pure helpers of the doctor's Schedule page, ported from the native app (health_care_mobile features/doctor/scheduleUtils.ts).
// What a status means, which appointments are requests, how long until a slot, and the small date / time wording. The status rules and
// the clinic clock that already exist for the older appointments list live in ../doctor/appointmentRules and are reused, not copied.
import type { Appointment } from '../../types/appointment'
import { clinicTodayIso } from '../doctor/appointmentRules'

export const statusLabelOf = (apt: Appointment): string =>
	typeof apt.status === 'string' ? apt.status : (apt.status?.label ?? 'pending')

const labelOf = (apt: Appointment): string => statusLabelOf(apt).toLowerCase()

export const isPending = (apt: Appointment): boolean => labelOf(apt) === 'pending'

/** A reschedule the doctor still has to answer: a patient's request to move a booking (one the doctor asked for waits on the patient). */
export const isRescheduleRequest = (apt: Appointment): boolean =>
	labelOf(apt) === 'rescheduled' && (apt.rescheduled_by ?? '').toLowerCase() !== 'doctor'

/** What the Booking requests column lists: a new pending request, or a patient's reschedule request. */
export const isRequestLike = (apt: Appointment): boolean => isPending(apt) || isRescheduleRequest(apt)

/** The patient marked their symptoms severe: a "red flag" on a request. */
export const isUrgentRequest = (apt: Appointment): boolean =>
	apt.pre_intake?.severity === 'severe' || apt.severity === 'severe'

export const isVideoMode = (mode?: string | null): boolean => mode === 'video_call' || mode === 'video call'

/**
 * The status to show (and to offer Check in on) for a confirmed appointment on its own day: "not_arrived", even when the row still says
 * "confirmed" (the daily not-arrived job may not have run yet). The server's check-in accepts a same-day confirmed appointment.
 */
export const effectiveStatusLabel = (apt: Appointment): string => {
	const label = labelOf(apt)
	return label === 'confirmed' && apt.appointment_date === clinicTodayIso() ? 'not_arrived' : label
}

// ── clinic clock ─────────────────────────────────────────────────────────────────────────────────────

const CLINIC_UTC_OFFSET_MINUTES = 330

/** Minutes from now to a TODAY appointment's start on the clinic's clock (negative once it has started); null for any other day. */
export function minutesUntilStart(apt: Appointment): number | null {
	if (apt.appointment_date !== clinicTodayIso() || !apt.start_time) return null
	const [h, m] = apt.start_time.split(':').map(Number)
	const clock = new Date(Date.now() + CLINIC_UTC_OFFSET_MINUTES * 60_000).toISOString().slice(11, 16)
	const [nh, nm] = clock.split(':').map(Number)
	if ([h, m, nh, nm].some(Number.isNaN)) return null
	return h * 60 + m - (nh * 60 + nm)
}

/** "12 min", "1h 30m": a length of time in minutes. */
export function formatMinutes(total: number): string {
	const mins = Math.abs(Math.round(total))
	if (mins < 60) return `${mins} min`
	const h = Math.floor(mins / 60)
	const m = mins % 60
	return m ? `${h}h ${m}m` : `${h}h`
}

// ── dates and words ──────────────────────────────────────────────────────────────────────────────────

const DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const parseIso = (iso: string): Date => new Date(`${iso}T00:00:00`)

/** "Fri 26 Sep" for a YYYY-MM-DD (the date itself when it cannot be read). */
export function dateLabelOf(iso: string): string {
	const d = parseIso(iso)
	if (Number.isNaN(d.getTime())) return iso
	return `${DOW_SHORT[d.getDay()]} ${d.getDate()} ${MON_SHORT[d.getMonth()]}`
}

/** "4:00 PM" */
export const formatTime12h = (t?: string | null): string => {
	if (!t) return '--'
	const [h, m] = t.split(':').map(Number)
	const suffix = h >= 12 ? 'PM' : 'AM'
	const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
	return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

/** "4:00 PM" -> { time: '4:00', ampm: 'PM' } for the two-line time cell of a row. */
export function splitTime(t?: string | null): { time: string; ampm: string } {
	const [time, ampm] = formatTime12h(t).split(' ')
	return { time, ampm: ampm ?? '' }
}

export const toApiDate = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

/** The first and last day (YYYY-MM-DD) of a month (0-based). */
export function monthRange(year: number, month: number): { start: string; end: string } {
	return { start: toApiDate(new Date(year, month, 1)), end: toApiDate(new Date(year, month + 1, 0)) }
}

/** "Today, 8:00 PM" / "Fri 26 Sep, 10:30 AM": the slot of a request card. */
export function slotWhenOf(apt: Appointment): string {
	const time = formatTime12h(apt.start_time)
	return apt.appointment_date === clinicTodayIso()
		? `Today, ${time}`
		: `${dateLabelOf(apt.appointment_date)}, ${time}`
}

/** "RT" for "Ramesh T." */
export function initialsOf(name?: string | null): string {
	const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
	if (words.length === 0) return '?'
	return words
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase()
}

/** "48 M" (age and the first letter of the gender), '' when neither is known. */
export function ageGenderOf(apt: Appointment): string {
	const age = apt.patient?.age ? String(apt.patient.age) : ''
	const gender = (apt.patient?.gender ?? '').trim().charAt(0).toUpperCase()
	return [age, gender].filter(Boolean).join(' ')
}

/** What the patient gave as the reason for the visit (the symptoms they wrote). */
export const reasonOf = (apt: Appointment): string => (apt.pre_intake?.symptoms ?? apt.symptoms ?? '').trim()

export const longGenderOf = (apt: Appointment): string => (apt.patient?.gender ?? '').trim()
