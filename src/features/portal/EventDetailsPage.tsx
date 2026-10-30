import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGoBack } from '../../hooks/useGoBack'
import { Box, Typography, Container, CircularProgress, Stack, Chip, Divider, Paper } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import CategoryIcon from '@mui/icons-material/Category'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AppButton from '../../components/common/Button/AppButton'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { toast } from 'react-toastify'

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop'

export default function EventDetailsPage() {
	const { id } = useParams<{ id: string }>()
	const goBack = useGoBack()
	const [event, setEvent] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchEventDetail = async () => {
			if (!id) return
			try {
				setLoading(true)
				const res = await ApiService.get<any>(API_ENDPOINTS.EVENTS.PUBLIC_DETAIL(id))
				if (res.data?.data) {
					setEvent(res.data.data)
				}
			} catch (err) {
				console.error('Failed to fetch event detail', err)
				toast.error('Could not load event details')
			} finally {
				setLoading(false)
			}
		}

		fetchEventDetail()
	}, [id])

	const formatDate = (dateString: string) => {
		const d = new Date(dateString)
		return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
	}

	const formatTime = (timeString: string) => {
		if (!timeString) return ''
		const [h, m] = timeString.split(':')
		const hr = parseInt(h, 10)
		const suffix = hr >= 12 ? 'PM' : 'AM'
		const hr12 = hr % 12 || 12
		return `${hr12}:${m} ${suffix}`
	}

	const getOnlinePlatform = (link: string | undefined) => {
		if (!link) return 'Online'
		const lowerLink = link.toLowerCase()
		if (lowerLink.includes('zoom.us')) return 'Zoom'
		if (lowerLink.includes('meet.google')) return 'Google Meet'
		if (lowerLink.includes('teams.microsoft')) return 'Microsoft Teams'
		return 'Online Platform'
	}

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
				<CircularProgress color="primary" />
			</Box>
		)
	}

	if (!event) {
		return (
			<Box sx={{ textAlign: 'center', py: 8 }}>
				<Typography variant="h5" color="text.secondary">
					Event not found
				</Typography>
				<AppButton label="Back to Events" sx={{ mt: 2 }} onClick={() => goBack()} />
			</Box>
		)
	}

	const isOnline = event.location_type === 'online'
	const timeStr = `${formatTime(event.event_time)} - ${formatTime(event.end_time)}`
	const platform = getOnlinePlatform(event.registration_link)

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box mb={2}>
				<AppButton
					variant="text"
					label="Back"
					icon={<ArrowBackIcon fontSize="small" />}
					onClick={() => goBack()}
					sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}
				/>
			</Box>

			<Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
				<Box
					component="img"
					src={event.cover_image_url || DEFAULT_COVER_IMAGE}
					alt={event.title}
					sx={{
						width: '100%',
						height: { xs: 200, md: 400 },
						objectFit: 'cover',
					}}
				/>

				<Box sx={{ p: { xs: 3, md: 5 } }}>
					<Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap" useFlexGap>
						<Chip
							icon={<CategoryIcon sx={{ fontSize: '16px !important' }} />}
							label={event.category_label}
							sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }}
						/>
						<Chip
							icon={isOnline ? <VideocamOutlinedIcon sx={{ fontSize: '16px !important' }} /> : <LocationOnOutlinedIcon sx={{ fontSize: '16px !important' }} />}
							label={isOnline ? 'Virtual Event' : 'In-Person Event'}
							sx={{
								bgcolor: isOnline ? '#dcfce7' : '#dbeafe',
								color: isOnline ? '#16a34a' : '#2563eb',
								fontWeight: 600,
							}}
						/>
					</Stack>

					<Typography variant="h3" fontWeight={700} color="#0f172a" mb={4}>
						{event.title}
					</Typography>

					<Stack 
						direction={{ xs: 'column', md: 'row' }} 
						spacing={{ xs: 3, md: 6 }} 
						sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, mb: 5 }}
					>
						<Stack direction="row" spacing={2} alignItems="flex-start">
							<Box sx={{ p: 1.5, bgcolor: '#e2e8f0', borderRadius: '50%' }}>
								<CalendarTodayIcon sx={{ color: '#475569' }} />
							</Box>
							<Box>
								<Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight={600} mb={0.5}>
									Date & Time
								</Typography>
								<Typography variant="body1" fontWeight={600} color="#0f172a">
									{formatDate(event.event_date)}
								</Typography>
								<Typography variant="body2" color="#475569">
									{timeStr}
								</Typography>
							</Box>
						</Stack>

						<Stack direction="row" spacing={2} alignItems="flex-start">
							<Box sx={{ p: 1.5, bgcolor: isOnline ? '#dcfce7' : '#dbeafe', borderRadius: '50%' }}>
								{isOnline ? (
									<VideocamOutlinedIcon sx={{ color: '#16a34a' }} />
								) : (
									<LocationOnOutlinedIcon sx={{ color: '#2563eb' }} />
								)}
							</Box>
							<Box>
								<Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight={600} mb={0.5}>
									{isOnline ? 'Platform' : 'Location'}
								</Typography>
								<Typography variant="body1" fontWeight={600} color="#0f172a">
									{isOnline ? '💻 Online' : `📍 Offline`}
								</Typography>
								<Typography variant="body2" color="#475569" sx={{ maxWidth: 300 }}>
									{isOnline ? platform : (event.location || 'Location TBA')}
								</Typography>
							</Box>
						</Stack>
					</Stack>

					<Typography variant="h5" fontWeight={600} color="#0f172a" mb={2}>
						About this event
					</Typography>
					
					<Typography variant="body1" color="#334155" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, mb: 5 }}>
						{event.description}
					</Typography>

					<Divider sx={{ mb: 4 }} />

					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						{isOnline && event.registration_link ? (
							<AppButton
								label="Register Now"
								size="large"
								onClick={() => window.open(event.registration_link, '_blank')}
								sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, borderRadius: 2, px: 6, py: 1.5, fontSize: '1.1rem' }}
							/>
						) : !isOnline ? (
							<Typography variant="body2" color="text.secondary" fontStyle="italic">
								* This is an in-person event. Please arrive at the venue on time.
							</Typography>
						) : null}
					</Box>
				</Box>
			</Paper>
		</Container>
	)
}
