// src/features/nursing/useBookingPeople.ts
//
// "Who is this visit for" and "where": the people (the patient and their family) and the saved addresses, with the chosen ones kept in the
// booking store (the review page reads the store). Shared by the booking and review pages. Until the lists load, what the store holds is kept.
import { useEffect, useState } from 'react'
import { useLabAddresses, addressLineOf } from '../lab/useLabAddresses'
import { labPatientKey, labPatientId, useLabPatients, type LabPatient } from '../lab/useLabPatients'
import { nursingBooking, useNursingBooking } from './nursingBookingStore'
import { fetchBookingRestriction } from './nursingService'

export function useBookingPeople() {
	const booking = useNursingBooking()
	const { patients, loading: patientsLoading } = useLabPatients()
	const { addresses, loading: addressesLoading, error: addressError, add } = useLabAddresses()

	const patient = patients.find((p) => labPatientKey(p) === booking.patientKey) ?? patients[0]
	const address = addresses.find((a) => a.id === booking.addressId) ?? addresses[0]

	const patientKey = patient ? labPatientKey(patient) : null
	const patientName = patient?.name
	const patientRelation = patient?.relationship
	const addressId = address?.id
	const addressTag = address?.label
	const addressText = address ? addressLineOf(address) : ''
	useEffect(() => {
		nursingBooking.set({
			...(patientKey && patientName ? { patientKey, patientName, patientRelation: patientRelation ?? 'Self' } : {}),
			// until the addresses have loaded `address` is missing: keep what the store holds
			...(addressId ? { addressId, addressTag: addressTag ?? '', addressLine: addressText } : {}),
		})
	}, [patientKey, patientName, patientRelation, addressId, addressTag, addressText])

	const selectPatient = (p: LabPatient) => nursingBooking.set({ patientKey: labPatientKey(p), patientName: p.name, patientRelation: p.relationship })
	const selectAddress = (a: (typeof addresses)[number]) => nursingBooking.set({ addressId: a.id, addressTag: a.label, addressLine: addressLineOf(a) })

	const saveAddress = async (payload: Parameters<typeof add>[0]) => {
		const saved = await add(payload)
		if (saved) nursingBooking.set({ addressId: saved.id, addressTag: saved.label, addressLine: addressLineOf(saved) })
		return saved
	}

	return {
		booking,
		patients,
		patientsLoading,
		patient,
		/** The `patientPublicId` for the booking calls: undefined for the account holder. */
		patientPublicId: patient ? labPatientId(patient) : undefined,
		addresses,
		addressesLoading,
		addressError,
		address,
		selectPatient,
		selectAddress,
		saveAddress,
	}
}

/** A patient paused after missed visits cannot book: the server refuses (403 BOOKING_RESTRICTED), so the pages say so up front. */
export function useBookingRestriction() {
	const [state, setState] = useState<{ restricted: boolean; message: string }>({ restricted: false, message: '' })
	useEffect(() => {
		let alive = true
		void (async () => {
			const result = await fetchBookingRestriction()
			if (alive) setState(result)
		})()
		return () => {
			alive = false
		}
	}, [])
	return state
}
