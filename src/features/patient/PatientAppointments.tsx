import { Box, Typography } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import drImage from '../../../assets/Services/doctors-service.png'

export function PatientAppointments() {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflowY: 'auto' }}>
			{/* Upcoming Appointments */}
			<Box>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						mb: 2,
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Typography sx={{ fontWeight: 700, fontSize: '18px', color: 'text.primary' }}>
							Upcoming Appointments
						</Typography>
						<Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#0c7c7c' }}>
							(3)
						</Typography>
					</Box>
					<Typography
						sx={{ fontSize: '14px', color: '#0c7c7c', fontWeight: 600, cursor: 'pointer' }}
					>
						See All
					</Typography>
				</Box>

				{/* Card 1 */}
				<Box
					sx={{
						background: 'linear-gradient(135deg, #0f4c4c, #0c7c7c)',
						borderRadius: '20px',
						p: 3.5,
						mb: 2.5,
					}}
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							mb: 2,
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box
								sx={{
									width: 68,
									height: 68,
									borderRadius: '50%',
									overflow: 'hidden',
									border: '3px solid rgba(255,255,255,0.4)',
								}}
							>
								<Box
									component="img"
									src={drImage}
									alt="Dr. Ashika Rao"
									sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
								/>
							</Box>
							<Box>
								<Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>
									Dr. Ashika Rao
								</Typography>
								<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
									Dental Consultation
								</Typography>
							</Box>
						</Box>
						<Box sx={{ border: '2px solid #4caf50', borderRadius: '10px', px: 2, py: 0.6 }}>
							<Typography sx={{ color: '#4caf50', fontSize: '14px', fontWeight: 700 }}>
								Confirmed
							</Typography>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Typography sx={{ color: '#f59e0b', fontSize: '16px' }}>★</Typography>
							<Typography sx={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>4.9</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
							<CalendarTodayIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }} />
							<Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
								Mon, 26 July at 02:30 PM
							</Typography>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Box
							component="button"
							onClick={() => alert('Reschedule appointment')}
							sx={{ flex: 1, bgcolor: '#fff', border: 'none', borderRadius: '12px', py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' }, transition: 'all 0.15s ease' }}
						>
							<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary' }}>Reschedule</Typography>
						</Box>
						<Box
							component="button"
							onClick={() => alert('Cancel appointment')}
							sx={{ flex: 1, bgcolor: '#e53935', border: 'none', borderRadius: '12px', py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#c62828' }, transition: 'all 0.15s ease' }}
						>
							<Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>Cancel</Typography>
						</Box>
					</Box>
				</Box>

				{/* Card 2 */}
				<Box sx={{ background: 'linear-gradient(135deg, #0f4c4c, #0c7c7c)', borderRadius: '20px', p: 3.5, mb: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box sx={{ width: 68, height: 68, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)' }}>
								<Box component="img" src={drImage} alt="Dr. Ramesh Kumar" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
							</Box>
							<Box>
								<Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>Dr. Ramesh Kumar</Typography>
								<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Cardiology Consultation</Typography>
							</Box>
						</Box>
						<Box sx={{ border: '2px solid #f59e0b', borderRadius: '10px', px: 2, py: 0.6 }}>
							<Typography sx={{ color: '#f59e0b', fontSize: '14px', fontWeight: 700 }}>Pending</Typography>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Typography sx={{ color: '#f59e0b', fontSize: '16px' }}>★</Typography>
							<Typography sx={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>4.7</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
							<CalendarTodayIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }} />
							<Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Wed, 28 July at 10:00 AM</Typography>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Box component="button" onClick={() => alert('Reschedule appointment')} sx={{ flex: 1, bgcolor: '#fff', border: 'none', borderRadius: '12px', py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' }, transition: 'all 0.15s ease' }}>
							<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary' }}>Reschedule</Typography>
						</Box>
						<Box component="button" onClick={() => alert('Cancel appointment')} sx={{ flex: 1, bgcolor: '#e53935', border: 'none', borderRadius: '12px', py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#c62828' }, transition: 'all 0.15s ease' }}>
							<Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>Cancel</Typography>
						</Box>
					</Box>
				</Box>

				{/* Card 3 */}
				<Box sx={{ background: 'linear-gradient(135deg, #0f4c4c, #0c7c7c)', borderRadius: '20px', p: 3.5, mb: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box sx={{ width: 68, height: 68, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)' }}>
								<Box component="img" src={drImage} alt="Dr. Priya Nair" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
							</Box>
							<Box>
								<Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>Dr. Priya Nair</Typography>
								<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Pediatric Consultation</Typography>
							</Box>
						</Box>
						<Box sx={{ border: '2px solid #4caf50', borderRadius: '10px', px: 2, py: 0.6 }}>
							<Typography sx={{ color: '#4caf50', fontSize: '14px', fontWeight: 700 }}>Confirmed</Typography>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Typography sx={{ color: '#f59e0b', fontSize: '16px' }}>★</Typography>
							<Typography sx={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>4.8</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
							<CalendarTodayIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }} />
							<Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Fri, 30 July at 11:00 AM</Typography>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Box component="button" onClick={() => alert('Reschedule appointment')} sx={{ flex: 1, bgcolor: '#fff', border: 'none', borderRadius: '12px', py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' }, transition: 'all 0.15s ease' }}>
							<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary' }}>Reschedule</Typography>
						</Box>
						<Box component="button" onClick={() => alert('Cancel appointment')} sx={{ flex: 1, bgcolor: '#e53935', border: 'none', borderRadius: '12px', py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#c62828' }, transition: 'all 0.15s ease' }}>
							<Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>Cancel</Typography>
						</Box>
					</Box>
				</Box>

				{/* Card 4 */}
				<Box sx={{ background: 'linear-gradient(135deg, #0f4c4c, #0c7c7c)', borderRadius: '20px', p: 3.5, mb: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box sx={{ width: 68, height: 68, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)' }}>
								<Box component="img" src={drImage} alt="Dr. Suresh Babu" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
							</Box>
							<Box>
								<Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>Dr. Suresh Babu</Typography>
								<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Neurology Consultation</Typography>
							</Box>
						</Box>
						<Box sx={{ border: '2px solid #e53935', borderRadius: '10px', px: 2, py: 0.6 }}>
							<Typography sx={{ color: '#e53935', fontSize: '14px', fontWeight: 700 }}>Cancelled</Typography>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Typography sx={{ color: '#f59e0b', fontSize: '16px' }}>★</Typography>
							<Typography sx={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>4.6</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
							<CalendarTodayIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }} />
							<Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Sat, 31 July at 09:00 AM</Typography>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Box component="button" onClick={() => alert('Reschedule appointment')} sx={{ flex: 1, bgcolor: '#fff', border: 'none', borderRadius: '12px', py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' }, transition: 'all 0.15s ease' }}>
							<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary' }}>Reschedule</Typography>
						</Box>
						<Box component="button" onClick={() => alert('Cancel appointment')} sx={{ flex: 1, bgcolor: '#e53935', border: 'none', borderRadius: '12px', py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#c62828' }, transition: 'all 0.15s ease' }}>
							<Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>Cancel</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
