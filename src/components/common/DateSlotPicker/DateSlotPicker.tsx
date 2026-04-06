// src/components/common/DateSlotPicker/DateSlotPicker.tsx
import { useState } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AppSkeleton from '../Skeleton/AppSkeleton'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
	disablePast?: boolean
	timeSlotColumns?: number
	availableSlots?: SlotGroup[]
	loading?: boolean
	disableBookedSlots?: boolean
	onSelectAll?: () => void
	onUnselectAll?: () => void
}

type DateSlotPickerProps = CommonProps & (SingleProps | MultiProps)

// -----------------------------------------------------------------------------

export default function DateSlotPicker(props: DateSlotPickerProps) {
	const {
		selectedDate,
		onDateChange,
		dateLabel = 'Select Date',
		timeLabel = 'Select Time',
		disablePast = true,
		timeSlotColumns = 4,
		availableSlots,
		loading = false,
		disableBookedSlots,
		onSelectAll,
		onUnselectAll,
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

	const isPast = (d: Date) => { if (!disablePast) return false; const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()); const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return d0 < today0 }

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

	return (
		<Box>
			{loading ? (
				<AppSkeleton height={360} />
			) : (
				<>
					{/* Date label */}
					<Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
						{dateLabel}
					</Typography>

					{/* Week calendar */}
					<Box sx={{ p: 2, mb: 3 }}>
						{/* Month nav */}
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
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
							<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
								{monthLabel}
							</Typography>
							<IconButton
								size="small"
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
								const isSelected = isSameDay(date, selectedDate)
								const past = isPast(date)
								const isSat = date.getDay() === 6
								return (
									<Box
										key={date.toISOString()}
										onClick={() => !past && onDateChange(date)}
										sx={{
											flex: 1,
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: 0.5,
											py: 1,
											px: 0.5,
											borderRadius: '10px',
											cursor: past ? 'not-allowed' : 'pointer',
											bgcolor: isSelected ? 'primary.main' : 'transparent',
											transition: 'all 0.15s',
											'&:hover': !past
												? { bgcolor: isSelected ? 'primary.main' : 'rgba(43,111,113,0.08)' }
												: {},
										}}
									>
										<Typography
											variant="caption"
											sx={{
												fontSize: '11px',
												fontWeight: 500,
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
												fontSize: '15px',
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

					{/* Time label */}
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
						<Typography variant="h5" sx={{ fontWeight: 600 }}>
							{timeLabel}
						</Typography>
						{onSelectAll && onUnselectAll ? (
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
						)}
					</Box>

					{/* No slots message */}
					{availableSlots && availableSlots.length === 0 && (
						<Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
							No slots available for the selected day.
						</Typography>
					)}

					{/* Time slots grouped by period */}
					{slotsToRender.map((group) => (
						<Box key={group.label} sx={{ mb: 2 }}>
							{/* Section header */}
							<Typography
								variant="caption"
								sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}
							>
								{group.label} · {group.range}
							</Typography>

							{/* Time slots grid */}
							<Box
								sx={{ display: 'grid', gridTemplateColumns: `repeat(${timeSlotColumns}, 1fr)`, gap: 1 }}
							>
								{group.slots.map((slot) => {
									const isPatientView = disableBookedSlots


										// Patient view: hide BLOCKED slots and doctor-disabled slots entirely
										if (isPatientView && (slot.status === 'BLOCKED' || !slot.is_enabled)) return null

									const isSelected = isSlotSelected(slot.start_time)
									// Patient view: grey out OCCUPIED slots; doctor view: no change
									// const isBooked = isPatientView && slot.is_booked
									const isBooked = slot.is_booked
									const isDisabled = !slot.is_enabled

									return (
										<Box
											key={slot.start_time}
											onClick={() => {
												if (isBooked || isDisabled) return
												handleSlotClick(slot.start_time)
											}}
											sx={{
												py: 0.6,
												px: 0.4,
												textAlign: 'center',
												border: '1.5px solid',
												borderColor: isSelected ? 'primary.main' : 'divider',
												borderRadius: '8px',
												// OCCUPIED (isBooked): default cursor — slot is silent, not forbidden
												// BLOCKED (isDisabled, doctor only): not-allowed
												// AVAILABLE: pointer
												cursor: isBooked ? 'default' : isDisabled ? 'not-allowed' : 'pointer',
												// bgcolor: props.multiSelect
												// 	? slot.status === 'BLOCKED'
												// 		? 'error.main' // red for blocked
												// 		: 'success.main' // green for all others (doctor page)
												// 	: isBooked
												// 		? 'rgba(0,0,0,0.08)'
												// 		: isSelected
												// 			? 'primary.main'
												// 			: 'background.paper',
												bgcolor: isBooked
													? 'rgba(0,0,0,0.08)'
													: props.multiSelect
														? slot.status === 'BLOCKED'
															? 'error.main' // red for blocked
														: isSelected
															? 'success.main' // green = selected by doctor
															: 'error.main' // red = blocked/unselected by doctor
														: isSelected
															? 'primary.main'
															: 'background.paper',
												transition: 'all 0.15s',
												'&:hover': isBooked
													? {} // no hover effect on occupied slots
													: {
															borderColor: 'primary.main',
															bgcolor: isSelected
																? 'primary.main'
																: 'rgba(43,111,113,0.06)',
														},
											}}
										>
											<Typography
												variant="body1"
												sx={{
													// fontSize: '12px',
													fontWeight: isSelected ? 600 : 400,
													color: props.multiSelect
											? '#fff'
														: isSelected
															? '#fff'
															: isBooked
																? 'text.disabled'
																: 'text.primary',
												}}
											>
												{slot.start_time}
											</Typography>
										</Box>
									)
								})}
							</Box>
						</Box>
					))}
				</>
			)}
		</Box>
	)
}
