// src/features/nursing/nursingVisit.ts
//
// What a visit of an order looks like on the order page: its state, the chip and the "who comes" line (the native app's scheduledVisitView.ts).
// Pure functions over the order, so the cards and the dialogs tell the same story.
import { DESK, DESK_TONES } from '../../styles/deskTokens'
import { assignedAtLabel, dayLabel, leadText } from './nursingTime'
import { DEFAULT_POLICY, type NursingOrder, type OrderVisit, type StatusTimeline, type VisitPolicy } from './nursingService'

export const isCancelledStatus = (s?: string | null) => !!s && /CANCEL|EXPIRED/.test(s)
/** The nurse reached the address and the patient was not available. */
export const isMissedStatus = (s?: string | null) => s === 'NO_SHOW'
export const isUnassignedStatus = (s?: string | null) => s === 'UNASSIGNED'
export const isDoneStatus = (s?: string | null) => !!s && /COMPLETED/.test(s)
const isLiveStatus = (s?: string | null) => !!s && /EN_ROUTE|ARRIVED|IN_PROGRESS|VERIFICATION/.test(s)

/** Nothing more will happen to this visit: cancelled, expired, completed, missed, or no nurse was available. */
const isClosedVisit = (v: OrderVisit) => isCancelledStatus(v.status) || isMissedStatus(v.status) || isDoneStatus(v.status) || isUnassignedStatus(v.status)

/** Still on the books: not cancelled, not done, not without a nurse. */
export const isOpenVisit = (v: OrderVisit) => !isClosedVisit(v)

/** The next visit still to come (the first open one that is not already under way). */
export const nextVisitId = (visits: OrderVisit[]): string | null => visits.find((v) => isOpenVisit(v) && !isLiveStatus(v.status))?.visit_public_id ?? null

export const orderPolicyOf = (order: NursingOrder | null): VisitPolicy =>
	order?.policy ? { assignLeadMinutes: order.policy.assign_lead_minutes, cancelCutoffMinutes: order.policy.cancel_cutoff_minutes } : DEFAULT_POLICY

export type VisitChip = { label: string; bg: string; fg: string }

/** "10:20 AM" from an ISO time; null when there is none. */
const timeOfDay = (iso?: string | null) => {
	const d = iso ? new Date(iso) : null
	return d && !Number.isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : null
}

/** The pill on a visit card: Cancelled > Missed > no nurse > Completed > Here > In progress > Rescheduled > Next visit > Booked. */
export const visitChip = (v: OrderVisit, isNext: boolean, noun = 'nurse'): VisitChip => {
	if (isCancelledStatus(v.status)) return { label: 'Cancelled', bg: DESK.dangerSoft, fg: DESK.danger }
	if (isMissedStatus(v.status)) return { label: 'Missed', bg: DESK.dangerSoft, fg: DESK.danger }
	if (isUnassignedStatus(v.status)) return { label: `No ${noun} yet`, bg: DESK.dangerSoft, fg: DESK.danger }
	if (isDoneStatus(v.status)) return { label: 'Completed', bg: DESK_TONES.ok.bg, fg: DESK_TONES.ok.fg }
	if (v.status === 'ARRIVED') return { label: `${noun.charAt(0).toUpperCase()}${noun.slice(1)} here`, bg: DESK.infoSoft, fg: DESK.info }
	if (isLiveStatus(v.status)) return { label: 'In progress', bg: DESK.infoSoft, fg: DESK.info }
	if (v.rescheduled) return { label: 'Rescheduled', bg: DESK.infoSoft, fg: DESK.info }
	if (isNext) return { label: 'Next visit', bg: DESK.primarySoft, fg: DESK.primary }
	return { label: 'Booked', bg: DESK.page, fg: DESK.muted }
}

/** The line under the time: who comes, or when a nurse will be assigned. */
export const assignLine = (v: OrderVisit, leadMinutes: number, noun = 'nurse'): string => {
	if (isCancelledStatus(v.status)) return `No ${noun} will be assigned`
	if (isUnassignedStatus(v.status)) return `No ${noun} available`
	if (isMissedStatus(v.status)) return `The ${noun} couldn’t meet you`
	if (v.status === 'ARRIVED') {
		const until = timeOfDay(v.waiting_until)
		return `${v.provider?.name ?? `The ${noun}`} has arrived${until ? ` · waiting until ${until}` : ''}`
	}
	if (v.provider?.name) return `${v.provider.name} · ${noun}`
	if (isDoneStatus(v.status)) return 'Visit completed'
	if (v.status === 'SEARCHING') return `Finding your ${noun}…`
	return `${noun.charAt(0).toUpperCase()}${noun.slice(1)} assigned at ${assignedAtLabel(v.date, v.start_time, leadMinutes)}`
}

/** "Visit 2 · Tue 26 Sep" for the cancel dialog rows. */
export const visitTitle = (v: OrderVisit, index: number): string => `Visit ${v.index ?? index + 1} · ${dayLabel(v.date)}`

/** Why a visit can't be cancelled (or moved) from here any more. */
export const lockedReason = (status: string, hasProvider: boolean, cancelCutoffMinutes: number, noun = 'nurse'): string => {
	if (status === 'UNASSIGNED') return `No ${noun} was available for this visit`
	if (hasProvider || /ASSIGNED|ACCEPTED|EN_ROUTE|ARRIVED|IN_PROGRESS/.test(status)) return `${noun.charAt(0).toUpperCase()}${noun.slice(1)} already assigned`
	if (status === 'SEARCHING') return `Finding your ${noun} now`
	return `Too close to start · cancel up to ${leadText(cancelCutoffMinutes)} before`
}

/** The visit a screen is about: the one asked for, else the first still open, else the last. */
export const currentVisitOf = (visits: OrderVisit[], focusId?: string | null): OrderVisit | null =>
	visits.find((v) => v.visit_public_id === focusId) ?? visits.find((v) => isOpenVisit(v)) ?? visits[visits.length - 1] ?? null

/** The order as a whole is over (every visit cancelled, expired or done), so nothing more can be edited. */
export const orderIsClosed = (order: NursingOrder): boolean => order.visits.length > 0 && order.visits.every((v) => !isOpenVisit(v) && !(v.status === 'UNASSIGNED'))

/** The strip worked out from the status, for a server that does not send `timeline`. */
export const fallbackTimeline = (status: string): StatusTimeline => {
	const current = status === 'COMPLETED' ? 5 : status === 'IN_PROGRESS' || status === 'VERIFICATION_PENDING' ? 4 : status === 'EN_ROUTE' || status === 'ARRIVED' ? 3 : /ASSIGNED/.test(status) ? 2 : 1
	const labels = ['Booked', 'Confirmed', status === 'ARRIVED' ? 'Arrived' : 'On the way', 'In progress', 'Done']
	return {
		current,
		outcome: null,
		steps: labels.map((label, i) => ({ key: label.toLowerCase().replace(/\s+/g, '_'), label, state: i + 1 < current ? 'done' : i + 1 === current ? (current === 5 ? 'done' : 'current') : 'upcoming' })),
	}
}
