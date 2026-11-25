// src/features/doctor/profile/components/WorkingHoursScheduler.tsx
// The weekly working-hours editor for ONE hospital. It starts from the hours saved for that hospital (GET /api/doctors/hospitals)
// and fills nothing in: a day or session without hours stays empty until the doctor adds a block. The hours at the doctor's
// OTHER hospitals are passed in too, so a block that overlaps one of them (one clinic at a time) is flagged while it is edited,
// before the save would refuse it.
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import {
	Add as AddIcon,
	ArrowForward as ArrowForwardIcon,
	DeleteOutline as DeleteOutlineIcon,
	WbSunnyOutlined as MorningIcon,
	LightModeOutlined as AfternoonIcon,
	NightsStayOutlined as EveningIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import AppButton from '../../../../components/common/Button/AppButton'
import AppSelect from '../../../../components/common/Select/AppSelect'
import AppSkeleton from '../../../../components/common/Skeleton/AppSkeleton'
import AppSegmentedToggle, { type SegmentedToggleOption } from '../../../../components/common/Switch/AppSegmentedToggle'
import { customCardStyle } from '../../../../styles/commonStyles'
import type {
	AppointmentType,
	DoctorHospitalHours,
	SectionSlots,
	TimeSlot,
	WeeklyAvailability,
	WorkingHoursState,
} from '../../../../types/doctor-profile'
import { updateWeeklyAvailability } from '../../doctorService'

interface WorkingHoursSchedulerProps {
	/** The hospital being edited, with its saved weekly hours. */
	hospital: DoctorHospitalHours
	/** The doctor's other hospitals, with their saved hours: what this hospital's blocks are checked against. */
	others: DoctorHospitalHours[]
	/** Called after the hours were saved. */
	onSaved: () => void
}

type Option = { value: string; label: string }

// How a day is laid out in this editor. The API does not carry these, and nothing else about the schedule is fixed here: no
// hours are invented for a day or session that has none.
const SESSIONS = [
	{ key: 'morning', label: 'Morning', start: '08:00', end: '12:00' },
	{ key: 'afternoon', label: 'Afternoon', start: '12:00', end: '17:00' },
	{ key: 'evening', label: 'Evening', start: '17:00', end: '21:00' },
]
const SLOT_DURATIONS = [10, 15, 20, 25, 30]
const DEFAULT_SLOT_DURATION = 15 // the length of a day that has no hours yet (what the API reports for it too)
const MAX_BLOCKS_PER_SESSION = 3

const toMinutes = (time: string) => {
	const [h, m] = time.split(':').map(Number)
	return h * 60 + m
}

const toTime = (mins: number) =>
	String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0')

/** "08:00" -> "8:00 AM", "17:30" -> "5:30 PM" */
const formatTime = (time: string) => {
	const [h, m] = time.split(':').map(Number)
	const period = h < 12 ? 'AM' : 'PM'
	const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
	return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/** Times from `from` to `to` (minutes of the day) every `step` minutes; the end itself only for an end-time list. */
const timeOptions = (from: number, to: number, step: number, includeEnd: boolean): Option[] => {
	const options: Option[] = []
	for (let mins = from; includeEnd ? mins <= to : mins < to; mins += step) {
		const value = toTime(mins)
		options.push({ value, label: formatTime(value) })
	}
	return options
}

/** The options, plus the current value when it is not among them (hours saved outside the window or off the step). */
const withCurrent = (options: Option[], current: string): Option[] =>
	options.some((o) => o.value === current)
		? options
		: [...options, { value: current, label: formatTime(current) }].sort((a, b) => a.value.localeCompare(b.value))

const snapToStep = (time: string, stepMins: number): string => toTime(Math.round(toMinutes(time) / stepMins) * stepMins)

/**
 * The end a block gets by default: as many whole slots as fit from `start` up to `limit` (the session end, or the start of
 * the next block). 9:40 with 25-minute slots and a 12:00 limit ends at 11:45. When not even one slot fits it ends at the limit.
 */
const defaultBlockEnd = (start: number, limit: number, step: number): number => {
	const slots = Math.floor((limit - start) / step)
	return slots >= 1 ? start + slots * step : limit
}

const overlaps = (a: TimeSlot, b: TimeSlot) =>
	toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end)

const APPOINTMENT_TYPE_OPTIONS: SegmentedToggleOption<AppointmentType>[] = [
	{ value: 'clinic', label: 'Clinic Visit' },
	{ value: 'video', label: 'Video Call' },
]
const APPOINTMENT_TYPES: AppointmentType[] = ['clinic', 'video']

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const getWeekDates = (start: Date) => {
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(start)
		d.setDate(start.getDate() + i)
		return d
	})
}

// How a session looks: only the icon is decoration.
const SESSION_ICONS: Record<string, ReactNode> = {
	morning: <MorningIcon sx={{ fontSize: 16, color: '#FFB020' }} />,
	afternoon: <AfternoonIcon sx={{ fontSize: 16, color: '#10B981' }} />,
	evening: <EveningIcon sx={{ fontSize: 16, color: '#6366F1' }} />,
}

const cloneMode = (mode: WorkingHoursState): WorkingHoursState => ({
	sections: Object.fromEntries(
		Object.entries(mode.sections).map(([key, blocks]) => [key, blocks.map((block) => ({ ...block }))])
	),
	slotDuration: mode.slotDuration,
})

/** The saved hours as the editor's working copy: all 7 days, both modes, every session present (empty when unset). */
const toWorkingCopy = (saved: WeeklyAvailability): WeeklyAvailability => {
	const mode = (m?: WorkingHoursState): WorkingHoursState => ({
		sections: Object.fromEntries(
			SESSIONS.map((session) => [session.key, (m?.sections?.[session.key] ?? []).map((block) => ({ ...block }))])
		),
		slotDuration: m?.slotDuration ?? DEFAULT_SLOT_DURATION,
	})
	const copy: WeeklyAvailability = {}
	for (let day = 0; day < 7; day++) {
		copy[day] = { clinic: mode(saved[day]?.clinic), video: mode(saved[day]?.video) }
	}
	return copy
}

/** The server sends all 7 days even for a hospital with no hours, so "saved" means at least one time block exists. */
const hasSavedHours = (saved: WeeklyAvailability) =>
	Object.values(saved).some((day) =>
		Object.values(day).some((mode) => Object.values(mode.sections).some((blocks) => blocks.length > 0))
	)

export default function WorkingHoursScheduler({ hospital, others, onSaved }: WorkingHoursSchedulerProps) {
	const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>(() =>
		toWorkingCopy(hospital.availability)
	)
	const [isSaving, setIsSaving] = useState(false)

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

	// Clinic / Video switch: the hours change at once, so a short skeleton makes the change visible to the doctor.
	const [isSwitching, setIsSwitching] = useState(false)
	const switchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
	useEffect(() => () => clearTimeout(switchTimer.current), [])
	const handleAppointmentTypeChange = (type: AppointmentType) => {
		if (type === selectedAppointmentType) return
		setSelectedAppointmentType(type)
		setIsSwitching(true)
		clearTimeout(switchTimer.current)
		switchTimer.current = setTimeout(() => setIsSwitching(false), 300)
	}

	const selectedDay = selectedDate.getDay()
	const selectedWorkingHours = weeklyAvailability[selectedDay][selectedAppointmentType]

	/**
	 * The saved blocks at the doctor's other hospitals that this block overlaps: the same day and the same kind (clinic with
	 * clinic, video with video; clinic and video hours may share a time), which is what the save refuses.
	 */
	const clashesFor = (block: TimeSlot, day: number, mode: AppointmentType) =>
		others.flatMap((other) =>
			Object.values(other.availability[day]?.[mode]?.sections ?? {})
				.flat()
				.filter((theirs) => overlaps(block, theirs))
				.map((theirs) => ({ hospital: other.name, block: theirs }))
		)

	const describeClashes = (block: TimeSlot, day: number, mode: AppointmentType) =>
		clashesFor(block, day, mode)
			.map((c) => `${c.hospital} ${formatTime(c.block.start)} - ${formatTime(c.block.end)}`)
			.join(', ')

	const dayClashCount = (day: number) =>
		APPOINTMENT_TYPES.reduce(
			(total, mode) =>
				total +
				Object.values(weeklyAvailability[day][mode].sections)
					.flat()
					.filter((block) => clashesFor(block, day, mode).length > 0).length,
			0
		)
	const clashCount = weekDates.reduce((total, date) => total + dayClashCount(date.getDay()), 0)

	/** Changes the selected day's hours for the selected mode (clinic or video). */
	const updateMode = (update: (current: WorkingHoursState) => WorkingHoursState) => {
		setWeeklyAvailability((prev) => {
			const day = selectedDate.getDay()
			return {
				...prev,
				[day]: { ...prev[day], [selectedAppointmentType]: update(prev[day][selectedAppointmentType]) },
			}
		})
	}

	const handleApplyAvailability = (mode: 'weekdays' | 'all') => {
		const day = selectedDate.getDay()
		const source = weeklyAvailability[day]
		const targetDays = mode === 'weekdays' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6]

		setWeeklyAvailability((prev) => {
			const updated = { ...prev }
			for (const d of targetDays) {
				if (d === day) continue
				updated[d] = { clinic: cloneMode(source.clinic), video: cloneMode(source.video) }
			}
			return updated
		})
		toast.success(`Applied availability to ${mode === 'weekdays' ? 'all weekdays' : 'all days'}`)
	}

	/** Where the next block of a session would start (after the last one), or null when the session is full. */
	const nextBlockStart = (sessionKey: string, blocks: TimeSlot[]): number | null => {
		const session = SESSIONS.find((s) => s.key === sessionKey)
		if (!session || blocks.length >= MAX_BLOCKS_PER_SESSION) return null
		const start = blocks.length ? toMinutes(blocks[blocks.length - 1].end) : toMinutes(session.start)
		return start < toMinutes(session.end) ? start : null
	}

	const addSlot = (sessionKey: string) => {
		updateMode((current) => {
			const session = SESSIONS.find((s) => s.key === sessionKey)
			const blocks = current.sections[sessionKey] ?? []
			const start = nextBlockStart(sessionKey, blocks)
			if (!session || start === null) return current
			// A new block runs to the last whole slot before the end of its session (the doctor shortens it if needed)
			const end = defaultBlockEnd(start, toMinutes(session.end), current.slotDuration)
			return {
				...current,
				sections: {
					...current.sections,
					[sessionKey]: [...blocks, { start: toTime(start), end: toTime(end) }],
				},
			}
		})
	}

	const removeSlot = (sessionKey: string, slotIndex: number) => {
		updateMode((current) => ({
			...current,
			sections: {
				...current.sections,
				[sessionKey]: current.sections[sessionKey].filter((_, i) => i !== slotIndex),
			},
		}))
	}

	const updateSlotTime = (sessionKey: string, slotIndex: number, field: 'start' | 'end', value: string) => {
		updateMode((current) => {
			const session = SESSIONS.find((s) => s.key === sessionKey)
			const blocks = current.sections[sessionKey]
			return {
				...current,
				sections: {
					...current.sections,
					[sessionKey]: blocks.map((slot, i) => {
						if (i !== slotIndex) return slot
						if (field === 'end' || !session) return { ...slot, [field]: value }
						// A new start time brings its default end: the last whole slot before the next block (or the session end)
						const limit = blocks[slotIndex + 1] ? toMinutes(blocks[slotIndex + 1].start) : toMinutes(session.end)
						return { start: value, end: toTime(defaultBlockEnd(toMinutes(value), limit, current.slotDuration)) }
					}),
				},
			}
		})
	}

	const updateSlotDuration = (value: number) => {
		updateMode((current) => ({
			sections: Object.fromEntries(
				Object.entries(current.sections).map(([key, blocks]) => [
					key,
					blocks.map((slot) => ({ start: snapToStep(slot.start, value), end: snapToStep(slot.end, value) })),
				])
			) as SectionSlots,
			slotDuration: value,
		}))
	}

	const handleSave = async () => {
		setIsSaving(true)
		try {
			const res = await updateWeeklyAvailability({
				hospital_id: hospital.hospitalId,
				availability: weeklyAvailability,
			})
			const message = (res.data as { message?: string } | undefined)?.message
			onSaved()
			toast.success(message || 'Working hours saved successfully')
		} catch (err) {
			// The shared API client already shows the server's reason (for example the "hours at two clinics can't
			// overlap" rule), so there is no second toast here. The edits stay on screen to be fixed and saved again.
			console.error('Failed to save working hours:', err)
		} finally {
			setIsSaving(false)
		}
	}

	// The slot lengths on offer; a length saved earlier that is not on offer any more is still shown as itself.
	const durationChoices = SLOT_DURATIONS.includes(selectedWorkingHours.slotDuration)
		? SLOT_DURATIONS
		: [...SLOT_DURATIONS, selectedWorkingHours.slotDuration].sort((a, b) => a - b)

	return (
		<Box sx={{ ...customCardStyle, borderRadius: '12px', border: '1px solid #E2E8F0', p: 2.5 }}>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					gap: 1.5,
					mb: 2,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A4345' }}>
							Working Hours Scheduler
						</Typography>
					</Box>
				</Box>

				{/* Clinic / Video switch */}
				<AppSegmentedToggle
					variant="pill"
					fullWidth={false}
					value={selectedAppointmentType}
					onChange={handleAppointmentTypeChange}
					options={APPOINTMENT_TYPE_OPTIONS}
				/>
			</Box>

			{!hasSavedHours(hospital.availability) && (
				<Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1.5 }}>
					No working hours are saved for this hospital yet. Add the hours below and press Save working hours.
				</Typography>
			)}

			{/* Date strip widget */}
			<Box sx={{ mb: 2.5 }}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mb: 1,
						flexWrap: 'wrap',
						gap: 1,
					}}
				>
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
								'&:hover': { background: 'none', color: '#1D4D4F', textDecoration: 'underline' },
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
								'&:hover': { background: 'none', color: '#1D4D4F', textDecoration: 'underline' },
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
						const hasClash = dayClashCount(dayVal) > 0

						return (
							<Box
								key={date.toISOString()}
								onClick={() => setSelectedDate(date)}
								title={hasClash ? 'This day has hours that clash with another hospital' : undefined}
								sx={{
									position: 'relative',
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
								{hasClash && (
									<Box
										sx={{
											position: 'absolute',
											top: 4,
											right: 4,
											width: 7,
											height: 7,
											borderRadius: '50%',
											bgcolor: 'error.main',
										}}
									/>
								)}
								<Typography
									sx={{
										fontSize: '9px',
										fontWeight: 700,
										textTransform: 'uppercase',
										opacity: isSelected ? 0.8 : 0.5,
										mb: 0.2,
									}}
								>
									{DAYS[dayVal]}
								</Typography>
								<Typography sx={{ fontSize: '13px', fontWeight: 800 }}>{DAY_LABELS[dayVal]}</Typography>
							</Box>
						)
					})}
				</Box>
			</Box>

			{/* Time slots and configurator list */}
			<Box key={selectedAppointmentType} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				{isSwitching ? (
					<>
						{SESSIONS.map((session) => (
							<Box key={session.key}>
								<AppSkeleton width={150} height={18} sx={{ mb: 1 }} />
								<AppSkeleton width={240} height={40} />
							</Box>
						))}
						<AppSkeleton width={120} height={36} />
					</>
				) : (
					<>
						{SESSIONS.map((session) => {
							const blocks = selectedWorkingHours.sections[session.key] ?? []
							// The button stays on screen while the session has fewer than the maximum blocks; it is disabled when the
							// last block already reaches the end of the session (no room for another).
							const showAdd = blocks.length < MAX_BLOCKS_PER_SESSION
							const canAdd = nextBlockStart(session.key, blocks) !== null
							const step = selectedWorkingHours.slotDuration
							const windowStart = toMinutes(session.start)
							const windowEnd = toMinutes(session.end)

							return (
								<Box
									key={session.key}
									sx={{
										borderBottom: '1px solid #F1F5F9',
										pb: 1.5,
										'&:last-of-type': { border: 0, pb: 0 },
									}}
								>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
										{SESSION_ICONS[session.key]}
										<Typography
											variant="caption"
											sx={{
												fontWeight: 800,
												color: '#1A4345',
												textTransform: 'uppercase',
												letterSpacing: '0.04em',
											}}
										>
											{session.label}
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px' }}>
											({formatTime(session.start)} - {formatTime(session.end)})
										</Typography>
									</Box>

									<Box
										sx={{
											display: 'grid',
											gridTemplateColumns: {
												xs: 'minmax(0, 1fr)',
												sm: 'repeat(2, minmax(0, 1fr))',
											},
											gap: 1.5,
											alignItems: 'start',
										}}
									>
										{blocks.map((slot, slotIdx) => {
											const startChoices = timeOptions(
												windowStart,
												windowEnd,
												step,
												false
											).filter((o) => slotIdx === 0 || o.value >= blocks[slotIdx - 1].end)
											const endChoices = timeOptions(toMinutes(slot.start) + step, windowEnd, step, true).filter(
												(o) => o.value > slot.start
											)
											const clash = describeClashes(slot, selectedDay, selectedAppointmentType)

											return (
												<Box key={slotIdx}>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
														<AppSelect
															value={slot.start}
															onChange={(e) =>
																updateSlotTime(
																	session.key,
																	slotIdx,
																	'start',
																	e.target.value
																)
															}
															size="small"
															error={Boolean(clash)}
															options={withCurrent(startChoices, slot.start)}
															sx={{ flex: 1, minWidth: 0 }}
														/>
														<ArrowForwardIcon
															sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }}
														/>
														<AppSelect
															value={slot.end}
															onChange={(e) =>
																updateSlotTime(
																	session.key,
																	slotIdx,
																	'end',
																	e.target.value
																)
															}
															size="small"
															error={Boolean(clash)}
															options={withCurrent(endChoices, slot.end)}
															sx={{ flex: 1, minWidth: 0 }}
														/>
														<IconButton
															size="small"
															color="error"
															aria-label="Remove this time block"
															onClick={() => removeSlot(session.key, slotIdx)}
															sx={{ p: 0.5 }}
														>
															<DeleteOutlineIcon fontSize="small" />
														</IconButton>
													</Box>
													{clash && (
														<Typography
															variant="caption"
															role="alert"
															sx={{
																display: 'block',
																mt: 0.5,
																color: 'error.main',
																fontSize: '11px',
															}}
														>
															Clashes with {clash}
														</Typography>
													)}
												</Box>
											)
										})}

										{showAdd && (
											<Tooltip title={canAdd ? '' : 'Shorten the last block to add another one'}>
												<Box component="span" sx={{ justifySelf: 'start' }}>
													<AppButton
														variant="text"
														size="small"
														borderRadius="8px"
														startIcon={<AddIcon />}
														label="Add Slot Block"
														disabled={!canAdd}
														onClick={() => addSlot(session.key)}
														sx={{
															// a small card sized to its content: white with a soft shadow and no border
															px: 1.75,
															py: 0.5,
															border: 0,
															boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
															'&:hover': {
																bgcolor: '#fff',
																boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
															},
														}}
													/>
												</Box>
											</Tooltip>
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
									options={durationChoices.map((d) => ({ value: d, label: `${d} Minutes` }))}
									sx={{
										width: 120,
										'& .MuiSelect-select': { py: 0.4 },
									}}
								/>
							</Box>
						</Box>
					</>
				)}

				{clashCount > 0 && (
					<Typography variant="caption" role="alert" sx={{ color: 'error.main', fontWeight: 600 }}>
						{clashCount === 1 ? '1 time block clashes' : `${clashCount} time blocks clash`} with the hours
						at your other hospitals (days marked with a red dot). A doctor can only be at one clinic at a
						time: change them to save.
					</Typography>
				)}

				<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
					<AppButton
						variant="contained"
						onClick={handleSave}
						loading={isSaving}
						disabled={clashCount > 0}
						label="Save working hours"
					/>
				</Box>
			</Box>
		</Box>
	)
}
