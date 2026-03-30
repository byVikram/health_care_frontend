// src/features/dashboard/UpcomingEventsSection.tsx
import { Box, Typography, Grid } from '@mui/material'
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

interface UpcommingEventProps {
	variant?: string
}

export default function UpcomingEventsSection({ variant = 'row' }: UpcommingEventProps) {
	return (
		<Box>
			<Typography
				variant={'h3'}
				align={variant === 'column' ? 'left' : 'center'}
				mb={variant === 'column' ? 2 : 3}
				// fontWeight={variant === 'column' ? 400 : 500}
				fontWeight={500}
				fontSize={variant === 'column' ? '16px' : '1.5rem'}
			>
				Upcoming Events
			</Typography>

			<Grid container spacing={3} alignItems="stretch">
				{/* Left: Event List */}
				<Grid container size={{ xs: 12, md: variant === 'column' ? 12 : 4 }} spacing={2}>
					{eventList.map((event) => (
						<Grid
							key={event.id}
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 2,
								borderRadius: '12px',
								px: 2,
								py: 1,
								cursor: 'pointer',
								bgcolor: '#fff',
								// mb: 1.5,
								width: '100%',
								boxShadow: '0px 0px 9.65px 0px #00000029',
								transition: '0.2s',
								'&:hover': { transform: 'scale(1.01)' },
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
								<Typography variant="body1" color="primary.main" fontWeight={700}>
									{event.day}
								</Typography>
								<Typography variant="body1" color="primary.main" fontWeight={400} fontSize="10px">
									{event.month}
								</Typography>
							</Box>

							<Box sx={{ flex: 1, py: 1.5 }}>
								<Typography sx={{ fontWeight: 600, fontSize: '13px' }}>{event.name}</Typography>
								<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
									{event.location}
								</Typography>
							</Box>

							<ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
						</Grid>
					))}
				</Grid>

				{/* Right: Featured Events */}
				<Grid size={{ xs: 12, md: variant === 'column' ? 12 : 8 }}>
					<Box
						sx={{
							bgcolor: variant === 'column' ? '' : '#e4e7e7',
							borderRadius: '8px',
							p: variant === 'column' ? 0 : 3,
							height: '100%',
						}}
					>
						<Grid container spacing={2} alignItems="stretch">
							{featuredEvents.map((event) => (
								<Grid
									key={event.id}
									// size={{ xs: 12, sm: 6, md: variant === 'column' ? 12 : 6 }}
									size={{ xs: 12, sm: 6 }}
									sx={{ display: 'flex' }}
								>
									<Box
										sx={{
											display: 'flex',
											flexDirection: 'column',
											flex: 1,
											bgcolor: '#fff',
											borderRadius: '6px',
											overflow: 'hidden',
											height: variant === 'column' ? '320px' : 'auto',
										}}
									>
										<Box
											component="img"
											src={event.image}
											alt={event.title}
											sx={{
												width: '100%',
												objectFit: 'cover',
												height: variant === 'column' ? '140px' : '40%',
											}}
										/>

										<Box
											sx={{
												p: 1.5,
												display: 'flex',
												flexDirection: 'column',
												gap: 0.8,
												flex: 1,
											}}
										>
											<Typography variant="body1" fontWeight={600}>
												{event.title}
											</Typography>

											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
												<CalendarTodayIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
												<Typography variant="body2">{event.date}</Typography>
											</Box>

											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
												<LocationOnOutlinedIcon
													sx={{ fontSize: 12, color: 'text.secondary' }}
												/>
												<Typography variant="body2">{event.location}</Typography>
											</Box>

											<AppButton
												label="Register Now"
												borderRadius="30px"
												sx={{ mt: 'auto' }} // 🔥 aligns buttons
											/>
										</Box>
									</Box>
								</Grid>
							))}
						</Grid>
					</Box>
				</Grid>
			</Grid>
		</Box>
	)
}
