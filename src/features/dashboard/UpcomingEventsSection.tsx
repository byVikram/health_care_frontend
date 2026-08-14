// src/features/dashboard/UpcomingEventsSection.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { Box, Typography, Grid, CircularProgress, Stack, Chip } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import CategoryIcon from '@mui/icons-material/Category'
import AppButton from '../../components/common/Button/AppButton'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { toast } from 'react-toastify'

export interface EventItem {
	id: string
	title: string
	category: string
	category_label: string
	event_date: string
	event_time: string
	end_time: string
	location_type?: string
	location?: string
	registration_link?: string
	description: string
	cover_image_url?: string
	status: string
	created_at: string
	updated_at?: string
}

interface UpcommingEventProps {
	variant?: string
}

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=200&fit=crop'

export default function UpcomingEventsSection({ variant = 'row' }: UpcommingEventProps) {
	const navigate = useNavigate()
	const [events, setEvents] = useState<EventItem[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const res = await ApiService.get<any>(API_ENDPOINTS.EVENTS.PUBLIC)
				setEvents(res.data?.data || [])
			} catch (err) {
				console.error('Failed to fetch events', err)
				toast.error('Could not load upcoming events')
			} finally {
				setLoading(false)
			}
		}

		fetchEvents()
	}, [])

	const formatDate = (dateString: string) => {
		const d = new Date(dateString)
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
	}

	const formatTime = (timeString: string) => {
		if (!timeString) return ''
		const [h, m] = timeString.split(':')
		const hr = parseInt(h, 10)
		const suffix = hr >= 12 ? 'PM' : 'AM'
		const hr12 = hr % 12 || 12
		return `${hr12}:${m} ${suffix}`
	}

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
				<CircularProgress color="primary" />
			</Box>
		)
	}

	if (events.length === 0) {
		return null
	}

	return (
		<Box sx={{ py: 2 }}>
			<Typography
				variant="h3"
				align={variant === 'column' ? 'left' : 'center'}
				mb={4}
				fontWeight={600}
				fontSize={variant === 'column' ? '1.25rem' : '1.75rem'}
				color="#0f172a"
			>
				Upcoming Events
			</Typography>

			<Grid container spacing={3}>
				{events.map((event) => {
					const dateStr = formatDate(event.event_date)
					const timeStr = `${formatTime(event.event_time)} - ${formatTime(event.end_time)}`
					
					return (
						<Grid
							key={event.id}
							size={{ xs: 12, sm: 6, md: 4 }}
							sx={{ display: 'flex' }}
						>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									flex: 1,
									bgcolor: '#ffffff',
									borderRadius: '12px',
									overflow: 'hidden',
									border: '1px solid #e2e8f0',
									boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
									transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
									'&:hover': { 
										transform: 'translateY(-4px)',
										boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)'
									},
								}}
							>
								<Box sx={{ position: 'relative' }}>
									<Box
										component="img"
										src={event.cover_image_url || DEFAULT_COVER_IMAGE}
										alt={event.title}
										sx={{
											width: '100%',
											objectFit: 'cover',
											height: 160,
										}}
									/>
									<Chip
										icon={<CategoryIcon sx={{ fontSize: '14px !important' }} />}
										label={event.category_label}
										size="small"
										sx={{
											position: 'absolute',
											top: 12,
											left: 12,
											bgcolor: 'rgba(15, 23, 42, 0.75)',
											color: 'white',
											fontWeight: 600,
											fontSize: '0.7rem',
											backdropFilter: 'blur(4px)',
											'& .MuiChip-icon': { color: 'white' },
										}}
									/>
								</Box>

								<Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>

									<Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ mb: 2, fontSize: '1.1rem', lineHeight: 1.3 }}>
										{event.title}
									</Typography>

									<Stack spacing={1.5} sx={{ mb: 2 }}>
										<Stack direction="row" spacing={1.5} alignItems="flex-start">
											<CalendarTodayIcon sx={{ fontSize: 18, color: '#64748b', mt: 0.2 }} />
											<Box>
												<Typography variant="body2" color="#334155" fontWeight={500}>
													{dateStr} • {timeStr}
												</Typography>
											</Box>
										</Stack>

										<Stack direction="row" spacing={1.5} alignItems="flex-start">
											<LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#64748b', mt: 0.2 }} />
											<Box>
												<Typography variant="body2" color="#334155" fontWeight={500}>
													{event.location_type === 'online' ? 'Online' : (event.location || 'Location not provided')}
												</Typography>
											</Box>
										</Stack>
									</Stack>

									<Typography 
										variant="body2" 
										color="text.secondary"
										sx={{ 
											mb: 3, 
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											flex: 1
										}}
									>
										{event.description}
									</Typography>

									<Stack direction="column" spacing={1.5} mt="auto">
										<AppButton
											label="Register Now"
											fullWidth
											onClick={() => event.registration_link && window.open(event.registration_link, '_blank')}
											disabled={!event.registration_link}
											sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, borderRadius: 2 }}
										/>
										<AppButton
											label="View Details"
											fullWidth
											variant="outlined"
											onClick={() => navigate(ROUTES.EVENTS.DETAIL.replace(':id', event.id))}
											sx={{ borderColor: '#0d9488', color: '#0d9488', borderRadius: 2 }}
										/>
									</Stack>
								</Box>
							</Box>
						</Grid>
					)
				})}
			</Grid>
		</Box>
	)
}
