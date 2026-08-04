// src/features/doctor/events/DoctorEventListPage.tsx
import { useEffect, useState, useMemo } from 'react'
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
	IconButton,
	Tooltip,
	Stack,
	Divider,
	CircularProgress,
	Button,
	TextField,
	InputAdornment,
	Tabs,
	Tab,
	Paper,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LinkIcon from '@mui/icons-material/Link'
import EventIcon from '@mui/icons-material/Event'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'

import { useAuth } from '../../../hooks/useAuth'
import { ROUTES } from '../../../constants/routes'
import { toast } from 'react-toastify'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import { getDoctorEvents, deleteEvent, DoctorEvent } from './eventService'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600'

export default function DoctorEventListPage() {
	const navigate = useNavigate()
	const { role } = useAuth()

	const [events, setEvents] = useState<DoctorEvent[]>([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

	// Delete State
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
	const [deleteLoading, setDeleteLoading] = useState(false)

	// Role guard
	useEffect(() => {
		if (role !== 'doctor') {
			navigate(ROUTES.PORTAL.HOME, { replace: true })
		}
	}, [role, navigate])

	const fetchEvents = async () => {
		setLoading(true)
		try {
			const data = await getDoctorEvents()
			setEvents(data)
		} catch (err) {
			console.error('Error fetching doctor events:', err)
			toast.error('Failed to load events')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (role === 'doctor') {
			fetchEvents()
		}
	}, [role])

	const handleCreateClick = () => {
		navigate(ROUTES.DOCTOR.EVENT_CREATE)
	}

	const handleEditClick = (id: string) => {
		navigate(ROUTES.DOCTOR.EVENT_EDIT.replace(':id', id))
	}

	const handleDeleteClick = (id: string) => {
		setSelectedEventId(id)
		setDeleteOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!selectedEventId) return
		setDeleteLoading(true)
		try {
			await deleteEvent(selectedEventId)
			toast.success('Event deleted successfully')
			setEvents((prev) => prev.filter((item) => item.id !== selectedEventId))
			setDeleteOpen(false)
		} catch (err) {
			console.error('Error deleting event:', err)
			toast.error('Failed to delete event')
		} finally {
			setDeleteLoading(false)
			setSelectedEventId(null)
		}
	}

	const formatTime = (timeStr: string) => {
		try {
			const parts = timeStr.split(':')
			if (parts.length >= 2) {
				const hour = parseInt(parts[0], 10)
				const min = parts[1]
				const ampm = hour >= 12 ? 'PM' : 'AM'
				const displayHour = hour % 12 === 0 ? 12 : hour % 12
				return `${displayHour}:${min} ${ampm}`
			}
			return timeStr
		} catch {
			return timeStr
		}
	}

	// Filtered events
	const filteredEvents = useMemo(() => {
		return events.filter((ev) => {
			const matchesSearch =
				ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ev.category_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ev.description.toLowerCase().includes(searchQuery.toLowerCase())

			const matchesStatus =
				statusFilter === 'all' ||
				(statusFilter === 'published' && ev.status === 'published') ||
				(statusFilter === 'draft' && ev.status === 'draft')

			return matchesSearch && matchesStatus
		})
	}, [events, searchQuery, statusFilter])

	if (role !== 'doctor') {
		return null
	}

	return (
		<Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2.5, sm: 4, md: 5 } }}>
			<Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
				{/* Top Page Header */}
				<AdminPageHeader
					title="My Events & Seminars"
					subtitle="Manage your health camps, live webinars, workshops, and community medical awareness sessions."
					count={events.length}
					countLabel="events"
					actions={
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} width={{ xs: '100%', sm: 'auto' }}>
							<Stack direction="row" spacing={1} alignItems="center">
								<Tooltip title="Refresh list">
									<IconButton
										onClick={fetchEvents}
										sx={{ border: '1px solid #cbd5e1', borderRadius: 2, color: '#64748b', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } }}
									>
										<RefreshIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</Stack>
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={handleCreateClick}
								sx={{
									width: { xs: '100%', sm: 'auto' },
									bgcolor: '#0d9488',
									textTransform: 'none',
									borderRadius: 2,
									fontWeight: 700,
									px: 3,
									py: 1.1,
									boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
									'&:hover': { bgcolor: '#0f766e', boxShadow: '0 6px 18px rgba(13, 148, 136, 0.35)' },
								}}
							>
								Create Event
							</Button>
						</Stack>
					}
				/>

				{/* Search and Status Filter Bar */}
				{!loading && events.length > 0 && (
					<Paper
						elevation={0}
						sx={{
							p: { xs: 2, sm: 2.5 },
							mb: 4,
							borderRadius: 3,
							border: '1px solid #e2e8f0',
							bgcolor: '#ffffff',
							boxShadow: '0 2px 10px rgba(15, 23, 42, 0.02)',
						}}
					>
						<Grid container spacing={2} alignItems="center">
							<Grid size={{ xs: 12, md: 6 }}>
								<TextField
									placeholder="Search events by title or category..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									fullWidth
									size="small"
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
											</InputAdornment>
										),
										endAdornment: searchQuery ? (
											<InputAdornment position="end">
												<IconButton size="small" onClick={() => setSearchQuery('')}>
													<ClearIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</InputAdornment>
										) : null,
									}}
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2,
											bgcolor: '#f8fafc',
											'& fieldset': { borderColor: '#e2e8f0' },
											'&:hover fieldset': { borderColor: '#cbd5e1' },
											'&.Mui-focused fieldset': { borderColor: '#0d9488' },
										},
									}}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<Tabs
									value={statusFilter}
									onChange={(_, val) => setStatusFilter(val)}
									variant="scrollable"
									scrollButtons="auto"
									sx={{
										minHeight: 40,
										'& .MuiTabs-indicator': { bgcolor: '#0d9488', height: 3, borderRadius: '3px 3px 0 0' },
										'& .MuiTab-root': {
											textTransform: 'none',
											fontWeight: 600,
											fontSize: '0.875rem',
											minHeight: 40,
											color: '#64748b',
											'&.Mui-selected': { color: '#0d9488', fontWeight: 700 },
										},
									}}
								>
									<Tab label={`All (${events.length})`} value="all" />
									<Tab label={`Published (${events.filter((e) => e.status === 'published').length})`} value="published" />
									<Tab label={`Drafts (${events.filter((e) => e.status === 'draft').length})`} value="draft" />
								</Tabs>
							</Grid>
						</Grid>
					</Paper>
				)}

				{loading ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
						<CircularProgress sx={{ color: '#0d9488', mb: 2 }} />
						<Typography variant="body2" color="text.secondary" fontWeight={500}>
							Loading your events...
						</Typography>
					</Box>
				) : events.length === 0 ? (
					<Paper
						elevation={0}
						sx={{
							textAlign: 'center',
							py: { xs: 8, sm: 10 },
							px: 3,
							bgcolor: 'white',
							borderRadius: 4,
							border: '1px solid #e2e8f0',
							boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
						}}
					>
						<Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
							<Box
								sx={{
									width: 80,
									height: 80,
									borderRadius: '50%',
									bgcolor: '#f0fdfa',
									color: '#0d9488',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 40,
									boxShadow: '0 8px 20px rgba(13, 148, 136, 0.12)',
								}}
							>
								<EventIcon fontSize="inherit" />
							</Box>
						</Box>
						<Typography variant="h5" color="#0f172a" fontWeight={800} sx={{ mb: 1 }}>
							No events scheduled yet
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
							Create your first health camp, public webinar, or workshop to engage patients and provide expert healthcare guidance.
						</Typography>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleCreateClick}
							sx={{
								bgcolor: '#0d9488',
								color: '#ffffff',
								textTransform: 'none',
								borderRadius: 2.5,
								fontWeight: 700,
								px: 3.5,
								py: 1.25,
								boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
								'&:hover': { bgcolor: '#0f766e' },
							}}
						>
							Create Your First Event
						</Button>
					</Paper>
				) : filteredEvents.length === 0 ? (
					<Paper
						elevation={0}
						sx={{
							textAlign: 'center',
							py: 8,
							px: 3,
							bgcolor: 'white',
							borderRadius: 3,
							border: '1px solid #e2e8f0',
						}}
					>
						<Typography variant="h6" color="#0f172a" fontWeight={700}>
							No matching events found
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
							Try adjusting your search terms or status filter.
						</Typography>
						<Button
							variant="outlined"
							onClick={() => {
								setSearchQuery('')
								setStatusFilter('all')
							}}
							sx={{ borderColor: '#cbd5e1', color: '#475569', textTransform: 'none', borderRadius: 2 }}
						>
							Clear Filters
						</Button>
					</Paper>
				) : (
					<Grid container spacing={{ xs: 2.5, sm: 3, md: 3 }}>
						{filteredEvents.map((event) => (
							<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id}>
								<Card
									elevation={0}
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										borderRadius: 3.5,
										boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
										border: '1px solid #e2e8f0',
										bgcolor: '#ffffff',
										overflow: 'hidden',
										transition: 'transform 0.25s ease, box-shadow 0.25s ease',
										'&:hover': {
											transform: 'translateY(-5px)',
											boxShadow: '0 12px 28px rgba(15, 23, 42, 0.09)',
										},
									}}
								>
									{/* Cover Image Container */}
									<Box sx={{ position: 'relative', width: '100%', pt: '52%' /* aspect ratio ~ 1.9:1 */, bgcolor: '#f1f5f9' }}>
										<CardMedia
											component="img"
											image={event.cover_image_url || FALLBACK_IMAGE}
											alt={event.title}
											sx={{
												position: 'absolute',
												top: 0,
												left: 0,
												width: '100%',
												height: '100%',
												objectFit: 'cover',
											}}
										/>
										{/* Status Badge Overlay */}
										<Box sx={{ position: 'absolute', top: 12, right: 12 }}>
											<Chip
												label={event.status === 'published' ? 'Published' : 'Draft'}
												size="small"
												sx={{
													bgcolor: event.status === 'published' ? '#0d9488' : '#64748b',
													color: '#ffffff',
													fontWeight: 700,
													fontSize: '0.68rem',
													height: 22,
													px: 0.5,
													boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
												}}
											/>
										</Box>
									</Box>

									<CardContent sx={{ flexGrow: 1, p: { xs: 2.25, sm: 2.75 }, display: 'flex', flexDirection: 'column' }}>
										{/* Category Badge */}
										<Box sx={{ mb: 1.25 }}>
											<Chip
												label={event.category_label}
												size="small"
												sx={{
													bgcolor: 'rgba(13, 148, 136, 0.09)',
													color: '#0f766e',
													fontWeight: 700,
													fontSize: '0.72rem',
													height: 23,
													borderRadius: 1.5,
												}}
											/>
										</Box>

										{/* Event Title */}
										<Typography
											variant="h6"
											fontWeight={700}
											sx={{
												lineHeight: 1.35,
												color: '#0f172a',
												fontSize: '1.05rem',
												mb: 2,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												display: '-webkit-box',
												WebkitLineClamp: 2,
												WebkitBoxOrient: 'vertical',
												minHeight: '2.7em',
											}}
										>
											{event.title}
										</Typography>

										{/* Event Details: Date, Time & Registration */}
										<Stack spacing={1.25} sx={{ mb: 2.5, bgcolor: '#f8fafc', p: 1.75, borderRadius: 2.5, border: '1px solid #f1f5f9' }}>
											<Stack direction="row" spacing={1.25} alignItems="center">
												<CalendarTodayIcon sx={{ fontSize: 16, color: '#0d9488' }} />
												<Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.825rem' }}>
													{new Date(event.event_date).toLocaleDateString('en-IN', {
														day: 'numeric',
														month: 'short',
														year: 'numeric',
													})}
												</Typography>
											</Stack>
											<Stack direction="row" spacing={1.25} alignItems="center">
												<AccessTimeIcon sx={{ fontSize: 16, color: '#0d9488' }} />
												<Typography variant="body2" sx={{ color: '#475569', fontSize: '0.825rem' }}>
													{formatTime(event.event_time)} - {formatTime(event.end_time)}
												</Typography>
											</Stack>
											{event.registration_link && (
												<Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
													<LinkIcon sx={{ fontSize: 16, color: '#0d9488', flexShrink: 0 }} />
													<Typography
														variant="body2"
														noWrap
														component="a"
														href={event.registration_link}
														target="_blank"
														rel="noopener noreferrer"
														sx={{
															textDecoration: 'none',
															color: '#0d9488',
															fontWeight: 600,
															fontSize: '0.825rem',
															'&:hover': { textDecoration: 'underline' },
														}}
													>
														Registration Link
													</Typography>
												</Stack>
											)}
										</Stack>

										<Divider sx={{ my: 1.5, mt: 'auto', borderColor: '#f1f5f9' }} />

										{/* Footer Actions */}
										<Stack direction="row" justifyContent="space-between" alignItems="center">
											<Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>
												{new Date(event.created_at).toLocaleDateString('en-IN')}
											</Typography>

											<Stack direction="row" spacing={1}>
												<Tooltip title="Edit Event">
													<IconButton
														size="small"
														onClick={() => handleEditClick(event.id)}
														sx={{
															border: '1px solid #e2e8f0',
															borderRadius: 1.75,
															color: '#0d9488',
															bgcolor: '#f0fdfa',
															'&:hover': { bgcolor: '#ccfbf1', borderColor: '#0d9488' },
														}}
													>
														<EditIcon sx={{ fontSize: 16 }} />
													</IconButton>
												</Tooltip>
												<Tooltip title="Delete Event">
													<IconButton
														size="small"
														onClick={() => handleDeleteClick(event.id)}
														sx={{
															border: '1px solid #fecaca',
															borderRadius: 1.75,
															color: '#dc2626',
															bgcolor: '#fff1f2',
															'&:hover': { bgcolor: '#fee2e2', borderColor: '#f87171' },
														}}
													>
														<DeleteIcon sx={{ fontSize: 16 }} />
													</IconButton>
												</Tooltip>
											</Stack>
										</Stack>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
				)}
			</Container>

			<ConfirmModal
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
				onConfirm={handleDeleteConfirm}
				title="Delete Event"
				description="Are you sure you want to permanently delete this event? This action cannot be undone."
				variant="delete"
				confirmLabel="Delete"
				cancelLabel="Cancel"
				loading={deleteLoading}
			/>
		</Box>
	)
}
