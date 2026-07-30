import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Box,
	Container,
	Typography,
	Card,
	Divider,
	CircularProgress,
	Avatar,
	Chip,
	Button
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AppButton from '../../components/common/Button/AppButton'
import { getAppointments } from '../doctor/doctorService'
import { Appointment } from '../../types/appointment'
import { customScrollbar } from '../../styles/commonStyles'

export default function TransportationLandingPage() {
	const navigate = useNavigate()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		setLoading(true)
		getAppointments({ variant: 'upcoming' })
			.then((res) => {
				// Filter to get upcoming clinic visits (non-video, status not completed/cancelled)
				const list = (res.data || res || []) as Appointment[]
				const clinicVisits = list.filter((appt) => {
					const isClinic = appt.appointment_mode === 'clinic visit' || appt.appointment_mode === 'clinic_visit'
					const rawStatus = typeof appt.status === 'string' ? appt.status.toLowerCase() : ''
					const isUpcoming = rawStatus !== 'completed' && rawStatus !== 'cancelled'
					return isClinic && isUpcoming
				})
				setAppointments(clinicVisits)
				setLoading(false)
			})
			.catch((err) => {
				console.error("Failed to load appointments for cabs", err)
				setError("Failed to load upcoming clinic visits.")
				setLoading(false)
			})
	}, [])

	const getRideState = (apptId: string) => {
		const onward = localStorage.getItem(`ride_${apptId}`)
		const returnRide = localStorage.getItem(`ride_return_${apptId}`)
		return {
			hasOnward: !!onward,
			hasReturn: !!returnRide,
			onwardStatus: onward ? JSON.parse(onward).status : null,
			returnStatus: returnRide ? JSON.parse(returnRide).status : null,
		}
	}

	const formatDate = (dateStr: string) => {
		const d = new Date(dateStr)
		if (isNaN(d.getTime())) return dateStr
		return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
	}

	const formatTime = (timeStr: string) => {
		if (!timeStr) return ''
		const [h, m] = timeStr.split(':')
		const hour = parseInt(h, 10)
		const ampm = hour >= 12 ? 'PM' : 'AM'
		const displayHour = hour % 12 || 12
		return `${displayHour}:${m || '00'} ${ampm}`
	}

	return (
		<Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh', overflowY: 'auto', ...customScrollbar }}>
			<Container maxWidth="md">
				{/* Premium Hero Header */}
				<Box
					sx={{
						background: 'linear-gradient(135deg, #0f4c4c, #0c7c7c)',
						borderRadius: '20px',
						p: { xs: 3, sm: 4 },
						color: '#fff',
						mb: 4,
						position: 'relative',
						overflow: 'hidden',
						boxShadow: '0 8px 32px rgba(12, 124, 124, 0.15)'
					}}
				>
					<Box sx={{ position: 'relative', zIndex: 2, maxWidth: '80%' }}>
						<Chip
							label="Transportation Services"
							size="small"
							sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, mb: 1.5 }}
						/>
						<Typography variant="h4" fontWeight={800} fontSize={{ xs: 24, sm: 30 }} mb={1}>
							Ride to Your Appointment Safely
						</Typography>
						<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
							Avoid traffic stress and parking worries. Book, update, or track professional cabs directly bundled with your appointments.
						</Typography>
					</Box>
					<DirectionsCarIcon
						sx={{
							position: 'absolute',
							right: -30,
							bottom: -20,
							fontSize: 180,
							color: 'rgba(255,255,255,0.06)',
							transform: 'rotate(-15deg)',
							zIndex: 1
						}}
					/>
				</Box>

				<Typography fontWeight={700} fontSize={16} color="text.primary" mb={2}>
					Select Upcoming Visit to Arrange Ride
				</Typography>

				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
						<CircularProgress sx={{ color: '#0c7c7c' }} />
					</Box>
				) : error ? (
					<Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
						{error}
					</Typography>
				) : appointments.length === 0 ? (
					<Card
						sx={{
							p: 4,
							textAlign: 'center',
							borderRadius: '16px',
							border: '1px dashed',
							borderColor: 'divider',
							bgcolor: 'background.paper'
						}}
					>
						<Typography fontSize={15} fontWeight={600} color="text.secondary" mb={1}>
							No Upcoming Clinic Visits Found
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
							Only in-person hospital visits are eligible for cab scheduling services.
						</Typography>
						<AppButton
							label="Find a Doctor"
							onClick={() => navigate('/doctors/search')}
							sx={{ px: 4 }}
						/>
					</Card>
				) : (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						{appointments.map((appt) => {
							const { hasOnward, hasReturn } = getRideState(appt.id)
							return (
								<Card
									key={appt.id}
									sx={{
										p: 2.5,
										borderRadius: '16px',
										border: '1.5px solid',
										borderColor: 'divider',
										bgcolor: 'background.paper',
										transition: 'all 0.2s',
										'&:hover': {
											borderColor: '#0c7c7c',
											boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
										}
									}}
								>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
										<Box sx={{ display: 'flex', gap: 2 }}>
											<Avatar sx={{ bgcolor: 'primary.light', width: 44, height: 44 }}>
												{(appt.doctor?.name ?? 'D').charAt(0)}
											</Avatar>
											<Box>
												<Typography fontWeight={700} fontSize={15} color="text.primary">
													{appt.doctor?.name ?? 'Unknown Doctor'}
												</Typography>
												<Typography variant="caption" color="primary.main" fontWeight={600} display="block">
													{appt.doctor?.speciality ?? appt.doctor?.specialization ?? 'Specialist'}
												</Typography>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
													<LocationOnIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
													<Typography fontSize={12} color="text.secondary">
														{appt.hospital?.name ?? 'Clinic Location'}
													</Typography>
												</Box>
											</Box>
										</Box>

										{/* Booking Ride Status Tag */}
										<Box>
											{hasOnward && hasReturn ? (
												<Chip label="Round Trip Scheduled" size="small" color="success" sx={{ fontWeight: 600, borderRadius: '6px' }} />
											) : hasOnward ? (
												<Chip label="Onward Ride Booked" size="small" color="warning" sx={{ fontWeight: 600, borderRadius: '6px' }} />
											) : (
												<Chip label="No Ride Scheduled" size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />
											)}
										</Box>
									</Box>

									<Divider sx={{ mb: 2 }} />

									<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
										{/* Appointment DateTime Info */}
										<Box sx={{ display: 'flex', gap: 2.5 }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
												<CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
												<Typography fontSize={12.5} color="text.secondary">
													{formatDate(appt.appointment_date)}
												</Typography>
											</Box>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
												<AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
												<Typography fontSize={12.5} color="text.secondary">
													{formatTime(appt.start_time)}
												</Typography>
											</Box>
										</Box>

										{/* Action buttons */}
										<Box sx={{ display: 'flex', gap: 1 }}>
											{!hasOnward && !hasReturn ? (
												<Button
													variant="contained"
													size="small"
													onClick={() => navigate(`/portal/appointments/${appt.id}/book-ride?type=onward`)}
													sx={{
														bgcolor: '#0c7c7c',
														color: '#fff',
														textTransform: 'none',
														fontWeight: 700,
														borderRadius: '8px',
														'&:hover': { bgcolor: '#0f4c4c' }
													}}
													endIcon={<ArrowForwardIcon fontSize="small" />}
												>
													Book Cab
												</Button>
											) : hasOnward && !hasReturn ? (
												<Box sx={{ display: 'flex', gap: 1 }}>
													<Button
														variant="outlined"
														size="small"
														onClick={() => navigate(`/portal/appointments/${appt.id}`)}
														sx={{
															borderColor: 'divider',
															color: 'text.primary',
															textTransform: 'none',
															fontWeight: 600,
															borderRadius: '8px',
															'&:hover': { borderColor: '#0c7c7c', bgcolor: 'transparent' }
														}}
													>
														Track Onward
													</Button>
													<Button
														variant="contained"
														size="small"
														onClick={() => navigate(`/portal/appointments/${appt.id}/book-ride?type=return`)}
														sx={{
															bgcolor: '#0c7c7c',
															color: '#fff',
															textTransform: 'none',
															fontWeight: 700,
															borderRadius: '8px',
															'&:hover': { bgcolor: '#0f4c4c' }
														}}
													>
														Book Return
													</Button>
												</Box>
											) : (
												<Button
													variant="outlined"
													size="small"
													onClick={() => navigate(`/portal/appointments/${appt.id}`)}
													sx={{
														borderColor: '#0c7c7c',
														color: '#0c7c7c',
														textTransform: 'none',
														fontWeight: 700,
														borderRadius: '8px',
														'&:hover': { bgcolor: 'rgba(12, 124, 124, 0.04)', borderColor: '#0c7c7c' }
													}}
												>
													Track Cabs
												</Button>
											)}
										</Box>
									</Box>
								</Card>
							)
						})}
					</Box>
				)}
			</Container>
		</Box>
	)
}
