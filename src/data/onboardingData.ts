import appointmentClinic from '../assets/onboarding/appointment-clinic.png'
import appointmentPhone from '../assets/onboarding/appointment-phone.png'
import medicine from '../assets/onboarding/medicine.png'
import doctorTeam from '../assets/onboarding/doctor-team.png'
import doctorOrders from '../assets/onboarding/doctor-orders.png'
import patientOrders from '../assets/onboarding/patient-orders.png'

export type UserRole = 'PATIENT' | 'PHARMACIST' | 'LABORATORY'

export interface OnboardingSlide {
	image: string
	title: string
}

export interface OnboardingRoleData {
	screens: OnboardingSlide[]
}

export const onboardingData: Record<UserRole, OnboardingRoleData> = {
	PATIENT: {
		screens: [
			{
				image: appointmentClinic,
				title: 'Book an appointment for an in clinic consultation',
			},
			{
				image: appointmentPhone,
				title: 'Book an appointment to consult top doctors from your phone',
			},
			{
				image: medicine,
				title: 'Get upto 25% off on medicines, from Whisper Ai monthly offer',
			},
			{
				image: doctorTeam,
				title: '10 million Indians connect with doctors every year through Whisper Ai',
			},
		],
	},
	PHARMACIST: {
		screens: [
			{
				image: doctorOrders,
				title: 'Get orders directly from doctors and pack it for patient instantly',
			},
			{
				image: patientOrders,
				title: 'Get orders directly from patients and pack it for them instantly',
			},
			{
				image: medicine,
				title: 'Get upto 25% off on medicines, from Whisper Ai monthly offer',
			},
			{
				image: doctorTeam,
				title: '10 million Indians connect with doctors every year through Whisper Ai',
			},
		],
	},
	LABORATORY: {
		screens: [
			{
				image: doctorOrders,
				title: 'Get lab tests directly from doctors and deliver it for patients instantly',
			},
			{
				image: patientOrders,
				title: 'Get lab tests directly from patients and deliver it for them instantly',
			},
			{
				image: medicine,
				title: 'Get upto 25% off on medicines, from Whisper Ai monthly offer',
			},
			{
				image: doctorTeam,
				title: '10 million Indians connect with doctors every year through Whisper Ai',
			},
		],
	},
}
