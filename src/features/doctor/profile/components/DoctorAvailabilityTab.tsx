import { useState, useEffect, useCallback } from 'react'
import { Box, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import AppButton from '../../../../components/common/Button/AppButton'
import AppSelect from '../../../../components/common/Select/AppSelect'
import AppSkeleton from '../../../../components/common/Skeleton/AppSkeleton'
import AppSegmentedToggle, { type SegmentedToggleOption } from '../../../../components/common/Switch/AppSegmentedToggle'
import DateSlotPicker, { SlotGroup, TimeSlot } from '../../../../components/common/DateSlotPicker/DateSlotPicker'
import { DoctorHospital, DoctorAvailability, DoctorHospitalHours } from '../../../../types/doctor-profile'
import { BOOKING_WINDOW_DAYS } from '../../../../constants/constants'
import { customCardStyle } from '../../../../styles/commonStyles'
import {
	getDoctorAvailability,
	getDoctorHospitalHours,
	createSlotOverrideBatch,
	SlotOverridePayload,
	SlotOverrideBatchPayload,
} from '../../doctorService'
import WorkingHoursScheduler from './WorkingHoursScheduler'

interface DoctorAvailabilityTabProps {
	hospitals: DoctorHospital[]
	availability: DoctorAvailability
	onChange: (availability: DoctorAvailability) => void
}

type UnselectedSlotsByDate = Record<string, string[]>
type AvailabilityMode = 'clinic' | 'video'
type ApiAvailabilityMode = 'clinic_visit' | 'video_call'
type ApiAvailabilityBlock = {
	appointment_mode?: ApiAvailabilityMode
	sessions?: SlotGroup[]
}

const EMPTY_MODE_SLOTS: Record<AvailabilityMode, SlotGroup[]> = { clinic: [], video: [] }

type AvailabilityView = 'hours' | 'dates'

// The two views of this tab. 'hours' is where a doctor lands.
const AVAILABILITY_VIEWS: SegmentedToggleOption<AvailabilityView>[] = [
	{ value: 'hours', label: 'Working Hours' },
	{ value: 'dates', label: 'Select Follow Up Date' },
]

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

export default function DoctorAvailabilityTab({
	hospitals,
	availability,
	onChange,
}: DoctorAvailabilityTabProps) {
	const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
		hospitals.find((h) => h.isPrimary)?.id ?? hospitals[0]?.id ?? ''
	)
	const [selectedDate, setSelectedDate] = useState<Date>(new Date())
	const [availableSlotGroups, setAvailableSlotGroups] = useState<SlotGroup[]>([])
	const [slotsLoading, setSlotsLoading] = useState(false)
	const [unselectedSlotsByDate, setUnselectedSlotsByDate] = useState<UnselectedSlotsByDate>({})
	const [pendingOverrides, setPendingOverrides] = useState<SlotOverridePayload[]>([])
	const [saveLoading, setSaveLoading] = useState(false)
	const [pendingSaveToast, setPendingSaveToast] = useState<string | null>(null)
	const [selectedAppointmentType, setSelectedAppointmentType] = useState<'clinic' | 'video'>('clinic')
	const [toggleRefreshing, setToggleRefreshing] = useState(false)
	const [activeView, setActiveView] = useState<AvailabilityView>('hours')
	// First API of this tab: the doctor's hospitals with the weekly working hours of each (GET /api/doctors/hospitals)
	const [hospitalHours, setHospitalHours] = useState<DoctorHospitalHours[] | null>(null)
	const [hoursLoading, setHoursLoading] = useState(true)
	const [hoursFailed, setHoursFailed] = useState(false)

	const formatDateForApi = (date: Date) => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const getDayKey = (date: Date): keyof DoctorAvailability => {
		switch (date.getDay()) {
			case 0:
				return 'sunday'
			case 1:
				return 'monday'
			case 2:
				return 'tuesday'
			case 3:
				return 'wednesday'
			case 4:
				return 'thursday'
			case 5:
				return 'friday'
			default:
				return 'saturday'
		}
	}

	// const fetchAvailability = async () => {
	// 	if (!selectedHospitalId || !selectedDate) return

	// 	try {
	// 		setSlotsLoading(true)

	// 		const res = await getDoctorAvailability({
	// 			hospital_id: selectedHospitalId,
	// 			date: formatDateForApi(selectedDate),
	// 		})

	// 		const byMode = normalizeAvailabilityByMode(res)

	// 		setAvailableSlotGroups(byMode[selectedAppointmentType] ?? [])
	// 		setPendingOverrides([])
	// 		setUnselectedSlotsByDate({})
	// 	} catch (err) {
	// 		console.log(err)
	// 		setAvailableSlotGroups([])
	// 	} finally {
	// 		setSlotsLoading(false)
	// 	}
	// }

	const fetchAvailability = useCallback(async () => {
		if (!selectedHospitalId || !selectedDate) return

		try {
			setSlotsLoading(true)

			const res = await getDoctorAvailability({
				hospital_id: selectedHospitalId,
				date: formatDateForApi(selectedDate),
			})

			const byMode = normalizeAvailabilityByMode(res)

			setAvailableSlotGroups(byMode[selectedAppointmentType] ?? [])
			setPendingOverrides([])
			setUnselectedSlotsByDate({})
		} catch (err) {
			console.log(err)
			setAvailableSlotGroups([])
		} finally {
			setSlotsLoading(false)
		}
	}, [selectedHospitalId, selectedDate, selectedAppointmentType])

	useEffect(() => {
		fetchAvailability()
	}, [fetchAvailability])

	// useEffect(() => {
	// 	fetchAvailability()
	// }, [selectedHospitalId, selectedDate, selectedAppointmentType])

	const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId)

	// Loaded once for all hospitals: the hours of the OTHER hospitals are what a block is checked against for a clash.
	// The second API of this tab is the per-date slots (`fetchAvailability` above).
	const loadHours = useCallback(async (quiet = false) => {
		if (!quiet) setHoursLoading(true)
		setHoursFailed(false)
		try {
			setHospitalHours(await getDoctorHospitalHours())
		} catch (err) {
			// the shared API client already shows the server's reason; a failed quiet refresh keeps what is on screen
			console.error('Failed to load working hours:', err)
			if (!quiet) {
				setHospitalHours(null)
				setHoursFailed(true)
			}
		} finally {
			setHoursLoading(false)
		}
	}, [])

	useEffect(() => {
		void loadHours()
	}, [loadHours])

	const selectedHours = hospitalHours?.find((h) => h.hospitalId === selectedHospitalId)
	const otherHours = (hospitalHours ?? []).filter((h) => h.hospitalId !== selectedHospitalId)

	// The weekly hours were saved: the day's slots depend on them, and the other hospitals' clash checks use them.
	const handleWorkingHoursSaved = () => {
		void fetchAvailability()
		void loadHours(true)
	}

	const dayKey = getDayKey(selectedDate)
	const selectedDateKey = formatDateForApi(selectedDate)

	const allSelectableSlots = Array.from(
		new Set(
			availableSlotGroups.flatMap((group) =>
				(group.slots ?? [])
					.filter((slot: TimeSlot) => Boolean(slot.start_time) && slot.can_toggle !== false)
					.map((slot: TimeSlot) => slot.start_time)
			)
		)
	)

	const apiBlockedSlots = Array.from(
		new Set(
			availableSlotGroups.flatMap((group) =>
				(group.slots ?? [])
					.filter(
						(slot: TimeSlot) =>
							Boolean(slot.start_time) && slot.can_toggle !== false && slot.status === 'BLOCKED'
					)
					.map((slot: TimeSlot) => slot.start_time)
			)
		)
	)

	const todayUnselected: string[] = unselectedSlotsByDate[selectedDateKey] ?? apiBlockedSlots
	const selectedSlots: string[] = allSelectableSlots.filter((s) => !todayUnselected.includes(s))

	const slotGroupsForPicker: SlotGroup[] = availableSlotGroups.map((group) => ({
		...group,
		slots: group.slots.map((slot) => {
			if (slot.can_toggle === false) return slot
			if (todayUnselected.includes(slot.start_time)) {
				return { ...slot, status: 'BLOCKED', is_enabled: true }
			}
			if (slot.status === 'BLOCKED') {
				return { ...slot, status: 'AVAILABLE', is_enabled: true }
			}
			return slot
		}),
	}))

	const getSlotEndTime = (startTime: string): string => {
		for (const group of availableSlotGroups) {
			const match = group.slots.find((s) => s.start_time === startTime)
			if (match) return match.end_time
		}
		return startTime
	}

	const stageSlotSelection = (slots: string[]) => {
		const newlyBlocked = selectedSlots.filter((s) => !slots.includes(s))
		const newlyUnblocked = todayUnselected.filter((s) => slots.includes(s))

		const updatedUnselected = [...todayUnselected.filter((s) => !newlyUnblocked.includes(s)), ...newlyBlocked]

		const updated: UnselectedSlotsByDate = { ...unselectedSlotsByDate, [selectedDateKey]: updatedUnselected }
		setUnselectedSlotsByDate(updated)
		localStorage.setItem('doctorBlockedSlots', JSON.stringify(updated))
		onChange({ ...availability, [dayKey]: slots })

		const changedOverrides: SlotOverridePayload[] = [
			...newlyBlocked.map((s) => ({
				hospital_id: selectedHospitalId,
				date: formatDateForApi(selectedDate),
				start_time: s,
				end_time: getSlotEndTime(s),
				is_blocked: true,
			})),
			...newlyUnblocked.map((s) => ({
				hospital_id: selectedHospitalId,
				date: formatDateForApi(selectedDate),
				start_time: s,
				end_time: getSlotEndTime(s),
				is_blocked: false,
			})),
		]

		const initialBlockedSlots = new Set(apiBlockedSlots)
		setPendingOverrides((prev) => {
			const filtered = prev.filter(
				(p) =>
					!changedOverrides.some(
						(c) =>
							c.hospital_id === p.hospital_id &&
							c.date === p.date &&
							c.start_time === p.start_time &&
							c.end_time === p.end_time
					)
			)
			const effectiveOverrides = changedOverrides.filter(
				(override) => initialBlockedSlots.has(override.start_time) !== override.is_blocked
			)
			return [...filtered, ...effectiveOverrides]
		})
	}

	const handleTimeChange = (slots: string[]) => {
		setPendingSaveToast(null)
		stageSlotSelection(slots)
	}

	const handleSaveAvailability = async () => {
		console.log('pendingOverrides:', pendingOverrides)
		if (pendingOverrides.length === 0) {
			setPendingSaveToast(null)
			return
		}
		setSaveLoading(true)
		try {
			let backendMessage = ''
			const overridesByHospitalAndDate = pendingOverrides.reduce<Record<string, SlotOverrideBatchPayload>>(
				(acc, override) => {
					const groupKey = `${override.hospital_id ?? ''}__${override.date}`
					if (!acc[groupKey]) {
						acc[groupKey] = {
							hospital_id: override.hospital_id ?? null,
							date: override.date,
							slots: [],
							appointment_mode: selectedAppointmentType === 'clinic' ? 'clinic_visit' : 'video_call',
						}
					}
					acc[groupKey].slots.push({
						start_time: override.start_time,
						end_time: override.end_time,
						is_blocked: override.is_blocked,
					})
					return acc
				},
				{}
			)

			const batchPayloads = Object.values(overridesByHospitalAndDate)
			for (const payload of batchPayloads) {
				const response = await createSlotOverrideBatch(payload)
				console.log('API response:', response)
				if (response?.message) {
					backendMessage = response.message
				}
			}

			setPendingOverrides([])
			toast.success(backendMessage || pendingSaveToast || 'Saved successfully')
			await fetchAvailability()
			setPendingSaveToast(null)
		} catch (err) {
			console.error('Save availability error:', err)
		} finally {
			setSaveLoading(false)
		}
	}

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Availability
			</Typography>

			{/* Hospital dropdown */}
			{hospitals.length === 0 ? (
				<Typography variant="caption" sx={{ color: 'text.disabled' }}>
					No hospitals added. Please add a hospital first.
				</Typography>
			) : (
				<Box sx={{ mb: 3 }}>
					<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
						Choose Hospital
					</Typography>
					<AppSelect
						value={selectedHospitalId}
						onChange={(e) => setSelectedHospitalId(e.target.value as string)}
						options={hospitals.map((h) => ({ value: h.id, label: h.name }))}
						size="small"
						sx={{
							'& .MuiOutlinedInput-root': { borderRadius: '10px' },
						}}
					/>
				</Box>
			)}

			{/* Two views: the weekly working hours (landing view) and the follow-up date / slots. Both stay mounted and are
			    only hidden, so unsaved edits in one survive a switch to the other. */}
			{selectedHospital && (
				<>
					<Box sx={{ mb: 3, display: 'flex' }}>
						<AppSegmentedToggle
							value={activeView}
							onChange={setActiveView}
							options={AVAILABILITY_VIEWS}
							fullWidth={false}
							equalWidth
						/>
					</Box>

					{/* Weekly working hours of the chosen hospital */}
					<Box sx={{ display: activeView === 'hours' ? 'block' : 'none' }}>
						{hoursLoading ? (
							<AppSkeleton height={360} />
						) : selectedHours ? (
							<WorkingHoursScheduler
								key={selectedHours.hospitalId}
								hospital={selectedHours}
								others={otherHours}
								onSaved={handleWorkingHoursSaved}
							/>
						) : (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
								<Typography variant="body2" sx={{ color: 'text.secondary' }}>
									{hoursFailed ? 'The working hours could not be loaded.' : 'No working hours were found for this hospital.'}
								</Typography>
								<AppButton variant="outlined" size="small" label="Try again" onClick={() => void loadHours()} />
							</Box>
						)}
					</Box>

					{/* Follow-up date and per-date slots */}
					<Box sx={{ display: activeView === 'dates' ? 'block' : 'none' }}>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -4 }}>
							<AppButton
								label="Today"
								variant="outlined"
								size="small"
								onClick={() => setSelectedDate(new Date())}
								sx={{
									borderRadius: '10px',
									border: '1px solid #0c7c7c',
									color: '#0c7c7c',
									textTransform: 'none',
									fontWeight: 500,
									px: 1.5,
									py: 0.4,
									minWidth: 'auto',
									mt: 0.5,
									'&:hover': {
										borderColor: '#0c7c7c',
										backgroundColor: '#e0f2f1',
									},
								}}
							/>
						</Box>

						<DateSlotPicker
							multiSelect
							selectedDate={selectedDate}
							onDateChange={setSelectedDate}
							selectedTime={selectedSlots}
							onTimeChange={handleTimeChange}
							dateLabel="Select follow up date"
							rollingDays={BOOKING_WINDOW_DAYS}
							timeSlotColumns={5}
							disableBookedSlots={false}
							availableSlots={slotGroupsForPicker.length > 0 ? slotGroupsForPicker : undefined}
							slotsLoading={slotsLoading || toggleRefreshing}
							slotVariant="card"
							onSelectAll={() => {
								stageSlotSelection(allSelectableSlots)
								setPendingSaveToast('Selected All Successfully')
							}}
							onUnselectAll={() => {
								stageSlotSelection([])
								setPendingSaveToast('Unselected All Successfully')
							}}
							selectedAppointmentType={selectedAppointmentType}
							onAppointmentTypeChange={(type) => {
								setToggleRefreshing(true)
								setSelectedAppointmentType(type)
								setTimeout(() => setToggleRefreshing(false), 300)
							}}
						/>
						<Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
							<AppButton
								variant="outlined"
								fullWidth
								label="Cancel"
								onClick={() => {
									onChange({ ...availability, [dayKey]: [] })
									setPendingOverrides([])
									setPendingSaveToast(null)
								}}
							/>
							<AppButton
								variant="contained"
								fullWidth
								label="Save Availability"
								loading={saveLoading}
								onClick={handleSaveAvailability}
							/>
						</Box>
					</Box>
				</>
			)}
		</Box>
	)
}
