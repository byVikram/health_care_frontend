// src/features/nursing/careServices.ts
//
// The home-care services the web books through ONE flow (browse -> who / where / when -> review -> Book now or Later -> order), the same way the native
// app does: only the words change per service (the native app's ancillaryCatalogCopy.ts). The service key is the backend's specialty id.
//   nursing-care, physiotherapy, rehab-care, home-care, medical-equipment
// Nursing keeps its own addresses (/nursing-care/...); the others live under /care/<service>/... .
import { NURSING_ICONS } from './nursingConstants'

export type CareServiceKey = 'nursing-care' | 'physiotherapy' | 'rehab-care' | 'home-care' | 'medical-equipment'

export type CareCopy = {
	key: CareServiceKey
	/** "Nursing Care" (the backend's label). */
	label: string
	/** "Nursing care". */
	sentence: string
	/** "nurse", "physiotherapist" ... */
	noun: string
	nouns: string
	/** "Nurse". */
	nounTitle: string
	/** "Nursing care at home". */
	title: string
	/** The line under the hero title. */
	tagline: string
	searchPlaceholder: string
	/** Said by screen readers for the search box. */
	searchLabel: string
	/** What the search examples are ("Try “injection” or “dressing”"). */
	emptySearchHint: string
	/** The single-service kind ("NURSING PROCEDURE", "PHYSIOTHERAPY SERVICE"). */
	serviceKind: string
	packageKind: string
	/** Section titles of the list. */
	servicesTitle: string
	servicesSubtitle: string
	packagesSubtitle: string
	/** The short word for one single service in counts ("procedure" / "service"). */
	serviceWord: [string, string]
	/** The trust tiles of the hero (icon is a DESK_ICONS key). */
	trust: { icon: 'shield' | 'package' | 'lock' | 'home' | 'file' | 'user'; label: string }[]
	/** Icon of the breadcrumb / header. */
	icon: string
	/** Nursing only: the helpline card and the "first visit" vitals card of the design. */
	hasHelpline: boolean
}

const NOUNS: Record<CareServiceKey, [string, string]> = {
	'nursing-care': ['nurse', 'nurses'],
	physiotherapy: ['physiotherapist', 'physiotherapists'],
	'rehab-care': ['rehab therapist', 'rehab therapists'],
	'home-care': ['caregiver', 'caregivers'],
	'medical-equipment': ['technician', 'technicians'],
}

const LABELS: Record<CareServiceKey, string> = {
	'nursing-care': 'Nursing Care',
	physiotherapy: 'Physiotherapy',
	'rehab-care': 'Rehab Care',
	'home-care': 'Home Care',
	'medical-equipment': 'Medical Equipment',
}

const SEARCH_PLACEHOLDERS: Record<CareServiceKey, string> = {
	'nursing-care': 'Search “injection”, “wound dressing”, “IV drip”, “vitals check”, “elder care”',
	physiotherapy: 'Search physiotherapy, e.g. back pain, knee pain, neck pain',
	'rehab-care': 'Search rehab services, e.g. stroke recovery, cardiac rehab',
	'home-care': 'Search care tasks, e.g. bathing, mobility help, meal preparation',
	'medical-equipment': 'Search equipment, e.g. wheelchair, oxygen concentrator, hospital bed',
}

const TAGLINES: Record<CareServiceKey, string> = {
	'nursing-care': 'Qualified nurses for injections, wound care, IV drips and elder care. Book a visit now or schedule for later.',
	physiotherapy: 'Qualified physiotherapists for back, knee and neck pain and recovery after surgery, at your home. Book a visit now or schedule for later.',
	'rehab-care': 'Rehab therapists for stroke, cardiac and joint-replacement recovery, at your home. Book a visit now or schedule for later.',
	'home-care': 'Caregivers for bathing, mobility, meals and company, at your home. Book a visit now or schedule for later.',
	'medical-equipment': 'Wheelchairs, oxygen concentrators, hospital beds and more, set up at your home by a technician. Book a visit now or schedule for later.',
}

const EMPTY_HINTS: Record<CareServiceKey, string> = {
	'nursing-care': 'Try “dressing” or “injection”, or clear your filters.',
	physiotherapy: 'Try “back pain” or “knee”, or clear your filters.',
	'rehab-care': 'Try “stroke” or “cardiac”, or clear your filters.',
	'home-care': 'Try “bathing” or “mobility”, or clear your filters.',
	'medical-equipment': 'Try “wheelchair” or “oxygen”, or clear your filters.',
}

const ICONS: Record<CareServiceKey, string> = {
	'nursing-care': NURSING_ICONS.syringe,
	physiotherapy: NURSING_ICONS.vitals,
	'rehab-care': NURSING_ICONS.vitals,
	'home-care': NURSING_ICONS.elder,
	'medical-equipment': NURSING_ICONS.kit,
}

export const CARE_SERVICE_KEYS = Object.keys(LABELS) as CareServiceKey[]

export const isCareServiceKey = (value: string | undefined | null): value is CareServiceKey => !!value && (CARE_SERVICE_KEYS as string[]).includes(value)

export function careCopy(key: CareServiceKey): CareCopy {
	const isNursing = key === 'nursing-care'
	const label = LABELS[key]
	const sentence = label.charAt(0) + label.slice(1).toLowerCase()
	const [noun, nouns] = NOUNS[key]
	const lower = sentence.toLowerCase()
	return {
		key,
		label,
		sentence,
		noun,
		nouns,
		nounTitle: noun.charAt(0).toUpperCase() + noun.slice(1),
		title: `${sentence} at home`,
		tagline: TAGLINES[key],
		searchPlaceholder: SEARCH_PLACEHOLDERS[key],
		searchLabel: `Search ${lower} services and packages`,
		emptySearchHint: EMPTY_HINTS[key],
		serviceKind: isNursing ? 'NURSING PROCEDURE' : `${label.toUpperCase()} SERVICE`,
		packageKind: 'CARE PACKAGE',
		servicesTitle: isNursing ? 'Nursing procedures' : `${label} services`,
		servicesSubtitle: `A ${isNursing ? 'qualified' : 'verified'} ${noun} visits your home for each one`,
		packagesSubtitle: isNursing ? 'Multi-day nursing plans at your home' : `Multi-visit ${lower} plans at your home`,
		serviceWord: isNursing ? ['procedure', 'procedures'] : ['service', 'services'],
		trust: isNursing
			? [
					{ icon: 'shield', label: 'Verified, qualified nurses' },
					{ icon: 'package', label: 'Sterile supplies included' },
					{ icon: 'lock', label: 'Start code shared before every visit' },
					{ icon: 'home', label: 'Care at your home, pay after the visit' },
				]
			: [
					{ icon: 'shield', label: `Background-verified ${nouns}` },
					{ icon: 'home', label: 'Care at your home' },
					{ icon: 'lock', label: 'Start code shared before every visit' },
					{ icon: 'file', label: 'Pay after your visit' },
				],
		icon: ICONS[key],
		hasHelpline: isNursing,
	}
}

export type CarePage = 'home' | 'schedule' | 'review' | 'matching' | 'booked' | 'order'

const SUFFIX: Record<CarePage, string> = {
	home: '',
	schedule: '/schedule',
	review: '/review',
	matching: '/finding/',
	booked: '/booked/',
	order: '/orders/',
}

/** The address of a page of a service: nursing keeps /nursing-care/..., the others are /care/<service>/... . `requestId` is for matching / booked / order. */
export function carePath(key: CareServiceKey, page: CarePage, requestId?: string): string {
	const base = key === 'nursing-care' ? '/nursing-care' : `/care/${key}`
	return `${base}${SUFFIX[page]}${requestId ?? ''}`
}

/** What a booking row / an order says its service is, as a key this flow can open (null when the web has no page for it). */
export const careKeyOf = (specialty: string | { key?: string | null; label?: string | null } | null | undefined): CareServiceKey | null => {
	const raw = typeof specialty === 'string' ? specialty : (specialty?.key ?? '')
	return isCareServiceKey(raw) ? raw : null
}
