// src/features/doctor/profile/components/DoctorHospitalsTab.tsx
import { useState } from 'react'
import {
	Box,
	Typography,
	IconButton,
	Radio,
	Menu,
	MenuItem as MuiMenuItem,
	Grid,
} from '@mui/material'
import {
	Add as AddIcon,
	MoreVert as MoreVertIcon,
	ArrowBackIosNew as ArrowBackIosNewIcon,
	HomeOutlined as HomeOutlinedIcon,
	LocationOnOutlined as LocationOnOutlinedIcon,
	PhoneOutlined as PhoneOutlinedIcon,
	Check as CheckIcon,
	ArrowForward as ArrowForwardIcon,
	DeleteOutline as DeleteOutlineIcon,
	WbSunnyOutlined as MorningIcon,
	LightModeOutlined as AfternoonIcon,
	NightsStayOutlined as EveningIcon,
	VideocamOutlined as VideocamOutlinedIcon,
	CalendarMonthOutlined as CalendarIcon,
	// AccessTimeOutlined as TimeIcon,
	PaymentOutlined as PaymentIcon,
	GavelOutlined as RuleIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import AppButton from '../../../../components/common/Button/AppButton'
import AppInput from '../../../../components/common/Input/AppInput'
import AppSwitch from '../../../../components/common/Switch/AppSwitch'
import AppSelect from '../../../../components/common/Select/AppSelect'
import { customCardStyle } from '../../../../styles/commonStyles'
import type {
	DoctorHospital,
	AppointmentType,
	TimeSlot,
	SectionSlots,
	WorkingHoursState,
} from '../../../../types/doctor-profile'
import { createHospital, updateHospital, updateWeeklyAvailability } from '../../doctorService'

interface DoctorHospitalsTabProps {
	hospitals: DoctorHospital[]
	onChange: (hospitals: DoctorHospital[]) => void
}

const EMPTY_FORM = {
	name: '',
	fullAddress: '',
	phone_number: '',
	video_consultation_fee: '',
	offline_consultation_fee: '',
}

const getSuccessMessage = (response: unknown) => {
	if (
		typeof response === 'object' &&
		response !== null &&
		'message' in response &&
		typeof response.message === 'string'
	) {
		return response.message
	}
	return 'Hospital saved successfully'
}

const getHospitalAddressText = (hospital: DoctorHospital) => {
	const fullAddress = hospital.fullAddress.trim()
	const location = hospital.location.trim()
	if (fullAddress && location && fullAddress !== location) {
		return `${fullAddress} ${location}`.trim()
	}
	return fullAddress || location
}

const makeTimeOptions = (startHour: number, endHour: number, stepMins: number = 30) => {
	const options: { value: string; label: string }[] = []
	const totalStartMins = startHour * 60
	const totalEndMins = endHour * 60
	for (let mins = totalStartMins; mins < totalEndMins; mins += stepMins) {
		const h = Math.floor(mins / 60)
		const m = mins % 60
		const value = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')
		const period = h < 12 ? 'AM' : 'PM'
		const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
		const label = h12 + ':' + String(m).padStart(2, '0') + ' ' + period
		options.push({ value, label })
	}
	return options
}

const snapToStep = (time: string, stepMins: number): string => {
	const [h, m] = time.split(':').map(Number)
	const totalMins = h * 60 + m
	const snapped = Math.round(totalMins / stepMins) * stepMins
	const sh = Math.floor(snapped / 60)
	const sm = snapped % 60
	return String(sh).padStart(2, '0') + ':' + String(sm).padStart(2, '0')
}

const durationOptions = [10, 15, 20, 25, 30]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const getWeekDates = (start: Date) => {
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(start)
		d.setDate(start.getDate() + i)
		return d
	})
}

const SECTION_META = [
	{
		key: 'morning' as const,
		label: 'Morning',
		icon: <MorningIcon sx={{ fontSize: 16, color: '#FFB020' }} />,
		startHour: 8,
		endHour: 12,
		defaultStart: '08:00',
		defaultEnd: '10:00',
	},
	{
		key: 'afternoon' as const,
		label: 'Afternoon',
		icon: <AfternoonIcon sx={{ fontSize: 16, color: '#10B981' }} />,
		startHour: 12,
		endHour: 17,
		defaultStart: '12:00',
		defaultEnd: '14:00',
	},
	{
		key: 'evening' as const,
		label: 'Evening',
		icon: <EveningIcon sx={{ fontSize: 16, color: '#6366F1' }} />,
		startHour: 17,
		endHour: 21,
		defaultStart: '17:00',
		defaultEnd: '19:00',
	},
]

const makeDefaultWorkingHours = (): Record<AppointmentType, WorkingHoursState> => ({
	clinic: {
		sections: {
			morning: [{ start: '08:00', end: '10:00' }],
			afternoon: [{ start: '12:00', end: '14:00' }],
			evening: [{ start: '17:00', end: '19:00' }],
		},
		slotDuration: 15,
	},
	video: {
		sections: {
			morning: [{ start: '08:00', end: '10:00' }],
			afternoon: [{ start: '12:00', end: '14:00' }],
			evening: [{ start: '17:00', end: '19:00' }],
		},
		slotDuration: 15,
	},
})

const getInitialWeeklyAvailability = (
	h?: DoctorHospital
): Record<number, Record<AppointmentType, WorkingHoursState>> => {
	const initial: Record<number, Record<AppointmentType, WorkingHoursState>> = {}
	for (let day = 0; day < 7; day++) {
		initial[day] = {
			clinic: {
				sections: {
					morning: h?.availability?.[day]?.clinic?.sections?.morning?.length
						? h.availability[day].clinic.sections.morning.map((s) => ({ ...s }))
						: [{ start: '08:00', end: '10:00' }],
					afternoon: h?.availability?.[day]?.clinic?.sections?.afternoon?.length
						? h.availability[day].clinic.sections.afternoon.map((s) => ({ ...s }))
						: [{ start: '12:00', end: '14:00' }],
					evening: h?.availability?.[day]?.clinic?.sections?.evening?.length
						? h.availability[day].clinic.sections.evening.map((s) => ({ ...s }))
						: [{ start: '17:00', end: '19:00' }],
				},
				slotDuration: h?.availability?.[day]?.clinic?.slotDuration ?? 15,
			},
			video: {
				sections: {
					morning: h?.availability?.[day]?.video?.sections?.morning?.length
						? h.availability[day].video.sections.morning.map((s) => ({ ...s }))
						: [{ start: '08:00', end: '10:00' }],
					afternoon: h?.availability?.[day]?.video?.sections?.afternoon?.length
						? h.availability[day].video.sections.afternoon.map((s) => ({ ...s }))
						: [{ start: '12:00', end: '14:00' }],
					evening: h?.availability?.[day]?.video?.sections?.evening?.length
						? h.availability[day].video.sections.evening.map((s) => ({ ...s }))
						: [{ start: '17:00', end: '19:00' }],
				},
				slotDuration: h?.availability?.[day]?.video?.slotDuration ?? 15,
			},
		}
	}
	return initial
}

export default function DoctorHospitalsTab({ hospitals, onChange }: DoctorHospitalsTabProps) {
	const [showForm, setShowForm] = useState(false)
	const [form, setForm] = useState(EMPTY_FORM)
	const [isSaving, setIsSaving] = useState(false)

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const [menuHospitalId, setMenuHospitalId] = useState<string | null>(null)
	const [editingHospitalId, setEditingHospitalId] = useState<string | null>(null)

	const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, hospitalId: string) => {
		e.stopPropagation()
		setAnchorEl(e.currentTarget)
		setMenuHospitalId(hospitalId)
	}

	const handleCloseMenu = () => {
		setAnchorEl(null)
		setMenuHospitalId(null)
	}

	const [weeklyAvailability, setWeeklyAvailability] =
		useState<Record<number, Record<AppointmentType, WorkingHoursState>>>(getInitialWeeklyAvailability())

	const [selectedDate, setSelectedDate] = useState<Date>(new Date())
	const [weekStart] = useState(() => {
		const today = new Date()
		const d = new Date(today)
		d.setDate(today.getDate() - today.getDay())
		return d
	})

	const weekDates = getWeekDates(weekStart)

	const isSameDay = (a: Date, b: Date) =>
		a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

	const [selectedAppointmentType, setSelectedAppointmentType] = useState<AppointmentType>('clinic')
	const [followUpDays, setFollowUpDays] = useState(7)
	const [rescheduleCutoff, setRescheduleCutoff] = useState(2)
	const [allowPayLater, setAllowPayLater] = useState(false)

	const selectedDay = selectedDate.getDay()
	const selectedWorkingHours =
		weeklyAvailability[selectedDay]?.[selectedAppointmentType] || makeDefaultWorkingHours()[selectedAppointmentType]

	const handleApplyAvailability = (mode: 'weekdays' | 'all') => {
		const day = selectedDate.getDay()
		const dayAvail = weeklyAvailability[day]
		if (!dayAvail) return

		const targetDays = mode === 'weekdays' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6]

		setWeeklyAvailability((prev) => {
			const updated = { ...prev }
			for (const d of targetDays) {
				if (d === day) continue
				updated[d] = {
					clinic: {
						sections: {
							morning: dayAvail.clinic.sections.morning.map((s) => ({ ...s })),
							afternoon: dayAvail.clinic.sections.afternoon.map((s) => ({ ...s })),
							evening: dayAvail.clinic.sections.evening.map((s) => ({ ...s })),
						},
						slotDuration: dayAvail.clinic.slotDuration,
					},
					video: {
						sections: {
							morning: dayAvail.video.sections.morning.map((s) => ({ ...s })),
							afternoon: dayAvail.video.sections.afternoon.map((s) => ({ ...s })),
							evening: dayAvail.video.sections.evening.map((s) => ({ ...s })),
						},
						slotDuration: dayAvail.video.slotDuration,
					},
				}
			}
			return updated
		})
		toast.success(`Applied availability to ${mode === 'weekdays' ? 'all weekdays' : 'all days'}`)
	}

	const resetFormState = () => {
		setForm(EMPTY_FORM)
		setEditingHospitalId(null)
		setSelectedAppointmentType('clinic')
		setFollowUpDays(7)
		setRescheduleCutoff(2)
		setAllowPayLater(false)
		setWeeklyAvailability(getInitialWeeklyAvailability())
	}

	const handleEdit = (hospitalId: string) => {
		handleCloseMenu()
		const h = hospitals.find((h) => h.id === hospitalId)
		if (!h) return

		setForm({
			name: h.name,
			fullAddress: h.fullAddress,
			phone_number: h.phone_number ?? '',
			video_consultation_fee: h.video_consultation_fee !== undefined && h.video_consultation_fee !== null ? String(h.video_consultation_fee) : '',
			offline_consultation_fee: h.clinic_consultation_fee !== undefined && h.clinic_consultation_fee !== null ? String(h.clinic_consultation_fee) : '',
		})

		setFollowUpDays(h.free_followup_validity_days ?? 7)
		setRescheduleCutoff(h.reschedule_allowed_until_hours ?? 2)
		setAllowPayLater(h.allow_pay_later ?? false)

		setWeeklyAvailability(getInitialWeeklyAvailability(h))

		setEditingHospitalId(hospitalId)
		setShowForm(true)
	}

	const addSlot = (sectionKey: keyof SectionSlots) => {
		setWeeklyAvailability((prev) => {
			const day = selectedDate.getDay()
			const currentDayAvail = prev[day] || getInitialWeeklyAvailability()[day]
			const current = currentDayAvail[selectedAppointmentType]
			const slots = current.sections[sectionKey]
			if (slots.length >= 3) return prev
			const prevEnd = slots[slots.length - 1].end
			const stepMins = current.slotDuration
			const [eh, em] = prevEnd.split(':').map(Number)
			const newEndMins = eh * 60 + em + stepMins
			const meta = SECTION_META.find((me) => me.key === sectionKey)!
			const sectionEndMins = meta.endHour * 60
			const clampedMins = Math.min(newEndMins, sectionEndMins)
			const newEnd =
				String(Math.floor(clampedMins / 60)).padStart(2, '0') + ':' + String(clampedMins % 60).padStart(2, '0')
			return {
				...prev,
				[day]: {
					...currentDayAvail,
					[selectedAppointmentType]: {
						...current,
						sections: {
							...current.sections,
							[sectionKey]: [...slots, { start: prevEnd, end: newEnd }],
						},
					},
				},
			}
		})
	}

	const removeSlot = (sectionKey: keyof SectionSlots, slotIndex: number) => {
		setWeeklyAvailability((prev) => {
			const day = selectedDate.getDay()
			const currentDayAvail = prev[day] || getInitialWeeklyAvailability()[day]
			const current = currentDayAvail[selectedAppointmentType]
			const slots = current.sections[sectionKey]
			if (slotIndex === 0) return prev
			return {
				...prev,
				[day]: {
					...currentDayAvail,
					[selectedAppointmentType]: {
						...current,
						sections: {
							...current.sections,
							[sectionKey]: slots.filter((_, i) => i !== slotIndex),
						},
					},
				},
			}
		})
	}

	const updateSlotTime = (
		sectionKey: keyof SectionSlots,
		slotIndex: number,
		field: 'start' | 'end',
		value: string
	) => {
		setWeeklyAvailability((prev) => {
			const day = selectedDate.getDay()
			const currentDayAvail = prev[day] || getInitialWeeklyAvailability()[day]
			const current = currentDayAvail[selectedAppointmentType]
			const slots = current.sections[sectionKey].map((slot, i) =>
				i === slotIndex ? { ...slot, [field]: value } : slot
			)
			return {
				...prev,
				[day]: {
					...currentDayAvail,
					[selectedAppointmentType]: {
						...current,
						sections: { ...current.sections, [sectionKey]: slots },
					},
				},
			}
		})
	}

	const updateSlotDuration = (value: number) => {
		setWeeklyAvailability((prev) => {
			const day = selectedDate.getDay()
			const currentDayAvail = prev[day] || getInitialWeeklyAvailability()[day]
			const current = currentDayAvail[selectedAppointmentType]
			const snappedSections = Object.fromEntries(
				Object.entries(current.sections).map(([sKey, slots]) => [
					sKey,
					(slots as TimeSlot[]).map((slot) => ({
						start: snapToStep(slot.start, value),
						end: snapToStep(slot.end, value),
					})),
				])
			) as SectionSlots
			return {
				...prev,
				[day]: {
					...currentDayAvail,
					[selectedAppointmentType]: {
						sections: snappedSections,
						slotDuration: value,
					},
				},
			}
		})
	}

	const handleSetPrimary = (id: string) => {
		onChange(hospitals.map((h) => ({ ...h, isPrimary: h.id === id })))
	}

	const handleSave = async () => {
		const trimmedName = form.name.trim()
		const trimmedAddress = form.fullAddress.trim()
		const isPrimary = hospitals.length === 0

		if (!trimmedName) {
			toast.error('Hospital name is required')
			return
		}
		if (!trimmedAddress) {
			toast.error('Full address is required')
			return
		}

		setIsSaving(true)
		try {
			if (editingHospitalId) {
				await Promise.all([
					updateHospital({
						hospital_id: editingHospitalId,
						name: trimmedName,
						full_address: trimmedAddress,
						phone_number: form.phone_number.trim(),
						video_consultation_fee: form.video_consultation_fee.trim(),
						offline_consultation_fee: form.offline_consultation_fee.trim(),
						free_followup_validity_days: followUpDays,
						reschedule_allowed_until_hours: rescheduleCutoff,
						allow_pay_later: allowPayLater,
					}),
					updateWeeklyAvailability({
						hospital_id: editingHospitalId,
						availability: weeklyAvailability,
					}),
				])
				const updatedHospitals = hospitals.map((h) =>
					h.id === editingHospitalId
						? {
							...h,
							name: trimmedName,
							fullAddress: trimmedAddress,
							location: trimmedAddress,
							phone_number: form.phone_number.trim(),
							video_consultation_fee: Number(form.video_consultation_fee.trim()) || 0,
							clinic_consultation_fee: Number(form.offline_consultation_fee.trim()) || 0,
							free_followup_validity_days: followUpDays,
							reschedule_allowed_until_hours: rescheduleCutoff,
							allow_pay_later: allowPayLater,
							availability: weeklyAvailability,
						}
						: h
				)
				onChange(updatedHospitals)
				toast.success('Hospital updated successfully')
			} else {
				const response = await createHospital({
					name: trimmedName,
					phone_number: form.phone_number.trim(),
					full_address: trimmedAddress,
					is_primary: isPrimary,
					video_consultation_fee: form.video_consultation_fee.trim(),
					offline_consultation_fee: form.offline_consultation_fee.trim(),
				})
				const hospitalId = response.data.public_id
				await updateWeeklyAvailability({
					hospital_id: hospitalId,
					availability: weeklyAvailability,
				})
				const newHospital: DoctorHospital = {
					id: hospitalId,
					name: trimmedName,
					location: trimmedAddress,
					fullAddress: trimmedAddress,
					isPrimary: isPrimary,
					phone_number: form.phone_number.trim(),
					video_consultation_fee: Number(form.video_consultation_fee.trim()) || 0,
					clinic_consultation_fee: Number(form.offline_consultation_fee.trim()) || 0,
					free_followup_validity_days: followUpDays,
					reschedule_allowed_until_hours: rescheduleCutoff,
					allow_pay_later: allowPayLater,
					availability: weeklyAvailability,
				}
				onChange([...hospitals, newHospital])
				toast.success(getSuccessMessage(response))
			}
			resetFormState()
			setShowForm(false)
		} catch (err: unknown) {
			const apiError = err as { response?: { data?: { message?: string } } }
			console.error('Failed to save:', apiError?.response?.data)
			toast.error(apiError?.response?.data?.message ?? 'Failed to save')
		} finally {
			setIsSaving(false)
		}
	}

	if (showForm) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				{/* Header Back Bar */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Box
						onClick={() => {
							setShowForm(false)
							resetFormState()
						}}
						sx={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 0.8,
							cursor: 'pointer',
							color: 'text.secondary',
							transition: 'color 0.2s',
							'&:hover': { color: '#2B6F71' },
						}}
					>
						<ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
						<Typography variant="caption" sx={{ fontWeight: 700 }}>
							Back to clinic list
						</Typography>
					</Box>
					<Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px' }}>
						* fields are required
					</Typography>
				</Box>

				<Box>
					<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.2, fontSize: '18px' }}>
						{editingHospitalId ? 'Edit Hospital Details' : 'Add new Hospital Details'}
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
						Define location details, availability scheduling, consultation fees, and patient booking rules.
					</Typography>
				</Box>

				{/* 1. General Details Form Section */}
				<Box sx={{ ...customCardStyle, borderRadius: '12px', border: '1px solid #E2E8F0', p: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: 28,
								height: 28,
								borderRadius: '6px',
								bgcolor: 'rgba(43, 111, 113, 0.08)',
								color: '#2B6F71',
							}}
						>
							<HomeOutlinedIcon sx={{ fontSize: 16 }} />
						</Box>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A4345' }}>
							Clinic Details & Contact
						</Typography>
					</Box>

					<Grid container spacing={2}>
						{/* Row 1: Hospital Name + Phone Number */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								label="Enter hospital name"
								value={form.name}
								placeholder="e.g. Arogya Clinic"
								onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
								size="small"
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								label="Phone number"
								value={form.phone_number}
								placeholder="+91 00000 00000"
								onChange={(e) => setForm((prev) => ({ ...prev, phone_number: e.target.value }))}
								size="small"
							/>
						</Grid>
						{/* Row 2: Full Address */}
						<Grid size={{ xs: 12 }}>
							<AppInput
								label="Enter Full address"
								value={form.fullAddress}
								placeholder="Enter complete hospital address..."
								multiline
								rows={2}
								onChange={(e) => setForm((prev) => ({ ...prev, fullAddress: e.target.value }))}
								size="small"
							/>
						</Grid>
					</Grid>
				</Box>

				{/* 2. Fees & Rules Section */}
				<Box sx={{ ...customCardStyle, borderRadius: '12px', border: '1px solid #E2E8F0', p: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: 28,
								height: 28,
								borderRadius: '6px',
								bgcolor: 'rgba(43, 111, 113, 0.08)',
								color: '#2B6F71',
							}}
						>
							<RuleIcon sx={{ fontSize: 16 }} />
						</Box>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A4345' }}>
							Pricing & Booking Preferences
						</Typography>
					</Box>

					<Grid container spacing={2}>
						{/* Row 3: Video Fee + Clinic Fee */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								label="Video consultation fee"
								value={form.video_consultation_fee}
								placeholder="e.g. 500"
								onChange={(e) =>
									setForm((prev) => ({ ...prev, video_consultation_fee: e.target.value }))
								}
								size="small"
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								label="Clinic consultation fee"
								value={form.offline_consultation_fee}
								placeholder="e.g. 500"
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										offline_consultation_fee: e.target.value,
									}))
								}
								size="small"
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
								Free Follow-up Validity
							</Typography>
							<AppSelect
								value={followUpDays}
								onChange={(e) => setFollowUpDays(Number(e.target.value))}
								size="small"
								options={[
									{ value: 0, label: 'No Follow-up' },
									{ value: 3, label: '3 Days' },
									{ value: 5, label: '5 Days' },
									{ value: 7, label: '7 Days' },
									{ value: 10, label: '10 Days' },
									{ value: 15, label: '15 Days' },
								]}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
								Reschedule Allowed Until
							</Typography>
							<AppSelect
								value={rescheduleCutoff}
								onChange={(e) => setRescheduleCutoff(Number(e.target.value))}
								size="small"
								options={[
									{ value: 1, label: '1 Hour' },
									{ value: 2, label: '2 Hours' },
									{ value: 3, label: '3 Hours' },
									{ value: 4, label: '4 Hours' },
									{ value: 6, label: '6 Hours' },
									{ value: 12, label: '12 Hours' },
									{ value: 24, label: '1 Day' },
								]}
							/>
						</Grid>

						{/* Pay Later Toggle Container */}
						<Grid size={{ xs: 12 }}>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									p: 1.5,
									borderRadius: '10px',
									border: '1px solid',
									borderColor: allowPayLater ? 'rgba(43, 111, 113, 0.2)' : '#E2E8F0',
									bgcolor: allowPayLater ? 'rgba(43, 111, 113, 0.02)' : 'transparent',
									transition: 'all 0.2s',
								}}
							>
								<Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
									<PaymentIcon sx={{ color: allowPayLater ? '#2B6F71' : 'text.disabled', fontSize: 18, mt: 0.2 }} />
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '13px' }}>
											Allow Pay Later
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', display: 'block' }}>
											Enable this to let patients book appointments without paying upfront online, collecting fees directly at the clinic.
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<AppSwitch
										checked={allowPayLater}
										onChange={(e) => setAllowPayLater(e.target.checked)}
									/>
									<Typography
										variant="caption"
										sx={{
											fontWeight: 700,
											color: allowPayLater ? '#2B6F71' : '#64748B',
											fontSize: '11px',
											minWidth: 42
										}}
									>
										{allowPayLater ? 'Enabled' : 'Disabled'}
									</Typography>
								</Box>
							</Box>
						</Grid>
					</Grid>
				</Box>

				{/* 3. Availability Schedule Section */}
				<Box sx={{ ...customCardStyle, borderRadius: '12px', border: '1px solid #E2E8F0', p: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: 28,
									height: 28,
									borderRadius: '6px',
									bgcolor: 'rgba(43, 111, 113, 0.08)',
									color: '#2B6F71',
								}}
							>
								<CalendarIcon sx={{ fontSize: 16 }} />
							</Box>
							<Box>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A4345' }}>
									Working Hours Scheduler
								</Typography>
							</Box>
						</Box>

						{/* Segmented Controller for Appointment Type */}
						<Box
							sx={{
								display: 'inline-flex',
								bgcolor: '#F1F5F9',
								borderRadius: '8px',
								p: '3px',
								gap: '3px',
								border: '1px solid #E2E8F0',
							}}
						>
							<Box
								onClick={() => setSelectedAppointmentType('clinic')}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 0.6,
									px: 1.5,
									py: 0.5,
									borderRadius: '6px',
									cursor: 'pointer',
									bgcolor: selectedAppointmentType === 'clinic' ? '#fff' : 'transparent',
									color: selectedAppointmentType === 'clinic' ? '#2B6F71' : '#64748B',
									boxShadow: selectedAppointmentType === 'clinic' ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
									transition: 'all 0.2s',
									'&:hover': {
										color: selectedAppointmentType === 'clinic' ? '#2B6F71' : '#1A4345',
									}
								}}
							>
								<HomeOutlinedIcon sx={{ fontSize: 14 }} />
								<Typography sx={{ fontSize: '11px', fontWeight: 700 }}>
									Clinic Visit
								</Typography>
							</Box>

							<Box
								onClick={() => setSelectedAppointmentType('video')}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 0.6,
									px: 1.5,
									py: 0.5,
									borderRadius: '6px',
									cursor: 'pointer',
									bgcolor: selectedAppointmentType === 'video' ? '#fff' : 'transparent',
									color: selectedAppointmentType === 'video' ? '#2B6F71' : '#64748B',
									boxShadow: selectedAppointmentType === 'video' ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
									transition: 'all 0.2s',
									'&:hover': {
										color: selectedAppointmentType === 'video' ? '#2B6F71' : '#1A4345',
									}
								}}
							>
								<VideocamOutlinedIcon sx={{ fontSize: 14 }} />
								<Typography sx={{ fontSize: '11px', fontWeight: 700 }}>
									Video Call
								</Typography>
							</Box>
						</Box>
					</Box>

					{/* Date strip widget */}
					<Box sx={{ mb: 2.5 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
							<Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary' }}>
								Select Weekday to Edit Availability
							</Typography>
							<Box sx={{ display: 'flex', gap: 1.5 }}>
								<AppButton
									variant="text"
									onClick={() => handleApplyAvailability('weekdays')}
									label="Copy to Weekdays (Mon-Fri)"
									size="small"
									sx={{
										textTransform: 'none',
										p: 0,
										minWidth: 0,
										color: '#2B6F71',
										fontWeight: 700,
										fontSize: '11px',
										'&:hover': { background: 'none', color: '#1D4D4F', textDecoration: 'underline' }
									}}
								/>
								<AppButton
									variant="text"
									onClick={() => handleApplyAvailability('all')}
									label="Copy to All Days"
									size="small"
									sx={{
										textTransform: 'none',
										p: 0,
										minWidth: 0,
										color: '#2B6F71',
										fontWeight: 700,
										fontSize: '11px',
										'&:hover': { background: 'none', color: '#1D4D4F', textDecoration: 'underline' }
									}}
								/>
							</Box>
						</Box>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								gap: 0.6,
								width: '100%',
							}}
						>
							{weekDates.map((date) => {
								const isSelected = isSameDay(date, selectedDate)
								const dayVal = date.getDay()

								return (
									<Box
										key={date.toISOString()}
										onClick={() => setSelectedDate(date)}
										sx={{
											flex: 1,
											minWidth: 36,
											maxWidth: 56,
											py: 0.8,
											borderRadius: '8px',
											border: '1px solid',
											borderColor: isSelected ? '#2B6F71' : '#E2E8F0',
											bgcolor: isSelected ? '#2B6F71' : '#fff',
											color: isSelected ? '#fff' : 'text.primary',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											justifyContent: 'center',
											cursor: 'pointer',
											transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
											transform: isSelected ? 'translateY(-1px)' : 'none',
											'&:hover': {
												borderColor: '#2B6F71',
												bgcolor: isSelected ? '#2B6F71' : 'rgba(43, 111, 113, 0.04)',
											},
										}}
									>
										<Typography sx={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', opacity: isSelected ? 0.8 : 0.5, mb: 0.2 }}>
											{DAYS[dayVal]}
										</Typography>
										<Typography sx={{ fontSize: '13px', fontWeight: 800 }}>
											{DAY_LABELS[dayVal]}
										</Typography>
									</Box>
								)
							})}
						</Box>
					</Box>

					{/* Time slots and configurator list */}
					<Box key={selectedAppointmentType} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						{SECTION_META.map((section) => {
							const slots = selectedWorkingHours.sections[section.key]
							const canAdd = slots.length < 3

							return (
								<Box key={section.key} sx={{ borderBottom: '1px solid #F1F5F9', pb: 1.5, '&:last-of-type': { border: 0, pb: 0 } }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
										{section.icon}
										<Typography variant="caption" sx={{ fontWeight: 800, color: '#1A4345', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
											{section.label}
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px' }}>
											({section.startHour}:00 AM - {section.endHour > 12 ? section.endHour - 12 : section.endHour}:00 {section.endHour >= 12 ? 'PM' : 'AM'})
										</Typography>
									</Box>

									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
										{slots.map((slot, slotIdx) => {
											const stepMins = selectedWorkingHours.slotDuration
											const allOptions = makeTimeOptions(section.startHour, section.endHour, stepMins)
											const startOptions =
												slotIdx === 0
													? allOptions
													: allOptions.filter((o) => o.value >= slots[slotIdx - 1].end)
											const endOptions = allOptions.filter((o) => o.value > slot.start)

											return (
												<Box
													key={slotIdx}
													sx={{
														display: 'inline-flex',
														alignItems: 'center',
														flexWrap: 'wrap',
														gap: 1,
													}}
												>
													{/* Time Capsule Container */}
													<Box
														sx={{
															display: 'flex',
															alignItems: 'center',
															bgcolor: '#F8FAFC',
															border: '1px solid #E2E8F0',
															borderRadius: '8px',
															p: '4px 10px',
															gap: 1,
															transition: 'all 0.15s',
															'&:hover, &:focus-within': {
																borderColor: '#2B6F71',
																bgcolor: '#fff',
															}
														}}
													>
														{/* Start Select */}
														<AppSelect
															value={slot.start}
															onChange={(e) =>
																updateSlotTime(section.key, slotIdx, 'start', e.target.value)
															}
															size="small"
															options={startOptions}
															sx={{
																width: 90,
																'& .MuiOutlinedInput-root': { bgcolor: 'transparent', borderRadius: 0 },
																'& .MuiOutlinedInput-root fieldset': { border: 0 },
																'& .MuiOutlinedInput-root.Mui-focused fieldset': { border: 0 },
																'& .MuiOutlinedInput-root:hover fieldset': { border: 0 },
																'& .MuiSelect-select': { py: 0.2, px: 0, fontWeight: 600, fontSize: '12.5px' }
															}}
														/>

														<ArrowForwardIcon sx={{ fontSize: 12, color: 'text.disabled' }} />

														{/* End Select */}
														<AppSelect
															value={slot.end}
															onChange={(e) =>
																updateSlotTime(section.key, slotIdx, 'end', e.target.value)
															}
															size="small"
															options={endOptions}
															sx={{
																width: 90,
																'& .MuiOutlinedInput-root': { bgcolor: 'transparent', borderRadius: 0 },
																'& .MuiOutlinedInput-root fieldset': { border: 0 },
																'& .MuiOutlinedInput-root.Mui-focused fieldset': { border: 0 },
																'& .MuiOutlinedInput-root:hover fieldset': { border: 0 },
																'& .MuiSelect-select': { py: 0.2, px: 0, fontWeight: 600, fontSize: '12.5px' }
															}}
														/>
													</Box>

													{/* Delete action button */}
													{slotIdx > 0 && (
														<IconButton
															size="small"
															onClick={() => removeSlot(section.key, slotIdx)}
															sx={{
																color: 'text.secondary',
																bgcolor: '#F1F5F9',
																p: 0.6,
																borderRadius: '6px',
																transition: 'all 0.15s',
																'&:hover': {
																	color: 'error.main',
																	bgcolor: '#FEE2E2',
																},
															}}
														>
															<DeleteOutlineIcon sx={{ fontSize: 16 }} />
														</IconButton>
													)}
												</Box>
											)
										})}

										{/* Add Slot Trigger */}
										{canAdd && (
											<Box
												onClick={() => addSlot(section.key)}
												sx={{
													display: 'inline-flex',
													alignItems: 'center',
													justifyContent: 'center',
													gap: 0.5,
													border: '1px dashed #2B6F71',
													borderRadius: '8px',
													px: 1.5,
													py: 0.5,
													cursor: 'pointer',
													color: '#2B6F71',
													transition: 'all 0.15s',
													alignSelf: 'flex-start',
													'&:hover': {
														bgcolor: 'rgba(43, 111, 113, 0.04)',
													}
												}}
											>
												<AddIcon sx={{ fontSize: 14 }} />
												<Typography sx={{ fontSize: '11px', fontWeight: 700 }}>
													Add Slot Block
												</Typography>
											</Box>
										)}
									</Box>
								</Box>
							)
						})}

						{/* Slot Session Duration */}
						<Box>
							<Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.secondary', mb: 0.2 }}>
								Slot Duration
							</Typography>
							<Box sx={{ flex: 1 }}>
								<AppSelect
									value={selectedWorkingHours.slotDuration}
									onChange={(e) => updateSlotDuration(Number(e.target.value))}
									size="small"
									options={durationOptions.map((d) => ({ value: d, label: `${d} Minutes` }))}
									sx={{
										width: 120,
										'& .MuiSelect-select': { py: 0.4 }
									}}
								/>
							</Box>
						</Box>

						<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
							<AppButton
								variant="outlined"
								onClick={() => {
									setShowForm(false)
									resetFormState()
								}}
								label="Cancel"
							// size="small"
							// sx={{ color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'text.primary' } }}
							/>

							<AppButton
								variant="contained"
								onClick={handleSave}
								loading={isSaving}
								label="Save"
							// size="small"
							// sx={{
							// 	bgcolor: '#2B6F71',
							// 	fontWeight: 700,
							// 	px: 2,
							// 	'&:hover': {
							// 		bgcolor: '#1D4D4F',
							// 	}
							// }}
							/>
						</Box>
					</Box>
				</Box>
			</Box>
		)
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
			{/* Hospital Tab Top Toolbar */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					gap: 1.5,
				}}
			>
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.2 }}>
						<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', fontSize: '20px' }}>
							My Hospital
						</Typography>
						<Box
							sx={{
								px: 1,
								py: 0.2,
								bgcolor: 'rgba(43, 111, 113, 0.08)',
								color: '#2B6F71',
								borderRadius: '12px',
								fontSize: '11px',
								fontWeight: 700,
							}}
						>
							{hospitals.length} Clinics
						</Box>
					</Box>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>
						Manage locations, consulting fees, working sessions, and booking specifications.
					</Typography>
				</Box>
				<AppButton
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => {
						resetFormState()
						setShowForm(true)
					}}
					label="Add new hospital"
					size="small"
					sx={{
						bgcolor: '#2B6F71',
						fontWeight: 700,
						'&:hover': {
							bgcolor: '#1D4D4F',
						}
					}}
				/>
			</Box>

			{/* Empty State Redesign */}
			{hospitals.length === 0 ? (
				<Box
					sx={{
						...customCardStyle,
						py: 6,
						px: 3,
						textAlign: 'center',
						borderRadius: '12px',
						border: '1px dashed #CBD5E1',
						bgcolor: 'rgba(248, 250, 252, 0.5)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 1.5,
					}}
				>
					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: '50%',
							bgcolor: 'rgba(43, 111, 113, 0.05)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#2B6F71',
							mb: 0.5,
						}}
					>
						<HomeOutlinedIcon sx={{ fontSize: 24 }} />
					</Box>
					<Box>
						<Typography variant="body1" sx={{ fontWeight: 800, color: '#1A4345', mb: 0.2 }}>
							No Clinics Registered
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 320, mx: 'auto', display: 'block', lineHeight: 1.5 }}>
							You haven't added any clinics or hospitals to your profile yet. Add a location to start receiving patient appointments.
						</Typography>
					</Box>
					<AppButton
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={() => {
							resetFormState()
							setShowForm(true)
						}}
						label="Register first location"
						size="small"
						sx={{
							borderColor: '#2B6F71',
							color: '#2B6F71',
							fontWeight: 700,
							mt: 0.5,
							'&:hover': {
								borderColor: '#1D4D4F',
								bgcolor: 'rgba(43, 111, 113, 0.04)',
							}
						}}
					/>
				</Box>
			) : (
				/* Hospital Cards Loop */
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{hospitals.map((hospital) => {
						const addressText = getHospitalAddressText(hospital)

						return (
							<Box
								key={hospital.id}
								sx={{
									display: 'flex',
									flexDirection: { xs: 'column', md: 'row' },
									alignItems: { xs: 'stretch', md: 'center' },
									gap: 1.5,
									border: '1px solid',
									borderColor: hospital.isPrimary ? '#2B6F71' : '#E2E8F0',
									borderLeft: '4px solid',
									borderLeftColor: hospital.isPrimary ? '#2B6F71' : '#94A3B8',
									borderRadius: '12px',
									p: 2,
									bgcolor: hospital.isPrimary ? 'rgba(43, 111, 113, 0.01)' : 'background.paper',
									boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
									transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
									position: 'relative',
									'&:hover': {
										transform: 'translateY(-1px)',
										boxShadow: '0 4px 16px rgba(43, 111, 113, 0.06)',
										borderColor: '#2B6F71',
									}
								}}
							>
								{/* Left Side: Hospital Details Info Group */}
								<Box sx={{ display: 'flex', gap: 2, flex: 1, alignItems: 'flex-start' }}>
									<Box
										sx={{
											width: 36,
											height: 36,
											borderRadius: '8px',
											bgcolor: hospital.isPrimary ? 'rgba(43, 111, 113, 0.08)' : '#F1F5F9',
											color: hospital.isPrimary ? '#2B6F71' : '#64748B',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0,
										}}
									>
										<HomeOutlinedIcon sx={{ fontSize: 18 }} />
									</Box>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, flex: 1 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
											<Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '14px' }}>
												{hospital.name}
											</Typography>
											{hospital.isPrimary && (
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														gap: 0.3,
														px: 0.8,
														py: 0.1,
														bgcolor: '#E6F4F1',
														color: '#2B6F71',
														borderRadius: '8px',
														fontSize: '10px',
														fontWeight: 800,
													}}
												>
													<CheckIcon sx={{ fontSize: 8, fontWeight: 900 }} />
													Primary
												</Box>
											)}
										</Box>
										<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, color: 'text.secondary', mt: 0.2 }}>
											<LocationOnOutlinedIcon sx={{ fontSize: 14, color: '#64748B', mt: 0.1 }} />
											<Typography variant="caption" sx={{ fontSize: '11.5px', lineHeight: 1.3, color: '#475569' }}>
												{addressText}
											</Typography>
										</Box>
										{hospital.phone_number && (
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
												<PhoneOutlinedIcon sx={{ fontSize: 13, color: '#64748B' }} />
												<Typography variant="caption" sx={{ fontSize: '11.5px', color: '#475569', fontWeight: 500 }}>
													{hospital.phone_number}
												</Typography>
											</Box>
										)}
									</Box>
								</Box>

								{/* Right Side: Options & Status Actions */}
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-end', mt: { xs: 1, md: 0 } }}>
									{/* Set Primary Button Widget */}
									{!hospital.isPrimary ? (
										<Box
											onClick={() => handleSetPrimary(hospital.id)}
											sx={{
												display: 'inline-flex',
												alignItems: 'center',
												gap: 0.8,
												px: 1.2,
												py: 0.6,
												cursor: 'pointer',
												transition: 'all 0.2s',
												'&:hover': {
													borderColor: '#2B6F71',
													bgcolor: 'rgba(43, 111, 113, 0.02)',
												}
											}}
										>
											<Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.secondary' }}>
												Set as Primary
											</Typography>
											<Radio
												checked={hospital.isPrimary}
												size="small"
												sx={{
													p: 0,
													color: 'text.disabled',
													'&.Mui-checked': { color: '#2B6F71' }
												}}
											/>
										</Box>
									) : (
										/* Blank placeholder on desktop so cards keep width symmetry */
										<Box sx={{ display: { xs: 'none', md: 'block' }, width: 110 }} />
									)}

									{/* Options Vertical Ellipsis Button */}
									<IconButton
										onClick={(e) => handleOpenMenu(e, hospital.id)}
										sx={{
											border: '1px solid #E2E8F0',
											borderRadius: '8px',
											p: 0.6,
											color: 'text.secondary',
											transition: 'all 0.2s',
											'&:hover': {
												borderColor: '#2B6F71',
												color: '#2B6F71',
												bgcolor: 'rgba(43, 111, 113, 0.04)',
											}
										}}
									>
										<MoreVertIcon sx={{ fontSize: 16 }} />
									</IconButton>
								</Box>
							</Box>
						)
					})}
				</Box>
			)}

			{/* Context menu for each hospital */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleCloseMenu}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				PaperProps={{
					elevation: 2,
					sx: {
						mt: 0.5,
						minWidth: 130,
						borderRadius: '8px',
						border: '1px solid #E2E8F0',
						boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
						p: 0.3,
					},
				}}
			>
				<MuiMenuItem
					onClick={() => menuHospitalId && handleEdit(menuHospitalId)}
					sx={{
						fontSize: '12.5px',
						fontWeight: 600,
						py: 0.8,
						px: 1.5,
						borderRadius: '6px',
						'&:hover': { bgcolor: 'rgba(43, 111, 113, 0.05)', color: '#2B6F71' },
					}}
				>
					Edit
				</MuiMenuItem>
				<MuiMenuItem
					onClick={handleCloseMenu}
					sx={{
						fontSize: '12.5px',
						fontWeight: 600,
						py: 0.8,
						px: 1.5,
						borderRadius: '6px',
						color: 'error.main',
						'&:hover': { bgcolor: '#FEE2E2' },
					}}
				>
					Deactivate
				</MuiMenuItem>
			</Menu>
		</Box>
	)
}
