import appointmentClinic from '../assets/onboarding/appointment-clinic.png'
import appointmentPhone from '../assets/onboarding/appointment-phone.png'
import medicine from '../assets/onboarding/medicine.png'
import doctorTeam from '../assets/onboarding/doctor-team.png'
import doctorOrders from '../assets/onboarding/doctor-orders.png'
import patientOrders from '../assets/onboarding/patient-orders.png'
// import patient from '../assets/onboarding/patient.png'

// The roles that register through the app, and so have intro slides before sign-up. Pharmacy and radiology are third-party
// integrations and do not self-register. ANCILLARY is the healthcare provider (nurse, physio, ...): the backend role is
// labelled "ancillary" and the kind of provider travels separately as `specialty_id` (see RegisterPage).
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ANCILLARY'

export interface OnboardingSlide {
	image: string
	// Small uppercase line shown above the title (optional).
	heading?: string
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
				heading: 'See a doctor your way',
				title: 'Book a clinic visit or a video consult with verified doctors near you.',
			},
			{
				image: medicine,
				heading: 'Care that comes home',
				title: 'Lab sample pickup, nurses and physios at your door. A nurse can reach you in about 15 minutes.',
			},
			{
				image: doctorTeam,
				heading: 'Your family, in one place',
				title: 'Add family members, keep their reports and bookings together, and book for anyone in a tap.',
			},
		],
	},
	DOCTOR: {
		screens: [
			{
				image: appointmentClinic,
				heading: 'Your practice in your pocket',
				title: 'Manage clinic visits and video consults, with the patient’s history before every appointment.',
			},
			{
				image: appointmentPhone,
				heading: 'Set your hours per clinic',
				title: 'Add each clinic you work at with its own days and slots. Block dates when you’re away.',
			},
			{
				image: doctorOrders,
				heading: 'Get verified to go live',
				title: 'Upload your registration certificate and ID. Our team checks them before patients can book you.',
			},
		],
	},
	// Healthcare providers: the same three slides as the mobile app's provider intro.
	ANCILLARY: {
		screens: [
			{
				image: patientOrders,
				heading: 'Visit requests near you',
				title: 'Go online when you’re free. Requests ring on your phone and you have 30 seconds to accept.',
			},
			{
				image: doctorTeam,
				heading: 'Earn for every visit',
				title: 'See your payout before you accept. Patients pay online and can add a tip, and all of it is yours.',
			},
			{
				image: doctorOrders,
				heading: 'Get verified first',
				title: 'Upload your ID and qualification certificates. Our team checks them before you get requests.',
			},
		],
	},
}
