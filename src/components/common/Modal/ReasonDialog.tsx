// src/components/common/Modal/ReasonDialog.tsx
//
// "Cancel this booking?" / "Decline this request?": a DeskDialog with a reason to pick from a list and, optionally, a note. The page
// makes the call; the dialog only collects the choice. The reason list is the page's (a patient's reasons are not a doctor's).
import { Box, MenuItem, Select } from '@mui/material'
import { useState, type ChangeEvent } from 'react'
import DeskDialog from './DeskDialog'
import { DESK } from '../../../styles/deskTokens'

interface ReasonDialogProps {
	open: boolean
	title: string
	sub?: string
	body?: string
	reasons: readonly string[]
	/** The label above the list. */
	reasonLabel?: string
	/** A short line under the list ("The patient sees this and is shown other doctors."). */
	help?: string
	/** Shows a free-text box under the list with this label. */
	noteLabel?: string
	notePlaceholder?: string
	okLabel: string
	cancelLabel?: string
	danger?: boolean
	busy?: boolean
	onClose: () => void
	/** `reason` is the chosen text; `note` is what was typed in the note box (empty when none). */
	onConfirm: (reason: string, note: string) => void
}

const labelSx = { fontSize: 13, fontWeight: 600, color: DESK.inkSoft }

export default function ReasonDialog({
	open,
	title,
	sub,
	body,
	reasons,
	reasonLabel = 'Reason',
	help,
	noteLabel,
	notePlaceholder,
	okLabel,
	cancelLabel,
	danger = false,
	busy = false,
	onClose,
	onConfirm,
}: ReasonDialogProps) {
	const [reason, setReason] = useState('')
	const [note, setNote] = useState('')

	const close = () => {
		setReason('')
		setNote('')
		onClose()
	}

	return (
		<DeskDialog
			open={open}
			title={title}
			sub={sub}
			body={body}
			okLabel={okLabel}
			cancelLabel={cancelLabel}
			danger={danger}
			busy={busy}
			okDisabled={!reason}
			onClose={close}
			onOk={() => onConfirm(reason, note.trim())}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
				<Box component="span" sx={labelSx}>
					{reasonLabel}
					<Box component="span" sx={{ color: DESK.danger }}>
						{' *'}
					</Box>
				</Box>
				<Select
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					displayEmpty
					fullWidth
					disabled={busy}
					inputProps={{ 'aria-label': reasonLabel }}
					sx={{
						height: 44,
						borderRadius: '10px',
						fontSize: 15,
						'& .MuiOutlinedInput-notchedOutline': { borderColor: DESK.line },
					}}
					renderValue={(value) =>
						value ? String(value) : <Box component="span" sx={{ color: DESK.faint }}>Pick a reason</Box>
					}
				>
					{reasons.map((option) => (
						<MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
							{option}
						</MenuItem>
					))}
				</Select>
				{help ? (
					<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
						{help}
					</Box>
				) : null}
			</Box>
			{noteLabel ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
					<Box component="span" sx={labelSx}>
						{noteLabel}
					</Box>
					<Box
						component="textarea"
						rows={3}
						value={note}
						onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
						placeholder={notePlaceholder}
						aria-label={noteLabel}
						disabled={busy}
						sx={{
							boxSizing: 'border-box',
							width: '100%',
							p: '10px 12px',
							borderRadius: '10px',
							border: `1px solid ${DESK.line}`,
							fontFamily: 'inherit',
							fontSize: 15,
							lineHeight: '22px',
							color: DESK.ink,
							resize: 'vertical',
						}}
					/>
				</Box>
			) : null}
		</DeskDialog>
	)
}
