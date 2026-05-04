import { Box, Typography, Chip, Stack, Paper } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
// import PersonIcon from '@mui/icons-material/Person'
import StarIcon from '@mui/icons-material/Star'
import VideocamIcon from '@mui/icons-material/Videocam'
import LocationOnIcon from '@mui/icons-material/LocationOn'
// import ChevronRightIcon from '@mui/icons-material/ChevronRight'
// import MoreVertIcon from '@mui/icons-material/MoreVert'
import drImage from '../../assets/Services/doctors-service.png'

interface Appointment {
	id: number
	doctor: {
		name: string
		specialty: string
		rating: number
		imageUrl: string
		qualification: string
	}
	appointment: {
		date: string
		time: string
		dateTime: string
		duration: number
		type: 'In-person' | 'Virtual'
		status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
		statusText: string
		statusColor: string
		statusBgColor: string
	}
	location: {
		clinic: string
		address: string
		meetingLink?: string
	}
	actions: {
		canReschedule: boolean
		canCancel: boolean
		canJoin: boolean
	}
}

const appointmentsData: Appointment[] = [
	{
		id: 1,
		doctor: {
			name: 'Dr. Ashika Rao',
			specialty: 'Dental Consultation',
			rating: 4.9,
			imageUrl: drImage,
			qualification: 'BDS, MDS',
		},
		appointment: {
			date: 'Mon, 26 July',
			time: '02:30 PM',
			dateTime: '2024-07-26T14:30:00',
			duration: 30,
			type: 'In-person',
			status: 'confirmed',
			statusText: 'Confirmed',
			statusColor: '#10b981',
			statusBgColor: 'rgba(16, 185, 129, 0.1)',
		},
		location: {
			clinic: 'City Dental Care',
			address: '123 Healthcare Ave, Downtown',
		},
		actions: {
			canReschedule: true,
			canCancel: true,
			canJoin: false,
		},
	},
	{
		id: 2,
		doctor: {
			name: 'Dr. Ramesh Kumar',
			specialty: 'Cardiology Consultation',
			rating: 4.7,
			imageUrl: drImage,
			qualification: 'MD, DM Cardiology',
		},
		appointment: {
			date: 'Wed, 28 July',
			time: '10:00 AM',
			dateTime: '2024-07-28T10:00:00',
			duration: 45,
			type: 'Virtual',
			status: 'pending',
			statusText: 'Pending',
			statusColor: '#f59e0b',
			statusBgColor: 'rgba(245, 158, 11, 0.1)',
		},
		location: {
			clinic: 'Heart Care Center',
			address: '456 Medical Plaza, Westside',
			meetingLink: 'https://meet.example.com/dr-ramesh',
		},
		actions: {
			canReschedule: true,
			canCancel: true,
			canJoin: true,
		},
	},
	{
		id: 3,
		doctor: {
			name: 'Dr. Priya Nair',
			specialty: 'Pediatric Consultation',
			rating: 4.8,
			imageUrl: drImage,
			qualification: 'MBBS, MD Pediatrics',
		},
		appointment: {
			date: 'Fri, 30 July',
			time: '11:00 AM',
			dateTime: '2024-07-30T11:00:00',
			duration: 30,
			type: 'In-person',
			status: 'confirmed',
			statusText: 'Confirmed',
			statusColor: '#10b981',
			statusBgColor: 'rgba(16, 185, 129, 0.1)',
		},
		location: {
			clinic: 'Little Stars Clinic',
			address: '789 Child Care Lane, Uptown',
		},
		actions: {
			canReschedule: true,
			canCancel: true,
			canJoin: false,
		},
	},
]

export function PatientAppointments() {
	const handleReschedule = (appointment: Appointment) => {
		console.log('Reschedule appointment:', appointment)
		alert(`Reschedule appointment with ${appointment.doctor.name}`)
	}

	const handleCancel = (appointment: Appointment) => {
		console.log('Cancel appointment:', appointment)
		alert(`Cancel appointment with ${appointment.doctor.name}`)
	}

	const handleJoin = (appointment: Appointment) => {
		console.log('Join meeting:', appointment.location.meetingLink)
		window.open(appointment.location.meetingLink, '_blank')
	}

	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
			{/* Compact Header */}
			<Box sx={{ mb: 2, flexShrink: 0 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
					<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'text.primary' }}>
						Upcoming Appointments
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Chip
							label={`${appointmentsData.length}`}
							size="small"
							sx={{
								bgcolor: '#0c7c7c',
								color: 'white',
								fontWeight: 600,
								fontSize: '12px',
								height: '24px',
							}}
						/>
						<Typography
							sx={{ fontSize: '12px', color: '#0c7c7c', fontWeight: 500, cursor: 'pointer' }}
							onClick={() => alert('View all appointments')}
						>
							See All
						</Typography>
					</Box>
				</Box>
				<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
					Manage your upcoming healthcare visits
				</Typography>
			</Box>

			{/* Scrollable Appointments List */}
			<Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
				<Stack spacing={1.5}>
					{appointmentsData.map((appointment) => (
						<Paper
							key={appointment.id}
							elevation={0}
							sx={{
								borderRadius: '16px',
								bgcolor: '#ffffff',
								border: '1px solid',
								borderColor: appointment.appointment.status === 'cancelled' ? '#fee2e2' : '#f0f2f5',
								transition: 'all 0.2s ease',
								cursor: 'pointer',
								'&:hover': {
									borderColor: '#0c7c7c',
									boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
								},
							}}
						>
							{/* Status Indicator */}
							{appointment.appointment.status !== 'cancelled' && (
								<Box
									sx={{
										height: '3px',
										bgcolor: appointment.appointment.statusColor,
										borderTopLeftRadius: '16px',
										borderTopRightRadius: '16px',
									}}
								/>
							)}

							<Box sx={{ p: 1.5 }}>
								{/* Row 1: Doctor & Status */}
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
									<Box
										sx={{
											width: 48,
											height: 48,
											borderRadius: '50%',
											overflow: 'hidden',
											border: '2px solid',
											borderColor: appointment.appointment.statusColor,
											flexShrink: 0,
										}}
									>
										<Box
											component="img"
											src={appointment.doctor.imageUrl}
											alt={appointment.doctor.name}
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
												sx={{ fontWeight: 700, fontSize: '14px', color: 'text.primary' }}
											>
												{appointment.doctor.name}
											</Typography>
											<Chip
												label={appointment.appointment.statusText}
												size="small"
												sx={{
													bgcolor: appointment.appointment.statusBgColor,
													color: appointment.appointment.statusColor,
													fontWeight: 600,
													fontSize: '10px',
													height: '22px',
													borderRadius: '8px',
												}}
											/>
										</Box>
										<Typography sx={{ fontSize: '11px', color: 'text.secondary', mb: 0.5 }}>
											{appointment.doctor.specialty}
										</Typography>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
												<StarIcon sx={{ color: '#fbbf24', fontSize: '12px' }} />
												<Typography
													sx={{ fontWeight: 600, fontSize: '11px', color: 'text.primary' }}
												>
													{appointment.doctor.rating}
												</Typography>
											</Box>
											<Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>
												• {appointment.doctor.qualification}
											</Typography>
										</Box>
									</Box>
								</Box>

								{/* Row 2: Date & Time */}
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
										<CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: '12px' }} />
										<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
											{appointment.appointment.date}
										</Typography>
									</Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
										<AccessTimeIcon sx={{ color: 'text.secondary', fontSize: '12px' }} />
										<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
											{appointment.appointment.time}
										</Typography>
									</Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
										{appointment.appointment.type === 'Virtual' ? (
											<VideocamIcon sx={{ color: 'text.secondary', fontSize: '12px' }} />
										) : (
											<LocationOnIcon sx={{ color: 'text.secondary', fontSize: '12px' }} />
										)}
										<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
											{appointment.appointment.type}
										</Typography>
									</Box>
								</Box>

								{/* Row 3: Location/Clinic (Compact) */}
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
										{appointment.location.clinic} • {appointment.location.address.split(',')[0]}
									</Typography>
								</Box>

								{/* Row 4: Action Buttons (Compact) */}
								<Box sx={{ display: 'flex', gap: 1 }}>
									{appointment.actions.canJoin && (
										<Box
											component="button"
											onClick={() => handleJoin(appointment)}
											sx={{
												flex: 1,
												background: 'linear-gradient(135deg, #0f4c4c 0%, #0c7c7c 100%)',
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
													boxShadow: '0 4px 8px rgba(12, 124, 124, 0.2)',
												},
											}}
										>
											<VideocamIcon sx={{ fontSize: '12px', color: '#fff' }} />
											<Typography sx={{ fontWeight: 600, fontSize: '11px', color: '#fff' }}>
												Join
											</Typography>
										</Box>
									)}

									{appointment.actions.canReschedule && (
										<Box
											component="button"
											onClick={() => handleReschedule(appointment)}
											sx={{
												flex: 1,
												bgcolor: '#fff',
												border: '1px solid #e2e8f0',
												borderRadius: '10px',
												py: 0.75,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												gap: 0.5,
												cursor: 'pointer',
												transition: 'all 0.2s ease',
												'&:hover': {
													bgcolor: '#f8fafc',
													borderColor: '#0c7c7c',
												},
											}}
										>
											<Typography
												sx={{ fontWeight: 500, fontSize: '11px', color: 'text.primary' }}
											>
												Reschedule
											</Typography>
										</Box>
									)}

									{appointment.actions.canCancel && (
										<Box
											component="button"
											onClick={() => handleCancel(appointment)}
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
												'&:hover': {
													bgcolor: '#fef2f2',
													borderColor: '#ef4444',
												},
											}}
										>
											<Typography sx={{ fontWeight: 500, fontSize: '11px', color: '#ef4444' }}>
												Cancel
											</Typography>
										</Box>
									)}
								</Box>
							</Box>
						</Paper>
					))}
				</Stack>
			</Box>
		</Box>
	)
}
