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
	dateLabel?: string
	timeLabel?: string
	hideNavigation?: boolean
	disablePast?: boolean
	/** How many days ahead (today included) can be chosen; unset = no limit. Later days are disabled and the strip cannot move past them. */
	maxDaysAhead?: number
	compactAppointmentToggle?: boolean
	timeSlotColumns?: number
	timeSlotVariant?: 'default' | 'availability'
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

// -----------------------------------------------------------------------------

export default function DateSlotPicker(props: DateSlotPickerProps) {
	const {
		selectedDate,
		onDateChange,
		dateLabel = 'Select Date',
		timeLabel = 'Select Time',
		hideNavigation = false,
		disablePast = true,
		maxDaysAhead,
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

	const today = new Date()

	const [weekStart, setWeekStart] = useState(() => {
		const d = new Date(today)
		d.setDate(today.getDate() - today.getDay())
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

					{/* Week calendar */}
					<Box sx={{ mb: 2.25 }}>
						{/* Month nav */}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: hideNavigation ? 'center' : 'space-between',
								mb: 1,
							}}
						>
							{!hideNavigation && (
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
							)}

							<Typography
								variant="body2"
								sx={{
									fontWeight: 600,
									color: 'text.primary',
									fontSize: hideNavigation ? '15px' : undefined,
								}}
							>
								{monthLabel}
							</Typography>

							{!hideNavigation && (
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
							)}
						</Box>

						{/* Day strip */}
						<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.5 }}>
							{weekDates.map((date) => {
								const isSelected = isSameDay(date, selectedDate)
								const past = isPast(date) || isBeyondWindow(date)
								const isSat = date.getDay() === 6
								return (
									<Box
										key={date.toISOString()}
										onClick={() => !past && onDateChange(date)}
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
							{timeLegend}
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
