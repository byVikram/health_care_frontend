// src/features/schedule/useScheduleData.ts
//
// Everything the Schedule page reads, in one hook: the doctor's clinics, today's appointments (also the source of the clinic list's
// counts), the picked day, the shown month (only for the dots in the calendar) and the booking requests waiting. Lists are read for
// every clinic and video together and narrowed by the page's scope in the browser, so changing the scope or the filter never refetches.
// `refresh()` reads everything again after an action; what is on screen stays until the new answer arrives.
import { useCallback, useEffect, useState } from 'react'
import type { Appointment } from '../../types/appointment'
import type { Referral } from '../../types/referral'
import { getAllAppointments, getMyClinics, getReferralsByAppointment, type DoctorClinic } from './scheduleService'
import { isRequestLike, monthRange } from './scheduleUtils'

const byDateTime = (a: Appointment, b: Appointment) =>
	(a.appointment_date + (a.start_time ?? '')).localeCompare(b.appointment_date + (b.start_time ?? ''))

const FAILED = 'Could not load your appointments.'

export interface ScheduleData {
	clinics: DoctorClinic[]
	/** The doctor's referrals still standing, by appointment; null when they could not be read. */
	referred: Record<string, Referral> | null
	todayRows: Appointment[] | null
	/** The picked day's appointments; null until they are read. */
	dayRows: Appointment[] | null
	dayError: string | null
	/** Every appointment of the shown month (for the dots). */
	monthRows: Appointment[]
	requests: Appointment[]
	requestsLoading: boolean
	/** The last read of the requests failed: an empty list then proves nothing. */
	requestsFailed: boolean
	refresh: () => void
}

export default function useScheduleData(
	todayIso: string,
	selectedIso: string,
	year: number,
	month: number
): ScheduleData {
	const [refreshKey, setRefreshKey] = useState(0)
	const [clinics, setClinics] = useState<DoctorClinic[]>([])
	const [referred, setReferred] = useState<Record<string, Referral> | null>(null)
	const [todayRows, setTodayRows] = useState<Appointment[] | null>(null)
	const [dayData, setDayData] = useState<{ iso: string; rows: Appointment[] } | null>(null)
	const [dayError, setDayError] = useState<string | null>(null)
	const [monthData, setMonthData] = useState<{ key: string; rows: Appointment[] } | null>(null)
	const [requests, setRequests] = useState<Appointment[]>([])
	const [requestsLoading, setRequestsLoading] = useState(true)
	const [requestsFailed, setRequestsFailed] = useState(false)

	const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

	// The clinics
	useEffect(() => {
		let cancelled = false
		const run = async () => {
			try {
				const list = await getMyClinics()
				if (!cancelled) setClinics(list)
			} catch {
				// The switcher then offers the scopes that need no list (all, video).
			}
		}
		void run()
		return () => {
			cancelled = true
		}
	}, [refreshKey])

	// Today
	useEffect(() => {
		let cancelled = false
		const run = async () => {
			try {
				const rows = await getAllAppointments({ appointment_date: todayIso })
				if (!cancelled) setTodayRows(rows)
			} catch {
				if (!cancelled) setDayError(FAILED)
			}
		}
		void run()
		return () => {
			cancelled = true
		}
	}, [todayIso, refreshKey])

	// The picked day, when it is not today
	useEffect(() => {
		if (selectedIso === todayIso) return
		let cancelled = false
		const run = async () => {
			try {
				const rows = await getAllAppointments({ appointment_date: selectedIso })
				if (cancelled) return
				setDayData({ iso: selectedIso, rows })
				setDayError(null)
			} catch {
				if (!cancelled) setDayError(FAILED)
			}
		}
		void run()
		return () => {
			cancelled = true
		}
	}, [selectedIso, todayIso, refreshKey])

	// The shown month (the dots): a failure only leaves the dots out.
	useEffect(() => {
		let cancelled = false
		const run = async () => {
			try {
				const { start, end } = monthRange(year, month)
				const rows = await getAllAppointments({ start_date: start, end_date: end })
				if (!cancelled) setMonthData({ key: `${year}-${month}`, rows })
			} catch {
				// no dots
			}
		}
		void run()
		return () => {
			cancelled = true
		}
	}, [year, month, refreshKey])

	// The booking requests waiting (any date still to come) and the referrals they are checked against
	useEffect(() => {
		let cancelled = false
		const run = async () => {
			try {
				const [rows, refs] = await Promise.all([
					getAllAppointments({ variant: 'upcoming' }),
					getReferralsByAppointment(),
				])
				if (cancelled) return
				setReferred(refs)
				setRequests(
					rows
						.filter(isRequestLike)
						.filter((a) => !refs?.[a.id])
						.sort(byDateTime)
				)
				setRequestsFailed(false)
			} catch {
				// Keep what is on screen: an empty list would read as "no requests waiting".
				if (!cancelled) setRequestsFailed(true)
			} finally {
				if (!cancelled) setRequestsLoading(false)
			}
		}
		void run()
		return () => {
			cancelled = true
		}
	}, [refreshKey])

	const dayRows = selectedIso === todayIso ? todayRows : dayData?.iso === selectedIso ? dayData.rows : null

	return {
		clinics,
		referred,
		todayRows,
		dayRows,
		dayError,
		monthRows: monthData?.key === `${year}-${month}` ? monthData.rows : [],
		requests,
		requestsLoading,
		requestsFailed,
		refresh,
	}
}
