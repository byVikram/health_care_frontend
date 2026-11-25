// src/features/lab/labSlotCheck.ts
//
// Whether the picked Lab time is still offered. The rule about which times can be booked ("at least an hour ahead, India time") belongs to the
// server, which also checks it again when the order is placed; the page only asks it, instead of keeping its own copy of the rule (a copy that
// read India's clock times as the browser's and was wrong outside India). A failed call counts as "still offered": placing the order is the
// real check, and a network drop must not throw a good pick away.
import { fetchSlots } from './labService'
import type { LabBookingState } from './labBookingStore'

export async function slotStillOffered(b: Pick<LabBookingState, 'addressId' | 'cart' | 'where' | 'lab' | 'slot'>): Promise<boolean> {
	if (!b.slot || !b.lab || !b.addressId) return true
	try {
		const res = await fetchSlots({
			addressId: b.addressId,
			itemIds: b.cart,
			date: b.slot.date,
			service: b.where === 'home' ? 'HOME_SAMPLE' : 'CENTER_VISIT',
			labId: b.lab.id,
		})
		const lab = res.labs.find((l) => l.lab_id === b.lab?.id)
		return !!lab && lab.times.includes(b.slot.time)
	} catch {
		return true
	}
}
