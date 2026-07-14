// src/features/consultation/components/PrescriptionView.tsx
//
// Read-only counterpart to ConsultationNotes.tsx. Doctors capture the
// prescription/consultation notes for an appointment using the editable
// canvas + notes editor in ConsultationNotes.tsx; this component displays
// that same finalized record to the patient. It intentionally mirrors the
// doctor+clinic header and card layout of ConsultationNotes.tsx so the
// patient sees a consistent "prescription" look, but has no editing
// affordances (no toolbar, no canvas, no voice/text input).
import { Box, Typography, Divider, Skeleton } from '@mui/material'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'

import { ConsultationDoctor } from '../../../types/consultation'
import { Treatment } from '../../../services/treatmentService'
import { buildS3Url } from '../../../utils/s3'

interface PrescriptionViewProps {
	doctor: ConsultationDoctor
	treatment: Treatment | null
	loading: boolean
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

export default function PrescriptionView({ doctor, treatment, loading }: PrescriptionViewProps) {
	const prescriptionUrl = treatment?.prescription_s3_key ? buildS3Url(treatment.prescription_s3_key) : ''
	const hasNotes = !!treatment?.notes?.trim()

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
				flexDirection: 'column',
			}}
		>
			{/* Doctor + Clinic header — mirrors ConsultationNotes.tsx */}
			<Box
				sx={{
					px: 2.5,
					py: 2,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
					background: '#DBE2E3',
				}}
			>
				<Box>
					<Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '14px' }}>
						{doctor.name}
						{doctor.degree ? `, ${doctor.degree}` : ''}
					</Typography>
					<Typography variant="body1" sx={{ color: 'primary.main', fontSize: '11px' }}>
						{doctor.specialization}
					</Typography>
				</Box>
				<Box sx={{ textAlign: 'right' }}>
					<Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '14px' }}>
						{doctor.clinicName}
					</Typography>
					<Typography variant="body1" sx={{ color: 'primary.main', fontSize: '11px' }}>
						{doctor.clinicAddress}
					</Typography>
				</Box>
			</Box>

			<Divider />

			{loading ? (
				<PrescriptionSkeleton />
			) : (
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
					{/* Notes body — read-only display of what the doctor recorded */}
					<Box sx={{ p: 2.5, flex: 1 }}>
						{hasNotes ? (
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