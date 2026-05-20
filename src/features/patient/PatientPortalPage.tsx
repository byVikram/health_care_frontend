// src/features/patient/PatientPortalPage.tsx
import { Box, Typography, Container, Grid } from '@mui/material'
import React, { useState } from 'react'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import { PatientAppointments } from './PatientAppointments'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AppButton from '../../components/common/Button/AppButton'

import videoImage from '../../assets/blog-and-community/video-image.png'
import adImage from '../../assets/blog-and-community/ad-image.png'
import groupImage from '../../assets/blog-and-community/community-1.svg'
import blogImage from '../../assets/blog-and-community/blog-1.svg'
import HealthQuestionsSection from '../dashboard/HealthQuestionsSection'

import AppointmentsIcon from '../../assets/quick-services/appointments.svg'
import PharmacyIcon from '../../assets/quick-services/pharmacy.svg'
import RadiologyIcon from '../../assets/quick-services/radiology.svg'
import AncilaryIcon from '../../assets/quick-services/ancilary.svg'
import LabIcon from '../../assets/quick-services/lab.svg'

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

const carouselImages = [videoImage, adImage, videoImage, adImage, videoImage]

export default function PatientPortalPage() {
	const [activeSlide, setActiveSlide] = useState(0)

	return (
		<Box sx={{ bgcolor: '#f5f7fa' }}>
			<Container maxWidth="lg" sx={{ py: 3 }}>
				{/* TOP 50/50: Welcome+Services | Search+Appointments */}
				<Grid container spacing={3} alignItems="stretch" sx={{ alignItems: 'stretch' }}>
					{/* LEFT */}
					<Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', flex: 1 }}>

							{/* 1. Service icons row — now at the TOP */}
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

							{/* 2. Carousel image — now BELOW the service icons */}
							<Box
								sx={{
									borderRadius: '16px',
									overflow: 'hidden',
									display: 'flex',
									flexDirection: 'column',
									flex: 1,
									bgcolor: '#fff',
									position: 'relative',
								}}
							>
								<Box
									component="img"
									src={carouselImages[activeSlide]}
									alt="Carousel"
									sx={{
										width: '100%',
										flex: 1,
										display: 'block',
										objectFit: 'cover',
										minHeight: 360,
										transition: 'opacity 0.4s ease',
									}}
								/>
								{/* Carousel dots */}
								<Box
									sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 1.5, bgcolor: '#fff' }}
								>
									{carouselImages.map((_, i) => (
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

						</Box>
					</Grid>

					{/* RIGHT */}
					<Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
						<PatientAppointments />
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
