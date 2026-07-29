// src/features/appointments/components/RejectAppointmentDialog.tsx
import { useEffect, useState } from 'react'
import {
	Dialog,
	DialogContent,
	Typography,
	Box,
	RadioGroup,
	FormControlLabel,
	Radio,
} from '@mui/material'

// Fixed set of reasons a doctor can choose from when rejecting an appointment.
// Kept here (rather than fetched from the backend) since this is a small,
// stable list defined by product requirements.
export const REJECTION_REASONS = [
	'Doctor is unavailable at the requested time.',
	'The requested appointment slot is no longer available.',
	'The appointment request is not suitable for this specialty.',
	'Required medical information is incomplete.',
] as const

export const PATIENT_REJECTION_REASONS = [
	'The rescheduled appointment time does not work for me.',
	'I am no longer available for this appointment.',
	'I no longer need this appointment.',
	'I want to choose a different doctor or hospital.',
] as const

interface RejectAppointmentDialogProps {
	open: boolean
	onCancel: () => void
	onConfirm: (reason: string) => void
	submitting?: boolean
	reasons?: readonly string[]
}

export default function RejectAppointmentDialog({
	open,
	onCancel,
	onConfirm,
	submitting = false,
	reasons = REJECTION_REASONS,
}: RejectAppointmentDialogProps) {
	const [selectedReason, setSelectedReason] = useState('')

	// Reset the selection whenever the dialog is (re)opened for a new appointment.
	useEffect(() => {
		if (open) setSelectedReason('')
	}, [open])

	const handleConfirmClick = () => {
		if (!selectedReason) return
		onConfirm(selectedReason)
	}

	return (
		<Dialog
			open={open}
			onClose={onCancel}
			maxWidth="xs"
			fullWidth
			slotProps={{
				paper: {
					sx: {
						borderRadius: '16px',
						boxShadow: '0px 16px 56px rgba(0,0,0,0.18)',
					},
				},
			}}
		>
			<DialogContent sx={{ px: 3, py: 3.5 }}>
				<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary', textAlign: 'center', mb: 0.5 }}>
					Are you sure?
				</Typography>
				<Typography sx={{ fontSize: '14px', color: 'text.primary', fontWeight: 600, textAlign: 'center', mb: 2.5 }}>
					You want to reject appointment
				</Typography>

				<Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
					Select a reason for rejection
				</Typography>
				<RadioGroup
					value={selectedReason}
					onChange={(e) => setSelectedReason(e.target.value)}
					sx={{ gap: 0.5, mb: 3 }}
				>
					{reasons.map((reason) => (
						<FormControlLabel
							key={reason}
							value={reason}
							control={<Radio size="small" sx={{ color: '#0c7c7c', '&.Mui-checked': { color: '#0c7c7c' } }} />}
							label={<Typography sx={{ fontSize: '13px', color: 'text.primary' }}>{reason}</Typography>}
							sx={{
								m: 0,
								px: 1,
								py: 0.6,
								borderRadius: '10px',
								bgcolor: selectedReason === reason ? 'rgba(12,124,124,0.06)' : 'transparent',
								alignItems: 'flex-start',
								'& .MuiRadio-root': { pt: 0.2 },
							}}
						/>
					))}
				</RadioGroup>

				<Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
					<Box
						onClick={submitting ? undefined : onCancel}
						sx={{
							flex: 1,
							py: 1.2,
							border: '2px solid #0c7c7c',
							borderRadius: '50px',
							color: '#0c7c7c',
							fontWeight: 600,
							fontSize: '13px',
							cursor: submitting ? 'default' : 'pointer',
							textAlign: 'center',
							transition: 'background 0.2s',
							'&:hover': { bgcolor: submitting ? 'transparent' : 'rgba(12,124,124,0.06)' },
						}}
					>
						Cancel
					</Box>
					<Box
						onClick={submitting || !selectedReason ? undefined : handleConfirmClick}
						sx={{
							flex: 1,
							py: 1.2,
							bgcolor: '#e53935',
							borderRadius: '50px',
							color: '#fff',
							fontWeight: 600,
							fontSize: '13px',
							cursor: !selectedReason || submitting ? 'not-allowed' : 'pointer',
							opacity: !selectedReason || submitting ? 0.5 : 1,
							textAlign: 'center',
							transition: 'opacity 0.2s',
							'&:hover': { opacity: !selectedReason || submitting ? 0.5 : 0.88 },
						}}
					>
						Yes, Reject
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	)
}
