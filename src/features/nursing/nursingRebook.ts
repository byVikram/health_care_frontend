// src/features/nursing/nursingRebook.ts
//
// Puts the services of an order back in the booking cart ("Book again", "Schedule instead"). The order only carries the ids and names of what it
// had, so the items are looked up in the catalogue again (their current prices and durations). Returns false when none of them is on sale any more.
import { nursingBooking } from './nursingBookingStore'
import { fetchCatalogue, type NursingItem, type NursingOrder } from './nursingService'

export async function restoreCartFromOrder(order: Pick<NursingOrder, 'services' | 'package'>, serviceKey: string): Promise<boolean> {
	const catalogue = await fetchCatalogue(serviceKey)
	const items: NursingItem[] = []
	if (order.package?.id) {
		const pkg = catalogue.packages.find((p) => p.id === order.package?.id)
		if (pkg) items.push(pkg)
	} else {
		for (const s of order.services) {
			const procedure = catalogue.procedures.find((p) => p.id === s.id)
			if (procedure) items.push(procedure)
		}
	}
	if (items.length === 0) return false
	nursingBooking.set({ serviceKey, items, dates: [], time: null, timesByDate: {}, sameTime: true })
	return true
}
