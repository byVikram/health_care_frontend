import { Box, Typography, Container, Grid } from '@mui/material'
import { useState, useEffect } from 'react'
import { getAppointments } from '../doctor/doctorService'
import { Appointment } from '../../types/appointment'

import { DoctorAppointments } from '../doctor/DoctorAppointments'
// import { PatientAppointments } from '../patient/patient/PatientAppointments'
import { useAuth } from '../../hooks/useAuth'

import drImage from '../../assets/Services/doctors-service.png'
import videoImage from '../../assets/blog-and-community/video-image.png'
import adImage from '../../assets/blog-and-community/ad-image.png'
import AnswerQuestionsSection from '../dashboard/AnswerQuestionsSection'
// import DoctorNavBar from '../../components/common/Navbar/DoctorNavBar'

import AppointmentsIcon from '../../assets/quick-services/appointments.svg'
import PharmacyIcon from '../../assets/quick-services/pharmacy.svg'
import RadiologyIcon from '../../assets/quick-services/radiology.svg'
import AncilaryIcon from '../../assets/quick-services/ancilary.svg'
import LabIcon from '../../assets/quick-services/lab.svg'
import AmbulanceIcon from '../../assets/quick-services/ambulance.svg'
import BloodBankIcon from '../../assets/quick-services/blood-bank.svg'
import IcuIcon from '../../assets/quick-services/icu.svg'
import EmergencyIcon from '../../assets/quick-services/emergency.svg'

import { PatientAppointments } from '../patient/PatientAppointments'
import { USER_ROLES } from '../../constants/constants'
import UpcomingEventsSection from '../dashboard/UpcomingEventsSection'
import CommunityBlogsSection from '../dashboard/CommunityBlogsSection'

const buildWeekDays = () => {
	const today = new Date()
	const days = []
	for (let i = 0; i < 7; i += 1) {
		const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
		const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' })
		const isWeekend = d.getDay() === 0 || d.getDay() === 6
		days.push({
			day: dayLabel,
			date: String(d.getDate()),
			red: isWeekend,
			dateObj: d,
		})
	}
	return days
}

const stats = [
	{ label: 'Total Patients', value: '20' },
	{ label: 'New Patients', value: '06' },
	{ label: 'Follow up Patients', value: '03' },
	{ label: 'Emergency Patients', value: '01' },
]

export default function PortalPage() {
	const { role } = useAuth()
	const [activeSlide, setActiveSlide] = useState(0)
	const totalSlides = 4
	const [selectedDate, setSelectedDate] = useState(0)
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [apptLoading, setApptLoading] = useState(true)
	const [apptError, setApptError] = useState('')
	const [weekDays] = useState(() => buildWeekDays())
	const selectedDateObj = weekDays[selectedDate]?.dateObj ?? new Date()

	const formatDateForApi = (date: Date) => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	// const getSelectedAppointmentDate = () => formatDateForApi(selectedDateObj)

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				setApptLoading(true)
				setApptError('')
				const dateStr = formatDateForApi(weekDays[selectedDate]?.dateObj ?? new Date())
				const res = await getAppointments({ appointment_date: dateStr })
				if (res.success) {
					const items = Array.isArray(res.data) ? res.data : []
					setAppointments(items)
				} else setApptError(res.message ?? 'Failed to load appointments')
			} catch {
				setApptError('Failed to load appointments')
			} finally {
				setApptLoading(false)
			}
		}
		fetchAppointments()
	}, [selectedDate, weekDays])

	return (
		<Box sx={{ bgcolor: '#f5f7fa' }}>
			<Container maxWidth="lg" sx={{ py: 3 }}>
				{/* TOP 50/50: Welcome+Services | Search+Appointments */}
				<Grid container spacing={3} alignItems="stretch">
					{/* LEFT */}
					<Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
							<Box
								sx={{
									background: 'linear-gradient(135deg, #0f4c4c, #0c7c7c)',
									borderRadius: '8px',
									px: 2.5,
									py: 2,
									display: 'flex',
									alignItems: 'center',
									gap: 2,
								}}
							>
								<Box
									component="img"
									src={drImage}
									alt="Dr. Ashika Rao"
									sx={{
										width: 85,
										height: 85,
										borderRadius: '12px',
										objectFit: 'cover',
										flexShrink: 0,
									}}
								/>
								<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
									<Box
										sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
									>
										<Box>
											<Typography sx={{ color: '#4fd1c5', fontSize: '12px', fontWeight: 500 }}>
												Welcome
											</Typography>
											<Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '17px' }}>
												Dr. Arjun Sharma
											</Typography>
										</Box>
										<Box
											sx={{
												bgcolor: 'rgba(255,255,255,0.15)',
												borderRadius: '8px',
												px: 1.5,
												py: 0.4,
											}}
										>
											<Typography sx={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>
												ID: 143265
											</Typography>
										</Box>
									</Box>
									<Box sx={{ display: 'flex', gap: 1 }}>
										{stats.map((stat, i) => (
											<Box
												key={i}
												sx={{
													flex: 1,
													bgcolor: '#fff',
													borderRadius: '4px',
													px: 1,
													py: 0.6,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
													gap: 0.5,
												}}
											>
												<Typography
													sx={{ color: 'text.secondary', fontSize: '9px', lineHeight: 1.3 }}
												>
													{stat.label}
												</Typography>
												<Typography
													sx={{
														color: '#0c7c7c',
														fontWeight: 700,
														fontSize: '20px',
														lineHeight: 1,
													}}
												>
													{stat.value}
												</Typography>
											</Box>
										))}
									</Box>
								</Box>
							</Box>
						</Box>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', flex: 1, mt: 2 }}>
							{/* Video + Right Services row */}
							<Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
								{/* Video Image with dots */}
								<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
									<Box sx={{ borderRadius: '16px', overflow: 'hidden' }}>
										<Box
											component="img"
											src={videoImage}
											alt="Video"
											sx={{
												width: '100%',
												display: 'block',
												objectFit: 'cover',
												maxHeight: '480px',
												minHeight: '400px',
											}}
										/>
									</Box>
									{/* Slider dots */}
									<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 1.5 }}>
										{Array.from({ length: 5 }).map((_, i) => (
											<Box
												key={i}
												sx={{
													width: i === 0 ? 20 : 10,
													height: 10,
													borderRadius: '5px',
													bgcolor: i === 0 ? '#0c7c7c' : '#d0d0d0',
													transition: 'all 0.3s ease',
												}}
											/>
										))}
									</Box>
								</Box>

								{/* Right vertical services: Emergency, Ambulance, Blood Bank, ICU */}
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
									{[
										{ title: 'Emergency', image: EmergencyIcon },
										{ title: 'Ambulance', image: AmbulanceIcon },
										{ title: 'Blood Bank', image: BloodBankIcon },
										{ title: 'ICU', image: IcuIcon },
									].map((s) => (
										<Box
											key={s.title}
											sx={{
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												gap: 0.5,
												cursor: 'pointer',
												minWidth: 80,
												pb: 1,
												borderBottom: '1px solid #e0e0e0',
												'&:last-child': { borderBottom: 'none' },
												'&:hover img': { transform: 'translateY(-2px)' },
											}}
										>
											<Box
												component="img"
												src={s.image}
												alt={s.title}
												sx={{
													width: 52,
													height: 52,
													objectFit: 'contain',
													transition: 'transform 0.2s ease',
												}}
											/>
											<Typography
												sx={{
													fontSize: '12px',
													fontWeight: 600,
													color: 'text.primary',
													textAlign: 'center',
												}}
											>
												{s.title}
											</Typography>
										</Box>
									))}
								</Box>
							</Box>

							{/* Bottom 5 horizontal service icons */}
							<Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', pt: 1 }}>
								{[
									{ title: 'Appointment', image: AppointmentsIcon },
									{ title: 'Pharmacy', image: PharmacyIcon },
									{ title: 'Laboratory', image: LabIcon },
									{ title: 'Radiology', image: RadiologyIcon },
									{ title: 'Ancillary', image: AncilaryIcon },
								].map((s) => (
									<Box
										key={s.title}
										sx={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: 0.8,
											cursor: 'pointer',
											'&:hover img': { transform: 'translateY(-3px)' },
										}}
									>
										<Box
											component="img"
											src={s.image}
											alt={s.title}
											sx={{
												width: 52,
												height: 52,
												objectFit: 'contain',
												transition: 'transform 0.2s ease',
											}}
										/>
										<Typography
											sx={{
												fontSize: '12px',
												fontWeight: 600,
												color: 'text.primary',
												textAlign: 'center',
											}}
										>
											{s.title}
										</Typography>
									</Box>
								))}
							</Box>

							{/* Ad Slider */}
							<Box
								sx={{
									bgcolor: '#fff',
									borderRadius: '16px',
									overflow: 'hidden',
									flex: 1,
									maxHeight: '400px',
								}}
							>
								<Box
									component="img"
									src={adImage}
									alt="Advertisement"
									sx={{ width: '100%', display: 'block', objectFit: 'cover' }}
								/>
								<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 1.5 }}>
									{Array.from({ length: totalSlides }).map((_, i) => (
										<Box
											key={i}
											onClick={() => setActiveSlide(i)}
											sx={{
												width: i === activeSlide ? 20 : 8,
												height: 8,
												borderRadius: '4px',
												bgcolor: i === activeSlide ? '#0c7c7c' : '#d0d0d0',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
											}}
										/>
									))}
								</Box>
							</Box>
						</Box>
					</Grid>

					{/* RIGHT */}
					<Grid size={{ xs: 12, md: 6 }}>
						{role === USER_ROLES.DOCTOR && (
							<DoctorAppointments
								selectedDate={selectedDate}
								setSelectedDate={setSelectedDate}
								appointments={appointments}
								apptLoading={apptLoading}
								apptError={apptError}
								weekDays={weekDays}
								selectedDateObj={selectedDateObj}
							/>
						)}
						{role === USER_ROLES.PATIENT && <PatientAppointments />}
					</Grid>
				</Grid>

				{/* BOTTOM 50/50: Community & Blogs | Upcoming Events */}
				<Grid container spacing={3} alignItems="stretch" sx={{ mt: 1 }}>
					{/* LEFT: Community rows + Blog cards */}

					<Grid size={{ xs: 12, md: 6 }}>
						<CommunityBlogsSection variant={'column'} />
					</Grid>

					{/* RIGHT: Event rows + Featured event cards */}
					<Grid size={{ xs: 12, md: 6 }}>
						<UpcomingEventsSection variant={'column'} />
					</Grid>
				</Grid>

				{/* Answer Patients Questions Section */}
				<AnswerQuestionsSection />
			</Container>
		</Box>
	)
}
