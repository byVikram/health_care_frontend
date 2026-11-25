// src/features/doctor/DoctorDetailPage.tsx
import { getBrowserPosition } from '../../../hooks/useCurrentLocation'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Box, Container, Typography, Divider, Grid, Card, Avatar, Chip, Radio } from '@mui/material'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
// import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
// import PersonIcon from '@mui/icons-material/Person'
import DoctorProfileCard from './components/DoctorProfileCard'
import AppSelect from '../../../components/common/Select/AppSelect'
// import AppointmentTypeSelector from './components/AppointmentTypeSelector'
import AppButton from '../../../components/common/Button/AppButton'
import DateSlotPicker, { SlotGroup, TimeSlot } from '../../../components/common/DateSlotPicker/DateSlotPicker'
import AppModal from '../../../components/common/Modal/AppModal'
import { useLoginPrompt } from '../../../components/common/AuthModal/useLoginPrompt'

import { customCardStyle } from '../../../styles/commonStyles'
import { AppointmentType } from '../../../types/doctor'
import { DoctorDetailData } from '../../../types/doctor-detail'
import { getDoctorById, getDoctorAvailability } from '../doctorService'
import { getBookingRestriction, type BookingRestriction } from '../../../services/appointmentService'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import ConsentForm from '../../appointments/components/ConsentForm'
import { useAuth } from '../../../hooks/useAuth'
import { BOOKING_WINDOW_DAYS } from '../../../constants/constants'
import { useFamilyMembers } from '../../../hooks/useFamilyMembers'
import AchievementCard, { AchievementCardData } from '../../../components/common/Card/AchievementCard'
import HorizontalCardCarousel from '../../../components/common/Carousel/HorizontalCardCarousel'
import ProfessionalDetailsSection from './components/ProfessionalDetailsSection'
import AchievementDetailsModal from '../../../components/common/Modal/AchievementDetailsModal'
import { buildS3Url } from '../../../utils/s3'

type AvailabilityMode = 'clinic' | 'video'
type ApiAvailabilityMode = 'clinic_visit' | 'video_call'
type ApiAvailabilityBlock = {
	appointment_mode?: ApiAvailabilityMode
	sessions?: SlotGroup[]
}

/** One line under a person's name: "45 Yrs • Male • Blood: O+" (parts that are not known are left out). */
const personSummary = (p: { age: string | number; gender: string; bloodGroup?: string }, bloodLabel = 'Blood') =>
	[p.age ? `${p.age} Yrs` : '', p.gender, p.bloodGroup ? `${bloodLabel}: ${p.bloodGroup}` : ''].filter(Boolean).join(' • ')

const EMPTY_MODE_SLOTS: Record<AvailabilityMode, SlotGroup[]> = { clinic: [], video: [] }

const normalizeAvailabilityByMode = (payload: unknown): Record<AvailabilityMode, SlotGroup[]> => {
	const data = Array.isArray(payload)
		? payload
		: payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)
			? (payload as { data: unknown[] }).data
			: []

	if (data.length === 0) return EMPTY_MODE_SLOTS

	// Backward compatibility: older API returned SlotGroup[] directly.
	if (data[0] && typeof data[0] === 'object' && 'label' in (data[0] as object) && 'slots' in (data[0] as object)) {
		return { clinic: data as SlotGroup[], video: [] }
	}

	const mapped: Record<AvailabilityMode, SlotGroup[]> = { clinic: [], video: [] }
	for (const item of data as ApiAvailabilityBlock[]) {
		const mode = item.appointment_mode
		const sessions = Array.isArray(item.sessions) ? item.sessions : []
		if (mode === 'clinic_visit') mapped.clinic = sessions
		if (mode === 'video_call') mapped.video = sessions
	}
	return mapped
}


export default function DoctorDetailPage() {
	const [selectedHospital, setSelectedHospital] = useState('')
	const [selectedType, setSelectedType] = useState<'clinic' | 'video'>('clinic')
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [selectedTime, setSelectedTime] = useState('')
	const [showFullAbout, setShowFullAbout] = useState(false)
	const [selectedAchievement, setSelectedAchievement] = useState<AchievementCardData | null>(null)
	const [detailsModalOpen, setDetailsModalOpen] = useState(false)

	// Patient selection / Booking For state
	// The signed-in patient and their family members, from the backend (the account holder first). Choosing one only sets
	// who this appointment is for; it never changes who is signed in.
	const { members: patientProfiles } = useFamilyMembers()
	const [selectedPatientId, setSelectedPatientId] = useState<string>('')

	// Modals State
	const [switchPatientModalOpen, setSwitchPatientModalOpen] = useState(false)



	const [consentOpen, setConsentOpen] = useState(false)



	const [doctorDetail, setDoctorDetail] = useState<DoctorDetailData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [availableSlotGroups, setAvailableSlotGroups] = useState<SlotGroup[]>([])
	const [slotsLoading, setSlotsLoading] = useState(false)

	const { id } = useParams<{ id: string }>()
	const [searchParams] = useSearchParams()
	const referralId = searchParams.get('referral_id') ?? undefined

	const navigate = useNavigate()


	const { prompt: promptLogin, modal: loginModal } = useLoginPrompt('Login to book an appointment')
	const { accessToken, role } = useAuth()

	// Online booking can be paused for a patient (repeated missed appointments). Ask early, so they are told on this page and not after
	// picking a slot, accepting the consent and paying. A failed lookup is ignored: the server enforces the pause when booking.
	const [restriction, setRestriction] = useState<BookingRestriction | null>(null)
	useEffect(() => {
		if (!accessToken || role !== 'patient') {
			setRestriction(null)
			return
		}
		let active = true
		const load = async () => {
			try {
				const result = await getBookingRestriction()
				if (active) setRestriction(result)
			} catch {
				if (active) setRestriction(null)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [accessToken, role])


	const selectedPatient = patientProfiles.find((p) => p.id === selectedPatientId) || patientProfiles[0]

	const primaryHospital =
		doctorDetail?.hospitals.find((h) => h.is_primary) ||
		(doctorDetail?.hospitals.length ? doctorDetail.hospitals[0] : null)

	const selectedHospitalEntry =
		doctorDetail?.hospitals.find((h) => h.hospital.id === selectedHospital) || primaryHospital

	const appointmentTypes: AppointmentType[] = [
		{
			id: 'clinic',
			label: 'Clinic Visit',
			description: 'In-person consultation',
			price: Number(selectedHospitalEntry?.offline_consultation_fee) || 0,		
			duration: 30,
		},
		{
			id: 'video',
			label: 'Video Call',
			description: 'Online consultation',
			price: Number(selectedHospitalEntry?.video_consultation_fee) || 0,
			duration: 30,
		},
	]

	useEffect(() => {
		if (!id) return
		let active = true
		const controller = new AbortController()

		const fetchDoctor = async () => {
			try {
				setLoading(true)
				setError(null)
				
				const cachedLat = sessionStorage.getItem('user_lat')
				const cachedLon = sessionStorage.getItem('user_lon')
				let lat = cachedLat ? parseFloat(cachedLat) : undefined
				let lon = cachedLon ? parseFloat(cachedLon) : undefined
				
				if (lat === undefined || lon === undefined) {
					const here = await getBrowserPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
					// no position: the default one (Bengaluru)
					lat = here.coords?.latitude ?? 12.9716
					lon = here.coords?.longitude ?? 77.5946
					sessionStorage.setItem('user_lat', lat.toString())
					sessionStorage.setItem('user_lon', lon.toString())
				}
				
				if (!active) return

				const res = await getDoctorById(id, lat, lon, controller.signal)
				if (!active) return
				setDoctorDetail(res.data)
				if (res.data.hospitals && res.data.hospitals.length > 0) {
					const primaryHospitalData =
						res.data.hospitals.find((h: { is_primary: boolean }) => h.is_primary) ||
						res.data.hospitals[0]
					setSelectedHospital(primaryHospitalData.hospital.id)
				}
			} catch (err) {
				console.error(err)
				if (!active) return
				setError('Failed to fetch doctor details')
			} finally {
				if (active) setLoading(false)
			}
		}

		fetchDoctor()
		return () => {
			active = false
			controller.abort()
		}
	}, [id])

	const formatDateForApi = (date: Date) => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const formatTimeForApi = (timeLabel: string) => {
		const trimmed = timeLabel.trim().toUpperCase()
		const match = trimmed.match(/^(\d{1,2}):(\d{2})(AM|PM)$/)
		if (!match) return timeLabel
		const [, hText, mText, suffix] = match
		let hour = Number.parseInt(hText, 10)
		if (suffix === 'PM' && hour !== 12) hour += 12
		if (suffix === 'AM' && hour === 12) hour = 0
		return `${String(hour).padStart(2, '0')}:${mText}`
	}

	useEffect(() => {
		if (!id || !selectedHospital || !selectedDate) return
		let active = true

		const fetchAvailability = async () => {
			try {
				setSlotsLoading(true)
				const res = await getDoctorAvailability({
					doctor_id: id,
					hospital_id: selectedHospital,
					date: formatDateForApi(selectedDate),
				})
				if (!active) return
				const byMode = normalizeAvailabilityByMode(res)
				let filteredSlots = byMode[selectedType] ?? []

				// Hide expired, unbooked, available slots for the current day.
				// Booked slots continue to show for visibility/reference.
				const now = new Date()
				const isToday =
					selectedDate.getFullYear() === now.getFullYear() &&
					selectedDate.getMonth() === now.getMonth() &&
					selectedDate.getDate() === now.getDate()

				if (isToday) {
					const currentHour = now.getHours()
					const currentMinute = now.getMinutes()

					filteredSlots = filteredSlots
						.map((group) => ({
							...group,
							slots: group.slots.filter((slot) => {
								// Always keep booked slots visible
								if (slot.is_booked) return true
								// Only hide available (non-booked) slots that have passed
								const [hStr, mStr] = slot.start_time.split(':')
								const slotHour = parseInt(hStr, 10)
								const slotMinute = parseInt(mStr ?? '0', 10)
								// Keep the slot if its time has NOT yet passed
								return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute)
							}),
						}))
						// Remove groups that have no visible slots remaining
						.filter((group) => group.slots.length > 0)
				}

				setAvailableSlotGroups(filteredSlots)
				// A time chosen for another date, hospital or mode may not exist here: never book a slot the patient cannot see.
				const offered = new Set(filteredSlots.flatMap((group) => group.slots.filter((s) => s.status === 'AVAILABLE').map((s) => s.start_time)))
				setSelectedTime((current) => (current && offered.has(current) ? current : ''))
			} catch (err) {
				console.log(err)
				if (!active) return
				setAvailableSlotGroups([])
				setSelectedTime('')
			} finally {
				if (active) {
					setSlotsLoading(false)
				}
			}
		}

		fetchAvailability()
		return () => {
			active = false
		}
	}, [id, selectedHospital, selectedDate, selectedType])

	const availableSlotStrings: string[] = []
	if (Array.isArray(availableSlotGroups)) {
		availableSlotGroups.forEach((group) => {
			if (group.slots && Array.isArray(group.slots)) {
				group.slots.forEach((s: TimeSlot) => {
					if (s.status === 'AVAILABLE') {
						availableSlotStrings.push(s.start_time)
					}
				})
			}
		})
	}

	const resolvedSelectedTime = selectedTime

	// Booking needs a slot: the date, the time and, for a clinic visit, the hospital. Nothing is booked while the slots load or while
	// the patient's online booking is paused.
	const bookingPaused = restriction?.restricted === true
	const canBook = !!resolvedSelectedTime && !!selectedDate && !!selectedHospital && !slotsLoading && !bookingPaused

	const aboutText = (() => {
		const about = doctorDetail?.details?.about
		if (!about) return 'No description available.'
		if (showFullAbout) return about
		return about.length > 120 ? `${about.slice(0, 120)}...` : about
	})()

	if (error) {
		return (
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
				<Typography variant="h5" sx={{ color: 'error.main' }}>
					{error}
				</Typography>
			</Box>
		)
	}


	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
			<Container maxWidth="lg">
				<Grid container spacing={4}>
					{/* -- LEFT COLUMN -- */}
					<Grid size={{ xs: 12, md: 7 }}>
						{loading ? (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
								<Card sx={{ ...customCardStyle, p: 4 }}>
									<Box sx={{ width: '100%', display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
										<AppSkeleton width={80} height={80} sx={{ borderRadius: '50%' }} />
										<Box mb={2}>
											<AppSkeleton variant="text" width={200} height={24} />
											<AppSkeleton variant="text" width={200} height={24} />
											<AppSkeleton variant="text" width={200} height={24} />
											<AppSkeleton variant="text" width={200} height={24} />
										</Box>
									</Box>
									<Divider />
									<Box mt={2} display={'flex'} justifyContent={'space-between'}>
										<AppSkeleton width={80} height={80} />
										<AppSkeleton width={80} height={80} />
										<AppSkeleton width={80} height={80} />
										<AppSkeleton width={80} height={80} />
									</Box>
								</Card>
								<Card sx={{ ...customCardStyle, p: 2 }}>
									<AppSkeleton variant="text" width={160} height={30} />
									<AppSkeleton sx={{ mt: 1 }} height={60} />
									<Divider sx={{ my: 2 }} />
									<AppSkeleton sx={{ mt: 1 }} height={60} />
								</Card>
								<Card sx={{ ...customCardStyle, p: 2 }}>
									<AppSkeleton variant="text" width={160} height={30} />
									<AppSkeleton sx={{ mt: 1 }} height={60} />
								</Card>
								<Card sx={{ ...customCardStyle, p: 2 }}>
									<AppSkeleton variant="text" width={160} height={30} />
									<AppSkeleton sx={{ mt: 1 }} height={60} />
								</Card>
							</Box>
						) : (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
								{doctorDetail && (
									<>
										<DoctorProfileCard doctor={doctorDetail} selectedHospitalId={selectedHospital} />
										<Box sx={{ ...customCardStyle, p: 3 }}>
											<Typography variant="h5" sx={{ mb: 1.5 }}>
												About
											</Typography>
											<Typography variant="body2">
												{aboutText}
												<Typography
													component="span"
													onClick={() => setShowFullAbout(!showFullAbout)}
													sx={{
														color: 'primary.main',
														fontWeight: 600,
														cursor: 'pointer',
														ml: 0.5,
														fontSize: '14px',
													}}
												>
													{showFullAbout ? 'Show less' : 'Read more'}
												</Typography>
											</Typography>
										</Box>
										<ProfessionalDetailsSection doctorDetail={doctorDetail} />
										{doctorDetail.achievements && doctorDetail.achievements.length > 0 && (
											<Box sx={{ ...customCardStyle, p: 3 }}>
												<Typography variant="h5" sx={{ mb: 2 }}>
													Achievements
												</Typography>
												<HorizontalCardCarousel gap={2} ariaLabel="doctor-achievements">
													{doctorDetail.achievements.map((achievement) => (
														<AchievementCard
															key={achievement.id}
															achievement={achievement}
															onClick={(ach) => {
																setSelectedAchievement(ach)
																setDetailsModalOpen(true)
															}}
														/>
													))}
												</HorizontalCardCarousel>
											</Box>
										)}

										{/* Location Section */}
										<Box sx={{ ...customCardStyle, p: 3 }}>
											<Typography variant="h5" sx={{ mb: 2 }}>
												Location
											</Typography>
											{selectedHospitalEntry?.hospital ? (
												<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
													<Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
														<Box
															sx={{
																bgcolor: 'rgba(43,111,113,0.08)',
																color: 'primary.main',
																p: 1,
																borderRadius: '8px',
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																flexShrink: 0,
															}}
														>
															<PlaceOutlinedIcon sx={{ fontSize: 22 }} />
														</Box>
														<Box>
															<Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
																{selectedHospitalEntry.hospital.name}
															</Typography>
															<Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
																{selectedHospitalEntry.hospital.address || 'No address details available.'}
															</Typography>
														</Box>
													</Box>

													{/* Embedded Map Widget */}
													<Box
														sx={{
															width: '100%',
															height: 250,
															borderRadius: '12px',
															overflow: 'hidden',
															border: '1px solid',
															borderColor: 'divider',
															bgcolor: 'action.hover',
														}}
													>
														<iframe
															title={`Map of ${selectedHospitalEntry.hospital.name}`}
															width="100%"
															height="100%"
															style={{ border: 0 }}
															src={
																selectedHospitalEntry.hospital.latitude && selectedHospitalEntry.hospital.longitude
																	? `https://maps.google.com/maps?q=${selectedHospitalEntry.hospital.latitude},${selectedHospitalEntry.hospital.longitude}&z=15&output=embed`
																	: `https://maps.google.com/maps?q=${encodeURIComponent(
																			selectedHospitalEntry.hospital.address || selectedHospitalEntry.hospital.name
																		)}&z=15&output=embed`
															}
															allowFullScreen
															loading="lazy"
														/>
													</Box>
												</Box>
											) : (
												<Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
													No location details available. Please select a hospital.
												</Typography>
											)}
										</Box>
									</>
								)}
							</Box>
						)}
					</Grid>

					{/* -- RIGHT COLUMN (sticky) -- */}
					<Grid size={{ xs: 12, md: 5 }}>
						<Box
							sx={{
								position: { md: 'sticky' },
								top: { md: 24 },
								...customCardStyle,
								p: 3,
								display: 'flex',
								flexDirection: 'column',
								gap: 2.25,
							}}
						>
							{/* Booking For (Patient Selection) Section */}
							<Box>
								<Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '15.5px', color: 'text.primary' }}>
									Booking For
								</Typography>

								{selectedPatient && (
									<Box
										onClick={() => setSwitchPatientModalOpen(true)}
										sx={{
											p: 1.35,
											borderRadius: '10px',
											bgcolor: 'rgba(43,111,113,0.06)',
											border: '1px solid',
											borderColor: 'rgba(43,111,113,0.18)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											cursor: 'pointer',
											transition: 'all 0.2s ease',
											'&:hover': {
												bgcolor: 'rgba(43,111,113,0.1)',
												borderColor: 'primary.main',
											},
										}}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
											<Avatar
												src={selectedPatient.avatar}
												sx={{
													width: 34,
													height: 34,
													bgcolor: 'primary.main',
													fontSize: '13px',
													fontWeight: 700,
													color: '#fff',
												}}
											>
												{selectedPatient.name.charAt(0).toUpperCase()}
											</Avatar>
											<Box sx={{ minWidth: 0, flex: 1 }}>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
													<Typography
														variant="subtitle2"
														noWrap
														sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary', lineHeight: 1.2 }}
													>
														{selectedPatient.name}
													</Typography>
													<Chip
														label={selectedPatient.relationship}
														size="small"
														sx={{
															height: 18,
															fontSize: '10px',
															fontWeight: 700,
															bgcolor: selectedPatient.relationship === 'Self' ? 'primary.main' : 'rgba(15,23,42,0.08)',
															color: selectedPatient.relationship === 'Self' ? '#ffffff' : 'text.primary',
															'& .MuiChip-label': { px: 0.75 },
														}}
													/>
												</Box>
												<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11.5px', display: 'block', mt: 0.25 }}>
													{personSummary(selectedPatient)}
												</Typography>
											</Box>
										</Box>
										<Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '12px', ml: 1, flexShrink: 0 }}>
											Switch
										</Typography>
									</Box>
								)}
							</Box>

							<Box>
								<Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '15.5px', color: 'text.primary' }}>
									Choose Hospital
								</Typography>
								<AppSelect
									value={selectedHospital}
									onChange={(e) => setSelectedHospital(e.target.value as string)}
									options={(doctorDetail?.hospitals ?? []).map((h) => ({ value: h.hospital.id, label: h.hospital.name }))}
									size="small"
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
								/>

								{selectedHospitalEntry && (
									<Box
										sx={{
											mt: 1,
											display: 'flex',
											flexDirection: 'column',
											gap: 0.75,
										}}
									>
										{/* Address */}
										{selectedHospitalEntry.hospital.address && (
											<Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
												<PlaceOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', mt: 0.2 }} />
												<Typography
													variant="body2"
													sx={{
														color: 'text.secondary',
														fontSize: '12.5px',
														lineHeight: 1.45,
													}}
												>
													{selectedHospitalEntry.hospital.address}
												</Typography>
											</Box>
										)}

										{/* Contact Number */}
										{selectedHospitalEntry.hospital.contact_number && (
											<Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
												<PhoneOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', mt: 0.2 }} />
												<Typography
													variant="body2"
													sx={{
														color: 'text.secondary',
														fontSize: '12.5px',
													}}
												>
													{selectedHospitalEntry.hospital.contact_number}
												</Typography>
											</Box>
										)}
									</Box>
								)}
							</Box>
							<DateSlotPicker
								selectedDate={selectedDate}
								onDateChange={setSelectedDate}
								selectedTime={resolvedSelectedTime}
								onTimeChange={setSelectedTime}
								availableSlots={availableSlotGroups.length > 0 ? availableSlotGroups : undefined}
								loading={slotsLoading || loading}
								disableBookedSlots={true}
								maxDaysAhead={BOOKING_WINDOW_DAYS}
								selectedAppointmentType={selectedType}
								onAppointmentTypeChange={setSelectedType}
								clinicPrice={appointmentTypes[0]?.price}
								videoPrice={appointmentTypes[1]?.price}
							/>

							{bookingPaused && (
								<Alert severity="warning" sx={{ borderRadius: 2 }}>
									{restriction?.message || 'Online booking is paused because of missed appointments.'}
								</Alert>
							)}

							{!loading && (
								<AppButton
									label="Book Appointment"
									fullWidth
									disabled={!canBook}
									loading={false}
									onClick={() => {
										if (!accessToken) {
											// After login, open the consent form automatically
											promptLogin(() => setConsentOpen(true))
										} else {
											setConsentOpen(true)
										}
									}}
								/>
							)}
						</Box>
					</Grid>
				</Grid>
			</Container>

			{loginModal}

			<ConsentForm
				open={consentOpen}
				onClose={() => setConsentOpen(false)}
				onAgree={(consentId) => {
					setConsentOpen(false)
					navigate('/payment', {
						state: {
							patient: selectedPatient,
							patientId: selectedPatient?.id, // the appointment is saved against this person
							patientName: selectedPatient?.name,
							patientRelation: selectedPatient?.relationship,
							patientAge: selectedPatient?.age,
							patientGender: selectedPatient?.gender,
							doctorName: doctorDetail?.name ?? '',
							avatarUrl: buildS3Url(doctorDetail?.details?.avatar_s3_key),
							specialty: doctorDetail?.specialities?.[0] ?? 'Doctor',
							experienceYears: doctorDetail?.details?.experience_years,
							distance: selectedHospitalEntry?.hospital?.distance,
							date: selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
							time: resolvedSelectedTime,
							appointmentType: selectedType === 'clinic' ? 'Clinic Visit' : 'Video Call',
							location: (selectedHospitalEntry?.hospital?.name ?? '') + ', ' + (selectedHospitalEntry?.hospital?.address ?? ''),
							consultationFee: selectedType === 'clinic' ? (appointmentTypes[0]?.price ?? 0) : (appointmentTypes[1]?.price ?? 0),
							serviceFee: 0,
							doctorId: doctorDetail?.id ?? '',
							hospitalId: selectedHospital,
							consentVersionId: consentId,
							appointmentMode: selectedType === 'clinic' ? 'clinic_visit' : 'video_call',
							allowPayLater: selectedType === 'clinic',
							appointmentDate: formatDateForApi(selectedDate),
							startTime: formatTimeForApi(resolvedSelectedTime),
							referralId,
						}
					})
				}}
			/>

			{/* Switch Patient Profile Modal */}
			<AppModal
				open={switchPatientModalOpen}
				onClose={() => setSwitchPatientModalOpen(false)}
				title="Select Patient Profile"
				maxWidth="xs"
				fullWidth
			>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1, pb: 1 }}>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12.5px' }}>
						Choose who this appointment / booking is for:
					</Typography>

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
						{patientProfiles.map((profile) => {
							const isSelected = profile.id === selectedPatientId
							return (
								<Box
									key={profile.id}
									onClick={() => {
										setSelectedPatientId(profile.id)
										setSwitchPatientModalOpen(false)
									}}
									sx={{
										p: 1.5,
										borderRadius: '10px',
										border: '1px solid',
										borderColor: isSelected ? 'primary.main' : 'divider',
										bgcolor: isSelected ? 'rgba(43,111,113,0.08)' : 'background.paper',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										cursor: 'pointer',
										transition: 'all 0.15s ease',
										'&:hover': {
											borderColor: 'primary.main',
											bgcolor: isSelected ? 'rgba(43,111,113,0.1)' : 'action.hover',
										},
									}}
								>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
										<Avatar
											src={profile.avatar}
											sx={{
												width: 38,
												height: 38,
												bgcolor: isSelected ? 'primary.main' : 'grey.400',
												fontSize: '14px',
												fontWeight: 700,
												color: '#fff',
											}}
										>
											{profile.name.charAt(0).toUpperCase()}
										</Avatar>
										<Box>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
												<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13.5px', color: 'text.primary' }}>
													{profile.name}
												</Typography>
												<Chip
													label={profile.relationship}
													size="small"
													sx={{
														height: 18,
														fontSize: '10px',
														fontWeight: 700,
														bgcolor: profile.relationship === 'Self' ? 'primary.main' : 'rgba(15,23,42,0.08)',
														color: profile.relationship === 'Self' ? '#ffffff' : 'text.primary',
														'& .MuiChip-label': { px: 0.75 },
													}}
												/>
											</Box>
											<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11.5px' }}>
												{personSummary(profile, 'BG')}
											</Typography>
										</Box>
									</Box>

									<Radio
										checked={isSelected}
										onChange={() => {
											setSelectedPatientId(profile.id)
											setSwitchPatientModalOpen(false)
										}}
										size="small"
										sx={{ color: isSelected ? 'primary.main' : 'action.active' }}
									/>
								</Box>
							)
						})}
					</Box>
				</Box>
			</AppModal>
		</Box>
	)
}

