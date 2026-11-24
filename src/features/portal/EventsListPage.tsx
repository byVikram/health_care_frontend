// src/features/portal/EventsListPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Box,
	Container,
	Typography,
	Grid,
	Card,
	CardContent,
	CardMedia,
	Chip,
	TextField,
	InputAdornment,
	Button,
	CircularProgress,
	Stack,
	Divider,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import CategoryIcon from '@mui/icons-material/Category'

import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { ROUTES } from '../../constants/routes'
import AppButton from '../../components/common/Button/AppButton'
import VoiceMicButton from '../../components/common/Voice/VoiceMicButton'

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

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=200&fit=crop'

export default function EventsListPage() {
	const navigate = useNavigate()
	const [events, setEvents] = useState<EventItem[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedCategory, setSelectedCategory] = useState('All')
	const [searchQuery, setSearchQuery] = useState('')

	useEffect(() => {
		const fetchEvents = async () => {
			setLoading(true)
			try {
				const res = await ApiService.get<any>(API_ENDPOINTS.EVENTS.PUBLIC + '?limit=100')
				setEvents(res.data?.data || [])
			} catch (err) {
				console.error('Error fetching event data:', err)
			} finally {
				setLoading(false)
			}
		}
		fetchEvents()
	}, [])

	const categories = ['All', ...Array.from(new Set(events.map(e => e.category_label))).filter(Boolean)]

	const filteredEvents = events.filter((event) => {
		const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              event.description.toLowerCase().includes(searchQuery.toLowerCase())
		const matchesCategory = selectedCategory === 'All' || event.category_label === selectedCategory
		return matchesSearch && matchesCategory
	})

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

	return (
		<Box sx={{ minHeight: '100vh', py: 6, bgcolor: '#f8fafc' }}>
			<Container maxWidth="lg">
				{/* Header Section */}
				<Box sx={{ mb: 6, textAlign: 'center' }}>
					<Typography
						variant="h3"
						fontWeight={800}
						sx={{
							background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							letterSpacing: '-0.02em',
							mb: 1.5,
						}}
					>
						Upcoming Healthcare Events
					</Typography>
					<Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
						Discover webinars, health camps, and community events hosted by our healthcare professionals.
					</Typography>
				</Box>

				{/* Search & Filter Bar */}
				<Grid container spacing={3} sx={{ mb: 5, alignItems: 'center' }}>
					<Grid size={{ xs: 12, md: 5 }}>
						<TextField
							fullWidth
							placeholder="Search events..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: '#0d9488' }} />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">
										<VoiceMicButton onResult={(text) => setSearchQuery(text)} />
									</InputAdornment>
								),
								sx: { borderRadius: '12px', bgcolor: 'white' },
							}}
							size="medium"
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 7 }}>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { md: 'flex-end' } }}>
							{categories.map((cat) => (
								<Chip
									key={cat}
									label={cat}
									onClick={() => setSelectedCategory(cat)}
									sx={{
										fontSize: '0.85rem',
										fontWeight: 600,
										px: 1,
										py: 2,
										borderRadius: '10px',
										cursor: 'pointer',
										bgcolor: selectedCategory === cat ? '#0d9488' : 'white',
										color: selectedCategory === cat ? 'white' : '#475569',
										border: '1px solid',
										borderColor: selectedCategory === cat ? '#0d9488' : '#e2e8f0',
										transition: 'all 0.2s',
										'&:hover': {
											bgcolor: selectedCategory === cat ? '#0f766e' : '#f1f5f9',
											borderColor: selectedCategory === cat ? '#0f766e' : '#cbd5e1',
										},
									}}
								/>
							))}
						</Box>
					</Grid>
				</Grid>

				{/* Main Content Layout */}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
						<CircularProgress sx={{ color: '#0d9488' }} />
					</Box>
				) : (
					<Grid container spacing={4}>
						<Grid size={{ xs: 12 }}>
							{filteredEvents.length === 0 ? (
								<Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
									<Typography variant="h6" color="text.secondary" fontWeight={600}>
										No upcoming events found
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
										Try searching with different keywords or choosing another category.
									</Typography>
								</Box>
							) : (
								<Grid container spacing={3}>
									{filteredEvents.map((event) => {
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
							)}
						</Grid>
					</Grid>
				)}
			</Container>
		</Box>
	)
}
