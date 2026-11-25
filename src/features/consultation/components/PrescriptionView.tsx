// src/features/consultation/components/PrescriptionView.tsx
//
// Read-only counterpart to ConsultationNotes.tsx. Doctors capture the
// prescription/consultation notes for an appointment using the editable
// canvas + notes editor in ConsultationNotes.tsx; this component displays
// that same finalized record to the patient. It intentionally mirrors the
// doctor+clinic header and card layout of ConsultationNotes.tsx so the
// patient sees a consistent "prescription" look, but has no editing
// affordances (no toolbar, no canvas, no voice/text input).
import { useRef, useState } from 'react'
import { Box, Typography, Divider, Skeleton } from '@mui/material'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'

import { ConsultationDoctor } from '../../../types/consultation'
import { Treatment, getPrescriptionLink } from '../../../services/treatmentService'
import { buildS3Url } from '../../../utils/s3'
import { customScrollbar } from '../../../styles/commonStyles'

interface PrescriptionViewProps {
	doctor: ConsultationDoctor
	treatment: Treatment | null
	loading: boolean
	/** The appointment's public id: used to ask for a fresh link when the prescription image's signed link has expired. */
	appointmentId?: string
}

function formatFollowUpDate(dateStr: string): string {
	const date = new Date(dateStr)
	if (isNaN(date.getTime())) return dateStr
	return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function PrescriptionSkeleton() {
	return (
		<Box sx={{ p: 2.5 }}>
			<Skeleton variant="text" width="50%" height={22} />
			<Skeleton variant="text" width="35%" height={16} sx={{ mt: 0.5 }} />
			<Skeleton variant="rounded" height={120} sx={{ mt: 2 }} />
		</Box>
	)
}

// The doctor / clinic strip that used to head this card is gone: the prescription page already carries both.
export default function PrescriptionView({ treatment, loading, appointmentId }: PrescriptionViewProps) {
	const prescriptionUrl = treatment?.prescription_s3_key ? buildS3Url(treatment.prescription_s3_key) : ''
	// The page the doctor submitted (the notes drawn onto a prescription image): a signed link that lives about 5 minutes. When the
	// image cannot be fetched (the link expired) a fresh one is asked for, once, the way the mobile app does.
	const savedImage = treatment?.notes_image_url ?? null
	const [fresh, setFresh] = useState<{ from: string; url: string } | null>(null)
	const retriedFor = useRef<string | null>(null)
	const imageUrl = savedImage ? (fresh?.from === savedImage ? fresh.url : savedImage) : null
	const refreshImage = async () => {
		if (!savedImage || !appointmentId || retriedFor.current === savedImage) return
		retriedFor.current = savedImage
		try {
			const url = await getPrescriptionLink(appointmentId)
			if (url) setFresh({ from: savedImage, url })
		} catch {
			// the image stays broken; the notes text below (when there is any) is still shown
		}
	}
	// The typed notes are shown only when they are not already on the prescription page.
	const hasNotes = !!treatment?.notes?.trim() && !imageUrl

	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '16px',
				overflow: 'hidden',
				display: 'flex',
				flexGrow: 1,
				minHeight: 0,
				flexDirection: 'column',
			}}
		>
			{loading ? (
				<PrescriptionSkeleton />
			) : (
				<Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', ...customScrollbar, display: 'flex', flexDirection: 'column' }}>
					{/* Notes body — read-only display of what the doctor recorded */}
					<Box sx={{ p: imageUrl ? 0 : 2.5, flex: 1 }}>
						{imageUrl ? (
							<Box
								component="a"
								href={imageUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Open the prescription in a new tab"
								sx={{ display: 'block' }}
							>
								<Box
									component="img"
									src={imageUrl}
									alt="Prescription and consultation notes written by your doctor"
									onError={() => void refreshImage()}
									sx={{ display: 'block', width: '100%', height: 'auto' }}
								/>
							</Box>
						) : hasNotes ? (
							<Typography
								sx={{
									fontSize: '14px',
									lineHeight: 1.7,
									color: 'text.primary',
									whiteSpace: 'pre-wrap',
								}}
							>
								{treatment!.notes}
							</Typography>
						) : (
							<Typography sx={{ fontSize: '13px', color: 'text.secondary', fontStyle: 'italic' }}>
								No prescription or consultation notes have been added for this appointment yet.
							</Typography>
						)}
					</Box>

					{/* Follow-up date, if the doctor set one */}
					{treatment?.follow_up_date && (
						<>
							<Divider />
							<Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
								<EventAvailableIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
								<Typography sx={{ fontSize: '12.5px', color: 'text.secondary' }}>
									Follow-up recommended on{' '}
									<Typography component="span" sx={{ fontWeight: 600, color: 'text.primary', fontSize: 'inherit' }}>
										{formatFollowUpDate(treatment.follow_up_date)}
									</Typography>
								</Typography>
							</Box>
						</>
					)}

					{/* Prescription attachment, if the doctor uploaded/scanned one */}
					{prescriptionUrl && (
						<>
							<Divider />
							<Box
								sx={{
									px: 2.5,
									py: 1.5,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 1.5,
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
									<DescriptionOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
									<Typography
										sx={{
											fontSize: '12.5px',
											color: 'text.primary',
											fontWeight: 500,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										Prescription attachment
									</Typography>
								</Box>
								<Typography
									component="a"
									href={prescriptionUrl}
									target="_blank"
									rel="noopener noreferrer"
									sx={{
										flexShrink: 0,
										display: 'inline-flex',
										alignItems: 'center',
										gap: 0.4,
										fontSize: '12.5px',
										fontWeight: 600,
										color: 'primary.main',
										textDecoration: 'none',
										'&:hover': { textDecoration: 'underline' },
									}}
								>
									<OpenInNewIcon sx={{ fontSize: 14 }} />
									View file
								</Typography>
							</Box>
						</>
					)}
				</Box>
			)}
		</Box>
	)
}