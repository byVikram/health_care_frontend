// src/features/doctor/components/AppointmentActionDialog.tsx
//
// The confirmation that follows a choice in the appointment's "More" menu (AppointmentActionMenu), after the native app's sheet:
//   cancel     a reason, a "patient is notified" note, Keep it / Cancel visit
//   no_show    the patient no-show policy and Keep it / Mark as no-show. The control stays visible but disabled outside the window
//              (from 60 minutes after the start until 2 days after it), with a short hint under it.
// The dialog only collects the choice; the page makes the calls.

import { useState } from 'react'
import { Box, Button, ButtonBase, CircularProgress, Dialog, DialogContent, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import type { ReactNode } from 'react'
import { CANCEL_REASONS } from '../appointmentRules'

export type ActionMode = 'cancel' | 'no_show'

const SAND = '#8A5300'
const SAND_TILE = '#FBEFD5'
const DANGER = '#B42318'
const DANGER_TILE = '#FDECEA'
const DANGER_INK = '#8A1C12'
const PRIMARY = '#0c7c7c'
const MINT = '#e8f5f4'
const RULE = '#E3EAEB'

interface Props {
	open: boolean
	mode: ActionMode
	patientName: string
	/** "Today, 5:30 PM · In-clinic" */
	slotLabel: string
	/** The no-show window is open. */
	noShowCanMark: boolean
	/** Why it is not open ("Can be marked 1 hour after the start"); shown under the disabled control. */
	noShowHint: string
	busy?: boolean
	onClose: () => void
	onConfirmCancel: (reason: string) => void
	onConfirmNoShow: () => void
}

function Note({ bg, ink, children }: { bg: string; ink: string; children: ReactNode }) {
	return (
		<Box sx={{ display: 'flex', gap: 1, p: 1.25, borderRadius: '8px', bgcolor: bg }}>
			<ErrorOutlineIcon sx={{ fontSize: 16, color: ink, mt: '1px' }} />
			<Typography sx={{ flex: 1, fontSize: '12px', lineHeight: '17px', color: ink }}>{children}</Typography>
		</Box>
	)
}

function Body({
	mode,
	patientName,
	slotLabel,
	noShowCanMark,
	noShowHint,
	busy = false,
	onClose,
	onConfirmCancel,
	onConfirmNoShow,
}: Omit<Props, 'open'>) {
	const [reason, setReason] = useState('')

	const keepButton = (
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
				borderColor: RULE,
			}}
		>
			Keep it
		</Button>
	)

	return (
		<DialogContent sx={{ px: 3, pt: 2.5, pb: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography sx={{ fontSize: '17px', fontWeight: 700, color: 'text.primary' }}>
						{mode === 'cancel' ? 'Cancel appointment' : 'Mark as no-show'}
					</Typography>
					<Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
						{patientName} · {slotLabel}
					</Typography>
				</Box>
				<IconButton
					size="small"
					onClick={onClose}
					disabled={busy}
					aria-label="Close"
					sx={{ mt: '-2px', mr: '-8px' }}
				>
					<CloseIcon sx={{ fontSize: 20 }} />
				</IconButton>
			</Box>

			{mode === 'no_show' && (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
					<Note bg={SAND_TILE} ink={SAND}>
						{patientName} is emailed and can reply once with a reason. Missed appointments the patient
						cannot explain count towards pausing their online booking.
					</Note>
					{!noShowCanMark && !!noShowHint && (
						<Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.secondary' }}>
							{noShowHint}
						</Typography>
					)}
					<Box sx={{ display: 'flex', gap: 1 }}>
						{keepButton}
						<Button
							onClick={onConfirmNoShow}
							disabled={!noShowCanMark || busy}
							variant="contained"
							disableElevation
							sx={{
								flex: 1.4,
								height: 46,
								borderRadius: '8px',
								textTransform: 'none',
								fontWeight: 700,
								bgcolor: SAND,
								'&:hover': { bgcolor: '#6f4200' },
								'&.Mui-disabled': { bgcolor: '#D8C49A', color: '#fff' },
							}}
						>
							{busy ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Mark as no-show'}
						</Button>
					</Box>
				</Box>
			)}

			{mode === 'cancel' && (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
					<Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.primary' }}>Reason</Typography>
					<Box role="radiogroup" sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
						{CANCEL_REASONS.map((r) => {
							const on = r === reason
							return (
								<ButtonBase
									key={r}
									role="radio"
									aria-checked={on}
									onClick={() => setReason(r)}
									sx={{
										minHeight: 46,
										px: 1.5,
										py: 1,
										gap: 1.25,
										justifyContent: 'flex-start',
										textAlign: 'left',
										borderRadius: '8px',
										border: `1px solid ${on ? PRIMARY : RULE}`,
										bgcolor: on ? MINT : '#fff',
									}}
								>
									<Box
										sx={{
											width: 18,
											height: 18,
											borderRadius: '50%',
											border: `2px solid ${on ? PRIMARY : '#7A8B8E'}`,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0,
										}}
									>
										<Box
											sx={{
												width: 8,
												height: 8,
												borderRadius: '50%',
												bgcolor: on ? PRIMARY : 'transparent',
											}}
										/>
									</Box>
									<Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary' }}>
										{r}
									</Typography>
								</ButtonBase>
							)
						})}
					</Box>
					<Note bg={DANGER_TILE} ink={DANGER_INK}>
						{patientName} is notified right away.
					</Note>
					<Box sx={{ display: 'flex', gap: 1 }}>
						{keepButton}
						<Button
							onClick={() => onConfirmCancel(reason)}
							disabled={!reason || busy}
							variant="contained"
							disableElevation
							sx={{
								flex: 1.4,
								height: 46,
								borderRadius: '8px',
								textTransform: 'none',
								fontWeight: 700,
								bgcolor: DANGER,
								'&:hover': { bgcolor: '#8f1c12' },
								'&.Mui-disabled': { bgcolor: '#D9A39C', color: '#fff' },
							}}
						>
							{busy ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Cancel visit'}
						</Button>
					</Box>
				</Box>
			)}
		</DialogContent>
	)
}

// The body is only mounted while the dialog is open, so every opening starts with nothing chosen.
export default function AppointmentActionDialog({ open, ...body }: Props) {
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
