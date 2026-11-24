// src/features/nursing/useVisitAddress.ts
//
// Turns the chosen saved address into what the booking calls want: {street_address, latitude, longitude, label}. A nurse is matched by distance,
// so a position is required. A saved address that has none uses the browser's location (the native app does the same with the phone's GPS);
// with neither, the booking is refused with a message instead of being sent. Also the "Use current location" helper of the address dialog.
import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import type { PatientAddressOut } from '../patient/patientService'
import type { VisitAddress } from './nursingService'

export type Coords = { latitude: number; longitude: number }

/** The browser's position, or null when it is unavailable or refused. */
export const locate = (): Promise<Coords | null> =>
	new Promise((resolve) => {
		if (typeof navigator === 'undefined' || !navigator.geolocation) {
			resolve(null)
			return
		}
		navigator.geolocation.getCurrentPosition(
			(position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
			() => resolve(null),
			{ timeout: 10_000 }
		)
	})

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

/** "Use current location": the position starts a new address (the street and PIN code are still typed). */
export function useCurrentLocation(onFound: (coords: Coords) => void) {
	const [locating, setLocating] = useState(false)
	const start = useCallback(async () => {
		setLocating(true)
		const here = await locate()
		setLocating(false)
		if (here) onFound(here)
		else toast.error('We could not get your location. Allow location access, or type the address.')
	}, [onFound])
	return { locating, start }
}
