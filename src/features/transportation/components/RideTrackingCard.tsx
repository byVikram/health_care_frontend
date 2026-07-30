import { useState } from 'react'
import {
	Box,
	Typography,
	Chip,
	Divider,
	Avatar,
	IconButton,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import PhoneIcon from '@mui/icons-material/Phone'
import ShieldIcon from '@mui/icons-material/Shield'
import WarningIcon from '@mui/icons-material/Warning'
import AppButton from '../../../components/common/Button/AppButton'
import RideMapTracker from './RideMapTracker'

interface RideTrackingCardProps {
	ride: {
		id?: string
		pickup_address: string
		dropoff_address: string
		wheelchair?: boolean
		assistance?: boolean
		companion?: boolean
		payment_method?: 'pay_now' | 'hospital_bill' | 'insurance'
	}
	status: string
	onAdvance: () => void
	type: 'onward' | 'return'
}

export default function RideTrackingCard({ ride, status, onAdvance, type }: RideTrackingCardProps) {
	const [sosOpen, setSosOpen] = useState(false)
	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '16px',
				p: { xs: 2, sm: 2.5 },
				mb: 3,
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
				<Typography
					variant="overline"
					sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em' }}
				>
					{type === 'onward' ? 'Onward Ride (To Clinic)' : 'Return Ride (Back Home)'}
				</Typography>

				<Chip
					label={
						status === 'scheduled' ? 'Scheduled' :
						status === 'requesting' ? 'Matching Driver' :
						status === 'dispatched' ? 'Driver En Route' :
						status === 'in_transit' ? 'In Transit' : 'Completed'
					}
					size="small"
					sx={{
						height: 20,
						fontSize: 10,
						fontWeight: 700,
						borderRadius: '6px',
						color: '#fff',
						bgcolor:
							status === 'scheduled' ? '#ed6c02' :
							status === 'requesting' ? '#0288d1' :
							status === 'dispatched' ? '#2e7d32' :
							status === 'in_transit' ? '#0c7c7c' : 'text.disabled',
					}}
				/>
			</Box>

			<Divider sx={{ mb: 1.5 }} />

			<RideMapTracker
				status={status}
				pickupLabel={type === 'onward' ? 'Pickup' : 'Clinic'}
				dropoffLabel={type === 'onward' ? 'Clinic' : 'Home'}
			/>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Box>
					<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
						{type === 'onward' ? '📍 PICKUP ADDRESS' : '📍 PICKUP ADDRESS (CLINIC)'}
					</Typography>
					<Typography fontSize={13} fontWeight={500} color="text.primary">
						{ride.pickup_address}
					</Typography>
				</Box>

				<Box>
					<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
						{type === 'onward' ? '🏁 DESTINATION (CLINIC)' : '🏁 DESTINATION (HOME)'}
					</Typography>
					<Typography fontSize={13} fontWeight={500} color="text.primary">
						{ride.dropoff_address}
					</Typography>
				</Box>

				{/* Healthcare Alerts & Logistics Details */}
				{status !== 'completed' && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						{(ride.wheelchair || ride.assistance) && (
							<Box sx={{ bgcolor: 'rgba(12, 124, 124, 0.04)', px: 1.5, py: 1, borderRadius: '8px', border: '1.5px dashed rgba(12, 124, 124, 0.2)' }}>
								<Typography fontSize={11.5} color="#0c7c7c" fontWeight={600}>
									🏥 Hospital Porch Sync: Wheelchair & boarding assistance requested at reception desk.
								</Typography>
							</Box>
						)}
						{ride.companion && (
							<Box sx={{ bgcolor: 'rgba(2, 136, 209, 0.04)', px: 1.5, py: 1, borderRadius: '8px', border: '1.5px dashed rgba(2, 136, 209, 0.2)' }}>
								<Typography fontSize={11.5} color="#0288d1" fontWeight={600}>
									📱 Caregiver Tracking: Live location automatically shared with Nitin (Emergency Contact).
								</Typography>
							</Box>
						)}
						{ride.payment_method === 'insurance' && (
							<Box sx={{ bgcolor: 'rgba(46, 125, 50, 0.04)', px: 1.5, py: 1, borderRadius: '8px', border: '1.5px dashed rgba(46, 125, 50, 0.2)' }}>
								<Typography fontSize={11.5} color="#2e7d32" fontWeight={600}>
									🛡️ Insurance Claim: Covered under Cashless Medical Transportation (NEMT).
								</Typography>
								<Typography fontSize={10.5} color="text.secondary" sx={{ mt: 0.5 }}>
									Pre-Authorization ID: NEMT-CLAIM-{ride.id ? ride.id.slice(0, 4).toUpperCase() : '98A2'}-OK. Verified by Star Health insurance.
								</Typography>
							</Box>
						)}
						{ride.payment_method === 'hospital_bill' && (
							<Box sx={{ bgcolor: 'rgba(237, 108, 2, 0.04)', px: 1.5, py: 1, borderRadius: '8px', border: '1.5px dashed rgba(237, 108, 2, 0.2)' }}>
								<Typography fontSize={11.5} color="#ed6c02" fontWeight={600}>
									📄 Invoicing: Ride fare is bundled with your hospital discharge bill.
								</Typography>
							</Box>
						)}
					</Box>
				)}

				{/* Status Views */}
				{status === 'scheduled' && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						<Box sx={{ bgcolor: 'rgba(237, 108, 2, 0.05)', p: 1.5, borderRadius: '8px', border: '1px dashed #ed6c02' }}>
							<Typography fontSize={12} color="#ed6c02" fontWeight={500}>
								{type === 'onward'
									? 'ℹ️ Your onward ride is scheduled. Driver details will be visible here 30 minutes before pickup.'
									: 'ℹ️ Your return ride is scheduled. Cabs are matched automatically after consultation.'}
							</Typography>
						</Box>
						{type === 'return' && (
							<Box sx={{ bgcolor: 'rgba(2, 136, 209, 0.05)', p: 1.5, borderRadius: '8px', border: '1.5px dashed #0288d1' }}>
								<Typography fontSize={11.5} color="#0288d1" fontWeight={700}>
									🕒 Doctor Delay Alert: Schedule is running 15 minutes late.
								</Typography>
								<Typography fontSize={10.5} color="text.secondary">
									Your return cab matching window has been adjusted dynamically by 15 mins to prevent driver waiting fees.
								</Typography>
							</Box>
						)}
					</Box>
				)}

				{status === 'requesting' && (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(2, 136, 209, 0.05)', p: 1.5, borderRadius: '8px' }}>
						<CircularProgress size={16} sx={{ color: '#0288d1' }} />
						<Typography fontSize={12} color="#0288d1" fontWeight={500}>
							{type === 'onward' ? 'Connecting with nearby drivers...' : 'Connecting with nearby return drivers...'}
						</Typography>
					</Box>
				)}

				{(status === 'dispatched' || status === 'in_transit') && (
					<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', p: 1.5, bgcolor: 'background.default' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
							<Avatar sx={{ bgcolor: '#0c7c7c', width: 40, height: 40 }}>
								{type === 'onward' ? 'RK' : 'AM'}
							</Avatar>
							<Box sx={{ flex: 1 }}>
								<Typography fontSize={13.5} fontWeight={700} color="text.primary" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
									{type === 'onward' ? 'Rajesh Kumar' : 'Amit Mishra'}
									<Chip
										label="Care-Certified"
										size="small"
										icon={<ShieldIcon sx={{ '&&': { color: '#2e7d32', fontSize: 10 } }} />}
										sx={{
											height: 16,
											fontSize: 8.5,
											fontWeight: 700,
											bgcolor: '#e8f5e9',
											color: '#2e7d32',
											border: '1px solid #4caf50',
											borderRadius: '4px',
											'& .MuiChip-label': { px: 0.5 }
										}}
									/>
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
									<StarIcon sx={{ fontSize: 13, color: '#ffb300' }} />
									<Typography fontSize={11.5} color="text.secondary" fontWeight={500}>
										{type === 'onward'
											? '4.9 • Maruti Suzuki Dzire (KA-01-MJ-1234)'
											: '4.8 • Hyundai Xcent (KA-03-PL-5678)'}
									</Typography>
								</Box>
								<Box sx={{ mt: 0.75 }}>
									<Typography fontSize={10.5} color="#2e7d32" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
										🛡️ Certified in basic medical transfer support, CPR, and elder/mobility assistance.
									</Typography>
								</Box>
							</Box>
							{status === 'dispatched' && (
								<Box sx={{ mr: 1, textAlign: 'right' }}>
									<Typography variant="caption" color="text.secondary" display="block">
										TRIP PIN
									</Typography>
									<Typography variant="body2" fontWeight={800} color="#0c7c7c" sx={{ letterSpacing: '0.1em' }}>
										{type === 'onward' ? '4829' : '8372'}
									</Typography>
								</Box>
							)}
							<IconButton
								sx={{
									color: '#0c7c7c',
									border: '1.5px solid',
									borderColor: '#0c7c7c',
									p: 0.8,
									'&:focus': { outline: 'none' },
									'&:hover': { bgcolor: 'rgba(12, 124, 124, 0.04)' }
								}}
								onClick={() => window.open(type === 'onward' ? 'tel:+919876543210' : 'tel:+919876543211')}
							>
								<PhoneIcon sx={{ fontSize: 16 }} />
							</IconButton>
						</Box>

						<Divider sx={{ my: 1.5 }} />

						<Box>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
								<Typography fontSize={11} fontWeight={600} color="text.secondary">
									{status === 'dispatched' ? 'ARRIVING IN' : 'TRIP PROGRESS'}
								</Typography>
								<Typography fontSize={11.5} fontWeight={700} color="#0c7c7c">
									{status === 'dispatched'
										? (type === 'onward' ? '5 Mins' : '8 Mins')
										: (type === 'onward' ? 'On the Way (1.2 km left)' : 'On the Way Home')}
								</Typography>
							</Box>
							<Box sx={{ width: '100%', height: 6, bgcolor: 'divider', borderRadius: '3px', overflow: 'hidden', mb: 1.5 }}>
								<Box
									sx={{
										width: status === 'dispatched' ? '40%' : '80%',
										height: '100%',
										bgcolor: '#0c7c7c',
										borderRadius: '3px',
										transition: 'width 0.4s ease'
									}}
								/>
							</Box>

							{/* Red SOS Button */}
							<AppButton
								label="⚠️ MEDICAL SOS"
								size="small"
								onClick={() => setSosOpen(true)}
								sx={{
									width: '100%',
									py: 0.6,
									fontSize: 11.5,
									fontWeight: 700,
									bgcolor: '#d32f2f',
									color: '#fff',
									border: '1.5px solid transparent',
									'&:hover': {
										bgcolor: '#b71c1c',
									}
								}}
							/>
						</Box>
					</Box>
				)}

				{status === 'completed' && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						<Box sx={{ bgcolor: 'rgba(46, 125, 50, 0.05)', p: 1.5, borderRadius: '8px', border: '1px solid rgba(46, 125, 50, 0.2)', display: 'flex', alignItems: 'center', gap: 1 }}>
							<Typography fontSize={12} color="#2e7d32" fontWeight={600}>
								{type === 'onward' ? '✅ Arrived safely at the clinic.' : '✅ Returned safely to your home address. Thank you!'}
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5 }}>
							<Chip
								label="🧼 Vehicle Sanitized & Disinfected"
								size="small"
								sx={{
									height: 18,
									fontSize: 10,
									fontWeight: 700,
									color: '#2e7d32',
									bgcolor: 'rgba(46, 125, 50, 0.08)',
									border: '1px solid rgba(46, 125, 50, 0.2)',
									borderRadius: '4px',
									'& .MuiChip-label': { px: 0.8 }
								}}
							/>
						</Box>
					</Box>
				)}

				{status !== 'completed' && (
					<AppButton
						label={
							status === 'scheduled' ? 'Simulate Driver Dispatch' :
							status === 'requesting' ? 'Simulate Driver Assignment' :
							status === 'dispatched' ? 'Simulate Trip Start' : 'Simulate Trip Completed'
						}
						size="small"
						onClick={onAdvance}
						sx={{
							mt: 0.5,
							py: 0.8,
							fontWeight: 600,
							fontSize: 12,
							bgcolor: 'rgba(12, 124, 124, 0.08)',
							color: '#0c7c7c',
							border: '1.5px solid transparent',
							'&:hover': {
								bgcolor: 'rgba(12, 124, 124, 0.12)',
								borderColor: '#0c7c7c',
							}
						}}
					/>
				)}
			</Box>

			{/* SOS Emergency Dialog */}
			<Dialog
				open={sosOpen}
				onClose={() => setSosOpen(false)}
				maxWidth="xs"
				fullWidth
				slotProps={{ paper: { sx: { borderRadius: '16px', overflow: 'hidden' } } }}
			>
				<Box sx={{ bgcolor: '#d32f2f', color: '#fff', p: 3, textAlign: 'center' }}>
					<WarningIcon sx={{ fontSize: 48, mb: 1 }} />
					<Typography variant="h6" fontWeight={800} fontSize={18}>
						MEDICAL EMERGENCY SOS
					</Typography>
					<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mt: 0.5 }}>
						Critical safety protocols are now active.
					</Typography>
				</Box>
				<DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					<Box sx={{ bgcolor: 'rgba(211, 47, 47, 0.04)', p: 2, borderRadius: '8px', border: '1.5px dashed rgba(211, 47, 47, 0.2)' }}>
						<Typography variant="body2" fontWeight={700} color="#d32f2f" mb={0.5}>
							📍 Active GPS Coordinates:
						</Typography>
						<Typography variant="body2" fontFamily="monospace" fontWeight={600} color="text.primary">
							12.9716° N, 77.5946° E (Bengaluru, IN)
						</Typography>
						<Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
							Emergency services and caregiver Nitin have been sent this location link.
						</Typography>
					</Box>

					<Box>
						<Typography fontSize={13} fontWeight={700} color="text.primary" mb={1}>
							EMERGENCY CONTACT CHANNELS
						</Typography>
						<Button
							variant="contained"
							fullWidth
							onClick={() => window.open('tel:+919876543299')}
							sx={{
								bgcolor: '#d32f2f',
								color: '#fff',
								fontWeight: 700,
								textTransform: 'none',
								mb: 1,
								'&:hover': { bgcolor: '#b71c1c' }
							}}
						>
							📞 Call Hospital ER Hotline (+91 98765 43299)
						</Button>
						<Button
							variant="outlined"
							fullWidth
							onClick={() => alert("Ambulance interception requested! Emergency service dispatched to vehicle location.")}
							sx={{
								borderColor: '#d32f2f',
								color: '#d32f2f',
								fontWeight: 700,
								textTransform: 'none',
								'&:hover': { borderColor: '#b71c1c', bgcolor: 'rgba(211, 47, 47, 0.04)' }
							}}
						>
							🚨 Request Ambulance Intercept
						</Button>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
					<Button
						onClick={() => setSosOpen(false)}
						sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none' }}
					>
						Cancel / False Alarm
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
