// src/features/doctor/DoctorDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Divider, Grid, Card } from '@mui/material'
import DoctorProfileCard from './components/DoctorProfileCard'
import AppSelect from '../../../components/common/Select/AppSelect'
// import AppointmentTypeSelector from './components/AppointmentTypeSelector'
import AppButton from '../../../components/common/Button/AppButton'
import DateSlotPicker, { SlotGroup, TimeSlot } from '../../../components/common/DateSlotPicker/DateSlotPicker'
import AppModal from '../../../components/common/Modal/AppModal'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import LoginForm from '../../../features/auth/components/LoginForm'
import RegisterForm from '../../../features/auth/components/RegisterForm'
import OtpForm from '../../../features/auth/components/OtpForm'

import { customCardStyle } from '../../../styles/commonStyles'
import { AppointmentType } from '../../../types/doctor'
import { DoctorDetailData } from '../../../types/doctor-detail'
import { getDoctorById, getDoctorAvailability } from '../doctorService'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import ConsentForm from '../../appointments/components/ConsentForm'
import { useAuth } from '../../../hooks/useAuth'

type AvailabilityMode = 'clinic' | 'video'
type ApiAvailabilityMode = 'clinic_visit' | 'video_call'
type ApiAvailabilityBlock = {
	appointment_mode?: ApiAvailabilityMode
	sessions?: SlotGroup[]
}

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


	const [bookingSuccessModal, setBookingSuccessModal] = useState(false)
	const [consentOpen, setConsentOpen] = useState(false)
	const [pendingBooking, setPendingBooking] = useState(false)



	const [doctorDetail, setDoctorDetail] = useState<DoctorDetailData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [availableSlotGroups, setAvailableSlotGroups] = useState<SlotGroup[]>([])
	const [slotsLoading, setSlotsLoading] = useState(false)

	const { id } = useParams<{ id: string }>()

	const navigate = useNavigate()


	const [authModalOpen, setAuthModalOpen] = useState(false)
	const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'otp'>('login')
	const [authContactNumber, setAuthContactNumber] = useState('')
	const { accessToken } = useAuth()

	const closeAuthModal = () => {
		setAuthModalOpen(false)
		setAuthModalView('login')
		setAuthContactNumber('')
	}

	const handleAuthNext = (contactNumber: string) => {
		setAuthContactNumber(contactNumber)
		setAuthModalView('otp')
	}

	const handleAuthVerified = () => {
		setAuthModalOpen(false)
		setAuthModalView('login')
		setAuthContactNumber('')
		// After login, open consent form automatically
		if (pendingBooking) {
			setConsentOpen(true)
			setPendingBooking(false)
		}
	}

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

		const fetchDoctor = async () => {
			try {
				setLoading(true)
				setError(null)
				const res = await getDoctorById(id)
				if (!active) return
				setDoctorDetail(res.data)
				const primaryHospitalData =
					res.data.hospitals.find((h: { is_primary: boolean }) => h.is_primary) ||
					(res.data.hospitals.length > 0 ? res.data.hospitals[0] : null)
				setSelectedHospital(primaryHospitalData?.hospital.id || '')
			} catch (err) {
				console.log(err)
				if (!active) return
				setError('Failed to load doctor details')
			} finally {
				setLoading(false)
			}
		}

		fetchDoctor()
		return () => {
			active = false
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
				setAvailableSlotGroups(byMode[selectedType] ?? [])
			} catch (err) {
				console.log(err)
				if (!active) return
				setAvailableSlotGroups([])
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

	const aboutText = (() => {
		const about = doctorDetail?.details?.about
		if (!about) return 'No description available.'
		if (showFullAbout) return about
		return about.length > 120 ? `${about.slice(0, 120)}...` : about
	})()

	const authModalTitle =
		authModalView === 'register'
			? 'Register to book appointment'
			: authModalView === 'otp'
				? 'Verify OTP'
				: 'Login to book an appointment'

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
										<DoctorProfileCard doctor={doctorDetail} />
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
											{/* <Divider sx={{ my: 2 }} />
											<Typography variant="h5" sx={{ mb: 0.5 }}>
												Working Time
											</Typography>
											<Typography variant="body2">
												{primaryHospital?.working_hours || 'Not available'}
											</Typography> */}
										</Box>
										<Box sx={{ ...customCardStyle, p: 3, minHeight: '280px' }}>





										</Box>
										{/* <Box sx={{ ...customCardStyle, p: 3 }}>
											<AppointmentTypeSelector
												types={appointmentTypes}
												selected={selectedType}
												onChange={setSelectedType}
											/>
										</Box> */}
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
								gap: 3,
							}}
						>

							<Box>
								<Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '16px', color: 'text.primary' }}>
									Choose Hospital
								</Typography>
								<AppSelect
									value={selectedHospital}
									onChange={(e) => setSelectedHospital(e.target.value as string)}
									options={(doctorDetail?.hospitals ?? []).map((h) => ({ value: h.hospital.id, label: h.hospital.name }))}
									size="small"
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
								/>
							</Box>
							<DateSlotPicker
								selectedDate={selectedDate}
								onDateChange={setSelectedDate}
								selectedTime={resolvedSelectedTime}
								onTimeChange={setSelectedTime}
								availableSlots={availableSlotGroups.length > 0 ? availableSlotGroups : undefined}
								loading={slotsLoading || loading}
								disableBookedSlots={true}
								selectedAppointmentType={selectedType}
								onAppointmentTypeChange={setSelectedType}
								clinicPrice={appointmentTypes[0]?.price}
								videoPrice={appointmentTypes[1]?.price}
							/>





							{!loading && (
								<AppButton
									label="Book Appointment"
									fullWidth
									loading={false}
									onClick={() => {
										if (!accessToken) {
											setPendingBooking(true)
											setAuthModalOpen(true)
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

			<AppModal open={authModalOpen} onClose={closeAuthModal} title={authModalTitle} maxWidth="xs" fullWidth>
				{authModalView === 'login' && (
					<LoginForm
						mode="modal"
						onSubmit={handleAuthNext}
						onSwitchToRegister={() => setAuthModalView('register')}
					/>
				)}
				{authModalView === 'register' && (
					<RegisterForm
						mode="modal"
						onSubmit={handleAuthNext}
						onSwitchToLogin={() => setAuthModalView('login')}
					/>
				)}
				{authModalView === 'otp' && (
					<OtpForm mode="modal" contactNumber={authContactNumber} onVerify={handleAuthVerified} />
				)}
			</AppModal>

			<ConsentForm
				open={consentOpen}
				onClose={() => setConsentOpen(false)}
				onAgree={() => {
					setConsentOpen(false)
					navigate('/payment', {
						state: {
							doctorName: doctorDetail?.name ?? '',
							avatarUrl: doctorDetail?.details?.avatar_s3_key ?? '',
							specialty: doctorDetail?.specialities?.[0] ?? 'Doctor',
							date: selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
							time: resolvedSelectedTime,
							appointmentType: selectedType === 'clinic' ? 'Clinic Visit' : 'Video Call',
							location: (selectedHospitalEntry?.hospital?.name ?? '') + ', ' + (selectedHospitalEntry?.hospital?.address ?? ''),
							consultationFee: selectedType === 'clinic' ? (appointmentTypes[0]?.price ?? 0) : (appointmentTypes[1]?.price ?? 0),
							serviceFee: 0,
							doctorId: doctorDetail?.id ?? '',
							hospitalId: selectedHospital,
							appointmentMode: selectedType === 'clinic' ? 'clinic_visit' : 'video_call',
							appointmentDate: formatDateForApi(selectedDate),
							startTime: formatTimeForApi(resolvedSelectedTime),
						}
					})
				}}
			/>

			<ConfirmModal
				open={bookingSuccessModal}
				onClose={() => setBookingSuccessModal(false)}
				onConfirm={() => setBookingSuccessModal(false)}
				variant="success"
				title="Appointment Confirmed!"

				confirmLabel="Done"
				hideCancelButton
			/>
		</Box>
	)
}
