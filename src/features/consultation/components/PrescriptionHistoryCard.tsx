// src/features/consultation/components/PrescriptionHistoryCard.tsx
//
// One past prescription in the "Past medical history" list: a HistoryRecordCard (the doctor and hospital, the date, the doctor's notes)
// with a "View prescription" button. The image is not previewed in the list: the button opens it in a dialog
// (HistoryFileDialog). The prescription link is signed and expires after about 5 minutes, so the dialog asks the server for a fresh
// one at every opening (and again on "Try again"); a visit that only has an older stored file falls back to that file's link.

import { useCallback, useState } from 'react'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { getPrescriptionLink } from '../../../services/treatmentService'
import type { PastMedicalHistoryItem } from '../../patient/patientService'
import HistoryFileDialog from './HistoryFileDialog'
import HistoryRecordCard from './HistoryRecordCard'

type Props = {
	item: PastMedicalHistoryItem
	/** The item's date, already formatted ("5 Sep 2026"). */
	dateLabel: string
}

export default function PrescriptionHistoryCard({ item, dateLabel }: Props) {
	const [open, setOpen] = useState(false)
	const [url, setUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [failed, setFailed] = useState(false)

	// A fresh link from the server, else the link the list already holds (an older prescription that only has a stored file).
	const loadLink = useCallback(async () => {
		setLoading(true)
		setFailed(false)
		try {
			const fresh = item.appointmentId ? await getPrescriptionLink(item.appointmentId) : null
			setUrl(fresh ?? item.fileUrl)
			if (!fresh && !item.fileUrl) setFailed(true)
		} catch {
			setUrl(item.fileUrl)
			setFailed(!item.fileUrl)
		} finally {
			setLoading(false)
		}
	}, [item.appointmentId, item.fileUrl])

	const openViewer = () => {
		setUrl(null)
		setOpen(true)
		void loadLink()
	}

	const heading = item.doctorName || item.title || 'Prescription'

	return (
		<>
			<HistoryRecordCard
				title={heading}
				subtitle={item.hospitalName}
				dateLabel={dateLabel}
				notesLabel="Notes"
				notes={item.notes}
				actionLabel="View prescription"
				actionIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}
				onAction={openViewer}
				actionDisabled={!item.fileUrl && !item.appointmentId}
			/>
			<HistoryFileDialog
				open={open}
				onClose={() => setOpen(false)}
				title={`Prescription · ${heading}`}
				subtitle={dateLabel}
				url={url}
				loading={loading}
				failed={failed}
				what="the prescription"
				onRetry={() => void loadLink()}
				onImageError={() => setFailed(true)}
			/>
		</>
	)
}
