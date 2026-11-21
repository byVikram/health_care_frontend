export const USER_ROLES = {
	DOCTOR: 'doctor',
	PATIENT: 'patient',
	RADIOLOGY: 'radiology',
	SUPER_ADMIN: 'super_admin',
	SUPPORT_ADMIN: 'support_admin',
	BILLING_ADMIN: 'billing_admin',
	COMPLIANCE_ADMIN: 'compliance_admin',
	ADMIN: 'admin',
}

export const ADMIN_ROLES = [
	USER_ROLES.SUPER_ADMIN,
	USER_ROLES.SUPPORT_ADMIN,
	USER_ROLES.BILLING_ADMIN,
	USER_ROLES.COMPLIANCE_ADMIN,
	USER_ROLES.ADMIN,
]

/** How many days ahead (today included) a patient can pick a doctor's slot: the same on the web and in the mobile app. */
export const BOOKING_WINDOW_DAYS = 14
