// src/features/doctor/events/DoctorEventFormPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
	Box,
	Container,
	Typography,
	Stack,
	Grid,
	Card,
	CardContent,
	Paper,
	CircularProgress,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import PublishIcon from '@mui/icons-material/Publish'
import { toast } from 'react-toastify'

import { useAuth } from '../../../hooks/useAuth'
import { ROUTES } from '../../../constants/routes'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'
import AppSelect from '../../../components/common/Select/AppSelect'
import {
	createEvent,
	updateEvent,
	getEventDetail,
	EVENT_CATEGORIES,
} from './eventService'

export default function DoctorEventFormPage() {
	const navigate = useNavigate()
	const { id } = useParams<{ id?: string }>()
	const { role } = useAuth()
	const isEditMode = !!id

	// Loading states
	const [fetching, setFetching] = useState(isEditMode)
	const [submitting, setSubmitting] = useState(false)

	// Form fields state
	const [title, setTitle] = useState('')
	const [coverImageUrl, setCoverImageUrl] = useState('')
	const [category, setCategory] = useState('health_camp')
	const [eventDate, setEventDate] = useState('')
	const [eventTime, setEventTime] = useState('')
	const [endTime, setEndTime] = useState('')
	const [registrationLink, setRegistrationLink] = useState('')
	const [description, setDescription] = useState('')

	// Role guard
	useEffect(() => {
		if (role !== 'doctor') {
			navigate(ROUTES.PORTAL.HOME, { replace: true })
		}
	}, [role, navigate])

	// Fetch event details in edit mode
	useEffect(() => {
		const loadEvent = async () => {
			if (!id) return
			try {
				const event = await getEventDetail(id)
				setTitle(event.title)
				setCoverImageUrl(event.cover_image_url || '')
				setCategory(event.category)
				setEventDate(event.event_date)
				setEventTime(event.event_time.substring(0, 5))
				setEndTime(event.end_time.substring(0, 5))
				setRegistrationLink(event.registration_link || '')
				setDescription(event.description)
			} catch (err) {
				console.error('Error loading event:', err)
				toast.error('Failed to load event details')
				navigate(ROUTES.DOCTOR.EVENTS)
			} finally {
				setFetching(false)
			}
		}

		if (role === 'doctor' && isEditMode) {
			loadEvent()
		}
	}, [id, role, isEditMode, navigate])

	const handleBack = () => navigate(ROUTES.DOCTOR.EVENTS)

	const handleSave = async (status: 'draft' | 'published') => {
		const trimmedTitle = title.trim()
		const trimmedDesc = description.trim()
		const trimmedReg = registrationLink.trim()
		const trimmedCover = coverImageUrl.trim()

		// Required field validations
		if (!trimmedTitle) {
			toast.warning('Please enter an event title')
			return
		}
		if (!category) {
			toast.warning('Please select an event category')
			return
		}
		if (!eventDate) {
			toast.warning('Please select an event date')
			return
		}
		if (!eventTime) {
			toast.warning('Please select a start time')
			return
		}
		if (!endTime) {
			toast.warning('Please select an end time')
			return
		}
		if (!trimmedDesc) {
			toast.warning('Please enter an event description')
			return
		}

		// URL Validation for registration link
		if (trimmedReg) {
			if (!trimmedReg.startsWith('http://') && !trimmedReg.startsWith('https://')) {
				toast.warning('Registration link must be a valid URL starting with http:// or https://')
				return
			}
		}

		// End Time must be later than Start Time
		if (endTime <= eventTime) {
			toast.warning('End Time must be later than Start Time')
			return
		}

		// Event Date cannot be in the past when publishing
		if (status === 'published') {
			const todayStr = new Date().toISOString().split('T')[0]
			if (eventDate < todayStr) {
				toast.warning('Event date cannot be in the past when publishing')
				return
			}
		}

		setSubmitting(true)
		const payload = {
			title: trimmedTitle,
			category,
			event_date: eventDate,
			event_time: eventTime,
			end_time: endTime,
			registration_link: trimmedReg || undefined,
			description: trimmedDesc,
			cover_image_url: trimmedCover || undefined,
			status,
		}

		try {
			if (isEditMode && id) {
				await updateEvent(id, payload)
				toast.success(`Event successfully updated and saved as ${status.toUpperCase()}!`)
			} else {
				await createEvent(payload)
				toast.success(`Event successfully created and saved as ${status.toUpperCase()}!`)
			}
			navigate(ROUTES.DOCTOR.EVENTS)
		} catch (err) {
			console.error('Error saving event:', err)
		} finally {
			setSubmitting(false)
		}
	}

	if (role !== 'doctor') {
		return null
	}

	if (fetching) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
				<CircularProgress sx={{ color: '#0d9488', mb: 2 }} />
				<Typography variant="body2" color="text.secondary">
					Loading event details...
				</Typography>
			</Box>
		)
	}

	return (
		<Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2.5, sm: 4, md: 5 } }}>
			<Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
				<AdminPageHeader
					title={isEditMode ? 'Edit Event & Seminar' : 'Schedule Event & Seminar'}
					subtitle={isEditMode ? 'Modify details of your scheduled event.' : 'Schedule a new medical drive, webinar, or public seminar for patients.'}
					actions={
						<AppButton
							variant="outlined"
							startIcon={<ArrowBackIcon />}
							onClick={handleBack}
							label="Back to Events"
							sx={{
								borderColor: '#cbd5e1',
								color: '#64748b',
								textTransform: 'none',
								borderRadius: 2,
								'&:hover': { borderColor: '#0f172a', color: '#0f172a' },
							}}
						/>
					}
				/>

				<Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ mt: 1 }}>
					{/* Left Column - Main Details Form */}
					<Grid size={{ xs: 12, md: 8 }}>
						<Paper
							elevation={0}
							sx={{
								p: { xs: 2.5, sm: 3.5 },
								borderRadius: 3.5,
								border: '1px solid #e2e8f0',
								bgcolor: '#ffffff',
								boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
							}}
						>
							<Typography variant="subtitle2" fontWeight={800} color="#0d9488" sx={{ textTransform: 'uppercase', mb: 3, letterSpacing: '0.05em' }}>
								Event Information
							</Typography>

							<Stack spacing={3}>
								<AppInput
									label="Event Title"
									placeholder="Enter event name or title..."
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									fullWidth
								/>

								<Grid container spacing={2}>
									<Grid size={{ xs: 12, sm: 6 }}>
										<AppSelect
											label="Event Category"
											value={category}
											onChange={(e) => setCategory(e.target.value)}
											options={EVENT_CATEGORIES}
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<AppInput
											label="Event Date"
											type="date"
											value={eventDate}
											onChange={(e) => setEventDate(e.target.value)}
											fullWidth
											InputLabelProps={{ shrink: true }}
										/>
									</Grid>
								</Grid>

								<Grid container spacing={2}>
									<Grid size={{ xs: 12, sm: 6 }}>
										<AppInput
											label="Start Time"
											type="time"
											value={eventTime}
											onChange={(e) => setEventTime(e.target.value)}
											fullWidth
											InputLabelProps={{ shrink: true }}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<AppInput
											label="End Time"
											type="time"
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
											fullWidth
											InputLabelProps={{ shrink: true }}
										/>
									</Grid>
								</Grid>

								<AppInput
									label="Registration Link (Optional)"
									placeholder="https://example.com/register"
									value={registrationLink}
									onChange={(e) => setRegistrationLink(e.target.value)}
									fullWidth
								/>

								<AppInput
									label="Event Description"
									placeholder="Provide a detailed description of what the event is about, guidelines, speakers, and goals..."
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									multiline
									rows={6}
									fullWidth
								/>
							</Stack>
						</Paper>
					</Grid>

					{/* Right Column - Actions and Cover */}
					<Grid size={{ xs: 12, md: 4 }}>
						<Stack spacing={3}>
							{/* Actions Card */}
							<Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)', bgcolor: '#ffffff' }}>
								<CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
									<Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
										Actions
									</Typography>
									<Stack spacing={1.5}>
										<AppButton
											variant="contained"
											fullWidth
											disabled={submitting}
											startIcon={<PublishIcon />}
											onClick={() => handleSave('published')}
											label={isEditMode ? 'Publish Changes' : 'Publish Event'}
											sx={{
												bgcolor: '#0d9488',
												fontWeight: 700,
												py: 1.25,
												borderRadius: 2,
												boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
												'&:hover': { bgcolor: '#0f766e' },
											}}
										/>
										<AppButton
											variant="outlined"
											fullWidth
											disabled={submitting}
											startIcon={<SaveIcon />}
											onClick={() => handleSave('draft')}
											label="Save as Draft"
											sx={{
												borderColor: '#0d9488',
												color: '#0d9488',
												fontWeight: 700,
												py: 1.25,
												borderRadius: 2,
												'&:hover': { bgcolor: 'rgba(13,148,136,0.04)', borderColor: '#0d9488' },
											}}
										/>
										<AppButton
											fullWidth
											variant="text"
											onClick={handleBack}
											label="Cancel & Discard"
											sx={{
												fontWeight: 600,
												color: '#64748b',
												borderRadius: 2,
											}}
										/>
									</Stack>
								</CardContent>
							</Card>

							{/* Cover Photo Card */}
							<Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)', bgcolor: '#ffffff' }}>
								<CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
									<Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
										Cover Photo
									</Typography>
									<Stack spacing={2}>
										<AppInput
											label="Cover Image URL"
											placeholder="https://images.unsplash.com/..."
											value={coverImageUrl}
											onChange={(e) => setCoverImageUrl(e.target.value)}
											fullWidth
										/>
										{coverImageUrl.trim() ? (
											<Box>
												<Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
													Cover Preview
												</Typography>
												<Box
													component="img"
													src={coverImageUrl}
													alt="Cover Preview"
													onError={(e) => {
														;(e.target as HTMLElement).style.display = 'none'
													}}
													sx={{
														width: '100%',
														height: 150,
														objectFit: 'cover',
														borderRadius: 2.5,
														border: '1px solid #e2e8f0',
													}}
												/>
											</Box>
										) : (
											<Box
												sx={{
													width: '100%',
													height: 120,
													borderRadius: 2.5,
													border: '1px dashed #cbd5e1',
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													justifyContent: 'center',
													bgcolor: '#f8fafc',
													color: '#94a3b8',
													textAlign: 'center',
													p: 2,
												}}
											>
												<Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>
													No cover image URL provided.
												</Typography>
												<Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 0.5 }}>
													Will default to standard medical banner.
												</Typography>
											</Box>
										)}
									</Stack>
								</CardContent>
							</Card>
						</Stack>
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
