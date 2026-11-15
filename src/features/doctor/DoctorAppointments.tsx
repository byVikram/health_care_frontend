// import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import { useState, useEffect, type ReactNode } from 'react'
import {
	Box,
	Typography,
	// InputAdornment,
	Divider,
	Chip,
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
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined'
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined'
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import HomeIcon from '@mui/icons-material/Home'
import VideocamIcon from '@mui/icons-material/Videocam'
import { Appointment } from '../../types/appointment'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import ConfirmIcon from '../../assets/icons/confirm.svg'
import RejectIcon from '../../assets/icons/reject.svg'
import RescheduleIcon from '../../assets/icons/reschedule.svg'
import {
	askPatientToReschedule,
	getAppointmentStatusId,
	setAppointmentCheckIn,
	updateAppointmentsStatus,
} from '../../services/appointmentService'
import axios from 'axios'
import { toast } from 'react-toastify'
import ReferralBadge from '../referrals/ReferralBadge'
import ReferralInfoCard from '../referrals/ReferralInfoCard'
import RejectAppointmentDialog from '../appointments/components/RejectAppointmentDialog'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { useNavigate } from 'react-router-dom'
import AppButton from '../../components/common/Button/AppButton'
import AppInput from '../../components/common/Input/AppInput'
import OtpForm from '../auth/components/OtpForm'
import completeProfileImg from '../../assets/Banner/complete-profile.png'
import { ROUTES } from '../../constants/routes'
import AppointmentActionDialog, { type ActionMode } from './components/AppointmentActionDialog'
import AppointmentActionMenu from './components/AppointmentActionMenu'
import AskPatientRescheduleDialog from './components/AskPatientRescheduleDialog'
import {
	ACCEPTED_STATUSES,
	NO_SHOW_SOURCE_STATUSES,
	RESCHEDULE_ASK_STATUSES,
	appointmentOpenAction,
	clinicTodayIso,
	dayLabel,
	humanizeStatus,
	noShowWindow,
	statusTone,
} from './appointmentRules'
import StatusReasonNote from '../appointments/components/StatusReasonNote'

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
]

const tooltipTriggerSx = {
	cursor: 'pointer',
}

// One quick action on an appointment card: an icon tile with its label under it.
type ActionTile = { key: string; label: string; bg: string; node: ReactNode; onClick: (tile: HTMLElement) => void; disabled?: boolean }

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
	const [selectedAppointmentId, setSelectedAppointmentId] = useState('')
	const [selectedPatientId, setSelectedPatientId] = useState('')
	// Appointment action state
	const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})

	// The "more" dialog (reschedule / no-show / cancel) of an accepted appointment, and the check-in call in flight
	const [actionAppt, setActionAppt] = useState<Appointment | null>(null)
	const [actionBusy, setActionBusy] = useState(false)
	// The menu hangs below the three dots (menuAnchor); each choice then opens its confirmation (dialogMode)
	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [dialogMode, setDialogMode] = useState<ActionMode>('cancel')
	const [checkInBusyIds, setCheckInBusyIds] = useState<Set<string>>(new Set())

	// Reject confirmation dialog state
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
	const [pendingRejectId, setPendingRejectId] = useState<string | null>(null)
	const [rejectSubmitting, setRejectSubmitting] = useState(false)

	useEffect(() => {
		const shouldRefresh = sessionStorage.getItem('refreshAppointments')

		if (shouldRefresh === 'true') {
			sessionStorage.removeItem('refreshAppointments')
			window.location.reload()
		}
	}, [])

	// The doctor's "ask the patient to reschedule" confirmation (the patient, not the doctor, picks the new time)
	const [askTarget, setAskTarget] = useState<Appointment | null>(null)
	const [askOpen, setAskOpen] = useState(false)
	const [askBusy, setAskBusy] = useState(false)

	// Helpers
	const getStatusLabel = (apt: Appointment): string => {
		// Local status override (set after an action is taken without a full page refresh)
		const localStatus = localStatuses[apt.id]
		const status = (localStatus ?? (typeof apt.status === 'string' ? apt.status : (apt.status?.label ?? 'pending'))).toLowerCase()
		const rescheduledBy = (apt.rescheduled_by ?? '').toLowerCase()

		if (rescheduledBy === 'doctor' && status === 'pending') {
			return 'Waiting for Patient Confirmation'
		}

		if (status === 'rescheduled') {
			// Prefer local tracking of who rescheduled; fall back to API field.
			if (rescheduledBy === 'doctor') return 'Waiting for Patient Confirmation'
			if (rescheduledBy === 'patient') return 'Waiting for Your Confirmation'
			return 'Rescheduled'
		}

		return localStatus ?? (typeof apt.status === 'string' ? apt.status : (apt.status?.label ?? 'pending'))
	}

	// Action button handler
	const handleAction = async (action: string, appointmentId: string) => {
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
				setRejectDialogOpen(true)
			}
			if (action === 'reschedule') {
				const target = appointments.find((a) => a.id === appointmentId) ?? null
				setAskTarget(target)
				setAskOpen(target !== null)
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		}
	}

	// Confirm reject after dialog confirmation
	const handleConfirmReject = async (reason: string) => {
		if (!pendingRejectId) return
		setRejectSubmitting(true)
		try {
			const res = await updateAppointmentsStatus(pendingRejectId, 'a7d4e1c2-9f6b-4c83-b2e1-6f3a9d8c7b12', reason)
			if (res.success) {
				toast.success(res.message)
				setLocalStatuses((prev) => ({ ...prev, [pendingRejectId]: 'cancelled' }))
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setRejectSubmitting(false)
			setRejectDialogOpen(false)
			setPendingRejectId(null)
		}
	}

	// A failed call has already shown the server's reason (the shared API client toasts it); anything else gets a generic message.
	const reportFailure = (err: unknown) => {
		if (!axios.isAxiosError(err)) toast.error('Something went wrong. Please try again.')
	}
	// An answer that is not an error but says it did not work: the doctor is told, never left looking at a button that did nothing.
	const reportRefusal = (message?: string) => toast.error(message || 'That did not go through. Please try again.')

	const handleCheckIn = async (apt: Appointment, checkedIn: boolean) => {
		const markBusy = (busy: boolean) =>
			setCheckInBusyIds((ids) => {
				const next = new Set(ids)
				if (busy) next.add(apt.id)
				else next.delete(apt.id)
				return next
			})
		markBusy(true)
		try {
			const res = await setAppointmentCheckIn(apt.id, checkedIn)
			if (res.success) {
				toast.success(res.message)
				setLocalStatuses((prev) => ({ ...prev, [apt.id]: checkedIn ? 'checked_in' : 'not_arrived' }))
			} else reportRefusal(res.message)
		} catch (err) {
			reportFailure(err)
		} finally {
			markBusy(false)
		}
	}

	// Cancel or no-show from the "more" dialog: both are a status change; the cancel carries the doctor's reason.
	const handleStatusFromDialog = async (label: 'cancelled' | 'no_show', reason?: string) => {
		if (!actionAppt) return
		const id = actionAppt.id
		setActionBusy(true)
		try {
			const res = await updateAppointmentsStatus(id, await getAppointmentStatusId(label), reason)
			if (res.success) {
				toast.success(res.message)
				setLocalStatuses((prev) => ({ ...prev, [id]: label }))
				setDialogOpen(false)
			} else reportRefusal(res.message)
		} catch (err) {
			reportFailure(err)
		} finally {
			setActionBusy(false)
		}
	}

	// The doctor does not pick a slot: the patient is asked to choose a new time (status becomes reschedule_required and the patient
	// is emailed); the doctor confirms the time they pick later, as for any patient reschedule.
	const handleAskReschedule = async (reason: string) => {
		if (!askTarget) return
		const id = askTarget.id
		setAskBusy(true)
		try {
			const res = await askPatientToReschedule(id, reason)
			if (res.success) {
				toast.success(res.message || 'The patient has been asked to choose a new time')
				setLocalStatuses((prev) => ({ ...prev, [id]: 'reschedule_required' }))
				setAskOpen(false)
			} else reportRefusal(res.message)
		} catch (err) {
			reportFailure(err)
		} finally {
			setAskBusy(false)
		}
	}

	const goToConsultation = (appointmentId: string, patientId: string) =>
		navigate(`/consultation/${patientId}/${appointmentId}`)

	const handleStartConsultation = async (appointmentId: string, patientId: string) => {
		try {
			const res = await ApiService.post<{ success: boolean; data?: { already_verified?: boolean } }>(
				`${API_ENDPOINTS.APPOINTMENTS.GET_BY_ID(appointmentId)}/start-consultation`,
				{}
			)

			if (!res.data.success) return
			if (res.data.data?.already_verified) {
				// The patient already gave the code for this appointment: no second code, straight in.
				goToConsultation(appointmentId, patientId)
				return
			}
			setSelectedAppointmentId(appointmentId)
			setSelectedPatientId(patientId)
			setOtpModalOpen(true)
		} catch {
			toast.error('Failed to generate OTP')
		}
	}

	// What a click on a card does is decided in one place (appointmentOpenAction): a finished or accepted appointment opens the
	// consultation (starting it, which sends the patient the code, unless the code was already given), anything else says why not.
	const openActionOf = (apt: Appointment) =>
		appointmentOpenAction(getStatusLabel(apt), apt.access_verified === true, apt.appointment_date === clinicTodayIso())
	const openAppointment = (apt: Appointment) => {
		const patientId = apt.patient?.id
		if (!patientId || !apt.id) return
		const action = openActionOf(apt)
		if (action.kind === 'consultation') goToConsultation(apt.id, patientId)
		else if (action.kind === 'start') handleStartConsultation(apt.id, patientId)
		else toast.warning(action.message)
	}

	const handleCancelReject = () => {
		setRejectDialogOpen(false)
		setPendingRejectId(null)
	}

	// What the "more" dialog is told: the slot, and whether a no-show can be marked now (and why not)
	const actionStatus = actionAppt ? getStatusLabel(actionAppt).toLowerCase() : ''
	const actionWindow = actionAppt ? noShowWindow(actionAppt) : { canMark: false, hint: '' }
	const noShowStatusOk = NO_SHOW_SOURCE_STATUSES.includes(actionStatus)
	const noShowAllowed = noShowStatusOk && actionWindow.canMark
	const noShowHint = noShowStatusOk ? actionWindow.hint : 'A checked-in patient came, so this is not a no-show'
	const slotLabelOf = (apt: Appointment | null) =>
		apt
			? `${dayLabel(apt.appointment_date)}, ${formatTime12h(apt.start_time)} · ${isVideoMode(apt.appointment_mode) ? 'Video call' : 'In-clinic'}`
			: ''
	const actionSlotLabel = slotLabelOf(actionAppt)
	const askSlotLabel = slotLabelOf(askTarget)

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
						// A cancelled appointment stays listed (muted, no actions) while it carries a reason, so the doctor sees why a slot freed up;
						// one the doctor has just cancelled here (a local override) leaves the list at once, as before.
						.filter((apt) => getStatusLabel(apt) !== 'cancelled' || (!!apt.status_reason && !localStatuses[apt.id]))
						.map((apt) => {
							const statusLabel = getStatusLabel(apt)
							const isCancelled = statusLabel === 'cancelled'
							const isConfirmed = statusLabel === 'confirmed'
							// What a click opens: see appointmentOpenAction
							const canOpen = openActionOf(apt).kind !== 'blocked'
							// True when the doctor is the reschedule initiator — Confirm must be hidden
							// because the doctor should never confirm their own reschedule.
							const rescheduledByDoctor =
								statusLabel.toLowerCase().includes('waiting for patient') ||
								(statusLabel === 'rescheduled' &&
									(apt.rescheduled_by ?? '').toLowerCase() === 'doctor')
							const patientName = apt.patient?.name ?? 'Unknown Patient'

							const visibleActions = allActionButtons.filter(
								(btn) =>
									// Hide Confirm when already confirmed
									!(btn.action === 'confirm' && isConfirmed) &&
									// Hide Confirm when doctor rescheduled — patient must confirm, not doctor
									!(btn.action === 'confirm' && rescheduledByDoctor) &&
									// The server refuses to ask the patient to reschedule once the patient has already asked for a new time
									!(btn.action === 'reschedule' && !RESCHEDULE_ASK_STATUSES.includes(statusLabel.toLowerCase()))
							)

							const status = statusLabel.toLowerCase()
							const isToday = apt.appointment_date === clinicTodayIso()
							const checkInBusy = checkInBusyIds.has(apt.id)
							const requestTiles: ActionTile[] = visibleActions.map((a) => ({
								key: a.action,
								label: a.label,
								bg: a.bg,
								node: <img src={a.icon} width={16} height={16} alt={a.label} />,
								onClick: () => handleAction(a.action, apt.id),
							}))
							const checkInTile: ActionTile = {
								key: 'check-in',
								label: 'Check in',
								bg: '#e8f5e9',
								node: <HowToRegOutlinedIcon sx={{ fontSize: 17, color: '#4caf50' }} />,
								onClick: () => handleCheckIn(apt, true),
								disabled: checkInBusy,
							}
							const undoCheckInTile: ActionTile = {
								key: 'undo-check-in',
								label: 'Undo check-in',
								bg: '#fff8e8',
								node: <UndoOutlinedIcon sx={{ fontSize: 17, color: '#f59e0b' }} />,
								onClick: () => handleCheckIn(apt, false),
								disabled: checkInBusy,
							}
							const moreTile: ActionTile = {
								key: 'more',
								label: 'More',
								bg: '#f1f5f6',
								node: <MoreHorizOutlinedIcon sx={{ fontSize: 17, color: '#5a6e7a' }} />,
								onClick: (anchor) => {
									// The menu hangs from the whole tile (icon and label); a second click on it closes the menu.
									setActionAppt(apt)
									setMenuAnchor((open) => (open === anchor ? null : anchor))
								},
							}
							// A finished visit, or one waiting for the patient to pick a new time, has nothing to do; a no-show the patient came late for (same day) can still be checked in; an accepted
							// appointment is checked in on its day, with the rest (reschedule, no-show, cancel) under More; a request keeps its own actions.
							let tiles: ActionTile[]
							if (status === 'completed' || status === 'reschedule_required') tiles = []
							else if (status === 'no_show') tiles = isToday ? [checkInTile] : []
							else if (ACCEPTED_STATUSES.includes(status))
								tiles = [...(status === 'checked_in' ? [undoCheckInTile] : isToday ? [checkInTile] : []), moreTile]
							else tiles = requestTiles

							return (
								<Box
									key={apt.id}
									onClick={() => {
										// With the menu open, a click elsewhere on the card is the menu's click-away, not a request to open the consultation.
										if (menuAnchor) return
										openAppointment(apt)
									}}
									sx={{
										cursor: canOpen ? 'pointer' : 'default',
										p: 1.5,
										borderRadius: '12px',
										opacity: isCancelled ? 0.75 : 1,
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
											<Box
												sx={{
													display: 'inline-flex',
													alignItems: 'center',
													gap: 0.6,
													flexShrink: 0,
												}}
											>
												{/* Referral badge with hover tooltip showing referral details */}
												{apt.referral && (
													<Tooltip
														arrow
														placement="bottom-start"
														slotProps={{
															tooltip: {
																sx: { bgcolor: 'transparent', p: 0, boxShadow: 'none' },
															},
															arrow: { sx: { color: 'background.paper' } },
														}}
														title={<ReferralInfoCard referral={apt.referral} />}
													>
														<Box
															component="span"
															onClick={(e) => e.stopPropagation()}
															sx={{ display: 'inline-flex', alignItems: 'center', ...tooltipTriggerSx }}
														>
															<ReferralBadge />
														</Box>
													</Tooltip>
												)}
												<Chip
													label={humanizeStatus(statusLabel)}
													size="small"
													sx={{
														fontSize: '9px',
														height: 16,
														...statusTone(statusLabel, rescheduledByDoctor),
														fontWeight: 600,
													}}
												/>
											</Box>

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
																...tooltipTriggerSx,
																'&:hover': { color: 'primary.main' },
																verticalAlign: 'middle',
																ml: 0.3,
															}}
														/>
													</Tooltip>
												)
											})()}

											{/* Why it was cancelled / moved: on its own line UNDER the name, status chip and info icon */}
											<Box sx={{ flexBasis: '100%' }}>
												<StatusReasonNote
													status={typeof apt.status === 'string' ? apt.status : (apt.status?.label ?? '')}
													title={localStatuses[apt.id] ? null : apt.status_reason_title} // a local override: the API's reason is for the old state
													reason={apt.status_reason}
													compact
												/>
											</Box>
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
												Cancelled
											</Typography>
										</Box>
									) : (
										<Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
											{tiles.map((tile) => {
												const press = (target: HTMLElement) => {
													// stopPropagation keeps the click from opening the consultation, but it also hides it from the open menu's click-away:
													// close the menu here, unless this is the menu's own button.
													if (tile.key !== 'more') setMenuAnchor(null)
													tile.onClick(target)
												}
												return (
													<Box
														key={tile.key}
														role="button"
														tabIndex={tile.disabled ? -1 : 0}
														aria-label={tile.label}
														aria-disabled={tile.disabled || undefined}
														aria-haspopup={tile.key === 'more' ? 'menu' : undefined}
														aria-expanded={tile.key === 'more' ? menuAnchor !== null && actionAppt?.id === apt.id : undefined}
														onClick={(e) => {
															e.stopPropagation()
															if (!tile.disabled) press(e.currentTarget)
														}}
														onKeyDown={(e) => {
															if (e.key !== 'Enter' && e.key !== ' ') return
															e.preventDefault()
															e.stopPropagation()
															if (!tile.disabled) press(e.currentTarget)
														}}
														sx={{
															opacity: tile.disabled ? 0.5 : 1,
															cursor: tile.disabled ? 'default' : 'pointer',
															'&:hover .tile-icon': { opacity: tile.disabled ? 1 : 0.75 },
															'&:focus-visible': { outline: '2px solid #0c7c7c', outlineOffset: 2, borderRadius: '8px' },
														}}
													>
														<Box
															className="tile-icon"
															sx={{
																display: 'flex',
																flexDirection: 'column',
																alignItems: 'center',
																gap: 0.4,
																bgcolor: tile.bg,
																borderRadius: '8px',
																px: 1,
																py: 1,
																minWidth: 28,
																transition: 'opacity 0.2s',
															}}
														>
															{tile.node}
														</Box>
														<Typography sx={{ mt: 0.4, fontSize: '10px', fontWeight: 400, textAlign: 'center' }}>{tile.label}</Typography>
													</Box>
												)
											})}
										</Box>
									)}

									<ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
								</Box>
							)
						})}
				</Box>
			</Box>

			{/* Reject Confirmation Dialog */}
			<RejectAppointmentDialog
				open={rejectDialogOpen}
				onCancel={handleCancelReject}
				onConfirm={handleConfirmReject}
				submitting={rejectSubmitting}
			/>

			{/* Reschedule: ask the patient to choose a new time */}
			<AskPatientRescheduleDialog
				open={askOpen}
				patientName={askTarget?.patient?.name ?? 'Unknown Patient'}
				slotLabel={askSlotLabel}
				busy={askBusy}
				onClose={() => setAskOpen(false)}
				onConfirm={handleAskReschedule}
			/>

			{/* More: the menu hangs below the three dots; each choice then opens its own confirmation */}
			<AppointmentActionMenu
				anchorEl={menuAnchor}
				onClose={() => setMenuAnchor(null)}
				rescheduleCanAsk={actionStatus !== 'checked_in'}
				noShowCanMark={noShowAllowed}
				noShowHint={noShowHint}
				onReschedule={() => {
					setMenuAnchor(null)
					setAskTarget(actionAppt)
					setAskOpen(actionAppt !== null)
				}}
				onNoShow={() => {
					setMenuAnchor(null)
					setDialogMode('no_show')
					setDialogOpen(true)
				}}
				onCancel={() => {
					setMenuAnchor(null)
					setDialogMode('cancel')
					setDialogOpen(true)
				}}
			/>
			<AppointmentActionDialog
				open={dialogOpen}
				mode={dialogMode}
				patientName={actionAppt?.patient?.name ?? 'Unknown Patient'}
				slotLabel={actionSlotLabel}
				noShowCanMark={noShowAllowed}
				noShowHint={noShowHint}
				busy={actionBusy}
				onClose={() => setDialogOpen(false)}
				onConfirmCancel={(reason) => handleStatusFromDialog('cancelled', reason)}
				onConfirmNoShow={() => handleStatusFromDialog('no_show')}
			/>


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
