import AppSelect from '../../../../components/common/Select/AppSelect'
import AppDrawer from '../../../../components/common/Drawer/AppDrawer'
import DateSlotPicker, { SlotGroup } from '../../../../components/common/DateSlotPicker/DateSlotPicker'
import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { Appointment } from '../../../../types/appointment'
import { LookupHospital } from '../../../../hooks/useAuth'

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

	/** Optional override for the drawer paper's sx (e.g. positioning it below a fixed navbar) */
	sx?: SxProps<Theme>
}

export default function RescheduleDrawer({
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
	setRescheduleHospitalId,
	appointmentType,
	setAppointmentType,
	sx,
}: Props) {
	return (
		<AppDrawer
			open={rescheduleOpen}
			onClose={() => setRescheduleOpen(false)}
			title="Reschedule Appointment"
			subtitle={rescheduleAppt?.patient?.name ?? ''}
			onConfirm={handleRescheduleConfirm}
			confirmLoading={rescheduleSubmitting}
			sx={sx}
		>
			<Box sx={{ mb: 3 }}>
				<Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 1, color: 'text.primary' }}>
					Choose Hospital
				</Typography>
				<AppSelect
					value={rescheduleHospitalId}
					onChange={(e) => setRescheduleHospitalId(e.target.value as string)}
					options={rescheduleHospitals.map((h) => ({
						value: h.id,
						label: h.label,
					}))}
					size="small"
					sx={{
						'& .MuiOutlinedInput-root': {
							borderRadius: '10px',
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
				// availableSlots={rescheduleSlots.length > 0 ? rescheduleSlots : undefined}
				availableSlots={rescheduleSlots}
				loading={rescheduleSlotsLoading}
				disableBookedSlots={true}
				selectedAppointmentType={appointmentType}
				onAppointmentTypeChange={setAppointmentType}
			/>
		</AppDrawer>
	)
}
