import { Drawer, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AppButton from '../../../../components/common/Button/AppButton'
import DateSlotPicker, { SlotGroup } from '../../../../components/common/DateSlotPicker/DateSlotPicker'
import { Appointment } from '../../../../types/appointment'

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
}: Props) {
  return (
    <Drawer
      anchor="right"
      open={rescheduleOpen}
      onClose={() => setRescheduleOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          borderRadius: '16px 0 0 16px',
          p: 0,
          display: 'flex',
          flexDirection: 'column',
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
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.5 }}>
        <Box
          onClick={() => setRescheduleOpen(false)}
          sx={{
            flex: 1, py: 1.2, textAlign: 'center', borderRadius: '8px',
            border: '1.5px solid', borderColor: 'divider', cursor: 'pointer',
            fontSize: '14px', fontWeight: 500, color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          Cancel
        </Box>
        <Box sx={{ flex: 1 }}>
          <AppButton
            label="Confirm"
            fullWidth
            loading={rescheduleSubmitting}
            onClick={handleRescheduleConfirm}
          />
        </Box>
      </Box>
    </Drawer>
  )
}
