// src/features/dashboard/UpcomingEventsSection.tsx
import { Box, Typography, Container, Grid } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AppButton from '../../components/common/Button/AppButton'

const eventList = [
	{ id: 1, day: '20', month: 'JUN', name: 'Free Diabetes Screening Camp', location: 'City Community Hall' },
	{ id: 2, day: '25', month: 'JUL', name: 'Online Yoga & Wellness Workshop', location: 'Virtual Event' },
	{ id: 3, day: '04', month: 'AUG', name: 'Online Yoga & Wellness Workshop', location: 'Virtual Event' },
	{ id: 4, day: '04', month: 'AUG', name: 'Online Yoga & Wellness Workshop', location: 'Virtual Event' },
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
		title: 'Community Blood Donation Drive',
		date: 'September 5, 2024',
		location: 'Central Hospital, Main Hall',
		image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=400&h=200&fit=crop',
	},
]

export default function UpcomingEventsSection() {
	return (
		<Box sx={{ py: 6 }}>
			<Container maxWidth="lg">
				<Typography variant="h3" align="center" sx={{ mb: 4, fontWeight: 700 }}>
					Upcoming Events
				</Typography>

				<Grid container spacing={3} alignItems="stretch">
					{/* Left: Event List - 44% */}
					<Grid size={{ xs: 12, md: 5 }}>
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
									flex: 1,
									cursor: 'pointer',
									bgcolor: '#fff',
									mb: 1.5,
									'&:last-child': { mb: 0 },
									transition: 'box-shadow 0.2s ease',
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
										sx={{ fontWeight: 700, fontSize: '16px', color: '#0c7c7c', lineHeight: 1 }}
									>
										{event.day}
									</Typography>
									<Typography sx={{ fontSize: '10px', color: '#0c7c7c', fontWeight: 600 }}>
										{event.month}
									</Typography>
								</Box>
								<Box sx={{ flex: 1, py: 1.5 }}>
									<Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'text.primary' }}>
										{event.name}
									</Typography>
									<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
										{event.location}
									</Typography>
								</Box>
								<ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
							</Box>
						))}
					</Grid>

					{/* Right: Background with exactly 2 equal cards */}
					<Grid size={{ xs: 12, md: 7 }}>
						<Box
							sx={{
								bgcolor: '#b0c8d8',
								borderRadius: '16px',
								p: { xs: 1.5, sm: 2 },
							}}
						>
							<Grid container spacing={2} alignItems="stretch">
								{featuredEvents.map((event) => (
									<Grid key={event.id} size={{ xs: 12, sm: 6 }}>
										<Box
											sx={{
												height: '100%',
												bgcolor: '#fff',
												borderRadius: '12px',
												overflow: 'hidden',
												display: 'flex',
												flexDirection: 'column',
												transition: 'box-shadow 0.2s ease',
												'&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.10)' },
											}}
										>
											<Box
												component="img"
												src={event.image}
												alt={event.title}
												sx={{
													width: '100%',
													height: { xs: 180, sm: 160 },
													objectFit: 'cover',
													flexShrink: 0,
												}}
											/>
											<Box
												sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8, flex: 1 }}
											>
												<Typography
													sx={{
														fontWeight: 700,
														fontSize: '14px',
														color: 'text.primary',
														lineHeight: 1.3,
													}}
												>
													{event.title}
												</Typography>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
													<CalendarTodayIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
													<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
														{event.date}
													</Typography>
												</Box>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
													<LocationOnOutlinedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
													<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
														{event.location}
													</Typography>
												</Box>
												<AppButton
													label="Register Now"
													sx={{
														mt: 'auto',
														bgcolor: '#0c7c7c',
														color: '#fff',
														borderRadius: '8px',
														fontSize: '12px',
														py: 0.5,
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
			</Container>
		</Box>
	)
}
