export const ROUTES = {
	ROOT: '/',

	AUTH: {
		LOGIN: '/login',
		REGISTER: '/register',
	},

	PUBLIC: {
		WELCOME_DOCTOR: '/welcome-doctor',
	},

	DOCTORS: {
		DETAIL: '/doctors/:id',
		SEARCH: '/doctors/search',
	},

	TEST: '/test',
	TEST_REGISTER: '/test-register',

	ROLE_SELECT: '/role-select',
	ONBOARDING_ROLE: '/onboarding/:roleId',
	ONBOARDING_REGISTER: '/onboarding/register',

	DOCTOR_ACCOUNT_DETAILS: '/doctor/account-details',

	PAYMENT: '/payment',

	PORTAL: {
		HOME: '/portal',
		PROFILE: '/profile',
		CONSULTATION: '/consultation/:patientId/:appointmentId',
	},
}
