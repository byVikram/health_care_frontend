import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
	Box,
	Container,
	Typography,
	Divider,
	CircularProgress,
	Avatar,
	IconButton,
	Paper,
	Chip,
	MenuItem,
	Select,
	FormControl
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import NavigationIcon from '@mui/icons-material/Navigation'
import AppButton from '../../components/common/Button/AppButton'
import AppInput from '../../components/common/Input/AppInput'
import AppSelect from '../../components/common/Select/AppSelect'
import ConfirmModal from '../../components/common/Modal/ConfirmModal'
import { getAppointmentById } from '../../services/appointmentService'
import { getPatientAddresses, PatientAddressOut } from '../patient/patientService'
import { Appointment } from '../../types/appointment'
import { customScrollbar } from '../../styles/commonStyles'

interface RideEstimate {
	type: string
	label: string
	price: number
	eta: number
}

export default function BookRidePage() {
	const { appointmentId } = useParams<{ appointmentId: string }>()
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()

	const bookingType = searchParams.get('type') === 'return' ? 'return' : 'onward'

	const [appt, setAppt] = useState<Appointment | null>(null)
	const [apptLoading, setApptLoading] = useState(true)
	const [apptError, setApptError] = useState<string | null>(null)

	const [savedAddresses, setSavedAddresses] = useState<PatientAddressOut[]>([])
	const [selectedAddressId, setSelectedAddressId] = useState<string>('')
	const [customAddress, setCustomAddress] = useState('')
	const [useCustomAddress, setUseCustomAddress] = useState(false)

	const [selectedRideOption, setSelectedRideOption] = useState<string | null>(null)
	const [estimatesLoading, setEstimatesLoading] = useState(false)
	const [rideEstimates, setRideEstimates] = useState<RideEstimate[]>([])
	const [booking, setBooking] = useState(false)
	const [successOpen, setSuccessOpen] = useState(false)

	const [wheelchair, setWheelchair] = useState(false)
	const [assistance, setAssistance] = useState(false)
	const [companion, setCompanion] = useState(false)
	const [paymentMethod, setPaymentMethod] = useState<'pay_now' | 'hospital_bill' | 'insurance'>('pay_now')

	const getSuggestedPickupTime = (startTimeStr: string) => {
		if (!startTimeStr) return ''
		const parts = startTimeStr.split(':')
		if (parts.length < 2) return startTimeStr
		const [h, m] = parts
		let hour = parseInt(h, 10) - 1
		if (hour < 0) hour += 24
		const ampm = hour >= 12 ? 'PM' : 'AM'
		const displayHour = hour % 12 || 12
		return `${displayHour}:${m || '00'} ${ampm}`
	}

	const clinicAddress = appt?.hospital?.address ?? 'Apollo Hospital, Bengaluru'

	useEffect(() => {
		if (!appointmentId) return
		setApptLoading(true)
		getAppointmentById(appointmentId)
			.then((data) => {
				setAppt(data)
				setApptLoading(false)
			})
			.catch(() => {
				setApptError('Failed to load appointment details.')
				setApptLoading(false)
			})
	}, [appointmentId])

	useEffect(() => {
		const fetchAddresses = async () => {
			try {
				const res = await getPatientAddresses()
				if (res.success && res.data) {
					setSavedAddresses(res.data)
					const defaultAddr = res.data.find(addr => addr.is_default)
					if (defaultAddr) {
						setSelectedAddressId(defaultAddr.id)
					} else if (res.data.length > 0) {
						setSelectedAddressId(res.data[0].id)
					}
				}
			} catch (err) {
				console.error("Failed to load patient addresses", err)
			}
		}
		fetchAddresses()
	}, [])

	useEffect(() => {
		if (!apptLoading && appt) {
			setEstimatesLoading(true)
			const timer = setTimeout(() => {
				const basePrice = selectedAddressId ? 180 + (parseInt(selectedAddressId.slice(-1), 16) || 5) * 15 : 220
				setRideEstimates([
					{ type: 'economy', label: 'Budget Sedan', price: basePrice, eta: 5 },
					{ type: 'comfort', label: 'Comfort SUV', price: basePrice + 120, eta: 7 },
					{ type: 'medical', label: 'Accessible Medical Cab', price: basePrice + 200, eta: 12 }
				])
				setSelectedRideOption('economy')
				setEstimatesLoading(false)
			}, 600)
			return () => clearTimeout(timer)
		}
	}, [apptLoading, selectedAddressId, useCustomAddress, customAddress])

	const selectedRideDetails = rideEstimates.find(e => e.type === selectedRideOption)

	const handleBookRide = () => {
		if (!selectedRideDetails || !appointmentId) return
		setBooking(true)

		setTimeout(() => {
			const activeUserAddr = useCustomAddress
				? customAddress
				: (savedAddresses.find(a => a.id === selectedAddressId)?.address_line ?? 'Home')

			const mockRide = {
				appointment_id: appointmentId,
				pickup_address: bookingType === 'onward' ? activeUserAddr : clinicAddress,
				dropoff_address: bookingType === 'onward' ? clinicAddress : activeUserAddr,
				ride_provider: 'Uber',
				vehicle_type: selectedRideDetails.label,
				estimated_fare: selectedRideDetails.price,
				is_return_ride: bookingType === 'return',
				status: 'scheduled',
				wheelchair,
				assistance,
				companion,
				payment_method: paymentMethod,
			}

			const storageKey = bookingType === 'return' ? `ride_return_${appointmentId}` : `ride_${appointmentId}`
			localStorage.setItem(storageKey, JSON.stringify(mockRide))

			if (bookingType === 'onward') {
				localStorage.setItem(`ride_${appointmentId}`, JSON.stringify(mockRide))
			}

			setBooking(false)
			setSuccessOpen(true)
		}, 1000)
	}

	const formatINR = (amount: number) => {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			maximumFractionDigits: 0,
		}).format(amount)
	}

	if (apptLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
				<CircularProgress sx={{ color: '#0c7c7c' }} />
			</Box>
		)
	}

	if (apptError || !appt) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<Typography color="error">{apptError ?? 'Appointment not found'}</Typography>
				<AppButton label="Go Back" onClick={() => navigate(-1)} sx={{ mt: 2 }} />
			</Box>
		)
	}

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflowY: 'auto', py: 3, ...customScrollbar }}>
			<Container maxWidth="sm">
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
					<IconButton onClick={() => navigate(-1)} sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}>
						<ArrowBackIcon />
					</IconButton>
					<Typography fontWeight={700} fontSize={18} color="text.primary">
						{bookingType === 'return' ? 'Book Return Ride' : 'Book Ride to Clinic'}
					</Typography>
				</Box>

				<Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', mb: 3 }}>
					<Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
						<Avatar sx={{ bgcolor: 'primary.light', width: 44, height: 44 }}>
							{bookingType === 'return' ? '🏁' : '🚗'}
						</Avatar>
						<Box>
							<Typography fontWeight={700} fontSize={15} color="text.primary">
								{bookingType === 'return' ? 'Ride back home from clinic' : 'Ride to your appointment'}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								With {appt.doctor?.name ?? 'your Doctor'} on {appt.appointment_date}
							</Typography>
							{bookingType !== 'return' && appt.start_time && (
								<Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(12, 124, 124, 0.05)', borderRadius: '6px', border: '1px solid rgba(12, 124, 124, 0.15)' }}>
									<Typography fontSize={11.5} color="#0c7c7c" fontWeight={700}>
										⏰ Suggested Pickup: {getSuggestedPickupTime(appt.start_time)}
									</Typography>
									<Typography fontSize={9.5} color="text.secondary">
										Includes 30 mins travel time + 30 mins check-in/pre-intake buffer.
									</Typography>
								</Box>
							)}
						</Box>
					</Box>

					<Divider sx={{ mb: 2.5 }} />

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<Box sx={{ display: 'flex', gap: 1.5 }}>
							<NavigationIcon sx={{ color: '#0d9488', fontSize: 20, mt: 0.25 }} />
							<Box sx={{ flex: 1 }}>
								<Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
									PICKUP LOCATION
								</Typography>
								{bookingType === 'return' ? (
									<Typography fontSize={13.5} fontWeight={500} color="text.primary">
										📍 {clinicAddress}
									</Typography>
								) : (
									<Box>
										{!useCustomAddress ? (
											<Box>
												{savedAddresses.length > 0 ? (
													<AppSelect
														value={selectedAddressId}
														onChange={(e) => setSelectedAddressId(e.target.value as string)}
														options={savedAddresses.map(addr => ({
															value: addr.id,
															label: `${addr.label}: ${addr.address_line}`
														}))}
														size="small"
														sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
													/>
												) : (
													<Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 1 }}>
														No saved addresses found.
													</Typography>
												)}
												<Typography
													variant="caption"
													color="primary.main"
													onClick={() => setUseCustomAddress(true)}
													sx={{ cursor: 'pointer', fontWeight: 600, mt: 0.75, display: 'inline-block', '&:hover': { textDecoration: 'underline' } }}
												>
													+ Use a custom address
												</Typography>
											</Box>
										) : (
											<Box sx={{ position: 'relative' }}>
												<AppInput
													placeholder="Enter custom pickup address..."
													value={customAddress}
													onChange={(e) => setCustomAddress(e.target.value)}
													size="small"
													sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
												/>
												{customAddress.length > 2 && !['123 Indiranagar, Bengaluru', 'MG Road Metro Station, Bengaluru', 'Koramangala 4th Block, Bengaluru', 'Whitefield IT Park, Bengaluru'].includes(customAddress) && (
													<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', mt: 0.5, bgcolor: 'background.paper', overflow: 'hidden', position: 'absolute', width: '100%', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
														{['123 Indiranagar, Bengaluru', 'MG Road Metro Station, Bengaluru', 'Koramangala 4th Block, Bengaluru', 'Whitefield IT Park, Bengaluru'].filter(s => s.toLowerCase().includes(customAddress.toLowerCase())).map((suggestion) => (
															<Box
																key={suggestion}
																onClick={() => setCustomAddress(suggestion)}
																sx={{ p: 1, fontSize: 12, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(12, 124, 124, 0.05)', color: '#0c7c7c' }, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}
															>
																📍 {suggestion}
															</Box>
														))}
													</Box>
												)}
												{savedAddresses.length > 0 && (
													<Typography
														variant="caption"
														color="primary.main"
														onClick={() => setUseCustomAddress(false)}
														sx={{ cursor: 'pointer', fontWeight: 600, mt: 0.75, display: 'inline-block', '&:hover': { textDecoration: 'underline' } }}
													>
														Back to saved addresses
													</Typography>
												)}
											</Box>
										)}
									</Box>
								)}
							</Box>
						</Box>

						<Box sx={{ display: 'flex', gap: 1.5 }}>
							<LocationOnIcon sx={{ color: '#ef4444', fontSize: 20, mt: 0.25 }} />
							<Box sx={{ flex: 1 }}>
								<Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
									DROPOFF LOCATION
								</Typography>
								{bookingType === 'onward' ? (
									<Typography fontSize={13.5} fontWeight={500} color="text.primary">
										📍 {clinicAddress}
									</Typography>
								) : (
									<Box>
										{!useCustomAddress ? (
											<Box>
												{savedAddresses.length > 0 ? (
													<AppSelect
														value={selectedAddressId}
														onChange={(e) => setSelectedAddressId(e.target.value as string)}
														options={savedAddresses.map(addr => ({
															value: addr.id,
															label: `${addr.label}: ${addr.address_line}`
														}))}
														size="small"
														sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
													/>
												) : (
													<Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 1 }}>
														No saved addresses found.
													</Typography>
												)}
												<Typography
													variant="caption"
													color="primary.main"
													onClick={() => setUseCustomAddress(true)}
													sx={{ cursor: 'pointer', fontWeight: 600, mt: 0.75, display: 'inline-block', '&:hover': { textDecoration: 'underline' } }}
												>
													+ Use a custom address
												</Typography>
											</Box>
										) : (
											<Box sx={{ position: 'relative' }}>
												<AppInput
													placeholder="Enter custom dropoff address..."
													value={customAddress}
													onChange={(e) => setCustomAddress(e.target.value)}
													size="small"
													sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
												/>
												{customAddress.length > 2 && !['123 Indiranagar, Bengaluru', 'MG Road Metro Station, Bengaluru', 'Koramangala 4th Block, Bengaluru', 'Whitefield IT Park, Bengaluru'].includes(customAddress) && (
													<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', mt: 0.5, bgcolor: 'background.paper', overflow: 'hidden', position: 'absolute', width: '100%', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
														{['123 Indiranagar, Bengaluru', 'MG Road Metro Station, Bengaluru', 'Koramangala 4th Block, Bengaluru', 'Whitefield IT Park, Bengaluru'].filter(s => s.toLowerCase().includes(customAddress.toLowerCase())).map((suggestion) => (
															<Box
																key={suggestion}
																onClick={() => setCustomAddress(suggestion)}
																sx={{ p: 1, fontSize: 12, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(12, 124, 124, 0.05)', color: '#0c7c7c' }, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}
															>
																📍 {suggestion}
															</Box>
														))}
													</Box>
												)}
												{savedAddresses.length > 0 && (
													<Typography
														variant="caption"
														color="primary.main"
														onClick={() => setUseCustomAddress(false)}
														sx={{ cursor: 'pointer', fontWeight: 600, mt: 0.75, display: 'inline-block', '&:hover': { textDecoration: 'underline' } }}
													>
														Back to saved addresses
													</Typography>
												)}
											</Box>
										)}
									</Box>
								)}
							</Box>
						</Box>

						<Box sx={{ mt: 1 }}>
							<Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
								AVAILABLE VEHICLES
							</Typography>
							{estimatesLoading ? (
								<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
									<CircularProgress size={24} sx={{ color: '#0c7c7c' }} />
								</Box>
							) : (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
									{rideEstimates.map((opt) => (
										<Box
											key={opt.type}
											onClick={() => setSelectedRideOption(opt.type)}
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												p: 1.5,
												borderRadius: '12px',
												border: '1.5px solid',
												borderColor: selectedRideOption === opt.type ? '#0c7c7c' : 'divider',
												bgcolor: selectedRideOption === opt.type ? 'rgba(12, 124, 124, 0.04)' : 'transparent',
												cursor: 'pointer',
												transition: 'all 0.15s',
												'&:hover': { borderColor: '#0c7c7c', bgcolor: 'rgba(12, 124, 124, 0.02)' }
											}}
										>
											<Box>
												<Typography variant="body2" fontWeight={600} color="text.primary">
													{opt.label}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													ETA: {opt.eta} mins • Safe sanitized cabs
												</Typography>
											</Box>
											<Typography variant="body2" fontWeight={700} color="text.primary">
												{formatINR(opt.price)}
											</Typography>
										</Box>
									))}
								</Box>
							)}
						</Box>

						{/* Healthcare Accessibility Toggles */}
						<Box sx={{ mt: 1 }}>
							<Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
								ACCESSIBILITY & SUPPORT REQUIREMENTS
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								<Chip
									label="♿ Wheelchair Space"
									clickable
									onClick={() => setWheelchair(!wheelchair)}
									sx={{
										fontWeight: 600,
										fontSize: 12,
										borderRadius: '8px',
										bgcolor: wheelchair ? '#0c7c7c' : 'transparent',
										color: wheelchair ? '#fff' : 'text.primary',
										border: '1.5px solid',
										borderColor: wheelchair ? '#0c7c7c' : 'divider',
										'&:hover': { bgcolor: wheelchair ? '#0f4c4c' : 'rgba(0,0,0,0.04)' }
									}}
								/>
								<Chip
									label="🤝 Physical Assistance"
									clickable
									onClick={() => setAssistance(!assistance)}
									sx={{
										fontWeight: 600,
										fontSize: 12,
										borderRadius: '8px',
										bgcolor: assistance ? '#0c7c7c' : 'transparent',
										color: assistance ? '#fff' : 'text.primary',
										border: '1.5px solid',
										borderColor: assistance ? '#0c7c7c' : 'divider',
										'&:hover': { bgcolor: assistance ? '#0f4c4c' : 'rgba(0,0,0,0.04)' }
									}}
								/>
								<Chip
									label="👥 Riding with Companion"
									clickable
									onClick={() => setCompanion(!companion)}
									sx={{
										fontWeight: 600,
										fontSize: 12,
										borderRadius: '8px',
										bgcolor: companion ? '#0c7c7c' : 'transparent',
										color: companion ? '#fff' : 'text.primary',
										border: '1.5px solid',
										borderColor: companion ? '#0c7c7c' : 'divider',
										'&:hover': { bgcolor: companion ? '#0f4c4c' : 'rgba(0,0,0,0.04)' }
									}}
								/>
							</Box>
						</Box>

						{/* Healthcare Payment Coverage */}
						<Box sx={{ mt: 1 }}>
							<Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>
								TRANSIT PAYMENT COVERAGE
							</Typography>
							<FormControl fullWidth size="small">
								<Select
									value={paymentMethod}
									onChange={(e) => setPaymentMethod(e.target.value as any)}
									sx={{
										borderRadius: '10px',
										fontSize: 13,
										'& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0c7c7c' }
									}}
								>
									<MenuItem value="pay_now">💳 Pay Now (Card/UPI Online)</MenuItem>
									<MenuItem value="hospital_bill">📄 Charge to Hospital Bill (Pay at Discharge)</MenuItem>
									<MenuItem value="insurance">🏥 Claim under Health Insurance (Cashless NEMT)</MenuItem>
								</Select>
							</FormControl>
						</Box>

						<Divider sx={{ my: 1 }} />

						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Box>
								<Typography variant="caption" color="text.secondary" display="block">
									TOTAL PAYABLE
								</Typography>
								<Typography fontWeight={800} fontSize={20} color="text.primary">
									{selectedRideDetails ? formatINR(selectedRideDetails.price) : '—'}
								</Typography>
							</Box>

							<AppButton
								label={booking ? 'Booking...' : 'Confirm Cab'}
								disabled={booking || !selectedRideOption}
								onClick={handleBookRide}
								borderRadius="10px"
								sx={{ px: 4, fontWeight: 700 }}
							/>
						</Box>
					</Box>
				</Paper>
			</Container>

			<ConfirmModal
				open={successOpen}
				onClose={() => {
					setSuccessOpen(false)
					navigate(`/portal/appointments/${appointmentId}`)
				}}
				onConfirm={() => {
					setSuccessOpen(false)
					navigate(`/portal/appointments/${appointmentId}`)
				}}
				variant="success"
				title="Cab Booked Successfully"
				description={
					bookingType === 'return'
						? "Your return ride is confirmed. Driver details will be visible here 15 mins post consultation."
						: "Your onward ride is confirmed. Driver details will be updated shortly."
				}
				confirmLabel="View Ride Status"
				hideCancelButton
			/>
		</Box>
	)
}
