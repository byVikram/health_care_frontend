// src/features/admin/pages/AdminEventsPage.tsx
import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Stack,
	Chip,
	Avatar,
	CircularProgress,
	Grid,
	Switch,
	FormControlLabel,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Tabs,
	Tab,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import EventIcon from '@mui/icons-material/Event'
import StarIcon from '@mui/icons-material/Star'

import AppSwitch from '../../../components/common/Switch/AppSwitch'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import ContentImageField from '../../../components/admin/ContentImageField'

import {
	listAdminEvents,
	createAdminEvent,
	updateAdminEvent,
	deleteAdminEvent,
	AdminEventItem,
} from '../adminService'
import { toast } from 'react-toastify'

const EVENT_CATEGORIES = [
	{ value: 'health_camp', label: 'Health Camp' },
	{ value: 'webinar', label: 'Webinar' },
	{ value: 'workshop', label: 'Workshop' },
	{ value: 'seminar', label: 'Seminar' },
	{ value: 'health_awareness', label: 'Health Awareness' },
	{ value: 'vaccination_camp', label: 'Vaccination Camp' },
	{ value: 'live_qa', label: 'Live Q&A' },
	{ value: 'fitness_wellness', label: 'Fitness & Wellness' },
	{ value: 'nutrition_session', label: 'Nutrition Session' },
	{ value: 'other', label: 'Other' },
]

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
	health_camp:       { bg: '#dbeafe', color: '#1d4ed8' },
	webinar:           { bg: '#fee2e2', color: '#dc2626' },
	workshop:          { bg: '#fef9c3', color: '#a16207' },
	seminar:           { bg: '#f3e8ff', color: '#7e22ce' },
	health_awareness:  { bg: '#ccfbf1', color: '#0f766e' },
}

export default function AdminEventsPage() {
	const [events, setEvents] = useState<AdminEventItem[]>([])
	const [loading, setLoading] = useState(true)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingEvent, setEditingEvent] = useState<AdminEventItem | null>(null)
	const [statusFilter, setStatusFilter] = useState('all')
	const [eventPendingDelete, setEventPendingDelete] = useState<AdminEventItem | null>(null)
	const [deleting, setDeleting] = useState(false)

	// Form State
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [category, setCategory] = useState('webinar')
	const [eventDate, setEventDate] = useState('')
	const [eventTime, setEventTime] = useState('')
	const [endTime, setEndTime] = useState('')
	const [registrationLink, setRegistrationLink] = useState('')
	const [coverImageUrl, setCoverImageUrl] = useState('')
	const [status, setStatus] = useState('published')
	const [locationType, setLocationType] = useState('offline')
	const [location, setLocation] = useState('')

	const fetchEvents = async () => {
		setLoading(true)
		try {
			const res = await listAdminEvents()
			setEvents(res.data)
		} catch (err) {
			console.error('Error fetching admin events:', err)
			toast.error('Failed to load events')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchEvents()
	}, [])

	const handleOpenCreate = () => {
		setEditingEvent(null)
		setTitle('')
		setDescription('')
		setCategory('webinar')
		setEventDate(new Date().toISOString().split('T')[0])
		setEventTime('10:00:00')
		setEndTime('11:00:00')
		setRegistrationLink('')
		setCoverImageUrl('')
		setStatus('published')
		setLocationType('offline')
		setLocation('')
		setDialogOpen(true)
	}

	const handleOpenEdit = (evt: AdminEventItem) => {
		setEditingEvent(evt)
		setTitle(evt.title)
		setDescription(evt.description || '')
		setCategory(evt.category)
		setEventDate(evt.event_date)
		setEventTime(evt.event_time)
		setEndTime(evt.end_time)
		setRegistrationLink(evt.registration_link || '')
		setCoverImageUrl(evt.cover_image_url || '')
		setStatus(evt.status)
		setLocationType(evt.location_type || 'offline')
		setLocation(evt.location || '')
		setDialogOpen(true)
	}

	const handleSubmit = async () => {
		if (!title.trim()) { toast.warning('Title is required'); return }
		if (!category) { toast.warning('Category is required'); return }
		if (!eventDate || !eventTime || !endTime) { toast.warning('Date and Times are required'); return }
		
		const trimmedLocation = location.trim()
		if (locationType === 'online' && !registrationLink.trim()) {
			toast.warning('Registration Link is required for online events'); return
		}
		if (locationType === 'offline' && !trimmedLocation) {
			toast.warning('Location is required for offline events'); return
		}

		try {
			const payload = {
				title,
				description,
				category,
				event_date: eventDate,
				event_time: eventTime.length === 5 ? eventTime + ":00" : eventTime,
				end_time: endTime.length === 5 ? endTime + ":00" : endTime,
				registration_link: locationType === 'online' ? registrationLink : undefined,
				cover_image_url: coverImageUrl,
				status,
				location_type: locationType,
				location: locationType === 'offline' ? trimmedLocation : undefined,
			}
			if (editingEvent) {
				await updateAdminEvent(editingEvent.id, payload)
				toast.success('Event updated successfully!')
			} else {
				await createAdminEvent(payload)
				toast.success('Event created successfully!')
			}
			setDialogOpen(false)
			await fetchEvents()
		} catch (err: any) {
			console.error('Error saving event:', err)
			toast.error(err.response?.data?.message || 'Failed to save event details')
		}
	}

	const handleConfirmDelete = async () => {
		if (!eventPendingDelete) return
		setDeleting(true)
		try {
			await deleteAdminEvent(eventPendingDelete.id)
			toast.success('Event deleted successfully')
			setEvents((prev) => prev.filter((e) => e.id !== eventPendingDelete.id))
			setEventPendingDelete(null)
		} catch (err) {
			console.error('Error deleting event:', err)
			toast.error('Failed to delete event')
		} finally {
			setDeleting(false)
		}
	}

	const handleToggleStatus = async (evt: AdminEventItem) => {
		try {
			const targetStatus = evt.status === 'published' ? 'draft' : 'published'
			await updateAdminEvent(evt.id, { status: targetStatus })
			toast.success(`${evt.title} is now ${targetStatus}`)
			setEvents((prev) => prev.map((e) => (e.id === evt.id ? { ...e, status: targetStatus } : e)))
		} catch (err) {
			console.error('Error toggling status:', err)
			toast.error('Failed to toggle event status')
		}
	}

	const columns: Column<AdminEventItem>[] = [
		{
			field: 'title',
			label: 'Event Details',
			render: (_, evt) => {
				const style = CATEGORY_COLORS[evt.category] ?? { bg: '#f1f5f9', color: '#475569' }
				return (
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Avatar
							sx={{ width: 36, height: 36, bgcolor: style.bg, color: style.color, flexShrink: 0 }}
						>
							<EventIcon sx={{ fontSize: 18 }} />
						</Avatar>
						<Box sx={{ minWidth: 0 }}>
							<Stack direction="row" spacing={1} alignItems="center">
								<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
									{evt.title}
								</Typography>
								{evt.status === 'published' && (
									<Chip
										icon={<StarIcon sx={{ fontSize: '11px !important', color: '#16a34a !important' }} />}
										label="Published"
										size="small"
										sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
									/>
								)}
							</Stack>
							<Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 260, display: 'block' }}>
								{evt.event_date} | {evt.event_time} - {evt.end_time}
							</Typography>
						</Box>
					</Stack>
				)
			},
		},
		{
			field: 'category',
			label: 'Category',
			render: (_, evt) => {
				const style = CATEGORY_COLORS[evt.category] ?? { bg: '#f1f5f9', color: '#475569' }
				const label = EVENT_CATEGORIES.find(c => c.value === evt.category)?.label || evt.category
				return (
					<Chip
						label={label}
						size="small"
						sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: '0.68rem', borderRadius: '6px', height: 22 }}
					/>
				)
			},
		},
		{
			field: 'registration_link',
			label: 'Link',
			render: (_, evt) => (
				<Typography variant="caption" sx={{ color: evt.registration_link ? '#0d9488' : '#64748b' }}>
					{evt.registration_link ? (
						<a href={evt.registration_link} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
							View Link
						</a>
					) : 'None'}
				</Typography>
			),
		},
		{
			field: 'status',
			label: 'Published',
			render: (_, evt) => (
				<FormControlLabel
					control={
						<AppSwitch
							checked={evt.status === 'published'}
							onChange={() => handleToggleStatus(evt)}
						/>
					}
					label={
						<Typography variant="caption" fontWeight={600} color={evt.status === 'published' ? '#0d9488' : 'text.secondary'}>
							{evt.status === 'published' ? 'Yes' : 'No'}
						</Typography>
					}
					sx={{ m: 0 }}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_, evt) => (
				<Stack direction="row" spacing={0.75} justifyContent="flex-end">
					<Tooltip title="Edit Event">
						<IconButton
							size="small"
							onClick={() => handleOpenEdit(evt)}
							sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#0d9488', '&:hover': { bgcolor: 'rgba(13,148,136,0.06)' } }}
						>
							<EditIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete Event">
						<IconButton
							size="small"
							onClick={() => setEventPendingDelete(evt)}
							sx={{ border: '1px solid #fecaca', borderRadius: 1.5, color: '#dc2626', bgcolor: '#fff1f2', '&:hover': { bgcolor: '#fee2e2' } }}
						>
							<DeleteIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
				</Stack>
			),
		},
	]

	return (
		<Box>
			<AdminPageHeader
				title="Platform Events"
				subtitle="Manage platform-wide events, webinars, and health camps."
				count={events.length}
				countLabel="events"
				actions={
					<>
						<Tooltip title="Refresh list">
							<IconButton
								onClick={fetchEvents}
								sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#64748b', '&:hover': { color: '#0f172a' } }}
							>
								<RefreshIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<AppButton
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleOpenCreate}
							label="Create Event"
							sx={{ bgcolor: '#0d9488', fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }}
						/>
					</>
				}
			/>

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>Loading events...</Typography>
				</Stack>
			) : (
				<>
					<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
						<Tabs 
							value={statusFilter} 
							onChange={(_, v) => setStatusFilter(v)}
							sx={{
								'& .MuiTabs-indicator': { bgcolor: '#0d9488' },
								'& .MuiTab-root': { textTransform: 'none', fontWeight: 600, '&.Mui-selected': { color: '#0d9488' } }
							}}
						>
							<Tab label={`All (${events.filter(e => !e.is_expired).length})`} value="all" />
							<Tab label={`Published (${events.filter(e => e.status === 'published' && !e.is_expired).length})`} value="published" />
							<Tab label={`Drafts (${events.filter(e => e.status === 'draft' && !e.is_expired).length})`} value="draft" />
							<Tab label={`Expired (${events.filter(e => e.is_expired).length})`} value="expired" />
						</Tabs>
					</Box>
					<AppTable<AdminEventItem>
						columns={columns}
						rows={events.filter((ev) => {
							const isExpired = Boolean(ev.is_expired)
							if (statusFilter === 'all') return !isExpired
							if (statusFilter === 'published') return ev.status === 'published' && !isExpired
							if (statusFilter === 'draft') return ev.status === 'draft' && !isExpired
							if (statusFilter === 'expired') return isExpired
							return true
						})}
						emptyMessage='No events configured. Click "Create Event" to add one.'
					/>
				</>
			)}

			{/* Create/Edit Dialog */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
				<DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1 }}>
					{editingEvent ? 'Edit Event' : 'Create New Event'}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={2.5} sx={{ pt: 1.5 }}>
						<AppInput fullWidth label="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Free Cardiac Health Camp" />
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 4 }}>
								<AppSelect
									fullWidth
									label="Category"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									options={EVENT_CATEGORIES}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 4 }}>
								<AppInput 
									fullWidth 
									type="date" 
									label="Date" 
									value={eventDate} 
									onChange={(e) => setEventDate(e.target.value)} 
								/>
							</Grid>
							<Grid size={{ xs: 6, sm: 2 }}>
								<AppInput 
									fullWidth 
									type="time" 
									label="Start Time" 
									value={eventTime} 
									onChange={(e) => setEventTime(e.target.value)} 
								/>
							</Grid>
							<Grid size={{ xs: 6, sm: 2 }}>
								<AppInput 
									fullWidth 
									type="time" 
									label="End Time" 
									value={endTime} 
									onChange={(e) => setEndTime(e.target.value)} 
								/>
							</Grid>
						</Grid>
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppSelect
									fullWidth
									label="Event Mode"
									value={locationType}
									onChange={(e) => setLocationType(e.target.value)}
									options={[
										{ value: 'offline', label: 'Offline' },
										{ value: 'online', label: 'Online' },
									]}
								/>
							</Grid>
							{locationType === 'offline' && (
								<Grid size={{ xs: 12, sm: 6 }}>
									<AppInput
										fullWidth
										label="Location"
										placeholder="Enter venue/location..."
										value={location}
										onChange={(e) => setLocation(e.target.value)}
									/>
								</Grid>
							)}
						</Grid>
						{locationType === 'online' && (
							<AppInput fullWidth label="Registration / Meeting Link" placeholder="https://..." value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} />
						)}
						<ContentImageField label="Cover Image (Optional)" kind="events" value={coverImageUrl} onChange={setCoverImageUrl} previewHeight={140} />
						<AppInput fullWidth multiline rows={4} label="Description" placeholder="Detailed event description..." value={description} onChange={(e) => setDescription(e.target.value)} />
						
						<FormControlLabel
							control={<AppSwitch checked={status === 'published'} onChange={(e) => setStatus(e.target.checked ? 'published' : 'draft')} />}
							label={<Typography variant="body2">Publish Event (Make visible to users)</Typography>}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1.5, gap: 1 }}>
					<AppButton variant="text" onClick={() => setDialogOpen(false)} label="Cancel" sx={{ color: '#64748b' }} />
					<AppButton variant="contained" onClick={handleSubmit} label={editingEvent ? 'Save Changes' : 'Create Event'} sx={{ bgcolor: '#0d9488', fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }} />
				</DialogActions>
			</Dialog>

			<ConfirmModal
				open={eventPendingDelete !== null}
				onClose={() => setEventPendingDelete(null)}
				onConfirm={handleConfirmDelete}
				title="Delete Event"
				description={`Are you sure you want to delete "${eventPendingDelete?.title}"? This action cannot be undone.`}
				variant="delete"
				confirmLabel="Delete Event"
				loading={deleting}
			/>
		</Box>
	)
}
