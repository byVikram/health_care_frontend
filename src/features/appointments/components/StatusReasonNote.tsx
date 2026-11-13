// src/features/appointments/components/StatusReasonNote.tsx
//
// Why an appointment was cancelled or moved, in the words of the person who did it, shown to BOTH the patient and the doctor.
// The backend sends `status_reason` (what they wrote) and `status_reason_title` ("Cancelled by you", "Cancelled by the doctor",
// "Rescheduled by the patient"...), already worded for whoever is asking: this only draws them. Nothing is drawn without both.
import { Box, Typography } from '@mui/material'

interface Props {
	/** The appointment's CURRENT status (the raw value): 'cancelled' is drawn in red, anything else in amber. */
	status?: string | null
	/** `status_reason_title` from the API. */
	title?: string | null
	/** `status_reason` from the API. */
	reason?: string | null
	/** A line inside a table row or a small card, without the tinted box. */
	compact?: boolean
}

export default function StatusReasonNote({ status, title, reason, compact = false }: Props) {
	const text = reason?.trim()
	if (!text || !title) return null

	const cancelled = (status ?? '').toLowerCase() === 'cancelled'
	const color = cancelled ? '#b42318' : '#8a5300'

	return (
		<Box
			sx={
				compact
					? { mt: 0.5, maxWidth: 240 }
					: {
							mt: 1.5,
							px: 1.5,
							py: 1,
							borderRadius: '8px',
							bgcolor: cancelled ? '#fef3f2' : '#fff8e6',
							borderLeft: `3px solid ${color}`,
						}
			}
		>
			<Typography sx={{ fontSize: compact ? '11px' : '12px', fontWeight: 700, color, lineHeight: 1.3 }}>{title}</Typography>
			<Typography
				sx={{ fontSize: compact ? '11.5px' : '13px', color: 'text.secondary', lineHeight: 1.4, wordBreak: 'break-word' }}
			>
				{text}
			</Typography>
		</Box>
	)
}
