// src/features/appointments/AppointmentConfirmedPage.tsx
//
// Shown after a booking and its symptoms card (PaymentPage). The route state carries only the appointment id and how the patient chose
// to pay (the server keeps no payment method yet); everything else is read from the appointment itself (GET /api/appointments/{id}),
// the same call the appointment details page makes. The "Before your visit" tips are the app's own copy, as in the mobile app: the
// server has no endpoint for them.
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Box, Chip, Container, Divider, Typography } from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { toast } from 'react-toastify'
import AppButton from '../../components/common/Button/AppButton'
import SectionCard from '../../components/common/Card/SectionCard'
import AppLoader from '../../components/common/Loader/AppLoader'
import { ROUTES } from '../../constants/routes'
import { getAppointmentById } from '../../services/appointmentService'
import type { Appointment } from '../../types/appointment'
import { buildS3Url } from '../../utils/s3'
import { formatINR } from '../../utils/Utils'

interface ConfirmedState {
	appointmentId: string
	/** 'later' = the patient chose to pay at the clinic */
	paymentChoice?: 'now' | 'later'
	/** What the patient picked on the payment page: 'Pay at clinic', 'Phone Pe', ... */
	paymentMethodLabel?: string
}

const CLINIC_STEPS = [
	{ title: 'Bring your reports', body: 'Recent lab results and a list of your medicines.' },
	{ title: 'Arrive 10 minutes early', body: 'Show your booking ID at the front desk to check in.' },
	{
		title: 'Prescription in the app',
		body: "We'll add the doctor's notes and prescription to your records after the visit.",
	},
]

const VIDEO_STEPS = [
	{ title: 'Find a quiet, well-lit spot', body: 'The doctor needs to see and hear you clearly.' },
	{ title: 'Keep reports and medicines handy', body: 'You can share photos of reports during the call.' },
	{ title: 'Check your internet', body: 'Wi-Fi or strong mobile data works best.' },
]

/** '2026-09-24' as a local date (new Date('2026-09-24') would be read as UTC and can land on the day before). */
const parseDate = (value: string): Date | null => {
	const [y, m, d] = value.slice(0, 10).split('-').map(Number)
	if (!y || !m || !d) return null
	return new Date(y, m - 1, d)
}

const formatDay = (value: string): string => {
	const date = parseDate(value)
	return date ? date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : value
}

/** "today" / "tomorrow" / "on Thu, 24 Sep" for the "See you ..." line. */
const relativeDayPhrase = (value: string): string => {
	const date = parseDate(value)
	if (!date) return value ? `on ${value}` : ''
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const days = Math.round((date.getTime() - today.getTime()) / 86_400_000)
	if (days === 0) return 'today'
	if (days === 1) return 'tomorrow'
	return `on ${formatDay(value)}`
}

/** '17:30:00' -> '5:30 PM' */
const formatTime = (value: string): string => {
	const [h, m] = value.split(':').map(Number)
	if (Number.isNaN(h) || Number.isNaN(m)) return value
	return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const statusLabel = (appt: Appointment): string =>
	typeof appt.status === 'string' ? appt.status : (appt.status as { label: string }).label

/** Shortens a long booking id in the middle: 01f0c167-ce13-…-edc530162f1e */
const shortenId = (id: string) => (id.length > 18 ? `${id.slice(0, 13)}…${id.slice(-6)}` : id)

const capitalise = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export default function AppointmentConfirmedPage() {
	const location = useLocation()
	const navigate = useNavigate()
	const state = (location.state as ConfirmedState | null) ?? null
	const appointmentId = state?.appointmentId ?? ''

	const [appt, setAppt] = useState<Appointment | null>(null)
	const [loading, setLoading] = useState(Boolean(appointmentId))
	const [error, setError] = useState(false)

	// A refresh keeps the router state, but a pasted link has none: there is nothing to show, so go to the patient's appointments.
	useEffect(() => {
		if (!appointmentId) navigate(`${ROUTES.APPOINTMENTS}?view=patient`, { replace: true })
	}, [appointmentId, navigate])

	useEffect(() => {
		if (!appointmentId) return
		let cancelled = false
		getAppointmentById(appointmentId)
			.then((data) => {
				if (!cancelled) setAppt(data)
			})
			.catch(() => {
				if (!cancelled) setError(true)
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [appointmentId])

	if (!appointmentId) return null

	const goToAppointment = () => navigate(ROUTES.PORTAL.APPOINTMENT_DETAIL.replace(':appointmentId', appointmentId))

	if (loading) {
		return <AppLoader message="Loading your appointment" />
	}

	// The booking itself succeeded: if its details cannot be read, still let the patient open it.
	if (error || !appt) {
		return (
			<Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
				<Typography fontWeight={700} fontSize={22} mb={1}>
					You&apos;re all booked
				</Typography>
				<Typography color="text.secondary" mb={3}>
					We could not load the details just now. Your appointment is saved.
				</Typography>
				<Box sx={{ display: 'flex', gap: 1.5 }}>
					<AppButton label="View appointment" fullWidth borderRadius="10px" onClick={goToAppointment} />
				</Box>
			</Container>
		)
	}

	const isVideo = String(appt.appointment_mode).replace(' ', '_') === 'video_call'
	const payAtClinic = state?.paymentChoice === 'later'
	const status = statusLabel(appt)
	const confirmed = status.toLowerCase() === 'confirmed'
	const steps = isVideo ? VIDEO_STEPS : CLINIC_STEPS
	const doctorName = appt.doctor?.name ?? ''
	const specialty = appt.doctor?.speciality ?? appt.doctor?.specialty ?? appt.doctor?.specialization ?? ''
	const place = appt.hospital?.name ?? ''
	const time = formatTime(appt.start_time)
	const sentence = [
		'See you',
		relativeDayPhrase(appt.appointment_date),
		time ? `at ${time}` : '',
		isVideo ? 'for your video call' : place ? `at ${place}` : '',
	]
		.filter(Boolean)
		.join(' ')

	const fields: { label: string; value: string; sub?: string }[] = [
		{ label: 'When', value: time, sub: formatDay(appt.appointment_date) },
		{
			label: 'Booking ID',
			value: shortenId(appt.booking_id ?? appt.id),
			sub: appt.patient?.name ? `For ${appt.patient.name}` : undefined,
		},
		{
			label: 'Where',
			value: isVideo ? 'Video consultation' : place || '—',
			sub: isVideo ? undefined : appt.hospital?.address || undefined,
		},
	]
	// As the mobile app words it: what is owed or paid, and how. No amount is shown when the server has none.
	const paymentText = payAtClinic
		? appt.fees > 0
			? `${formatINR(appt.fees)} to pay at the clinic`
			: 'Pay at the clinic'
		: `${appt.fees > 0 ? `${formatINR(appt.fees)} paid` : 'Paid'}${state?.paymentMethodLabel ? ` via ${state.paymentMethodLabel}` : ''}`
	const payLabel = `${payAtClinic ? 'Pay at clinic' : 'Payment successful'}${appt.fees > 0 ? ` · ${formatINR(appt.fees)}` : ''}`

	return (
		<Box sx={{ bgcolor: 'background.default' }}>
			<Box sx={{ pb: { xs: 4, md: 3 } }}>
				{/* Hero: a band across the page, the message beside the check mark on a wide screen */}
				<Box sx={{ bgcolor: 'primary.main', color: '#fff', pt: { xs: 3, md: 3 }, pb: { xs: 8, md: 8 } }}>
					<Container
						maxWidth="lg"
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', md: 'row' },
							alignItems: 'center',
							textAlign: { xs: 'center', md: 'left' },
							gap: { xs: 2, md: 3 },
							px: { xs: 2, sm: 3 },
						}}
					>
						<Box
							sx={{
								width: 72,
								height: 72,
								flexShrink: 0,
								borderRadius: '50%',
								bgcolor: 'rgba(255,255,255,0.18)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<CheckRoundedIcon sx={{ fontSize: 44 }} />
						</Box>
						<Box>
							<Chip
								label={payLabel}
								size="small"
								sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, mb: 1 }}
							/>
							<Typography fontWeight={700} fontSize={{ xs: 26, md: 32 }}>
								You&apos;re all booked
							</Typography>
							<Typography fontSize={{ xs: 14, md: 16 }} sx={{ opacity: 0.9, mt: 0.5 }}>
								{sentence}.
							</Typography>
						</Box>
					</Container>
				</Box>

				{/* Two columns on a laptop: the appointment (with the actions) and what to do before the visit */}
				<Container maxWidth="lg" sx={{ mt: -5, px: { xs: 2, sm: 3 } }}>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.5fr) minmax(0, 1fr)' },
							gap: 3,
							alignItems: 'start',
						}}
					>
						{/* Appointment */}
						<SectionCard title="Appointment" noPadding sx={{ overflow: 'hidden' }}>
							<Divider />
							<Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
								<Avatar
									src={buildS3Url(appt.doctor?.avatar_s3_key) || undefined}
									alt={doctorName}
									sx={{
										width: 56,
										height: 56,
										bgcolor: 'primary.main',
										fontSize: 20,
										fontWeight: 700,
									}}
								>
									{doctorName.replace(/^Dr\.?\s*/i, '').charAt(0)}
								</Avatar>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography fontWeight={700} fontSize={17} color="text.primary">
										{doctorName}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{[specialty, isVideo ? 'Video call' : 'In-clinic'].filter(Boolean).join(' · ')}
									</Typography>
								</Box>
								<Chip
									label={
										confirmed
											? 'Confirmed'
											: status.toLowerCase() === 'pending'
												? 'Awaiting confirmation'
												: capitalise(status)
									}
									size="small"
									sx={{
										fontWeight: 600,
										bgcolor: confirmed ? '#e8f5e9' : '#fff8e1',
										color: confirmed ? '#2e7d32' : '#e65100',
									}}
								/>
							</Box>

							<Divider />

							<Box
								sx={{
									px: 3,
									py: 2.5,
									display: 'grid',
									gridTemplateColumns: {
										xs: '1fr',
										sm: 'minmax(0, 0.9fr) minmax(0, 1.5fr) minmax(0, 1.2fr)',
									},
									gap: { xs: 2, sm: 3 },
								}}
							>
								{fields.map((field) => (
									<Box key={field.label} sx={{ minWidth: 0 }}>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{
												fontWeight: 700,
												letterSpacing: '0.06em',
												textTransform: 'uppercase',
											}}
										>
											{field.label}
										</Typography>
										<Typography
											fontWeight={600}
											fontSize={15}
											color="text.primary"
											sx={{ wordBreak: 'break-word' }}
										>
											{field.value}
										</Typography>
										{field.sub && (
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ wordBreak: 'break-word' }}
											>
												{field.sub}
											</Typography>
										)}
									</Box>
								))}
							</Box>

							<Divider />

							{/* Payment and receipt */}
							<Box
								sx={{
									px: 3,
									py: 1.5,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 2,
								}}
							>
								<Typography variant="body2" fontWeight={600} color="text.primary">
									{paymentText}
								</Typography>
								<AppButton
									variant="text"
									label="Receipt"
									startIcon={<DownloadRoundedIcon fontSize="small" />}
									onClick={() => toast.info('Coming soon')}
								/>
							</Box>
						</SectionCard>

						{/* Right column: what to do before the visit, and the way into the appointment */}
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							{/* Before your visit */}
							<SectionCard
								title={isVideo ? 'Get ready for the call' : 'Before your visit'}
								noPadding
								sx={{ height: 'auto', overflow: 'hidden' }}
							>
								<Divider />
								<Box sx={{ px: 3, py: 2.5 }}>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
										{steps.map((step, i) => (
											<Box key={step.title} sx={{ display: 'flex', gap: 1.5 }}>
												<Box
													sx={{
														width: 26,
														height: 26,
														flexShrink: 0,
														borderRadius: '50%',
														bgcolor: 'rgba(43,111,113,0.12)',
														color: 'primary.main',
														fontSize: 13,
														fontWeight: 700,
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
													}}
												>
													{i + 1}
												</Box>
												<Box>
													<Typography fontSize={14.5} fontWeight={600} color="text.primary">
														{step.title}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{step.body}
													</Typography>
												</Box>
											</Box>
										))}
									</Box>
								</Box>
							</SectionCard>
							<AppButton
								label="View appointment"
								fullWidth
								borderRadius="10px"
								onClick={goToAppointment}
							/>
						</Box>
					</Box>
				</Container>
			</Box>
		</Box>
	)
}
