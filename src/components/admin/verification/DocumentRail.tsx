// src/components/admin/verification/DocumentRail.tsx
import React from 'react'
import {
	Box,
	Typography,
	Stack,
	LinearProgress,
	Chip,
} from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import CancelIcon from '@mui/icons-material/Cancel'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import RateReviewIcon from '@mui/icons-material/RateReview'
import ReplayIcon from '@mui/icons-material/Replay'

import { buildS3Url } from '../../../utils/s3'

export type DocumentStatus =
	| 'not_reviewed'
	| 'under_review'
	| 'verified'
	| 'flagged'
	| 'rejected'
	| 'requires_reupload'

export interface VerificationDocumentItem {
	id: string
	name: string
	url: string
	type: string
	status: DocumentStatus
	extractedFieldCount?: number
	issueTag?: string
	reviewedAt?: string
}

interface DocumentRailProps {
	documents: VerificationDocumentItem[]
	selectedIndex: number
	onSelectDocument: (index: number) => void
}

const STATUS_CONFIG: Record<
	DocumentStatus,
	{ label: string; color: string; bg: string; border: string; icon: React.ReactElement }
> = {
	not_reviewed: {
		label: 'Not Reviewed',
		color: '#475569',
		bg: '#f8fafc',
		border: '#e2e8f0',
		icon: <HourglassEmptyIcon sx={{ fontSize: 12 }} />,
	},
	under_review: {
		label: 'Under Review',
		color: '#2563eb',
		bg: '#eff6ff',
		border: '#bfdbfe',
		icon: <RateReviewIcon sx={{ fontSize: 12 }} />,
	},
	verified: {
		label: 'Verified',
		color: '#16a34a',
		bg: '#f0fdf4',
		border: '#bbf7d0',
		icon: <CheckCircleIcon sx={{ fontSize: 12 }} />,
	},
	flagged: {
		label: 'Flagged',
		color: '#d97706',
		bg: '#fffbeb',
		border: '#fde68a',
		icon: <WarningIcon sx={{ fontSize: 12 }} />,
	},
	rejected: {
		label: 'Rejected',
		color: '#dc2626',
		bg: '#fff1f2',
		border: '#fecaca',
		icon: <CancelIcon sx={{ fontSize: 12 }} />,
	},
	requires_reupload: {
		label: 'Requires Re-upload',
		color: '#9333ea',
		bg: '#faf5ff',
		border: '#e9d5ff',
		icon: <ReplayIcon sx={{ fontSize: 12 }} />,
	},
}

export default function DocumentRail({
	documents,
	selectedIndex,
	onSelectDocument,
}: DocumentRailProps) {
	const completedCount = documents.filter(
		(d) => d.status === 'verified' || d.status === 'rejected' || d.status === 'requires_reupload'
	).length
	const progressPercent = documents.length > 0 ? (completedCount / documents.length) * 100 : 0

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff', p: 2 }}>
			{/* Review Progress Banner */}
			<Box sx={{ mb: 1.75 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
					<Typography variant="caption" fontWeight={800} color="#0f172a" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11px' }}>
						Review Progress
					</Typography>
					<Typography variant="caption" fontWeight={800} color="#0d9488" sx={{ fontSize: '11.5px' }}>
						{completedCount} / {documents.length} Completed
					</Typography>
				</Stack>

				<LinearProgress
					variant="determinate"
					value={progressPercent}
					sx={{
						height: 4,
						borderRadius: 2,
						bgcolor: '#e2e8f0',
						'& .MuiLinearProgress-bar': { bgcolor: '#0d9488', borderRadius: 2 },
					}}
				/>
			</Box>

			{/* Vertical Document List */}
			<Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
				{documents.map((doc, index) => {
					const isSelected = index === selectedIndex
					const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.not_reviewed
					const s3Url = buildS3Url(doc.url)
					const isImage = s3Url ? /\.(png|jpe?g|webp|gif)$/i.test(s3Url) : false

					return (
						<Box
							key={doc.id}
							onClick={() => onSelectDocument(index)}
							sx={{
								p: 1.5,
								borderRadius: '10px',
								border: '1.5px solid',
								borderColor: isSelected ? '#0d9488' : '#e2e8f0',
								bgcolor: '#ffffff',
								cursor: 'pointer',
								transition: 'all 0.15s ease',
								boxShadow: isSelected ? '0 2px 6px rgba(13,148,136,0.08)' : 'none',
								'&:hover': {
									borderColor: isSelected ? '#0d9488' : '#cbd5e1',
									bgcolor: '#f8fafc',
								},
							}}
						>
							<Stack direction="row" spacing={1.25} alignItems="center">
								{/* Document Thumbnail / Teal Icon */}
								{isImage && s3Url ? (
									<Box
										component="img"
										src={s3Url}
										alt={doc.name}
										sx={{
											width: 36,
											height: 36,
											borderRadius: '6px',
											objectFit: 'cover',
											border: '1px solid #cbd5e1',
											flexShrink: 0,
										}}
									/>
								) : (
									<Box
										sx={{
											width: 36,
											height: 36,
											borderRadius: '6px',
											bgcolor: '#0d9488',
											color: '#ffffff',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0,
										}}
									>
										<DescriptionIcon sx={{ fontSize: 18 }} />
									</Box>
								)}

								{/* Document Info & Status Badge */}
								<Box sx={{ minWidth: 0, flex: 1 }}>
									<Typography
										variant="body2"
										fontWeight={700}
										color="#0f172a"
										noWrap
										sx={{ fontSize: '12.5px' }}
									>
										{doc.name}
									</Typography>
									<Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '10.5px', mt: 0.25 }}>
										TYPE: {doc.type.toUpperCase()}
									</Typography>

									<Box sx={{ mt: 0.75 }}>
										<Chip
											icon={cfg.icon}
											label={cfg.label}
											size="small"
											sx={{
												height: 20,
												fontSize: '0.62rem',
												fontWeight: 700,
												color: cfg.color,
												bgcolor: cfg.bg,
												border: `1px solid ${cfg.border}`,
												borderRadius: '5px',
												'& .MuiChip-icon': { color: cfg.color },
											}}
										/>
									</Box>
								</Box>
							</Stack>

							{doc.issueTag && (
								<Typography
									variant="caption"
									sx={{
										display: 'block',
										mt: 0.75,
										pt: 0.5,
										borderTop: '1px dashed #e2e8f0',
										color: '#d97706',
										fontWeight: 700,
										fontSize: '10.5px',
									}}
								>
									⚠️ Issue: {doc.issueTag}
								</Typography>
							)}
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}
