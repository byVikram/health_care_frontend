import { useState, useEffect } from 'react'
import {
	Box,
	Typography,
	Checkbox,
	Collapse,
	CircularProgress,
	Chip,
	MenuItem,
	Select,
	FormControl
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import { getPatientAddresses, PatientAddressOut } from '../../patient/patientService'

interface TransportationWidgetProps {
	clinicAddress: string
	needRide: boolean
	setNeedRide: (val: boolean) => void
	selectedRideOption: string | null
	setSelectedRideOption: (val: string | null) => void
	isReturnRideRequested: boolean
	setIsReturnRideRequested: (val: boolean) => void
	appointmentTime?: string
	onRideSelect: (ride: {
		label: string
		price: number
		address: string
		wheelchair?: boolean
		assistance?: boolean
		companion?: boolean
		paymentMethod?: 'pay_now' | 'hospital_bill' | 'insurance'
	} | null) => void
}

export default function TransportationWidget({
	clinicAddress,
	needRide,
	setNeedRide,
	selectedRideOption,
	setSelectedRideOption,
	isReturnRideRequested,
	setIsReturnRideRequested,
	appointmentTime,
	onRideSelect,
}: TransportationWidgetProps) {
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

	const [savedAddresses, setSavedAddresses] = useState<PatientAddressOut[]>([])
	const [selectedAddressId, setSelectedAddressId] = useState<string>('')
	const [customAddress, setCustomAddress] = useState('')
	const [useCustomAddress, setUseCustomAddress] = useState(false)
	const [estimatesLoading, setEstimatesLoading] = useState(false)
	const [rideEstimates, setRideEstimates] = useState<Array<{
		type: string
		label: string
		price: number
		eta: number
	}>>([])

	const [wheelchair, setWheelchair] = useState(false)
	const [assistance, setAssistance] = useState(false)
	const [companion, setCompanion] = useState(false)
	const [paymentMethod, setPaymentMethod] = useState<'pay_now' | 'hospital_bill' | 'insurance'>('pay_now')

	// Load patient saved addresses when needRide is toggled
	useEffect(() => {
		if (needRide && savedAddresses.length === 0) {
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
		}
	}, [needRide, savedAddresses.length])

	// Calculate quotes
	useEffect(() => {
		if (needRide) {
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
			}, 800)
			return () => clearTimeout(timer)
		} else {
			setRideEstimates([])
			setSelectedRideOption(null)
			onRideSelect(null)
		}
	}, [needRide, selectedAddressId, useCustomAddress, customAddress])

	const selectedRideDetails = rideEstimates.find(e => e.type === selectedRideOption)

	// Sync back selection details to parent
	useEffect(() => {
		if (needRide && selectedRideDetails) {
			const activeAddr = useCustomAddress ? customAddress : (savedAddresses.find(a => a.id === selectedAddressId)?.address_line ?? 'Home')
			onRideSelect({
				label: selectedRideDetails.label,
				price: selectedRideDetails.price,
				address: activeAddr,
				wheelchair,
				assistance,
				companion,
				paymentMethod,
			})
		} else {
			onRideSelect(null)
		}
	}, [selectedRideOption, selectedAddressId, useCustomAddress, customAddress, needRide, rideEstimates, wheelchair, assistance, companion, paymentMethod])

	const formatINR = (amount: number) => {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			maximumFractionDigits: 0,
		}).format(amount)
	}

	return (
		<Box sx={{ px: 2.5, py: 2.5, bgcolor: needRide ? 'rgba(13, 148, 136, 0.02)' : 'transparent' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
					<DirectionsCarIcon sx={{ color: needRide ? '#0d9488' : 'text.secondary', mt: 0.25 }} />
					<Box>
						<Typography fontWeight={700} fontSize={14} color="text.primary">
							Need a ride to the clinic?
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
							Add safe, reliable round-trip or onward cabs to your visit.
						</Typography>
					</Box>
				</Box>
				<Checkbox
					checked={needRide}
					onChange={(e) => setNeedRide(e.target.checked)}
					sx={{
						color: 'divider',
						'&.Mui-checked': { color: '#0c7c7c' },
						p: 0.5,
						'&:focus': { outline: 'none' },
					}}
				/>
			</Box>

			<Collapse in={needRide} timeout={250} unmountOnExit>
				<Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
					{appointmentTime && (
						<Box sx={{ p: 1.5, bgcolor: 'rgba(12, 124, 124, 0.04)', borderRadius: '8px', border: '1px solid rgba(12, 124, 124, 0.15)' }}>
							<Typography fontSize={11.5} color="#0c7c7c" fontWeight={700}>
								⏰ Suggested Pickup Time: {getSuggestedPickupTime(appointmentTime)}
							</Typography>
							<Typography fontSize={9.5} color="text.secondary">
								Includes 30 mins estimated travel time + 30 mins hospital check-in/pre-intake buffer.
							</Typography>
						</Box>
					)}
					{/* Pickup Address Selector */}
					<Box>
						<Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>
							PICKUP LOCATION
						</Typography>
						{!useCustomAddress ? (
							<Box>
								{savedAddresses.length > 0 ? (
									<AppSelect
										value={selectedAddressId}
										onChange={(e) => setSelectedAddressId(e.target.value as string)}
										options={savedAddresses.map(addr => ({
											value: addr.id,
											label: `${addr.label}: ${addr.address_line}, ${addr.city}`
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
									+ Use a different address
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

					{/* Dropoff Address */}
					<Box>
						<Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
							DROPOFF LOCATION (CLINIC)
						</Typography>
						<Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
							📍 {clinicAddress}
						</Typography>
					</Box>

					{/* Rides list */}
					{estimatesLoading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
							<CircularProgress size={24} sx={{ color: '#0c7c7c' }} />
						</Box>
					) : (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.25, display: 'block' }}>
								SELECT RIDE CATEGORY
							</Typography>
							{rideEstimates.map((opt) => (
								<Box
									key={opt.type}
									onClick={() => setSelectedRideOption(opt.type)}
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										p: 1.5,
										borderRadius: '10px',
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

					{/* Healthcare Accessibility Toggles */}
					<Box>
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
					<Box>
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

					{/* Return Ride Option */}
					<Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
						<Checkbox
							size="small"
							checked={isReturnRideRequested}
							onChange={(e) => setIsReturnRideRequested(e.target.checked)}
							sx={{
								color: 'divider',
								'&.Mui-checked': { color: '#0c7c7c' },
								p: 0.5,
								mr: 1,
								'&:focus': { outline: 'none' },
							}}
						/>
						<Box>
							<Typography variant="body2" fontWeight={600} color="text.primary">
								Book return ride as well
							</Typography>
							<Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
								Gets you back home safely after your checkup.
							</Typography>
						</Box>
					</Box>
				</Box>
			</Collapse>
		</Box>
	)
}
