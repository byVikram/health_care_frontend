// src/features/nursing/nursingFormat.ts
//
// Small labels shared by the Nursing care cards, the cart and the details panel.
import type { NursingItem } from './nursingService'

/** "12% off" when the item sells below its MRP, else ''. */
export const offLabel = (item: Pick<NursingItem, 'price' | 'mrp'>): string =>
	item.mrp != null && item.mrp > item.price && item.mrp > 0 ? `${Math.round((1 - item.price / item.mrp) * 100)}% off` : ''

/** "45 mins" / "2 hr"; '' when the API gave no duration. */
export const durationLabel = (minutes: number | null): string =>
	minutes ? (minutes >= 60 && minutes % 60 === 0 ? `${minutes / 60} hr` : `${minutes} mins`) : ''
