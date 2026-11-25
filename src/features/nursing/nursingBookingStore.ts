// src/features/nursing/nursingBookingStore.ts
//
// The booking in progress of the Nursing care flow (browse -> who / where / when -> review). The screens are separate routes, so it lives in a
// small module-level store (like the Lab tests store) instead of travelling through route params; the native app passes the same things
// through its navigation params. It is kept in sessionStorage (a refresh keeps the cart, the person, the address and the days) and cleared on logout.
//
// The cart rule is the server's: ONE package, or one or more procedures, never both.
import { createSessionStore } from '../booking/createSessionStore'
import { hhmm, minutesOf } from './nursingTime'
import { MAX_VISITS, type NursingItem, type Selection, type VisitInput } from './nursingService'

export type BookingMode = 'now' | 'later'

export type NursingBookingState = {
	/** The service the cart is for (nursing-care, physiotherapy ...): a cart is for one service, so choosing another starts it afresh (`useService`). */
	serviceKey: string
	/** What is in the cart (one package, or procedures). The items themselves are kept so a refresh does not need the catalogue. */
	items: NursingItem[]
	/** Book now (instant) or Later (scheduled); set by the button the patient used on the browse page. */
	mode: BookingMode
	/** 'self' for the account holder, else the family member's public id. */
	patientKey: string
	patientName: string
	patientRelation: string
	/** The saved address (public id) and its one-line text and tag. */
	addressId: string | null
	addressTag: string
	addressLine: string
	note: string
	/** Later: the picked days ('YYYY-MM-DD', at most 7, sorted), one time for all of them or one per day. */
	dates: string[]
	sameTime: boolean
	/** The time ('HH:MM') used for every day when `sameTime`. */
	time: string | null
	/** The time per day when not `sameTime`. */
	timesByDate: Record<string, string>
}

const initial = (): NursingBookingState => ({
	serviceKey: 'nursing-care',
	items: [],
	mode: 'later',
	patientKey: 'self',
	patientName: '',
	patientRelation: 'Self',
	addressId: null,
	addressTag: '',
	addressLine: '',
	note: '',
	dates: [],
	sameTime: true,
	time: null,
	timesByDate: {},
})

const store = createSessionStore<NursingBookingState>({
	key: 'kh-nursing-booking-v1',
	initial,
	restore: (raw) => {
		const parsed = raw as Partial<NursingBookingState>
		return Array.isArray(parsed.items) ? { ...initial(), ...parsed } : null
	},
	// an empty booking is not kept; the note can hold health details, so it is never kept across a refresh
	persist: (s) => (s.items.length === 0 && !s.addressId && !s.patientName ? null : { ...s, note: '' }),
})

export const nursingBooking = {
	get: store.get,
	set(patch: Partial<NursingBookingState>) {
		store.replace({ ...store.get(), ...patch })
	},
	reset() {
		store.replace(initial())
	},
	/** A new booking: empty cart and days, but the same person, address and service. */
	startOver() {
		const { serviceKey, patientKey, patientName, patientRelation, addressId, addressTag, addressLine } = store.get()
		store.replace({ ...initial(), serviceKey, patientKey, patientName, patientRelation, addressId, addressTag, addressLine })
	},
	/** The page is about this service: a cart that was for another one is cleared (the person and the address stay). */
	useService(serviceKey: string) {
		if (store.get().serviceKey === serviceKey) return
		const { patientKey, patientName, patientRelation, addressId, addressTag, addressLine } = store.get()
		store.replace({ ...initial(), serviceKey, patientKey, patientName, patientRelation, addressId, addressTag, addressLine })
	},
	has(id: string) {
		return store.get().items.some((i) => i.id === id)
	},
	/** Would adding this item mix a package with procedures (the server takes one or the other)? */
	conflictsWith(item: NursingItem) {
		if (store.get().items.length === 0 || store.get().items.some((i) => i.id === item.id)) return false
		// a package replaces whatever is there; a procedure replaces a package
		return item.kind === 'package' || store.get().items.some((i) => i.kind === 'package')
	},
	/** Adds the item; a package replaces everything, a procedure replaces a package. */
	addItem(item: NursingItem) {
		if (store.get().items.some((i) => i.id === item.id)) return
		const keep = item.kind === 'package' ? [] : store.get().items.filter((i) => i.kind === 'procedure')
		store.replace({ ...store.get(), items: [...keep, item] })
	},
	removeItem(id: string) {
		store.replace({ ...store.get(), items: store.get().items.filter((i) => i.id !== id) })
	},
}


export function useNursingBooking() {
	return store.useStore()
}

// ---------------------------------------------------------------------------------------------------------
// Pricing (worked out here: the server has no quote call, it only checks the order)
// ---------------------------------------------------------------------------------------------------------

/** What ONE visit costs for an item: a procedure's price, or a package's bundle price shared over the visits it covers. */
export const itemVisitFee = (item: NursingItem): number => {
	const visits = item.visitsCount ?? 0
	return item.kind === 'package' && visits > 0 ? Math.round((item.price / visits) * 100) / 100 : item.price
}

/** What one scheduled visit costs for the whole cart. */
export const perVisitFee = (items: NursingItem[]): number => items.reduce((n, i) => n + itemVisitFee(i), 0)

/** What an instant booking costs: the whole price of the cart. */
export const instantFee = (items: NursingItem[]): number => items.reduce((n, i) => n + i.price, 0)

export const mrpOf = (items: NursingItem[]): number => items.reduce((n, i) => n + (i.mrp ?? i.price), 0)

/** The saving shown in the cart: MRP minus price (only where an item has an MRP above its price). */
export const savingsOf = (items: NursingItem[]): number => Math.max(0, mrpOf(items) - instantFee(items))

/** How long a visit lasts: the items' durations added up, 60 minutes when none says. */
export const visitMinutes = (items: NursingItem[]): number => {
	const total = items.reduce((n, i) => n + (i.durationMinutes ?? 0), 0)
	return total > 0 ? total : 60
}

export const selectionOf = (items: NursingItem[]): Selection => {
	const pkg = items.find((i) => i.kind === 'package')
	return pkg ? { packageId: pkg.id } : { procedureIds: items.map((i) => i.id) }
}

/** "Injection administration" / "Injection, Dressing" / "Injection + 2 more". */
export const itemsSummary = (items: { name: string }[]): string => {
	if (items.length <= 2) return items.map((i) => i.name).join(', ')
	return `${items[0].name} + ${items.length - 1} more`
}

/** The visits the patient picked, as the API wants them (the end is the start plus the visit length); empty until every picked day has a time. */
export const visitsOf = (s: NursingBookingState): VisitInput[] => {
	const length = visitMinutes(s.items)
	const out: VisitInput[] = []
	for (const date of s.dates.slice(0, MAX_VISITS)) {
		const start = s.sameTime ? s.time : s.timesByDate[date]
		if (!start) return []
		out.push({ date, start_time: start, end_time: hhmm(minutesOf(start) + length) })
	}
	return out
}
