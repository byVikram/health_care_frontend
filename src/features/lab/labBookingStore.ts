// src/features/lab/labBookingStore.ts
//
// Shared state for the Lab tests flow (browse -> cart & slot -> review -> booked -> order). The screens are separate routes, so the
// booking in progress lives in a small module-level store (same shape and methods as the native app's labBookingStore.ts) instead of
// travelling through route params.
//
// Web differences: the booking in progress (everything except `order`) is kept in sessionStorage so a refresh keeps the cart, who it is
// for, the address and the picked lab / slot (the cart's items are stored with it, because the items cache is in memory); it is cleared
// when the user logs out (labSession.ts). The placed `order` is NOT stored: after a refresh the Booked / Order screens load it again from
// the server by its id.
//
// The chosen lab, slot and prices depend on the cart, the address and home / in-clinic: changing any of them clears the lab + slot (see
// `set`), so Review never shows a pick the cart no longer matches.
import { useSyncExternalStore } from 'react'
import { toast } from 'react-toastify'
import { labItemById, labItemsOf, seedLabItems } from './labCatalogue'
import type { LabItem, LabPayMethod } from './labConstants'
import { slotAt } from './labFormat'
import type { ApiTimelineStep } from './labService'
import { registerSessionCache } from './labSession'

export type LabWhere = 'home' | 'lab'

/** The API checks availability / slots / quotes for at most this many tests at once. */
export const MAX_LAB_ITEMS = 10

/** The lab picked on the "Choose a lab" step, with what it quoted for the cart. */
export type LabPick = { id: number; name: string; logoUrl: string | null; distanceKm: number | null }

/** What the screens after booking show: a snapshot of the booking at the moment it was placed (see labOrder.ts). */
export type LabOrder = {
	id: string
	/** The server's id for the order: what fetch / cancel / reschedule use. */
	apiId?: string
	/** Our step: placed | scheduled | on_the_way | sample_collected | processing | report_ready | needs_attention | cancelled | cancel_requested | reschedule_requested */
	status?: string
	/** The progress the server says to draw (empty for a cancelled order or a visit that needs attention). */
	timeline?: ApiTimelineStep[]
	/** missed | no_show | sample_rejected, while the order needs attention. */
	attentionReason?: string | null
	canCancel?: boolean
	canReschedule?: boolean
	placedAt: string
	where: LabWhere
	items: { id: string; name: string; kind: LabItem['kind']; price: number; mrp: number; sub: string }[]
	/** One entry: the collection / lab visit. `time` is a display label ("7:30 AM"). */
	visits: { date: string; time: string }[]
	visitCount: number
	patientName: string
	patientRelation: string
	/** Home: the collection address; clinic: the lab. */
	addressTitle: string
	addressSub: string
	labName?: string
	labLogoUrl?: string | null
	labTatHours?: number | null
	/** Set by the lab once a phlebotomist is assigned (home collection). */
	phleboName?: string | null
	phleboNumber?: string | null
	trackingLink?: string | null
	labId?: string
	total: number
	mrpTotal: number
	method: LabPayMethod
	methodLabel: string
	transactionId: string
	fasting: boolean
	note: string
}

export type LabBookingState = {
	/** Catalogue ids in the cart, in the order they were added. */
	cart: string[]
	where: LabWhere
	/** Who the tests are for: the family member's public id, or 'self' for the account holder (leave `patientId` out of `placeOrder` for 'self'). */
	patientKey: string
	/** Display name / relation of the patient, kept for the review, booked and order screens. */
	patientName: string
	patientRelation: string
	/** The patient's saved address (public id) the availability / slots / quote are checked against. */
	addressId: string | null
	/** Tag ("Home") and one-line text of that address. */
	addressTag: string
	addressLine: string
	note: string
	/** Pay at collection is the only method the backend takes ('later'). */
	method: LabPayMethod
	/** Lab + slot ('YYYY-MM-DD', 'HH:MM') picked on the "Choose a lab" step. */
	lab: LabPick | null
	slot: { date: string; time: string } | null
	/** Price and MRP per cart item at the picked lab, and what the cart totals there (the lab's own quote). */
	lineAmounts: Record<string, { price: number; mrp: number }>
	quoteTotal: number | null
	order: LabOrder | null
}

const initial = (): LabBookingState => ({
	cart: [],
	where: 'home',
	patientKey: 'self',
	patientName: '',
	patientRelation: 'Self',
	addressId: null,
	addressTag: '',
	addressLine: '',
	note: '',
	method: 'later',
	lab: null,
	slot: null,
	lineAmounts: {},
	quoteTotal: null,
	order: null,
})

// ---- persistence (sessionStorage, versioned; every access is guarded: the storage can be missing or full) ----

const STORAGE_KEY = 'kh-lab-booking-v1'

type Persisted = { state: Omit<LabBookingState, 'order'>; items: LabItem[] }

const readStored = (): LabBookingState => {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY)
		if (!raw) return initial()
		const parsed = JSON.parse(raw) as Partial<Persisted>
		if (!parsed.state || !Array.isArray(parsed.state.cart)) return initial()
		seedLabItems(Array.isArray(parsed.items) ? parsed.items : [])
		return { ...initial(), ...parsed.state, order: null }
	} catch {
		return initial()
	}
}

const writeStored = (s: LabBookingState) => {
	try {
		const rest: Omit<LabBookingState, 'order'> & { order?: LabOrder | null } = { ...s }
		delete rest.order
		const isEmpty = rest.cart.length === 0 && !rest.addressId && !rest.patientName
		if (isEmpty) {
			sessionStorage.removeItem(STORAGE_KEY)
			return
		}
		const payload: Persisted = { state: rest, items: labItemsOf(s.cart) }
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
	} catch {
		// private mode / quota: the booking just is not kept across a refresh
	}
}

let state: LabBookingState = readStored()
const listeners = new Set<() => void>()

const emit = () => {
	writeStored(state)
	listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
	listeners.add(l)
	return () => {
		listeners.delete(l)
	}
}

const getState = () => state

const CLEARED_PICK = { lab: null, slot: null, lineAmounts: {}, quoteTotal: null } as const

export const labBooking = {
	get: getState,
	set(patch: Partial<LabBookingState>) {
		const invalidates =
			(patch.cart !== undefined && patch.cart !== state.cart) ||
			(patch.addressId !== undefined && patch.addressId !== state.addressId) ||
			(patch.where !== undefined && patch.where !== state.where)
		state = { ...state, ...(invalidates ? CLEARED_PICK : {}), ...patch }
		emit()
	},
	/** Back to an empty cart and no pick. */
	reset() {
		state = initial()
		emit()
	},
	/** New booking: clear everything except who the tests are for and where. */
	startOver() {
		const { patientKey, patientName, patientRelation, addressId, addressTag, addressLine } = state
		state = { ...initial(), patientKey, patientName, patientRelation, addressId, addressTag, addressLine }
		emit()
	},
	addItem(id: string) {
		if (state.cart.includes(id)) return
		if (state.cart.length >= MAX_LAB_ITEMS) {
			toast.info(`You can book up to ${MAX_LAB_ITEMS} tests at a time`)
			return
		}
		labBooking.set({ cart: [...state.cart, id] })
	},
	removeItem(id: string) {
		labBooking.set({ cart: state.cart.filter((c) => c !== id) })
	},
	toggleItem(id: string) {
		if (state.cart.includes(id)) labBooking.removeItem(id)
		else labBooking.addItem(id)
	},
	/** Drop a slot that has gone by (the page can stay open for a long time). */
	dropExpired() {
		if (state.slot && slotAt(state.slot.date, state.slot.time).getTime() <= Date.now()) {
			labBooking.set({ slot: null })
		}
	},
}

// The booking holds the patient's name, address and order: clear it on logout like the other per-user caches.
registerSessionCache(() => labBooking.reset())

export function useLabBooking() {
	return useSyncExternalStore(subscribe, getState, getState)
}

// ---------------------------------------------------------------------------------------------------------
// Derived values (pure helpers over a snapshot)
// ---------------------------------------------------------------------------------------------------------

/** Cart items; once a lab is picked, each carries that lab's price and MRP instead of the catalogue's "from" price. */
export const cartItems = (s: LabBookingState): LabItem[] =>
	s.cart
		.map((id) => labItemById(id))
		.filter((i): i is LabItem => !!i)
		.map((i) => (s.lineAmounts[i.id] ? { ...i, ...s.lineAmounts[i.id] } : i))

/** The order is a single visit (home collection or lab). */
export const visitCountOf = () => 1

export const totalsOf = (s: LabBookingState) => {
	const items = cartItems(s)
	const total = s.quoteTotal ?? items.reduce((n, i) => n + i.price, 0)
	const mrp = items.reduce((n, i) => n + i.mrp, 0)
	// Only packages sell below MRP, so the saving is the packages' MRP minus their price.
	return { items, visits: 1, unitTotal: total, unitMrp: mrp, total, mrp, savings: Math.max(0, mrp - total) }
}

export const needsFasting = (s: LabBookingState) => cartItems(s).some((i) => i.fasting)
