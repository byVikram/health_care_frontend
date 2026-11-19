// src/features/lab/useLabCartCheck.ts
//
// The two live checks behind the cart page: which labs can do the whole cart at the chosen address (availability) and what each of them
// charges (quote, cheapest first). Re-runs when the address or the cart changes; a failure is returned as text with a `retry`.
import { useCallback, useEffect, useState } from 'react'
import { fetchAvailability, fetchQuote, labErrorMessage, type ApiAvailability, type ApiQuote } from './labService'

export type LabCartCheck = { availability: ApiAvailability; quote: ApiQuote }

export function useLabCartCheck(addressId: string | null, cart: string[]) {
	const [check, setCheck] = useState<LabCartCheck | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [tick, setTick] = useState(0)
	const cartKey = cart.join(',')

	useEffect(() => {
		setCheck(null)
		setError(null)
		if (!addressId || !cartKey) {
			setLoading(false)
			return
		}
		let active = true
		const ids = cartKey.split(',')
		const run = async () => {
			setLoading(true)
			try {
				const [availability, quote] = await Promise.all([fetchAvailability(addressId, ids), fetchQuote(addressId, ids)])
				if (active) setCheck({ availability, quote })
			} catch (e) {
				if (active) setError(labErrorMessage(e))
			} finally {
				if (active) setLoading(false)
			}
		}
		void run()
		return () => {
			active = false
		}
	}, [addressId, cartKey, tick])

	const retry = useCallback(() => setTick((n) => n + 1), [])

	return { check, loading, error, retry }
}
