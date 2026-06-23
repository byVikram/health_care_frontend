import { Box, Typography, Chip, Stack, Paper } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import VideocamIcon from '@mui/icons-material/Videocam'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { getAppointments, getDoctorAvailability, getDoctorById, getAvailabilityModeBlocks } from '../doctor/doctorService'
import { Appointment } from '../../types/appointment'
// import drImage from '../../assets/Services/doctors-service.png'
import RescheduleDrawer from '../doctor/search/components/RescheduleDrawer'
import { SlotGroup } from '../../components/common/DateSlotPicker/DateSlotPicker'
import { LookupHospital } from '../../hooks/useAuth'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { toast } from 'react-toastify'
import AppModal from '../../components/common/Modal/AppModal'
import AppButton from '../../components/common/Button/AppButton'
import AppInput from '../../components/common/Input/AppInput'
import { customScrollbar } from '../../styles/commonStyles'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'


const STATUS_STYLES: Record<string, { color: string; bgColor: string; text: string }> = {
	confirmed: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', text: 'Confirmed' },
	pending: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', text: 'Pending' },
	cancelled: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', text: 'Cancelled' },
	completed: { color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)', text: 'Completed' },
	rescheduled: { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', text: 'Rescheduled' },
}

const getStatusStyle = (status: string) =>
	STATUS_STYLES[status?.toLowerCase()] ?? { color: '#64748b', bgColor: '#f1f5f9', text: status }

const formatDate = (dateStr: string) => {
	const d = new Date(dateStr)
	return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' })
}

const formatTime = (timeStr: string) => {
	const [h, m] = timeStr.split(':').map(Number)
	const suffix = h >= 12 ? 'PM' : 'AM'
	const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
	return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`
}

export function PatientAppointments() {
	const navigate = useNavigate()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})

	const [cancelOpen, setCancelOpen] = useState(false)
	const [cancelAppt, setCancelAppt] = useState<Appointment | null>(null)
	const [cancelReason, setCancelReason] = useState('')
	const [cancelSubmitting, setCancelSubmitting] = useState(false)
	const [cancelledStatusId, setCancelledStatusId] = useState('')

	const [rescheduleOpen, setRescheduleOpen] = useState(false)
	const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null)
	const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date())
	const [rescheduleTime, setRescheduleTime] = useState('')
	const [rescheduleSlots, setRescheduleSlots] = useState<SlotGroup[]>([])
	const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false)
	const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
	const [rescheduleHospitals, setRescheduleHospitals] = useState<LookupHospital[]>([])
	const [rescheduleHospitalId, setRescheduleHospitalId] = useState<string>('')

	const [appointmentType, setAppointmentType] = useState<'clinic' | 'video'>('clinic')

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true)
				setError('')
				const [apptRes, statusRes] = await Promise.all([
					getAppointments({ limit: 10, variant: 'upcoming' }),
					ApiService.get<{ success: boolean; data: { id: string; label: string }[] }>(
						API_ENDPOINTS.APPOINTMENTS.STATUSES
					),
				])
				if (apptRes.success) {
					setAppointments(Array.isArray(apptRes.data) ? apptRes.data : [])
				} else {
					setError(apptRes.message ?? 'Failed to load appointments')
				}
				const cancelledStatus = statusRes.data?.data?.find((s) => s.label === 'cancelled')
				if (cancelledStatus) setCancelledStatusId(cancelledStatus.id)
			} catch {
				setError('Failed to load appointments')
			} finally {
				setLoading(false)
			}
		}

		fetchData()

		const onAccountSwitch = () => fetchData()
		window.addEventListener('auth-changed', onAccountSwitch)
		return () => window.removeEventListener('auth-changed', onAccountSwitch)
	}, [])

	useEffect(() => {
		if (!rescheduleAppt || !rescheduleOpen) return

		const fetchDoctorHospitals = async () => {
			if (rescheduleAppt.doctor?.id) {
				try {
					const res = await getDoctorById(rescheduleAppt.doctor.id)
					if (res.success && res.data) {
						setRescheduleHospitals(
							res.data.hospitals.map((h) => ({ id: h.hospital.id, label: h.hospital.name }))
						)
					}
				} catch {
					console.log('Failed to fetch doctor hospitals')
				}
			}
		}

		fetchDoctorHospitals()
	}, [rescheduleAppt, rescheduleOpen])

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
	}, [rescheduleDate, rescheduleOpen, rescheduleAppt, rescheduleHospitalId,appointmentType])

	const statusOf = (appt: Appointment) =>
		localStatuses[appt.id] ||
		(typeof appt.status === 'string' ? appt.status : ((appt.status as { label: string })?.label ?? 'pending'))

	const handleOpenReschedule = (appt: Appointment) => {
		setRescheduleAppt(appt)
		setRescheduleHospitalId(appt.hospital?.id ?? '')
		setRescheduleDate(new Date())
		setRescheduleTime('')
		setRescheduleSlots([])
		setRescheduleHospitals([])
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
					reason: 'Patient requested reschedule',
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

	const handleCancelAppointment = async () => {
		if (!cancelAppt || !cancelledStatusId) return

		setCancelSubmitting(true)

		try {
			const res = await ApiService.patch<{
				success: boolean
				message: string
			}>(API_ENDPOINTS.APPOINTMENTS.UPDATE, {
				appointment_id: cancelAppt.id,
				status_id: cancelledStatusId,
				reason: cancelReason,
			})

			if (res.data?.success) {
				toast.success('Appointment cancelled successfully')

				setAppointments((prev) => prev.filter((a) => a.id !== cancelAppt.id))

				setCancelOpen(false)
				setCancelReason('')
			} else {
				toast.error(res.data?.message || 'Failed to cancel appointment')
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setCancelSubmitting(false)
		}
	}

	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
			<Box sx={{ mb: 2, flexShrink: 0 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
					<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'text.primary' }}>
						Upcoming Appointments
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Chip
							label={appointments.length}
							size="small"
							sx={{
								bgcolor: '#0c7c7c',
								color: 'white',
								fontWeight: 600,
								fontSize: '12px',
								height: '24px',
							}}
						/>
						<Typography sx={{ fontSize: '12px', color: '#0c7c7c', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate(ROUTES.APPOINTMENTS + '?view=patient')}>See All</Typography>
					</Box>
				</Box>
				<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
					Manage your upcoming healthcare visits
				</Typography>
			</Box>

			<Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, ...customScrollbar }}>
				{loading && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						{[1, 2, 3].map((i) => (
							<AppSkeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: '16px' }} />
						))}
					</Box>
				)}
				{!loading && error && (
					<Typography sx={{ color: 'error.main', fontSize: '13px', textAlign: 'center', pt: 3 }}>
						{error}
					</Typography>
				)}
				{!loading && !error && appointments.length === 0 && (
					<Typography sx={{ color: 'text.secondary', fontSize: '13px', textAlign: 'center', pt: 3 }}>
						No upcoming appointments.
					</Typography>
				)}
				{!loading && !error && appointments.length > 0 && (
					<Stack spacing={1.5}>
						{appointments.map((appt) => {
							const status = statusOf(appt)
							const style = getStatusStyle(status)
							const isVirtual  = appt.appointment_mode === 'video call'
							const canJoin = isVirtual && status === 'confirmed'
							const canAct = status !== 'cancelled' && status !== 'completed'

							return (
								<Paper
									key={appt.id}
									elevation={0}
									sx={{
										borderRadius: '16px',
										bgcolor: '#ffffff',
										border: '1px solid',
										borderColor: status === 'cancelled' ? '#fee2e2' : '#f0f2f5',
										transition: 'all 0.2s ease',
										cursor: 'pointer',
										'&:hover': { borderColor: '#0c7c7c', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
									}}
								>
									{status !== 'cancelled' && (
										<Box
											sx={{
												height: '3px',
												bgcolor: style.color,
												borderTopLeftRadius: '16px',
												borderTopRightRadius: '16px',
											}}
										/>
									)}
									<Box sx={{ p: 1.5 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
											<Box
												sx={{
													width: 48,
													height: 48,
													borderRadius: '50%',
													overflow: 'hidden',


													flexShrink: 0,
												}}
											>
												<Box
													component="img"
													src={appt.doctor?.avatar_s3_key ?? ''}
													alt={appt.doctor?.name ?? ''}
													sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
												/>
											</Box>
											<Box sx={{ flex: 1 }}>
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'space-between',
														mb: 0.25,
													}}
												>
													<Typography
														sx={{
															fontWeight: 700,
															fontSize: '14px',
															color: 'text.primary',
														}}
													>
														{appt.doctor?.name ?? 'Unknown Doctor'}
													</Typography>
													<Chip
														label={style.text}
														size="small"
														sx={{
															bgcolor: style.bgColor,
															color: style.color,
															fontWeight: 600,
															fontSize: '10px',
															height: '22px',
															borderRadius: '8px',
														}}
													/>
												</Box>
												<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
													Consultation
												</Typography>
											</Box>
										</Box>

										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 1.5,
												mb: 1,
												flexWrap: 'wrap',
											}}
										>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
												<CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: '12px' }} />
												<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
													{formatDate(appt.appointment_date)}
												</Typography>
											</Box>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
												<AccessTimeIcon sx={{ color: 'text.secondary', fontSize: '12px' }} />
												<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
													{formatTime(appt.start_time)}
												</Typography>
											</Box>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
												{isVirtual ? (
													<VideocamIcon sx={{ color: 'text.secondary', fontSize: '12px' }} />
												) : (
													<LocationOnIcon
														sx={{ color: 'text.secondary', fontSize: '12px' }}
													/>
												)}
												<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
													{isVirtual ? 'Video Call' : 'Clinic Visit'}
												</Typography>
											</Box>
										</Box>

										{appt.hospital && (
											<Box sx={{ mb: 1.5, p: 0.75, bgcolor: '#f8fafc', borderRadius: '8px' }}>
												<Typography
													sx={{
														fontSize: '10px',
														color: 'text.secondary',
														display: 'flex',
														alignItems: 'center',
														gap: 0.5,
													}}
												>
													<LocationOnIcon sx={{ fontSize: '10px' }} />
													{appt.hospital.name} | {appt.hospital.address?.split(',')[0]}
												</Typography>
											</Box>
										)}

										{canAct && (
											<Box sx={{ display: 'flex', gap: 1 }}>
												{canJoin && (
													<Box
														component="button"
														type="button"
														sx={{
															flex: 1,
															background:
																'linear-gradient(135deg, #0f4c4c 0%, #0c7c7c 100%)',
															border: 'none',
															borderRadius: '10px',
															py: 0.75,
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															gap: 0.5,
															cursor: 'pointer',
															transition: 'all 0.2s ease',
															'&:hover': {
																transform: 'translateY(-1px)',
																boxShadow: '0 4px 8px rgba(12,124,124,0.2)',
															},
														}}
													>
														<VideocamIcon sx={{ fontSize: '12px', color: '#fff' }} />
														<Typography
															sx={{ fontWeight: 600, fontSize: '11px', color: '#fff' }}
														>
															Join
														</Typography>
													</Box>
												)}
												<Box
													component="button"
													type="button"
													onClick={() => handleOpenReschedule(appt)}
													sx={{
														flex: 1,
														bgcolor: '#fff',
														border: '1px solid #e2e8f0',
														borderRadius: '10px',
														py: 0.75,
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														cursor: 'pointer',
														transition: 'all 0.2s ease',
														'&:hover': { bgcolor: '#f8fafc', borderColor: '#0c7c7c' },
													}}
												>
													<Typography
														sx={{
															fontWeight: 500,
															fontSize: '11px',
															color: 'text.primary',
														}}
													>
														Reschedule
													</Typography>
												</Box>
												<Box
													component="button"
													type="button"
													onClick={() => {
														setCancelAppt(appt)
														setCancelOpen(true)
													}}
													sx={{
														flex: 1,
														bgcolor: '#fff',
														border: '1px solid #fee2e2',
														borderRadius: '10px',
														py: 0.75,
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														cursor: 'pointer',
														transition: 'all 0.2s ease',
														'&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
													}}
												>
													<Typography
														sx={{ fontWeight: 500, fontSize: '11px', color: '#ef4444' }}
													>
														Cancel
													</Typography>
												</Box>
											</Box>
										)}
									</Box>
								</Paper>
							)
						})}
					</Stack>
				)}
			</Box>

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
			<AppModal
				open={cancelOpen}
				onClose={() => setCancelOpen(false)}
				title="Reason for Cancelling the Appointment"
			>
				<AppInput
					label="Reason"
					value={cancelReason}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCancelReason(e.target.value)}
					multiline
					rows={3}
					fullWidth
				/>

				{/* Buttons */}
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
					<AppButton label="Skip for Now" variant="outlined" onClick={() => setCancelOpen(false)} />

					<AppButton
						label="Submit"
						loading={cancelSubmitting}
						onClick={handleCancelAppointment}
						disabled={!cancelReason.trim()}
					/>
				</Box>
			</AppModal>
		</Box>
	)
}
