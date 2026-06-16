// src/features/profile/ProfilePage.tsx
import { useAuth } from '../../hooks/useAuth'
import DoctorProfilePage from '../doctor/profile/DoctorProfilePage'
import PatientProfilePage from '../patient/PatientProfilePage'
import LaboratoryProfilePage from '../laboratory/profile/LaboratoryProfilePage'
import PharmacyProfilePage from '../Pharmacy/profile/PharmacyProfilePage'
import RadiologyProfilePage from '../radiology/profile/RadiologyProfilePage'

export default function ProfilePage() {
	const { role } = useAuth()

	if (role === 'doctor') return <DoctorProfilePage />
	if (role === 'patient') return <PatientProfilePage />
	if (role === 'laboratory') return <LaboratoryProfilePage />
	if (role === 'pharmacy') return <PharmacyProfilePage />
	if (role === 'radiology') return <RadiologyProfilePage/>
	

	// fallback — no role set
	return <PatientProfilePage />
}
