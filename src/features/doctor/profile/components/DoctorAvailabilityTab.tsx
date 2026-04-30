import { useState, useEffect, useCallback } from 'react'
import { Box, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import AppButton from '../../../../components/common/Button/AppButton'
import DateSlotPicker, { SlotGroup, TimeSlot } from '../../../../components/common/DateSlotPicker/DateSlotPicker'
import { DoctorHospital, DoctorAvailability } from '../../../../types/doctor-profile'
import { customCardStyle } from '../../../../styles/commonStyles'
import {
	getDoctorAvailability,
	createSlotOverrideBatch,
	SlotOverridePayload,
	SlotOverrideBatchPayload,
} from '../../../../features/doctor/doctorService'

interface DoctorAvailabilityTabProps {
	hospitals: DoctorHospital[]
	availability: DoctorAvailability
	onChange: (availability: DoctorAvailability) => void
}

type UnselectedSlotsByDate = Record<string, string[]>

export default function DoctorAvailabilityTab({ hospitals, availability, onChange }: DoctorAvailabilityTabProps) {
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

	const fetchAvailability = useCallback(async () => {
		if (!selectedHospitalId || !selectedDate) return
		try {
			setSlotsLoading(true)
			const res = await getDoctorAvailability({
				hospital_id: selectedHospitalId,
				date: formatDateForApi(selectedDate),
			})
			let processedData: SlotGroup[] = []
			if (Array.isArray(res)) {
				processedData = res as SlotGroup[]
			} else if (res && Array.isArray(res.data)) {
				processedData = res.data as SlotGroup[]
			}
			setAvailableSlotGroups(processedData)
			setPendingOverrides([])
		} catch (err) {
			console.log(err)
			setAvailableSlotGroups([])
		} finally {
			setSlotsLoading(false)
		}
	}, [selectedHospitalId, selectedDate])

	useEffect(() => {
		fetchAvailability()
	}, [fetchAvailability])

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
									<Typography
										variant="caption"
										sx={{
											fontWeight: 700,
											fontSize: '12px',
											color: isSelected ? '#fff' : 'primary.main',
										}}
									>
										{index + 1}
									</Typography>
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600, color: 'text.primary', fontSize: '13.5px' }}
									>
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
				
				timeSlotColumns={5}
				disableBookedSlots={false}
				availableSlots={slotGroupsForPicker.length > 0 ? slotGroupsForPicker : undefined}
			loading={slotsLoading || toggleRefreshing}
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
	)
}
