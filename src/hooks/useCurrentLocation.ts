// src/hooks/useCurrentLocation.ts
//
// The browser's position, in one place (it was written out five times: the Lab cart, home-care addresses, the doctor search, the doctor page
// and the city picker). `getBrowserPosition` is the one call to the browser; `useCurrentLocation` is the "Use current location" helper of an
// address form (it tells the user when the position could not be had).
import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'

export type Coords = { latitude: number; longitude: number }

export type PositionResult =
	| { coords: Coords; denied: false; unsupported: false }
	| { coords: null; /** the user (or the browser settings) refused */ denied: boolean; /** the browser has no geolocation */ unsupported: boolean }

/** Asks the browser for its position once. It never rejects: it says why there is none (refused, unsupported or timed out). */
export const getBrowserPosition = (options: PositionOptions = { timeout: 10_000 }): Promise<PositionResult> =>
	new Promise((resolve) => {
		if (typeof navigator === 'undefined' || !navigator.geolocation) {
			resolve({ coords: null, denied: false, unsupported: true })
			return
		}
		navigator.geolocation.getCurrentPosition(
			(position) => resolve({ coords: { latitude: position.coords.latitude, longitude: position.coords.longitude }, denied: false, unsupported: false }),
			(err) => resolve({ coords: null, denied: err.code === err.PERMISSION_DENIED, unsupported: false }),
			options
		)
	})

/** The browser's position, or null when it is unavailable or refused. */
export const locate = async (options?: PositionOptions): Promise<Coords | null> => (await getBrowserPosition(options)).coords

/** "Use current location": the position starts a new address (the street and PIN code are still typed). */
export function useCurrentLocation(onFound: (coords: Coords) => void) {
	const [locating, setLocating] = useState(false)
	const start = useCallback(async () => {
		setLocating(true)
		const here = await getBrowserPosition()
		setLocating(false)
		if (here.coords) onFound(here.coords)
		else if (here.unsupported) toast.error('Your browser cannot share your location. Please type the address.')
		else toast.error('We could not get your location. Allow location access, or type the address.')
	}, [onFound])
	return { locating, start }
}
