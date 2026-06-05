// import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import { useState, useEffect } from 'react'
import {
	Box,
	Typography,
	// InputAdornment,
	Divider,
	Chip,
	Popover,
	Dialog,
	DialogContent,
	Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import HomeIcon from '@mui/icons-material/Home'
import VideocamIcon from '@mui/icons-material/Videocam'
import { Appointment } from '../../types/appointment'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import ConfirmIcon from '../../assets/icons/confirm.svg'
import RejectIcon from '../../assets/icons/reject.svg'
import RescheduleIcon from '../../assets/icons/reschedule.svg'
import ReferIcon from '../../assets/icons/refer.svg'
import { updateAppointmentsStatus } from '../../features/dashboard/dashboardService'
import { toast } from 'react-toastify'
import RescheduleDrawer from '../doctor/search/components/RescheduleDrawer'
import DoctorFavouritesTab from './profile/components/DoctorFavouritesTab'
import { getDoctorAvailability, getAvailabilityModeBlocks } from './doctorService'
import { SlotGroup } from '../../components/common/DateSlotPicker/DateSlotPicker'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { useNavigate } from 'react-router-dom'
import { LookupHospital, useAuth } from '../../hooks/useAuth'
import AppButton from '../../components/common/Button/AppButton'
import AppInput from '../../components/common/Input/AppInput'
import OtpForm from '../auth/components/OtpForm'
import { customScrollbar } from '../../styles/commonStyles'
import completeProfileImg from '../../assets/Banner/complete-profile.png'
import { ROUTES } from '../../constants/routes'

const formatTime12h = (t?: string | null) => {
	if (!t) return '--'
	const [h, m] = t.split(':').map(Number)
	const suffix = h >= 12 ? 'PM' : 'AM'
	const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
	return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`
}

const isVideoMode = (mode?: string | null) => mode === 'video_call'

const allActionButtons = [
	{ icon: ConfirmIcon, label: 'Confirm', bg: '#e8f5e9', color: '#4caf50', action: 'confirm' },
	{ icon: RejectIcon, label: 'Reject', bg: '#ffeeee', color: '#e53935', action: 'reject' },
	{ icon: RescheduleIcon, label: 'Reschedule', bg: '#fff8e8', color: '#f59e0b', action: 'reschedule' },
	{ icon: ReferIcon, label: 'Refer', bg: '#e8f4f8', color: '#0c7c7c', action: 'refer' },
]

export function DoctorAppointments({
	selectedDate,
	setSelectedDate,
	appointments,
	apptLoading,
	apptError,
	weekDays,
	selectedDateObj,
	searchQuery,
	setSearchQuery,
}: {
	selectedDate: number
	setSelectedDate: (i: number) => void
	appointments: Appointment[]
	apptLoading: boolean
	apptError: string
	weekDays: { day: string; date: string; red: boolean; dateObj: Date }[]
	selectedDateObj: Date
	searchQuery: string
	setSearchQuery: (value: string) => void
}) {
	const navigate = useNavigate()
	const { lookupData } = useAuth()

	// ── New-registration profile-prompt overlay ──────────────────────────────
	const [showProfilePrompt, setShowProfilePrompt] = useState(
		() => localStorage.getItem('show_profile_prompt') === 'true'
	)

	const handleProfilePromptContinue = () => {
		localStorage.removeItem('show_profile_prompt')
		setShowProfilePrompt(false)
		navigate(ROUTES.PORTAL.PROFILE)
	}
	// ────────────────────────────────────────────────────────────────────────

	const [otpModalOpen, setOtpModalOpen] = useState(false)
	const [referModalOpen, setReferModalOpen] = useState(false)
	const [selectedAppointmentId, setSelectedAppointmentId] = useState('')
	const [selectedPatientId, setSelectedPatientId] = useState('')
	// Appointment action state
	const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})

	// Reject confirmation popover state
	const [rejectAnchorEl, setRejectAnchorEl] = useState<HTMLElement | null>(null)
	const [pendingRejectId, setPendingRejectId] = useState<string | null>(null)

	useEffect(() => {
		const shouldRefresh = sessionStorage.getItem('refreshAppointments')

		if (shouldRefresh === 'true') {
			sessionStorage.removeItem('refreshAppointments')
			window.location.reload()
		}
	}, [])

	// Reschedule drawer state
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

	// Helpers
	const getStatusLabel = (apt: Appointment): string => {
		if (localStatuses[apt.id]) return localStatuses[apt.id]
		return typeof apt.status === 'string' ? apt.status : (apt.status?.label ?? 'pending')
	}

	// Fetch slots whenever the reschedule date changes
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
				console.log('Slots API Response:', responseData)
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

	// Submit reschedule
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
					reason: 'Doctor unavailable',
				}
			)
			if (res.data?.success) {
				toast.success(res.data.message || 'Appointment rescheduled!')
				setLocalStatuses((prev) => ({ ...prev, [rescheduleAppt.id]: 'rescheduled' }))
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

	// Action button handler
	const handleAction = async (action: string, appointmentId: string, anchorEl?: HTMLElement | null) => {
		try {
			if (action === 'confirm') {
				const res = await updateAppointmentsStatus(appointmentId, '3f9a2c8e-7b61-4d2a-9a3f-5c8e1b2d4f90')
				if (res.success) {
					toast.success(res.message)
					setLocalStatuses((prev) => ({ ...prev, [appointmentId]: 'confirmed' }))
				}
			}
			if (action === 'reject') {
				setPendingRejectId(appointmentId)
				setRejectAnchorEl(anchorEl ?? null)
			}
			if (action === 'reschedule') {
				const apt = appointments.find((a) => a.id === appointmentId) ?? null
				setRescheduleAppt(apt)
				setRescheduleHospitalId(apt?.hospital?.id ?? '')
				setRescheduleDate(new Date())
				setRescheduleTime('')
				setRescheduleSlots([])
				setRescheduleHospitals(lookupData?.hospitals ?? [])
				setRescheduleOpen(true)
			}
			if (action === 'refer') {
				setReferModalOpen(true)
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		}
	}

	// Confirm reject after popover confirmation
	const handleConfirmReject = async () => {
		if (!pendingRejectId) return
		setRejectAnchorEl(null)
		try {
			const res = await updateAppointmentsStatus(pendingRejectId, 'a7d4e1c2-9f6b-4c83-b2e1-6f3a9d8c7b12')
			if (res.success) {
				toast.success(res.message)
				setLocalStatuses((prev) => ({ ...prev, [pendingRejectId]: 'cancelled' }))
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setPendingRejectId(null)
		}
	}

	const handleStartConsultation = async (appointmentId: string, patientId: string) => {
		try {
			const res = await ApiService.post<{ success: boolean }>(
				`${API_ENDPOINTS.APPOINTMENTS.GET_BY_ID(appointmentId)}/start-consultation`,
				{}
			)

			if (res.data.success) {
				setSelectedAppointmentId(appointmentId)
				setSelectedPatientId(patientId)
				setOtpModalOpen(true)
			}
		} catch {
			toast.error('Failed to generate OTP')
		}
	}

	const handleCancelReject = () => {
		setRejectAnchorEl(null)
		setPendingRejectId(null)
	}

	// Render
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
			{/* ── Complete-profile overlay (new registration only) ─────────────── */}
			{showProfilePrompt && (
				<Box
					sx={{
						position: 'fixed',
						inset: 0,
						zIndex: 1300,
						bgcolor: 'rgba(0,0,0,0.55)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{/* No card — content floats directly over the dim overlay */}
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							textAlign: 'center',
							maxWidth: 420,
							width: '90%',
						}}
					>
						<Box
							component="img"
							src={completeProfileImg}
							alt="Complete your profile"
							sx={{ width: 220, mb: 3, objectFit: 'contain' }}
						/>
						<Typography sx={{ fontWeight: 700, fontSize: '22px', color: '#fff', mb: 1 }}>
							Please complete your profile and proceed
						</Typography>
						<AppButton
							label="Continue"
							onClick={handleProfilePromptContinue}
							sx={{
								mt: 3,
								width: '100%',
								py: 1.6,
								fontSize: '16px',
								fontWeight: 600,
								borderRadius: '12px',
							}}
						/>
					</Box>
				</Box>
			)}
			{/* ────────────────────────────────────────────────────────────────── */}

			<Box>
				<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary', mb: 1.5 }}>
					Search Patient
				</Typography>
				<AppInput
					fullWidth
					placeholder="Search Patient ID, Name..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					enableVoiceSearch
					onVoiceResult={(text) => setSearchQuery(text)}
					startIcon={<SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />}
					endIcon={
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Box
								sx={{
									width: '1px',
									height: '18px',
									bgcolor: 'divider',
								}}
							/>
							<QrCodeScannerIcon
								sx={{
									fontSize: 20,
									color: 'text.disabled',
									cursor: 'pointer',
								}}
							/>
						</Box>
					}
				/>
			</Box>

			<Box sx={{ overflowY: 'auto', flex: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Typography sx={{ fontWeight: 700, fontSize: '17px', color: 'text.primary' }}>
						Today's Appointments
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<AppButton
							label="Today"
							variant="outlined"
							size="small"
							onClick={() => {
								const todayIndex = weekDays.findIndex(
									(d) => d.dateObj.toDateString() === new Date().toDateString()
								)
								if (todayIndex !== -1) {
									setSelectedDate(todayIndex)
								}
							}}
							sx={{
								borderRadius: '15px',
								border: '1px solid #0c7c7c',
								color: '#0c7c7c',
								textTransform: 'none',
								fontWeight: 500,
								px: 1.5,
								py: 0.6,
								minWidth: 'auto',
								'&:hover': {
									borderColor: '#0c7c7c',
									backgroundColor: '#eef1f1',
								},
							}}
						/>

						<Typography sx={{ fontSize: '13px', color: '#0c7c7c', fontWeight: 600 }}>
							{selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
						</Typography>

						<ChevronRightIcon sx={{ fontSize: 18, color: '#0c7c7c' }} />
					</Box>
				</Box>

				<Box sx={{ display: 'flex', gap: 0.8, mb: 2, alignItems: 'center' }}>
					<ChevronLeftIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }} />
					{weekDays.map((d, i) => (
						<Box
							key={i}
							onClick={() => setSelectedDate(i)}
							sx={{
								flex: 1,
								textAlign: 'center',
								py: 0.8,
								borderRadius: '10px',
								bgcolor: selectedDate === i ? '#0c7c7c' : 'transparent',
								border: selectedDate === i ? '' : '1px solid #33333366',
								cursor: 'pointer',
								maxWidth: '60px',
								transition: 'background 0.2s',
								'&:hover': { bgcolor: selectedDate === i ? '#0c7c7c' : 'rgba(12,124,124,0.08)' },
							}}
						>
							<Typography
								sx={{
									fontSize: '12px',
									color: selectedDate === i ? 'rgba(255,255,255,0.8)' : 'text.secondary',
								}}
							>
								{d.day}
							</Typography>
							<Typography
								sx={{
									fontSize: '14px',
									fontWeight: 700,
									color: selectedDate === i ? '#fff' : d.red ? '#e53935' : 'text.secondary',
								}}
							>
								{d.date}
							</Typography>
						</Box>
					))}
					<ChevronRightIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }} />
				</Box>

				<Divider sx={{ mb: 2 }} />

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{apptLoading && Array.from({ length: 5 }).map((_, i) => <AppSkeleton key={i} height={90} />)}
					{!apptLoading && apptError && (
						<Typography sx={{ color: 'error.main', fontSize: '13px' }}>{apptError}</Typography>
					)}
					{!apptLoading && !apptError && appointments.length === 0 && (
						<Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>
							No appointments for the selected date.
						</Typography>
					)}
					{appointments
						.filter((apt) => getStatusLabel(apt) !== 'cancelled')
						.map((apt) => {
							const statusLabel = getStatusLabel(apt)
							const isCancelled = statusLabel === 'cancelled'
							const isConfirmed = statusLabel === 'confirmed'
							const patientName = apt.patient?.name ?? 'Unknown Patient'

							const visibleActions = allActionButtons.filter(
								(btn) => !(btn.action === 'confirm' && isConfirmed)
							)

							return (
								<Box
									key={apt.id}
									onClick={() => {
										if (apt.patient?.id && apt.id) {
											handleStartConsultation(apt.id, apt.patient.id)
										}
									}}
									sx={{
										p: 1.5,
										borderRadius: '12px',
										opacity: isCancelled ? 0.5 : 1,
										bgcolor: '#fff',
										display: 'flex',
										alignItems: 'center',
										gap: 1.5,
									}}
								>
									<Box
										sx={{
											width: 30,
											height: 30,
											borderRadius: '6px',
											bgcolor: '#f5f5f5',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0,
										}}
									>
										{isVideoMode(apt.appointment_mode) ? (
											<VideocamIcon
												sx={{ fontSize: 17, color: isCancelled ? '#b0b0b0' : '#0c7c7c' }}
											/>
										) : (
											<HomeIcon
												sx={{ fontSize: 17, color: isCancelled ? '#b0b0b0' : '#0c7c7c' }}
											/>
										)}
									</Box>

									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 0.8,
												mb: 0.3,
												flexWrap: 'wrap',
											}}
										>
											<Typography
												sx={{
													fontWeight: 600,
													fontSize: '14px',
													color: isCancelled ? 'text.secondary' : 'text.primary',
												}}
											>
												{patientName}
											</Typography>
											<Chip
												label={statusLabel}
												size="small"
												sx={{
													fontSize: '9px',
													height: 16,
													bgcolor: isCancelled
														? '#ffeeee'
														: isConfirmed
															? '#e8f5e9'
															: '#fff8e8',
													color: isCancelled
														? '#e53935'
														: isConfirmed
															? '#4caf50'
															: '#f59e0b',
													fontWeight: 600,
												}}
											/>

											{/* Symptoms info tooltip */}
											{(() => {
												const info = apt.pre_intake || {}

												const hasSymptoms = !!(info.symptoms || info.duration || info.severity)

												const severityColors: Record<string, string> = {
													mild: '#4caf50',
													moderate: '#f59e0b',
													severe: '#e53935',
												}
												return (
													<Tooltip
														arrow
														placement="bottom-start"
														slotProps={{
															tooltip: {
																sx: { bgcolor: 'transparent', p: 0, boxShadow: 'none' },
															},
															arrow: { sx: { color: 'background.paper' } },
														}}
														title={
															<Box
																sx={{
																	bgcolor: 'background.paper',
																	borderRadius: '12px',
																	border: '1px solid',
																	borderColor: 'divider',
																	boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
																	p: 2,
																	minWidth: 220,
																	maxWidth: 280,
																}}
															>
																<Typography
																	fontSize={12}
																	fontWeight={700}
																	color="text.primary"
																	mb={1.2}
																>
																	Patient Symptoms
																</Typography>
																{hasSymptoms ? (
																	<>
																		{info.symptoms && (
																			<Box mb={0.8}>
																				<Typography
																					fontSize={10}
																					color="text.disabled"
																					fontWeight={600}
																					textTransform="uppercase"
																					letterSpacing={0.5}
																				>
																					Symptoms
																				</Typography>
																				<Typography
																					fontSize={12}
																					color="text.primary"
																					mt={0.3}
																				>
																					{info.symptoms}
																				</Typography>
																			</Box>
																		)}
																		{info.duration && (
																			<Box mb={0.8}>
																				<Typography
																					fontSize={10}
																					color="text.disabled"
																					fontWeight={600}
																					textTransform="uppercase"
																					letterSpacing={0.5}
																				>
																					Duration
																				</Typography>
																				<Typography
																					fontSize={12}
																					color="text.primary"
																					mt={0.3}
																				>
																					{info.duration}
																				</Typography>
																			</Box>
																		)}
																		{info.severity && (
																			<Box>
																				<Typography
																					fontSize={10}
																					color="text.disabled"
																					fontWeight={600}
																					textTransform="uppercase"
																					letterSpacing={0.5}
																				>
																					Severity
																				</Typography>
																				<Box
																					sx={{
																						display: 'inline-flex',
																						alignItems: 'center',
																						gap: 0.5,
																						mt: 0.4,
																						px: 1,
																						py: 0.3,
																						borderRadius: '20px',
																						bgcolor:
																							(severityColors[
																								info.severity
																							] ?? '#9e9e9e') + '22',
																						border: '1px solid',
																						borderColor:
																							severityColors[
																								info.severity
																							] ?? '#9e9e9e',
																					}}
																				>
																					<Box
																						sx={{
																							width: 6,
																							height: 6,
																							borderRadius: '50%',
																							bgcolor:
																								severityColors[
																									info.severity
																								] ?? '#9e9e9e',
																						}}
																					/>
																					<Typography
																						fontSize={11}
																						fontWeight={700}
																						color={
																							severityColors[
																								info.severity
																							] ?? '#9e9e9e'
																						}
																						textTransform="capitalize"
																					>
																						{info.severity}
																					</Typography>
																				</Box>
																			</Box>
																		)}
																	</>
																) : (
																	<Typography
																		fontSize={12}
																		color="text.secondary"
																		fontStyle="italic"
																	>
																		No symptoms entered by patient.
																	</Typography>
																)}
															</Box>
														}
													>
														<InfoOutlinedIcon
															onClick={(e) => e.stopPropagation()}
															sx={{
																fontSize: 14,
																color: hasSymptoms ? '#0c7c7c' : 'text.disabled',
																cursor: 'pointer',
																'&:hover': { color: 'primary.main' },
																verticalAlign: 'middle',
																ml: 0.3,
															}}
														/>
													</Tooltip>
												)
											})()}
										</Box>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
											<Typography variant="body2">
												{apt.patient?.age} years / {apt.patient?.gender}
											</Typography>
											<Typography variant="body2">|</Typography>
											<AccessTimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
											<Typography variant="body2">
												{formatTime12h(apt.start_time)} - {formatTime12h(apt.end_time)}
											</Typography>
										</Box>
									</Box>

									{isCancelled ? (
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 1,
												bgcolor: '#e8c7c7',
												borderRadius: '8px',
												px: 1.5,
												py: 0.8,
											}}
										>
											<CancelOutlinedIcon sx={{ fontSize: 16, color: '#e53935' }} />
											<Typography sx={{ fontSize: '10px', color: '#e53935', fontWeight: 600 }}>
												Doctor rejected the appointment
											</Typography>
										</Box>
									) : (
										<Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
											{visibleActions.map((action, i) => (
												<Box key={i}>
													<Box
														onClick={(e) => {
															e.stopPropagation()
															handleAction(
																action.action,
																apt.id,
																e.currentTarget as HTMLElement
															)
														}}
														sx={{
															display: 'flex',
															flexDirection: 'column',
															alignItems: 'center',
															gap: 0.4,
															cursor: 'pointer',
															bgcolor: action.bg,
															borderRadius: '8px',
															px: 1,
															py: 1,
															minWidth: 28,
															transition: 'opacity 0.2s',
															'&:hover': { opacity: 0.75 },
														}}
													>
														<img
															src={action.icon}
															width={16}
															height={16}
															alt={action.label}
														/>
													</Box>
													<Typography
														sx={{
															mt: 0.4,
															fontSize: '10px',
															fontWeight: 400,
															textAlign: 'center',
														}}
													>
														{action.label}
													</Typography>
												</Box>
											))}
										</Box>
									)}

									<ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
								</Box>
							)
						})}
				</Box>
			</Box>

			{/* Reject Confirmation Popover */}
			<Popover
				open={Boolean(rejectAnchorEl)}
				anchorEl={rejectAnchorEl}
				onClose={handleCancelReject}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				transformOrigin={{ vertical: 'top', horizontal: 'center' }}
				disableScrollLock
				sx={{ zIndex: 9999 }}
				slotProps={{
					paper: {
						sx: {
							borderRadius: '16px',
							px: 3,
							py: 3,
							maxWidth: 300,
							width: 280,
							textAlign: 'center',
							boxShadow: '0px 8px 40px rgba(0,0,0,0.18)',
							mt: 1,
							overflow: 'visible',
							'&::before': {
								content: '""',
								position: 'absolute',
								top: -8,
								left: '50%',
								transform: 'translateX(-50%)',
								width: 0,
								height: 0,
								borderLeft: '9px solid transparent',
								borderRight: '9px solid transparent',
								borderBottom: '9px solid #fff',
								filter: 'drop-shadow(0px -2px 2px rgba(0,0,0,0.06))',
							},
						},
					},
				}}
			>
				<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary', mb: 0.5 }}>
					Are you sure?
				</Typography>
				<Typography sx={{ fontSize: '14px', color: 'text.primary', fontWeight: 600, mb: 3 }}>
					You want to reject appointment
				</Typography>
				<Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
					<Box
						onClick={handleCancelReject}
						sx={{
							flex: 1,
							py: 1.2,
							border: '2px solid #0c7c7c',
							borderRadius: '50px',
							color: '#0c7c7c',
							fontWeight: 600,
							fontSize: '13px',
							cursor: 'pointer',
							textAlign: 'center',
							transition: 'background 0.2s',
							'&:hover': { bgcolor: 'rgba(12,124,124,0.06)' },
						}}
					>
						Cancel
					</Box>
					<Box
						onClick={handleConfirmReject}
						sx={{
							flex: 1,
							py: 1.2,
							bgcolor: '#e53935',
							borderRadius: '50px',
							color: '#fff',
							fontWeight: 600,
							fontSize: '13px',
							cursor: 'pointer',
							textAlign: 'center',
							transition: 'opacity 0.2s',
							'&:hover': { opacity: 0.88 },
						}}
					>
						Yes, Reject
					</Box>
				</Box>
			</Popover>

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
			/>

			{/* Refer Modal – renders DoctorFavouritesTab inside a centered Dialog */}
			<Dialog
				open={referModalOpen}
				onClose={() => setReferModalOpen(false)}
				maxWidth="sm"
				fullWidth
				slotProps={{
					paper: {
						sx: {
							borderRadius: '20px',
							boxShadow: '0px 16px 56px rgba(0,0,0,0.18)',
							overflow: 'hidden',
							maxHeight: '80vh',
						},
					},
				}}
			>
				<DialogContent
					sx={{
						p: 0,
						maxHeight: '70vh',
						overflowY: 'auto',
						...customScrollbar,
					}}
				>
					<DoctorFavouritesTab
						mode="refer"
						title="Refer a doctor"
						onShare={(doctor) => {
							toast.success(`Referred to ${doctor.name}`)
							setReferModalOpen(false)
						}}
					/>
				</DialogContent>
			</Dialog>

			<Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)} maxWidth="xs" fullWidth>
				<DialogContent sx={{ pt: 3 }}>
					<OtpForm
						contactNumber=""
						mode="modal"
						onVerify={() => {
							setOtpModalOpen(false)
							navigate(`/consultation/${selectedPatientId}/${selectedAppointmentId}`)
						}}
						onCustomVerify={async (otp: string) => {
							const res = await ApiService.post<{ success: boolean }>(
								`${API_ENDPOINTS.APPOINTMENTS.GET_BY_ID(selectedAppointmentId)}/verify-otp`,
								{ otp }
							)
							return res.data.success
						}}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	)
}
