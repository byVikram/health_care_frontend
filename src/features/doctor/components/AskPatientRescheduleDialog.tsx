// src/features/doctor/components/AskPatientRescheduleDialog.tsx
//
// A doctor does not pick a new slot when rescheduling: they ask the PATIENT to choose one (as in the native app). This is the
// confirmation for that ("Ask the patient to reschedule?"): what will happen, an optional reason for the patient, Cancel / Confirm.
// The page makes the call and closes it.

import { useState } from 'react'
import { Box, Button, CircularProgress, Dialog, DialogContent, TextField, Typography } from '@mui/material'
import { RESCHEDULE_REASON_MAX_LENGTH } from '../../../services/appointmentService'

interface Props {
	open: boolean
	patientName: string
	/** "Today, 5:30 PM · In-clinic": the slot being given up. */
	slotLabel: string
	busy?: boolean
	onClose: () => void
	/** The reason is trimmed; '' when empty. */
	onConfirm: (reason: string) => void
}

function Body({ patientName, slotLabel, busy = false, onClose, onConfirm }: Omit<Props, 'open'>) {
	const [reason, setReason] = useState('')

	return (
		<DialogContent sx={{ px: 3, py: 3 }}>
			<Typography sx={{ fontWeight: 700, fontSize: '17px', color: 'text.primary', mb: 0.75 }}>
				Ask the patient to reschedule?
			</Typography>
			<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 2 }}>
				{patientName} ({slotLabel}) will be emailed and asked to choose a new time. You'll be asked to confirm
				the time they pick.
			</Typography>

			<Typography
				sx={{ fontSize: '12px', fontWeight: 700, color: 'text.secondary', letterSpacing: 0.4, mb: 0.75 }}
			>
				REASON FOR THE PATIENT (OPTIONAL)
			</Typography>
			<TextField
				value={reason}
				onChange={(e) => setReason(e.target.value.slice(0, RESCHEDULE_REASON_MAX_LENGTH))}
				placeholder="A short explanation, e.g. I'm unavailable at this time"
				multiline
				minRows={3}
				fullWidth
				disabled={busy}
				slotProps={{ htmlInput: { maxLength: RESCHEDULE_REASON_MAX_LENGTH } }}
			/>
			<Typography sx={{ fontSize: '11px', color: 'text.secondary', textAlign: 'right', mt: 0.5 }}>
				{reason.length}/{RESCHEDULE_REASON_MAX_LENGTH}
			</Typography>

			<Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
				<Button
					onClick={onClose}
					disabled={busy}
					variant="outlined"
					sx={{
						flex: 1,
						height: 46,
						borderRadius: '8px',
						textTransform: 'none',
						fontWeight: 700,
						color: 'text.primary',
						borderColor: '#E3EAEB',
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={() => onConfirm(reason.trim())}
					disabled={busy}
					variant="contained"
					disableElevation
					sx={{
						flex: 1.4,
						height: 46,
						borderRadius: '8px',
						textTransform: 'none',
						fontWeight: 700,
						bgcolor: '#0c7c7c',
						'&:hover': { bgcolor: '#096363' },
					}}
				>
					{busy ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Confirm'}
				</Button>
			</Box>
		</DialogContent>
	)
}

// The body is only mounted while the dialog is open, so every opening starts with an empty reason.
export default function AskPatientRescheduleDialog({ open, ...body }: Props) {
	return (
		<Dialog
			open={open}
			onClose={body.busy ? undefined : body.onClose}
			maxWidth="xs"
			fullWidth
			slotProps={{ paper: { sx: { borderRadius: '16px', boxShadow: '0px 16px 56px rgba(0,0,0,0.18)' } } }}
		>
			<Body {...body} />
		</Dialog>
	)
}
