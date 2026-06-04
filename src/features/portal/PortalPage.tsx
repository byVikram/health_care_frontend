import { Box, Typography, Container, Grid, Popper, Paper, keyframes, Grow } from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAppointments } from '../doctor/doctorService'
import { Appointment } from '../../types/appointment'

import { DoctorAppointments } from '../doctor/DoctorAppointments'
import { useAuth } from '../../hooks/useAuth'

import drImage from '../../assets/Banner/banner.png'
import adImage from '../../assets/blog-and-community/ad-image.png'
import AnswerQuestionsSection from '../dashboard/AnswerQuestionsSection'
import videoFile from '../../assets/blog-and-community/video.mp4'
// import { LookupHospital } from '../../hooks/useAuth'

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
import { useDebouncedValue } from '../../utils/debounce'
import { ROUTES } from '../../constants/routes'

import OrderDetails from '../Pharmacy/components/OrderSection'
import { customCardStyle } from '../../styles/commonStyles'

// ----------------------------- Video Slide Component -----------------------------
interface VideoSlideProps {
	src: string
	width: number
	onPlayStateChange: (isPlaying: boolean) => void
	onVideoFinish: () => void
}

const VideoSlide: React.FC<VideoSlideProps> = ({ src, width, onPlayStateChange, onVideoFinish }) => {
	const [isPlaying, setIsPlaying] = useState(false)
	const videoRef = useRef<HTMLVideoElement>(null)

	const handlePlay = async () => {
		if (!videoRef.current) return
		setIsPlaying(true)
		onPlayStateChange(true)
		await videoRef.current.play()
	}

	const handlePause = () => {
		if (!videoRef.current) return
		setIsPlaying(false)
		onPlayStateChange(false)
		videoRef.current.pause()
	}

	const handleVideoEnd = () => {
		setIsPlaying(false)
		onPlayStateChange(false)
		onVideoFinish()
	}

	return (
		<Box
			sx={{
				position: 'relative',
				width: width,
				flexShrink: 0,
				borderRadius: '16px',
				overflow: 'hidden',
				height: 300, // increased height
				bgcolor: '#000',
			}}
		>
			<video
				ref={videoRef}
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
				}}
				onEnded={handleVideoEnd}
			/>

			{!isPlaying && (
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						bgcolor: 'rgba(0,0,0,0.3)',
						cursor: 'pointer',
					}}
					onClick={handlePlay}
				>
					<Box
						sx={{
							width: 64,
							height: 64,
							borderRadius: '50%',
							bgcolor: 'rgba(0,0,0,0.6)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Box
							sx={{
								width: 0,
								height: 0,
								borderLeft: '18px solid white',
								borderTop: '10px solid transparent',
								borderBottom: '10px solid transparent',
								marginLeft: '5px',
							}}
						/>
					</Box>
				</Box>
			)}

			{isPlaying && (
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						cursor: 'pointer',
					}}
					onClick={handlePause}
				/>
			)}
		</Box>
	)
}

// ----------------------------- Ad Slide -----------------------------
const AdSlide: React.FC<{ width: number; src: string }> = ({ width, src }) => (
	<Box
		component="img"
		src={src}
		sx={{
			width: width,
			height: 300, // increased height to match video
			objectFit: 'cover',
			flexShrink: 0,
		}}
	/>
)

// ----------------------------- Ping‑Pong Scroll Hook -----------------------------
function usePingPongScroll(
	length: number,
	intervalMs: number,
	enabled: boolean,
	containerRef: React.RefObject<HTMLDivElement | null>,
	setActiveIndex: React.Dispatch<React.SetStateAction<number>>
) {
	const directionRef = useRef<1 | -1>(1)
	const intervalRef = useRef<number | null>(null)

	useEffect(() => {
		if (!enabled || length <= 1) return

		intervalRef.current = window.setInterval(() => {
			setActiveIndex((prev) => {
				let next = prev + directionRef.current

				if (next >= length) {
					directionRef.current = -1
					next = length - 2
				} else if (next < 0) {
					directionRef.current = 1
					next = 1
				}

				if (containerRef.current) {
					const scrollAmount = next * containerRef.current.clientWidth
					containerRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' })
				}
				return next
			})
		}, intervalMs)

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current)
		}
	}, [enabled, length, intervalMs, containerRef, setActiveIndex])
}

// ----------------------------- Helper to build week days -----------------------------
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

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const stats = [
	{ label: 'Total Patients', value: '20', color: '#4264D0' },
	{ label: 'New Patients', value: '06', color: '#2B982B' },
	{ label: 'Follow up Patients', value: '03', color: '#EA7F06' },
	{ label: 'Emergency Patients', value: '01', color: '#DE3B40' },
]


const othersPopupItems = [
	{ title: 'Ancillary', image: AncilaryIcon },
	{ title: 'Ambulance', image: AmbulanceIcon },
	{ title: 'Blood Bank', image: BloodBankIcon },
	{ title: 'ICU', image: IcuIcon },
	{ title: 'Emergency', image: EmergencyIcon },
]

// ----------------------------- Main Component -----------------------------
export default function PortalPage() {
	// removed unused activeHospital prop
	const { role, user } = useAuth()
	const navigate = useNavigate()

	const handleServiceIconClick = (title: string) => {
		if (title === 'Appointment') {
			navigate(ROUTES.APPOINTMENTS)
		} else if (title === 'Orders') {
			navigate(ROUTES.PHARMACY.ORDERS)
		}
	}

	const getQuickServices = () => {
		const baseServices = [
			{ title: 'Appointment', image: AppointmentsIcon },
			{ title: 'Pharmacy', image: PharmacyIcon },
			{ title: 'Laboratory', image: LabIcon },
			{ title: 'Radiology', image: RadiologyIcon },
			{ title: 'Paramedicals', image: null },
		]

		if (role === USER_ROLES.PHARMACY) {
			return [
				{ title: 'Orders', image: AppointmentsIcon },
				{ title: 'Pharmacy', image: PharmacyIcon },
				{ title: 'Laboratory', image: LabIcon },
				{ title: 'Radiology', image: RadiologyIcon },
				{ title: 'Paramedicals', image: null },
			]
		}

		return baseServices
	}

	const quickServices = getQuickServices()

	const [selectedDate, setSelectedDate] = useState(0)
	const [activeHospitalId, setActiveHospitalId] = useState<string | null>(() =>
		localStorage.getItem('active_hospital_id')
	)
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [apptLoading, setApptLoading] = useState(true)
	const [apptError, setApptError] = useState('')
	const [othersAnchorEl, setOthersAnchorEl] = useState<HTMLElement | null>(null)
	const othersRef = useRef<HTMLDivElement | null>(null)
	const [weekDays] = useState(() => buildWeekDays())
	const selectedDateObj = weekDays[selectedDate]?.dateObj ?? new Date()
	const [searchQuery, setSearchQuery] = useState('')
	const debouncedQuery = useDebouncedValue(searchQuery, 300)

	// ----- Video Carousel state -----
	const VIDEO_SOURCES = [videoFile, videoFile, videoFile, videoFile]
	const [activeVideoIndex, setActiveVideoIndex] = useState(0)
	const [videoContainerWidth, setVideoContainerWidth] = useState(0)
	const videoScrollRef = useRef<HTMLDivElement>(null)
	const [isVideoPlaying, setIsVideoPlaying] = useState(false)
	const autoScrollEnabled = videoContainerWidth > 0 && !isVideoPlaying && VIDEO_SOURCES.length > 1

	usePingPongScroll(VIDEO_SOURCES.length, 4000, autoScrollEnabled, videoScrollRef, setActiveVideoIndex)

	// ----- Ad Carousel state -----
	const AD_IMAGES = [adImage, adImage, adImage]
	const [activeAdIndex, setActiveAdIndex] = useState(0)
	const [adContainerWidth, setAdContainerWidth] = useState(0)
	const adScrollRef = useRef<HTMLDivElement>(null)
	const adAutoScrollEnabled = adContainerWidth > 0 && AD_IMAGES.length > 1

	usePingPongScroll(AD_IMAGES.length, 3000, adAutoScrollEnabled, adScrollRef, setActiveAdIndex)

	// ----- Handlers for video carousel -----
	const handleVideoScroll = () => {
		if (!videoScrollRef.current || videoContainerWidth === 0) return
		const scrollLeft = videoScrollRef.current.scrollLeft
		const newIndex = Math.round(scrollLeft / videoContainerWidth)
		if (newIndex !== activeVideoIndex && newIndex >= 0 && newIndex < VIDEO_SOURCES.length) {
			setActiveVideoIndex(newIndex)
		}
	}

	const handleVideoDotClick = (index: number) => {
		setActiveVideoIndex(index)
		if (videoScrollRef.current) {
			videoScrollRef.current.scrollTo({ left: index * videoContainerWidth, behavior: 'smooth' })
		}
	}

	// ----- Handlers for ad carousel -----
	const handleAdScroll = () => {
		if (!adScrollRef.current || adContainerWidth === 0) return
		const scrollLeft = adScrollRef.current.scrollLeft
		const newIndex = Math.round(scrollLeft / adContainerWidth)
		if (newIndex !== activeAdIndex && newIndex >= 0 && newIndex < AD_IMAGES.length) {
			setActiveAdIndex(newIndex)
		}
	}

	const handleAdDotClick = (index: number) => {
		setActiveAdIndex(index)
		if (adScrollRef.current) {
			adScrollRef.current.scrollTo({ left: index * adContainerWidth, behavior: 'smooth' })
		}
	}

	// Watch container widths
	useEffect(() => {
		const updateWidths = () => {
			if (videoScrollRef.current) setVideoContainerWidth(videoScrollRef.current.clientWidth)
			if (adScrollRef.current) setAdContainerWidth(adScrollRef.current.clientWidth)
		}
		updateWidths()
		window.addEventListener('resize', updateWidths)
		return () => window.removeEventListener('resize', updateWidths)
	}, [])

	// ----- Appointments fetch effect -----
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
		if (role !== USER_ROLES.DOCTOR && role !== USER_ROLES.PATIENT) {
			setApptLoading(false)
			return
		}

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
				} else {
					setApptError(res.message ?? 'Failed to load appointments')
				}
			} catch (err) {
				console.error('Appointments fetch error:', err)
				setApptError('Failed to load appointments')
			} finally {
				setApptLoading(false)
			}
		}

		fetchAppointments()
	}, [selectedDate, weekDays, debouncedQuery, activeHospitalId, role])

	// ----------------------------- Render -----------------------------
	return (
		<Box sx={{ bgcolor: '#f5f7fa' }}>
			<Container maxWidth="lg" sx={{ py: 3 }}>
				{/* TOP 50/50: Welcome+Services | Search+Appointments */}
				<Grid container spacing={3} alignItems="flex-start">
					{/* LEFT COLUMN */}
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
													sx={{
														color: stat.color,
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
						)}

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
							{/* Quick service icons */}
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								{quickServices.map((s) =>
									s.title === 'Paramedicals' ? (
										<Box
											key={s.title}
											ref={othersRef}
											onMouseEnter={(e) => setOthersAnchorEl(e.currentTarget)}
											onMouseLeave={() => setOthersAnchorEl(null)}
											sx={{
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												gap: 0.8,
												cursor: 'pointer',
												flex: 1,
												position: 'relative',
											}}
										>
											<Box
												sx={{
													width: 44,
													height: 44,
													display: 'grid',
													gridTemplateColumns: '1fr 1fr',
													gap: '4px',
													p: '5px',
													bgcolor: '#e8f5f5',
													borderRadius: '10px',
													transition: 'transform 0.2s ease, box-shadow 0.2s ease',
													'&:hover': {
														transform: 'translateY(-3px)',
														boxShadow: '0 4px 12px rgba(12,124,124,0.2)',
													},
												}}
											>
												<Box sx={{ bgcolor: '#0c7c7c', borderRadius: '3px' }} />
												<Box sx={{ bgcolor: '#4264D0', borderRadius: '3px' }} />
												<Box sx={{ bgcolor: '#EA7F06', borderRadius: '3px' }} />
												<Box sx={{ bgcolor: '#DE3B40', borderRadius: '3px' }} />
											</Box>
											<Typography
												sx={{
													fontSize: '11px',
													fontWeight: 600,
													color: 'text.primary',
													textAlign: 'center',
												}}
											>
												Paramedicals
											</Typography>

											<Popper
												open={Boolean(othersAnchorEl)}
												anchorEl={othersAnchorEl}
												transition
												placement="bottom-end"
												disablePortal
												sx={{ zIndex: 1300 }}
											>
												{({ TransitionProps }) => (
													<Grow
														{...TransitionProps}
														timeout={200}
														style={{ transformOrigin: 'top right' }}
													>
														<Paper
															elevation={0}
															sx={{
																p: 2,
																borderRadius: '8px',
																mb: 1,
																display: 'flex',
																gap: 2,
																background: 'rgba(255, 255, 255, 0.8)',
																backdropFilter: 'blur(200px)',
																WebkitBackdropFilter: 'blur(20px)',
																boxShadow:
																	'0 8px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.2)',
															}}
														>
															{othersPopupItems.map((item, index) => (
																<Box
																	key={item.title}
																	sx={{
																		display: 'flex',
																		flexDirection: 'column',
																		alignItems: 'center',
																		gap: 0.6,
																		cursor: 'pointer',
																		px: 0.5,
																		opacity: 0,
																		animation: `${fadeInUp} 0.4s ease forwards`,
																		animationDelay: `${index * 60}ms`,
																		transition: 'transform 0.2s ease',
																		'&:hover': { transform: 'scale(1.05)' },
																		'& img': { transition: 'transform 0.2s ease' },
																		'&:hover img': {
																			transform: 'translateY(-4px)',
																		},
																	}}
																>
																	<Box
																		component="img"
																		src={item.image}
																		alt={item.title}
																		sx={{
																			width: 34,
																			height: 34,
																			objectFit: 'contain',
																		}}
																	/>
																	<Typography
																		sx={{
																			fontSize: '10px',
																			fontWeight: 600,
																			color: 'text.primary',
																			textAlign: 'center',
																			whiteSpace: 'nowrap',
																		}}
																	>
																		{item.title}
																	</Typography>
																</Box>
															))}
														</Paper>
													</Grow>
												)}
											</Popper>
										</Box>
									) : (
										<Box
											key={s.title}
											onClick={() => handleServiceIconClick(s.title)}
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
												src={s.image!}
												alt={s.title}
												sx={{
													width: 40,
													height: 40,
													objectFit: 'contain',
													transition: 'transform 0.2s ease',
												}}
											/>
											<Typography
												sx={{
													fontSize: '11px',
													fontWeight: 600,
													color: 'text.primary',
													textAlign: 'center',
												}}
											>
												{s.title}
											</Typography>
										</Box>
									)
								)}
							</Box>

							{/* VIDEO CAROUSEL (same dimensions and border radius as original image carousel) */}
							<Box sx={{ borderRadius: '16px', overflow: 'hidden', minWidth: 0 }}>
								<Box
									ref={videoScrollRef}
									onScroll={handleVideoScroll}
									sx={{
										display: 'flex',
										overflowX: 'auto',
										scrollSnapType: 'x mandatory',
										scrollBehavior: 'smooth',
										'&::-webkit-scrollbar': { display: 'none' },
										scrollbarWidth: 'none',
									}}
								>
									{VIDEO_SOURCES.map((src, idx) => (
										<Box key={idx} sx={{ scrollSnapAlign: 'start', width: '100%', flexShrink: 0 }}>
											<VideoSlide
												src={src}
												width={videoContainerWidth}
												onPlayStateChange={setIsVideoPlaying}
												onVideoFinish={() => setIsVideoPlaying(false)}
											/>
										</Box>
									))}
								</Box>
								{VIDEO_SOURCES.length > 1 && (
									<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 1.5 }}>
										{VIDEO_SOURCES.map((_, idx) => (
											<Box
												key={idx}
												onClick={() => handleVideoDotClick(idx)}
												sx={{
													width: idx === activeVideoIndex ? 20 : 10,
													height: 10,
													borderRadius: '4px',
													bgcolor: idx === activeVideoIndex ? '#0c7c7c' : '#d0d0d0',
													cursor: 'pointer',
													transition: 'width 0.2s',
												}}
											/>
										))}
									</Box>
								)}
							</Box>

							{/* Ad slider (carousel with dots) */}
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
									ref={adScrollRef}
									onScroll={handleAdScroll}
									sx={{
										display: 'flex',
										overflowX: 'auto',
										scrollSnapType: 'x mandatory',
										scrollBehavior: 'smooth',
										'&::-webkit-scrollbar': { display: 'none' },
										scrollbarWidth: 'none',
									}}
								>
									{AD_IMAGES.map((src, idx) => (
										<Box key={idx} sx={{ scrollSnapAlign: 'start', width: '100%', flexShrink: 0 }}>
											<AdSlide width={adContainerWidth} src={src} />
										</Box>
									))}
								</Box>
								<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 1.5 }}>
									{AD_IMAGES.map((_, idx) => (
										<Box
											key={idx}
											onClick={() => handleAdDotClick(idx)}
											sx={{
												width: idx === activeAdIndex ? 20 : 8,
												height: 8,
												borderRadius: '4px',
												bgcolor: idx === activeAdIndex ? '#0c7c7c' : '#d0d0d0',
												cursor: 'pointer',
												transition: 'width 0.2s',
											}}
										/>
									))}
								</Box>
							</Box>
						</Box>
					</Grid>

					{/* RIGHT COLUMN — appointments panel */}
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
						{role === USER_ROLES.PHARMACY && (
							<Box sx={customCardStyle}>
								<OrderDetails />
							</Box>
						)}
					</Grid>
				</Grid>

				{/* BOTTOM sections */}
				<Grid container spacing={3} alignItems="stretch" sx={{ mt: 3 }}>
					<Grid size={{ xs: 12, md: 6 }}>
						<CommunityBlogsSection variant={'column'} />
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<UpcomingEventsSection variant={'column'} />
					</Grid>
				</Grid>

				<AnswerQuestionsSection />
			</Container>
		</Box>
	)
}
