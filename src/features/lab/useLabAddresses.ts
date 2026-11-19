// src/features/lab/useLabAddresses.ts
//
// The signed-in patient's saved addresses (the lab availability / slots / quote are checked against one of them) and a way to save a new
// one ("Type an address"). Uses the same calls as the profile's Addresses tab (features/patient/patientService.ts).
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { addPatientAddress, getPatientAddresses, type PatientAddressCreate, type PatientAddressOut } from '../patient/patientService'
import { labErrorMessage } from './labService'

export type LabAddress = PatientAddressOut

/** "14, 2nd Cross, Chickpet, Bengaluru 560053" */
export const addressLineOf = (a: Pick<PatientAddressOut, 'address_line' | 'city' | 'pincode'>) =>
	[a.address_line, a.city, a.pincode].filter(Boolean).join(', ')

export function useLabAddresses() {
	const { role, accessToken } = useAuth()
	const enabled = !!accessToken && role === 'patient'
	const [addresses, setAddresses] = useState<LabAddress[]>([])
	const [loading, setLoading] = useState(enabled)
	const [error, setError] = useState<string | null>(null)

	const reload = useCallback(async () => {
		if (!enabled) return
		setLoading(true)
		setError(null)
		try {
			const res = await getPatientAddresses()
			// the default address first, then the rest in the order they were added
			setAddresses([...(res.data ?? [])].sort((a, b) => Number(b.is_default) - Number(a.is_default)))
		} catch (e) {
			setError(labErrorMessage(e))
		} finally {
			setLoading(false)
		}
	}, [enabled])

	useEffect(() => {
		void reload()
	}, [reload])

	/** Saves a new address and reloads the list; resolves with the saved address (null when it could not be saved: `error` says why). */
	const add = useCallback(
		async (payload: PatientAddressCreate): Promise<LabAddress | null> => {
			setError(null)
			try {
				const res = await addPatientAddress(payload)
				await reload()
				return res.data
			} catch (e) {
				setError(labErrorMessage(e))
				return null
			}
		},
		[reload]
	)

	return { addresses, loading, error, reload, add }
}
