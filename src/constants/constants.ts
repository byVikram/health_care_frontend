export const USER_ROLES = {
	DOCTOR: 'doctor',
	PATIENT: 'patient',
	LABORATORY: 'laboratory',
	PHARMACY: 'pharmacy',
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
