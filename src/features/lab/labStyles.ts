// src/features/lab/labStyles.ts
//
// Style pieces the Lab tests pages share (the card the design puts every block in, the section headings, the item panels' colours and icons).
import { DESK, DESK_MEDIA } from '../../styles/deskTokens'
import { LAB_CONCERNS, LAB_ICONS, type LabItem } from './labConstants'

/** The white, rounded, thin-bordered card of the Lab tests design. */
export const LAB_CARD = {
	bgcolor: DESK.raised,
	border: `1px solid ${DESK.cardLine}`,
	borderRadius: '18px',
} as const

/** The 22px section title ("Health packages", "Single tests", "Who is it for?"). */
export const LAB_H2 = { m: 0, fontSize: 22, lineHeight: '28px', fontWeight: 800 } as const

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

/** A choice card's border / background for the chosen and not-chosen states (who, where, lab and address cards on the cart page). */
export const choiceSx = (on: boolean) =>
	({
		border: `1.5px solid ${on ? DESK.primary : DESK.cardLine}`,
		bgcolor: on ? DESK.primaryTint : DESK.raised,
		fontFamily: 'inherit',
		color: DESK.ink,
		cursor: 'pointer',
		textAlign: 'left',
	}) as const
