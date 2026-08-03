// src/components/admin/verification/VerificationActionBar.tsx
import { useState } from 'react'
import {
	Box,
	Stack,
	Button,
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
						mb: 2,
						p: 2,
						bgcolor: '#f8fafc',
						borderRadius: '12px',
						border: '1px solid #e2e8f0',
					}}
				>
					<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
						<Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
							<DescriptionIcon sx={{ fontSize: 18, color: '#0d9488' }} />
							<Typography variant="subtitle2" fontWeight={800} color="#0f172a" noWrap>
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
								height: 20,
								fontSize: '0.62rem',
								fontWeight: 800,
								bgcolor: isApproved ? '#f0fdf4' : isReupload ? '#faf5ff' : isRejected ? '#fff1f2' : '#f1f5f9',
								color: isApproved ? '#16a34a' : isReupload ? '#9333ea' : isRejected ? '#dc2626' : '#64748b',
								border: `1px solid ${isApproved ? '#bbf7d0' : isReupload ? '#e9d5ff' : isRejected ? '#fecaca' : '#cbd5e1'}`,
								flexShrink: 0,
							}}
						/>
					</Stack>

					<Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '10px' }}>
						Active Document Action:
					</Typography>

					{/* 3-Column Action Buttons Bar */}
					<Grid container spacing={1}>
						<Grid size={{ xs: 4 }}>
							<Button
								size="small"
								fullWidth
								startIcon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
								onClick={() => onDocAction('approve')}
								disabled={submitting}
								sx={{
									bgcolor: isApproved ? '#16a34a' : '#ffffff',
									color: isApproved ? '#ffffff' : '#15803d',
									border: '1px solid',
									borderColor: isApproved ? '#16a34a' : '#bbf7d0',
									textTransform: 'none',
									fontWeight: 800,
									fontSize: '12px',
									py: 0.8,
									px: 0.5,
									borderRadius: '8px',
									whiteSpace: 'nowrap',
									boxShadow: isApproved ? '0 2px 8px rgba(22,163,74,0.3)' : 'none',
									'&:hover': {
										bgcolor: isApproved ? '#15803d' : '#f0fdf4',
									},
								}}
							>
								Approve
							</Button>
						</Grid>

						<Grid size={{ xs: 4 }}>
							<Button
								size="small"
								fullWidth
								startIcon={<ReplayIcon sx={{ fontSize: 15 }} />}
								onClick={() => onDocAction('reupload')}
								disabled={submitting}
								sx={{
									bgcolor: isReupload ? '#9333ea' : '#ffffff',
									color: isReupload ? '#ffffff' : '#7e22ce',
									border: '1px solid',
									borderColor: isReupload ? '#9333ea' : '#e9d5ff',
									textTransform: 'none',
									fontWeight: 800,
									fontSize: '12px',
									py: 0.8,
									px: 0.5,
									borderRadius: '8px',
									whiteSpace: 'nowrap',
									boxShadow: isReupload ? '0 2px 8px rgba(147,51,234,0.3)' : 'none',
									'&:hover': {
										bgcolor: isReupload ? '#7e22ce' : '#faf5ff',
									},
								}}
							>
								Re-upload
							</Button>
						</Grid>

						<Grid size={{ xs: 4 }}>
							<Button
								size="small"
								fullWidth
								startIcon={<CancelIcon sx={{ fontSize: 15 }} />}
								onClick={() => onDocAction('reject')}
								disabled={submitting}
								sx={{
									bgcolor: isRejected ? '#dc2626' : '#ffffff',
									color: isRejected ? '#ffffff' : '#b91c1c',
									border: '1px solid',
									borderColor: isRejected ? '#dc2626' : '#fecaca',
									textTransform: 'none',
									fontWeight: 800,
									fontSize: '12px',
									py: 0.8,
									px: 0.5,
									borderRadius: '8px',
									whiteSpace: 'nowrap',
									boxShadow: isRejected ? '0 2px 8px rgba(220,38,38,0.3)' : 'none',
									'&:hover': {
										bgcolor: isRejected ? '#b91c1c' : '#fff1f2',
									},
								}}
							>
								Reject
							</Button>
						</Grid>
					</Grid>
				</Box>
			)}

			<Divider sx={{ my: 1.5 }} />

			{/* Global Applicant Level Verdict Actions */}
			<Typography variant="caption" fontWeight={800} color="#475569" display="block" sx={{ mb: 1, textTransform: 'uppercase' }}>
				Final Application Verdict
			</Typography>

			<Stack spacing={1}>
				<Button
					variant="contained"
					fullWidth
					startIcon={<CheckCircleIcon />}
					onClick={handleTryComplete}
					disabled={submitting}
					sx={{
						bgcolor: '#0d9488',
						textTransform: 'none',
						fontWeight: 800,
						py: 1,
						borderRadius: 2,
						boxShadow: '0 4px 14px rgba(13,148,136,0.3)',
						'&:hover': { bgcolor: '#0f766e' },
					}}
				>
					Complete Verification
				</Button>

				<Stack direction="row" spacing={1}>
					<Button
						variant="outlined"
						color="warning"
						fullWidth
						startIcon={<ReplayIcon />}
						onClick={() => onApplicantAction('request_changes')}
						disabled={submitting}
						sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 12 }}
					>
						Request Changes
					</Button>

					<Button
						variant="outlined"
						color="error"
						fullWidth
						startIcon={<CancelIcon />}
						onClick={() => onApplicantAction('reject')}
						disabled={submitting}
						sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 12 }}
					>
						Reject Application
					</Button>
				</Stack>
			</Stack>

			{/* Safety Guard Dialog if completing verification with unreviewed/flagged docs */}
			<Dialog open={guardOpen} onClose={() => setGuardOpen(false)} PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
				<DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
					<RuleIcon color="warning" /> Verification Safety Guard
				</DialogTitle>
				<DialogContent>
					<Typography variant="body2" color="text.secondary" paragraph>
						You are attempting to complete verification, but there are unreviewed or flagged items remaining:
					</Typography>

					{unreviewedCount > 0 && (
						<Alert severity="warning" sx={{ mb: 1.5, borderRadius: 2 }}>
							{unreviewedCount} document(s) have not been reviewed yet.
						</Alert>
					)}

					{flaggedCount > 0 && (
						<Alert severity="error" sx={{ borderRadius: 2 }}>
							{flaggedCount} document(s) are flagged or require re-upload.
						</Alert>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setGuardOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>
						Review Remaining Docs
					</Button>
					<Button
						variant="contained"
						onClick={() => {
							setGuardOpen(false)
							onApplicantAction('approve')
						}}
						sx={{ bgcolor: '#0d9488', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }}
					>
						Force Complete Anyway
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
