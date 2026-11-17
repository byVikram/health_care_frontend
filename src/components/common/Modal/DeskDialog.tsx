// src/components/common/Modal/DeskDialog.tsx
//
// The confirmation window of the desktop designs: a rounded white card with a title, an optional second line and a close button, a
// body (text and / or the children), and Cancel / OK buttons at the bottom (OK red for a destructive choice).
import { Box, Dialog } from '@mui/material'
import type { ReactNode } from 'react'
import DeskIcon from '../Icon/DeskIcon'
import DeskButton from '../Button/DeskButton'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'

interface DeskDialogProps {
	open: boolean
	title: string
	sub?: string
	body?: string
	children?: ReactNode
	okLabel: string
	cancelLabel?: string
	/** A destructive choice: the OK button is red. */
	danger?: boolean
	busy?: boolean
	okDisabled?: boolean
	width?: number
	onClose: () => void
	onOk: () => void
}

export default function DeskDialog({
	open,
	title,
	sub,
	body,
	children,
	okLabel,
	cancelLabel = 'Cancel',
	danger = false,
	busy = false,
	okDisabled = false,
	width = 500,
	onClose,
	onOk,
}: DeskDialogProps) {
	return (
		<Dialog
			open={open}
			onClose={busy ? undefined : onClose}
			slotProps={{
				backdrop: { sx: { bgcolor: DESK.scrim } },
				paper: {
					sx: {
						width,
						maxWidth: 'calc(100vw - 32px)',
						m: 2,
						p: '24px',
						borderRadius: '20px',
						boxShadow: DESK.shadowDialog,
						display: 'flex',
						flexDirection: 'column',
						gap: '18px',
						color: DESK.ink,
					},
				},
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
				<Box sx={{ flexGrow: 1 }}>
					<Box component="h2" sx={{ m: 0, fontSize: 20, lineHeight: '26px', fontWeight: 800 }}>
						{title}
					</Box>
					{sub ? (
						<Box component="p" sx={{ m: '4px 0 0', fontSize: 14, lineHeight: '20px', color: DESK.muted }}>
							{sub}
						</Box>
					) : null}
				</Box>
				<Box
					component="button"
					type="button"
					onClick={onClose}
					disabled={busy}
					aria-label="Close"
					sx={{
						width: 34,
						height: 34,
						borderRadius: '9px',
						border: `1px solid ${DESK.lineStrong}`,
						bgcolor: DESK.raised,
						color: DESK.ink,
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
					}}
				>
					<DeskIcon d={DESK_ICONS.close} size={16} strokeWidth={2.2} />
				</Box>
			</Box>
			{body ? (
				<Box component="p" sx={{ m: 0, fontSize: 14, lineHeight: '21px', color: DESK.inkSoft }}>
					{body}
				</Box>
			) : null}
			{children}
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', pt: '4px' }}>
				<Box sx={{ minWidth: 120 }}>
					<DeskButton label={cancelLabel} kind="secondary" onClick={onClose} disabled={busy} />
				</Box>
				<Box sx={{ minWidth: 140 }}>
					<DeskButton
						label={okLabel}
						kind={danger ? 'danger' : 'primary'}
						onClick={onOk}
						loading={busy}
						disabled={okDisabled}
					/>
				</Box>
			</Box>
		</Dialog>
	)
}
