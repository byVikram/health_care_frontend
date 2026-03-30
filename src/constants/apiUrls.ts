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
	},
	DOCTOR_PROFILE: {
		DETAILS: `${BASE_URL}/api/doctors/details`,
	},
	SPECIALITIES: {
		LIST: `${BASE_URL}/api/specialities/`,
	},
	USERS: {
		GET: `${BASE_URL}/api/users`,
		CREATE: `${BASE_URL}/api/users`,
		UPDATE: (id: string | number) => `${BASE_URL}/api/users/${id}`,
		DELETE: (id: string | number) => `${BASE_URL}/api/users/${id}`,
	},
	APPOINTMENTS: {
		GET: `${BASE_URL}/api/appointments`,
    	GET_BY_ID: (id: number) => `${BASE_URL}/api/appointments/${id}`,
    	UPDATE: `${BASE_URL}/api/appointments/update-status`,
	}
}
