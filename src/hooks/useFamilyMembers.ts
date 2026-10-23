// The signed-in patient and their family members, from GET /api/patients/family-members (the account holder first).
// Same idea as the mobile app's useFamilyMembers: one list that the booking page and the profile page choose a person
// from. Choosing a person never changes who is signed in; every request for another person still goes through the
// backend's guardian check.
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { getFamilyMembers, type FamilyMemberApi } from '../features/patient/patientService'
import { buildS3Url } from '../utils/s3'

/** Fired after a family member is added, so every family list on screen (booking dropdown, profile selector) reloads. */
const FAMILY_MEMBERS_CHANGED_EVENT = 'family-members-changed'
export const announceFamilyMembersChanged = () => window.dispatchEvent(new Event(FAMILY_MEMBERS_CHANGED_EVENT))

export interface FamilyMemberOption {
	/** The person's public id: what the backend takes as `patient_id`. */
	id: string
	name: string
	/** 'Self' for the account holder, otherwise the relation (e.g. 'Spouse'). */
	relationship: string
	age: string | number
	gender: string
	bloodGroup?: string
	avatar?: string
	isSelf: boolean
}

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

const toOption = (m: FamilyMemberApi): FamilyMemberOption => ({
	id: m.id,
	name: m.name,
	relationship: m.is_self ? 'Self' : capitalise(m.relationship || m.relation || 'Family member'),
	age: m.age || '',
	gender: m.gender || '',
	bloodGroup: m.blood_group || undefined,
	avatar: buildS3Url(m.avatar_s3_key) || undefined,
	isSelf: !!m.is_self,
})

export function useFamilyMembers() {
	const { role, accessToken } = useAuth()
	const enabled = !!accessToken && role === 'patient'
	const [members, setMembers] = useState<FamilyMemberOption[]>([])
	const [loading, setLoading] = useState(false)

	const reload = useCallback(async () => {
		if (!enabled) return
		setLoading(true)
		try {
			const list = await getFamilyMembers()
			// the account holder first, then the members in the order they were added
			setMembers(list.map(toOption).sort((a, b) => Number(b.isSelf) - Number(a.isSelf)))
		} catch {
			// keep what is shown; the pages say nothing is wrong with the rest of the screen
		} finally {
			setLoading(false)
		}
	}, [enabled])

	useEffect(() => {
		void reload()
		window.addEventListener(FAMILY_MEMBERS_CHANGED_EVENT, reload)
		return () => window.removeEventListener(FAMILY_MEMBERS_CHANGED_EVENT, reload)
	}, [reload])

	return { members, loading, reload }
}
