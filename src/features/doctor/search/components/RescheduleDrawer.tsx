import { Drawer, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AppButton from '../../../../components/common/Button/AppButton'
import AppSelect from '../../../../components/common/Select/AppSelect'
import DateSlotPicker, { SlotGroup } from '../../../../components/common/DateSlotPicker/DateSlotPicker'
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
}: Props) {
	return (
		<Drawer
			anchor="right"
			open={rescheduleOpen}
			onClose={() => setRescheduleOpen(false)}
			slotProps={{
				paper: {
					sx: {
						width: { xs: '100%', sm: 400 },
						borderRadius: '16px',
						m: 2,
						height: 'calc(100% - 32px)',
						p: 0,
						display: 'flex',
						flexDirection: 'column',
						boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
					},
				},
			}}
		>
			{/* Header */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					px: 3,
					py: 2,
					borderBottom: '1px solid',
					borderColor: 'divider',
				}}
			>
				<Box>
					<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary' }}>
						Reschedule Appointment
					</Typography>
					<Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.3 }}>
						{rescheduleAppt?.patient?.name ?? ''}
					</Typography>
				</Box>
				<IconButton size="small" onClick={() => setRescheduleOpen(false)} sx={{ color: 'text.secondary' }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</Box>

			{/* Body — scrollable */}
			<Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
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
			</Box>

			{/* Footer */}
			<Box
				sx={{
					px: 3,
					py: 2,
					borderTop: '1px solid',
					borderColor: 'divider',
					display: 'flex',
					gap: 1.5,
				}}
			>
				<AppButton
					label="Cancel"
					variant="outlined"
					fullWidth
					onClick={() => setRescheduleOpen(false)}
					sx={{
						borderRadius: '20px',
						color: 'text.secondary',
						borderColor: 'divider',
						'&:hover': {
							bgcolor: 'action.hover',
							borderColor: 'divider',
						},
					}}
				/>

				<AppButton
					label="Confirm"
					fullWidth
					loading={rescheduleSubmitting}
					onClick={handleRescheduleConfirm}
					sx={{ borderRadius: '20px' }}
				/>
			</Box>
		</Drawer>
	)
}
