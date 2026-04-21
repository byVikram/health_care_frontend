export const ROUTES = {
	ROOT: '/',

	AUTH: {
		LOGIN: '/login',
		REGISTER: '/register',
	},

	PUBLIC: {
		ACCOUNT: '/account',
		WELCOME_DOCTOR: '/welcome-doctor',
	},

	DOCTORS: {
		DETAIL: '/doctors/:id',
		SEARCH: '/doctors/search',
	},

	TEST: '/test',
	TEST_REGISTER: '/test-register',

	ONBOARDING: '/onboarding',

	PORTAL: {
		HOME: '/portal',
		PROFILE: '/profile',
		CONSULTATION: '/consultation/:patientId/:appointmentId',
	},
}
