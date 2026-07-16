// src/features/dashboard/dashboardService.ts
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'

export interface AppointmentResponse {
    success: boolean
    message: string
    // data: Appointment
}

export const updateAppointmentsStatus = async (
	appointmentId: string,
	statusId: string,
	reason?: string
): Promise<AppointmentResponse> => {
    const res = await ApiService.patch<AppointmentResponse>(API_ENDPOINTS.APPOINTMENTS.UPDATE, {
		appointment_id: appointmentId,
		status_id: statusId,
		...(reason ? { reason } : {}),
	})
    return res.data
}
