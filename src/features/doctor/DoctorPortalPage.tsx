// src/features/doctor/DoctorPortalPage.tsx
import { Box, Typography, Container, Grid, Chip, Divider, InputAdornment, TextField } from '@mui/material'
import { useState, useEffect } from 'react'
import { getAppointments } from './doctorService'
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

export default function DoctorPortalPage() {
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
				const res = await getAppointments({ appointment_date: getSelectedAppointmentDate() })
				if (res.success) setAppointments(res.data)
				else setApptError(res.message)
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
					<Grid size={{ xs: 12, md: 6 }}>
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
												Dr. Ashika Rao
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

							{/* Quick Services � 5 per row = 2 rows */}
							<Box
								mt={2}
								sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 2.5, justifyContent: 'center' }}
							>
								{quickServices.map((service) => (
									<Box
										key={service.title}
										sx={{
											width: '20%',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: 0.8,
											cursor: 'pointer',
											'&:hover img': {
												transform: 'translateY(-3px)',
												filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.20))',
											},
										}}
									>
										<Box
											component="img"
											src={service.image}
											alt={service.title}
											sx={{
												width: 42,
												height: 42,
												objectFit: 'contain',
												transition: 'transform 0.2s ease, filter 0.2s ease',
											}}
										/>
										<Typography
											align="center"
											sx={{ fontWeight: 700, color: 'text.primary', fontSize: '12px' }}
										>
											{service.title}
										</Typography>
									</Box>
								))}
							</Box>

							{/* Video Image */}
							<Box sx={{ borderRadius: '16px', overflow: 'hidden', maxHeight: '300px' }}>
								<Box
									component="img"
									src={videoImage}
									alt="Video"
									sx={{ width: '100%', display: 'block', objectFit: 'cover' }}
								/>
							</Box>

							{/* Community / Blogs / Events Nav */}
							<Box
								sx={{
									p: 2,
									display: 'flex',
									justifyContent: 'space-around',
									alignItems: 'center',
								}}
							>
								{[
									{ icon: <PeopleAltIcon sx={{ fontSize: 26 }} />, label: 'Community' },
									{ icon: <GridViewIcon sx={{ fontSize: 26 }} />, label: 'Blogs' },
									{ icon: <MicIcon sx={{ fontSize: 26 }} />, label: 'Events' },
								].map((item, i) => (
									<Box
										key={i}
										sx={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: 0.5,
											cursor: 'pointer',
											color: i === 0 ? '#0c7c7c' : 'text.secondary',
										}}
									>
										{item.icon}
										<Typography sx={{ fontSize: '12px', fontWeight: i === 0 ? 700 : 400 }}>
											{item.label}
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
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
							<Box>
								<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary', mb: 1.5 }}>
									Search Patient
								</Typography>
								<TextField
									fullWidth
									placeholder="Search Patient ID, Name..."
									size="small"
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
											</InputAdornment>
										),
										endAdornment: (
											<InputAdornment position="end">
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													<MicNoneOutlinedIcon
														sx={{ fontSize: 20, color: '#0c7c7c', cursor: 'pointer' }}
													/>
													<Box sx={{ width: '1px', height: '18px', bgcolor: '#e0e0e0' }} />
													<QrCodeScannerIcon
														sx={{ fontSize: 20, color: '#0c7c7c', cursor: 'pointer' }}
													/>
												</Box>
											</InputAdornment>
										),
									}}
									sx={{ '& fieldset': { borderRadius: '10px' } }}
								/>
							</Box>
							<Box sx={{ overflowY: 'auto', flex: 1 }}>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										mb: 2,
									}}
								>
									<Typography sx={{ fontWeight: 700, fontSize: '17px', color: 'text.primary' }}>
										Today's Appointments
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
										<Typography sx={{ fontSize: '13px', color: '#0c7c7c', fontWeight: 600 }}>
											{selectedDateObj.toLocaleDateString('en-US', {
												month: 'long',
												year: 'numeric',
											})}
										</Typography>
										<ChevronRightIcon sx={{ fontSize: 18, color: '#0c7c7c' }} />
									</Box>
								</Box>
								<Box sx={{ display: 'flex', gap: 0.8, mb: 2, alignItems: 'center' }}>
									<ChevronLeftIcon
										sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }}
									/>
									{weekDays.map((d, i) => (
										<Box
											key={i}
											onClick={() => setSelectedDate(i)}
											sx={{
												flex: 1,
												textAlign: 'center',
												py: 0.8,
												borderRadius: '10px',
												bgcolor: selectedDate === i ? '#0c7c7c' : 'transparent',
												cursor: 'pointer',
												transition: 'background 0.2s',
												'&:hover': {
													bgcolor: selectedDate === i ? '#0c7c7c' : 'rgba(12,124,124,0.08)',
												},
											}}
										>
											<Typography
												sx={{
													fontSize: '9px',
													color:
														selectedDate === i ? 'rgba(255,255,255,0.8)' : 'text.secondary',
												}}
											>
												{d.day}
											</Typography>
											<Typography
												sx={{
													fontSize: '14px',
													fontWeight: 700,
													color:
														selectedDate === i
															? '#fff'
															: d.red
																? '#e53935'
																: 'text.primary',
												}}
											>
												{d.date}
											</Typography>
										</Box>
									))}
									<ChevronRightIcon
										sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }}
									/>
								</Box>
								<Divider sx={{ mb: 2 }} />
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
									{apptLoading &&
										Array.from({ length: 5 }).map((_, i) => <AppSkeleton key={i} height={90} />)}

									{appointments.map((apt) => (
										<Box
											key={apt.id}
											sx={{
												p: 1.5,
												borderRadius: '12px',
												border:
													apt.status === 'cancelled'
														? '1px solid #f5c6c6'
														: '1px solid #e0e0e0',
												bgcolor: apt.status === 'cancelled' ? '#fff5f5' : '#fff',
												display: 'flex',
												alignItems: 'center',
												gap: 1.5,
											}}
										>
											<Box
												sx={{
													width: 30,
													height: 30,
													borderRadius: '6px',
													bgcolor: apt.status === 'cancelled' ? '#f5c6c6' : '#e8f5e9',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													flexShrink: 0,
												}}
											>
												<HomeIcon
													sx={{
														fontSize: 17,
														color: apt.status === 'cancelled' ? '#b0b0b0' : '#0c7c7c',
													}}
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														gap: 0.8,
														mb: 0.3,
														flexWrap: 'wrap',
													}}
												>
													<Typography
														sx={{
															fontWeight: 600,
															fontSize: '13px',
															color:
																apt.status === 'cancelled'
																	? 'text.secondary'
																	: 'text.primary',
														}}
													>
														{apt.patient.name}
													</Typography>
													<Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>
														{/* ({shortId}) */}
													</Typography>
													<Chip
														label={apt.status}
														size="small"
														sx={{
															fontSize: '9px',
															height: 16,
															bgcolor: apt.status === 'cancelled' ? '#ffeeee' : '#fff8e8',
															color: apt.status === 'cancelled' ? '#e53935' : '#f59e0b',
															fontWeight: 600,
														}}
													/>
												</Box>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
													<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
														{apt.appointment_mode}
													</Typography>
													<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
														|
													</Typography>
													<AccessTimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
													<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
														{apt.appointment_time}
													</Typography>
												</Box>
											</Box>
											{apt.status === 'cancelled' ? (
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														gap: 1,
														bgcolor: '#ffe0e0',
														borderRadius: '8px',
														px: 1.5,
														py: 0.8,
													}}
												>
													<CancelOutlinedIcon sx={{ fontSize: 16, color: '#e53935' }} />
													<Typography
														sx={{ fontSize: '10px', color: '#e53935', fontWeight: 600 }}
													>
														Patient has canceled the appointment
													</Typography>
												</Box>
											) : (
												<Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
													{actionButtons.map((action, i) => (
														<Box>
															<Box
																key={i}
																sx={{
																	display: 'flex',
																	flexDirection: 'column',
																	alignItems: 'center',
																	gap: 0.4,
																	cursor: 'pointer',
																	bgcolor: action.bg,
																	borderRadius: '8px',
																	px: 1,
																	py: 1,
																	minWidth: 28,
																	transition: 'opacity 0.2s',
																	'&:hover': { opacity: 0.75 },
																}}
															>
																<img
																	src={action.icon}
																	width={16}
																	height={16}
																	alt={action.label}
																/>
															</Box>
															<Typography
																sx={{
																	mt: 0.4,
																	fontSize: '10px',
																	fontWeight: 400,
																	textAlign: 'center',
																}}
															>
																{action.label}
															</Typography>
														</Box>
													))}
												</Box>
											)}
											<ChevronRightIcon
												sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }}
											/>
										</Box>
									))}
								</Box>
							</Box>
						</Box>
					</Grid>
				</Grid>

				{/* BOTTOM 50/50: Community & Blogs | Upcoming Events */}
				<Grid container spacing={3} alignItems="stretch" sx={{ mt: 1 }}>
					{/* LEFT: Community rows + Blog cards */}
					<Grid size={{ xs: 12, md: 6 }}>
						<Box
							sx={{
								height: '100%',
								boxSizing: 'border-box',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Typography sx={{ fontWeight: 700, fontSize: '18px', mb: 2, color: 'text.primary' }}>
								Community & Blogs
							</Typography>

							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
								{communities.map((c) => (
									<Box
										key={c.id}
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 1.5,
											borderRadius: '12px',
											px: 2,
											py: 1.6,
											cursor: 'pointer',
											boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.08)',
											border: '0px',
										}}
									>
										<Box
											component="img"
											src={c.avatar}
											alt={c.name}
											sx={{
												width: 52,
												height: 52,
												borderRadius: '50%',
												objectFit: 'cover',
												flexShrink: 0,
											}}
										/>
										<Box sx={{ flex: 1 }}>
											<Typography
												sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary' }}
											>
												{c.name}
											</Typography>
											<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
												{c.location}
											</Typography>
										</Box>
										<AppButton
											variant="outlined"
											label="View Community"
											borderRadius="30px"
											sx={{
												fontSize: '10px',
												px: 2,
												py: 0.6,
												fontWeight: '600',
												border: '0px',
												bgcolor: '#EDF1F1',
												color: 'text.primary',
												whiteSpace: 'nowrap',
											}}
										/>
									</Box>
								))}
							</Box>
							<Grid container spacing={2} sx={{ flex: 1, alignContent: 'stretch' }}>
								{blogs.map((blog) => (
									<Grid size={{ xs: 6 }} key={blog.id} sx={{ display: 'flex' }}>
										<Box
											sx={{
												bgcolor: '#fff',
												border: '1px solid #e0e0e0',
												borderRadius: '14px',
												overflow: 'hidden',
												display: 'flex',
												flexDirection: 'column',
												flex: 1,
												'&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.10)' },
											}}
										>
											<Box sx={{ height: 160, overflow: 'hidden' }}>
												<Box
													component="img"
													src={blog.image}
													alt={blog.title}
													sx={{
														width: '100%',
														height: '100%',
														objectFit: 'cover',
														transition: 'transform 0.3s ease',
														'&:hover': { transform: 'scale(1.03)' },
													}}
												/>
											</Box>
											<Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
												<Typography
													sx={{
														fontWeight: 700,
														fontSize: '13px',
														color: 'text.primary',
														lineHeight: 1.4,
													}}
												>
													{blog.title}
												</Typography>
												<Typography
													sx={{ fontSize: '11px', color: 'text.secondary', lineHeight: 1.5 }}
												>
													{blog.description}
												</Typography>
												<Typography
													sx={{
														fontSize: '12px',
														color: '#0c7c7c',
														fontWeight: 600,
														cursor: 'pointer',
													}}
												>
													Read More
												</Typography>
												<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
													<Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>
														{blog.author}
													</Typography>
													<Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>
														{blog.date}
													</Typography>
												</Box>
											</Box>
										</Box>
									</Grid>
								))}
							</Grid>
						</Box>
					</Grid>

					{/* RIGHT: Event rows + Featured event cards */}
					<Grid size={{ xs: 12, md: 6 }}>
						<Box
							sx={{
								height: '100%',
								boxSizing: 'border-box',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Typography sx={{ fontWeight: 700, fontSize: '18px', mb: 2, color: 'text.primary' }}>
								Upcoming Events
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
								{eventList.map((event) => (
									<Box
										key={event.id}
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 2,
											border: '1px solid #e0e0e0',
											borderRadius: '12px',
											px: 2,
											py: 1.2,
											cursor: 'pointer',
											'&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
										}}
									>
										<Box
											sx={{
												minWidth: 44,
												textAlign: 'center',
												bgcolor: '#f0f4f8',
												borderRadius: '8px',
												py: 0.6,
												px: 1,
											}}
										>
											<Typography
												sx={{
													fontWeight: 700,
													fontSize: '16px',
													color: '#0c7c7c',
													lineHeight: 1,
												}}
											>
												{event.day}
											</Typography>
											<Typography sx={{ fontSize: '10px', color: '#0c7c7c', fontWeight: 600 }}>
												{event.month}
											</Typography>
										</Box>
										<Box sx={{ flex: 1 }}>
											<Typography
												sx={{ fontWeight: 600, fontSize: '13px', color: 'text.primary' }}
											>
												{event.name}
											</Typography>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
												<LocationOnOutlinedIcon
													sx={{ fontSize: 12, color: 'text.secondary' }}
												/>
												<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
													{event.location}
												</Typography>
											</Box>
										</Box>
										<ChevronRightIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
									</Box>
								))}
							</Box>
							<Grid container spacing={2} sx={{ flex: 1, alignContent: 'stretch' }}>
								{featuredEvents.map((event) => (
									<Grid size={{ xs: 6 }} key={event.id} sx={{ display: 'flex' }}>
										<Box
											sx={{
												bgcolor: '#fff',
												border: '1px solid #e0e0e0',
												borderRadius: '14px',
												overflow: 'hidden',
												display: 'flex',
												flexDirection: 'column',
												// flex: 1,
												'&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.10)' },
											}}
										>
											<Box
												component="img"
												src={event.image}
												alt={event.title}
												sx={{ width: '100%', height: 200, objectFit: 'cover' }}
											/>
											<Box
												sx={{
													p: 1.5,
													display: 'flex',
													flexDirection: 'column',
													gap: 0.6,
													flex: 1,
													justifyContent: 'space-between',
												}}
											>
												<Typography
													sx={{
														fontWeight: 700,
														fontSize: '13px',
														color: 'text.primary',
														lineHeight: 1.3,
													}}
												>
													{event.title}
												</Typography>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													<CalendarTodayIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
													<Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>
														{event.date}
													</Typography>
												</Box>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
													<LocationOnOutlinedIcon
														sx={{ fontSize: 11, color: 'text.secondary' }}
													/>
													<Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>
														{event.location}
													</Typography>
												</Box>
												<AppButton
													label="Register Now"
													sx={{
														bgcolor: '#0c7c7c',
														color: '#fff',
														borderRadius: '6px',
														fontSize: '11px',
														py: 0.5,
														width: '100%',
														'&:hover': { bgcolor: '#0f4c4c' },
													}}
												/>
											</Box>
										</Box>
									</Grid>
								))}
							</Grid>
						</Box>
					</Grid>
				</Grid>

				{/* Answer Patients Questions Section */}
				<AnswerQuestionsSection />
			</Container>
		</Box>
	)
}
