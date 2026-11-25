// src/features/nursing/nursingRebook.ts
//
// Puts the services of an order back in the booking cart ("Book again", "Schedule instead"). The order only carries the ids and names of what it
// had, so the items are looked up in the catalogue again (their current prices and durations). Says how many could not be put back (no longer on sale); `ok` is false when none of them is left.
import { nursingBooking } from './nursingBookingStore'
import { fetchCatalogue, type NursingItem, type NursingOrder } from './nursingService'

export async function restoreCartFromOrder(order: Pick<NursingOrder, 'services' | 'package'>, serviceKey: string): Promise<{ ok: boolean; missing: number }> {
	const catalogue = await fetchCatalogue(serviceKey)
	const items: NursingItem[] = []
	let wanted = 1
	if (order.package?.id) {
		const pkg = catalogue.packages.find((p) => p.id === order.package?.id)
		if (pkg) items.push(pkg)
	} else {
		wanted = order.services.length
		for (const s of order.services) {
			const procedure = catalogue.procedures.find((p) => p.id === s.id)
			if (procedure) items.push(procedure)
		}
	}
	if (items.length === 0) return { ok: false, missing: wanted }
	nursingBooking.set({ serviceKey, items, dates: [], time: null, timesByDate: {}, sameTime: true })
	return { ok: true, missing: wanted - items.length }
}
