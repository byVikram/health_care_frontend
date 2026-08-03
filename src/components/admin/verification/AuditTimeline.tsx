// src/components/admin/verification/AuditTimeline.tsx
import { Box, Typography, Stack, Avatar } from '@mui/material'
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
			<Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5 }}>
				<HistoryIcon sx={{ fontSize: 16, color: '#0d9488' }} />
				<Typography variant="caption" fontWeight={800} color="#475569" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
					Review Audit Trail
				</Typography>
			</Stack>

			{events.length === 0 ? (
				<Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
					No review actions recorded yet.
				</Typography>
			) : (
				<Stack spacing={1.5} sx={{ position: 'relative', pl: 2, borderLeft: '2px solid #e2e8f0' }}>
					{events.map((evt) => (
						<Box key={evt.id} sx={{ position: 'relative' }}>
							<Box
								sx={{
									position: 'absolute',
									left: -21,
									top: 2,
									width: 10,
									height: 10,
									borderRadius: '50%',
									bgcolor: '#0d9488',
									border: '2px solid #ffffff',
								}}
							/>
							<Stack direction="row" justifyContent="space-between" alignItems="baseline">
								<Typography variant="caption" fontWeight={800} color="#0f172a">
									{evt.reviewerName}
								</Typography>
								<Typography variant="caption" color="text.secondary" fontSize={10}>
									{evt.timestamp}
								</Typography>
							</Stack>

							<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
								{evt.action} {evt.documentName ? `on ${evt.documentName}` : ''}
							</Typography>

							{evt.reason && (
								<Typography
									variant="caption"
									sx={{
										display: 'block',
										mt: 0.5,
										p: 1,
										bgcolor: '#f8fafc',
										borderRadius: 1,
										border: '1px solid #e2e8f0',
										fontSize: 11,
										color: '#334155',
									}}
								>
									Reason: {evt.reason}
								</Typography>
							)}
						</Box>
					))}
				</Stack>
			)}
		</Box>
	)
}
