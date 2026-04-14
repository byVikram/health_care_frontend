import { useState, useEffect } from 'react'
import { Box, Typography, TextField, InputAdornment, Divider, Chip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import HomeIcon from '@mui/icons-material/Home'
import { Appointment } from '../../types/appointment'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import ConfirmIcon from '../../assets/icons/confirm.svg'
import RejectIcon from '../../assets/icons/reject.svg'
import RescheduleIcon from '../../assets/icons/reschedule.svg'
import ReferIcon from '../../assets/icons/refer.svg'
import { updateAppointmentsStatus } from '../../features/dashboard/dashboardService'
import { toast } from 'react-toastify'
import RescheduleDrawer from '../doctor/search/components/RescheduleDrawer'
import { getDoctorAvailability } from './doctorService'
import { SlotGroup } from '../../components/common/DateSlotPicker/DateSlotPicker'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { useNavigate } from 'react-router-dom'

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
	// ── Appointment action state ──────────────────────────────────────────────
	const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})
	// const [debouncedQuery, setDebouncedQuery] = useState('')

	// ── Reschedule drawer state ───────────────────────────────────────────────
	const [rescheduleOpen, setRescheduleOpen] = useState(false)
	const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null)
	const [rescheduleDate, setRescheduleDate] = useState(new Date())
	const [rescheduleTime, setRescheduleTime] = useState('')
	const [rescheduleSlots, setRescheduleSlots] = useState<SlotGroup[]>([])
	const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false)
	const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)

	// ── Helpers ───────────────────────────────────────────────────────────────
	const getStatusLabel = (apt: Appointment): string => {
		if (localStatuses[apt.id]) return localStatuses[apt.id]
		return typeof apt.status === 'string' ? apt.status : (apt.status?.label ?? 'pending')
	}

	// ── Fetch slots whenever the reschedule date changes ─────────────────────
	useEffect(() => {
		if (!rescheduleOpen || !rescheduleAppt) return

		const doctorId = rescheduleAppt.doctor?.id
		const hospitalId = rescheduleAppt.hospital?.id

		if (!doctorId || !hospitalId) return

		const dateStr = rescheduleDate.toISOString().split('T')[0]

		const fetchSlots = async () => {
			setRescheduleSlotsLoading(true)
			setRescheduleSlots([])
			setRescheduleTime('')
			try {
				const data = await getDoctorAvailability({
					doctor_id: doctorId,
					hospital_id: hospitalId,
					date: dateStr,
				})
				if (Array.isArray(data)) {
					setRescheduleSlots(data as SlotGroup[])
				}
			} catch {
				toast.error('Could not load available slots.')
			} finally {
				setRescheduleSlotsLoading(false)
			}
		}

		fetchSlots()
	}, [rescheduleDate, rescheduleOpen, rescheduleAppt])

	// ── Submit reschedule ─────────────────────────────────────────────────────
	const handleRescheduleConfirm = async () => {
		if (!rescheduleAppt || !rescheduleTime) {
			toast.warning('Please select a time slot before confirming.')
			return
		}
		setRescheduleSubmitting(true)
		try {
			const dateStr = rescheduleDate.toISOString().split('T')[0]
			const res = await ApiService.patch<{ success: boolean; message: string }>(
				`${API_ENDPOINTS.APPOINTMENTS.UPDATE}`,
				{
					appointment_id: rescheduleAppt.id,
					appointment_date: dateStr,
					appointment_time: rescheduleTime,
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

	// ── Action button handler ─────────────────────────────────────────────────
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
				const res = await updateAppointmentsStatus(appointmentId, 'a7d4e1c2-9f6b-4c83-b2e1-6f3a9d8c7b12')
				if (res.success) {
					toast.success(res.message)
					setLocalStatuses((prev) => ({ ...prev, [appointmentId]: 'cancelled' }))
				}
			}
			if (action === 'reschedule') {
				const apt = appointments.find((a) => a.id === appointmentId) ?? null
				setRescheduleAppt(apt)
				setRescheduleDate(new Date())
				setRescheduleTime('')
				setRescheduleSlots([])
				setRescheduleOpen(true)
			}
			if (action === 'refer') {
				alert('Refer coming soon!')
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		}
	}

	// ── Search debounce ───────────────────────────────────────────────────────
	// useEffect(() => {
	// 	const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500)
	// 	return () => clearTimeout(timer)
	// }, [searchQuery])

	// useEffect(() => {
	// 	console.log('Search API call:', debouncedQuery)
	// }, [debouncedQuery])

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
			<Box>
				<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary', mb: 1.5 }}>
					Search Patient
				</Typography>
				<TextField
					fullWidth
					placeholder="Search Patient ID, Name..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					size="small"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
									<MicNoneOutlinedIcon sx={{ fontSize: 20, color: '#0c7c7c', cursor: 'pointer' }} />
									<Box sx={{ width: '1px', height: '18px', bgcolor: '#e0e0e0' }} />
									<QrCodeScannerIcon sx={{ fontSize: 20, color: '#0c7c7c', cursor: 'pointer' }} />
								</Box>
							</InputAdornment>
						),
					}}
					sx={{ '& fieldset': { borderRadius: '10px' } }}
				/>
			</Box>

			<Box sx={{ overflowY: 'auto', flex: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Typography sx={{ fontWeight: 700, fontSize: '17px', color: 'text.primary' }}>
						Today's Appointments
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
								cursor: 'pointer',
								transition: 'background 0.2s',
								'&:hover': { bgcolor: selectedDate === i ? '#0c7c7c' : 'rgba(12,124,124,0.08)' },
							}}
						>
							<Typography
								sx={{
									fontSize: '9px',
									color: selectedDate === i ? 'rgba(255,255,255,0.8)' : 'text.secondary',
								}}
							>
								{d.day}
							</Typography>
							<Typography
								sx={{
									fontSize: '14px',
									fontWeight: 700,
									color: selectedDate === i ? '#fff' : d.red ? '#e53935' : 'text.primary',
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
					{appointments.map((apt) => {
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
								sx={{
									p: 1.5,
									borderRadius: '12px',
									border: isCancelled ? '1px solid #f5c6c6' : '1px solid #e0e0e0',
									bgcolor: isCancelled ? '#fff5f5' : '#fff',
									display: 'flex',
									alignItems: 'center',
									gap: 1.5,
								}}
								onClick={() => navigate(`/consultation/${apt.patient?.id}/${apt.id}`)}
							>
								<Box
									sx={{
										width: 30,
										height: 30,
										borderRadius: '6px',
										bgcolor: isCancelled ? '#f5c6c6' : '#e8f5e9',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										flexShrink: 0,
									}}
								>
									<HomeIcon sx={{ fontSize: 17, color: isCancelled ? '#b0b0b0' : '#0c7c7c' }} />
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
												fontSize: '13px',
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
												bgcolor: isCancelled ? '#ffeeee' : isConfirmed ? '#e8f5e9' : '#fff8e8',
												color: isCancelled ? '#e53935' : isConfirmed ? '#4caf50' : '#f59e0b',
												fontWeight: 600,
											}}
										/>
									</Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
										<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
											{apt.appointment_mode ?? 'offline'}
										</Typography>
										<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>|</Typography>
										<AccessTimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
										<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
											{apt.appointment_time ?? '--'}
										</Typography>
									</Box>
								</Box>

								{isCancelled ? (
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 1,
											bgcolor: '#ffe0e0',
											borderRadius: '8px',
											px: 1.5,
											py: 0.8,
										}}
									>
										<CancelOutlinedIcon sx={{ fontSize: 16, color: '#e53935' }} />
										<Typography sx={{ fontSize: '10px', color: '#e53935', fontWeight: 600 }}>
											Patient has canceled the appointment
										</Typography>
									</Box>
								) : (
									<Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
										{visibleActions.map((action, i) => (
											<Box key={i}>
												<Box
													onClick={() => handleAction(action.action, apt.id)}
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
													<img src={action.icon} width={16} height={16} alt={action.label} />
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

			{/* ── Reschedule drawer ── */}
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
			/>
		</Box>
	)
}
