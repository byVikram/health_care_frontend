// src/components/common/DateSlotPicker/slotGroups.ts
//
// Turns a plain list of start times ("07:00", "14:30") into the Morning / Afternoon / Evening groups DateSlotPicker draws, for the flows whose API
// sends times rather than slot objects (Lab Tests, the home-care services). `isUnavailable` greys a time out (it is too soon, or taken) so it cannot be picked.
import type { SlotGroup, TimeSlot } from './DateSlotPicker'

const PARTS = [
	{ label: 'Morning', range: 'Before 12 PM', from: 0, to: 12 },
	{ label: 'Afternoon', range: '12 PM to 5 PM', from: 12, to: 17 },
	{ label: 'Evening', range: 'After 5 PM', from: 17, to: 24 },
]

const hourOf = (hhmm: string) => Number(hhmm.split(':')[0])

export function slotGroupsFromTimes(times: string[], isUnavailable?: (time: string) => boolean): SlotGroup[] {
	return PARTS.map((part) => ({
		label: part.label,
		range: part.range,
		slots: times
			.filter((t) => hourOf(t) >= part.from && hourOf(t) < part.to)
			.map<TimeSlot>((t) => ({
				start_time: t,
				end_time: t,
				status: 'AVAILABLE',
				is_enabled: true,
				// an unavailable time is drawn like a taken slot: greyed and not clickable
				is_booked: !!isUnavailable?.(t),
				can_toggle: false,
			})),
	})).filter((group) => group.slots.length > 0)
}
