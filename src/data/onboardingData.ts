import appointmentClinic from '../assets/onboarding/appointment-clinic.png'
import appointmentPhone from '../assets/onboarding/appointment-phone.png'
import medicine from '../assets/onboarding/medicine.png'
import doctorTeam from '../assets/onboarding/doctor-team.png'
import doctorOrders from '../assets/onboarding/doctor-orders.png'
import patientOrders from '../assets/onboarding/patient-orders.png'
import radiology from '../assets/onboarding/radiology.png'
// import patient from '../assets/onboarding/patient.png'

export type UserRole = 'PATIENT' | 'PHARMACY' | 'RADIOLOGY' | 'DOCTOR'

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
			{ image: appointmentClinic, title: 'Book an appointment for an in Clinic consultation' },
			{ image: appointmentPhone,  title: 'Book an appointment to consult top doctors from your phone' },
			{ image: medicine,          title: 'Get upto 25% off on medicines, health and wellness products.' },
			{ image: doctorTeam,        title: '10 million Indians connect with doctors every year through Whisper Ai' },
		],
	},
	PHARMACY: {
		screens: [
			{ image: doctorOrders,  title: 'Get orders directly from doctors and pack it for patients instantly' },
			{ image: patientOrders, title: 'Get orders directly from patients and pack it for them instantly' },
			{ image: medicine,      title: 'Get upto 25% off on medicines from Whisper Ai monthly offer' },
			{ image: doctorTeam,    title: '10 million Indians connect with doctors every year through Whisper Ai' },
		],
	},
	RADIOLOGY: {
		screens: [
			{ image: radiology,     title: 'Receive radiology scan requests from doctors instantly' },
			{ image: doctorOrders,  title: 'Process and upload scan reports with ease' },
			{ image: patientOrders, title: 'Patients can track their radiology reports in real time' },
			{ image: doctorTeam,    title: '10 million Indians connect with doctors every year through Whisper Ai' },
		],
	},
	DOCTOR: {
		screens: [
			{ image: appointmentClinic, title: 'Manage your clinic appointments seamlessly in one place' },
			{ image: appointmentPhone,  title: 'Conduct video consultations with patients from anywhere' },
			{ image: doctorOrders,      title: 'Send prescriptions and lab orders to pharmacies instantly' },
			{ image: doctorTeam,        title: 'Join 10 million Indians connecting through Whisper Ai every year' },
		],
	},
}
