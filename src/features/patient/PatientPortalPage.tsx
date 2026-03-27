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
import { PatientAppointments } from './patient/PatientAppointments'
// import SearchIcon from '@mui/icons-material/Search'
// import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AppButton from '../../components/common/Button/AppButton'

import drImage from '../../../../assets/Services/doctors-service.png'
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

export default function PatientPortalPage() {
	const [activeSlide, setActiveSlide] = useState(0)
	// const totalSlides = 4
	// const [selectedDate, setSelectedDate] = useState(2)

	return (
		<Box sx={{ bgcolor: '#f5f7fa' }}>
			{/* Patient Header */}
			{/* <Box
				sx={{
					background: 'linear-gradient(160deg, #0f5c5c 0%, #0c7c7c 60%, #0a9494 100%)',
					px: 3,
					pt: 2.5,
					pb: 2.5,
					position: 'sticky',
					top: 0,
					zIndex: 200,
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Avatar
							src={patientImage}
							sx={{ width: 56, height: 56, border: '2px solid rgba(255,255,255,0.5)' }}
						/>
						<Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Typography sx={{ color: '#4fd1c5', fontWeight: 700, fontSize: '22px' }}>
									Hello,
								</Typography>
								<Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '22px' }}>Nitin</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
								<LocationOnIcon sx={{ color: '#fff', fontSize: 15 }} />
								<Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>
									KR Market
								</Typography>
								<KeyboardArrowDownIcon sx={{ color: '#fff', fontSize: 16 }} />
							</Box>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', gap: 1 }}>
						<Box
							sx={{
								bgcolor: '#fff',
								borderRadius: '12px',
								width: 44,
								height: 44,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
							}}
						>
							<NotificationsNoneOutlinedIcon sx={{ fontSize: 22, color: '#4caf50' }} />
						</Box>
						<Box
							sx={{
								bgcolor: '#fff',
								borderRadius: '12px',
								width: 44,
								height: 44,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
							}}
						>
							<FavoriteBorderIcon sx={{ fontSize: 22, color: '#e53935' }} />
						</Box>
					</Box>
				</Box>
				<Box
					sx={{
						bgcolor: 'rgba(255,255,255,0.15)',
						borderRadius: '14px',
						px: 2,
						py: 1.2,
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						border: '1px solid rgba(255,255,255,0.3)',
					}}
				>
					<SearchIcon sx={{ color: '#fff', fontSize: 22 }} />
					<Typography sx={{ flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
						Search Doctors/Symptoms
					</Typography>
					<MicNoneOutlinedIcon sx={{ color: '#fff', fontSize: 22, cursor: 'pointer' }} />
				</Box>
			</Box> */}

			<Container maxWidth="lg" sx={{ py: 3 }}>
				{/* TOP 50/50: Welcome+Services | Search+Appointments */}
				<Grid container spacing={3} alignItems="stretch" sx={{ alignItems: 'stretch' }}>
					{/* LEFT */}
					<Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', flex: 1 }}>
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
							{/* Ad Image Slider */}
							<Box
								sx={{
									borderRadius: '16px',
									overflow: 'hidden',
									display: 'flex',
									flexDirection: 'column',
									flex: 1,
									minHeight: 280,
									bgcolor: '#fff',
								}}
							>
								<Box
									component="img"
									src={adImage}
									alt="Advertisement"
									sx={{
										width: '100%',
										height: '100%',
										display: 'block',
										objectFit: 'contain',
										objectPosition: 'center',
									}}
								/>
								{/* Slider dots */}
								<Box
									sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 1.5, bgcolor: '#fff' }}
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

				{/* Health Expert Answers Section */}
				<HealthQuestionsSection />
			</Container>
			{/* Draggable AI Chatbot Button */}
			{/* <AIChatBot /> */}
		</Box>
	)
}

// function AIChatBot() {
// 	const [pos, setPos] = React.useState({ x: window.innerWidth - 90, y: window.innerHeight - 140 })
// 	const [dragging, setDragging] = React.useState(false)
// 	const [open, setOpen] = React.useState(false)
// 	const offset = React.useRef({ x: 0, y: 0 })

// 	const onMouseDown = (e: React.MouseEvent) => {
// 		setDragging(true)
// 		offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
// 		e.preventDefault()
// 	}

// 	React.useEffect(() => {
// 		const onMouseMove = (e: MouseEvent) => {
// 			if (!dragging) return
// 			setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y })
// 		}
// 		const onMouseUp = () => setDragging(false)
// 		window.addEventListener('mousemove', onMouseMove)
// 		window.addEventListener('mouseup', onMouseUp)
// 		return () => {
// 			window.removeEventListener('mousemove', onMouseMove)
// 			window.removeEventListener('mouseup', onMouseUp)
// 		}
// 	}, [dragging])

// 	return (
// 		<>
// 			<Box
// 				onMouseDown={onMouseDown}
// 				onClick={() => !dragging && setOpen((o) => !o)}
// 				sx={{
// 					position: 'fixed',
// 					left: pos.x,
// 					top: pos.y,
// 					width: 90,
// 					height: 90,
// 					borderRadius: '50%',
// 					background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
// 					display: 'flex',
// 					alignItems: 'center',
// 					justifyContent: 'center',
// 					cursor: dragging ? 'grabbing' : 'grab',
// 					zIndex: 9999,
// 					boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
// 					userSelect: 'none',
// 					'&:hover': { transform: 'scale(1.08)' },
// 					transition: 'transform 0.2s ease',
// 				}}
// 			>
// 				<Box
// 					component="img"
// 					src={AiChatBotImg}
// 					alt="AI Chatbot"
// 					sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
// 				/>
// 			</Box>

// 			{/* Chat Panel */}
// 			{open && (
// 				<Box
// 					sx={{
// 						position: 'fixed',
// 						left: pos.x - 280,
// 						top: pos.y - 380,
// 						width: 320,
// 						height: 400,
// 						bgcolor: '#fff',
// 						borderRadius: '16px',
// 						boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
// 						zIndex: 9998,
// 						display: 'flex',
// 						flexDirection: 'column',
// 						overflow: 'hidden',
// 					}}
// 				>
// 					<Box
// 						sx={{
// 							bgcolor: 'linear-gradient(135deg, #7c3aed, #a855f7)',
// 							background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
// 							px: 2.5,
// 							py: 2,
// 							display: 'flex',
// 							alignItems: 'center',
// 							justifyContent: 'space-between',
// 						}}
// 					>
// 						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// 							<Box
// 								component="img"
// 								src={AiChatBotImg}
// 								alt="AI"
// 								sx={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
// 							/>
// 							<Box>
// 								<Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>
// 									Whisper AI
// 								</Typography>
// 								<Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
// 									Ask me anything
// 								</Typography>
// 							</Box>
// 						</Box>
// 						<Box
// 							onClick={() => setOpen(false)}
// 							sx={{ color: '#fff', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
// 						>
// 							?
// 						</Box>
// 					</Box>
// 					<Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f5f7fa' }}>
// 						<Box sx={{ bgcolor: '#e8f5e9', borderRadius: '10px', px: 2, py: 1.5, mb: 1, maxWidth: '85%' }}>
// 							<Typography sx={{ fontSize: '13px', color: '#333' }}>
// 								?? Hi! I'm your Whisper AI assistant. How can I help you today?
// 							</Typography>
// 						</Box>
// 					</Box>
// 					<Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
// 						<Box
// 							component="input"
// 							placeholder="Type a message..."
// 							sx={{
// 								flex: 1,
// 								border: '1px solid #e0e0e0',
// 								borderRadius: '8px',
// 								px: 1.5,
// 								py: 1,
// 								fontSize: '13px',
// 								outline: 'none',
// 								'&:focus': { borderColor: '#7c3aed' },
// 							}}
// 						/>
// 						<Box
// 							sx={{
// 								bgcolor: '#7c3aed',
// 								borderRadius: '8px',
// 								px: 1.5,
// 								display: 'flex',
// 								alignItems: 'center',
// 								cursor: 'pointer',
// 							}}
// 						>
// 							<Typography sx={{ color: '#fff', fontSize: '16px' }}>?</Typography>
// 						</Box>
// 					</Box>
// 				</Box>
// 			)}
// 		</>
// 	)
// }
