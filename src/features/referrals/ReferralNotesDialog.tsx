// src/features/referrals/ReferralNotesDialog.tsx
import { useState } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Box,
	Typography,
	Avatar,
	TextField,
	IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AppButton from '../../components/common/Button/AppButton'
import { createReferral } from '../../services/referralService'
import { toast } from 'react-toastify'

const MAX_NOTES_LENGTH = 500

interface SelectedDoctor {
	id: string
	name: string
	avatar_s3_key: string | null
	specialities: string[]
}

interface Props {
	open: boolean
	onClose: () => void
	/** The appointment being referred (public_id from the API) */
	appointmentId: string
	/** The doctor selected from the favourites list */
	doctor: SelectedDoctor | null
	/** Called after successful referral creation */
	onSuccess: () => void
}

/**
 * Step 2 of the referral flow.
 * Opened after Doctor 1 selects a favourite doctor.
 * Allows entering optional notes before submitting the referral.
 */
export default function ReferralNotesDialog({
	open,
	onClose,
	appointmentId,
	doctor,
	onSuccess,
}: Props) {
	const [notes, setNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)

	const handleClose = () => {
		if (submitting) return
		setNotes('')
		onClose()
	}

	const handleSubmit = async () => {
		if (!doctor || !appointmentId) return
		setSubmitting(true)
		try {
			await createReferral({
				appointment_id: appointmentId,
				referred_doctor_id: doctor.id,
				notes: notes.trim() || undefined,
			})
			toast.success(`Patient successfully referred to ${doctor.name}`)
			setNotes('')
			onSuccess()
		} catch {
			// Global toast from ApiService interceptor handles the error message.
		} finally {
			setSubmitting(false)
		}
	}

	if (!doctor) return null

	const specialty = doctor.specialities?.[0] ?? 'General Physician'

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="xs"
			fullWidth
			slotProps={{
				paper: {
					sx: {
						borderRadius: '20px',
						boxShadow: '0px 16px 56px rgba(0,0,0,0.18)',
						overflow: 'hidden',
					},
				},
			}}
		>
			<DialogTitle
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					px: 3,
					pt: 2.5,
					pb: 1,
				}}
			>
				<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '17px' }}>
					Refer Patient
				</Typography>
				<IconButton size="small" onClick={handleClose} disabled={submitting} sx={{ color: 'text.secondary' }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
				{/* Selected doctor preview */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						p: 1.5,
						borderRadius: '12px',
						bgcolor: '#f0f9f9',
						border: '1px solid rgba(12,124,124,0.2)',
						mb: 2,
					}}
				>
					<Avatar
						src={doctor.avatar_s3_key ?? undefined}
						alt={doctor.name}
						sx={{
							width: 44,
							height: 44,
							bgcolor: 'primary.main',
							fontSize: 16,
							fontWeight: 700,
							flexShrink: 0,
						}}
					>
						{doctor.name.charAt(0)}
					</Avatar>
					<Box>
						<Typography fontSize={14} fontWeight={700} color="text.primary">
							{doctor.name}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{specialty}
						</Typography>
					</Box>
				</Box>

				{/* Notes field */}
				<Typography fontSize={13} fontWeight={600} color="text.primary" mb={0.8}>
					Referral Notes{' '}
					<Typography component="span" variant="caption" color="text.secondary">
						(optional)
					</Typography>
				</Typography>
				<TextField
					multiline
					rows={4}
					fullWidth
					placeholder="Add any clinical notes, reason for referral, or special instructions..."
					value={notes}
					onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES_LENGTH))}
					disabled={submitting}
					size="small"
					sx={{
						'& .MuiOutlinedInput-root': {
							borderRadius: '12px',
							fontSize: 13,
							bgcolor: 'background.default',
							'& fieldset': { borderColor: 'divider' },
							'&:hover fieldset': { borderColor: 'primary.main' },
							'&.Mui-focused fieldset': { borderColor: 'primary.main' },
						},
					}}
				/>
				<Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
					{notes.length}/{MAX_NOTES_LENGTH}
				</Typography>
			</DialogContent>

			<DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
				<AppButton
					label="Cancel"
					variant="outlined"
					onClick={handleClose}
					disabled={submitting}
					sx={{
						flex: 1,
						borderRadius: '12px',
						border: '1.5px solid #0c7c7c',
						color: '#0c7c7c',
						fontWeight: 600,
						'&:hover': { bgcolor: 'rgba(12,124,124,0.06)', border: '1.5px solid #0c7c7c' },
					}}
				/>
				<AppButton
					label="Refer"
					loading={submitting}
					onClick={handleSubmit}
					disabled={!appointmentId || !doctor}
					sx={{
						flex: 1,
						borderRadius: '12px',
						bgcolor: '#0c7c7c',
						color: '#fff',
						fontWeight: 700,
						'&:hover': { bgcolor: '#0a6b6b' },
					}}
				/>
			</DialogActions>
		</Dialog>
	)
}
