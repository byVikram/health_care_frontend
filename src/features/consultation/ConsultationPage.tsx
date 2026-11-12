// src/features/consultation/ConsultationPage.tsx
import { useEffect, useState } from 'react'
// import { customCardStyle } from '../../styles/commonStyles'
import { useParams } from 'react-router-dom'
import { useGoBack } from '../../hooks/useGoBack'
import {
	Box,
	Container,
	Typography,
	Avatar,
	Tab,
	Tabs,
	IconButton,
	Card,
	Divider,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import PhoneIcon from '@mui/icons-material/Phone'
import Grid from '@mui/material/Grid'
import AppButton from '../../components/common/Button/AppButton'
import PatientInfoCard from './components/PatientInfoCard'
import PastMedicalHistory from './components/PastMedicalHistory'
// import ShareWith from './components/ShareWith'
import VitalsTab from './components/VitalsTab'
import ConsultationNotes from './components/ConsultationNotes'
import { ConsultationPatient, ConsultationDoctor } from '../../types/consultation'
import { getPatientDetails, getMyPatientDetails } from '../../services/userService'
import { Patient } from '../../types/patient'
import { getAppointmentById } from '../../services/userService'
import { Appointment } from '../../types/appointment'
import { useAuth, LookupHospital } from '../../hooks/useAuth'
import { getDoctorProfile, mapDoctorProfileApi, getDoctorAvailability, getAvailabilityModeBlocks } from '../doctor/doctorService'
import { DoctorProfile } from '../../types/doctor-profile'
import RescheduleDrawer from '../doctor/search/components/RescheduleDrawer'
import FollowUpModal from './components/FollowUpModal'
import { SlotGroup } from '../../components/common/DateSlotPicker/DateSlotPicker'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import axios from 'axios'
import { toast } from 'react-toastify'
import { updateAppointmentsStatus } from '../../services/appointmentService'
import {
	getPrescriptionLink,
	getTreatmentByAppointment,
	saveFollowUpDate,
	submitConsultationNotes,
	type Treatment,
} from '../../services/treatmentService'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import { customCardStyle } from '../../styles/commonStyles'
import AppointmentDetailsDrawer from '../appointments/components/AppointmentDetailsDrawer'

interface PatientDetailsResponse {
	success: boolean
	message: string
	data: Patient
}

interface AppointmentDetailsResponse {
	success: boolean
	message: string
	data: Appointment
}

interface DoctorProfileResponse {
	success: boolean
	message: string
	data: unknown
}

const MOCK_DOCTOR: ConsultationDoctor = {
	name: 'Dr. Ashika Rao',
	degree: 'MBBS MD',
	specialization: 'Dentist Consultation',
	clinicName: 'Arogya Clinic',
	clinicAddress: '1 main, KR Market, Bengaluru - 580036',
}

const splitCsv = (value: string | string[]) =>
	(Array.isArray(value) ? value : value.split(',')).map((item) => item.trim()).filter(Boolean)

const formatDisplayValue = (
	value: string | number | null | undefined
): string => {
	if (value == null) return '';

	return String(value)
		.trim()
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatMetricValue = (
	value: string | number | null | undefined,
	unit: string
) => {
	if (value == null) return '';

	const stringValue = String(value).trim();
	if (!stringValue) return '';

	return /^-?\d+(\.\d+)?$/.test(stringValue)
		? `${Number(stringValue)} ${unit}`
		: stringValue;
};

const formatDateOfBirth = (dateOfBirth: string) => {
	if (!dateOfBirth) return ''

	const [year, month, day] = dateOfBirth.split('-').map(Number)
	const parsedDate = new Date(year, (month || 1) - 1, day || 1)

	return Number.isNaN(parsedDate.getTime())
		? dateOfBirth
		: parsedDate.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
		})
}

const getAge = (dateOfBirth: string) => {
	if (!dateOfBirth) return 0

	const [year, month, day] = dateOfBirth.split('-').map(Number)
	if (!year || !month || !day) return 0

	const today = new Date()
	let age = today.getFullYear() - year
	const hasBirthdayPassed =
		today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day)

	if (!hasBirthdayPassed) {
		age -= 1
	}

	return age
}

const mapPatientToConsultationPatient = (patient: Patient): ConsultationPatient => ({
	id: patient.id,
	patientId: patient.id,
	name: patient.personal.name,
	age: getAge(patient.personal.date_of_birth),
	gender: formatDisplayValue(patient.personal.gender),
	phone: patient.personal.contact_number,
	phoneVerified: patient.personal.contact_verified,
	email: patient.personal.email,
	avatar: patient.personal.avatar || '',
	dateOfBirth: formatDateOfBirth(patient.personal.date_of_birth),
	maritalStatus: formatDisplayValue(patient.personal.marital_status),
	weight: formatMetricValue(patient.personal.weight, 'kg'),
	height: formatMetricValue(patient.personal.height, 'cm'),
	bloodGroup: patient.personal.blood_group,
	address: patient.personal.location,
	occupation: '',
	emergencyContact: {
		name: patient.personal.emergency_contact.name,
		relation: '',
		number: patient.personal.emergency_contact.number,
	},
	chronicDiseases: splitCsv(patient.medical.chronic_conditions),
	allergies: splitCsv(patient.medical.allergies),
	smokingStatus: formatDisplayValue(patient.lifestyle.smoking_status),
	alcoholConsumption: formatDisplayValue(patient.lifestyle.alcohol_consumption),
	dietType: formatDisplayValue(patient.lifestyle.diet_type),
})

const mapAppointmentToConsultationDoctor = (
	appointment: Appointment | null
): ConsultationDoctor => ({
	name: appointment?.doctor?.name || MOCK_DOCTOR.name,
	degree: MOCK_DOCTOR.degree,
	specialization: MOCK_DOCTOR.specialization,
	clinicName: appointment?.hospital?.name || MOCK_DOCTOR.clinicName,
	clinicAddress: appointment?.hospital?.address || MOCK_DOCTOR.clinicAddress,
})

const mapDoctorProfileToConsultationDoctor = (
	doctorProfile: DoctorProfile | null,
	activeHospital: { label: string; address?: string } | null,
	appointment: Appointment | null
): ConsultationDoctor => {
	const primaryHospital = doctorProfile?.hospitals.find((hospital) => hospital.isPrimary) ?? doctorProfile?.hospitals[0]

	return {
		name: doctorProfile?.personal.name || appointment?.doctor?.name || MOCK_DOCTOR.name,
		degree: doctorProfile?.professional.degree || MOCK_DOCTOR.degree,
		specialization:
			doctorProfile?.professional.specialization_label || doctorProfile?.specialization || MOCK_DOCTOR.specialization,
		clinicName: activeHospital?.label || primaryHospital?.name || appointment?.hospital?.name || MOCK_DOCTOR.clinicName,
		clinicAddress:
			activeHospital?.address ||
			primaryHospital?.fullAddress ||
			appointment?.hospital?.address ||
			MOCK_DOCTOR.clinicAddress,
	}
}

// const getDrawerAppointmentType = (appointmentMode?: Appointment['appointment_mode']) =>
// 	appointmentMode === 'video_call' ? 'video' : 'clinic'
const getDrawerAppointmentType = (appointmentMode?: Appointment['appointment_mode']) =>
	appointmentMode === 'video call' ? 'video' : 'clinic'

export default function ConsultationPage() {
	const [activeTab, setActiveTab] = useState(0)
	const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false)
	const goBack = useGoBack()
	const { lookupData, role } = useAuth()

	const { patientId, appointmentId } = useParams()

	const [patient, setPatient] = useState<Patient | null>(null)
	const [appointment, setAppointment] = useState<Appointment | null>(null)
	const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [followUpOpen, setFollowUpOpen] = useState(false)
	const [followUpLoading, setFollowUpLoading] = useState(false)

	const [rescheduleOpen, setRescheduleOpen] = useState(false)
	const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date())
	const [rescheduleTime, setRescheduleTime] = useState('')
	const [rescheduleSlots, setRescheduleSlots] = useState<SlotGroup[]>([])
	const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false)
	const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
	const [rescheduleHospitalId, setRescheduleHospitalId] = useState<string>('')
	const [appointmentType, setAppointmentType] = useState<'clinic' | 'video'>('clinic')
	const [saveConsultationLoading, setSaveConsultationLoading] = useState(false)
	// The doctor's notes: the text as typed or dictated, the treatment once the notes are submitted (final), and the confirmation
	// asked before that.
	const [notesText, setNotesText] = useState('')
	const [submittedTreatment, setSubmittedTreatment] = useState<Treatment | null>(null)
	const [confirmNotesOpen, setConfirmNotesOpen] = useState(false)
	const [openingPrescription, setOpeningPrescription] = useState(false)
	// const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false)

	// Patient + appointment gate the loading screen — both tabs (Info & Timeline,
	// Vitals) depend on the header, which needs them regardless of which tab is active.
	useEffect(() => {
		if (!patientId || !appointmentId) {
			setLoading(false)
			return
		}

		let cancelled = false

		const fetchData = async () => {
			try {
				// GET /api/patients/{id}/details is doctor-only on the backend -- a patient
				// viewing their own consultation must instead hit /me/details, which
				// resolves from the auth token and needs no id.
				// const patientDetailsFetch =
				// 	role === 'patient'
				// 		? (getMyPatientDetails(patientId) as Promise<PatientDetailsResponse>)
				// 		: (getPatientDetails(patientId) as Promise<PatientDetailsResponse>)

				const [patientRes, appointmentRes] = await Promise.allSettled([
					(role === 'doctor'
						? getPatientDetails(patientId)
						: getMyPatientDetails(patientId)) as Promise<PatientDetailsResponse>,
					getAppointmentById(appointmentId) as Promise<AppointmentDetailsResponse>,
				])

				if (cancelled) return

				if (patientRes.status === 'fulfilled') {
					// /me/details (patient role) omits the 'id' field entirely since a
					// patient's own record never needs to echo its own id back; the route
					// param already carries it, so backfill it here for the child
					// components (PatientInfoCard, etc.) that expect Patient.id to be set.
					setPatient({ ...patientRes.value.data, id: patientRes.value.data.id || patientId })
				} else {
					console.error('Error fetching patient details', patientRes.reason)
					toast.error('Failed to load patient details. Please try again.')
				}

				if (appointmentRes.status === 'fulfilled') {
					setAppointment(appointmentRes.value.data)
				} else {
					console.error('Error fetching appointment details', appointmentRes.reason)
					toast.error('Failed to load appointment details. Please try again.')
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		fetchData()

		return () => {
			cancelled = true
		}
	}, [patientId, appointmentId, role])

	// Notes the doctor already submitted for this appointment (a reopened consultation): shown read-only, as they were submitted.
	useEffect(() => {
		if (!appointmentId || role !== 'doctor') return
		let cancelled = false
		getTreatmentByAppointment(appointmentId)
			.then((treatment) => {
				if (!cancelled && treatment?.notes_submitted_at) setSubmittedTreatment(treatment)
			})
			.catch((error) => console.error('Error fetching the consultation notes', error))
		return () => {
			cancelled = true
		}
	}, [appointmentId, role])

	// Doctor profile is only used by the Info tab's ConsultationNotes header and the
	// reschedule drawer's hospital list — fetch it in the background instead of
	// blocking the loading screen for tabs (e.g. Vitals) that don't need it.
	useEffect(() => {
		if (!patientId || !appointmentId || role !== 'doctor') return

		let cancelled = false

		const fetchDoctorProfile = async () => {
			try {
				const res = (await getDoctorProfile()) as DoctorProfileResponse
				if (cancelled) return

				if (res.success) {
					setDoctorProfile(mapDoctorProfileApi(res.data as Parameters<typeof mapDoctorProfileApi>[0]))
				}
			} catch (error) {
				if (!cancelled) console.error('Error fetching doctor profile', error)
			}
		}

		fetchDoctorProfile()

		return () => {
			cancelled = true
		}
	}, [patientId, appointmentId, role])

	useEffect(() => {
		if (!appointment) return

		setAppointmentType(getDrawerAppointmentType(appointment.appointment_mode))
		setRescheduleHospitalId(appointment.hospital?.id ?? '')
	}, [appointment])

	useEffect(() => {
		if (!rescheduleOpen || !appointment) return

		const doctorId = appointment.doctor?.id
		const hospitalId = rescheduleHospitalId || appointment.hospital?.id || doctorProfile?.hospitals[0]?.id

		if (!doctorId || !hospitalId) return

		const dateStr = rescheduleDate.toISOString().split('T')[0]
		let cancelled = false

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
				if (cancelled) return

				const selectedTypeMode = appointmentType === 'clinic' ? 'clinic_visit' : 'video_call'
				const selectedModeData = getAvailabilityModeBlocks(responseData).find(
					(item) => item.appointment_mode === selectedTypeMode
				)

				setRescheduleSlots(selectedModeData?.sessions || [])
			} catch {
				if (!cancelled) toast.error('Could not load available slots.')
			} finally {
				if (!cancelled) setRescheduleSlotsLoading(false)
			}
		}

		fetchSlots()

		return () => {
			cancelled = true
		}
	}, [appointment, appointmentType, doctorProfile, rescheduleDate, rescheduleHospitalId, rescheduleOpen])

	if (loading) {
		return (
			<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
				{/* Skeleton Header */}
				<Box
					sx={{
						bgcolor: 'background.paper',
						borderBottom: '1px solid',
						borderColor: 'divider',
						px: 3,
						py: 1.5,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<AppSkeleton variant="circular" width={32} height={32} />
						<AppSkeleton variant="circular" width={40} height={40} />
						<Box>
							<AppSkeleton variant="text" width={140} height={20} />
							<AppSkeleton variant="text" width={200} height={16} />
						</Box>
					</Box>
					<Box sx={{ display: 'flex', gap: 1.5 }}>
						<AppSkeleton variant="rounded" width={80} height={36} sx={{ borderRadius: '20px' }} />
						<AppSkeleton variant="rounded" width={120} height={36} sx={{ borderRadius: '20px' }} />
					</Box>
				</Box>

				{/* Skeleton Tabs */}
				<Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', px: 3, py: 1 }}>
					<Box sx={{ display: 'flex', gap: 3 }}>
						<AppSkeleton variant="text" width={60} height={28} />
						<AppSkeleton variant="text" width={60} height={28} />
						<AppSkeleton variant="text" width={80} height={28} />
					</Box>
				</Box>

				{/* Skeleton Content */}
				<Container maxWidth="lg" sx={{ py: 3 }}>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<Card sx={{ ...customCardStyle, p: 3, mb: 3 }}>
								<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
									<AppSkeleton variant="circular" width={60} height={60} />
									<Box>
										<AppSkeleton variant="text" width={160} height={22} />
										<AppSkeleton variant="text" width={120} height={16} />
									</Box>
								</Box>
								<Divider sx={{ my: 2 }} />
								<AppSkeleton variant="text" width="100%" height={18} />
								<AppSkeleton variant="text" width="80%" height={18} />
								<AppSkeleton variant="text" width="60%" height={18} />
							</Card>
							<Card sx={{ ...customCardStyle, p: 3 }}>
								<AppSkeleton variant="text" width={160} height={24} />
								<AppSkeleton sx={{ mt: 1 }} height={80} />
								<AppSkeleton sx={{ mt: 1 }} height={80} />
							</Card>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<Card sx={{ ...customCardStyle, p: 3, mb: 3 }}>
								<AppSkeleton variant="text" width={200} height={24} />
								<AppSkeleton sx={{ mt: 2 }} height={200} />
							</Card>
							<Card sx={{ ...customCardStyle, p: 3 }}>
								<AppSkeleton variant="text" width={140} height={24} />
								<AppSkeleton sx={{ mt: 1 }} height={60} />
							</Card>
						</Grid>
					</Grid>
				</Container>
			</Box>
		)
	}
	if (!patient) return <div>Unable to load patient details.</div>

	const consultationPatient = mapPatientToConsultationPatient(patient)
	const activeHospitalId = localStorage.getItem('active_hospital_id')
	const activeHospital =
		lookupData?.hospitals.find((hospital) => hospital.id === activeHospitalId) ?? lookupData?.hospitals[0] ?? null
	const consultationDoctor =
		doctorProfile != null
			? mapDoctorProfileToConsultationDoctor(doctorProfile, activeHospital, appointment)
			: mapAppointmentToConsultationDoctor(appointment)

	const rescheduleHospitalsMapped: LookupHospital[] = Array.from(
		new Map(
			[
				...(doctorProfile?.hospitals || []).map((hospital) => ({
					id: hospital.id,
					label: hospital.name,
					address: hospital.fullAddress || hospital.location || '',
				})),
				...(lookupData?.hospitals || []),
				...(appointment?.hospital
					? [
						{
							id: appointment.hospital.id,
							label: appointment.hospital.name,
							address: appointment.hospital.address,
						},
					]
					: []),
			].map((hospital) => [hospital.id, hospital] as const)
		).values()
	)

	const handleOpenReconnect = () => {
		if (!appointment) {
			toast.warning('Appointment details are not available yet.')
			return
		}
		setFollowUpOpen(true)
	}

	// The follow-up goes on the visit's treatment record (follow_up_date), the same call the mobile app makes.
	const handleSaveFollowUpRecommendation = async (dueDate: Date) => {
		if (!appointmentId) {
			toast.error('Missing appointment details.')
			return
		}
		setFollowUpLoading(true)
		try {
			await saveFollowUpDate(appointmentId, dueDate.toISOString().split('T')[0])
			toast.success('Follow-up recommendation saved successfully.')
			setFollowUpOpen(false)
		} catch (err) {
			// A refused request has already shown the server's reason (the shared API client toasts it).
			if (!axios.isAxiosError(err)) toast.error('Failed to save follow-up recommendation.')
		} finally {
			setFollowUpLoading(false)
		}
	}


	// Doctor-only: ends the consultation. Notes that were typed or dictated are submitted first: that is FINAL (the server draws them
	// onto the prescription image and locks them), so the doctor is asked once; then the appointment is marked Completed. With nothing
	// written it only completes the appointment. A retry after a failed completion does not send the notes again (they are locked).
	const hasNotesToSubmit = notesText.trim().length > 0 && !submittedTreatment

	const saveConsultation = async () => {
		if (!appointment) {
			toast.warning('Appointment details are not available yet.')
			return
		}
		// Found before the notes are sent, so notes are never locked and then a missing status stops the rest.
		const completedStatusId = lookupData?.appointment_statuses.find((s) => s.label === 'completed')?.id
		if (!completedStatusId) {
			toast.error('Could not resolve the completed status. Please try again later.')
			return
		}
		setSaveConsultationLoading(true)
		try {
			if (hasNotesToSubmit) {
				const treatment = await submitConsultationNotes(appointment.id, { notes: notesText })
				setSubmittedTreatment(treatment)
			}
			const res = await updateAppointmentsStatus(appointment.id, completedStatusId)
			if (res.success) {
				toast.success(res.message || 'Consultation saved.')
				setAppointment((prev) => (prev ? { ...prev, status: 'completed' } : prev))
			} else {
				toast.error(res.message || 'Failed to save consultation.')
			}
		} catch (error) {
			// A refused request has already shown the server's reason (the shared API client toasts it).
			if (!axios.isAxiosError(error)) toast.error('Something went wrong. Please try again.')
		} finally {
			setSaveConsultationLoading(false)
		}
	}

	const handleSaveConsultation = () => {
		if (!appointment) {
			toast.warning('Appointment details are not available yet.')
			return
		}
		if (hasNotesToSubmit) {
			setConfirmNotesOpen(true)
			return
		}
		void saveConsultation()
	}

	// The submitted prescription opens in a new tab through a fresh signed link (the links expire after about 5 minutes).
	const handleViewPrescription = async () => {
		if (!appointment) return
		setOpeningPrescription(true)
		try {
			const url = await getPrescriptionLink(appointment.id)
			if (url) window.open(url, '_blank', 'noopener,noreferrer')
			else toast.info('The prescription is not available yet.')
		} catch {
			toast.error('Could not open the prescription. Please try again.')
		} finally {
			setOpeningPrescription(false)
		}
	}

	const handleRescheduleConfirm = async () => {
		if (!appointment || !rescheduleTime) {
			toast.warning('Please select a time slot before confirming.')
			return
		}

		setRescheduleSubmitting(true)
		try {
			const dateStr = rescheduleDate.toISOString().split('T')[0]
			const res = await ApiService.post<{ success: boolean; message: string }>(API_ENDPOINTS.APPOINTMENTS.RESCHEDULE, {
				appointment_id: appointment.id,
				appointment_date: dateStr,
				start_time: rescheduleTime,
				end_time: null,
				hospital_id: rescheduleHospitalId || appointment.hospital?.id,
				reason: 'Doctor unavailable',
			})

			if (res.data?.success) {
				const selectedHospital = rescheduleHospitalsMapped.find(
					(hospital) => hospital.id === (rescheduleHospitalId || appointment.hospital?.id)
				)

				setAppointment((prev) =>
					prev
						? {
							...prev,
							appointment_date: dateStr,
							start_time: rescheduleTime,
							hospital: selectedHospital
								? {
									id: selectedHospital.id,
									name: selectedHospital.label,
									address: selectedHospital.address ?? '',
								}
								: prev.hospital,
						}
						: prev
				)
				toast.success(res.data.message || 'Appointment rescheduled!')
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

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			{/* Header */}
			<Box
				sx={{
					bgcolor: 'background.paper',
					borderBottom: '1px solid',
					borderColor: 'divider',
					px: 3,
					py: 1.5,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					position: 'sticky',
					top: 0,
					zIndex: 100,
				}}
			>
				{/* Left: back + patient info */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<IconButton
						size="small"
						onClick={() => goBack()}
						sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
					>
						<ArrowBackIosNewIcon sx={{ fontSize: 15 }} />
					</IconButton>

					<Avatar
						src={patient.personal.avatar || undefined}
						alt={patient.personal.name}
						sx={{ width: 40, height: 40, border: '2px solid', borderColor: 'primary.main' }}
					/>

					<Box>
						<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '14px' }}>
							{patient.personal.name}
						</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
								{consultationPatient.gender}
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>
								|
							</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
								<PhoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
								<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
									{patient.personal.contact_number}
								</Typography>
							</Box>
						</Box>
					</Box>
				</Box>

				{/* Right: Follow up button */}
				<Box sx={{ display: 'flex', gap: 1.5 }}>
					{role === 'doctor' && appointment && (() => {
						// Clicking it again afterward is still allowed (idempotent), not disabled.
						const isSaved = (appointment.status || '').toString().toLowerCase() === 'completed' && !hasNotesToSubmit
						return (
							<AppButton
								variant='contained'
								color='primary'
								label={isSaved ? 'Saved' : 'Save'}
								borderRadius='20px'
								loading={saveConsultationLoading}
								sx={{ px: 4 }}
								onClick={handleSaveConsultation}
							/>
						)
					})()}
					{role === 'doctor' && (
						<AppButton variant='contained' label=' Reconnect' borderRadius='20px' sx={{ px: 4 }} onClick={handleOpenReconnect} />
					)}
				</Box>
			</Box>

			{/* Tabs */}
			<Box
				sx={{
					borderBottom: '1px solid',
					borderColor: 'divider',
					bgcolor: 'background.paper',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<Tabs
					value={activeTab}
					onChange={(_, v) => {
						// Tab 2 (Timeline) opens a drawer overlay instead of switching content,
						// so keep the previous tab active to avoid blank space behind the drawer.
						if (v === 2) {
							setTimelineDrawerOpen(true)
							return
						}
						setActiveTab(v)
					}}
					sx={{
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 500,
							fontSize: '14px',
							color: 'text.secondary',
						},
						'& .Mui-selected': { color: 'primary.main', fontWeight: 700 },
						'& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3, borderRadius: '2px' },
					}}
				>
					<Tab label="Info" />
					<Tab label="Vitals" />
					<Tab label="Timeline" />
				</Tabs>
			</Box>

			{/* Tab content */}
			<Container maxWidth="lg" sx={{ py: 3 }}>
				{activeTab === 0 && (
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<PatientInfoCard patient={consultationPatient} />
							<PastMedicalHistory patientPublicId={patientId} />
						</Grid>
						<Grid size={{ xs: 12, md: 6 }} display={'flex'} flexDirection={'column'}>
							{/* Writing the notes (and so the prescription) is the doctor's: a patient never gets the editor. */}
							{role === 'doctor' && (
								<ConsultationNotes
									doctor={consultationDoctor}
									onTextChange={setNotesText}
									locked={!!submittedTreatment}
									submittedText={submittedTreatment?.notes ?? null}
								/>
							)}
							{submittedTreatment && (
								<Box sx={{ mt: 1.5 }}>
									<AppButton
										variant='outlined'
										label='View prescription'
										borderRadius='20px'
										loading={openingPrescription}
										onClick={handleViewPrescription}
									/>
								</Box>
							)}
							{/* <ShareWith appointmentId={appointmentId} /> */}
						</Grid>
					</Grid>
				)}
				{activeTab === 1 && patientId && <VitalsTab patientPublicId={patientId} />}
			</Container>
			<AppointmentDetailsDrawer
				open={timelineDrawerOpen}
				onClose={() => setTimelineDrawerOpen(false)}
				appointmentId={appointmentId ?? null}
			/>
			<RescheduleDrawer
				rescheduleOpen={rescheduleOpen}
				setRescheduleOpen={setRescheduleOpen}
				rescheduleAppt={appointment}
				rescheduleDate={rescheduleDate}
				setRescheduleDate={setRescheduleDate}
				rescheduleTime={rescheduleTime}
				setRescheduleTime={setRescheduleTime}
				rescheduleSlots={rescheduleSlots}
				rescheduleSlotsLoading={rescheduleSlotsLoading}
				rescheduleSubmitting={rescheduleSubmitting}
				handleRescheduleConfirm={handleRescheduleConfirm}
				rescheduleHospitals={rescheduleHospitalsMapped}
				rescheduleHospitalId={rescheduleHospitalId}
				setRescheduleHospitalId={setRescheduleHospitalId}
				appointmentType={appointmentType}
				setAppointmentType={setAppointmentType}
			/>
			<Dialog open={confirmNotesOpen} onClose={() => setConfirmNotesOpen(false)} maxWidth='xs' fullWidth>
				<DialogTitle sx={{ fontWeight: 700 }}>Submit your notes?</DialogTitle>
				<DialogContent>
					<Typography variant='body2' sx={{ color: 'text.secondary' }}>
						Once submitted, your notes can’t be edited. {patient?.personal?.name?.split(' ')[0] || 'The patient'} will be able to see
						them as a prescription.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<AppButton variant='outlined' label='Keep editing' borderRadius='20px' onClick={() => setConfirmNotesOpen(false)} />
					<AppButton
						variant='contained'
						label='Submit and save'
						borderRadius='20px'
						onClick={() => {
							setConfirmNotesOpen(false)
							void saveConsultation()
						}}
					/>
				</DialogActions>
			</Dialog>
			<FollowUpModal
				open={followUpOpen}
				onClose={() => setFollowUpOpen(false)}
				onSave={handleSaveFollowUpRecommendation}
				loading={followUpLoading}
				patientName={patient?.personal?.name}
			/>
		</Box>
	)
}





