// src/features/booking/bookingStyles.ts
//
// Style pieces the Lab tests and home-care booking pages share: the card the design puts every block in, the section headings and the choice cards.
import { DESK } from '../../styles/deskTokens'

/** The white, rounded, thin-bordered card of the booking designs. */
export const BOOKING_CARD = {
	bgcolor: DESK.raised,
	border: `1px solid ${DESK.cardLine}`,
	borderRadius: '18px',
} as const

/** The 22px section title ("Health packages", "Single tests", "Who is it for?"). */
export const BOOKING_H2 = { m: 0, fontSize: 22, lineHeight: '28px', fontWeight: 800 } as const

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
