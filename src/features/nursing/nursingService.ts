// src/features/nursing/nursingService.ts
//
// The calls of the Nursing care at home flow (same endpoints and rules as the native app's ancillaryService.ts /
// ancillaryProviderBookingService.ts, all under /api/ancillary). Two ways to book, both pay-after-visit:
//   - Book now: POST /patient/requests (instant) -> "Finding a nurse" (offered to nearby nurses, optional tip, first to accept wins)
//   - Later: POST /requests/scheduled with NO nurse chosen -- one order of up to 7 visits in a 14-day window; a nurse is assigned to
//     each visit an hour before it starts.
// There is no price-quote call: the screens work the price out from the catalogue (see nursingBookingStore.ts), the server only checks.
import axios from 'axios'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'

type Envelope<T> = { success?: boolean; message?: string; data: T }

/** The service the flow was first built for; every call takes the service key (the backend's specialty id: nursing-care, physiotherapy ...). */
export const NURSING_SERVICE_KEY = 'nursing-care'
export const PAY_AFTER_VISIT = 'PAY_AFTER_VISIT'
export const MAX_VISITS = 7
export const BOOKING_WINDOW_DAYS = 14
/** The cart holds one package OR procedures, and the order can carry at most this many of them. */
export const MAX_NOTE_LENGTH = 300

// ---------------------------------------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------------------------------------

export type NursingKind = 'procedure' | 'package'

/** A procedure or a package of the catalogue, in one shape (what the cards, the drawer and the cart show). */
export type NursingItem = {
	id: string
	kind: NursingKind
	name: string
	/** What the patient pays: a procedure's price, or a package's bundle price (for all its visits). */
	price: number
	mrp: number | null
	durationMinutes: number | null
	goodFor: string | null
	about: string
	includes: string[]
	prepSteps: string[]
	categoryId: string | null
	categoryName: string
	/** Packages only: how many visits the price covers (null = the price is per visit). */
	visitsCount: number | null
	validityDays: number | null
	/** Packages only: how many procedures it bundles. */
	procedureCount: number
	isFeatured: boolean
	imageUrl: string | null
}

export type NursingCategory = { id: string; label: string; startingPrice: number | null }

const toNumber = (value: unknown): number | null => {
	if (value == null || value === '') return null
	const n = Number(value)
	return Number.isFinite(n) ? n : null
}

const toList = (value: unknown): string[] => {
	if (Array.isArray(value)) return value.map((v) => String(v ?? '').trim()).filter(Boolean)
	if (typeof value === 'string' && value.trim()) {
		return value
			.split('\n')
			.map((x) => x.trim().replace(/^[-•*]\s*/, ''))
			.filter(Boolean)
	}
	return []
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

// The API sends snake_case for the detail fields and camelCase for the rest; both spellings are read.
type Raw = Record<string, unknown>

const mapProcedure = (raw: Raw): NursingItem => {
	const about = text(raw.aboutService ?? raw.about_service ?? raw.description)
	return {
		id: String(raw.id ?? ''),
		kind: 'procedure',
		name: text(raw.label ?? raw.title ?? raw.name),
		price: toNumber(raw.price) ?? 0,
		mrp: toNumber(raw.mrp),
		durationMinutes: toNumber(raw.duration_minutes ?? raw.durationMinutes),
		goodFor: text(raw.good_for ?? raw.goodFor) || null,
		about,
		includes: toList(raw.includes).length ? toList(raw.includes) : toList(raw.whatsIncluded ?? raw.whats_included),
		prepSteps: toList(raw.prep_steps ?? raw.prepSteps),
		categoryId: raw.categoryId != null ? String(raw.categoryId) : raw.category_id != null ? String(raw.category_id) : null,
		categoryName: text(raw.categoryName ?? raw.category_name),
		visitsCount: null,
		validityDays: null,
		procedureCount: 0,
		isFeatured: Boolean(raw.is_featured ?? raw.isFeatured),
		imageUrl: text(raw.imageUrl ?? raw.image_url) || null,
	}
}

const mapPackage = (raw: Raw): NursingItem => ({
	id: String(raw.id ?? raw.public_id ?? ''),
	kind: 'package',
	name: text(raw.label ?? raw.name),
	price: toNumber(raw.packagePrice ?? raw.package_price ?? raw.price) ?? 0,
	mrp: toNumber(raw.mrp),
	durationMinutes: toNumber(raw.duration_minutes ?? raw.durationMinutes),
	goodFor: text(raw.good_for ?? raw.goodFor) || null,
	about: text(raw.description),
	includes: toList(raw.includes),
	prepSteps: toList(raw.prep_steps ?? raw.prepSteps),
	categoryId: null,
	categoryName: '',
	visitsCount: toNumber(raw.visits_count ?? raw.visitsCount),
	validityDays: toNumber(raw.validity_days ?? raw.validityDays),
	procedureCount: toNumber(raw.procedureCount ?? raw.procedure_count) ?? 0,
	isFeatured: Boolean(raw.is_featured ?? raw.isFeatured),
	imageUrl: text(raw.imageUrl ?? raw.image_url) || null,
})

export type NursingCatalogue = { procedures: NursingItem[]; packages: NursingItem[] }

/** GET /catalog: the specialty's procedures AND packages in one call. `search` is matched by the server (at most 100 characters). */
export async function fetchCatalogue(serviceKey: string, search?: string): Promise<NursingCatalogue> {
	const params: Record<string, string> = { specialty_id: serviceKey }
	const term = (search ?? '').trim().slice(0, 100).trim()
	if (term) params.search = term
	const res = await ApiService.getWithParams<Envelope<{ services?: Raw[]; packages?: Raw[] }>>(API_ENDPOINTS.ANCILLARY.CATALOG, params)
	const data = res.data?.data ?? {}
	return {
		procedures: Array.isArray(data.services) ? data.services.map(mapProcedure) : [],
		packages: Array.isArray(data.packages) ? data.packages.map(mapPackage) : [],
	}
}

/** GET /categories: the "Care for" groups, each with its starting price. A failure gives an empty list (the chips are just left out). */
export async function fetchCategories(serviceKey: string): Promise<NursingCategory[]> {
	try {
		const res = await ApiService.getWithParams<Envelope<Raw[]> | Raw[]>(
			API_ENDPOINTS.ANCILLARY.CATEGORIES,
			{ specialty_id: serviceKey },
			{ suppressErrorToast: true }
		)
		const body = res.data as { data?: Raw[] } | Raw[]
		const list: Raw[] = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []
		return list.map((c) => ({
			id: String(c.id ?? ''),
			label: text(c.label),
			startingPrice: toNumber(c.starting_price ?? c.startingPrice),
		}))
	} catch {
		return []
	}
}

/** GET /packages/{id}: the package with its procedures (the drawer's "What's included" when the package lists none itself). */
export async function fetchPackageDetail(id: string): Promise<{ item: NursingItem; procedures: { id: string; label: string }[] } | null> {
	try {
		const res = await ApiService.get<Envelope<Raw & { procedures?: Raw[] }>>(API_ENDPOINTS.ANCILLARY.PACKAGE_DETAIL(id), {
			suppressErrorToast: true,
		})
		const raw = res.data?.data
		if (!raw) return null
		const procedures = Array.isArray(raw.procedures) ? raw.procedures.map((p) => ({ id: String(p.id ?? ''), label: text(p.label) })) : []
		return { item: mapPackage(raw), procedures }
	} catch {
		return null
	}
}

// ---------------------------------------------------------------------------------------------------------
// Public config
// ---------------------------------------------------------------------------------------------------------

export type VisitPolicy = { assignLeadMinutes: number; cancelCutoffMinutes: number }
/** Used until the server answers (and by a server that sends no policy): the same values the server uses. */
export const DEFAULT_POLICY: VisitPolicy = { assignLeadMinutes: 60, cancelCutoffMinutes: 120 }

export type NursingConfig = { policy: VisitPolicy; helpline: string | null }

export async function fetchConfig(): Promise<NursingConfig> {
	try {
		const res = await ApiService.get<
			Envelope<{ home_care_visit_policy?: { assign_lead_minutes?: number; cancel_cutoff_minutes?: number }; nursing_helpline_number?: string | null }>
		>(API_ENDPOINTS.LOOKUP.APP_CONFIG, { suppressErrorToast: true })
		const data = res.data?.data
		const policy = data?.home_care_visit_policy
		return {
			policy: {
				assignLeadMinutes: policy?.assign_lead_minutes ?? DEFAULT_POLICY.assignLeadMinutes,
				cancelCutoffMinutes: policy?.cancel_cutoff_minutes ?? DEFAULT_POLICY.cancelCutoffMinutes,
			},
			helpline: text(data?.nursing_helpline_number) || null,
		}
	} catch {
		return { policy: DEFAULT_POLICY, helpline: null }
	}
}

/** GET /patient/booking-restriction: a patient paused after missed visits cannot book (403 BOOKING_RESTRICTED). */
export async function fetchBookingRestriction(): Promise<{ restricted: boolean; message: string }> {
	try {
		const res = await ApiService.get<Envelope<{ restricted?: boolean; message?: string }>>(API_ENDPOINTS.ANCILLARY.BOOKING_RESTRICTION, {
			suppressErrorToast: true,
		})
		return { restricted: Boolean(res.data?.data?.restricted), message: text(res.data?.data?.message) }
	} catch {
		return { restricted: false, message: '' }
	}
}

// ---------------------------------------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------------------------------------

export type VisitAddress = { street_address: string; latitude: number; longitude: number; label?: string }

export type VisitInput = { date: string; start_time: string; end_time: string }

export type Selection = { packageId: string } | { procedureIds: string[] }

export type TimelineStep = { key: string; label: string; state: 'done' | 'current' | 'upcoming' | 'stopped' }

/** The status strip as the server decides it (Booked > Confirmed > On the way > In progress > Done). */
export type StatusTimeline = {
	steps: TimelineStep[]
	current: number
	outcome: string | null
	/** "Visit cancelled" / "Visit expired" ...: said in place of the strip. */
	outcome_text?: string | null
}

export type VisitProvider = {
	provider_public_id: string
	name: string
	avatar_url?: string | null
	experience_years?: number | null
	phone?: string | null
}

export type OrderVisit = {
	visit_public_id: string
	index: number
	date: string
	start_time: string
	end_time: string
	status: string
	payment_status?: string | null
	provider?: VisitProvider | null
	rescheduled?: boolean
	can_reschedule?: boolean
	can_cancel?: boolean
	start_code?: string | null
	completion_code?: string | null
	started_at?: string | null
	provider_arrived_at?: string | null
	waiting_until?: string | null
	missed?: boolean
	timeline?: StatusTimeline
	tasks?: { label: string; done: boolean }[]
}

export type AssignedProvider = {
	id: string
	name: string
	role?: string | null
	specialization?: string | null
	qualifications?: string | null
	experienceYears?: number | null
	rating?: number | null
	totalVisits?: number | null
	avatar?: string | null
	phone?: string | null
}

/** The order as the status endpoint (and every websocket push) sends it: a scheduled order has `visits`, an instant one a nurse and codes. */
export type NursingOrder = {
	request_public_id: string
	requestId?: string
	status: string
	/** The status endpoint spells it `bookingType`, a websocket push `booking_type`. */
	bookingType?: string
	booking_type?: string
	created_at?: string | null
	createdAt?: string | null
	services: { id: string; name: string }[]
	package?: { id: string; name: string } | null
	serviceName?: string
	patient?: { public_id: string; name: string; relation?: string | null } | null
	patientName?: string
	patientRelationship?: string
	address?: { street_address: string; label?: string | null } | null
	note?: string | null
	visits: OrderVisit[]
	policy?: { assign_lead_minutes: number; cancel_cutoff_minutes: number }
	/** false: an older order made for a chosen nurse; it is cancelled as a whole, visits are not edited one by one. */
	visit_edits?: boolean
	totals?: { per_visit: number; visits_count: number; total: number }
	totalAmount?: number
	tip_amount?: number
	tipAmount?: number
	total_with_tip?: number
	totalWithTip?: number
	searching_seconds?: number
	since_last_search_seconds?: number
	asked_count?: number
	assignedProvider?: AssignedProvider | null
	etaMinutes?: number | null
	verificationOtp?: string | null
	completionPin?: string | null
	timeline?: StatusTimeline
	specialty?: { key?: string | null; label?: string | null } | string | null
}

export const isScheduled = (order: Pick<NursingOrder, 'bookingType' | 'booking_type'> | null | undefined) =>
	String(order?.bookingType ?? order?.booking_type ?? '').toUpperCase() === 'SCHEDULED'

/** Statuses once a nurse took the request. */
export const ASSIGNED_STATUSES = new Set(['ASSIGNED', 'NURSE_ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'VERIFICATION_PENDING', 'COMPLETED', 'NO_SHOW'])
/** Ended without a nurse (or cancelled): nothing is charged. */
export const ENDED_STATUSES = new Set(['CANCELLED', 'CANCELLED_BY_PATIENT', 'CANCELLED_BY_PROVIDER', 'EXPIRED', 'FAILED'])
/** "Finding a nurse" is over on the server's side without anyone accepting. */
export const NO_MATCH_PATTERN = /EXPIRED|FAILED|NO_PROVIDER|UNASSIGNED/

const money = (v: unknown) => toNumber(v) ?? 0

/** The tip and the total with it, from either spelling the server uses. */
export const tipOf = (order: NursingOrder | null) => money(order?.tipAmount ?? order?.tip_amount)
export const totalWithTipOf = (order: NursingOrder | null) => money(order?.totalWithTip ?? order?.total_with_tip)

/** The server's reason for a refused call: `{message}`, `{detail: "..."}` or `{detail: {code, message}}`. */
export function nursingErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as { message?: unknown; detail?: unknown } | undefined
		if (typeof data?.message === 'string' && data.message.trim()) return data.message.trim()
		if (typeof data?.detail === 'string' && data.detail.trim()) return data.detail.trim()
		const detail = data?.detail as { message?: unknown } | undefined
		if (typeof detail?.message === 'string' && detail.message.trim()) return detail.message.trim()
		if (Array.isArray(data?.detail)) {
			const first = (data.detail as { msg?: unknown }[])[0]
			if (typeof first?.msg === 'string') return first.msg
		}
		if (error.message) return error.message
	}
	return error instanceof Error && error.message ? error.message : fallback
}

/** The machine code of a refusal (ACTIVE_TASK_EXISTS, ALREADY_ASSIGNED, BOOKING_RESTRICTED, SLOT_UNAVAILABLE ...), when it has one. */
export function nursingErrorCode(error: unknown): string {
	if (!axios.isAxiosError(error)) return ''
	const detail = (error.response?.data as { detail?: { code?: unknown } } | undefined)?.detail
	return typeof detail?.code === 'string' ? detail.code : ''
}

const quiet = { suppressErrorToast: true } as const

export type CreateScheduledInput = {
	selection: Selection
	visits: VisitInput[]
	patientPublicId?: string
	address: VisitAddress
	note?: string
}

/** POST /requests/scheduled: no nurse is chosen, the server assigns one per visit. Returns the order. */
export async function createScheduledOrder(input: CreateScheduledInput): Promise<NursingOrder> {
	const body: Record<string, unknown> = { visits: input.visits, address: input.address, payment_method: PAY_AFTER_VISIT }
	if ('packageId' in input.selection) body.package_id = input.selection.packageId
	else body.procedure_ids = input.selection.procedureIds
	if (input.patientPublicId) body.patient_public_id = input.patientPublicId
	if (input.note?.trim()) body.note = input.note.trim()
	const res = await ApiService.post<Envelope<NursingOrder>>(API_ENDPOINTS.ANCILLARY.REQUESTS_SCHEDULED, body, quiet)
	return res.data.data
}

export type CreateInstantInput = {
	selection: Selection
	patientPublicId?: string
	address: VisitAddress
	note?: string
}

/** POST /patient/requests (Book now). Returns the request id. 409 ACTIVE_TASK_EXISTS: the patient already has one open request. */
export async function createInstantRequest(input: CreateInstantInput): Promise<string> {
	const body: Record<string, unknown> = {
		bookingType: 'INSTANT',
		paymentMethod: PAY_AFTER_VISIT,
		address: {
			streetAddress: input.address.street_address,
			latitude: input.address.latitude,
			longitude: input.address.longitude,
			label: input.address.label,
		},
	}
	if ('packageId' in input.selection) body.packageId = input.selection.packageId
	else body.serviceTypeIds = input.selection.procedureIds
	if (input.patientPublicId) body.patientPublicId = input.patientPublicId
	if (input.note?.trim()) body.careInstructions = input.note.trim().slice(0, 500)
	const res = await ApiService.post<Envelope<{ requestId?: string; publicBookingId?: string }>>(API_ENDPOINTS.ANCILLARY.REQUESTS, body, quiet)
	return String(res.data.data.requestId ?? res.data.data.publicBookingId ?? '')
}

/** GET /patient/requests/active: the patient's open instant request, or null. */
export async function fetchActiveRequestId(): Promise<string | null> {
	try {
		const res = await ApiService.get<Envelope<{ activeRequest?: { requestId?: string; publicBookingId?: string; id?: string } } | null>>(
			API_ENDPOINTS.ANCILLARY.ACTIVE_REQUEST,
			quiet
		)
		const active = res.data?.data?.activeRequest
		const id = active?.requestId ?? active?.publicBookingId ?? active?.id
		return id ? String(id) : null
	} catch {
		return null
	}
}

/** GET /patient/requests/{id}/status: the order, for both kinds. The structured address comes back as `address_detail` (the plain `address` is a string). */
export async function fetchOrder(requestId: string): Promise<NursingOrder> {
	const res = await ApiService.get<Envelope<NursingOrder & { address_detail?: NursingOrder['address'] }>>(API_ENDPOINTS.ANCILLARY.REQUEST_STATUS(requestId), quiet)
	return normaliseOrder(res.data.data)
}

/** Order shape fixes shared by the status call and the websocket pushes. */
export function normaliseOrder(data: NursingOrder & { address_detail?: NursingOrder['address'] }): NursingOrder {
	const legacy = data.address as unknown
	const address = typeof legacy === 'string' || legacy == null ? (data.address_detail ?? (typeof legacy === 'string' ? { street_address: legacy } : null)) : data.address
	return {
		...data,
		request_public_id: data.request_public_id ?? data.requestId ?? '',
		address,
		visits: Array.isArray(data.visits) ? data.visits : [],
		services: Array.isArray(data.services) ? data.services : [],
	}
}

export async function cancelOrder(requestId: string, reason?: string): Promise<void> {
	await ApiService.post(API_ENDPOINTS.ANCILLARY.CANCEL(requestId), reason ? { reason } : {}, quiet)
}

/** All of the chosen visits or none (409 CANCEL_WINDOW_CLOSED / VISIT_NOT_CANCELLABLE). Cancelling the last open visit cancels the order. */
export async function cancelVisits(requestId: string, visitPublicIds: string[], reason?: string): Promise<void> {
	await ApiService.post(API_ENDPOINTS.ANCILLARY.CANCEL_VISITS(requestId), { visit_public_ids: visitPublicIds, ...(reason ? { reason } : {}) }, quiet)
}

/** Moves ONE visit (it keeps its length). 409 VISIT_NOT_RESCHEDULABLE / SLOT_UNAVAILABLE / DAY_TAKEN. */
export async function rescheduleVisit(requestId: string, visitPublicId: string, date: string, startTime: string): Promise<void> {
	await ApiService.post(API_ENDPOINTS.ANCILLARY.RESCHEDULE_VISIT(requestId, visitPublicId), { date, start_time: startTime }, quiet)
}

/** Adds a tip or raises it (the new total, 1..100), only while nobody has accepted. A raise asks the nurses again. */
export async function setTip(requestId: string, amount: number): Promise<void> {
	await ApiService.put(API_ENDPOINTS.ANCILLARY.TIP(requestId), { amount }, quiet)
}

/** Asks the nearby nurses again. 409 ALREADY_ASSIGNED / REQUEST_CLOSED, 429 SEARCH_AGAIN_TOO_SOON (about 30 s apart). */
export async function searchAgain(requestId: string): Promise<{ notified: number; message: string }> {
	const res = await ApiService.post<Envelope<{ notifiedProviders?: number }>>(API_ENDPOINTS.ANCILLARY.SEARCH_AGAIN(requestId), {}, quiet)
	return { notified: Number(res.data?.data?.notifiedProviders) || 0, message: text(res.data?.message) }
}

// ---------------------------------------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------------------------------------

export type NursingReview = { id: string; rating: number; comment: string }

export async function fetchReview(requestId: string): Promise<NursingReview | null> {
	try {
		const res = await ApiService.get<Envelope<{ id?: string | number; rating?: number; comment?: string } | null>>(API_ENDPOINTS.ANCILLARY.REVIEW_BY_BOOKING(requestId), quiet)
		const r = res.data?.data
		return r?.id ? { id: String(r.id), rating: Number(r.rating) || 0, comment: text(r.comment) } : null
	} catch {
		return null
	}
}

export async function submitReview(requestId: string, rating: number, comment: string): Promise<void> {
	await ApiService.post(API_ENDPOINTS.ANCILLARY.REVIEWS, { booking_id: requestId, rating, comment: comment.trim() || undefined }, quiet)
}
