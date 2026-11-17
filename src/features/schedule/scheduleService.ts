// src/features/schedule/scheduleService.ts
//
// The calls behind the doctor's Schedule page: every appointment of a query (not just the first page), the doctor's clinics, the
// Auto-confirm switch and the referrals already sent. Endpoint paths are in constants/apiUrls.ts.
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { getReferralsSent } from '../../services/referralService'
import type { Appointment, AppointmentsResponse } from '../../types/appointment'
import type { Referral } from '../../types/referral'

export interface ScheduleQuery {
	appointment_date?: string
	start_date?: string
	end_date?: string
	hospital_id?: string
	appointment_mode?: 'clinic_visit' | 'video_call'
	variant?: 'all' | 'upcoming'
}

/**
 * Every row of an appointments query: the list endpoint caps a page at 100 rows, so a busy doctor's month would be cut short with one
 * call. Reads page after page until the server's page count, at most `maxPages` (the rest are left out, never an endless loop).
 * The error toast is off: the page shows its own retry card.
 */
export async function getAllAppointments(query: ScheduleQuery = {}, maxPages = 10): Promise<Appointment[]> {
	const rows: Appointment[] = []
	for (let page = 1; page <= maxPages; page++) {
		const res = await ApiService.getWithParams<AppointmentsResponse & { meta?: { pages?: number } }>(
			API_ENDPOINTS.APPOINTMENTS.GET,
			{ ...query, page, limit: 100 },
			{ suppressErrorToast: true }
		)
		rows.push(...(res.data.data ?? []))
		const pages = res.data.meta?.pages ?? res.data.pages ?? 1
		if (page >= pages) break
	}
	return rows
}

export interface DoctorClinic {
	/** Hospital public id: the same id the appointments carry as `hospital.id`. */
	id: string
	name: string
	address?: string | null
	is_primary: boolean
	/** Today's hours ("5:00 PM – 8:30 PM"), or the usual days and hours when not working today; null with no schedule. */
	timings?: string | null
	working_days: number[]
	patients_today: number
}

/** The doctor's clinics (primary first) with today's workload. */
export async function getMyClinics(): Promise<DoctorClinic[]> {
	const res = await ApiService.get<{ success: boolean; data: { clinics: DoctorClinic[] } }>(
		API_ENDPOINTS.DOCTORS.CLINICS,
		{ suppressErrorToast: true }
	)
	return res.data.data?.clinics ?? []
}

export interface AutoConfirmState {
	enabled: boolean
	/** Only on a PUT that turned it on: how many waiting requests were confirmed right then. */
	confirmed_now?: number
}

export async function getAutoConfirm(): Promise<AutoConfirmState> {
	const res = await ApiService.get<{ success: boolean; data: AutoConfirmState }>(
		API_ENDPOINTS.APPOINTMENTS.AUTO_CONFIRM,
		{
			suppressErrorToast: true,
		}
	)
	return res.data.data
}

/** Turns it on or off. Turning it ON also confirms the requests already waiting (`confirmed_now`). */
export async function setAutoConfirm(enabled: boolean): Promise<AutoConfirmState> {
	const res = await ApiService.put<{ success: boolean; data: AutoConfirmState }>(
		API_ENDPOINTS.APPOINTMENTS.AUTO_CONFIRM,
		{
			enabled,
		}
	)
	return res.data.data
}

/**
 * The doctor's referrals still standing, by the appointment they came from (the newest for an appointment counts). null when they
 * could not be read: then nothing is treated as referred on a guess.
 */
export async function getReferralsByAppointment(): Promise<Record<string, Referral> | null> {
	try {
		const list = await getReferralsSent()
		const byAppointment: Record<string, Referral> = {}
		list.forEach((r) => {
			const id = r.appointment?.id
			if (id && r.is_active && r.status !== 'cancelled' && !byAppointment[id]) byAppointment[id] = r
		})
		return byAppointment
	} catch {
		return null
	}
}
