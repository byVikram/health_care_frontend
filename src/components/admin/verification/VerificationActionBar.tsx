// src/components/admin/verification/VerificationActionBar.tsx
import { useState } from 'react'
import {
	Box,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Alert,
	Divider,
	Chip,
	Grid,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ReplayIcon from '@mui/icons-material/Replay'
import RuleIcon from '@mui/icons-material/Rule'
import DescriptionIcon from '@mui/icons-material/Description'

import AppButton from '../../common/Button/AppButton'
import { VerificationDocumentItem } from './DocumentRail'

interface VerificationActionBarProps {
	activeDocument: VerificationDocumentItem | null
	documents: VerificationDocumentItem[]
	submitting: boolean
	onDocAction: (action: 'approve' | 'reject' | 'reupload') => void
	onApplicantAction: (verdict: 'approve' | 'request_changes' | 'reject') => void
}

export default function VerificationActionBar({
	activeDocument,
	documents,
	submitting,
	onDocAction,
	onApplicantAction,
}: VerificationActionBarProps) {
	const [guardOpen, setGuardOpen] = useState(false)

	const unreviewedCount = documents.filter((d) => d.status === 'not_reviewed' || d.status === 'under_review').length
	const flaggedCount = documents.filter((d) => d.status === 'flagged' || d.status === 'requires_reupload').length

	const handleTryComplete = () => {
		if (unreviewedCount > 0 || flaggedCount > 0) {
			setGuardOpen(true)
		} else {
			onApplicantAction('approve')
		}
	}

	const isApproved = activeDocument?.status === 'verified'
	const isReupload = activeDocument?.status === 'requires_reupload'
	const isRejected = activeDocument?.status === 'rejected'

	return (
		<Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
			{/* Per-Document Level Actions Header Card */}
			{activeDocument && (
				<Box
					sx={{
						mb: 1.5,
						p: 1.5,
						bgcolor: '#f8fafc',
						borderRadius: '10px',
						border: '1px solid #e2e8f0',
					}}
				>
					<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
						<Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
							<DescriptionIcon sx={{ fontSize: 16, color: '#0d9488' }} />
							<Typography variant="subtitle2" fontWeight={800} color="#0f172a" noWrap sx={{ fontSize: '12.5px' }}>
								{activeDocument.name}
							</Typography>
						</Stack>

						<Chip
							label={
								isApproved
									? 'VERIFIED'
									: isReupload
										? 'RE-UPLOAD'
										: isRejected
											? 'REJECTED'
											: 'UNREVIEWED'
							}
							size="small"
							sx={{
								height: 18,
								fontSize: '0.6rem',
								fontWeight: 800,
								bgcolor: isApproved ? '#f0fdf4' : isReupload ? '#faf5ff' : isRejected ? '#fff1f2' : '#f1f5f9',
								color: isApproved ? '#16a34a' : isReupload ? '#9333ea' : isRejected ? '#dc2626' : '#64748b',
								border: `1px solid ${isApproved ? '#bbf7d0' : isReupload ? '#e9d5ff' : isRejected ? '#fecaca' : '#cbd5e1'}`,
								flexShrink: 0,
								borderRadius: '4px',
							}}
						/>
					</Stack>

					<Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9.5px' }}>
						Active Document Action:
					</Typography>

					{/* 3-Column Action Buttons Bar */}
					<Grid container spacing={0.75}>
						<Grid size={{ xs: 4 }}>
							<AppButton
								size="small"
								fullWidth
								startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
								onClick={() => onDocAction('approve')}
								disabled={submitting}
								label="Approve"
								sx={{
									bgcolor: isApproved ? '#16a34a' : '#ffffff',
									color: isApproved ? '#ffffff' : '#15803d',
									border: '1px solid',
									borderColor: isApproved ? '#16a34a' : '#bbf7d0',
									fontSize: '11px',
									py: 0.5,
									px: 0.25,
									borderRadius: '6px',
									whiteSpace: 'nowrap',
									boxShadow: isApproved ? '0 1px 4px rgba(22,163,74,0.2)' : 'none',
									'&:hover': {
										bgcolor: isApproved ? '#15803d' : '#f0fdf4',
									},
								}}
							/>
						</Grid>

						<Grid size={{ xs: 4 }}>
							<AppButton
								size="small"
								fullWidth
								startIcon={<ReplayIcon sx={{ fontSize: 13 }} />}
								onClick={() => onDocAction('reupload')}
								disabled={submitting}
								label="Re-upload"
								sx={{
									bgcolor: isReupload ? '#9333ea' : '#ffffff',
									color: isReupload ? '#ffffff' : '#7e22ce',
									border: '1px solid',
									borderColor: isReupload ? '#9333ea' : '#e9d5ff',
									fontSize: '11px',
									py: 0.5,
									px: 0.25,
									borderRadius: '6px',
									whiteSpace: 'nowrap',
									boxShadow: isReupload ? '0 1px 4px rgba(147,51,234,0.2)' : 'none',
									'&:hover': {
										bgcolor: isReupload ? '#7e22ce' : '#faf5ff',
									},
								}}
							/>
						</Grid>

						<Grid size={{ xs: 4 }}>
							<AppButton
								size="small"
								fullWidth
								startIcon={<CancelIcon sx={{ fontSize: 13 }} />}
								onClick={() => onDocAction('reject')}
								disabled={submitting}
								label="Reject"
								sx={{
									bgcolor: isRejected ? '#dc2626' : '#ffffff',
									color: isRejected ? '#ffffff' : '#b91c1c',
									border: '1px solid',
									borderColor: isRejected ? '#dc2626' : '#fecaca',
									fontSize: '11px',
									py: 0.5,
									px: 0.25,
									borderRadius: '6px',
									whiteSpace: 'nowrap',
									boxShadow: isRejected ? '0 1px 4px rgba(220,38,38,0.2)' : 'none',
									'&:hover': {
										bgcolor: isRejected ? '#b91c1c' : '#fff1f2',
									},
								}}
							/>
						</Grid>
					</Grid>
				</Box>
			)}

			{/* Global Applicant Level Verdict Actions */}
			<Typography variant="caption" fontWeight={800} color="#475569" display="block" sx={{ mb: 0.75, textTransform: 'uppercase', fontSize: '10.5px' }}>
				Final Application Verdict
			</Typography>

			<Stack spacing={0.75}>
				<AppButton
					variant="contained"
					fullWidth
					startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
					onClick={handleTryComplete}
					disabled={submitting}
					label="Complete Verification"
					sx={{
						bgcolor: '#0d9488',
						fontWeight: 800,
						py: 0.8,
						fontSize: '12.5px',
						borderRadius: '8px',
						boxShadow: '0 2px 8px rgba(13,148,136,0.25)',
						'&:hover': { bgcolor: '#0f766e' },
					}}
				/>

				<Stack direction="row" spacing={0.75}>
					<AppButton
						variant="outlined"
						color="warning"
						fullWidth
						startIcon={<ReplayIcon sx={{ fontSize: 14 }} />}
						onClick={() => onApplicantAction('request_changes')}
						disabled={submitting}
						label="Request Changes"
						sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '11px', py: 0.5 }}
					/>

					<AppButton
						variant="outlined"
						color="error"
						fullWidth
						startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
						onClick={() => onApplicantAction('reject')}
						disabled={submitting}
						label="Reject Application"
						sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '11px', py: 0.5 }}
					/>
				</Stack>
			</Stack>

			{/* Safety Guard Dialog if completing verification with unreviewed/flagged docs */}
			<Dialog open={guardOpen} onClose={() => setGuardOpen(false)} PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
				<DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, fontSize: '15px' }}>
					<RuleIcon color="warning" /> Verification Safety Guard
				</DialogTitle>
				<DialogContent>
					<Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '13px' }}>
						You are attempting to complete verification, but there are unreviewed or flagged items remaining:
					</Typography>

					{unreviewedCount > 0 && (
						<Alert severity="warning" sx={{ mb: 1, borderRadius: 1.5, py: 0.5, fontSize: '12px' }}>
							<strong>{unreviewedCount}</strong> document(s) have not been marked as reviewed.
						</Alert>
					)}

					{flaggedCount > 0 && (
						<Alert severity="error" sx={{ mb: 1, borderRadius: 1.5, py: 0.5, fontSize: '12px' }}>
							<strong>{flaggedCount}</strong> document(s) are flagged with issues or require re-upload.
						</Alert>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 1.5 }}>
					<AppButton variant="outlined" onClick={() => setGuardOpen(false)} label="Go Back & Review" size="small" />
					<AppButton
						variant="contained"
						color="success"
						onClick={() => {
							setGuardOpen(false)
							onApplicantAction('approve')
						}}
						label="Override & Complete"
						size="small"
						disabled={submitting}
					/>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
