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

	ROLE_SELECT: '/role-select',
	ONBOARDING_ROLE: '/onboarding/:roleId',

	PAYMENT: '/payment',

	PORTAL: {
		HOME: '/portal',
		PROFILE: '/profile',
		CONSULTATION: '/consultation/:patientId/:appointmentId',
	},
}
