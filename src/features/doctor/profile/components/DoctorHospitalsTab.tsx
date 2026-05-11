// src/features/doctor/profile/components/DoctorHospitalsTab.tsx
import { useState } from 'react'
import { Box, Typography, IconButton, Radio } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'
import AppButton from '../../../../components/common/Button/AppButton'
import AppInput from '../../../../components/common/Input/AppInput'
import { customCardStyle } from '../../../../styles/commonStyles'
import type { DoctorHospital } from '../../../../types/doctor-profile'
import { createHospital } from '../../doctorService'
import { MenuItem, TextField } from '@mui/material'

interface DoctorHospitalsTabProps {
	hospitals: DoctorHospital[]
	onChange: (hospitals: DoctorHospital[]) => void
}

type AppointmentType = 'clinic' | 'video'

// A single time slot: start + end
type TimeSlot = { start: string; end: string }

// Per-section slots (1–3)
type SectionSlots = {
	morning: TimeSlot[]
	afternoon: TimeSlot[]
	evening: TimeSlot[]
}

type WorkingHoursState = {
	sections: SectionSlots
	slotDuration: number
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

// Generate time options for a given hour range; value = 24h, label = 12h AM/PM
// Generate time options for a given hour range with a custom step in minutes
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

// Snap a HH:MM time string to the nearest multiple of stepMins
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
		startHour: 8,
		endHour: 12,
		defaultStart: '08:00',
		defaultEnd: '10:00',
	},
	{
		key: 'afternoon' as const,
		label: 'Afternoon',
		startHour: 12,
		endHour: 17,
		defaultStart: '12:00',
		defaultEnd: '14:00',
	},
	{
		key: 'evening' as const,
		label: 'Evening',
		startHour: 17,
		endHour: 21,
		defaultStart: '17:00',
		defaultEnd: '19:00',
	},
]

export default function DoctorHospitalsTab({ hospitals, onChange }: DoctorHospitalsTabProps) {
	const [showForm, setShowForm] = useState(false)
	const [form, setForm] = useState(EMPTY_FORM)
	const [isSaving, setIsSaving] = useState(false)

	const [workingHoursByType, setWorkingHoursByType] = useState<Record<AppointmentType, WorkingHoursState>>({
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
	const [allowPayLater, setAllowPayLater] = useState('no')

	const selectedWorkingHours = workingHoursByType[selectedAppointmentType]

	// Add a new slot to a section (max 3). New slot starts at previous slot's end time.
	const addSlot = (sectionKey: keyof SectionSlots) => {
		setWorkingHoursByType((prev) => {
			const current = prev[selectedAppointmentType]
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
				[selectedAppointmentType]: {
					...current,
					sections: {
						...current.sections,
						[sectionKey]: [...slots, { start: prevEnd, end: newEnd }],
					},
				},
			}
		})
	}

	// Remove a slot by index (only slots 1+ can be removed, not index 0)
	const removeSlot = (sectionKey: keyof SectionSlots, slotIndex: number) => {
		setWorkingHoursByType((prev) => {
			const current = prev[selectedAppointmentType]
			const slots = current.sections[sectionKey]
			if (slotIndex === 0) return prev
			return {
				...prev,
				[selectedAppointmentType]: {
					...current,
					sections: {
						...current.sections,
						[sectionKey]: slots.filter((_, i) => i !== slotIndex),
					},
				},
			}
		})
	}

	// Update start or end time of a specific slot
	const updateSlotTime = (
		sectionKey: keyof SectionSlots,
		slotIndex: number,
		field: 'start' | 'end',
		value: string
	) => {
		setWorkingHoursByType((prev) => {
			const current = prev[selectedAppointmentType]
			const slots = current.sections[sectionKey].map((slot, i) =>
				i === slotIndex ? { ...slot, [field]: value } : slot
			)
			return {
				...prev,
				[selectedAppointmentType]: {
					...current,
					sections: { ...current.sections, [sectionKey]: slots },
				},
			}
		})
	}

	const updateSlotDuration = (value: number) => {
		setWorkingHoursByType((prev) => {
			const current = prev[selectedAppointmentType]
			// Snap all existing slot times to the new step so selected values stay valid
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
				[selectedAppointmentType]: {
					sections: snappedSections,
					slotDuration: value,
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
			const response = await createHospital({
				name: trimmedName,
				phone_number: form.phone_number.trim(),
				full_address: trimmedAddress,
				is_primary: isPrimary,
				video_consultation_fee: form.video_consultation_fee.trim(),
				offline_consultation_fee: form.offline_consultation_fee.trim(),
			})
			toast.success(getSuccessMessage(response))
			window.location.reload()
		} catch (error) {
			console.error('Failed to save hospital', error)
			toast.error('Failed to save hospital')
		} finally {
			setIsSaving(false)
		}
	}

	if (showForm) {
		return (
			<Box sx={{ ...customCardStyle }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
					<IconButton
						size="small"
						onClick={() => {
							setShowForm(false)
							setForm(EMPTY_FORM)
						}}
						sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
					>
						<ArrowBackIosNewIcon sx={{ fontSize: 15 }} />
					</IconButton>
					<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px' }}>
						Add new Hospital Details
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					<AppInput
						label="Enter hospital name"
						value={form.name}
						placeholder="e.g. Arogya Clinic"
						onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
					/>
					<AppInput
						label="Phone number"
						value={form.phone_number}
						placeholder="e.g. +91 98765 43210"
						onChange={(e) => setForm((prev) => ({ ...prev, phone_number: e.target.value }))}
					/>
					<AppInput
						label="Enter Full address"
						value={form.fullAddress}
						placeholder="Enter complete address"
						multiline
						rows={3}
						onChange={(e) => setForm((prev) => ({ ...prev, fullAddress: e.target.value }))}
					/>
					<AppInput
						label="Video consultation fee"
						value={form.video_consultation_fee}
						placeholder="e.g. 500"
						onChange={(e) => setForm((prev) => ({ ...prev, video_consultation_fee: e.target.value }))}
					/>
					<AppInput
						label="Offline consultation fee"
						value={form.offline_consultation_fee}
						placeholder="e.g. 300"
						onChange={(e) => setForm((prev) => ({ ...prev, offline_consultation_fee: e.target.value }))}
					/>

					{/* Working Hours */}
					<Box sx={{ mt: 0.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
							<Typography sx={{ fontWeight: 700, fontSize: '18px' }}>Working Hours</Typography>
						</Box>

						{/* Date strip + Clinic/Video toggle */}
						<Box sx={{ mb: 3 }}>
							{/* Days */}
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									gap: 0.9,
									width: '100%',
									mb: 3,
								}}
							>
								{weekDates.map((date) => {
									const isSelected = isSameDay(date, selectedDate)

									return (
										<Box
											key={date.toISOString()}
											onClick={() => setSelectedDate(date)}
											sx={{
												flex: 1,
												maxWidth: '58px',
												minHeight: '58px',
												py: 0.8,
												borderRadius: '12px',
												border: '1px solid',
												borderColor: isSelected ? '#0c7c7c' : '#D7D7D7',
												bgcolor: isSelected ? '#0c7c7c' : '#fff',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												cursor: 'pointer',
												transition: 'all 0.2s ease',
												'&:hover': {
													borderColor: '#0c7c7c',
													bgcolor: isSelected ? '#0c7c7c' : '#F7FAFA',
												},
											}}
										>
											<Typography
												sx={{
													fontSize: '16px',
													fontWeight: 500,
													color: isSelected ? '#fff' : '#5F6B76',
												}}
											>
												{DAYS[date.getDay()]}
											</Typography>
										</Box>
									)
								})}
							</Box>

							{/* Appointment Type */}
							<Box>
								<Typography
									sx={{
										fontSize: '14px',
										fontWeight: 500,
										color: '#5F6B76',
										mb: 1.2,
									}}
								>
									Type of Appointment
								</Typography>

								<Box
									sx={{
										display: 'inline-flex',
										alignItems: 'center',
										bgcolor: '#0c7c7c',
										borderRadius: '999px',
										p: '3px',
										gap: '3px',
									}}
								>
									<Box
										onClick={() => setSelectedAppointmentType('clinic')}
										sx={{
											px: 2.3,
											py: 0.5,
											borderRadius: '999px',
											cursor: 'pointer',
											bgcolor: selectedAppointmentType === 'clinic' ? '#fff' : 'transparent',
											transition: 'all 0.2s',
										}}
									>
										<Typography
											sx={{
												fontSize: '13px',
												fontWeight: 600,
												color: selectedAppointmentType === 'clinic' ? '#111' : '#fff',
											}}
										>
											Clinic Visit
										</Typography>
									</Box>

									<Box
										onClick={() => setSelectedAppointmentType('video')}
										sx={{
											px: 2.3,
											py: 0.7,
											borderRadius: '999px',
											cursor: 'pointer',
											bgcolor: selectedAppointmentType === 'video' ? '#fff' : 'transparent',
											transition: 'all 0.2s',
										}}
									>
										<Typography
											sx={{
												fontSize: '13px',
												fontWeight: 600,
												color: selectedAppointmentType === 'video' ? '#111' : '#fff',
											}}
										>
											Video Call
										</Typography>
									</Box>
								</Box>
							</Box>
						</Box>

						<Box key={selectedAppointmentType}>
							{SECTION_META.map((section) => {
								const slots = selectedWorkingHours.sections[section.key]
								const canAdd = slots.length < 3

								return (
									<Box key={section.label} sx={{ mb: 2 }}>
										<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>
											{section.label}
										</Typography>

										{/* All slots in a single row */}
										<Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
											{slots.map((slot, slotIdx) => {
												const stepMins = selectedWorkingHours.slotDuration
												// Build options dynamically from slot duration
												const allOptions = makeTimeOptions(
													section.startHour,
													section.endHour,
													stepMins
												)
												// For slots after the first, only allow start >= previous slot's end
												const startOptions =
													slotIdx === 0
														? allOptions
														: allOptions.filter((o) => o.value >= slots[slotIdx - 1].end)
												const endOptions = allOptions.filter((o) => o.value > slot.start)

												return (
													<Box
														key={slotIdx}
														sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
													>
														<TextField
															select
															label="Start Time"
															value={slot.start}
															onChange={(e) =>
																updateSlotTime(
																	section.key,
																	slotIdx,
																	'start',
																	e.target.value
																)
															}
															size="small"
															sx={{ width: 140 }}
														>
															{startOptions.map((o) => (
																<MenuItem key={o.value} value={o.value}>
																	{o.label}
																</MenuItem>
															))}
														</TextField>

														<TextField
															select
															label="End Time"
															value={slot.end}
															onChange={(e) =>
																updateSlotTime(
																	section.key,
																	slotIdx,
																	'end',
																	e.target.value
																)
															}
															size="small"
															sx={{ width: 140 }}
														>
															{endOptions.map((o) => (
																<MenuItem key={o.value} value={o.value}>
																	{o.label}
																</MenuItem>
															))}
														</TextField>

														{/* × button — only on slots 2 and 3 */}
														{slotIdx > 0 && (
															<IconButton
																size="small"
																onClick={() => removeSlot(section.key, slotIdx)}
																sx={{
																	color: 'text.secondary',
																	'&:hover': { color: 'error.main' },
																	'&:focus': { outline: 'none' },
																}}
															>
																<CloseIcon sx={{ fontSize: 16 }} />
															</IconButton>
														)}

														{/* + button — only on the last slot and if < 3 */}
														{slotIdx === slots.length - 1 && canAdd && (
															<IconButton
																size="small"
																onClick={() => addSlot(section.key)}
																sx={{
																	color: 'primary.main',
																	border: '1px solid',
																	borderColor: 'primary.main',
																	borderRadius: '6px',
																	p: 0.4,
																	'&:hover': { bgcolor: 'rgba(43,111,113,0.08)' },
																	'&:focus': { outline: 'none' },
																}}
															>
																<AddIcon sx={{ fontSize: 18 }} />
															</IconButton>
														)}
													</Box>
												)
											})}
										</Box>
									</Box>
								)
							})}

							{/* Slot Duration */}
							<Box>
								<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>
									Slot Duration
								</Typography>
								<TextField
									select
									label="Duration"
									value={selectedWorkingHours.slotDuration}
									onChange={(e) => updateSlotDuration(Number(e.target.value))}
									size="small"
									sx={{ width: 150 }}
								>
									{durationOptions.map((d) => (
										<MenuItem key={d} value={d}>
											{d} mins
										</MenuItem>
									))}
								</TextField>
							</Box>
						</Box>
					</Box>
				</Box>
				{/* Appointment Rules */}
				<Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Typography sx={{ fontWeight: 700, fontSize: '18px' }}>Appointment Rules</Typography>

					{/* Free Follow-up Days */}
					<Box>
						<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>
							Free Follow-up Validity
						</Typography>

						<TextField
							select
							value={followUpDays}
							onChange={(e) => setFollowUpDays(Number(e.target.value))}
							size="small"
							sx={{ width: 180 }}
						>
							<MenuItem value={0}>No Follow-up</MenuItem>
							<MenuItem value={3}>3 Days</MenuItem>
							<MenuItem value={5}>5 Days</MenuItem>
							<MenuItem value={7}>7 Days</MenuItem>
							<MenuItem value={10}>10 Days</MenuItem>
							<MenuItem value={15}>15 Days</MenuItem>
						</TextField>
					</Box>

					{/* Reschedule Cutoff */}
					<Box>
						<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>
							Reschedule Allowed Until
						</Typography>

						<TextField
							select
							value={rescheduleCutoff}
							onChange={(e) => setRescheduleCutoff(Number(e.target.value))}
							size="small"
							sx={{ width: 180 }}
						>
							<MenuItem value={1}>1 Hour </MenuItem>
							<MenuItem value={2}>2 Hours </MenuItem>
							<MenuItem value={3}>3 Hours </MenuItem>
							<MenuItem value={4}>4 Hours </MenuItem>
							<MenuItem value={6}>6 Hours </MenuItem>
							<MenuItem value={12}>12 Hours </MenuItem>
							<MenuItem value={24}>1 Day </MenuItem>
						</TextField>
					</Box>

					{/* Pay Later */}
					<Box>
						<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>
							Allow Pay Later
						</Typography>

						<TextField
							select
							value={allowPayLater}
							onChange={(e) => setAllowPayLater(e.target.value)}
							size="small"
							sx={{ width: 180 }}
						>
							<MenuItem value="yes">Yes</MenuItem>
							<MenuItem value="no">No</MenuItem>
						</TextField>
					</Box>
				</Box>

				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
					<AppButton variant="contained" onClick={handleSave} loading={isSaving} label="Save Details" />
				</Box>
			</Box>
		)
	}

	return (
		<Box sx={{ ...customCardStyle }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
				<Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
					My Hospital
				</Typography>
				<AppButton
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setShowForm(true)}
					label="Add new hospital"
				/>
			</Box>

			{hospitals.length === 0 ? (
				<Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
					<HomeOutlinedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
					<Typography variant="body2">No hospitals added yet</Typography>
				</Box>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					{hospitals.map((hospital, index) => (
						<Box key={hospital.id}>
							<Typography
								variant="caption"
								sx={{
									color: 'primary.main',
									fontWeight: 600,
									fontSize: '13px',
									mb: 1,
									display: 'block',
								}}
							>
								Address {index + 1}
							</Typography>

							<Box sx={{ display: 'flex', gap: 1 }}>
								<Box
									sx={{
										flex: 1,
										border: '1px solid',
										borderColor: hospital.isPrimary ? 'primary.main' : 'divider',
										borderRadius: '10px',
										p: 2,
										borderLeft: '4px solid',
										borderLeftColor: hospital.isPrimary ? 'primary.main' : 'divider',
									}}
								>
									<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
										<HomeOutlinedIcon
											sx={{ fontSize: 18, color: 'primary.main', mt: 0.2, flexShrink: 0 }}
										/>
										<Box sx={{ flex: 1 }}>
											<Typography
												variant="body2"
												sx={{ fontWeight: 600, color: 'text.primary', mb: 0.4 }}
											>
												{hospital.name}
											</Typography>
											<Typography
												variant="caption"
												sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.5 }}
											>
												{getHospitalAddressText(hospital)}
											</Typography>
										</Box>
									</Box>
								</Box>

								<Box
									sx={{
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: '10px',
										px: 2,
										display: 'flex',
										alignItems: 'center',
										gap: 0.5,
										cursor: 'pointer',
										minWidth: 140,
										justifyContent: 'center',
										'&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(43,111,113,0.03)' },
										transition: 'all 0.15s',
									}}
									onClick={() => handleSetPrimary(hospital.id)}
								>
									<Typography
										variant="caption"
										sx={{ color: 'primary.main', fontWeight: 500, fontSize: '13px' }}
									>
										Set as Primary
									</Typography>
									<Radio
										checked={hospital.isPrimary}
										size="small"
										sx={{ p: 0, color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
									/>
								</Box>

								<Box
									sx={{
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: '10px',
										width: 44,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
										'&:hover': { borderColor: 'primary.main' },
										transition: 'all 0.15s',
									}}
								>
									<MoreHorizIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
								</Box>
							</Box>
						</Box>
					))}
				</Box>
			)}
		</Box>
	)
}
