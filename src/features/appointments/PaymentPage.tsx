// src/features/appointments/PaymentPage.tsx
import { formatINR } from '../../utils/Utils'
import phonePeImg from '../../assets/payment/phone-pay.png'
import googlePayImg from '../../assets/payment/google-pay.png'
import amazonPayImg from '../../assets/payment/amazone-pay.png'
import paytmImg from '../../assets/payment/paytm.png'
import creditCardImg from '../../assets/payment/credit-card.png'
import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ROUTES } from '../../constants/routes'
import { useGoBack } from '../../hooks/useGoBack'
import {
	Box,
	Container,
	Typography,
	Divider,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	Collapse,
	IconButton,
	Avatar,
	Dialog,
	DialogContent,
	// TextField,
	Chip,
} from '@mui/material'
import {
	ArrowBack,
	LockOutlined,
	// UploadFile,
} from '@mui/icons-material'
import AppButton from '../../components/common/Button/AppButton'
import SectionCard from '../../components/common/Card/SectionCard'
import { createAppointment, updatePreIntake } from '../doctor/doctorService'
import AppInput from '../../components/common/Input/AppInput'

/* ─── types ─────────────────────────────────────────────────── */
interface PaymentState {
	doctorName: string
	avatarUrl: string
	specialty: string
	date: string
	time: string
	appointmentType: string
	location: string
	consultationFee: number
	serviceFee: number
	doctorId: string
	hospitalId: string
	appointmentMode: 'clinic_visit' | 'video_call'
	appointmentDate: string
	startTime: string
	allowPayLater?: boolean
	/** Present only when booking from a referral */
	referralId?: string
	consentVersionId: string
	/** Public id of the person the appointment is for (the signed-in patient or one of their family members) */
	patientId?: string
	/** Who the appointment is for (shown on this page, as in the mobile app) */
	patientName?: string
	patientRelation?: string
	patientAge?: number | string
	patientGender?: string
	/** Shown beside the doctor's specialty, and the clinic's distance */
	experienceYears?: number | null
	distance?: string | number | null
}

interface PaymentOption {
	id: string
	label: string
	icon: React.ReactNode
}

/* ─── payment options ────────────────────────────────────────── */
const PAYMENT_OPTIONS: PaymentOption[] = [
	{
		id: 'phonepe',
		label: 'Phone Pe',
		icon: <Box component="img" src={phonePeImg} sx={{ width: 28, height: 28, objectFit: 'contain' }} />,
	},
	{
		id: 'googlepay',
		label: 'Google Pay',
		icon: <Box component="img" src={googlePayImg} sx={{ width: 48, height: 28, objectFit: 'contain' }} />,
	},
	{
		id: 'paytm',
		label: 'Paytm',
		icon: <Box component="img" src={paytmImg} sx={{ width: 48, height: 28, objectFit: 'contain' }} />,
	},
	{
		id: 'amazonpay',
		label: 'Amazon Pay',
		icon: <Box component="img" src={amazonPayImg} sx={{ width: 48, height: 28, objectFit: 'contain' }} />,
	},
	{
		id: 'card',
		label: 'Credit Card',
		icon: <Box component="img" src={creditCardImg} sx={{ width: 28, height: 28, objectFit: 'contain' }} />,
	},
]

// interface PaymentPageProps {
// 	allowPayLater?: boolean
// }

/* ─── component ──────────────────────────────────────────────── */
export default function PaymentPage() {
	const location = useLocation()
	const navigate = useNavigate()
	const goBack = useGoBack()
	const state = (location.state as PaymentState) ?? ({} as PaymentState)

	const {
		doctorName = 'Doctor',
		avatarUrl = '',
		specialty = '',
		date = '',
		time = '',
		appointmentType = 'Clinic Visit',
		location: clinic = '',
		consultationFee = 0,
		serviceFee = 0,
		doctorId = '',
		hospitalId = '',
		appointmentMode = 'clinic_visit',
		appointmentDate = '',
		startTime = '',
		allowPayLater = true,
		referralId,
		consentVersionId,
		patientId,
		patientName,
		patientRelation,
		patientAge,
		patientGender,
		experienceYears,
		distance,
	} = state

	const total = consultationFee + serviceFee

	const [paymentChoice, setPaymentChoice] = useState<'now' | 'later'>(allowPayLater ? 'later' : 'now')
	// Opening the online options makes the bill card taller; the appointment card keeps the height it had (they matched before).
	const billCardRef = useRef<HTMLDivElement | null>(null)
	const [appointmentCardHeight, setAppointmentCardHeight] = useState<number | null>(null)
	const choosePayment = (choice: 'now' | 'later') => {
		// Hold the appointment card at the height it has now; do not overwrite a hold that is still in place (a quick switch back and forth).
		if (choice === 'now' && allowPayLater && !appointmentCardHeight && billCardRef.current) {
			setAppointmentCardHeight(billCardRef.current.offsetHeight)
		}
		// Going back to pay at clinic does NOT release the hold yet: the bill card is still folding up, and the appointment card
		// must not follow it down. The hold is released when the folding has finished (the Collapse's onExited below).
		setPaymentChoice(choice)
	}
	const [selectedPayment, setSelectedPayment] = useState('phonepe')
	const [booking, setBooking] = useState(false)
	const [symptomsOpen, setSymptomsOpen] = useState(false)
	const [symptoms, setSymptoms] = useState('')
	const [duration, setDuration] = useState('')
	const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | ''>('')
	const [appointmentId, setAppointmentId] = useState('')
	// Refs, not state, so they hold at once: state only changes at the next render, so clicks inside the same event cycle would
	// all pass a state check. (Mirrors bookingInFlightRef / bookedRef of the mobile payment screen.)
	// - bookingInFlightRef: a booking request is on its way; taken just before the request, released in `finally`.
	// - bookedAppointmentIdRef: the appointment exists; from then on this booking flow never sends another request.
	const bookingInFlightRef = useRef(false)
	const bookedAppointmentIdRef = useRef('')
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	// Why the booking cannot go on as it is: the chosen time was taken (or blocked) by the time the patient confirmed, or the booking
	// terms were updated since they accepted them. Either way the way forward is the doctor page: a fresh list of slots, and the
	// terms are fetched again when the patient presses Book.
	const [restartReason, setRestartReason] = useState<'slot' | 'consent' | null>(null)
	// the symptoms step has its own message: it is shown inside its dialog, which covers the one next to the button
	const [preIntakeError, setPreIntakeError] = useState<string | null>(null)

	// Everything to book travels in the route state from the doctor page (a refresh or a pasted link has none): without it there is
	// nothing to book, so send the patient back to choose a slot instead of posting a booking with empty ids.
	const missingBookingDetails = !doctorId || !appointmentDate || !startTime || !consentVersionId
	useEffect(() => {
		if (!missingBookingDetails) return
		toast.warning('Your booking session has ended. Please choose a slot again.')
		navigate(doctorId ? ROUTES.DOCTORS.DETAIL.replace(':id', doctorId) : ROUTES.DOCTORS.SEARCH, { replace: true })
	}, [missingBookingDetails, doctorId, navigate])

	/** Back to the doctor page, where the slots are fetched fresh (the referral, if any, is kept). */
	const chooseAnotherSlot = () => {
		const path = ROUTES.DOCTORS.DETAIL.replace(':id', doctorId)
		navigate(referralId ? `${path}?referral_id=${encodeURIComponent(referralId)}` : path, { replace: true })
	}

	/**
	 * After booking (and the symptoms card) the patient sees the Appointment Confirmed page. /payment is replaced by Home first,
	 * so the history reads [... doctor page, Home, confirmation]: Back from the confirmation goes Home and never to the payment page.
	 */
	const goToConfirmation = () => {
		if (!appointmentId) {
			navigate(ROUTES.BOOKINGS)
			return
		}
		navigate(ROUTES.PORTAL.HOME, { replace: true })
		// Only the id and the payment choice (what the patient picked; the server keeps no payment method) travel: the confirmation page reads the appointment itself from the server.
		navigate(ROUTES.APPOINTMENT_CONFIRMED, {
			state: {
				appointmentId,
				paymentChoice,
				paymentMethodLabel:
					paymentChoice === 'later'
						? 'Pay at clinic'
						: PAYMENT_OPTIONS.find((o) => o.id === selectedPayment)?.label,
			},
		})
	}

	const handleConfirm = async () => {
		if (missingBookingDetails) return
		// The appointment already exists: never send another request from this booking, only bring back the step the patient was on.
		if (bookedAppointmentIdRef.current) {
			setSymptomsOpen(true)
			return
		}
		// A request is already on its way (a repeated click): wait for it.
		if (bookingInFlightRef.current) return
		// Taken after the checks above that return early, and always released in the `finally` below.
		bookingInFlightRef.current = true
		setBooking(true)
		setErrorMsg(null)
		setRestartReason(null)
		try {
			const payload: Record<string, unknown> = {
				doctor_id: doctorId,
				hospital_id: hospitalId || undefined,
				appointment_mode: appointmentMode,
				appointment_date: appointmentDate,
				start_time: startTime,
				patient_id: patientId || undefined,
				consent_version_id: consentVersionId,
			}
			if (referralId) payload.referral_id = referralId

			const response = await createAppointment(payload as unknown as Parameters<typeof createAppointment>[0])

			const apptId = (response.data as { id: string }).id
			bookedAppointmentIdRef.current = apptId
			setAppointmentId(apptId)

			setSymptomsOpen(true)
		} catch (error) {
			// The appointment was created and something after that failed: it is booked, so never say it was not.
			if (bookedAppointmentIdRef.current) {
				setSymptomsOpen(true)
				return
			}
			const data = (error as { response?: { data?: { message?: string; code?: string } } })?.response?.data
			const reason = data?.message
			if (data?.code === 'CONSENT_OUTDATED') {
				setRestartReason('consent')
			} else if (reason && /already booked|currently blocked|not available for the selected slot/i.test(reason)) {
				// The server answers a taken or blocked slot with a 400 and a sentence about the slot (there is no code for it).
				setRestartReason('slot')
			}
			setErrorMsg(
				reason
					? `Your appointment was not booked: ${reason}`
					: 'Your appointment was not booked. Please check your connection and try again.'
			)
		} finally {
			bookingInFlightRef.current = false
			setBooking(false)
		}
	}

	return (
		<Box sx={{ bgcolor: 'background.default' }}>
			{/* ── Top bar ── */}
			<Box
				sx={{
					bgcolor: 'primary.main',
					color: '#fff',
					px: 2,
					py: 1.5,
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					position: 'sticky',
					top: 0,
					zIndex: 100,
				}}
			>
				<IconButton
					size="small"
					onClick={() => goBack()}
					sx={{ color: '#fff', '&:focus': { outline: 'none' } }}
				>
					<ArrowBack fontSize="small" />
				</IconButton>
				<Typography fontWeight={600} fontSize={16}>
					Booking details
				</Typography>
			</Box>

			<Container maxWidth="lg" sx={{ py: 1.5, px: { xs: 2, sm: 3 } }}>
				{/* Two columns on a laptop: who and when on the left, the bill and payment on the right */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.15fr) minmax(0, 1fr)' },
						gap: 3,
						alignItems: 'stretch',
					}}
				>
					{/* ── Appointment ── */}
					<SectionCard
						title="Appointment"
						noPadding
						action={<AppButton variant="text" label="Change" onClick={() => goBack()} />}
						sx={{
							...(appointmentCardHeight ? { height: appointmentCardHeight, alignSelf: 'start' } : {}),
							overflow: 'hidden',
						}}
					>
						<Divider />
						{/* Referral banner: shown only when booking from a referral */}
						{referralId && (
							<Box
								sx={{
									bgcolor: '#e8f4f8',
									borderBottom: '1px solid rgba(12,124,124,0.2)',
									px: 2.5,
									py: 1,
									display: 'flex',
									alignItems: 'center',
									gap: 0.8,
								}}
							>
								<Box
									sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0c7c7c', flexShrink: 0 }}
								/>
								<Typography fontSize={12} fontWeight={600} color="#0c7c7c">
									Booking via referral
								</Typography>
							</Box>
						)}

						{/* Doctor */}
						<Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
							<Avatar
								src={avatarUrl}
								alt={doctorName}
								sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20, fontWeight: 700 }}
							>
								{doctorName.charAt(0)}
							</Avatar>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography fontWeight={700} fontSize={17} color="text.primary">
									{doctorName}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{[specialty, experienceYears != null ? `${experienceYears} yrs` : '']
										.filter(Boolean)
										.join(' · ')}
								</Typography>
							</Box>
						</Box>

						<Divider />

						{/* When / Where */}
						<Box
							sx={{
								px: 3,
								py: 2,
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1.4fr)' },
								gap: { xs: 2, sm: 3 },
							}}
						>
							<Box>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
								>
									When
								</Typography>
								<Typography fontWeight={700} fontSize={16} color="text.primary">
									{time || '—'}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{date}
								</Typography>
							</Box>
							<Box sx={{ minWidth: 0 }}>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
								>
									Where
								</Typography>
								<Typography
									fontWeight={600}
									fontSize={15}
									color="text.primary"
									sx={{ wordBreak: 'break-word' }}
								>
									{appointmentMode === 'video_call' ? 'Video consultation' : clinic || '—'}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{appointmentMode === 'video_call'
										? 'Video call'
										: [
												'In-clinic',
												distance != null && distance !== ''
													? /km/i.test(String(distance))
														? distance
														: `${distance} km`
													: '',
											]
												.filter(Boolean)
												.join(' · ')}
								</Typography>
							</Box>
						</Box>

						<Divider />

						{/* For whom the appointment is booked */}
						<Box sx={{ px: 3, py: 1.75, display: 'flex', alignItems: 'center', gap: 2 }}>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{
									fontWeight: 700,
									letterSpacing: '0.06em',
									textTransform: 'uppercase',
									width: 56,
									flexShrink: 0,
								}}
							>
								For
							</Typography>
							<Box sx={{ minWidth: 0 }}>
								<Typography fontWeight={600} fontSize={15} color="text.primary">
									{patientName || 'You'}
									{patientRelation ? ` (${patientRelation})` : ''}
								</Typography>
								{(patientAge || patientGender) && (
									<Typography variant="body2" color="text.secondary">
										{[patientAge ? `${patientAge} yrs` : '', patientGender]
											.filter(Boolean)
											.join(' · ')}
									</Typography>
								)}
							</Box>
						</Box>
					</SectionCard>

					{/* ── Bill and payment ── */}
					<Box ref={billCardRef} sx={{ display: 'flex' }}>
						<SectionCard title="Bill details" noPadding sx={{ flex: 1, overflow: 'hidden' }}>
							<Divider />
							{/* Bill details */}
							<Box sx={{ px: 3, py: 2 }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
									<Typography variant="body2" color="text.secondary">
										Consultation fee
									</Typography>
									<Typography variant="body2" fontWeight={500} color="text.primary">
										{formatINR(consultationFee)}
									</Typography>
								</Box>

								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Typography variant="body2" color="text.secondary">
										Booking fee
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										{serviceFee > 0 && (
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ textDecoration: 'line-through' }}
											>
												{formatINR(serviceFee)}
											</Typography>
										)}
										<Typography variant="body2" fontWeight={700} color="success.main">
											Free
										</Typography>
									</Box>
								</Box>

								<Divider sx={{ my: 1.5 }} />

								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography fontWeight={700} fontSize={15} color="text.primary">
										To pay
									</Typography>
									<Typography fontWeight={700} fontSize={15} color="text.primary">
										{formatINR(total)}
									</Typography>
								</Box>
							</Box>

							<Divider />

							{/* Pay with */}
							<Box sx={{ px: 3, py: 2 }}>
								<Typography fontWeight={700} fontSize={15} mb={1} color="text.primary">
									Pay with
								</Typography>

								<FormControl component="fieldset" fullWidth>
									<RadioGroup
										value={paymentChoice}
										onChange={(e) => choosePayment(e.target.value as 'now' | 'later')}
									>
										{(
											[
												{ value: 'later', label: 'Pay at clinic', disabled: !allowPayLater },
												{ value: 'now', label: 'Pay online', disabled: false },
											] as const
										).map((choice) => (
											<FormControlLabel
												key={choice.value}
												value={choice.value}
												disabled={choice.disabled}
												sx={{
													mx: 0,
													px: 1.5,
													width: '100%',
													display: 'flex',
													justifyContent: 'space-between',
													opacity: choice.disabled ? 0.5 : 1,
												}}
												control={
													<Radio
														size="small"
														sx={{
															order: 2,
															ml: 'auto',
															color: 'primary.main',
															'&.Mui-checked': { color: 'primary.main' },
															'&:focus': { outline: 'none' },
														}}
													/>
												}
												label={
													<Typography
														variant="body2"
														fontWeight={500}
														color="text.primary"
														sx={{ order: 1, flex: 1 }}
													>
														{choice.label}
													</Typography>
												}
											/>
										))}
									</RadioGroup>
								</FormControl>

								{/* Online payment options: only when paying online, two to a row to keep the page short */}
								<Collapse
									in={paymentChoice === 'now'}
									timeout={250}
									unmountOnExit
									onExited={() => setAppointmentCardHeight(null)}
								>
									<RadioGroup
										value={selectedPayment}
										onChange={(e) => setSelectedPayment(e.target.value)}
										sx={{
											mt: 1,
											display: 'grid',
											gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
											gap: 1,
										}}
									>
										{PAYMENT_OPTIONS.map((opt) => (
											<FormControlLabel
												key={opt.id}
												value={opt.id}
												sx={{
													mx: 0,
													px: 1.25,
													py: 0.4,
													borderRadius: '8px',
													border: '1px solid',
													borderColor: 'divider',
													'&:hover': { bgcolor: 'rgba(43,111,113,0.04)' },
												}}
												control={
													<Radio
														size="small"
														sx={{
															order: 2,
															ml: 'auto',
															color: 'primary.main',
															'&.Mui-checked': { color: 'primary.main' },
															'&:focus': { outline: 'none' },
														}}
													/>
												}
												label={
													<Box
														sx={{
															display: 'flex',
															alignItems: 'center',
															gap: 1,
															order: 1,
															flex: 1,
														}}
													>
														<Box
															sx={{
																width: 28,
																height: 28,
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
															}}
														>
															{opt.icon}
														</Box>
														<Typography
															variant="body2"
															fontWeight={500}
															color="text.primary"
														>
															{opt.label}
														</Typography>
													</Box>
												}
											/>
										))}
									</RadioGroup>
								</Collapse>

								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 0.75,
										mt: 1.5,
										color: 'text.secondary',
									}}
								>
									<LockOutlined sx={{ fontSize: 15 }} />
									<Typography variant="caption">Payments are secure and encrypted</Typography>
								</Box>
							</Box>
						</SectionCard>
					</Box>
				</Box>

				{/* Confirm: under the cards, in the middle */}
				<Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					{errorMsg && (
						<Box
							sx={{
								mb: 1.5,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 1,
								flexWrap: 'wrap',
							}}
						>
							<Typography variant="caption" color="error.main">
								{errorMsg}
							</Typography>
							{restartReason && (
								<AppButton
									variant="text"
									size="small"
									label={restartReason === 'consent' ? 'Review the new terms' : 'Choose another slot'}
									onClick={chooseAnotherSlot}
								/>
							)}
						</Box>
					)}
					<AppButton
						label={paymentChoice === 'now' ? `Pay ${formatINR(total)}` : `Confirm ${appointmentType}`}
						loading={booking}
						disabled={Boolean(appointmentId)}
						onClick={handleConfirm}
						borderRadius="10px"
						sx={{ py: 1.25, px: 8, minWidth: 280, fontWeight: 700 }}
					/>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ display: 'block', textAlign: 'center', mt: 1 }}
					>
						By continuing you agree to the booking terms
					</Typography>
				</Box>
			</Container>

			{/* ── Symptoms popup ── */}
			<Dialog
				open={symptomsOpen}
				onClose={() => {
					setSymptomsOpen(false)
					goToConfirmation()
				}}
				maxWidth="sm"
				fullWidth
				slotProps={{ paper: { sx: { borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' } } }}
			>
				<DialogContent sx={{ p: 0 }}>
					{/* Header */}
					<Box sx={{ bgcolor: 'primary.main', px: 3, py: 2.5, borderRadius: '20px 20px 0 0' }}>
						<Typography fontWeight={700} fontSize={16} color="#fff">
							Share Symptoms Before Your Appointment
						</Typography>
						<Typography variant="body2" fontSize={12} color="rgba(255,255,255,0.8)" mt={0.5}>
							Help your doctor understand your condition better by adding symptoms or concerns before the
							consultation.
						</Typography>
					</Box>

					{/* Body */}
					<Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						{/* Symptoms textarea */}
						<Box>
							<Typography variant="body2" fontSize={13} fontWeight={600} color="text.primary" mb={0.8}>
								Symptoms / Reason for Visit
							</Typography>

							<AppInput
								multiline
								rows={3}
								fullWidth
								placeholder="Describe your symptoms or reason for visit..."
								value={symptoms}
								onChange={(e) => setSymptoms(e.target.value)}
								size="small"
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: '10px',
										fontSize: 13,
									},
								}}
							/>
						</Box>

						{/* Duration */}
						<Box>
							<Typography fontSize={13} fontWeight={600} color="text.primary" mb={0.8}>
								Duration of Symptoms
							</Typography>

							<AppInput
								fullWidth
								placeholder="e.g. 2 days, 1 week, 3 months"
								value={duration}
								onChange={(e) => setDuration(e.target.value)}
								size="small"
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: '10px',
										fontSize: 13,
									},
								}}
							/>
						</Box>

						{/* Severity */}
						<Box>
							<Typography fontSize={13} fontWeight={600} color="text.primary" mb={1}>
								Severity Level
							</Typography>
							<Box sx={{ display: 'flex', gap: 1 }}>
								{(['mild', 'moderate', 'severe'] as const).map((s) => {
									const colors: Record<string, { bg: string; border: string; text: string }> = {
										mild: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
										moderate: { bg: '#fff8e1', border: '#ffa726', text: '#e65100' },
										severe: { bg: '#ffebee', border: '#ef5350', text: '#c62828' },
									}
									const isSelected = severity === s
									return (
										<Chip
											key={s}
											label={s.charAt(0).toUpperCase() + s.slice(1)}
											onClick={() => setSeverity(s)}
											sx={{
												cursor: 'pointer',
												fontSize: 13,
												fontWeight: isSelected ? 700 : 400,
												bgcolor: isSelected ? colors[s].bg : 'transparent',
												border: '1.5px solid',
												borderColor: isSelected ? colors[s].border : 'divider',
												color: isSelected ? colors[s].text : 'text.secondary',
												transition: 'all 0.15s',
											}}
										/>
									)
								})}
							</Box>
						</Box>

						{/* Upload reports
						<Box>
							<Typography fontSize={13} fontWeight={600} color="text.primary" mb={0.8}>
								Upload Reports{' '}
								<Typography component="span" fontSize={12} color="text.secondary" fontWeight={400}>
									(Optional)
								</Typography>
							</Typography>
							<Box
								component="label"
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 1.5,
									px: 2,
									py: 1.5,
									borderRadius: '10px',
									border: '1.5px dashed',
									borderColor: reportFile ? 'primary.main' : 'divider',
									bgcolor: reportFile ? 'rgba(43,111,113,0.04)' : 'background.default',
									cursor: 'pointer',
									transition: 'all 0.15s',
									'&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(43,111,113,0.04)' },
								}}
							>
								<UploadFile
									sx={{ fontSize: 20, color: reportFile ? 'primary.main' : 'text.disabled' }}
								/>
								<Box>
									<Typography
										fontSize={13}
										color={reportFile ? 'primary.main' : 'text.secondary'}
										fontWeight={reportFile ? 600 : 400}
									>
										{reportFile ? reportFile.name : 'Tap to upload PDF, image or document'}
									</Typography>
									{!reportFile && (
										<Typography fontSize={11} color="text.disabled">
											PDF, JPG, PNG up to 10 MB
										</Typography>
									)}
								</Box>
								<input
									type="file"
									hidden
									accept=".pdf,.jpg,.jpeg,.png"
									onChange={(e) => setReportFile(e.target.files?.[0] ?? null)}
								/>
							</Box>
						</Box> */}

						{preIntakeError && (
							<Typography variant="body2" color="error.main">
								{preIntakeError}
							</Typography>
						)}

						{/* Buttons */}
						<Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
							<AppButton
								variant="outlined"
								label="Skip for Now"
								fullWidth
								onClick={() => {
									setSymptomsOpen(false)
									goToConfirmation()
								}}
							/>
							<AppButton
								label="Submit Details"
								fullWidth
								disabled={!symptoms.trim() && !severity}
								onClick={async () => {
									setPreIntakeError(null)
									try {
										await updatePreIntake(appointmentId, {
											symptoms,
											duration,
											severity: severity || undefined,
										})

										setSymptomsOpen(false)
										goToConfirmation()
									} catch (error) {
										console.error(error)
										setPreIntakeError(
											'We could not save your symptoms. Please try again, or skip for now and add them later.'
										)
									}
								}}
							/>
						</Box>
					</Box>
				</DialogContent>
			</Dialog>
		</Box>
	)
}
