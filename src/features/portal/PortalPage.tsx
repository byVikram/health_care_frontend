import { Box, Typography, Container, Grid, Chip, Divider, InputAdornment, TextField } from '@mui/material'
import { useState, useEffect } from 'react'
import { getAppointments } from '../doctor/doctorService'
import { Appointment } from '../../types/appointment'
import MicIcon from '@mui/icons-material/Mic'
import GridViewIcon from '@mui/icons-material/GridView'
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
// import EventRepeatIcon from '@mui/icons-material/EventRepeat'
// import CallSplitIcon from '@mui/icons-material/CallSplit'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import SearchIcon from '@mui/icons-material/Search'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import HomeIcon from '@mui/icons-material/Home'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AppButton from '../../components/common/Button/AppButton'
import { DoctorAppointments } from '../doctor/DoctorAppointments'
// import { PatientAppointments } from '../patient/patient/PatientAppointments'
import { useAuth } from '../../hooks/useAuth'

import drImage from '../../assets/Services/doctors-service.png'
import videoImage from '../../assets/blog-and-community/video-image.png'
import adImage from '../../assets/blog-and-community/ad-image.png'
import groupImage from '../../assets/blog-and-community/community-1.svg'
import blogImage from '../../assets/blog-and-community/blog-1.svg'
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

import ConfirmIcon from '../../assets/icons/confirm.svg'
import RejectIcon from '../../assets/icons/reject.svg'
import RescheduleIcon from '../../assets/icons/reschedule.svg'
import ReferIcon from '../../assets/icons/refer.svg'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
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

const quickServices = [
	{ title: 'Appointments', image: AppointmentsIcon },
	{ title: 'Pharmacy', image: PharmacyIcon },
	{ title: 'Lab', image: LabIcon },
	{ title: 'Radiology', image: RadiologyIcon },
	{ title: 'Ancillary', image: AncilaryIcon },
	{ title: 'Ambulance', image: AmbulanceIcon },
	{ title: 'Blood Bank', image: BloodBankIcon },
	{ title: 'ICU', image: IcuIcon },
	{ title: 'Emergency', image: EmergencyIcon },
]

const communities = [
	{ id: 1, name: 'Diabatics Associations', location: 'Rajajinagar, Bengaluru', avatar: groupImage },
	{ id: 2, name: 'Diabatics Associations', location: 'Rajajinagar, Bengaluru', avatar: groupImage },
	{ id: 3, name: 'Diabatics Associations', location: 'Rajajinagar, Bengaluru', avatar: groupImage },
	{ id: 4, name: 'Diabatics Associations', location: 'Rajajinagar, Bengaluru', avatar: groupImage },
]

const blogs = [
	{
		id: 1,
		title: 'The Future of Digital Health: What to Expect!',
		description:
			'Explore how technology is transforming healthcare, from AI diagnostics to personalized treatment plans.',
		author: 'By Dr. Emily White',
		date: '15 May 2024',
		image: blogImage,
	},
	{
		id: 2,
		title: 'Understanding Telemedicine: Your Guide to Virtual Care',
		description:
			'A comprehensive guide to telemedicine services, benefits, and how to get started with virtual consultations.',
		author: 'By Dr. Emily White',
		date: '15 May 2024',
		image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=220&fit=crop',
	},
]

const featuredEvents = [
	{
		id: 1,
		title: 'Annual Health & Wellness Expo',
		date: 'August 10, 2024',
		location: 'City Park, Health Center',
		image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=200&fit=crop',
	},
	{
		id: 2,
		title: 'Annual Health & Wellness Expo',
		date: 'August 10, 2024',
		location: 'City Park, Health Center',
		image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=200&fit=crop',
	},
]

const eventList = [
	{ id: 1, day: '20', month: 'JUN', name: 'Free Diabetes Screening Camp', location: 'City Community Hall' },
	{ id: 2, day: '20', month: 'JUN', name: 'Online Yoga & Wellness Workshop', location: 'Virtual Event' },
	{ id: 3, day: '20', month: 'JUN', name: 'Online Yoga & Wellness Workshop', location: 'Virtual Event' },
	{ id: 4, day: '20', month: 'JUN', name: 'Online Yoga & Wellness Workshop', location: 'Virtual Event' },
]

const actionButtons = [
	{
		icon: ConfirmIcon,
		label: 'Confirm',
		bg: '#e8f5e9',
		color: '#4caf50',
	},
	{
		icon: RejectIcon,
		label: 'Reject',
		bg: '#ffeeee',
		color: '#e53935',
	},
	{
		icon: RescheduleIcon,
		label: 'Reschedule',
		bg: '#fff8e8',
		color: '#f59e0b',
	},
	{
		icon: ReferIcon,
		label: 'Refer',
		bg: '#e8f4f8',
		color: '#0c7c7c',
	},
]

export default function PortalPage() {
	const { role } = useAuth()
	const [activeSlide, setActiveSlide] = useState(0)
	const totalSlides = 4
	const [selectedDate, setSelectedDate] = useState(0)
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [apptLoading, setApptLoading] = useState(true)
	const [apptError, setApptError] = useState('')
	const weekDays = buildWeekDays()
	const selectedDateObj = weekDays[selectedDate]?.dateObj ?? new Date()

	const formatDateForApi = (date: Date) => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const getSelectedAppointmentDate = () => formatDateForApi(selectedDateObj)

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				setApptLoading(true)
				setApptError('')
				const dateStr = formatDateForApi(weekDays[selectedDate]?.dateObj ?? new Date())
				const res = await getAppointments({ appointment_date: dateStr })
				if (res.success) setAppointments(res.data)
				else setApptError(res.message ?? 'Failed to load appointments')
			} catch {
				setApptError('Failed to load appointments')
			} finally {
				setApptLoading(false)
			}
		}
		fetchAppointments()
	}, [selectedDate])
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
