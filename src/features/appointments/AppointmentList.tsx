import React, { useEffect, useState } from 'react'
import { Box, Typography, Avatar, Card, Pagination, IconButton, Tooltip, Rating } from '@mui/material'
import RejectAppointmentDialog, { PATIENT_REJECTION_REASONS } from './components/RejectAppointmentDialog'
import SearchIcon from '@mui/icons-material/Search'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi'
import AppTable from '../../components/common/Table/AppTable'
import { customCardStyle } from '../../styles/commonStyles'
// import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth, accountHolderId } from '../../hooks/useAuth'
import type { LookupHospital } from '../../hooks/useAuth'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import AppSelect from '../../components/common/Select/AppSelect'
import AppDatePicker from '../../components/common/DatePicker/AppDatePicker'
import Grid from '@mui/material/Grid'
import AppInput from '../../components/common/Input/AppInput'
import { toast } from 'react-toastify'
import { updateAppointmentsStatus } from '../../services/appointmentService'
import { getDoctorAvailability, getAvailabilityModeBlocks, getDoctorById } from '../doctor/doctorService'
import RescheduleDrawer from '../doctor/search/components/RescheduleDrawer'
import type { SlotGroup } from '../../components/common/DateSlotPicker/DateSlotPicker'
import type { Appointment } from '../../types/appointment'
import AppButton from '../../components/common/Button/AppButton'
import AppModal from '../../components/common/Modal/AppModal'
import ConfirmIcon from '../../assets/icons/confirm.svg'
import RejectIcon from '../../assets/icons/reject.svg'
import RescheduleIcon from '../../assets/icons/reschedule.svg'
import ConsultationNotes from '../consultation/components/ConsultationNotes'
import AppDrawer from '../../components/common/Drawer/AppDrawer'
import { ConsultationDoctor } from '../../types/consultation'
import { ROUTES } from '../../constants/routes'
import { buildS3Url } from '../../utils/s3'
import StatusReasonNote from './components/StatusReasonNote'


// Status IDs accepted by PATCH /api/appointments/update-status.
// Resolved from the lookup table when available, falling back to the
// same fixed IDs used on the doctor dashboard appointments widget.
const FALLBACK_CONFIRMED_STATUS_ID = '3f9a2c8e-7b61-4d2a-9a3f-5c8e1b2d4f90'
const FALLBACK_REJECTED_STATUS_ID = 'a7d4e1c2-9f6b-4c83-b2e1-6f3a9d8c7b12'

// Converts AppDatePicker's 'DD/MM/YYYY' display format to the 'YYYY-MM-DD'
// format the appointments API's `appointment_date` filter expects.
const ddmmyyyyToIso = (value: string): string | null => {
	const [day, month, year] = value.split('/')
	if (!day || !month || !year) return null
	return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

// Types
interface AppointmentRow extends Record<string, unknown> {
	id: string
	patientName: string
	patientAvatar: string
	patientId: string
	appointmentDate: string
	startTime: string
	endTime: string | null
	appointmentMode: string
	status: string
	// Who last triggered a reschedule on this appointment ('doctor' | 'patient' | null).
	// Backend status values stay generic ('pending', 'rescheduled', ...); this is
	// what lets the UI show a label relative to who's currently looking at it.
	rescheduledBy: string | null
	doctorName: string
	doctorAvatar: string
	doctorId: string
	hospitalName: string | null
	hospitalAddress: string | null
	hospitalId: string | null
	fees: number | null
	prescriptionS3Key: string | null
	reason: string | null
	/** 'Cancelled by you' / 'Rescheduled by the patient' ...: the line for `reason`, worded for the person looking. */
	statusReasonTitle: string | null
}

interface AppointmentMeta {
	total: number
	page: number
	limit: number
	pages: number
}

interface DoctorReview {
	id: string
	rating: number
	comment: string | null
	created_at: string | null
}

interface AppointmentReviewResponse {
	success: boolean
	message: string
	data: DoctorReview | null
}

interface AppointmentsResponse {
	success: boolean
	message: string
	data: {
		id: string
		appointment_mode: string
		appointment_date: string
		start_time: string
		end_time: string | null
		status: string
		reason?: string | null
		/** Why it was cancelled / rescheduled, and the line that goes with it (see StatusReasonNote). */
		status_reason?: string | null
		status_reason_title?: string | null
		rescheduled_by?: string | null
		doctor?: { id: string; name: string; avatar_s3_key?: string | null } | null
		patient?: { id: string; name: string; avatar_s3_key: string | null; gender: string | null; age: number | null } | null
		hospital: { id: string; name: string; address: string } | null
		fees?: number | null
		prescription_s3_key?: string | null
	}[]
	meta: { total: number; page: number; limit: number; pages: number }
}

type ColDef = {
	field: string
	label: string
	align?: 'left' | 'right' | 'center'
	render?: (value: unknown, row: AppointmentRow) => React.ReactNode
}

// Once an appointment reaches one of these statuses, the workflow is over â€”
// no further actions and no further status changes. Every other status
// keeps Status and Action visible side by side: Status always shows, and
// whatever action is valid for that status (e.g. Reschedule on a confirmed
// appointment) is offered alongside it, not in place of it.
const TERMINAL_STATUSES = new Set(['cancelled'])

export default function AppointmentList() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const { role, user, lookupData } = useAuth()
	const queryView = searchParams.get('view')
	const highlightedAppointmentId = searchParams.get('appointment_id') || searchParams.get('open_appointment_id')
	const viewAs: 'doctor' | 'patient' =
		queryView === 'doctor' || queryView === 'patient' ? queryView : role === 'patient' ? 'patient' : 'doctor'
	// whose appointments are listed: the signed-in patient (the account holder) or one of their family members, chosen in
	// the selector in the header. A booking made for a family member is listed under that person, not under the account holder.
	const holderPatientId = (role === 'patient' ? accountHolderId({ lookupData, user }) : '') || ''
	const { members } = useFamilyMembers()
	const [selectedPatientId, setSelectedPatientId] = useState('') // '' = the account holder
	const activePatientId = selectedPatientId || holderPatientId

	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(10)
	const [rows, setRows] = useState<AppointmentRow[]>([])
	const [meta, setMeta] = useState<AppointmentMeta>({ total: 0, page: 1, limit: 10, pages: 0 })
	const [loading, setLoading] = useState(true)

	const [filterHospital, setFilterHospital] = useState('all')
	const [filterMode, setFilterMode] = useState('all')
	// 'DD/MM/YYYY' string (AppDatePicker's format) or null when no date filter is applied.
	const [filterDate, setFilterDate] = useState<string | null>(null)
	const [filterStatus, setFilterStatus] = useState('all')

	// Navigate a patient directly into the consultation page for a given
	// appointment row. Doctor's OTP-gated consultation flow (DoctorAppointments.tsx)
	// is untouched -- this only applies to the patient's own appointments list.
	// const goToConsultation = (row: AppointmentRow) => {
	// 	navigate(
	// 		ROUTES.PORTAL.CONSULTATION.replace(':patientId', row.patientId).replace(':appointmentId', row.id)
	// 	)
	// }

	// â”€â”€ Action state (Confirm / Reject / Reschedule) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
	const [pendingRejectId, setPendingRejectId] = useState<string | null>(null)
	const [rejectSubmitting, setRejectSubmitting] = useState(false)

	const [rescheduleOpen, setRescheduleOpen] = useState(false)
	const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null)
	const [rescheduleDate, setRescheduleDate] = useState(new Date())
	const [rescheduleTime, setRescheduleTime] = useState('')
	const [rescheduleSlots, setRescheduleSlots] = useState<SlotGroup[]>([])
	const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false)
	const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
	const [rescheduleHospitals, setRescheduleHospitals] = useState<LookupHospital[]>([])
	const [rescheduleHospitalId, setRescheduleHospitalId] = useState('')
	const [rescheduleReason, setRescheduleReason] = useState('')
	const [appointmentType, setAppointmentType] = useState<'clinic' | 'video'>('clinic')

	// â”€â”€ Appointment Details Drawer state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	const [notesDrawerOpen, setNotesDrawerOpen] = useState(false)
	const [notesDrawerDoctor, setNotesDrawerDoctor] = useState<ConsultationDoctor | null>(null)
	const [notesDrawerPrescription, setNotesDrawerPrescription] = useState<string | null>(null)

	// ── Give Review modal state (patient view only) ─────────────────────────
	const [reviewOpen, setReviewOpen] = useState(false)
	const [reviewAppt, setReviewAppt] = useState<AppointmentRow | null>(null)
	const [reviewRating, setReviewRating] = useState<number | null>(0)
	const [reviewText, setReviewText] = useState('')
	const [reviewSubmitting, setReviewSubmitting] = useState(false)
	// This appointment's own review only (not the doctor's whole review history) - null means not yet reviewed.
	const [existingReview, setExistingReview] = useState<DoctorReview | null>(null)
	const [existingReviewLoading, setExistingReviewLoading] = useState(false)

	const confirmedStatusId =
		lookupData?.appointment_statuses?.find((s) => s.label === 'confirmed')?.id ?? FALLBACK_CONFIRMED_STATUS_ID
	const rejectedStatusId =
		lookupData?.appointment_statuses?.find((s) => s.label === 'cancelled')?.id ?? FALLBACK_REJECTED_STATUS_ID

	useEffect(() => {
		const fetchAppointments = async () => {
			setLoading(true)

			try {
				const params: Record<string, unknown> = {
					page,
					limit: size,
				}
				if (highlightedAppointmentId) params.appointment_id = highlightedAppointmentId

				if (viewAs === 'patient' && activePatientId) params.patient_id = activePatientId
				if (search) params.search = search

				if (filterHospital !== 'all') {
					params.hospital_id = filterHospital
				}

				if (filterMode !== 'all') {
					params.appointment_mode = filterMode === 'clinic' ? 'clinic_visit' : 'video_call'
				}

				if (filterStatus !== 'all') {
					const statusObj = lookupData?.appointment_statuses.find(
						(s) => s.label.toLowerCase() === filterStatus.toLowerCase()
					)
					if (statusObj) {
						params.status_id = statusObj.id
					}
				}

				if (filterDate) {
					// Backend filters at the query level via `appointment_date` (exact match).
					const apiDate = ddmmyyyyToIso(filterDate)
					if (apiDate) params.appointment_date = apiDate
				}

				const res = await ApiService.getWithParams<AppointmentsResponse>(API_ENDPOINTS.APPOINTMENTS.GET, params)

				const mapped: AppointmentRow[] = res.data.data.map((appt) => ({
					id: appt.id,
					patientName: appt.patient?.name ?? 'Patient',
					patientAvatar: buildS3Url(appt.patient?.avatar_s3_key),
					patientId: appt.patient?.id ?? activePatientId,
					appointmentDate: appt.appointment_date,
					startTime: appt.start_time,
					endTime: appt.end_time,
					appointmentMode: appt.appointment_mode,
					status: appt.status,
					reason: appt.status_reason ?? null,
					statusReasonTitle: appt.status_reason_title ?? null,
					rescheduledBy: appt.rescheduled_by ?? null,
					doctorName: appt.doctor?.name ?? 'Doctor',
					doctorAvatar: buildS3Url(appt.doctor?.avatar_s3_key),
					doctorId: appt.doctor?.id ?? '',
					hospitalName: appt.hospital?.name ?? null,
					hospitalAddress: appt.hospital?.address ?? null,
					hospitalId: appt.hospital?.id ?? null,
					fees: appt.fees ?? null,
					prescriptionS3Key: appt.prescription_s3_key ?? null,
				}))

				// Sort by appointment date descending (latest date first).
				// For appointments on the same date, sort by start time descending
				// (latest time first) so the newest appointments stay on top,
				// while all appointments â€” past and upcoming â€” remain visible.
				const sorted = [...mapped].sort((a, b) => {
					const dateDiff = b.appointmentDate.localeCompare(a.appointmentDate)
					if (dateDiff !== 0) return dateDiff
					return (b.startTime ?? '').localeCompare(a.startTime ?? '')
				})

				setRows(sorted)

				setMeta({
					total: res.data.meta.total,
					page: res.data.meta.page,
					limit: res.data.meta.limit,
					pages: res.data.meta.pages,
				})
			} finally {
				setLoading(false)
			}
		}

		fetchAppointments()
	}, [activePatientId, page, search, size, highlightedAppointmentId, filterHospital, filterMode, filterDate, filterStatus, lookupData, viewAs])

	// â”€â”€ Reschedule: fetch slots whenever the drawer's date/hospital/mode changes â”€â”€
	useEffect(() => {
		if (!rescheduleOpen || !rescheduleAppt) return

		const doctorId = rescheduleAppt.doctor?.id
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

	// Fetch doctor's practice locations when rescheduling is opened
	useEffect(() => {
		if (!rescheduleAppt || !rescheduleOpen) return

		const fetchDoctorHospitals = async () => {
			if (rescheduleAppt.doctor?.id) {
				try {
					const res = await getDoctorById(rescheduleAppt.doctor.id)
					if (res.success && res.data) {
						setRescheduleHospitals(
							res.data.hospitals.map((h) => ({
								id: h.hospital.id,
								label: h.hospital.name,
								address: h.hospital.address,
							}))
						)
					}
				} catch (err) {
					console.error('Failed to fetch doctor hospitals:', err)
				}
			}
		}

		fetchDoctorHospitals()
	}, [rescheduleAppt, rescheduleOpen])


	// â”€â”€ Action handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

	const handleConfirm = async (row: AppointmentRow) => {
		try {
			const res = await updateAppointmentsStatus(row.id, confirmedStatusId)
			if (res.success) {
				toast.success(res.message || 'Appointment confirmed.')
				setRows((prev) =>
					prev.map((r) => (r.id === row.id ? { ...r, status: 'confirmed', rescheduledBy: null } : r))
				)
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		}
	}

	const handleRejectClick = (rowId: string) => {
		setPendingRejectId(rowId)
		setRejectDialogOpen(true)
	}

	const handleCancelReject = () => {
		setRejectDialogOpen(false)
		setPendingRejectId(null)
	}

	const handleConfirmReject = async (reason: string) => {
		if (!pendingRejectId) return
		const rowId = pendingRejectId
		setRejectSubmitting(true)
		try {
			const res = await updateAppointmentsStatus(rowId, rejectedStatusId, reason)
			if (res.success) {
				toast.success(res.message || 'Appointment rejected.')
				setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, status: 'cancelled', reason } : r)))
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setRejectSubmitting(false)
			setRejectDialogOpen(false)
			setPendingRejectId(null)
		}
	}

	const handleRescheduleClick = (row: AppointmentRow) => {
		const apptForReschedule = {
			id: row.id,
			public_id: row.id,
			appointment_mode: row.appointmentMode,
			appointment_date: row.appointmentDate,
			start_time: row.startTime,
			end_time: row.endTime ?? '',
			fees: row.fees ?? 0,
			created_at: '',
			status: row.status,
			doctor: { id: row.doctorId, name: row.doctorName, avatar_s3_key: row.doctorAvatar },
			patient: { id: row.patientId, name: row.patientName, avatar_s3_key: row.patientAvatar, age: 0, gender: '' },
			hospital: row.hospitalId
				? { id: row.hospitalId, name: row.hospitalName ?? '', address: row.hospitalAddress ?? '' }
				: null,
		} as unknown as Appointment

		setRescheduleAppt(apptForReschedule)
		setRescheduleHospitalId(row.hospitalId ?? '')
		setRescheduleDate(new Date())
		setRescheduleTime('')
		setRescheduleSlots([])
		setRescheduleHospitals([])
		setRescheduleReason('')
		setRescheduleOpen(true)
	}

	const handleRescheduleConfirm = async () => {
		if (!rescheduleAppt || !rescheduleTime) {
			toast.warning('Please select a time slot before confirming.')
			return
		}
		setRescheduleSubmitting(true)
		try {
			const dateStr = rescheduleDate.toISOString().split('T')[0]
			const res = await ApiService.post<{ success: boolean; message: string }>(
				`${API_ENDPOINTS.APPOINTMENTS.RESCHEDULE}`,
					{
						appointment_id: rescheduleAppt.id,
						appointment_date: dateStr,
						start_time: rescheduleTime,
						end_time: null,
						hospital_id: rescheduleHospitalId || rescheduleAppt.hospital?.id,
						reason: rescheduleReason.trim() || undefined,
					}
				)
			if (res.data?.success) {
				toast.success(res.data.message || 'Appointment rescheduled!')

				const slot = rescheduleSlots.flatMap((s) => s.slots).find((sl) => sl.start_time === rescheduleTime)
				const slotEndTime = slot ? slot.end_time : null

				setRows((prev) =>
					prev.map((r) => {
						if (r.id !== rescheduleAppt.id) return r
						// Mirrors the backend rule in reschedule_appointment(): a
						// still-'pending' appointment stays 'pending' after a
						// reschedule; anything else moves to 'rescheduled'. This
						// page only ever triggers reschedule from the patient's
						// side (the doctor's My Appointments page has no action
						// column), so the initiator is always 'patient' here.
						const wasPending = (r.status || '').toLowerCase() === 'pending'
						return {
							...r,
							appointmentDate: dateStr,
							startTime: rescheduleTime,
							endTime: slotEndTime,
							status: wasPending ? r.status : 'rescheduled',
							rescheduledBy: 'patient',
						}
					})
				)
				setRescheduleOpen(false)
			} else {
				toast.error(res.data?.message || 'Reschedule failed. Please try again.')
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setRescheduleSubmitting(false)
		}
	}

	// ── Give Review (patient view only) ──────────────────────────────────────
	const handleOpenReview = (row: AppointmentRow) => {
		setReviewAppt(row)
		setReviewRating(0)
		setReviewText('')
		setReviewOpen(true)
		fetchReviewForAppointment(row.id)
	}

	// Fetches only this patient's own review for this specific appointment
	// (GET /api/reviews/appointment/{appointment_id}) - not the doctor's
	// entire review history from other patients.
	const fetchReviewForAppointment = async (appointmentId: string) => {
		setExistingReviewLoading(true)
		setExistingReview(null)
		try {
			const res = await ApiService.get<AppointmentReviewResponse>(API_ENDPOINTS.REVIEWS.BY_APPOINTMENT(appointmentId))
			if (res.data?.success) {
				setExistingReview(res.data.data)
			}
		} catch (err) {
			console.error('Failed to fetch review for appointment:', err)
		} finally {
			setExistingReviewLoading(false)
		}
	}

	const handleSubmitReview = async () => {
		if (!reviewAppt || !reviewRating || reviewRating < 1) {
			toast.warning('Please select a rating before submitting.')
			return
		}

		setReviewSubmitting(true)
		try {
			const response = await ApiService.post<{ success: boolean; message: string; data: DoctorReview }>(
				API_ENDPOINTS.REVIEWS.CREATE,
				{
					doctor_id: reviewAppt.doctorId,
					appointment_id: reviewAppt.id,
					rating: reviewRating,
					comment: reviewText.trim() || undefined,
				}
			)

			toast.success(response.data?.message || 'Thank you for your review!')
			setReviewOpen(false)
			setReviewAppt(null)
			setReviewRating(0)
			setReviewText('')
			setExistingReview(null)
		} catch (error: unknown) {
			const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
			toast.error(message || 'Unable to submit your review right now. Please try again.')
		} finally {
			setReviewSubmitting(false)
		}
	}

	// â”€â”€ Name column â€” shown once, based on viewAs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	// Format HH:MM:SS or HH:MM -> H:MM
	const formatTime = (t: string | null): string => {
		if (!t) return ''
		const [h, m] = t.split(':')
		return parseInt(h, 10) + ':' + m
	}

	// Combine appointment date + start time into a single Date so "past" is
	// determined using the full date-time, not just the calendar date.
	const isAppointmentPast = (row: AppointmentRow): boolean => {
		if (!row.appointmentDate) return false
		const rawTime = row.startTime || '00:00:00'
		const timePart = rawTime.length === 5 ? `${rawTime}:00` : rawTime
		const appointmentDateTime = new Date(`${row.appointmentDate}T${timePart}`)
		if (Number.isNaN(appointmentDateTime.getTime())) return false
		return appointmentDateTime.getTime() < Date.now()
	}

	// Backend status values never change ('pending', 'confirmed', 'rescheduled',
	// 'cancelled', ...) â€” only how they're *labeled* depends on who's looking:
	//
	//   pending                          â†’ Doctor: "Pending"
	//                                       Patient: "Waiting for Doctor Confirmation"
	//   rescheduled, viewer is the one    â†’ "Rescheduled"
	//     who triggered it                 (they already took their action)
	//   rescheduled, viewer is the OTHER  â†’ "Waiting for Your Confirmation"
	//     party                             (an action is required from them)
	//   confirmed / cancelled / completed / ...  â†’ same label for both roles
	const formatFallbackStatus = (label: string): string =>
		label
			.split('_')
			.filter(Boolean)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ')

	const getStatusDisplayLabel = (row: AppointmentRow): string => {
		const status = (row.status || '').toLowerCase()
		const rescheduledBy = (row.rescheduledBy || '').toLowerCase()

		if (status === 'pending') {
			if (rescheduledBy === 'doctor') {
				return viewAs === 'doctor' ? 'Waiting for Patient Confirmation' : 'Waiting for Your Confirmation'
			}
			return viewAs === 'doctor' ? 'Pending' : 'Waiting for Doctor Confirmation'
		}

		if (status === 'rescheduled') {
			if (!rescheduledBy) {
				// No audit trail to say who rescheduled it (older data) â€” show a
				// neutral label instead of guessing who's being waited on.
				return 'Rescheduled'
			}
			if (rescheduledBy === 'doctor') {
				return viewAs === 'doctor' ? 'Waiting for Patient Confirmation' : 'Waiting for Your Confirmation'
			} else if (rescheduledBy === 'patient') {
				return viewAs === 'patient' ? 'Waiting for Doctor Confirmation' : 'Waiting for Your Confirmation'
			}
			return rescheduledBy === viewAs ? 'Rescheduled' : 'Waiting for Your Confirmation'
		}

		return formatFallbackStatus(row.status || '')
	}

	const patientNameColumn: ColDef = {
		field: 'patientName',
		label: 'Patient name',
		render: (_value, row) => (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
				<Avatar
					src={row.patientAvatar}
					alt={row.patientName}
					sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}
				>
					{row.patientName.charAt(0)}
				</Avatar>
				<Typography fontSize={13} fontWeight={600} color="text.primary" lineHeight={1.3}>
					{row.patientName}
				</Typography>
			</Box>
		),
	}

	const doctorNameColumn: ColDef = {
		field: 'doctorName',
		label: 'Doctor name',
		render: (_value, row) => (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
				<Avatar
					src={row.doctorAvatar}
					alt={row.doctorName}
					sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}
				>
					{row.doctorName.charAt(0)}
				</Avatar>
				<Typography fontSize={13} fontWeight={600} color="text.primary" lineHeight={1.3}>
					{row.doctorName}
				</Typography>
			</Box>
		),
	}

	const baseColumns: ColDef[] = [
		{
			field: 'appointmentDate',
			label: 'Date and time',
			render: (_value, row) => (
				<Box>
					<Typography fontSize={13} color="text.primary" fontWeight={500}>
						{row.appointmentDate}
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
						<AccessTimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
						<Typography fontSize={11} color="text.secondary">
							{formatTime(row.startTime)}
							{row.endTime ? ' - ' + formatTime(row.endTime) : ''}
						</Typography>
					</Box>
				</Box>
			),
		},
		{
			field: 'appointmentMode',
			label: 'Mode',
			render: (_value, row) => (
				<Typography fontSize={13} color="text.primary" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
					{row.appointmentMode?.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
				</Typography>
			),
		},
		{
			field: 'hospitalName',
			label: 'Hospital',
			render: (_value, row) => (
				<Box>
					<Typography fontSize={13} color="text.primary" fontWeight={500}>
						{row.hospitalName ?? '\u2014'}
					</Typography>
					{row.hospitalAddress && (
						<Typography fontSize={11} color="text.secondary" lineHeight={1.3} mt={0.3}>
							{row.hospitalAddress}
						</Typography>
					)}
				</Box>
			),
		},
		{
			field: 'fees',
			label: 'Fees',
			render: (_value, row) => (
				<Typography fontSize={13} color="text.primary" fontWeight={500}>
					{row.fees != null ? '\u20B9' + row.fees : '\u2014'}
				</Typography>
			),
		},
		// Status is always shown for every appointment â€” including cancelled â€”
		// as its own column. It never gets hidden or swapped out by the Action
		// column (see `actionColumn` below for how the two coexist), and its
		// text is role-aware via `getStatusDisplayLabel` even though the
		// underlying backend status value is identical for both roles.
		{
			field: 'status',
			label: 'Status',
			render: (_value, row) => (
				<Box>
					<Typography fontSize={13} fontWeight={600}>
						{getStatusDisplayLabel(row)}
					</Typography>
					<StatusReasonNote status={row.status} title={row.statusReasonTitle} reason={row.reason} compact />
				</Box>
			),
		},
	]

	// Action column â€” Patient's "My Appointments" page only (see viewAs === 'patient'
	// guard where `columns` is built). Doctor's page never gets this column.
	//
	// Status and Action are independent columns that always coexist: Status
	// keeps showing whatever the current state is, and this column separately
	// shows whichever actions are still valid for that state.
	//
	// Visibility rules:
	//  - Never shown once the appointment's date + time has passed.
	//  - Never shown once the appointment is in a terminal status (cancelled) â€”
	//    no further actions, no further status changes.
	//  - 'rescheduled', proposed by the doctor â†’ the patient needs to review the
	//    new slot, so Confirm (accept it) is offered alongside Reschedule / Reject.
	//    (This is the case where the patient's Status label reads "Waiting for
	//    Your Confirmation" â€” the action and the label agree.)
	//  - 'rescheduled', proposed by the patient themselves â†’ nothing new for the
	//    patient to accept (their Status label reads "Rescheduled"; the doctor
	//    is the one waiting now), so only Reschedule / Reject are offered.
	//  - any other non-terminal status (pending, confirmed, ...) â†’ Reschedule and
	//    Reject remain available (e.g. a confirmed appointment can still be
	//    rescheduled or cancelled later), but Confirm is not shown.
	//  - 'completed' â†’ the only case that ignores the past-appointment rule below:
	//    shows a Give Review button instead of the usual action set.
	const actionColumn: ColDef = {
		field: 'action',
		label: 'Action',
		render: (_value, row) => {
			const status = (row.status || '').toLowerCase()
			const rescheduledBy = (row.rescheduledBy || '').toLowerCase()

			// Completed appointments never carry the Confirm/Reject/Reschedule set below
			// (they're always past), but they do get their own Action-column entry:
			// a Give Review button, so it now lives alongside the other actions
			// instead of next to the Status text.
			if (status === 'completed') {
				return (
					<AppButton
						label='Review'
						variant='outlined'
						size='small'
						borderRadius='20px'
						onClick={(e) => {
							e.stopPropagation()
							handleOpenReview(row)
						}}
					/>
				)
			}

			if (isAppointmentPast(row)) return null
			if (TERMINAL_STATUSES.has(status)) return null

			const showAccept = rescheduledBy === 'doctor' && status !== 'confirmed'

			return (
				<Box sx={{ display: 'flex', gap: 0.75 }}>
					{showAccept && (
						<Tooltip title="Accept">
							<IconButton
								size="small"
								onClick={(e) => {
									e.stopPropagation()
									handleConfirm(row)
								}}
								sx={{
									bgcolor: '#e8f5e9',
									borderRadius: '8px',
									p: 0.9,
									'&:hover': { bgcolor: '#d5ecd6' },
								}}
							>
								<img src={ConfirmIcon} width={16} height={16} alt="Accept" />
							</IconButton>
						</Tooltip>
					)}
					<Tooltip title="Reject">
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation()
								handleRejectClick(row.id)
							}}
							sx={{
								bgcolor: '#ffeeee',
								borderRadius: '8px',
								p: 0.9,
								'&:hover': { bgcolor: '#ffd9d9' },
							}}
						>
							<img src={RejectIcon} width={16} height={16} alt="Reject" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Reschedule">
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation()
								handleRescheduleClick(row)
							}}
							sx={{
								bgcolor: '#fff8e8',
								borderRadius: '8px',
								p: 0.9,
								'&:hover': { bgcolor: '#ffefc7' },
							}}
						>
							<img src={RescheduleIcon} width={16} height={16} alt="Reschedule" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Book Cab">
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation()
								navigate(`/portal/appointments/${row.id}/book-ride?type=onward`)
							}}
							sx={{
								bgcolor: '#e0f2f1',
								borderRadius: '8px',
								p: 0.9,
								'&:hover': { bgcolor: '#b2dfdb' },
							}}
						>
							<LocalTaxiIcon sx={{ fontSize: 16, color: '#00796b' }} />
						</IconButton>
					</Tooltip>
				</Box>
			)
		},
	}

	// â”€â”€ View column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	// Both roles: eye icon opens the consultation notes drawer in place;
	// clicking the row/card itself navigates to the full Consultation page.
	const viewColumn: ColDef = {
		field: 'view',
		label: '',
		render: (_value, row) => (
			<Tooltip title='View Consultation Notes'>
				<IconButton
					size='small'
					onClick={(e) => {
						e.stopPropagation()
						// Eye icon opens the consultation notes drawer in place for both roles.
						// Row data doesn't carry the doctor's degree/specialization, so those
						// fall back to blank (ConsultationNotes only displays them in its header).
						setNotesDrawerDoctor({
							name: row.doctorName,
							degree: '',
							specialization: '',
							clinicName: row.hospitalName ?? '',
							clinicAddress: row.hospitalAddress ?? '',
						})
						setNotesDrawerPrescription(row.prescriptionS3Key)
						setNotesDrawerOpen(true)
					}}
					aria-label='View appointment details'
					sx={{
						bgcolor: '#e8eaf6',
						borderRadius: '8px',
						p: 0.9,
						'&:hover': { bgcolor: '#c5cae9' },
					}}
				>
					{viewAs === 'patient' ? (
						<VisibilityOutlinedIcon sx={{ fontSize: 16, color: '#3949ab' }} />
					) : (
						<InfoOutlinedIcon sx={{ fontSize: 16, color: '#3949ab' }} />
					)}
				</IconButton>
			</Tooltip>
		),
	}

	const [hospitalOptions, setHospitalOptions] = useState([
		{ value: 'all', label: 'All' },
	])

	useEffect(() => {
		const fetchHospitals = async () => {
			if (viewAs === 'patient') {
				try {
					const res = await ApiService.get<{ success: boolean; data: { hospital_id: number | string; hospital_name: string }[] }>(API_ENDPOINTS.PATIENT.APPOINTMENTS_HOSPITALS)
					if (res.data?.success) {
						const fetchedOptions = res.data.data.map((h) => ({
							value: String(h.hospital_id),
							label: h.hospital_name,
						}))
						setHospitalOptions([{ value: 'all', label: 'All' }, ...fetchedOptions])
					}
				} catch (err) {
					console.error('Failed to fetch hospitals', err)
				}
			}
		}
		fetchHospitals()
	}, [viewAs])

	const modeOptions = [
		{ value: 'all', label: 'All' },
		{ value: 'clinic', label: 'Clinic Visit' },
		{ value: 'video', label: 'Video Call' },
	]


	const statusOptions = [
		{ value: 'all', label: 'All' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'reschedule', label: 'Reschedule' },
		{ value: 'cancelled', label: 'Cancelled' },
	]

	const getFilterSelectProps = (options: { value: string; label: string }[]) => ({
		displayEmpty: true,
		renderValue: (selected: unknown) => {
			const selectedOption = options.find((option) => option.value === selected)
			return selectedOption && selectedOption.value !== 'all' ? selectedOption.label : ''
		},
		MenuProps: {
			PaperProps: {
				sx: { mt: 1, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' },
			},
		},
	})

	// Doctor's My Appointments page never gets the Action column (rule: actions
	// are patient-only). Patient's page appends it after the shared columns.
	// Both roles always get the View (eye) column as the last column.
	const columns =
		viewAs === 'doctor'
			? [patientNameColumn, ...baseColumns, viewColumn]
			: [doctorNameColumn, ...baseColumns, actionColumn, viewColumn]
	return (
		<Box sx={{ p: 3 }}>
			{/* Page header */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					gap: 2,
					mb: 2.5,
				}}
			>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
						{viewAs === 'patient' ? 'My Appointments' : 'My Appointments'}
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '13px' }}>
						{viewAs === 'patient'
							? 'View, reschedule or cancel your healthcare visits'
							: 'Manage your patient consultations'}
					</Typography>
				</Box>
				{viewAs === 'patient' && members.length > 1 && (
					<Box sx={{ width: { xs: '100%', sm: 280 } }}>
						<AppSelect
							label="Appointments for"
							value={activePatientId}
							onChange={(e) => {
								setSelectedPatientId(e.target.value === holderPatientId ? '' : e.target.value)
								setPage(1)
							}}
							options={members.map((m) => ({ value: m.id, label: `${m.name} (${m.relationship})` }))}
							fullWidth
						/>
					</Box>
				)}
			</Box>
			{/* Filter bar */}
			{loading ? (
				<Grid container spacing={2} sx={{ mb: 2.5, alignItems: 'center' }}>
					<Grid size={{ xs: 12, lg: 8 }}>
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSkeleton variant="rounded" width="100%" height={44} />
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSkeleton variant="rounded" width="100%" height={44} />
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSkeleton variant="rounded" width="100%" height={44} />
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSkeleton variant="rounded" width="100%" height={44} />
							</Grid>
						</Grid>
					</Grid>
					<Grid size={{ xs: 12, lg: 4 }}>
						<AppSkeleton variant="rounded" width="100%" height={44} />
					</Grid>
				</Grid>
			) : (
				<Grid container spacing={2} sx={{ mb: 2.5, alignItems: 'flex-end' }}>
					<Grid size={{ xs: 12, lg: 8 }}>
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSelect
									label="Hospital"
									value={filterHospital}
									onChange={(e) => {
										setFilterHospital(e.target.value)
										setPage(1)
									}}
									options={hospitalOptions}
									slotProps={{
										select: getFilterSelectProps(hospitalOptions),
									}}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSelect
									label="Mode"
									value={filterMode}
									onChange={(e) => {
										setFilterMode(e.target.value)
										setPage(1)
									}}
									options={modeOptions}
									slotProps={{
										select: getFilterSelectProps(modeOptions),
									}}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								{/* caption above the box, like the Hospital / Mode / Status filters, so the boxes sit level */}
								<Typography
									variant="caption"
									sx={{ display: 'block', fontWeight: 400, fontSize: '0.8rem', color: '#0f172a', mb: 0.75, letterSpacing: '0.01em' }}
								>
									Date
								</Typography>
								<AppDatePicker
									value={filterDate}
									onChange={(value) => {
										setFilterDate(value)
										setPage(1)
									}}
									clearable
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSelect
									label="Status"
									value={filterStatus}
									onChange={(e) => {
										setFilterStatus(e.target.value)
										setPage(1)
									}}
									options={statusOptions}
									slotProps={{
										select: getFilterSelectProps(statusOptions),
									}}
								/>
							</Grid>
						</Grid>
					</Grid>
					<Grid size={{ xs: 12, lg: 4 }}>
						<AppInput
							fullWidth
							size="small"
							placeholder={
								viewAs === 'doctor' ? 'Search Patient ID, Name...' : 'Search Doctor ID, Name...'
							}
							value={search}
							onChange={(e) => {
								setSearch(e.target.value)
								setPage(1)
							}}
							startIcon={<SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />}
							enableVoiceSearch
							onVoiceResult={(text) => {
								setSearch(text)
								setPage(1)
							}}
						/>
					</Grid>
				</Grid>
			)}
			{loading ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{Array.from({ length: 7 }).map((_, i) => (
						<AppSkeleton key={i} variant="rounded" width="100%" height={70} />
					))}
				</Box>
			) : (
				<Card
					sx={{
						...customCardStyle,
						p: 0,
						overflow: 'visible',
						bgcolor: 'transparent',
						border: 'none',
						boxShadow: 'none',
					}}
				>
					<AppTable<AppointmentRow>
						key={viewAs}
						columns={columns}
						rows={rows}
						emptyMessage="No appointments found"
						rowSx={(row) =>
							row.id === highlightedAppointmentId
								? {
									bgcolor: 'rgba(12,124,124,0.08)',
									boxShadow: 'inset 4px 0 0 #0c7c7c',
									'&:hover': { bgcolor: 'rgba(12,124,124,0.12)' },
								}
								: {}
						}
						onRowClick={(row) =>
							navigate(
								ROUTES.PORTAL.CONSULTATION.replace(':patientId', row.patientId).replace(
									':appointmentId',
									row.id
								)
							)
						}
						page={page}
						pageSize={size}
						totalRows={meta.total}
						onPageChange={(value) => setPage(value)}
						onPageSizeChange={(value) => {
							setSize(value)
							setPage(1)
						}}
					/>
				</Card>
			)}

			{/* Reject confirmation dialog */}
			<RejectAppointmentDialog
				open={rejectDialogOpen}
				onCancel={handleCancelReject}
				onConfirm={handleConfirmReject}
				submitting={rejectSubmitting}
				reasons={viewAs === 'patient' ? PATIENT_REJECTION_REASONS : undefined}
			/>

			{/* Reschedule drawer */}
			<RescheduleDrawer
				rescheduleOpen={rescheduleOpen}
				setRescheduleOpen={setRescheduleOpen}
				rescheduleAppt={rescheduleAppt}
				rescheduleDate={rescheduleDate}
				setRescheduleDate={setRescheduleDate}
				rescheduleTime={rescheduleTime}
				setRescheduleTime={setRescheduleTime}
				rescheduleSlots={rescheduleSlots}
				rescheduleSlotsLoading={rescheduleSlotsLoading}
				rescheduleSubmitting={rescheduleSubmitting}
				handleRescheduleConfirm={handleRescheduleConfirm}
				rescheduleHospitals={rescheduleHospitals}
				rescheduleHospitalId={rescheduleHospitalId}
				setRescheduleHospitalId={setRescheduleHospitalId}
				appointmentType={appointmentType}
				setAppointmentType={setAppointmentType}
				reason={rescheduleReason}
				onReasonChange={setRescheduleReason}
			/>

			{/* Consultation Notes drawer (eye icon) — reuses the shared AppDrawer */}
			<AppDrawer
				open={notesDrawerOpen}
				onClose={() => {
					setNotesDrawerOpen(false)
					setNotesDrawerDoctor(null)
					setNotesDrawerPrescription(null)
				}}
				title='Consultation Notes'
				subtitle={notesDrawerDoctor?.name}
				cancelLabel=''
				confirmLabel='Close'
				onConfirm={() => {
					setNotesDrawerOpen(false)
					setNotesDrawerDoctor(null)
					setNotesDrawerPrescription(null)
				}}
				width={520}
			>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 500 }}>
					{/* Prescription — from patient_treatments.prescription_s3_key via the appointments API */}
					<Box
						sx={{
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: '12px',
							p: 2,
						}}
					>
						<Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', mb: 1 }}>
							Prescription
						</Typography>
						{notesDrawerPrescription ? (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<DescriptionOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
								<Typography
									component='a'
									href={buildS3Url(notesDrawerPrescription)}
									target='_blank'
									rel='noopener noreferrer'
									sx={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: 0.4,
										fontSize: 13,
										fontWeight: 600,
										color: 'primary.main',
										textDecoration: 'none',
										'&:hover': { textDecoration: 'underline' },
									}}
								>
									<OpenInNewIcon sx={{ fontSize: 14 }} />
									View / Download
								</Typography>
							</Box>
						) : (
							<Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Prescription: Not Available</Typography>
						)}
					</Box>

					<Box sx={{ display: 'flex', flex: 1 }}>
						{notesDrawerDoctor && <ConsultationNotes doctor={notesDrawerDoctor} />}
					</Box>
				</Box>
			</AppDrawer>

			{/* Give Review modal (patient view only) */}
			<AppModal open={reviewOpen} onClose={() => setReviewOpen(false)} title={reviewAppt ? 'Review ' + reviewAppt.doctorName : 'Give Review'}>
				{existingReviewLoading ? (
					<Box sx={{ mb: 2.5 }}>
						<AppSkeleton variant='rounded' width='100%' height={90} />
					</Box>
				) : existingReview ? (
					// Patient already reviewed this specific appointment - show just
					// that review (read-only), not the doctor's other patients' reviews.
					<Box>
						<Box
							sx={{
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: '10px',
								p: 1.5,
								mb: 2,
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<Rating value={existingReview.rating} readOnly size='medium' />
								{existingReview.created_at && (
									<Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
										{new Date(existingReview.created_at).toLocaleDateString()}
									</Typography>
								)}
							</Box>
							{existingReview.comment && (
								<Typography sx={{ fontSize: 13, color: 'text.primary', mt: 1 }}>
									{existingReview.comment}
								</Typography>
							)}
						</Box>
					</Box>
				) : (
					// No review yet for this appointment - let the patient give one.
					<>
						<Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
							<Rating
								value={reviewRating}
								onChange={(_, value) => setReviewRating(value)}
								size='large'
							/>
						</Box>
						<AppInput
							label='Write Review'
							value={reviewText}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReviewText(e.target.value)}
							multiline
							rows={3}
							fullWidth
						/>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
							<AppButton label='Cancel' variant='outlined' onClick={() => setReviewOpen(false)} />
							<AppButton label='Submit' loading={reviewSubmitting} onClick={handleSubmitReview} disabled={!reviewRating} />
						</Box>
					</>
				)}
			</AppModal>

		</Box>
	)
}
