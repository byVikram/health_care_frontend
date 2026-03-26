// src/features/doctor/DoctorDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Container, Typography, Divider, Grid, Card } from '@mui/material'
import DoctorProfileCard from './components/DoctorProfileCard'
import HospitalSelector from './components/HospitalSelector'
import AppointmentTypeSelector from './components/AppointmentTypeSelector'
import AppButton from '../../../components/common/Button/AppButton'
import DateSlotPicker from '../../../components/common/DateSlotPicker/DateSlotPicker'
import { customCardStyle } from '../../../styles/commonStyles'
import { AppointmentType } from '../../../types/doctor'
import { DoctorDetailData } from '../../../types/doctor-detail'
import { createAppointment, getDoctorById } from '../doctorService'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'

export default function DoctorDetailPage() {
	const [selectedHospital, setSelectedHospital] = useState('')
	const [selectedType, setSelectedType] = useState<'clinic' | 'video'>('clinic')
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [selectedTime, setSelectedTime] = useState('01:00PM')
	const [showFullAbout, setShowFullAbout] = useState(false)
	const [booking, setBooking] = useState(false)
	const [bookingError, setBookingError] = useState<string | null>(null)
	const [doctorDetail, setDoctorDetail] = useState<DoctorDetailData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const { id } = useParams<{ id: string }>()

	// Direct calculation - no need for useMemo for simple derived data
	const primaryHospital =
		doctorDetail?.hospitals.find((h) => h.is_primary) ||
		(doctorDetail?.hospitals.length ? doctorDetail.hospitals[0] : null)

	const selectedHospitalEntry =
		doctorDetail?.hospitals.find((h) => h.hospital.id === selectedHospital) || primaryHospital

	// Calculate appointment types directly
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
					res.data.hospitals.find((h) => h.is_primary) ||
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

	const formatSlotTime = (slot: string) => {
		const [hourText = '0', minuteText = '00'] = slot.split(':')
		let hour = Number.parseInt(hourText, 10)
		const suffix = hour >= 12 ? 'PM' : 'AM'
		hour = hour % 12
		if (hour === 0) hour = 12
		return `${String(hour).padStart(2, '0')}:${minuteText}${suffix}`
	}

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

	// Calculate available slots directly
	// const availableSlots =
	// 	!doctorDetail || !selectedHospital
	// 		? []
	// 		: doctorDetail.availability
	// 				.filter(
	// 					(slot) =>
	// 						slot.is_active &&
	// 						slot.hospital_id === selectedHospital &&
	// 						slot.day_of_week === selectedDate.getDay()
	// 				)
	// 				.map((slot) => formatSlotTime(slot.slot_time))

	const jsDay = selectedDate.getDay() // 0 = Sunday
	const pythonDay = jsDay === 0 ? 6 : jsDay - 1

	const availableSlots =
		!doctorDetail || !selectedHospital
			? []
			: doctorDetail.availability
					.filter(
						(slot) =>
							slot.is_active && slot.hospital_id === selectedHospital && slot.day_of_week === pythonDay
					)
					.map((slot) => formatSlotTime(slot.slot_time))

	// Resolve selected time directly
	const resolvedSelectedTime =
		availableSlots.length && availableSlots.includes(selectedTime)
			? selectedTime
			: availableSlots[0] || selectedTime

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

	const handleBook = async () => {
		if (!doctorDetail) return

		setBooking(true)
		setBookingError(null)

		try {
			await createAppointment({
				doctor_id: doctorDetail.id,
				hospital_id: selectedHospital || undefined,
				appointment_mode: selectedType === 'clinic' ? 'offline' : 'online',
				appointment_date: formatDateForApi(selectedDate),
				appointment_time: formatTimeForApi(resolvedSelectedTime),
			})
			alert(
				`Appointment booked with ${doctorDetail.name} on ${selectedDate.toDateString()} at ${resolvedSelectedTime}`
			)
		} catch (err) {
			console.log(err)
			setBookingError('Failed to book appointment')
		} finally {
			setBooking(false)
		}
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
								{/* Doctor Profile Card */}
								{doctorDetail && (
									<>
										<DoctorProfileCard doctor={doctorDetail} />
										{/* About */}
										<Box
											sx={{
												...customCardStyle,
												p: 3,
											}}
										>
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

											<Divider sx={{ my: 2 }} />

											<Typography variant="h5" sx={{ mb: 0.5 }}>
												Working Time
											</Typography>
											<Typography variant="body2">
												{primaryHospital?.working_hours || 'Not available'}
											</Typography>
										</Box>

										{/* Hospital Selector */}
										<Box
											sx={{
												...customCardStyle,
												p: 3,
											}}
										>
											<HospitalSelector
												hospitals={doctorDetail.hospitals}
												selected={selectedHospital}
												onChange={setSelectedHospital}
											/>
										</Box>

										{/* Appointment Type */}
										<Box
											sx={{
												...customCardStyle,
												p: 3,
											}}
										>
											<AppointmentTypeSelector
												types={appointmentTypes}
												selected={selectedType}
												onChange={setSelectedType}
											/>
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
								gap: 3,
							}}
						>
							<DateSlotPicker
								selectedDate={selectedDate}
								onDateChange={setSelectedDate}
								selectedTime={resolvedSelectedTime}
								onTimeChange={setSelectedTime}
								availableSlots={availableSlots}
								loading={loading}
							/>
							{bookingError && (
								<Typography variant="body2" sx={{ color: 'error.main' }}>
									{bookingError}
								</Typography>
							)}
							{!loading && (
								<AppButton label="Book Appointment" fullWidth loading={booking} onClick={handleBook} />
							)}
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
