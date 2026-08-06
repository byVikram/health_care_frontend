export const ROUTES = {
	ROOT: '/',

	AUTH: {
		LOGIN: '/login',
		REGISTER: '/register',
	},

	PUBLIC: {
		WELCOME: '/welcome',
		WELCOME_DOCTOR: '/welcome-doctor',
		HEALTH_QUESTIONS: '/health-questions',
	},

	DOCTORS: {
		DETAIL: '/doctors/:id',
		SEARCH: '/doctors/search',
	},

	PHARMACY: {
		ORDERS: '/pharmacy/orders',
		ORDER_DETAIL: '/pharmacy/orders/:orderId',
		SEARCH: '/pharmacies',
	},

	RADIOLOGY: {
		PROFILE: '/radiology/profile',
		BOOKINGS: '/radiology/bookings',
		BOOKING_DETAIL: '/radiology/bookings/:bookingId',
		SEARCH: '/radiology/search',
		BOOK_RIDE: '/radiology/bookings/:bookingId/book-ride',
	},

	LABORATORY: {
		SEARCH: '/laboratory/search',
		ORDERS: '/laboratory/orders',
		ORDER_DETAIL: '/laboratory/orders/:bookingId',
	},

	ANCILLARY: {
		SEARCH: '/ancillary/search',
	},

	ALLIED: {
		SEARCH: '/allied/search',
	},

	THERAPEUTIC: {
		SEARCH: '/therapeutic/search',
	},

	BLOGS: {
		LIST: '/blogs',
		DETAIL: '/blogs/:slug',
	},

	COMMUNITIES: {
		LIST: '/communities',
		DETAIL: '/communities/:groupId',
		THREAD: '/communities/threads/:threadId',
	},

	EVENTS: {
		LIST: '/events',
		DETAIL: '/events/:id',
	},

	SPECIALITIES: '/specialities',

	TEST: '/test',
	TEST_REGISTER: '/test-register',

	ROLE_SELECT: '/role-select',
	ONBOARDING_ROLE: '/onboarding/:roleId',
	ONBOARDING_REGISTER: '/onboarding/register',

	DOCTOR_ACCOUNT_DETAILS: '/doctor/account-details',

	DOCTOR: {
		EVENTS: '/doctor/events',
		EVENT_CREATE: '/doctor/events/create',
		EVENT_EDIT: '/doctor/events/:id/edit',
	},

	PAYMENT: '/payment',

	APPOINTMENTS: '/portal/appointments',

	PORTAL: {
		HOME: '/portal',
		PROFILE: '/profile',
		FAVOURITES: '/portal/favourites',
		CONSULTATION: '/consultation/:patientId/:appointmentId',
		APPOINTMENT_DETAIL: '/portal/appointments/:appointmentId',
		BOOK_RIDE: '/portal/appointments/:appointmentId/book-ride',
		TRANSPORTATION: '/portal/transportation',
		TRACK_RIDE: '/portal/transit/track/:bookingType/:bookingId',
	},

	ADMIN: {
		LOGIN: '/admin/login',
		DASHBOARD: '/admin',
		VERIFICATIONS: '/admin/verifications',
		VERIFICATION_REVIEW: '/admin/verifications/:type/:id',
		USERS: '/admin/users',
		USER_DETAIL: '/admin/users/:role/:id',
		APPOINTMENTS: '/admin/appointments',
		BILLING: '/admin/billing',
		AUDITS: '/admin/audits',
		SPECIALITIES: '/admin/specialities',
		BLOGS: '/admin/blogs',
		BLOG_CREATE: '/admin/blogs/create',
		BLOG_EDIT: '/admin/blogs/edit/:id',
		COMMENTS: '/admin/comments',
		ADS: '/admin/ads',
		COMMUNITIES: '/admin/communities',
		EVENTS: '/admin/events',
		QA: '/admin/qa',
	},
}
