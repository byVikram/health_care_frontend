// src/features/doctor/profile/components/DoctorAvailabilityTab.tsx
import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import AppButton from '../../../../components/common/Button/AppButton'
import DateSlotPicker from '../../../../components/common/DateSlotPicker/DateSlotPicker'
import { DoctorHospital, DoctorAvailability } from '../../../../types/doctor-profile'
import { customCardStyle } from '../../../../styles/commonStyles'

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

export default function DoctorAvailabilityTab({ hospitals, availability, onChange }: DoctorAvailabilityTabProps) {
	const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
		hospitals.find((h) => h.isPrimary)?.id ?? hospitals[0]?.id ?? ''
	)
	const [selectedDate, setSelectedDate] = useState<Date>(new Date())

	const dayKey = DAY_KEYS[selectedDate.getDay()]
	const selectedSlots: string[] = availability[dayKey] ?? []

	return (
		<Box
			sx={{
				...customCardStyle,
			}}
		>
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

			{/* Shared date + time picker — multi-select mode, red selected slots for doctor */}
			<DateSlotPicker
				multiSelect
				selectedDate={selectedDate}
				onDateChange={setSelectedDate}
				selectedTime={selectedSlots}
				onTimeChange={(slots) => onChange({ ...availability, [dayKey]: slots })}
				dateLabel="Select follow up date"
				timeLabel="Select Follow up time"
				timeSlotColumns={5}
				disableBookedSlots={false}
			/>

			{/* Buttons */}
			<Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
				<AppButton
					variant="outlined"
					fullWidth
					label="Cancel"
					onClick={() => onChange({ ...availability, [dayKey]: [] })}
				/>
				<AppButton
					variant="contained"
					fullWidth
					label="Save Availability"
					onClick={() => console.log('Saved availability', availability)}
				/>
			</Box>
		</Box>
	)
}
