export const ROUTES = {
	ROOT: '/',

	AUTH: {
		LOGIN: '/login',
		REGISTER: '/register',
	},

	PUBLIC: {
		WELCOME: '/welcome',
		WELCOME_DOCTOR: '/welcome-doctor',
	},

	DOCTORS: {
		DETAIL: '/doctors/:id',
		SEARCH: '/doctors/search',
	},

	// ✅ Add pharmacy search route
	PHARMACY: {
		ORDERS: '/pharmacy/orders',
		ORDER_DETAIL: '/pharmacy/orders/:orderId',
		PROFILE: '/pharmacy/profile',
		SEARCH: '/pharmacies', // <-- new
	},

	LABORATORY: {
		PROFILE: '/laboratory/profile',
	},

	TEST: '/test',
	TEST_REGISTER: '/test-register',

	ROLE_SELECT: '/role-select',
	ONBOARDING_ROLE: '/onboarding/:roleId',
	ONBOARDING_REGISTER: '/onboarding/register',

	DOCTOR_ACCOUNT_DETAILS: '/doctor/account-details',

	PAYMENT: '/payment',

	APPOINTMENTS: '/portal/appointments',

	PORTAL: {
		HOME: '/portal',
		PROFILE: '/profile',
		CONSULTATION: '/consultation/:patientId/:appointmentId',
	},
}
