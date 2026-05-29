// src/constants/apiUrls.ts
export const BASE_URL = import.meta.env.VITE_API_ENDPOINT as string

export const API_ENDPOINTS = {
	AUTH: {
		SEND_OTP: `${BASE_URL}/api/auth/send-otp`,
		VERIFY_OTP: `${BASE_URL}/api/auth/verify-otp`,
		LOGOUT: `${BASE_URL}/api/auth/logout`,
		GET_ROLES: `${BASE_URL}/api/auth/get-roles`,
		CREATE_USER: `${BASE_URL}/api/auth/create-user`,
	},
	DOCTORS: {
		SEARCH: `${BASE_URL}/api/doctors`,
		DETAIL: (id: string) => `${BASE_URL}/api/doctors/${id}`,
		AVAILABILITY: `${BASE_URL}/api/doctors/availability`,
		OVERRIDES: `${BASE_URL}/api/doctors/availability/overrides`,
	},
	PHARMACIES: {
		LIST: `${BASE_URL}/api/pharmacies`,
	},
	DOCTOR_PROFILE: {
		DETAILS: `${BASE_URL}/api/doctors/details`,
		PROFESSIONAL_DETAILS: `${BASE_URL}/api/doctors/professional-details`,
		HOSPITALS: `${BASE_URL}/api/doctors/hospitals`,
		DELETE_ACCOUNT: `${BASE_URL}/api/doctors/profile`,
	},
	LABORATORY_PROFILE: {
		DETAILS: `${BASE_URL}/api/laboratory/details`,
		PROFESSIONAL_DETAILS: `${BASE_URL}/api/laboratory/professional-details`,
		SERVICES: `${BASE_URL}/api/laboratory/services`,
		DELETE_ACCOUNT: `${BASE_URL}/api/laboratory/profile`,
	},
	SPECIALITIES: {
		LIST: `${BASE_URL}/api/specialities`,
	},
	USERS: {
		GET: `${BASE_URL}/api/users`,
		CREATE: `${BASE_URL}/api/users`,
		UPDATE: (id: string | number) => `${BASE_URL}/api/users/${id}`,
		DELETE: (id: string | number) => `${BASE_URL}/api/users/${id}`,
	},
	PATIENT: {
		ME: `${BASE_URL}/api/patients/me/details`,
		UPDATE: `${BASE_URL}/api/patients/me/details`,
		GET_BY_ID: (id: string) => `${BASE_URL}/api/patients/${id}/details`,
		VITALS_CREATE: `${BASE_URL}/api/patients/vitals`,
		VITALS_LATEST: (id: string) => `${BASE_URL}/api/patients/${id}/vitals/latest`,
		VITALS_HISTORY: (id: string) => `${BASE_URL}/api/patients/${id}/vitals`,
		REPORTS: (id: string) => `${BASE_URL}/api/patients/${id}/reports`,
		REPORTS_CREATE: `${BASE_URL}/api/patients/reports`,
	},
	LOOKUP: {
		GET: `${BASE_URL}/api/lookup`,
	},
	DOCTORS_FAVOURITES: {
		GET: `${BASE_URL}/api/doctors/favourites`,
		TOGGLE: (publicId: string) => `${BASE_URL}/api/doctors/favourites/${publicId}`,
	},
	APPOINTMENTS: {
		GET: `${BASE_URL}/api/appointments`,
		CREATE: `${BASE_URL}/api/appointments`,
		UPDATE: `${BASE_URL}/api/appointments/update-status`,
		GET_BY_ID: (id: string | number) => `${BASE_URL}/api/appointments/${id}`,
		RESCHEDULE: `${BASE_URL}/api/appointments/reschedule`,
		STATUSES: `${BASE_URL}/api/appointments/statuses`,
	},
}
