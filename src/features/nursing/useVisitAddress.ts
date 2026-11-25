// src/features/nursing/useVisitAddress.ts
//
// Turns the chosen saved address into what the booking calls want: {street_address, latitude, longitude, label}. A nurse is matched by distance,
// so a position is required. A saved address that has none uses the browser's location (the native app does the same with the phone's GPS);
// with neither, the booking is refused with a message instead of being sent. Also the "Use current location" helper of the address dialog.
import { toast } from 'react-toastify'
import { locate, type Coords } from '../../hooks/useCurrentLocation'
import type { PatientAddressOut } from '../patient/patientService'
import type { VisitAddress } from './nursingService'

export type { Coords }

/** "14, 2nd Cross, Bengaluru, Karnataka - 560053": the text the booking carries (like the native app). */
export const bookingAddressText = (a: Pick<PatientAddressOut, 'address_line' | 'city' | 'state' | 'pincode'>) =>
	[a.address_line, a.city, a.state].filter(Boolean).join(', ') + (a.pincode ? ` - ${a.pincode}` : '')

/** The address for a booking, or null (after telling the patient why) when it cannot be placed on the map. */
export async function resolveBookingAddress(address: PatientAddressOut | undefined): Promise<VisitAddress | null> {
	if (!address) {
		toast.info('Add the visit address first')
		return null
	}
	let latitude = address.latitude
	let longitude = address.longitude
	if (latitude == null || longitude == null) {
		const here = await locate()
		latitude = here?.latitude
		longitude = here?.longitude
	}
	if (latitude == null || longitude == null) {
		toast.error("We couldn't place this address on the map. Allow location access, or add the address again with its PIN code.")
		return null
	}
	return { street_address: bookingAddressText(address), latitude, longitude, label: address.label }
}
