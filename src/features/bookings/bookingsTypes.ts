// src/features/bookings/bookingsTypes.ts
//
// The patient's combined bookings list (GET /api/patients/me/bookings): doctor appointments, home-care orders, lab bookings and
// pharmacy orders, the signed-in patient's and their family members', merged, sorted and paged by the backend (the same list the
// mobile app's Bookings tab shows). Radiology is not part of it.

export type BookingsWhen = 'upcoming' | 'past'
export type BookingCategory = 'doctor' | 'ancillary' | 'lab' | 'pharmacy'
export type BookingsCategoryFilter = 'all' | BookingCategory
/** The server's tone for a status: ok (green), wait (amber), move (blue), done (grey, every closed booking). */
export type BookingTone = 'ok' | 'wait' | 'move' | 'done'
export type BookingWhereType = 'clinic' | 'home' | 'video' | 'delivery' | 'report'

export type BookingTargetType =
	'appointment' | 'visit_summary' | 'ancillary_request' | 'ancillary_tracking' | 'pharmacy_order' | 'lab_booking'

export type BookingActionKey =
	| 'view'
	| 'view_pay'
	| 'directions'
	| 'cancel'
	| 'track'
	| 'call'
	| 'reschedule'
	| 'view_report'
	| 'book_again'
	| 'reorder'
	| 'visit_summary'
	| 'invoice'

export interface BookingAction {
	key: BookingActionKey
	label: string
}

export interface BookingItem {
	id: string
	category: BookingCategory
	kind_label: string
	title: string
	subtitle?: string | null
	starts_at?: string | null
	time_label?: string | null
	where?: string | null
	where_type?: BookingWhereType | null
	status: { label: string; tone: BookingTone }
	/** The raw status of a doctor appointment (e.g. 'no_show'); older servers do not send it. */
	status_key?: string | null
	/** Home care only: the visit the provider reported as a no-show, which the patient can explain (else null). */
	missed_visit_id?: string | null
	missed_can_reply?: boolean
	note?: string | null
	ref?: string | null
	/** A picture key or address of the doctor / provider; null when there is none. */
	avatar_url?: string | null
	/** Set only when the booking is for a family member. */
	patient?: { public_id: string; name: string; relation?: string | null } | null
	/** Home care only: the order's speciality (catalogue key + label); null when unknown. */
	service?: { key: string; label: string } | null
	target: { type: BookingTargetType; id: string }
	actions: { primary: BookingAction | null; secondary: BookingAction | null }
}

export interface BookingsPage {
	items: BookingItem[]
	counts: Record<BookingsCategoryFilter, number>
	summary: { upcoming: number; today: number }
	page: number
	limit: number
	total: number
	pages: number
}
