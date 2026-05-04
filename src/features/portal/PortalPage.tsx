import { Box, Typography, Container, Grid } from '@mui/material'
import { useState, useEffect } from 'react'
import { getAppointments } from '../doctor/doctorService'
import { Appointment } from '../../types/appointment'


import { DoctorAppointments } from '../doctor/DoctorAppointments'
import { useAuth } from '../../hooks/useAuth'

import drImage from '../../assets/Banner/banner.png'
import adImage from '../../assets/blog-and-community/ad-image.png'
import AnswerQuestionsSection from '../dashboard/AnswerQuestionsSection'
import videoImage from '../../assets/blog-and-community/video-image.png';
import DashboardCarousel from '../../components/common/Carousel/DashboardCarousel'
import { LookupHospital } from '../../hooks/useAuth'


import AppointmentsIcon from '../../assets/quick-services/appointments.svg'
import PharmacyIcon from '../../assets/quick-services/pharmacy.svg'
import RadiologyIcon from '../../assets/quick-services/radiology.svg'
import AncilaryIcon from '../../assets/quick-services/ancilary.svg'
import LabIcon from '../../assets/quick-services/lab.svg'

import { PatientAppointments } from '../patient/PatientAppointments'
import { USER_ROLES } from '../../constants/constants'
import UpcomingEventsSection from '../dashboard/UpcomingEventsSection'
import CommunityBlogsSection from '../dashboard/CommunityBlogsSection'
import { useDebouncedValue } from '../../utils/debounce'

const buildWeekDays = () => {
	const today = new Date()
	const days = []
	for (let i = 0; i < 8; i += 1) {
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
	{ label: 'Total Patients', value: '20', color: '#4264D0' },
	{ label: 'New Patients', value: '06', color: '#2B982B' },
	{ label: 'Follow up Patients', value: '03', color: '#EA7F06' },
	{ label: 'Emergency Patients', value: '01', color: '#DE3B40' },
]

const quickServices = [
	{ title: 'Appointment', image: AppointmentsIcon },
	{ title: 'Pharmacy', image: PharmacyIcon },
	{ title: 'Laboratory', image: LabIcon },
	{ title: 'Radiology', image: RadiologyIcon },
	{ title: 'Ancillary', image: AncilaryIcon },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PortalPage({ activeHospital = null }: { activeHospital?: LookupHospital | null }) {
	const { role, user } = useAuth()
	const [activeSlide, setActiveSlide] = useState(0)
	const totalSlides = 4
	const [selectedDate, setSelectedDate] = useState(0)
	const [activeHospitalId, setActiveHospitalId] = useState<string | null>(() =>
		localStorage.getItem('active_hospital_id')
	)
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [apptLoading, setApptLoading] = useState(true)
	const [apptError, setApptError] = useState('')
	const [weekDays] = useState(() => buildWeekDays())
	const selectedDateObj = weekDays[selectedDate]?.dateObj ?? new Date()
	const [searchQuery, setSearchQuery] = useState('')
	const debouncedQuery = useDebouncedValue(searchQuery, 300)

	const formatDateForApi = (date: Date) => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	useEffect(() => {
		const syncActiveHospital = () => {
			setActiveHospitalId(localStorage.getItem('active_hospital_id'))
		}

		const onStorage = (event: StorageEvent) => {
			if (event.key === null || event.key === 'active_hospital_id') {
				syncActiveHospital()
			}
		}

		window.addEventListener('hospital-changed', syncActiveHospital)
		window.addEventListener('storage', onStorage)

		return () => {
			window.removeEventListener('hospital-changed', syncActiveHospital)
			window.removeEventListener('storage', onStorage)
		}
	}, [])

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				setApptLoading(true)
				setApptError('')
				const dateStr = formatDateForApi(weekDays[selectedDate]?.dateObj ?? new Date())
				const res = await getAppointments({
					appointment_date: dateStr,
					search: debouncedQuery || undefined,
					hospital_id: activeHospitalId ?? undefined,
				})
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
	}, [selectedDate, weekDays, debouncedQuery, activeHospitalId])

	return (
		<Box sx={{ bgcolor: '#f5f7fa' }}>
			<Container maxWidth="lg" sx={{ py: 3 }}>
				{/* TOP 50/50: Welcome+Services | Search+Appointments */}
				<Grid container spacing={3} alignItems="flex-start">
					{/* LEFT */}
					<Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						{/* Doctor welcome banner */}
						{role === USER_ROLES.DOCTOR && (
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
									src={user?.avatar || drImage}
									alt="Doctor"
									sx={{
										width: 85,
										height: 85,
										borderRadius: '8px',
										objectFit: 'cover',
										flexShrink: 0,
									}}
								/>
								<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Typography sx={{ color: '#4fd1c5', fontSize: '16px', fontWeight: 500 }}>
											Welcome
										</Typography>
										<Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>
											{user?.name}
										</Typography>
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
													sx={{ color: stat.color, fontWeight: 700, fontSize: '20px', lineHeight: 1 }}
												>
													{stat.value}
												</Typography>
											</Box>
										))}
									</Box>
								</Box>
							</Box>
						)}

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>

							{/* 1. Quick service icons — ABOVE the carousel */}
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								{quickServices.map((s) => (
									<Box
										key={s.title}
										sx={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: 0.8,
											cursor: 'pointer',
											flex: 1,
											'&:hover img': { transform: 'translateY(-3px)' },
										}}
									>
										<Box
											component="img"
											src={s.image}
											alt={s.title}
											sx={{
												width: 40,
												height: 40,
												objectFit: 'contain',
												transition: 'transform 0.2s ease',
											}}
										/>
										<Typography
											sx={{ fontSize: '11px', fontWeight: 600, color: 'text.primary', textAlign: 'center' }}
										>
											{s.title}
										</Typography>
									</Box>
								))}
							</Box>

							{/* 2. Video carousel — BELOW the service icons */}
							<Box sx={{ borderRadius: '16px', overflow: 'hidden', minWidth: 0 }}>
								<DashboardCarousel images={[videoImage, videoImage, videoImage, videoImage]} />
							</Box>

							{/* 3. Ad slider at the bottom */}
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

					{/* RIGHT — fixed-height scrollable card, same bottom as left column */}
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
								searchQuery={searchQuery}
								setSearchQuery={setSearchQuery}
							/>
						)}
						{role === USER_ROLES.PATIENT && (
							<Box
								sx={{
									bgcolor: '#fff',
									borderRadius: '16px',
									border: '1px solid #f0f2f5',
									p: 2,
									height: '112vh',
									display: 'flex',
									flexDirection: 'column',
									overflow: 'hidden',
									boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
								}}
							>
								<PatientAppointments />
							</Box>
						)}
					</Grid>
				</Grid>

				{/* BOTTOM 50/50: Community & Blogs | Upcoming Events */}
				<Grid container spacing={3} alignItems="stretch" sx={{ mt: 3 }}>
					<Grid size={{ xs: 12, md: 6 }}>
						<CommunityBlogsSection variant={'column'} />
					</Grid>
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
