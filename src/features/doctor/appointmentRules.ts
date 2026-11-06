// src/features/doctor/appointmentRules.ts
//
// What a doctor can do to an appointment from the appointments list (check in, mark a no-show, cancel). The server decides
// every one of these and answers 400 with the reason; the rules here only decide which controls to offer.

import type { Appointment } from '../../types/appointment'

/** "Accepted" = the doctor has confirmed it (not_arrived / checked_in are the same booking on its own day). */
export const ACCEPTED_STATUSES = ['confirmed', 'not_arrived', 'checked_in']

/** The states the server lets a doctor ask the patient to reschedule from (not once the patient has asked for a new time, nor after check-in). */
export const RESCHEDULE_ASK_STATUSES = ['pending', 'confirmed', 'not_arrived']

/** What a click on an appointment card does. */
export type OpenAction =
	/** Straight into the consultation page. */
	| { kind: 'consultation' }
	/** Start the consultation: the server sends the patient the code, or lets the doctor in when it was already given. */
	| { kind: 'start' }
	/** Not possible yet: say why. */
	| { kind: 'blocked'; message: string }

const BLOCKED_MESSAGES: Record<string, string> = {
	pending: 'Accept the appointment before starting the consultation.',
	rescheduled: 'Confirm the new time the patient chose before starting the consultation.',
	reschedule_required: 'Waiting for the patient to choose a new time.',
	cancelled: 'This appointment was cancelled.',
}

/**
 * The one rule for what an appointment card opens (the click and the pointer cursor both read it). The code the patient already
 * gave lets the doctor straight back in, but only for a finished or accepted appointment, and a no-show the patient came late for
 * (same day) goes through `start`, because starting the consultation is what lifts the no-show.
 */
export function appointmentOpenAction(status: string, accessVerified: boolean, isToday: boolean): OpenAction {
	const s = status.toLowerCase()
	if (s === 'completed') return { kind: 'consultation' }
	if (ACCEPTED_STATUSES.includes(s)) return accessVerified ? { kind: 'consultation' } : { kind: 'start' }
	if (s === 'no_show') {
		return isToday ? { kind: 'start' } : { kind: 'blocked', message: 'This appointment was marked as a no-show.' }
	}
	return { kind: 'blocked', message: BLOCKED_MESSAGES[s] ?? 'This appointment cannot be started yet.' }
}

/** The only states the server lets a doctor mark a no-show from (a checked-in patient did show up). */
export const NO_SHOW_SOURCE_STATUSES = ['confirmed', 'not_arrived']

// Patient no-show policy: a no-show can be marked from 60 minutes after the start until 2 days after it.
export const NO_SHOW_MIN_MINUTES_AFTER_START = 60
export const NO_SHOW_MARK_WINDOW_DAYS = 2

export const CANCEL_REASONS = [
	'I have an emergency',
	'Running too late to see this patient',
	'Patient asked to cancel',
	'Other reason',
] as const

// Appointment dates and times are clinic wall-clock time (IST, UTC+05:30, no daylight saving), whatever the browser's zone is.
const CLINIC_UTC_OFFSET_MINUTES = 330

/** The clinic's current date (YYYY-MM-DD), in Indian time whatever time zone the computer is set to. */
export const clinicTodayIso = (): string =>
	new Date(Date.now() + CLINIC_UTC_OFFSET_MINUTES * 60_000).toISOString().slice(0, 10)

/** "Today", else "Tue, 10 Nov". */
export const dayLabel = (isoDate: string): string => {
	if (isoDate === clinicTodayIso()) return 'Today'
	const [y, m, d] = isoDate.split('-').map(Number)
	if (!y || !m || !d) return isoDate
	return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

const startMs = (apt: Appointment): number | null => {
	const [y, mo, d] = (apt.appointment_date ?? '').split('-').map(Number)
	const [h, mi] = (apt.start_time ?? '').split(':').map(Number)
	if (!y || !mo || !d || Number.isNaN(h) || Number.isNaN(mi)) return null
	return Date.UTC(y, mo - 1, d, h, mi) - CLINIC_UTC_OFFSET_MINUTES * 60_000
}

export type NoShowWindow = {
	/** "Mark as no-show" can be used right now. */
	canMark: boolean
	/** Why not, shown under the disabled control; empty while it is enabled. */
	hint: string
}

/** Whether a no-show may be marked now (the clock against the appointment's start, in clinic time). */
export function noShowWindow(apt: Appointment, now: Date = new Date()): NoShowWindow {
	const start = startMs(apt)
	const tooEarly = { canMark: false, hint: 'Can be marked 1 hour after the start' }
	if (start === null) return tooEarly
	if (now.getTime() < start + NO_SHOW_MIN_MINUTES_AFTER_START * 60_000) return tooEarly
	if (now.getTime() > start + NO_SHOW_MARK_WINDOW_DAYS * 24 * 60 * 60_000) {
		return { canMark: false, hint: `No-show can only be marked within ${NO_SHOW_MARK_WINDOW_DAYS} days` }
	}
	return { canMark: true, hint: '' }
}

const STATUS_TEXT: Record<string, string> = {
	not_arrived: 'Not arrived',
	checked_in: 'Checked in',
	confirmed: 'Confirmed',
	completed: 'Completed',
	pending: 'Pending',
	cancelled: 'Cancelled',
	rescheduled: 'Rescheduled',
	reschedule_required: 'Reschedule needed',
	no_show: 'No-show',
}

/** The status as a plain phrase ("Not arrived"), never the raw snake_case label; a label already written for people is kept. */
export const humanizeStatus = (label: string): string => STATUS_TEXT[label.toLowerCase()] ?? label

/** Chip colours for a status. `waitingOnPatient`: the doctor moved it and the patient has to confirm. */
export function statusTone(label: string, waitingOnPatient: boolean): { bg: string; color: string } {
	if (waitingOnPatient) return { bg: '#fff3e0', color: '#e65100' }
	switch (label.toLowerCase()) {
		case 'cancelled':
			return { bg: '#ffeeee', color: '#e53935' }
		case 'confirmed':
		case 'checked_in':
		case 'completed':
			return { bg: '#e8f5e9', color: '#4caf50' }
		case 'not_arrived':
			return { bg: '#e3f2fd', color: '#1e6fd9' }
		case 'no_show':
			return { bg: '#FBEFD5', color: '#8A5300' }
		default:
			return { bg: '#fff8e8', color: '#f59e0b' }
	}
}
