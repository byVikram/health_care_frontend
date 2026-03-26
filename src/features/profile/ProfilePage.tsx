// src/features/profile/ProfilePage.tsx
import { useAuth } from '../../hooks/useAuth'
import DoctorProfilePage from '../doctor/profile/DoctorProfilePage'
import PatientProfilePage from '../patient/PatientProfilePage'

export default function ProfilePage() {
	const { role } = useAuth()

	if (role === 'doctor') return <DoctorProfilePage />
	if (role === 'patient') return <PatientProfilePage />

	// fallback — no role set
	return <PatientProfilePage />
}
