// src/features/consultation/components/LabHistoryCard.tsx
//
// One past lab report in the "Past medical history" list: a HistoryRecordCard (the date, the summary of the findings) with a
// "View report" button that opens the report (a PDF in a frame, or a photo) in a dialog (HistoryFileDialog), instead of a frame per
// report in the list.

import { useState } from 'react'
import type { PastMedicalHistoryItem } from '../../patient/patientService'
import HistoryFileDialog from './HistoryFileDialog'
import HistoryRecordCard from './HistoryRecordCard'

type Props = {
	item: PastMedicalHistoryItem
	/** The item's date, already formatted ("5 Sep 2026"). */
	dateLabel: string
}

/** A report is a PDF unless its link says it is a photo. */
const isImage = (url: string | null): boolean => !!url && /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(url)

export default function LabHistoryCard({ item, dateLabel }: Props) {
	const [open, setOpen] = useState(false)
	const title = item.title || 'Lab report'

	return (
		<>
			<HistoryRecordCard
				title={title}
				dateLabel={dateLabel}
				notesLabel="Findings"
				notes={item.notes}
				emptyNotes="No findings added"
				actionLabel="View report"
				onAction={() => setOpen(true)}
				actionDisabled={!item.fileUrl}
			/>
			<HistoryFileDialog
				open={open}
				onClose={() => setOpen(false)}
				title={title}
				subtitle={dateLabel}
				url={item.fileUrl}
				kind={isImage(item.fileUrl) ? 'image' : 'pdf'}
				what="the report"
			/>
		</>
	)
}
