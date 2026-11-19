// src/features/lab/useLabSlots.ts
//
// The free times of every lab that can do the cart on one day (GET /api/laboratory/slots), plus what the same answer says about each lab:
// its logo and (for a lab visit) its distance. Logos and distances are remembered across days: a lab with no time left today still shows
// them, taken from tomorrow's answer.
import { useCallback, useEffect, useState } from 'react'
import { fetchSlots, labErrorMessage, type LabServiceType } from './labService'

type Params = {
	addressId: string | null
	cart: string[]
	service: LabServiceType
	/** 'YYYY-MM-DD' of the day shown, and of the next one (read once for the logos). */
	date: string
	nextDate: string
	/** Nothing is asked while no lab can do the cart. */
	enabled: boolean
}

export function useLabSlots({ addressId, cart, service, date, nextDate, enabled }: Params) {
	const [timesByLab, setTimesByLab] = useState<Record<number, string[]>>({})
	const [logos, setLogos] = useState<Record<number, string>>({})
	const [distances, setDistances] = useState<Record<number, number>>({})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [tick, setTick] = useState(0)
	const cartKey = cart.join(',')
	const ready = enabled && !!addressId && !!cartKey

	useEffect(() => {
		setTimesByLab({})
		setError(null)
		if (!ready || !addressId) {
			setLoading(false)
			return
		}
		let active = true
		const load = async () => {
			setLoading(true)
			try {
				const res = await fetchSlots({ addressId, itemIds: cartKey.split(','), date, service })
				if (!active) return
				const times: Record<number, string[]> = {}
				const nextLogos: Record<number, string> = {}
				const nextDistances: Record<number, number> = {}
				res.labs.forEach((l) => {
					times[l.lab_id] = l.times
					if (l.logo_url) nextLogos[l.lab_id] = l.logo_url
					if (l.distance_km != null) nextDistances[l.lab_id] = l.distance_km
				})
				setTimesByLab(times)
				setLogos((cur) => ({ ...cur, ...nextLogos }))
				setDistances((cur) => ({ ...cur, ...nextDistances }))
			} catch (e) {
				if (active) setError(labErrorMessage(e))
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [ready, addressId, cartKey, service, date, tick])

	// A second, silent read of the next day, only to learn the logo / distance of a lab that has no time left on the first day.
	useEffect(() => {
		if (!ready || !addressId) return
		let active = true
		const load = async () => {
			try {
				const res = await fetchSlots({ addressId, itemIds: cartKey.split(','), date: nextDate, service })
				if (!active) return
				setLogos((cur) => ({
					...Object.fromEntries(res.labs.filter((l) => l.logo_url).map((l) => [l.lab_id, l.logo_url as string])),
					...cur,
				}))
				setDistances((cur) => ({
					...Object.fromEntries(res.labs.filter((l) => l.distance_km != null).map((l) => [l.lab_id, l.distance_km as number])),
					...cur,
				}))
			} catch {
				// logos and distances are cosmetic: the lab icon stands in
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [ready, addressId, cartKey, service, nextDate])

	const retry = useCallback(() => setTick((n) => n + 1), [])

	return { timesByLab, logos, distances, loading, error, retry }
}
