// src/components/admin/verification/DocumentRail.tsx
import React from 'react'
import {
	Box,
	Typography,
	Stack,
	LinearProgress,
	Avatar,
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
	{ label: string; color: string; bg: string; icon: React.ReactElement }
> = {
	not_reviewed: {
		label: 'Not Reviewed',
		color: '#64748b',
		bg: '#f1f5f9',
		icon: <HourglassEmptyIcon sx={{ fontSize: 13 }} />,
	},
	under_review: {
		label: 'Under Review',
		color: '#2563eb',
		bg: '#dbeafe',
		icon: <RateReviewIcon sx={{ fontSize: 13 }} />,
	},
	verified: {
		label: 'Verified',
		color: '#16a34a',
		bg: '#f0fdf4',
		icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
	},
	flagged: {
		label: 'Flagged',
		color: '#d97706',
		bg: '#fffbeb',
		icon: <WarningIcon sx={{ fontSize: 13 }} />,
	},
	rejected: {
		label: 'Rejected',
		color: '#dc2626',
		bg: '#fff1f2',
		icon: <CancelIcon sx={{ fontSize: 13 }} />,
	},
	requires_reupload: {
		label: 'Requires Re-upload',
		color: '#9333ea',
		bg: '#faf5ff',
		icon: <ReplayIcon sx={{ fontSize: 13 }} />,
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
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
			{/* Review Progress Banner */}
			<Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
					<Typography variant="caption" fontWeight={800} color="#475569" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
						Review Progress
					</Typography>
					<Typography variant="caption" fontWeight={800} color="#0d9488">
						{completedCount} / {documents.length} Completed
					</Typography>
				</Stack>

				<LinearProgress
					variant="determinate"
					value={progressPercent}
					sx={{
						height: 6,
						borderRadius: 2,
						bgcolor: '#e2e8f0',
						'& .MuiLinearProgress-bar': { bgcolor: '#0d9488', borderRadius: 2 },
					}}
				/>
			</Box>

			{/* Vertical Document List */}
			<Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
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
								p: 1.75,
								borderRadius: '12px',
								border: '2px solid',
								borderColor: isSelected ? '#0d9488' : '#e2e8f0',
								bgcolor: isSelected ? 'rgba(13,148,136,0.04)' : '#ffffff',
								cursor: 'pointer',
								transition: 'all 0.15s ease',
								boxShadow: isSelected ? '0 4px 12px rgba(13,148,136,0.12)' : 'none',
								'&:hover': {
									borderColor: isSelected ? '#0d9488' : '#cbd5e1',
									bgcolor: isSelected ? 'rgba(13,148,136,0.06)' : '#f8fafc',
								},
							}}
						>
							<Stack direction="row" spacing={1.5} alignItems="center">
								{/* Document Thumbnail / Icon */}
								{isImage && s3Url ? (
									<Box
										component="img"
										src={s3Url}
										alt={doc.name}
										sx={{
											width: 44,
											height: 44,
											borderRadius: '8px',
											objectFit: 'cover',
											border: '1px solid #cbd5e1',
											flexShrink: 0,
										}}
									/>
								) : (
									<Avatar
										sx={{
											width: 44,
											height: 44,
											borderRadius: '8px',
											bgcolor: isSelected ? '#0d9488' : '#f1f5f9',
											color: isSelected ? '#ffffff' : '#64748b',
											fontSize: 20,
											flexShrink: 0,
										}}
									>
										<DescriptionIcon fontSize="small" />
									</Avatar>
								)}

								{/* Document Info & Status Badge */}
								<Box sx={{ minWidth: 0, flex: 1 }}>
									<Typography
										variant="body2"
										fontWeight={800}
										color={isSelected ? '#0f172a' : '#334155'}
										noWrap
										fontSize={13}
									>
										{doc.name}
									</Typography>
									<Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: 11 }}>
										TYPE: {doc.type.toUpperCase()}
									</Typography>

									<Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
										<Chip
											icon={cfg.icon}
											label={cfg.label}
											size="small"
											sx={{
												height: 20,
												fontSize: '0.62rem',
												fontWeight: 800,
												color: cfg.color,
												bgcolor: cfg.bg,
												border: `1px solid ${cfg.color}30`,
												'& .MuiChip-icon': { color: cfg.color },
											}}
										/>
									</Stack>
								</Box>
							</Stack>

							{doc.issueTag && (
								<Typography
									variant="caption"
									sx={{
										display: 'block',
										mt: 1,
										pt: 0.75,
										borderTop: '1px dashed #e2e8f0',
										color: '#d97706',
										fontWeight: 700,
										fontSize: '11px',
									}}
								>
									âš ï¸ Issue: {doc.issueTag}
								</Typography>
							)}
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}
