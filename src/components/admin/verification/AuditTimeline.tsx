// src/components/admin/verification/AuditTimeline.tsx
import { Box, Typography, Stack } from '@mui/material'
import HistoryIcon from '@mui/icons-material/History'

export interface AuditTimelineEvent {
	id: string
	reviewerName: string
	action: string
	timestamp: string
	documentName?: string
	reason?: string
}

interface AuditTimelineProps {
	events: AuditTimelineEvent[]
}

export default function AuditTimeline({ events }: AuditTimelineProps) {
	return (
		<Box>
			<Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
				<HistoryIcon sx={{ fontSize: 16, color: '#0d9488' }} />
				<Typography variant="caption" fontWeight={800} color="#0f172a" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11.5px' }}>
					Review Audit Trail
				</Typography>
			</Stack>

			{events.length === 0 ? (
				<Typography variant="caption" color="#64748b" sx={{ fontStyle: 'italic', display: 'block', fontSize: '11.5px', pl: 0.5 }}>
					No review actions recorded yet.
				</Typography>
			) : (
				<Stack spacing={1.25} sx={{ position: 'relative', pl: 1.75, borderLeft: '2px solid #e2e8f0', ml: 0.75, my: 0.5 }}>
					{events.map((evt) => (
						<Box key={evt.id} sx={{ position: 'relative' }}>
							<Box
								sx={{
									position: 'absolute',
									left: -20,
									top: 3,
									width: 8,
									height: 8,
									borderRadius: '50%',
									bgcolor: '#0d9488',
									border: '2px solid #ffffff',
									boxShadow: '0 0 0 1px #cbd5e1',
								}}
							/>
							<Stack direction="row" justifyContent="space-between" alignItems="baseline">
								<Typography variant="caption" fontWeight={800} color="#0f172a" sx={{ fontSize: '11.5px' }}>
									{evt.reviewerName}
								</Typography>
								<Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
									{evt.timestamp}
								</Typography>
							</Stack>

							<Typography variant="caption" color="#475569" display="block" sx={{ mt: 0.25, fontSize: '11px', fontWeight: 500 }}>
								{evt.action} {evt.documentName ? `• ${evt.documentName}` : ''}
							</Typography>

							{evt.reason && (
								<Typography
									variant="caption"
									sx={{
										display: 'block',
										mt: 0.5,
										p: 0.75,
										bgcolor: '#f8fafc',
										borderRadius: '4px',
										border: '1px solid #e2e8f0',
										fontSize: '10.5px',
										color: '#334155',
										lineHeight: 1.35,
									}}
								>
									{evt.reason}
								</Typography>
							)}
						</Box>
					))}
				</Stack>
			)}
		</Box>
	)
}
