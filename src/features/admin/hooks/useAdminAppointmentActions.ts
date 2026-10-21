// src/features/admin/hooks/useAdminAppointmentActions.ts
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { SlotGroup } from '../../../components/common/DateSlotPicker/DateSlotPicker'
import { LookupHospital } from '../../../hooks/useAuth'
import { Appointment } from '../../../types/appointment'
import {
	cancelAdminAppointment,
	rescheduleAdminAppointment,
	refundAppointment,
	AdminAppointmentItem,
} from '../adminService'
import { getDoctorAvailability, getDoctorById, getAvailabilityModeBlocks } from '../../doctor/doctorService'

type DoctorHospitalResponse = {
	hospitals?: Array<{ hospital: { id: string; name: string } }>
}

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

/**
 * Encapsulates the admin "reschedule / cancel / refund" appointment overrides.
 * Reused by AdminAppointmentsPage (table view) and AdminAppointmentCards
 * (card view, e.g. the User Detail page's Appointments tab) so both surfaces
 * share identical API calls, confirmation dialogs, and slot-picking behavior.
 */
export function useAdminAppointmentActions(onMutated: () => void) {
	// ── generic action loading (cancel / refund) ───────────────────────────
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

	// ── cancel confirmation ─────────────────────────────────────────────────
	const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
	const [apptPendingCancel, setApptPendingCancel] = useState<AdminAppointmentItem | null>(null)

	const handleCancel = async (appt: AdminAppointmentItem) => {
		const publicId = appt.id || appt.public_id || ''
		setActionLoadingId(publicId)
		try {
			const res = await cancelAdminAppointment(publicId)
			if (res.success) {
				toast.success(`Appointment ${publicId} cancelled.`)
				onMutated()
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to cancel appointment.'))
		} finally {
			setActionLoadingId(null)
		}
	}

	const handleRequestCancel = (appt: AdminAppointmentItem) => {
		setApptPendingCancel(appt)
		setCancelConfirmOpen(true)
	}

	const handleCloseCancelConfirm = () => {
		setCancelConfirmOpen(false)
		setApptPendingCancel(null)
	}

	const handleConfirmCancel = async () => {
		if (!apptPendingCancel) return
		const appt = apptPendingCancel
		setCancelConfirmOpen(false)
		setApptPendingCancel(null)
		await handleCancel(appt)
	}

	// ── refund ───────────────────────────────────────────────────────────────
	const [refundConfirmOpen, setRefundConfirmOpen] = useState(false)
	const [apptPendingRefund, setApptPendingRefund] = useState<AdminAppointmentItem | null>(null)

	const handleRequestRefund = (appt: AdminAppointmentItem) => {
		setApptPendingRefund(appt)
		setRefundConfirmOpen(true)
	}

	const handleCloseRefundConfirm = () => {
		setRefundConfirmOpen(false)
		setApptPendingRefund(null)
	}

	const handleConfirmRefund = async () => {
		if (!apptPendingRefund) return
		const appt = apptPendingRefund
		const publicId = appt.id || appt.public_id || ''
		setRefundConfirmOpen(false)
		setApptPendingRefund(null)
		setActionLoadingId(publicId)
		try {
			const res = await refundAppointment(publicId)
			if (res.success) {
				toast.success(`Refund triggered for appointment ${publicId}.`)
				onMutated()
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to refund appointment.'))
		} finally {
			setActionLoadingId(null)
		}
	}

	// ── reschedule drawer ────────────────────────────────────────────────────
	const [rescheduleOpen, setRescheduleOpen] = useState(false)
	const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null)
	const [rescheduleDate, setRescheduleDate] = useState(new Date())
	const [rescheduleTime, setRescheduleTime] = useState('')
	const [rescheduleSlots, setRescheduleSlots] = useState<SlotGroup[]>([])
	const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false)
	const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
	const [rescheduleHospitals, setRescheduleHospitals] = useState<LookupHospital[]>([])
	const [rescheduleHospitalId, setRescheduleHospitalId] = useState<string>('')
	const [appointmentType, setAppointmentType] = useState<'clinic' | 'video'>('clinic')

	const handleOpenReschedule = async (row: AdminAppointmentItem) => {
		const targetDocId = row.doctor_id || ''
		const targetHospitalId = row.hospital_id || ''

		const apptObject: Appointment = {
			id: row.id,
			public_id: row.public_id || row.id,
			appointment_mode: 'clinic visit',
			appointment_date: row.appointment_date,
			start_time: row.start_time,
			end_time: row.start_time,
			fees: row.fees || 0,
			created_at: new Date().toISOString(),
			status: (row.status as Appointment['status']) || 'scheduled',
			doctor: {
				id: targetDocId,
				name: row.doctor_name || 'Doctor',
				avatar_s3_key: undefined,
				speciality: row.doctor_speciality || 'General',
			},
			patient: row.patient_id ? { id: row.patient_id, name: row.patient_name || '', avatar_s3_key: null, age: 0, gender: '' } : null,
			hospital: targetHospitalId ? { id: targetHospitalId, name: row.hospital_name || '', address: '' } : null,
		}

		setRescheduleAppt(apptObject)
		setRescheduleDate(new Date(row.appointment_date || Date.now()))
		setRescheduleTime('')
		setRescheduleSlots([])
		setRescheduleHospitalId(targetHospitalId)
		setRescheduleHospitals([])
		setRescheduleOpen(true)

		if (targetDocId) {
			try {
				const docRes = (await getDoctorById(targetDocId)) as DoctorHospitalResponse
				if (docRes?.hospitals?.length) {
					const mapped: LookupHospital[] = docRes.hospitals.map((h) => ({
						id: h.hospital.id,
						label: h.hospital.name,
					}))
					setRescheduleHospitals(mapped)
				}
			} catch {
				setRescheduleHospitals([])
			}
		}
	}

	// ── fetch slots when reschedule date/hospital changes ─────────────────────
	useEffect(() => {
		if (!rescheduleOpen || !rescheduleAppt?.doctor?.id) return

		const doctorId = rescheduleAppt.doctor.id
		const hospitalId = rescheduleHospitalId || rescheduleAppt.hospital?.id

		if (!doctorId || !hospitalId) return

		const dateStr = rescheduleDate.toISOString().split('T')[0]

		const fetchSlots = async () => {
			setRescheduleSlotsLoading(true)
			setRescheduleSlots([])
			setRescheduleTime('')
			try {
				const responseData = await getDoctorAvailability({
					doctor_id: doctorId,
					hospital_id: hospitalId,
					date: dateStr,
				})
				const selectedTypeMode = appointmentType === 'clinic' ? 'clinic_visit' : 'video_call'
				const selectedModeData = getAvailabilityModeBlocks(responseData).find(
					(item) => item.appointment_mode === selectedTypeMode
				)

				const processedData = selectedModeData?.sessions || []
				setRescheduleSlots(processedData)
			} catch {
				toast.error('Could not load available slots.')
			} finally {
				setRescheduleSlotsLoading(false)
			}
		}

		fetchSlots()
	}, [rescheduleDate, rescheduleOpen, rescheduleAppt, rescheduleHospitalId, appointmentType])

	const handleRescheduleConfirm = async () => {
		if (!rescheduleAppt || !rescheduleTime) {
			toast.warning('Please select a time slot before confirming.')
			return
		}
		setRescheduleSubmitting(true)
		try {
			const dateStr = rescheduleDate.toISOString().split('T')[0]
			const res = await rescheduleAdminAppointment(rescheduleAppt.id, {
				appointment_date: dateStr,
				start_time: rescheduleTime,
				hospital_id: rescheduleHospitalId || rescheduleAppt.hospital?.id,
				reason: 'Admin rescheduled',
			})
			if (res.success) {
				toast.success('Appointment rescheduled successfully.')
				setRescheduleOpen(false)
				onMutated()
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to reschedule appointment.'))
		} finally {
			setRescheduleSubmitting(false)
		}
	}

	return {
		actionLoadingId,

		// cancel
		cancelConfirmOpen,
		apptPendingCancel,
		handleRequestCancel,
		handleCloseCancelConfirm,
		handleConfirmCancel,

		// refund
		refundConfirmOpen,
		apptPendingRefund,
		handleRequestRefund,
		handleCloseRefundConfirm,
		handleConfirmRefund,

		// reschedule
		rescheduleOpen,
		setRescheduleOpen,
		rescheduleAppt,
		rescheduleDate,
		setRescheduleDate,
		rescheduleTime,
		setRescheduleTime,
		rescheduleSlots,
		rescheduleSlotsLoading,
		rescheduleSubmitting,
		rescheduleHospitals,
		rescheduleHospitalId,
		setRescheduleHospitalId,
		appointmentType,
		setAppointmentType,
		handleOpenReschedule,
		handleRescheduleConfirm,
	}
}
