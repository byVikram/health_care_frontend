// src/features/lab/useBookingPatients.ts
//
// The people a lab test can be booked for: the signed-in patient first, then their family members (the existing family list).
import { useFamilyMembers, type FamilyMemberOption } from '../../hooks/useFamilyMembers'

export type BookingPatient = FamilyMemberOption

/** The value for `labBooking.patientKey`: 'self' for the account holder, else the member's public id. */
export const bookingPatientKey = (p: Pick<BookingPatient, 'id' | 'isSelf'>) => (p.isSelf ? 'self' : p.id)

/** The `patientId` for `placeOrder`: undefined for the account holder (the server uses the signed-in patient), else the member's id. */
export const bookingPatientId = (p: Pick<BookingPatient, 'id' | 'isSelf'>): string | undefined => (p.isSelf ? undefined : p.id)

export function useBookingPatients() {
	const { members, loading, reload } = useFamilyMembers()
	return { patients: members, loading, reload }
}
