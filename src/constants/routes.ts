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
	SYMPTOMS: '/symptoms',

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
	APPOINTMENT_CONFIRMED: '/appointment-confirmed',

	APPOINTMENTS: '/portal/appointments',

	/** The patient's My bookings page (doctor visits, home care, lab and pharmacy in one list). */
	BOOKINGS: '/bookings',
	/** The patient's lab tests: browse, cart and slot, review, booked, one order and its report. */
	LAB: {
		HOME: '/lab-tests',
		CART: '/lab-tests/cart',
		REVIEW: '/lab-tests/review',
		BOOKED: '/lab-tests/booked',
		ORDER: '/lab-tests/orders/:orderId',
		REPORT: '/lab-tests/orders/:orderId/report',
	},
	/** The doctor's Schedule page (calendar, clinics, the day's list and booking requests). */
	SCHEDULE: '/schedule',

	PORTAL: {
		HOME: '/portal',
		PROFILE: '/profile',
		FAVOURITES: '/portal/favourites',
		CONSULTATION: '/consultation/:patientId/:appointmentId',
		APPOINTMENT_DETAIL: '/portal/appointments/:appointmentId',
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
		REVIEWS: '/admin/reviews',
		ADS: '/admin/ads',
		COMMUNITIES: '/admin/communities',
		EVENTS: '/admin/events',
		QA: '/admin/qa',
		ARTICLES: '/admin/articles',
		ARTICLE_CREATE: '/admin/articles/create',
		ARTICLE_EDIT: '/admin/articles/edit/:id',
		ADMINS: '/admin/admins',
		ANCILLARY: '/admin/ancillary',
		ANCILLARY_DETAIL: '/admin/ancillary/:id',
		ANCILLARY_CATEGORIES: '/admin/ancillary-categories',
	},
}
