// src/features/schedule/scheduleView.ts
//
// How an appointment is drawn on the Schedule page: which state its row is in (seen, no-show, late, in consultation ...), the chip's
// wording and tone, the one main button, and which entries its three-dots menu offers. Pure functions; the page and ScheduleRow only draw.
import type { Appointment } from '../../types/appointment'
import type { Referral } from '../../types/referral'
import type { DeskTone } from '../../styles/deskTokens'
import { DESK_ICONS } from '../../styles/deskTokens'
import {
	ACCEPTED_STATUSES,
	NO_SHOW_SOURCE_STATUSES,
	RESCHEDULE_ASK_STATUSES,
	noShowWindow,
} from '../doctor/appointmentRules'
import {
	ageGenderOf,
	formatMinutes,
	initialsOf,
	isVideoMode,
	minutesUntilStart,
	reasonOf,
	splitTime,
	statusLabelOf,
} from './scheduleUtils'

export type RowState = 'done' | 'noshow' | 'referred' | 'cancelled' | 'moved' | 'now' | 'waiting' | 'late' | 'confirmed'

/** The states that are finished: they sit in the folded "Earlier today / Finished" group. */
const FINISHED: RowState[] = ['done', 'noshow', 'referred', 'cancelled', 'moved']

export type RowMainKind = 'checkIn' | 'startVideo' | 'startConsult' | 'open'

export interface RowMain {
	kind: RowMainKind
	label: string
	icon?: string
	/** White with a grey outline (Check in) instead of teal. */
	secondary: boolean
}

export interface ScheduleRowVM {
	id: string
	appt: Appointment
	time: string
	ampm: string
	name: string
	initials: string
	/** "48 M · Diabetes follow-up" */
	sub: string
	video: boolean
	state: RowState
	label: string
	tone: DeskTone
	finished: boolean
	main: RowMain | null
	/** Menu entries offered. */
	canAskReschedule: boolean
	canMarkNoShow: boolean
	noShowOpen: boolean
	noShowHint: string
	canCancel: boolean
	canOpenSummary: boolean
}

const OTHER_LISTED = ['completed', 'no_show', 'cancelled', 'reschedule_required']

/**
 * Whether the appointment belongs in the day list: one the doctor has accepted or that is over. A new request (pending) or a patient's
 * reschedule request is answered in the Booking requests column, not here; a request that was referred is closed and listed as Referred.
 */
export function isListed(apt: Appointment, referred: Record<string, Referral> | null): boolean {
	const label = statusLabelOf(apt).toLowerCase()
	return ACCEPTED_STATUSES.includes(label) || OTHER_LISTED.includes(label) || !!referred?.[apt.id]
}

const dayOf = (apt: Appointment) => apt.appointment_date

export function buildRowVM(
	apt: Appointment,
	referred: Record<string, Referral> | null,
	todayIso: string
): ScheduleRowVM {
	const label = statusLabelOf(apt).toLowerCase()
	const isToday = dayOf(apt) === todayIso
	const isPast = dayOf(apt) < todayIso
	const isReferred = !!referred?.[apt.id] && label !== 'completed' && label !== 'cancelled'
	const video = isVideoMode(apt.appointment_mode)
	const window = noShowWindow(apt)
	// A confirmed / not-arrived visit whose day is over, and whose no-show window has closed, reads as the no-show it became.
	const pastAndClosed =
		isPast && NO_SHOW_SOURCE_STATUSES.includes(label) && !window.canMark && window.hint.startsWith('No-show')

	let state: RowState
	let text = ''
	if (label === 'completed') state = 'done'
	else if (label === 'cancelled') state = 'cancelled'
	else if (isReferred) state = 'referred'
	else if (label === 'no_show' || pastAndClosed) state = 'noshow'
	else if (label === 'reschedule_required') state = 'moved'
	else if (label === 'checked_in') state = apt.access_verified ? 'now' : 'waiting'
	else {
		const away = minutesUntilStart(apt)
		state = isToday && away !== null && away < 0 ? 'late' : 'confirmed'
		if (state === 'late' && away !== null) text = `Not arrived · ${formatMinutes(away)} late`
	}

	const wording: Record<RowState, { label: string; tone: DeskTone }> = {
		done: { label: 'Seen', tone: 'ok' },
		noshow: { label: 'No-show', tone: 'wait' },
		referred: { label: 'Referred', tone: 'lilac' },
		cancelled: { label: 'Cancelled', tone: 'bad' },
		moved: { label: 'Reschedule asked', tone: 'move' },
		now: { label: 'In consultation', tone: 'move' },
		waiting: { label: 'Checked in', tone: 'ok' },
		late: { label: text || 'Not arrived', tone: 'bad' },
		confirmed: { label: 'Not arrived', tone: 'quiet' },
	}

	let main: RowMain | null = null
	if (isToday) {
		if (state === 'confirmed' || state === 'late') {
			main = video
				? { kind: 'startVideo', label: 'Start video', icon: DESK_ICONS.video, secondary: false }
				: { kind: 'checkIn', label: 'Check in', icon: DESK_ICONS.check, secondary: true }
		} else if (state === 'waiting') {
			main = { kind: 'startConsult', label: 'Start consult', icon: DESK_ICONS.user, secondary: false }
		} else if (state === 'now') {
			main = { kind: 'open', label: 'Open consultation →', secondary: false }
		} else if (state === 'noshow' && label === 'no_show') {
			// The patient came late: checking in lifts the no-show.
			main = { kind: 'checkIn', label: 'Check in', icon: DESK_ICONS.check, secondary: true }
		}
	}

	const open = state === 'confirmed' || state === 'late' || state === 'waiting'
	const age = ageGenderOf(apt)
	const reason = reasonOf(apt)
	const { time, ampm } = splitTime(apt.start_time)

	return {
		id: apt.id,
		appt: apt,
		time,
		ampm,
		name: apt.patient?.name ?? 'Patient',
		initials: initialsOf(apt.patient?.name),
		sub: [age, reason].filter(Boolean).join(' · '),
		video,
		state,
		label: wording[state].label,
		tone: wording[state].tone,
		finished: FINISHED.includes(state),
		main,
		canAskReschedule: open && RESCHEDULE_ASK_STATUSES.includes(label),
		canMarkNoShow: (state === 'confirmed' || state === 'late') && NO_SHOW_SOURCE_STATUSES.includes(label),
		noShowOpen: window.canMark,
		noShowHint: window.canMark ? 'The patient did not come' : window.hint,
		canCancel: open,
		canOpenSummary: state === 'done',
	}
}

// ── booking request cards ────────────────────────────────────────────────────────────────────────────

/** "70 yrs · Male · New request" / "Reschedule request" */
export function requestWho(apt: Appointment): string {
	const label = statusLabelOf(apt).toLowerCase()
	const kind = label === 'rescheduled' ? 'Reschedule request' : 'New request'
	const age = apt.patient?.age ? `${apt.patient.age} yrs` : null
	return [age, apt.patient?.gender, kind].filter(Boolean).join(' · ')
}

/** The date label of a day for the page title: "Today, Thu 25 Sep" / "Fri 26 Sep" / "Wed 24 Sep · past". */
export function dayHeading(iso: string, todayIso: string, dateLabel: string): string {
	if (iso === todayIso) return `Today, ${dateLabel}`
	return iso < todayIso ? `${dateLabel} · past` : dateLabel
}
