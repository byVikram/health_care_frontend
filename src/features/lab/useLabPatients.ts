// src/features/lab/useLabPatients.ts
//
// The people a lab test can be booked for: the signed-in patient first, then their family members (the existing family list).
import { useFamilyMembers, type FamilyMemberOption } from '../../hooks/useFamilyMembers'

export type LabPatient = FamilyMemberOption

/** The value for `labBooking.patientKey`: 'self' for the account holder, else the member's public id. */
export const labPatientKey = (p: Pick<LabPatient, 'id' | 'isSelf'>) => (p.isSelf ? 'self' : p.id)

/** The `patientId` for `placeOrder`: undefined for the account holder (the server uses the signed-in patient), else the member's id. */
export const labPatientId = (p: Pick<LabPatient, 'id' | 'isSelf'>): string | undefined => (p.isSelf ? undefined : p.id)

export function useLabPatients() {
	const { members, loading, reload } = useFamilyMembers()
	return { patients: members, loading, reload }
}
