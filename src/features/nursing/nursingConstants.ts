// src/features/nursing/nursingConstants.ts
//
// Fixed pieces of the Nursing care flow: the filter tabs, the colours and icons of the cards (the API has no pictures, so a card gets a
// tinted panel from its first matching keyword), the tip choices and the cancel reasons (the native app's lists).
import { DESK_MEDIA } from '../../styles/deskTokens'
import type { NursingItem } from './nursingService'

export type NursingTypeId = 'all' | 'packages' | 'procedures'

const SYRINGE = 'M18 2l4 4M17 7l3-3M19 9l-8.7 8.7a2 2 0 0 1-2.8 0l-2.2-2.2a2 2 0 0 1 0-2.8L14 4M9 11l4 4M5 19l-3 3M14 4l6 6'
const WOUND = 'M18.5 5.5a3.5 3.5 0 0 0-5 0l-8 8a3.5 3.5 0 0 0 5 5l8-8a3.5 3.5 0 0 0 0-5zM10 10h.01M14 14h.01M10 14h.01M14 10h.01'
const DRIP = 'M8 3h8v7a4 4 0 0 1-8 0zM8 7h8M12 14v3M12 17c0 2 1 4 4 4'
const ELDER = 'M3 11l9-7 9 7M5 10v10h14V10M12 17.5s-3-1.8-3-4a1.5 1.5 0 0 1 3-.8 1.5 1.5 0 0 1 3 .8c0 2.2-3 4-3 4z'
const VITALS = 'M3 12h4l2-4 4 8 2-4h6'
const SURGERY = 'M8 3h8M9 3v18M15 3v18M9 11h6M6 21h6M12 21h6'
const CATHETER = 'M6 3v6a6 6 0 0 0 12 0V3M12 15v6M9 21h6'
const CRITICAL = 'M3 4h18v12H3zM8 20h8M12 16v4M6 10h3l2-3 2 6 2-3h3'
const KIT = 'M4 8h16v12H4zM9 8V5h6v3M12 11v6M9 14h6'
const PACKAGE = 'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8'

export const NURSING_ICONS = { syringe: SYRINGE, package: PACKAGE, kit: KIT, elder: ELDER, vitals: VITALS } as const

/** The icon of a card or a "Care for" chip: the first keyword of its text that matches, else the medical kit. */
const ICON_RULES: [RegExp, string][] = [
	[/inject|vaccin|shot/i, SYRINGE],
	[/wound|dress|bandage|ulcer|burn/i, WOUND],
	[/\biv\b|drip|infus|cannula/i, DRIP],
	[/elder|geriatric|senior|care nurse/i, ELDER],
	[/vital|bp|pressure|sugar|glucose|spo2/i, VITALS],
	[/surg|post-op|stitch|suture/i, SURGERY],
	[/catheter|urin/i, CATHETER],
	[/critical|trach|ventilat|icu|suction/i, CRITICAL],
]

export const iconFor = (text: string): string => ICON_RULES.find(([re]) => re.test(text))?.[1] ?? KIT

type MediaTone = keyof typeof DESK_MEDIA
const TONES: MediaTone[] = ['teal', 'blue', 'lilac', 'peach', 'sand']

const hash = (text: string) => [...text].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7)

/** The tinted panel behind a card's icon: a stable colour per item, and the icon its name / category suggests (a package gets the box). */
export function mediaOf(item: Pick<NursingItem, 'id' | 'kind' | 'name' | 'categoryName'>) {
	const [light, deep, ink] = DESK_MEDIA[TONES[hash(item.id) % TONES.length]]
	const icon = item.kind === 'package' ? PACKAGE : iconFor(`${item.name} ${item.categoryName}`)
	return { light, deep, ink, icon }
}

/** The "Care for" chips cycle through these (the design's mint / peach / sky / sand / lilac tints). */
export const CATEGORY_TINTS = [
	{ bg: '#E3EFEF', ink: '#2B6F71' },
	{ bg: '#FDE8DC', ink: '#B4532A' },
	{ bg: '#DDEBFA', ink: '#2463A8' },
	{ bg: '#FBEFD5', ink: '#8A5300' },
	{ bg: '#ECE6FA', ink: '#6A4BB5' },
] as const

export const NURSING_TYPES: { id: NursingTypeId; label: string; icon: string }[] = [
	{ id: 'all', label: 'All', icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
	{ id: 'packages', label: 'Packages', icon: PACKAGE },
	{ id: 'procedures', label: 'Procedures', icon: SYRINGE },
]

/** The tip choices while finding a nurse (rupees added to what was tipped), the popular one and the server's largest total tip. */
export const TIP_OPTIONS = [20, 30, 50]
export const POPULAR_TIP = 30
export const TIP_MAX = 100
/** No acceptance this long after the nurses were last asked: offer to search again or to schedule instead. */
export const NO_ACCEPT_SECONDS = 5 * 60

/** Why a patient cancels a request that is still searching (the native app's list). */
export const SEARCH_CANCEL_REASONS = [
	'Wait time is too long',
	'Booked by mistake / wrong address',
	'Patient condition improved / no longer required',
	'Found alternative care professional',
	'Other reason',
]

/** Why a patient cancels visits of a scheduled order. */
export const VISIT_CANCEL_REASONS = ['Plans changed', 'Feeling better', 'Booked by mistake', 'Other']
