// src/features/appointments/PaymentPage.tsx
import { formatINR } from '../../utils/Utils'
import phonePeImg from '../../assets/payment/phone-pay.png'
import googlePayImg from '../../assets/payment/google-pay.png'
import amazonPayImg from '../../assets/payment/amazone-pay.png'
import whatsappImg from '../../assets/payment/whatsapp.png'
import paytmImg from '../../assets/payment/paytm.png'
import creditCardImg from '../../assets/payment/credit-card.png'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
	Checkbox,
	Dialog,
	DialogContent,
	// TextField,
	Chip,
} from '@mui/material'
import {
	ArrowBack,
	CalendarToday,
	AccessTime,
	MedicalServices,
	LocationOn,



	// UploadFile,
} from '@mui/icons-material'
import AppButton from '../../components/common/Button/AppButton'
import ConfirmModal from '../../components/common/Modal/ConfirmModal'
import { createAppointment } from '../doctor/doctorService'
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
		icon: (
			<Box
				component="img"
				src={googlePayImg}
				sx={{ width: 48, height: 28, objectFit: 'contain' }}
			/>
		),
	},
	{
		id: 'paytm',
		label: 'Paytm',
		icon: (
			<Box
				component="img"
				src={paytmImg}
				sx={{ width: 48, height: 28, objectFit: 'contain' }}
			/>
		),
	},
	{
		id: 'amazonpay',
		label: 'Amazon Pay',
		icon: (
			<Box
				component="img"
				src={amazonPayImg}
				sx={{ width: 48, height: 28, objectFit: 'contain' }}
			/>
		),
	},
	{
		id: 'card',
		label: 'Credit Card',
		icon: <Box component="img" src={creditCardImg} sx={{ width: 28, height: 28, objectFit: 'contain' }} />,
	},





]

/* ─── component ──────────────────────────────────────────────── */
export default function PaymentPage() {
	const location = useLocation()
	const navigate = useNavigate()
	const state = (location.state as PaymentState) ?? {}

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
	} = state

	const total = consultationFee + serviceFee

	const [paymentChoice, setPaymentChoice] = useState<'now' | 'later'>('later')
	const [selectedPayment, setSelectedPayment] = useState('phonepe')
	const [whatsapp, setWhatsapp] = useState(false)
	const [booking, setBooking] = useState(false)
	const [successOpen, setSuccessOpen] = useState(false)
	const [symptomsOpen, setSymptomsOpen] = useState(false)
	const [symptoms, setSymptoms] = useState('')
	const [duration, setDuration] = useState('')
	const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | ''>('')
	// const [reportFile, setReportFile] = useState<File | null>(null)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const infoRows = [
		{ icon: <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />, label: 'Date:', value: date },
		{ icon: <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />, label: 'Time:', value: time },
		{
			icon: <MedicalServices sx={{ fontSize: 14, color: 'text.secondary' }} />,
			label: 'Type:',
			value: appointmentType,
		},
		{ icon: <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />, label: 'Location:', value: clinic },
	]

	const handleConfirm = async () => {
		setBooking(true)
		setErrorMsg(null)
		try {
			await createAppointment({
				doctor_id: doctorId,
				hospital_id: hospitalId || undefined,
				appointment_mode: appointmentMode,
				appointment_date: appointmentDate,
				start_time: startTime,
			})
			setSuccessOpen(true)
		} catch {
			setErrorMsg('Failed to book appointment. Please try again.')
		} finally {
			setBooking(false)
		}
	}

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
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
					onClick={() => navigate(-1)}
					sx={{ color: '#fff', '&:focus': { outline: 'none' } }}
				>
					<ArrowBack fontSize="small" />
				</IconButton>
				<Typography fontWeight={600} fontSize={16}>
					Booking details
				</Typography>
			</Box>

			<Container maxWidth="sm" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
				{/* ── Single card — everything inside ── */}
				<Box
					sx={{
						bgcolor: 'background.paper',
						borderRadius: '16px',
						border: '1px solid',
						borderColor: 'divider',
						overflow: 'hidden',
					}}
				>
					{/* Doctor header */}
					<Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Avatar
							src={avatarUrl}
							alt={doctorName}
							sx={{ width: 46, height: 46, bgcolor: 'primary.main', fontSize: 18, fontWeight: 700 }}
						>
							{doctorName.charAt(0)}
						</Avatar>
						<Box>
							<Typography fontWeight={700} fontSize={15} color="text.primary">
								{doctorName}
							</Typography>
							<Typography variant="body2" fontSize={12} color="text.secondary">
								{specialty}
							</Typography>
						</Box>
					</Box>

					<Divider />

					{/* Appointment info rows */}
					<Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.1 }}>
						{infoRows.map((row) => (
							<Box key={row.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								{row.icon}
								<Typography variant="body2" color="text.secondary" sx={{ width: 72, flexShrink: 0 }}>
									{row.label}
								</Typography>
								<Typography
									variant="body2"
									fontWeight={500}
									color="text.primary"
									sx={{ ml: 'auto', textAlign: 'right' }}
								>
									{row.value || '—'}
								</Typography>
							</Box>
						))}
					</Box>

					<Divider />

					{/* Bill details */}
					<Box sx={{ px: 2.5, py: 2 }}>
						<Typography fontWeight={700} fontSize={14} mb={1.5} color="text.primary">
							Bill Details
						</Typography>

						<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
							<Typography variant="body2" color="text.secondary">
								Consultation fee:
							</Typography>
							<Typography variant="body2" fontWeight={500} color="text.primary">
								{formatINR(consultationFee)}
							</Typography>
						</Box>

						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<Typography variant="body2" color="text.secondary">
									Service Fee & Tax
								</Typography>
							</Box>
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
									FREE
								</Typography>
							</Box>
						</Box>

						<Divider sx={{ my: 1.5 }} />

						<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
							<Typography fontWeight={700} fontSize={14} color="text.primary">
								Total Payable
							</Typography>
							<Typography fontWeight={700} fontSize={14} color="text.primary">
								{formatINR(total)}
							</Typography>
						</Box>
					</Box>

					<Divider />

					{/* Pay Now / Pay Later */}
					<Box sx={{ px: 2.5, py: 2 }}>
						<Typography fontWeight={700} fontSize={14} mb={1.25} color="text.primary">
							Payment Method
						</Typography>

						<FormControl component="fieldset" fullWidth>
							<RadioGroup
								value={paymentChoice}
								onChange={(e) => setPaymentChoice(e.target.value as 'now' | 'later')}
							>
								<FormControlLabel
									value="later"
									sx={{
										mx: 0,
										px: 1.5,
										width: '100%',
										display: 'flex',
										justifyContent: 'space-between',
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
											Pay Later
										</Typography>
									}
								/>
								<FormControlLabel
									value="now"
									sx={{
										mx: 0,
										px: 1.5,
										width: '100%',
										display: 'flex',
										justifyContent: 'space-between',
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
											Pay Now
										</Typography>
									}
								/>
							</RadioGroup>
						</FormControl>
					</Box>

					{/* Payment options — only when Pay Now */}
					<Collapse in={paymentChoice === 'now'} timeout={250} unmountOnExit>
						<Box sx={{ px: 2.5, pb: 2 }}>
							<FormControl component="fieldset" fullWidth>
								<RadioGroup
									value={selectedPayment}
									onChange={(e) => setSelectedPayment(e.target.value)}
									sx={{ gap: 0.5 }}
								>
									{PAYMENT_OPTIONS.map((opt) => (
										<FormControlLabel
											key={opt.id}
											value={opt.id}
											sx={{
												mx: 0,
												px: 1.5,
												py: 0.6,
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
														gap: 1.25,
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
													<Typography variant="body2" fontWeight={500} color="text.primary">
														{opt.label}
													</Typography>
												</Box>
											}
										/>
									))}
								</RadioGroup>
							</FormControl>
						</Box>
					</Collapse>

					<Divider />

					{/* WhatsApp notification */}
					<Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1 }}>
							<Box component="img" src={whatsappImg} sx={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
							<Box>
								<Typography variant="body2" fontWeight={600} color="text.primary">
									Get notifications on whatsapp
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ display: 'block', lineHeight: 1.5, mt: 0.25 }}
								>
									Updates will be sent to +91XXXXXXXXXX
								</Typography>
							</Box>
						</Box>
						<Checkbox
							size="small"
							checked={whatsapp}
							onChange={(e) => setWhatsapp(e.target.checked)}
							sx={{
								color: 'divider',
								'&.Mui-checked': { color: 'primary.main' },
								p: 0.5,
								mt: 0.25,
								'&:focus': { outline: 'none' },
							}}
						/>
					</Box>

					{/* Terms note */}
					<Box sx={{ px: 2.5, pb: 2 }}>
						<Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
							• Updates will be sent to +91XXXXXXXXXX
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
							• By booking the appointment, you agree to Factory's Terms & Conditions.
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
							• You can also Pre-pay for this appointment by selecting Pay Online option. You can read our
							payment FAQs.
						</Typography>
					</Box>

					<Divider />

					{/* Bottom CTA */}
					<Box
						sx={{
							px: 2.5,
							py: 2,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}
					>
						<Box>
							<Typography fontWeight={700} fontSize={20} color="text.primary">
								{formatINR(total)}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{paymentChoice === 'now' ? 'Pay Now' : 'Pay Now'}
							</Typography>
						</Box>

						{errorMsg && (
							<Typography variant="caption" color="error.main" sx={{ flex: 1, mx: 2 }}>
								{errorMsg}
							</Typography>
						)}

						<AppButton
							label={paymentChoice === 'now' ? 'Confirm & Pay' : `Confirm ${appointmentType}`}
							loading={booking}
							onClick={handleConfirm}
							borderRadius="10px"
							sx={{ px: 7, fontWeight: 700 }}
						/>
					</Box>
				</Box>
			</Container>

			{/* ── Success modal ── */}
			<ConfirmModal
				open={successOpen}
				onClose={() => {
					setSuccessOpen(false)
					setSymptomsOpen(true)
				}}
				onConfirm={() => {
					setSuccessOpen(false)
					setSymptomsOpen(true)
				}}
				variant="success"
				title="Your appointment is successfully booked"
				description="The update will appear in your profile."
				confirmLabel="Done"
				hideCancelButton
			/>

			{/* ── Symptoms popup ── */}
			<Dialog
				open={symptomsOpen}
				onClose={() => {
					setSymptomsOpen(false)
					navigate('/doctors/' + doctorId)
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
						<Typography variant = "body2" fontSize={12} color="rgba(255,255,255,0.8)" mt={0.5}>
							Help your doctor understand your condition better by adding symptoms or concerns before the
							consultation.
						</Typography>
					</Box>

					{/* Body */}
					<Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						{/* Symptoms textarea */}
						<Box>
							<Typography variant = "body2" fontSize={13} fontWeight={600} color="text.primary" mb={0.8}>
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

						{/* Buttons */}
						<Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
							<AppButton
								variant="outlined"
								label="Skip for Now"
								fullWidth
								onClick={() => {
									setSymptomsOpen(false)
									navigate('/doctors/' + doctorId)
								}}
							/>
							<AppButton
								label="Submit Details"
								fullWidth
								disabled={!symptoms.trim() && !severity}
								onClick={() => {
									// Save symptoms to sessionStorage keyed by doctor+date+time
									const key = 'symptoms_' + doctorId + '_' + appointmentDate + '_' + startTime
									sessionStorage.setItem(key, JSON.stringify({ symptoms, duration, severity }))
									setSymptomsOpen(false)
									navigate('/doctors/' + doctorId)
								}}
							/>
						</Box>
					</Box>
				</DialogContent>
			</Dialog>
		</Box>
	)
}
