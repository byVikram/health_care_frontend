import { useState, useEffect, useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import AppButton from '../../../../components/common/Button/AppButton'
import DateSlotPicker, { SlotGroup, TimeSlot } from '../../../../components/common/DateSlotPicker/DateSlotPicker'
import { DoctorHospital, DoctorAvailability } from '../../../../types/doctor-profile'
import { customCardStyle } from '../../../../styles/commonStyles'
import { getDoctorAvailability, createSlotOverride, SlotOverridePayload } from '../../../../features/doctor/doctorService'

interface DoctorAvailabilityTabProps {
	hospitals: DoctorHospital[]
	availability: DoctorAvailability
	onChange: (availability: DoctorAvailability) => void
}

const DAY_KEYS: (keyof DoctorAvailability)[] = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
]

type UnselectedSlotsJson = Record<string, string[]>

export default function DoctorAvailabilityTab({ hospitals, availability, onChange }: DoctorAvailabilityTabProps) {
	const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
		hospitals.find((h) => h.isPrimary)?.id ?? hospitals[0]?.id ?? ''
	)
	const [selectedDate, setSelectedDate] = useState<Date>(new Date())
	const [availableSlotGroups, setAvailableSlotGroups] = useState<SlotGroup[]>([])
	const [slotsLoading, setSlotsLoading] = useState(false)
	const [unselectedSlots, setUnselectedSlots] = useState<UnselectedSlotsJson>({})
	const [pendingOverrides, setPendingOverrides] = useState<SlotOverridePayload[]>([])
	const [saveLoading, setSaveLoading] = useState(false)
	const [pendingSaveToast, setPendingSaveToast] = useState<string | null>(null)

	const formatDateForApi = (date: Date) => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	useEffect(() => {
		if (!selectedHospitalId || !selectedDate) return
		let active = true

		const fetchAvailability = async () => {
			try {
				setSlotsLoading(true)
				const res = await getDoctorAvailability({
					hospital_id: selectedHospitalId,
					date: formatDateForApi(selectedDate),
				})
				if (!active) return
				let processedData: SlotGroup[] = []
				if (Array.isArray(res)) {
					processedData = res as SlotGroup[]
				} else if (res && Array.isArray(res.data)) {
					processedData = res.data as SlotGroup[]
				}
				setAvailableSlotGroups(processedData)
			} catch (err) {
				console.log(err)
				if (!active) return
				setAvailableSlotGroups([])
			} finally {
				if (active) setSlotsLoading(false)
			}
		}

		fetchAvailability()
		return () => { active = false }
	}, [selectedHospitalId, selectedDate])

	const dayKey = DAY_KEYS[selectedDate.getDay()]

	const allSelectableSlots = useMemo(() => {
		const slotTimes = availableSlotGroups.flatMap((group) =>
			(group.slots ?? [])
				.filter((slot: TimeSlot) => Boolean(slot.start_time) && slot.can_toggle !== false)
				.map((slot: TimeSlot) => slot.start_time)
		)
		return Array.from(new Set(slotTimes))
	}, [availableSlotGroups])

	const apiBlockedSlots = useMemo(() => {
		const slotTimes = availableSlotGroups.flatMap((group) =>
			(group.slots ?? [])
				.filter(
					(slot: TimeSlot) =>
						Boolean(slot.start_time) && slot.can_toggle !== false && slot.status === 'BLOCKED'
				)
				.map((slot: TimeSlot) => slot.start_time)
		)
		return Array.from(new Set(slotTimes))
	}, [availableSlotGroups])

	const todayUnselected: string[] = unselectedSlots[dayKey] ?? apiBlockedSlots
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

	// Only updates local UI state — no API call here
	const stageSlotSelection = (slots: string[]) => {
		const newlyBlocked = selectedSlots.filter((s) => !slots.includes(s))
		const newlyUnblocked = todayUnselected.filter((s) => slots.includes(s))

		const updatedUnselected = [
			...todayUnselected.filter((s) => !newlyUnblocked.includes(s)),
			...newlyBlocked,
		]

		const updated: UnselectedSlotsJson = { ...unselectedSlots, [dayKey]: updatedUnselected }
		setUnselectedSlots(updated)
		localStorage.setItem('doctorBlockedSlots', JSON.stringify(updated))
		onChange({ ...availability, [dayKey]: slots })

		// Stage the changed slots as pending overrides (sent to API only on Save)
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

		// Merge into pending: if the same slot was toggled multiple times, keep only the latest
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

	// Loops through all pending overrides and calls createSlotOverride for each,
	// then shows a single toast once all are done
	const handleSaveAvailability = async () => {
		console.log("pendingOverrides:", pendingOverrides)
		if (pendingOverrides.length === 0) {
			//  toast.success(pendingSaveToast ?? 'Saved Successfully')
			setPendingSaveToast(null)
			return
		}
		setSaveLoading(true)
		try {
			let backendMessage =''
			for (const override of pendingOverrides) {
				const response = await createSlotOverride(override)

				console.log("API response:", response)

				if(response?.message){
					backendMessage = response.message 
				}
			}
			setPendingOverrides([])
			toast.success(backendMessage || pendingSaveToast || 'Saved successfully')
			setPendingSaveToast(null)
		} catch (err) {
			console.error('Save availability error:', err)
			// toast.error('Failed to save availability. Please try again.')
		} finally {
			setSaveLoading(false)
		}
	}

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Availability
			</Typography>

			{/* Choose Hospital */}
			<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1.5, fontSize: '13px' }}>
				Choose Hospital
			</Typography>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
				{hospitals.length === 0 ? (
					<Typography variant="caption" sx={{ color: 'text.disabled' }}>
						No hospitals added. Please add a hospital first.
					</Typography>
				) : (
					hospitals.map((hospital, index) => {
						const isSelected = selectedHospitalId === hospital.id
						return (
							<Box
								key={hospital.id}
								onClick={() => setSelectedHospitalId(hospital.id)}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 2,
									border: '1px solid',
									borderRadius: '12px',
									px: 2,
									py: 1.5,
									cursor: 'pointer',
									borderColor: isSelected ? 'primary.main' : 'divider',
									bgcolor: isSelected ? 'rgba(43,111,113,0.04)' : 'background.paper',
									transition: 'all 0.15s',
									'&:hover': { borderColor: 'primary.main' },
								}}
							>
								<Box
									sx={{
										width: 28,
										height: 28,
										borderRadius: '50%',
										flexShrink: 0,
										bgcolor: isSelected ? 'primary.main' : 'rgba(43,111,113,0.1)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Typography variant="caption" sx={{ fontWeight: 700, fontSize: '12px', color: isSelected ? '#fff' : 'primary.main' }}>
										{index + 1}
									</Typography>
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '13.5px' }}>
										{hospital.name}
									</Typography>
									<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11.5px' }}>
										{hospital.fullAddress}
									</Typography>
								</Box>
								{isSelected ? (
									<RadioButtonCheckedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
								) : (
									<RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: 22 }} />
								)}
							</Box>
						)
					})
				)}
			</Box>

			{/* Date + time picker */}
			<DateSlotPicker
				multiSelect
				selectedDate={selectedDate}
				onDateChange={setSelectedDate}
				selectedTime={selectedSlots}
				onTimeChange={handleTimeChange}
				dateLabel="Select follow up date"
				timeLabel="Select Follow up time"
				timeSlotColumns={5}
				disableBookedSlots={false}
				availableSlots={slotGroupsForPicker.length > 0 ? slotGroupsForPicker : undefined}
				loading={slotsLoading}
				onSelectAll={() => {
					stageSlotSelection(allSelectableSlots)
					setPendingSaveToast('Selected All Successfully')
				}}
				onUnselectAll={() => {
					stageSlotSelection([])
					setPendingSaveToast('Unselected All Successfully')
				}}
			/>

			{/* Buttons */}
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
	)
}
