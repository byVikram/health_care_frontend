// src/components/common/DateSlotPicker/DateSlotPicker.tsx
import { formatINR } from '../../../utils/Utils'
import { useState } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AppSkeleton from '../Skeleton/AppSkeleton'
import PillToggle from '../PillToggle/PillToggle'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function to12hr(time24: string): string {
	const [hStr, mStr] = time24.split(':')
	const h = parseInt(hStr, 10)
	const m = mStr ?? '00'
	const suffix = h >= 12 ? 'PM' : 'AM'
	const h12 = h % 12 === 0 ? 12 : h % 12
	return `${h12}:${m} ${suffix}`
}

function getWeekDates(start: Date) {
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(start)
		d.setDate(start.getDate() + i)
		return d
	})
}

export type TimeSlot = {
	start_time: string
	end_time: string
	status: string
	is_enabled: boolean
	is_booked: boolean
	can_toggle: boolean
}

export type SlotGroup = {
	label: string
	range: string
	slots: TimeSlot[]
}

// -- Overloaded prop types based on multiSelect --------------------------------
type SingleProps = {
	multiSelect?: false
	selectedTime: string
	onTimeChange: (time: string) => void
}

type MultiProps = {
	multiSelect: true
	selectedTime: string[]
	onTimeChange: (times: string[]) => void
}

type CommonProps = {
	selectedDate: Date
	onDateChange: (date: Date) => void
	/** Several days can be picked (e.g. a repeat home-care visit): these are the picked days, highlighted together; a click calls `onDateToggle` instead of `onDateChange`. */
	selectedDates?: Date[]
	onDateToggle?: (date: Date) => void
	/** Hides the legend next to the "Select Time" label (when the slots are not booked / blocked ones). */
	hideLegend?: boolean
	dateLabel?: string
	timeLabel?: string
	disablePast?: boolean
	/** How many days ahead (today included) can be chosen; unset = no limit. Later days are disabled and the strip cannot move past them. */
	maxDaysAhead?: number
	/** The date to count "today" from (default: the browser's). A booking in another time zone passes that zone's date, so past days and the end of the window are right whatever the browser's zone is. */
	today?: Date
	/**
	 * Patient booking pages: the day strip starts at today and shows this many days from it (14 = two weeks), 7 to a row, every day
	 * selectable and no past days; arrows move between the 7-day pages. It replaces the Sunday-to-Saturday week strip and `maxDaysAhead`. The days stretch to
	 * fill the width, so it looks right in a narrow column (doctor details) and in a wide card (Lab, home care). Unset: the week strip.
	 */
	rollingDays?: number
	compactAppointmentToggle?: boolean
	timeSlotColumns?: number
	availableSlots?: SlotGroup[]
	loading?: boolean
	// Opt-in: shows AppSkeleton in place of the time slots ONLY (the date strip and the appointment-type toggle stay
	// visible), e.g. while the toggle switches between clinic and video. `loading` still replaces the whole picker.
	slotsLoading?: boolean
	disableBookedSlots?: boolean
	onSelectAll?: () => void
	onUnselectAll?: () => void
	selectedAppointmentType?: 'clinic' | 'video'
	onAppointmentTypeChange?: (type: 'clinic' | 'video') => void
	clinicPrice?: number
	videoPrice?: number
	// 'pill' (default) is the original filled-pill slot design used everywhere
	// (Doctor Details booking, Reschedule, etc). 'card' is the newer bordered
	// card design with a left accent bar - opt-in only, used by the Doctor's
	// Availability tab so other consumers of this shared component are unaffected.
	slotVariant?: 'pill' | 'card'
}

type DateSlotPickerProps = CommonProps & (SingleProps | MultiProps)

// -- Rolling day strip (patient booking pages) ---------------------------------
// The days from today, 7 to a page: one row as wide as the time grid under it (the edges line up), with arrows for the next 7 days.
// The cells have a fixed low height, so a wide card gets short wide chips, not big tiles. The days are real buttons (keyboard, screen
// readers) and the first one says "Today".
const ROLLING_PER_PAGE = 7

function RollingDayGrid({
	dates,
	isSelected,
	onPick,
}: {
	dates: Date[]
	isSelected: (date: Date) => boolean
	onPick: (date: Date) => void
}) {
	const pages = Math.ceil(dates.length / ROLLING_PER_PAGE)
	const picked = dates.findIndex(isSelected)
	// open on the page of the picked day (it can be in the second week), and follow it when it is changed from outside (a "Today" button)
	const [page, setPage] = useState(picked < 0 ? 0 : Math.floor(picked / ROLLING_PER_PAGE))
	const [seenPicked, setSeenPicked] = useState(picked)
	if (picked !== seenPicked) {
		setSeenPicked(picked)
		if (picked >= 0) setPage(Math.floor(picked / ROLLING_PER_PAGE))
	}
	const shown = dates.slice(page * ROLLING_PER_PAGE, (page + 1) * ROLLING_PER_PAGE)
	const first = shown[0]
	const last = shown[shown.length - 1]
	const sameYear = first.getFullYear() === last.getFullYear()
	// "Nov 2026" / "Nov \u2013 Dec 2026" / "Dec 2026 \u2013 Jan 2027"
	const range =
		first.getMonth() === last.getMonth() && sameYear
			? `${MONTHS[first.getMonth()]} ${first.getFullYear()}`
			: sameYear
				? `${MONTHS[first.getMonth()]} \u2013 ${MONTHS[last.getMonth()]} ${last.getFullYear()}`
				: `${MONTHS[first.getMonth()]} ${first.getFullYear()} \u2013 ${MONTHS[last.getMonth()]} ${last.getFullYear()}`

	return (
		<Box sx={{ mb: 2.25, containerType: 'inline-size' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, minHeight: 34 }}>
				<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '15px' }}>
					{range}
				</Typography>
				{pages > 1 && (
					<Box sx={{ display: 'flex', gap: 0.5 }}>
						<IconButton
							size="small"
							aria-label="Previous days"
							disabled={page === 0}
							onClick={() => setPage((p) => p - 1)}
							sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
						>
							<ChevronLeftIcon />
						</IconButton>
						<IconButton
							size="small"
							aria-label="Next days"
							disabled={page >= pages - 1}
							onClick={() => setPage((p) => p + 1)}
							sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
						>
							<ChevronRightIcon />
						</IconButton>
					</Box>
				)}
			</Box>
			<Box
				role="group"
				aria-label="Choose a day"
				sx={{
					display: 'grid',
					gridTemplateColumns: `repeat(${ROLLING_PER_PAGE}, minmax(0, 1fr))`,
					gap: { xs: 0.5, sm: 1 },
					// a wide card (the Lab / home-care cart) gets more air between the days; the narrow doctor column keeps the tight gap
					'@container (min-width: 600px)': { gap: 3.5 },
				}}
			>
				{shown.map((date, i) => {
					const isToday = page === 0 && i === 0
					const selected = isSelected(date)
					const isSat = date.getDay() === 6
					return (
						<Box
							key={date.toISOString()}
							component="button"
							type="button"
							aria-pressed={selected}
							aria-label={`${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}${isToday ? ', today' : ''}`}
							onClick={() => onPick(date)}
							sx={{
								minHeight: 52,
								p: 0,
								borderRadius: '10px',
								border: selected ? '1px solid #0c7c7c' : '1px solid #33333366',
								bgcolor: selected ? '#0c7c7c' : 'transparent',
								fontFamily: 'inherit',
								cursor: 'pointer',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '2px',
								transition: 'background 0.2s',
								'&:hover': { bgcolor: selected ? '#0c7c7c' : 'rgba(12,124,124,0.08)' },
								'&:focus-visible': { outline: '2px solid #0c7c7c', outlineOffset: 2 },
							}}
						>
							<Typography
								component="span"
								variant="caption"
								sx={{
									fontSize: '12px',
									fontWeight: 600,
									lineHeight: 1.2,
									color: selected ? 'rgba(255,255,255,0.85)' : 'text.secondary',
								}}
							>
								{isToday ? 'Today' : DAYS[date.getDay()]}
							</Typography>
							<Typography
								component="span"
								variant="body2"
								sx={{
									fontSize: '15px',
									fontWeight: 700,
									lineHeight: 1.2,
									color: selected ? '#fff' : isSat ? 'error.main' : 'text.primary',
								}}
							>
								{date.getDate()}
							</Typography>
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}

// -----------------------------------------------------------------------------
export default function DateSlotPicker(props: DateSlotPickerProps) {
	const {
		selectedDate,
		onDateChange,
		selectedDates,
		onDateToggle,
		hideLegend = false,
		dateLabel = 'Select Date',
		timeLabel = 'Select Time',
		disablePast = true,
		maxDaysAhead,
		rollingDays,
		compactAppointmentToggle = false,
		timeSlotColumns = 4,
		availableSlots,
		loading = false,
		slotsLoading = false,
		disableBookedSlots,
		onSelectAll,
		onUnselectAll,
		selectedAppointmentType,
		onAppointmentTypeChange,
		clinicPrice,
		videoPrice,
		slotVariant = 'pill',
	} = props

	const today = props.today ?? new Date()

	// Rolling mode: the days from today, in order (local midnights).
	const rollingDates = rollingDays
		? Array.from({ length: rollingDays }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i))
		: null

	const [weekStart, setWeekStart] = useState(() => {
		const anchor = selectedDates?.[0] ?? selectedDate
		const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())
		d.setDate(d.getDate() - d.getDay())
		return d
	})

	const weekDates = getWeekDates(weekStart)
	const monthLabel = `${MONTHS[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`

	const isSameDay = (a: Date, b: Date) =>
		a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

	const isPast = (d: Date) => {
		if (!disablePast) return false
		const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
		const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate())
		return d0 < today0
	}

	// The last day that can be chosen (local midnight), or null without a limit.
	const lastDay = maxDaysAhead
		? new Date(today.getFullYear(), today.getMonth(), today.getDate() + maxDaysAhead - 1)
		: null
	const isBeyondWindow = (d: Date) => {
		if (!lastDay) return false
		return new Date(d.getFullYear(), d.getMonth(), d.getDate()) > lastDay
	}
	// Moving on a week must still show a day that can be chosen.
	const nextWeekStart = new Date(weekStart)
	nextWeekStart.setDate(nextWeekStart.getDate() + 7)
	const nextWeekBlocked = isBeyondWindow(nextWeekStart)

	const isSlotSelected = (slot: string): boolean => {
		if (props.multiSelect) return (props.selectedTime as string[]).includes(slot)
		return props.selectedTime === slot
	}

	const handleSlotClick = (slot: string) => {
		if (props.multiSelect) {
			const current = props.selectedTime as string[]
			const updated = current.includes(slot) ? current.filter((s) => s !== slot) : [...current, slot]
			props.onTimeChange(updated)
		} else {
			props.onTimeChange(props.selectedTime === slot ? '' : slot)
		}
	}

	const slotsToRender = availableSlots ?? []
	const isDoctorView = !!(onSelectAll && onUnselectAll)
	const isCardSlotVariant = slotVariant === 'card'
	const useCompactAppointmentToggle = compactAppointmentToggle || isDoctorView
	const legendItems = [
		{ label: 'Available', color: 'success.main' },
		{ label: 'Blocked', color: 'error.main' },
		{ label: 'Booked', color: 'rgba(0,0,0,0.08)', border: '1.5px solid', borderColor: 'divider' },
	]

	const timeLegend = isDoctorView ? (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				{legendItems.map((item) => (
					<Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
						<Box
							sx={{
								width: 14,
								height: 14,
								borderRadius: '3px',
								bgcolor: item.color,
								border: item.border,
								borderColor: item.borderColor,
								flexShrink: 0,
							}}
						/>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
							{item.label}
						</Typography>
					</Box>
				))}
			</Box>
			<Box sx={{ display: 'flex', gap: 1 }}>
				<Box
					onClick={onSelectAll}
					sx={{
						cursor: 'pointer',
						fontSize: '12px',
						fontWeight: 500,
						color: 'primary.main',
						border: '1.5px solid',
						borderColor: 'primary.main',
						borderRadius: '8px',
						px: 1.5,
						py: 0.4,
						userSelect: 'none',
						'&:hover': { bgcolor: 'rgba(43,111,113,0.06)' },
					}}
				>
					Select All
				</Box>
				<Box
					onClick={onUnselectAll}
					sx={{
						cursor: 'pointer',
						fontSize: '12px',
						fontWeight: 500,
						color: 'text.secondary',
						border: '1.5px solid',
						borderColor: 'divider',
						borderRadius: '8px',
						px: 1.5,
						py: 0.4,
						userSelect: 'none',
						'&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
					}}
				>
					Unselect All
				</Box>
			</Box>
		</Box>
	) : (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
			<Box
				sx={{
					width: 14,
					height: 14,
					borderRadius: '3px',
					bgcolor: 'rgba(0,0,0,0.08)',
					border: '1.5px solid',
					borderColor: 'divider',
					flexShrink: 0,
				}}
			/>
			<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
				Booked
			</Typography>
		</Box>
	)

	return (
		<Box>
			{loading ? (
				<AppSkeleton height={360} />
			) : (
				<>
					{/* Date label - only shown when non-empty */}
					{dateLabel && (
						<Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '15.5px', color: 'text.primary' }}>
							{dateLabel}
						</Typography>
					)}

					{/* Rolling days (patient booking pages): from today, 7 a page with arrows, no past days */}
					{rollingDates && (
						<RollingDayGrid
							dates={rollingDates}
							isSelected={(date) =>
								selectedDates ? selectedDates.some((d) => isSameDay(d, date)) : isSameDay(date, selectedDate)
							}
							onPick={(date) => (onDateToggle ? onDateToggle(date) : onDateChange(date))}
						/>
					)}

					{/* Week calendar */}
					{!rollingDates && (
						<Box sx={{ mb: 2.25 }}>
							{/* Month nav */}
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									mb: 1,
								}}
							>
								<IconButton
									size="small"
									onClick={() => {
										const d = new Date(weekStart)
										d.setDate(d.getDate() - 7)
										setWeekStart(d)
									}}
									sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
								>
									<ChevronLeftIcon />
								</IconButton>

								<Typography
									variant="body2"
									sx={{
										fontWeight: 600,
										color: 'text.primary',
									}}
								>
									{monthLabel}
								</Typography>

								<IconButton
									size="small"
									disabled={nextWeekBlocked}
									onClick={() => {
										const d = new Date(weekStart)
										d.setDate(d.getDate() + 7)
										setWeekStart(d)
									}}
									sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
								>
									<ChevronRightIcon />
								</IconButton>
							</Box>

							{/* Day strip */}
							<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.5 }}>
								{weekDates.map((date) => {
									const isSelected = selectedDates ? selectedDates.some((d) => isSameDay(d, date)) : isSameDay(date, selectedDate)
									const past = isPast(date) || isBeyondWindow(date)
									const isSat = date.getDay() === 6
									return (
										<Box
											key={date.toISOString()}
											onClick={() => {
												if (past) return
												if (onDateToggle) onDateToggle(date)
												else onDateChange(date)
											}}
											sx={{
												flex: 1,
												textAlign: 'center',
												py: 0.6,
												minHeight: '56px',
												borderRadius: '10px',
												bgcolor: isSelected ? '#0c7c7c' : 'transparent',
												border: isSelected ? '' : '1px solid #33333366',
												cursor: 'pointer',
												maxWidth: '60px',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												justifyContent: 'center',
												transition: 'background 0.2s',
												'&:hover': { bgcolor: isSelected ? '#0c7c7c' : 'rgba(12,124,124,0.08)' },
											}}
										>
											<Typography
												variant="caption"
												sx={{
													fontSize: '12px',
													fontWeight: 600,
													color: isSelected
														? 'rgba(255,255,255,0.8)'
														: past
															? 'text.disabled'
															: 'text.secondary',
												}}
											>
												{DAYS[date.getDay()]}
											</Typography>

											<Typography
												variant="body2"
												sx={{
													fontWeight: 700,
													fontSize: '14px',
													color: isSelected
														? '#fff'
														: past
															? 'text.disabled'
															: isSat
																? 'error.main'
																: 'text.primary',
												}}
											>
												{date.getDate()}
											</Typography>
										</Box>
									)
								})}
							</Box>
						</Box>
					)}

					{/* Appointment type pill toggle */}
					{onAppointmentTypeChange && (
						<Box sx={{ mb: 2.25, mt: 0.5 }}>
							<Typography
								variant="body2"
								sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '15.5px' }}
							>
								Type of Appointment
							</Typography>
							<PillToggle
								value={selectedAppointmentType}
								options={[
									{ value: 'clinic', label: 'Clinic Visit', sub: clinicPrice !== undefined ? formatINR(clinicPrice) : undefined },
									{ value: 'video', label: 'Video Call', sub: videoPrice !== undefined ? formatINR(videoPrice) : undefined },
								]}
								onChange={onAppointmentTypeChange}
								ariaLabel="Type of appointment"
								compact={useCompactAppointmentToggle}
							/>
						</Box>
					)}

					{/* Time label + legend + slot grid */}
					<>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								mb: 1.25,
								flexWrap: 'wrap',
								gap: 1,
							}}
						>
							<Typography variant="h6" sx={{ fontWeight: 600, fontSize: '15.5px' }}>
								{timeLabel}
							</Typography>
							{hideLegend ? null : timeLegend}
						</Box>

						{slotsLoading ? (
							<Box sx={{ mb: 1.25 }}>
								<AppSkeleton width={90} height={16} sx={{ mb: 0.75 }} />
								<Box
									sx={{
										display: 'grid',
										gridTemplateColumns: `repeat(${timeSlotColumns}, 1fr)`,
										gap: 1,
									}}
								>
									{Array.from({ length: timeSlotColumns * 2 }, (_, n) => (
										<AppSkeleton key={n} height={44} />
									))}
								</Box>
							</Box>
						) : (
							<>
						{/* No slots message */}
						{availableSlots && availableSlots.length === 0 && (
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								No slots available for the selected day.
							</Typography>
						)}

						{/* Time slots grouped by period */}
						{slotsToRender.map((group, index) => (
							<Box key={`${group.label}-${index}`} sx={{ mb: 1.25 }}>
								<Typography
									variant="caption"
									sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}
								>
									{group.label}
								</Typography>

								<Box
									sx={{
										display: 'grid',
										gridTemplateColumns: `repeat(${timeSlotColumns}, 1fr)`,
										gap: 1,
									}}
								>
									{group.slots.map((slot) => {
										const isPatientView = disableBookedSlots

										// Patient view: hide BLOCKED slots and doctor-disabled slots entirely
										if (isPatientView && (slot.status === 'BLOCKED' || !slot.is_enabled))
											return null

										const isSelected = isSlotSelected(slot.start_time)
										const isBooked = slot.is_booked
										const isDisabled = !slot.is_enabled

										const accentColor =
											isCardSlotVariant && isBooked
												? 'transparent'
												: props.multiSelect
													? slot.status === 'BLOCKED'
														? 'error.main'
														: isSelected
															? 'success.main'
															: 'error.main'
													: isSelected
														? 'primary.main'
														: 'success.main'

										return (
											<Box
												key={slot.start_time}
												onClick={() => {
													if (isBooked || isDisabled) return
													handleSlotClick(slot.start_time)
												}}
												sx={{
													...(isCardSlotVariant && {
														position: 'relative',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														pl: '14px',
														pr: '8px',
														overflow: 'hidden',
														boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
														'&:before': {
															content: '""',
															position: 'absolute',
															left: 0,
															top: 0,
															bottom: 0,
															width: '4px',
															bgcolor: accentColor,
														},
													}),
													py: isCardSlotVariant ? 1.1 : 0.6,
													px: isCardSlotVariant ? undefined : 0.4,
													textAlign: 'center',
													bgcolor: isCardSlotVariant
														? isBooked
															? 'rgba(0,0,0,0.04)'
															: 'background.paper'
														: isBooked
															? 'rgba(0,0,0,0.08)'
															: props.multiSelect
																? slot.status === 'BLOCKED'
																	? 'error.main'
																	: isSelected
																		? 'success.main'
																		: 'error.main'
																: isSelected
																	? 'primary.main'
																	: 'background.paper',
													border: isCardSlotVariant ? '1px solid' : '1.5px solid',
													borderColor: isCardSlotVariant
														? 'divider'
														: isSelected
															? 'primary.main'
															: 'divider',
													borderRadius: isCardSlotVariant ? '10px' : '8px',
													cursor: isBooked
														? 'default'
														: isDisabled
															? 'not-allowed'
															: 'pointer',
													transition: 'all 0.15s',
													'&:hover': isBooked
														? {}
														: {
															borderColor: 'primary.main',
															bgcolor: isCardSlotVariant
																? undefined
																: isSelected
																	? 'primary.main'
																	: 'rgba(43,111,113,0.06)',
															boxShadow: isCardSlotVariant
																? '0 2px 6px rgba(0,0,0,0.1)'
																: undefined,
														},
												}}
											>
												<Typography
													variant="body1"
													sx={{
														fontWeight: isCardSlotVariant ? 600 : isSelected ? 600 : 400,
														color: isCardSlotVariant
															? isBooked
																? 'text.disabled'
																: '#0f2a4a'
															: props.multiSelect
																? '#fff'
																: isSelected
																	? '#fff'
																	: isBooked
																		? 'text.disabled'
																		: 'text.primary',
													}}
												>
													{to12hr(slot.start_time)}
												</Typography>
											</Box>
										)
									})}
								</Box>
							</Box>
						))}
							</>
						)}
					</>
				</>
			)}
		</Box>
	)
}
