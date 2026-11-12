// src/features/consultation/components/HistoryRecordCard.tsx
//
// The card of one record in the consultation page's "Past medical history" (a prescription, a lab report, ...), in the look of the
// page's other cards (8px corners, the primary-coloured label with its text, as in Patient Details), kept as short as it can be:
//   - ONE line: the title with the clinic / lab after it, and the date at the right;
//   - under it the notes (or findings), with their teal label running into the text, two lines tall, and the button that opens
//     the file at the right of them.
// Every card is the SAME size whatever it holds: the two lines of notes are always reserved, a record with no notes says so, and a long
// text is cut after two lines. What kind of record it is is not written out or coloured, because the tab already says it. Nothing is
// previewed in the list. The callers (PrescriptionHistoryCard, LabHistoryCard) say what to show.

import type { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import AppButton from '../../../components/common/Button/AppButton'

// 13px / 1.45 for two lines of notes: their height is reserved so that cards never differ.
const NOTES_HEIGHT = '37.7px'

type Props = {
	title: string
	/** After the title, in grey: the clinic, the lab. */
	subtitle?: string | null
	/** Already formatted ("05 Sep 2026"). */
	dateLabel: string
	/** The teal label in front of the notes ("Notes", "Findings"). */
	notesLabel: string
	notes?: string | null
	/** What the notes line says when there are none. */
	emptyNotes?: string
	actionLabel: string
	/** The icon of the button; the "open" arrow when not given. */
	actionIcon?: ReactNode
	onAction: () => void
	actionDisabled?: boolean
}

export default function HistoryRecordCard({
	title,
	subtitle,
	dateLabel,
	notesLabel,
	notes,
	emptyNotes = 'No notes added',
	actionLabel,
	actionIcon,
	onAction,
	actionDisabled,
}: Props) {
	const hasNotes = !!notes?.trim()
	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '8px',
				px: 2.5,
				py: 2,
				display: 'flex',
				flexDirection: 'column',
				gap: 1.5,
				flexShrink: 0,
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
				<Typography
					sx={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.4, color: 'text.primary', minWidth: 0 }}
					noWrap
				>
					{title}
					{!!subtitle && (
						<Typography
							component="span"
							sx={{ fontSize: '12.5px', fontWeight: 400, color: 'text.secondary', ml: 1 }}
						>
							· {subtitle}
						</Typography>
					)}
				</Typography>
				<Box
					sx={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 0.5,
						color: 'text.secondary',
						flexShrink: 0,
					}}
				>
					<CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />
					<Typography sx={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.4 }}>{dateLabel}</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
				<Typography
					sx={{
						flex: 1,
						minWidth: 0,
						fontSize: '13px',
						lineHeight: 1.45,
						height: NOTES_HEIGHT,
						fontWeight: 500,
						color: hasNotes ? 'text.primary' : 'text.disabled',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}
				>
					<Typography
						component="span"
						sx={{ fontSize: '12px', fontWeight: 400, color: 'primary.main', mr: 0.75 }}
					>
						{notesLabel}:
					</Typography>
					{hasNotes ? notes : emptyNotes}
				</Typography>
				<AppButton
					variant="outlined"
					size="small"
					label={actionLabel}
					startIcon={actionIcon ?? <OpenInNewIcon sx={{ fontSize: 15 }} />}
					onClick={onAction}
					disabled={actionDisabled}
					sx={{ flexShrink: 0 }}
				/>
			</Box>
		</Box>
	)
}
