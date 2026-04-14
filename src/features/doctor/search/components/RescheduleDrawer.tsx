import { Drawer, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import AppButton from '../../../../components/common/Button/AppButton'
import DateSlotPicker, { SlotGroup } from '../../../../components/common/DateSlotPicker/DateSlotPicker'
import { Appointment } from '../../../../types/appointment'
import { DoctorDetailHospital } from '../../../../types/doctor-detail'

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

	rescheduleHospitals: DoctorDetailHospital[]
	rescheduleHospitalId: string
	setRescheduleHospitalId: (val: string) => void
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
}: Props) {
	return (
		<Drawer
			anchor="right"
			open={rescheduleOpen}
			onClose={() => setRescheduleOpen(false)}
			PaperProps={{
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
			}}
		>
			{/* Header */}
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
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
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						{rescheduleHospitals.map((h, i) => {
							const isSelected = rescheduleHospitalId === h.hospital.id
							return (
								<Box
									key={h.id}
									onClick={() => setRescheduleHospitalId(h.hospital.id)}
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 1.5,
										p: 1.5,
										borderRadius: '8px',
										border: '1px solid',
										borderColor: isSelected ? 'primary.main' : 'divider',
										bgcolor: isSelected ? 'rgba(79, 209, 197, 0.05)' : 'background.paper',
										cursor: 'pointer',
									}}
								>
									<Box
										sx={{
											width: 26,
											height: 26,
											bgcolor: isSelected ? '#3d7b7b' : '#0c7c7c',
											color: '#fff',
											borderRadius: '50% 50% 50% 0',
											transform: 'rotate(-45deg)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0,
										}}
									>
										<Typography sx={{ transform: 'rotate(45deg)', fontSize: '12px', fontWeight: 600 }}>
											{i + 1}
										</Typography>
									</Box>
									<Box sx={{ flex: 1 }}>
										<Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary' }}>
											{h.hospital.name}
										</Typography>
										<Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.2 }}>
											{h.hospital.address}
										</Typography>
									</Box>
									{isSelected ? (
										<RadioButtonCheckedIcon sx={{ color: '#3d7b7b', fontSize: 20 }} />
									) : (
										<RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
									)}
								</Box>
							)
						})}
					</Box>
				</Box>

				<DateSlotPicker
					selectedDate={rescheduleDate}
					onDateChange={(date) => {
						setRescheduleDate(date)
						setRescheduleTime('')
					}}
					selectedTime={rescheduleTime}
					onTimeChange={setRescheduleTime}
					availableSlots={rescheduleSlots.length > 0 ? rescheduleSlots : undefined}
					loading={rescheduleSlotsLoading}
					disableBookedSlots={true}
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
