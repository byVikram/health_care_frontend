// src/features/appointments/components/BookingDetailsModal.tsx
import { formatINR } from '../../../utils/Utils'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Box,
	Typography,
	Divider,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	Collapse,
	IconButton,
} from '@mui/material'
import {
	CalendarToday,
	AccessTime,
	LocalHospital,
	LocationOn,
	PhoneAndroid,
	CreditCard,
	LocalAtm,
	ArrowBack,
} from '@mui/icons-material'
import { useState } from 'react'
import AppButton from '../../../components/common/Button/AppButton'

// Payment method option type
interface PaymentOption {
	id: string
	label: string
	icon: React.ReactNode
}

const PAYMENT_OPTIONS: PaymentOption[] = [
	{ id: 'phonepe', label: 'Phone Pe', icon: <PhoneAndroid sx={{ color: '#5f259f', fontSize: 22 }} /> },
	{ id: 'googlepay', label: 'Google Pay', icon: <Box component="img" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" sx={{ width: 22, height: 22, objectFit: 'contain' }} /> },
	{ id: 'paytm', label: 'Paytm', icon: <Box component="img" src="https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png" sx={{ width: 22, height: 22, objectFit: 'contain' }} /> },
	{ id: 'amazonpay', label: 'Amazon Pay', icon: <Box component="img" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Amazon_Pay_logo.svg/512px-Amazon_Pay_logo.svg.png" sx={{ width: 22, height: 22, objectFit: 'contain' }} /> },
	{ id: 'card', label: 'Credit Card', icon: <CreditCard sx={{ color: '#e53935', fontSize: 22 }} /> },
	{ id: 'cash', label: 'Cash On Visit', icon: <LocalAtm sx={{ color: '#43a047', fontSize: 22 }} /> },
]

export interface BookingInfo {
	doctorName: string
	specialty: string
	date: string       // e.g. "11 October 2025"
	time: string       // e.g. "01:00 PM - 01:30 PM"
	type: string       // e.g. "Clinic Visit"
	location: string   // e.g. "Arogya Clinic, KR Market"
	consultationFee: number
	serviceFee?: number
}

interface Props {
	open: boolean
	onClose: () => void
	onConfirm: () => void
	bookingInfo: BookingInfo
	loading?: boolean
}

export default function BookingDetailsModal({ open, onClose, onConfirm, bookingInfo, loading }: Props) {
	const [paymentChoice, setPaymentChoice] = useState<'now' | 'later'>('later')
	const [selectedPayment, setSelectedPayment] = useState('phonepe')

	const serviceFee = bookingInfo.serviceFee ?? 0
	const total = bookingInfo.consultationFee + serviceFee

	const infoRows = [
		{ icon: <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />, label: 'Date:', value: bookingInfo.date },
		{ icon: <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />, label: 'Time:', value: bookingInfo.time },
		{ icon: <LocalHospital sx={{ fontSize: 16, color: 'text.secondary' }} />, label: 'Type:', value: bookingInfo.type },
		{ icon: <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />, label: 'Location:', value: bookingInfo.location },
	]

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xs"
			fullWidth
			slotProps={{
				paper: {
					sx: {
						borderRadius: '20px',
						overflow: 'hidden',
						maxHeight: '92vh',
					},
				},
			}}
		>
			{/* Header */}
			<DialogTitle
				sx={{
					bgcolor: 'primary.main',
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					py: 1.5,
					px: 2,
				}}
			>
				<IconButton size="small" onClick={onClose} sx={{ color: '#fff', mr: 0.5 }}>
					<ArrowBack fontSize="small" />
				</IconButton>
				<Typography variant="h6" fontWeight={600} fontSize={16}>
					Booking details
				</Typography>
			</DialogTitle>

			<DialogContent sx={{ p: 0, overflowY: 'auto' }}>
				{/* Doctor Info */}
				<Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box
						sx={{
							width: 44,
							height: 44,
							borderRadius: '50%',
							bgcolor: 'primary.light',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'primary.main',
							fontWeight: 700,
							fontSize: 18,
							flexShrink: 0,
						}}
					>
						{bookingInfo.doctorName.charAt(0)}
					</Box>
					<Box>
						<Typography fontWeight={600} fontSize={15}>
							{bookingInfo.doctorName}
						</Typography>
						<Typography variant="body2" color="text.secondary" fontSize={12}>
							{bookingInfo.specialty}
						</Typography>
					</Box>
				</Box>

				{/* Appointment Info Rows */}
				<Box sx={{ px: 2.5, pb: 1.5 }}>
					{infoRows.map((row) => (
						<Box
							key={row.label}
							sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}
						>
							{row.icon}
							<Typography variant="body2" color="text.secondary" sx={{ minWidth: 68 }}>
								{row.label}
							</Typography>
							<Typography variant="body2" fontWeight={500} fontSize={13}>
								{row.value}
							</Typography>
						</Box>
					))}
				</Box>

				<Divider />

				{/* Bill Details */}
				<Box sx={{ px: 2.5, py: 1.5 }}>
					<Typography fontWeight={600} fontSize={14} mb={1}>
						Bill Details
					</Typography>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
						<Typography variant="body2" color="text.secondary">
							Consultation fee:
						</Typography>
						<Typography variant="body2" fontWeight={500}>
							{formatINR(bookingInfo.consultationFee)}
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
						<Typography variant="body2" color="text.secondary">
							Service Fee & Tax
						</Typography>
						{serviceFee === 0 ? (
							<Typography variant="body2" fontWeight={600} color="success.main">
								FREE
							</Typography>
						) : (
							<Typography variant="body2" fontWeight={500}>
								{formatINR(serviceFee)}
							</Typography>
						)}
					</Box>
					<Divider sx={{ my: 1 }} />
					<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Typography fontWeight={600} fontSize={14}>
							Total Payable
						</Typography>
						<Typography fontWeight={700} fontSize={14} color="primary.main">
							{formatINR(total)}
						</Typography>
					</Box>
				</Box>

				<Divider />

				{/* Pay Now / Pay Later */}
				<Box sx={{ px: 2.5, py: 1.5 }}>
					<Typography fontWeight={600} fontSize={14} mb={1}>
						When would you like to pay?
					</Typography>
					<FormControl component="fieldset">
						<RadioGroup
							value={paymentChoice}
							onChange={(e) => setPaymentChoice(e.target.value as 'now' | 'later')}
							sx={{ gap: 0.5 }}
						>
							<FormControlLabel
								value="later"
								control={
									<Radio
										size="small"
										sx={{
											color: 'primary.main',
											'&.Mui-checked': { color: 'primary.main' },
										}}
									/>
								}
								label={
									<Typography variant="body2" fontWeight={paymentChoice === 'later' ? 600 : 400}>
										Pay Later{' '}
										<Typography component="span" variant="caption" color="text.secondary">
											(Pay at the clinic)
										</Typography>
									</Typography>
								}
							/>
							<FormControlLabel
								value="now"
								control={
									<Radio
										size="small"
										sx={{
											color: 'primary.main',
											'&.Mui-checked': { color: 'primary.main' },
										}}
									/>
								}
								label={
									<Typography variant="body2" fontWeight={paymentChoice === 'now' ? 600 : 400}>
										Pay Now
									</Typography>
								}
							/>
						</RadioGroup>
					</FormControl>
				</Box>

				{/* Payment Method - shown only if Pay Now */}
				<Collapse in={paymentChoice === 'now'} timeout={300}>
					<Divider />
					<Box sx={{ px: 2.5, py: 1.5 }}>
						<Typography fontWeight={600} fontSize={14} mb={1}>
							Payment Method
						</Typography>
						<FormControl component="fieldset" fullWidth>
							<RadioGroup
								value={selectedPayment}
								onChange={(e) => setSelectedPayment(e.target.value)}
							>
								{PAYMENT_OPTIONS.map((opt) => (
									<FormControlLabel
										key={opt.id}
										value={opt.id}
										sx={{
											mx: 0,
											px: 1.5,
											py: 0.5,
											mb: 0.5,
											borderRadius: '10px',
											border: '1px solid',
											borderColor: selectedPayment === opt.id ? 'primary.main' : 'divider',
											bgcolor: selectedPayment === opt.id ? 'primary.50' : 'transparent',
											transition: 'all 0.18s',
										}}
										control={
											<Radio
												size="small"
												sx={{
													ml: 'auto',
													order: 2,
													color: 'primary.main',
													'&.Mui-checked': { color: 'primary.main' },
												}}
											/>
										}
										label={
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, order: 1, flex: 1 }}>
												{opt.icon}
												<Typography variant="body2" fontWeight={500} fontSize={13}>
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

				{/* Footer CTA */}
				<Box
					sx={{
						px: 2.5,
						pt: 1.5,
						pb: 2.5,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 2,
						borderTop: '1px solid',
						borderColor: 'divider',
						mt: 0.5,
					}}
				>
					<Box>
						<Typography fontWeight={700} fontSize={18} color="primary.main">
							{formatINR(total)}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{paymentChoice === 'now' ? 'Pay Now' : 'Pay at Clinic'}
						</Typography>
					</Box>
					<AppButton
						label={paymentChoice === 'now' ? 'Confirm & Pay' : 'Confirm Visit'}
						loading={loading}
						onClick={onConfirm}
						borderRadius="12px"
						sx={{ px: 3, fontWeight: 600 }}
					/>
				</Box>
			</DialogContent>
		</Dialog>
	)
}
