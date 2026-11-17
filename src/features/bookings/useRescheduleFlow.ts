// src/features/bookings/useRescheduleFlow.ts
//
// The patient's "reschedule a doctor appointment" flow behind the RescheduleDrawer: the doctor's clinics, the free slots of the chosen
// day and mode, and the confirm call. The same behaviour as the Upcoming Appointments card on the portal (PatientAppointments), as a
// hook so the My bookings page can use it. `drawerProps` is spread straight onto <RescheduleDrawer />.
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { getAvailabilityModeBlocks, getDoctorAvailability, getDoctorById } from '../doctor/doctorService'
import { toLocalDateString } from '../../utils/Utils'
import type { Appointment } from '../../types/appointment'
import type { SlotGroup } from '../../components/common/DateSlotPicker/DateSlotPicker'
import type { LookupHospital } from '../../hooks/useAuth'

const isVideo = (mode?: string | null) => mode === 'video_call' || mode === 'video call'

export function useRescheduleFlow(onRescheduled: () => void) {
	const [open, setOpen] = useState(false)
	const [appt, setAppt] = useState<Appointment | null>(null)
	const [date, setDate] = useState<Date>(new Date())
	const [time, setTime] = useState('')
	const [slots, setSlots] = useState<SlotGroup[]>([])
	const [slotsLoading, setSlotsLoading] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [hospitals, setHospitals] = useState<LookupHospital[]>([])
	const [hospitalId, setHospitalId] = useState('')
	const [reason, setReason] = useState('')
	const [appointmentType, setAppointmentType] = useState<'clinic' | 'video'>('clinic')

	/** Opens the drawer for an appointment (read in full: it needs the doctor and the clinic). */
	const start = (next: Appointment) => {
		setAppt(next)
		setHospitalId(next.hospital?.id ?? '')
		setDate(new Date())
		setTime('')
		setSlots([])
		setHospitals([])
		setReason('')
		setAppointmentType(isVideo(next.appointment_mode) ? 'video' : 'clinic')
		setOpen(true)
	}

	// The doctor's clinics, for the clinic picker.
	useEffect(() => {
		if (!appt || !open || !appt.doctor?.id) return
		const doctorId = appt.doctor.id
		const load = async () => {
			try {
				const res = await getDoctorById(doctorId)
				if (res.success && res.data) {
					setHospitals(res.data.hospitals.map((h) => ({ id: h.hospital.id, label: h.hospital.name })))
				}
			} catch {
				// the picker simply stays empty; the appointment's own clinic is still used
			}
		}
		void load()
	}, [appt, open])

	// The free slots of the chosen day, clinic and mode.
	useEffect(() => {
		if (!open || !appt) return
		const doctorId = appt.doctor?.id
		const clinicId = hospitalId || appt.hospital?.id
		if (!doctorId || !clinicId) return
		const day = toLocalDateString(date)
		let cancelled = false
		const load = async () => {
			setSlotsLoading(true)
			setSlots([])
			setTime('')
			try {
				const response = await getDoctorAvailability({ doctor_id: doctorId, hospital_id: clinicId, date: day })
				const modeKey = appointmentType === 'clinic' ? 'clinic_visit' : 'video_call'
				const block = getAvailabilityModeBlocks(response).find((item) => item.appointment_mode === modeKey)
				if (!cancelled) setSlots(block?.sessions || [])
			} catch {
				if (!cancelled) toast.error('Could not load available slots.')
			} finally {
				if (!cancelled) setSlotsLoading(false)
			}
		}
		void load()
		return () => {
			cancelled = true
		}
	}, [date, open, appt, hospitalId, appointmentType])

	const confirm = async () => {
		if (!appt || !time) {
			toast.warning('Please select a time slot before confirming.')
			return
		}
		setSubmitting(true)
		try {
			const res = await ApiService.post<{ success: boolean; message: string }>(
				API_ENDPOINTS.APPOINTMENTS.RESCHEDULE,
				{
					appointment_id: appt.id,
					appointment_date: toLocalDateString(date),
					start_time: time,
					end_time: null,
					hospital_id: hospitalId || appt.hospital?.id,
					reason: reason.trim() || undefined,
				}
			)
			if (res.data?.success) {
				toast.success(res.data.message || 'Appointment rescheduled!')
				setOpen(false)
				onRescheduled()
			} else {
				toast.error(res.data?.message || 'Reschedule failed. Please try again.')
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	const drawerProps = {
		rescheduleOpen: open,
		setRescheduleOpen: setOpen,
		rescheduleAppt: appt,
		rescheduleDate: date,
		setRescheduleDate: setDate,
		rescheduleTime: time,
		setRescheduleTime: setTime,
		rescheduleSlots: slots,
		rescheduleSlotsLoading: slotsLoading,
		rescheduleSubmitting: submitting,
		handleRescheduleConfirm: () => void confirm(),
		rescheduleHospitals: hospitals,
		rescheduleHospitalId: hospitalId,
		setRescheduleHospitalId: setHospitalId,
		appointmentType,
		setAppointmentType,
		reason,
		onReasonChange: setReason,
	}

	return { start, drawerProps }
}
