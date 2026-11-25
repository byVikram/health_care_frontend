// src/features/admin/components/AdminRescheduleDrawer.tsx
import AppInput from '../../../components/common/Input/AppInput'
import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import DateSlotPicker, { SlotGroup } from '../../../components/common/DateSlotPicker/DateSlotPicker'
import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { Appointment } from '../../../types/appointment'
import { LookupHospital } from '../../../hooks/useAuth'

type Props = {
	rescheduleOpen: boolean
	setRescheduleOpen: (val: boolean) => void
	rescheduleAppt: Appointment | null

	rescheduleDate: Date
	setRescheduleDate: (date: Date) => void

	rescheduleTime: string
	setRescheduleTime: (time: string) => void

	rescheduleSlots: SlotGroup[]
	rescheduleSlotsLoading: boolean

	rescheduleSubmitting: boolean
	handleRescheduleConfirm: () => void

	rescheduleHospitals: LookupHospital[]
	rescheduleHospitalId: string
	setRescheduleHospitalId: (val: string) => void

	appointmentType: 'clinic' | 'video'
	setAppointmentType: (type: 'clinic' | 'video') => void

	/** Optional override for the drawer paper's sx */
	sx?: SxProps<Theme>
}

export default function AdminRescheduleDrawer({
	rescheduleOpen,
	setRescheduleOpen,
	rescheduleAppt,
	rescheduleDate,
	setRescheduleDate,
	rescheduleTime,
	setRescheduleTime,
	rescheduleSlots,
	rescheduleSlotsLoading,
	rescheduleSubmitting,
	handleRescheduleConfirm,
	rescheduleHospitals,
	rescheduleHospitalId,
	appointmentType,
	setAppointmentType,
	sx,
}: Props) {
	const hospitalName =
		rescheduleAppt?.hospital?.name ||
		rescheduleHospitals.find((h) => h.id === rescheduleHospitalId)?.label ||
		'Hospital'

	return (
		<AppDrawer
			open={rescheduleOpen}
			onClose={() => setRescheduleOpen(false)}
			title="Reschedule Appointment"
			subtitle={rescheduleAppt?.patient?.name ? `Patient: ${rescheduleAppt.patient.name}` : undefined}
			onConfirm={handleRescheduleConfirm}
			confirmLoading={rescheduleSubmitting}
			sx={{
				top: '64px',
				height: 'calc(100vh - 64px)',
				'@supports (height: 100dvh)': { height: 'calc(100dvh - 64px)' },
				m: 0,
				borderRadius: '16px 0 0 16px',
				...sx,
			}}
		>
			<Box sx={{ mb: 3 }}>
				<Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 1, color: 'text.primary' }}>
					Hospital
				</Typography>
				<AppInput
					value={hospitalName}
					disabled
					size="small"
					fullWidth
					sx={{
						'& .MuiOutlinedInput-root': {
							borderRadius: '10px',
						},
						'& .Mui-disabled': {
							WebkitTextFillColor: 'text.primary',
							fontWeight: 600,
						},
					}}
				/>
			</Box>

			<DateSlotPicker
				selectedDate={rescheduleDate}
				onDateChange={(date) => {
					setRescheduleDate(date)
					setRescheduleTime('')
				}}
				selectedTime={rescheduleTime}
				onTimeChange={setRescheduleTime}
				availableSlots={rescheduleSlots}
				loading={rescheduleSlotsLoading}
				disableBookedSlots={true}
				selectedAppointmentType={appointmentType}
				onAppointmentTypeChange={setAppointmentType}
			/>
		</AppDrawer>
	)
}
