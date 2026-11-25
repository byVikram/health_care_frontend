// src/features/lab/labStyles.ts
//
// Style pieces the Lab tests pages share (the item panels' colours and icons; the card and headings every booking page shares are in features/booking/bookingStyles).
import { DESK_MEDIA } from '../../styles/deskTokens'
import { LAB_CONCERNS, LAB_ICONS, type LabItem } from './labConstants'

type MediaTone = keyof typeof DESK_MEDIA

/** Which panel colour a health concern gets. */
const CONCERN_TONE: Record<string, MediaTone> = {
	diabetes: 'blue',
	thyroid: 'lilac',
	heart: 'peach',
	vitamins: 'sand',
	kidney: 'teal',
	liver: 'peach',
	fever: 'red',
	women: 'pink',
}

const TONES = Object.keys(DESK_MEDIA) as MediaTone[]

const HEART_PULSE = 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10zM7 12h3l1.5-3 2 5 1.5-2H17'

const hash = (text: string) => [...text].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7)

/** The tinted panel behind a card's icon: the item's first health concern decides the colour and icon (the API has no pictures). */
export function mediaOf(item: LabItem) {
	const concern = LAB_CONCERNS.find((c) => item.tags.includes(c.id))
	const tone = (concern && CONCERN_TONE[concern.id]) || TONES[hash(item.id) % TONES.length]
	const [light, deep, ink] = DESK_MEDIA[tone]
	const icon = item.kind === 'package' ? HEART_PULSE : (concern?.icon ?? LAB_ICONS.flask)
	return { light, deep, ink, icon }
}

/** "32% off" when the item sells below its MRP, else ''. */
export function offLabel(item: Pick<LabItem, 'price' | 'mrp'>) {
	if (!(item.mrp > item.price) || item.mrp <= 0) return ''
	return `${Math.round((1 - item.price / item.mrp) * 100)}% off`
}

/** Fasting is only known once an item's detail (its preparation notes) has been loaded. */
export const fastingKnown = (item: LabItem) => item.preparations !== undefined
