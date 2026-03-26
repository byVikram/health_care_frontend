// src/features/patient/PatientPortalPage.tsx
import { Box, Typography, Container, Grid } from '@mui/material'
import React, { useState } from 'react'
// import MicIcon from '@mui/icons-material/Mic'
// import GridViewIcon from '@mui/icons-material/GridView'
// import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
// import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
// import SearchIcon from '@mui/icons-material/Search'
// import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AppButton from '../../components/common/Button/AppButton'

import drImage from '../../assets/Services/doctors-service.png'
// import patientImage from '../../assets/Banner/patient.png'
// import patientImage from '../../assets/Banner/banner.png'
import videoImage from '../../assets/blog-and-community/video-image.png'
import adImage from '../../assets/blog-and-community/ad-image.png'
// import AiChatBotImg from '../../assets/Banner/aichatbot.png'
import groupImage from '../../assets/blog-and-community/community-1.svg'
import blogImage from '../../assets/blog-and-community/blog-1.svg'
// import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
// import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
// import LocationOnIcon from '@mui/icons-material/LocationOn'
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import HealthQuestionsSection from '../dashboard/HealthQuestionsSection'

import AppointmentsIcon from '../../assets/quick-services/appointments.svg'
import PharmacyIcon from '../../assets/quick-services/pharmacy.svg'
import RadiologyIcon from '../../assets/quick-services/radiology.svg'
import AncilaryIcon from '../../assets/quick-services/ancilary.svg'
import LabIcon from '../../assets/quick-services/lab.svg'
import AmbulanceIcon from '../../assets/quick-services/ambulance.svg'
import BloodBankIcon from '../../assets/quick-services/blood-bank.svg'
import IcuIcon from '../../assets/quick-services/icu.svg'
import EmergencyIcon from '../../assets/quick-services/emergency.svg'
import StarIcon from '@mui/icons-material/Star'
import { customCardStyle } from '../../styles/commonStyles'

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

const appointments = [
	{
		name: 'Dr. Ashika Rao',
		specialization: 'Dental Consultation',
		rating: 4.9,
		date: 'Mon, 26 July at 02:30 PM',
		status: 'Confirmed',
		statusColor: '#4caf50',
		image: drImage,
	},
	{
		name: 'Dr. Ramesh Kumar',
		specialization: 'Cardiology Consultation',
		rating: 4.7,
		date: 'Wed, 28 July at 10:00 AM',
		status: 'Pending',
		statusColor: '#f59e0b',
		image: drImage,
	},
	{
		name: 'Dr. Priya Nair',
		specialization: 'Pediatric Consultation',
		rating: 4.8,
		date: 'Fri, 30 July at 11:00 AM',
		status: 'Confirmed',
		statusColor: '#4caf50',
		image: drImage,
	},
	{
		name: 'Dr. Suresh Babu',
		specialization: 'Neurology Consultation',
		rating: 4.6,
		date: 'Sat, 31 July at 09:00 AM',
		status: 'Cancelled',
		statusColor: '#e53935',
		image: drImage,
	},
]

export default function PatientPortalPage() {
	const [activeSlide, setActiveSlide] = useState(0)
	// const totalSlides = 4
	// const [selectedDate, setSelectedDate] = useState(2)

	return (
		<Box sx={{ bgcolor: '#f5f7fa' }}>
			{/* Patient Header */}

			<Container maxWidth="lg" sx={{ py: 3 }}>
				{/* TOP 50/50: Welcome+Services | Search+Appointments */}
				<Grid container spacing={3} alignItems="stretch" sx={{ alignItems: 'stretch' }}>
					{/* LEFT */}
					<Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', flexDirection: 'column' }}>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							{/* Video + Right Services row */}
							<Grid container spacing={2} alignItems="stretch">
								{/* Video Image with dots */}
								<Grid size={{ xs: 12, md: 9.5 }}>
									<Box sx={{ display: 'flex', flexDirection: 'column' }}>
										<Box sx={{ borderRadius: '16px', overflow: 'hidden' }}>
											<Box
												component="img"
												src={videoImage}
												alt="Video"
												sx={{
													width: '100%',
													display: 'block',
													objectFit: 'cover',
													maxHeight: '420px',
													minHeight: '320px',
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
								</Grid>

								{/* Right services: Emergency, Ambulance, Blood Bank, ICU */}
								<Grid size={{ xs: 12, md: 2.4 }}>
									<Grid
										container
										height={'100%'}
										justifyContent={'space-between'}
										sx={{ pt: { xs: 0, md: 1 } }}
									>
										{[
											{ title: 'Emergency', image: EmergencyIcon },
											{ title: 'Ambulance', image: AmbulanceIcon },
											{ title: 'Blood Bank', image: BloodBankIcon },
											{ title: 'ICU', image: IcuIcon },
										].map((s) => (
											<Grid key={s.title} size={{ xs: 6, sm: 3, md: 12 }}>
												<Box
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
															width: 42,
															height: 42,
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
											</Grid>
										))}
									</Grid>
								</Grid>
							</Grid>

							{/* Bottom 5 horizontal service icons */}
							<Grid container justifyContent={'space-between'} sx={{ pt: 1 }} alignItems="center">
								{[
									{ title: 'Appointment', image: AppointmentsIcon },
									{ title: 'Pharmacy', image: PharmacyIcon },
									{ title: 'Laboratory', image: LabIcon },
									{ title: 'Radiology', image: RadiologyIcon },
									{ title: 'Ancillary', image: AncilaryIcon },
								].map((s) => (
									<Grid key={s.title} size={{ xs: 6, sm: 3, md: 2.4 }}>
										<Box
											sx={{
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												gap: 0.8,
												cursor: 'pointer',
												'&:hover img': { transform: 'translateY(-3px)' },
												minWidth: '80px',
												width: '100%',
											}}
										>
											<Box
												component="img"
												src={s.image}
												alt={s.title}
												sx={{
													width: 42,
													height: 42,
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
									</Grid>
								))}
							</Grid>
							{/* Ad Image Slider */}
							<Grid size={{ xs: 12, md: 9.5 }}>
								<Box
									sx={{
										borderRadius: '16px',
										overflow: 'hidden',
										display: 'flex',
										flexDirection: 'column',
										// flex: 1,
										// minHeight: 220,
										bgcolor: '#fff',
									}}
								>
									<Box
										component="img"
										src={adImage}
										alt="Advertisement"
										sx={{
											// width: '100%',
											display: 'block',
											objectFit: 'cover',
											maxHeight: '420px',
											minHeight: '320px',
										}}
									/>
									{/* Slider dots */}
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'center',
											gap: 1,
											py: 1.5,
											bgcolor: '#fff',
										}}
									>
										{Array.from({ length: 4 }).map((_, i) => (
											<Box
												key={i}
												onClick={() => setActiveSlide(i)}
												sx={{
													width: i === activeSlide ? 20 : 10,
													height: 10,
													borderRadius: '5px',
													bgcolor: i === activeSlide ? '#0c7c7c' : '#d0d0d0',
													cursor: 'pointer',
													transition: 'all 0.3s ease',
												}}
											/>
										))}
									</Box>
								</Box>
							</Grid>
						</Box>
					</Grid>

					{/* RIGHT */}
					<Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
						<Box
							sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflowY: 'auto' }}
						>
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
										<Typography variant="body1" sx={{ fontWeight: 500 }}>
											Upcoming Appointments
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 500, color: '#0c7c7c' }}>
											(3)
										</Typography>
									</Box>
									<Typography
										variant="body1"
										sx={{ fontSize: '14px', color: '#0c7c7c', fontWeight: 500, cursor: 'pointer' }}
									>
										See All
									</Typography>
								</Box>

								<Grid container spacing={2}>
									{appointments.map((appt, index) => (
										<Grid size={{ xs: 12 }} key={index}>
											<Box
												sx={{
													backgroundColor: '#fff',
													borderRadius: '24px',
													boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
													transition: 'transform 0.2s, box-shadow 0.2s',
													height: '100%',
													display: 'flex',
													flexDirection: 'column',
													'&:hover': {
														transform: 'translateY(-2px)',
														boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
													},
													overflow: 'hidden',
												}}
											>
												{/* Card Content */}
												<Box
													sx={{
														...customCardStyle,
														boxShadow:
															'0 4px 6px rgba(0, 0, 0, 0.05),0 10px 15px rgba(0, 0, 0, 0.08);',
													}}
												>
													{/* Header Section */}
													<Grid container spacing={2} sx={{ mb: 2.5 }}>
														<Grid size={{ xs: 8, sm: 8, md: 7 }}>
															<Grid container spacing={1.5} alignItems="center">
																{/* Avatar */}
																<Grid size={{ xs: 4 }}>
																	<Box
																		sx={{
																			width: 48,
																			height: 48,
																			borderRadius: '50%',
																			overflow: 'hidden',
																			backgroundColor: '#f0f2f5',
																			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
																		}}
																	>
																		<Box
																			component="img"
																			src={appt.image}
																			alt={appt.name}
																			sx={{
																				width: '100%',
																				height: '100%',
																				objectFit: 'cover',
																			}}
																		/>
																	</Box>
																</Grid>

																{/* Doctor Info */}
																<Grid size={{ xs: 8 }}>
																	<Typography
																		variant="body1"
																		sx={{
																			fontWeight: 500,
																			color: '#1a2c3e',
																			fontSize: '12px',
																			lineHeight: 1.3,
																			mb: 0.5,
																		}}
																	>
																		{appt.name}
																	</Typography>
																	<Typography
																		variant="caption"
																		sx={{
																			color: '#5e6f8d',
																			fontSize: '0.75rem',
																			display: 'block',
																		}}
																	>
																		{appt.specialization}
																	</Typography>
																</Grid>
															</Grid>
														</Grid>

														{/* Status Badge */}
														<Grid size={{ xs: 4, sm: 4, md: 5 }}>
															<Box
																sx={{
																	backgroundColor: `${appt.statusColor}10`,
																	borderRadius: '20px',
																	px: 1.5,
																	py: 0.5,
																	display: 'inline-block',
																	float: 'right',
																}}
															>
																<Typography
																	sx={{
																		color: appt.statusColor,
																		fontSize: '0.7rem',
																		fontWeight: 600,
																		letterSpacing: '0.3px',
																		textTransform: 'uppercase',
																		textAlign: 'center',
																	}}
																>
																	{appt.status}
																</Typography>
															</Box>
														</Grid>
													</Grid>

													{/* Details Section */}
													<Grid container spacing={2}>
														{/* Rating */}
														<Grid size={{ xs: 2 }}>
															<Box
																sx={{
																	display: 'flex',
																	alignItems: 'center',
																	gap: 0.75,
																}}
															>
																<StarIcon
																	sx={{
																		color: '#f5b042',
																		fontSize: 16,
																	}}
																/>
																<Typography
																	sx={{
																		color: '#4a5b7a',
																		fontSize: '0.8rem',
																		fontWeight: 400,
																	}}
																>
																	{appt.rating}
																</Typography>
															</Box>
														</Grid>

														{/* Date */}
														<Grid size={{ xs: 8 }}>
															<Box
																sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}
															>
																<CalendarTodayIcon
																	sx={{ color: '#8a99b4', fontSize: 14 }}
																/>
																<Typography
																	sx={{
																		color: '#4a5b7a',
																		fontSize: '0.8rem',
																		fontWeight: 400,
																	}}
																>
																	{appt.date}
																</Typography>
															</Box>
														</Grid>
													</Grid>

													{/* Action Buttons */}
													<Grid container spacing={2} mt={2}>
														<Grid size={{ xs: 12, sm: 6 }}>
															<AppButton
																variant="outlined"
																label="Reschedule"
																fullWidth
																sx={{
																	borderRadius: '12px',
																	textTransform: 'none',
																	fontWeight: 600,
																	borderColor: '#d0d5dd',
																	color: '#2c3e50',
																	py: '4px',
																	'&:hover': {
																		borderColor: '#0f4c4c',
																		backgroundColor: '#f8fafc',
																	},
																}}
															/>
														</Grid>
														<Grid size={{ xs: 12, sm: 6 }}>
															<AppButton
																variant="contained"
																color="error"
																label="Cancel"
																fullWidth
																sx={{
																	borderRadius: '12px',
																	textTransform: 'none',
																	fontWeight: 600,
																	py: '5px',
																	boxShadow: 'none',
																	'&:hover': {
																		boxShadow: 'none',
																		backgroundColor: '#d32f2f',
																	},
																}}
															/>
														</Grid>
													</Grid>
												</Box>
											</Box>
										</Grid>
									))}
								</Grid>
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
									<Grid size={{ xs: 12, sm: 6 }} key={blog.id} sx={{ display: 'flex' }}>
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
														fontWeight: 500,
														fontSize: '16px',
														color: 'text.primary',
														lineHeight: '18px',
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
											py: 2.2,
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
									<Grid size={{ xs: 12, sm: 6 }} key={event.id} sx={{ display: 'flex' }}>
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

				{/* Health Expert Answers Section */}
				<HealthQuestionsSection />
			</Container>
		</Box>
	)
}
