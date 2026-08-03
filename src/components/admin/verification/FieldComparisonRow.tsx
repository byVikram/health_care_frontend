// src/components/admin/verification/FieldComparisonRow.tsx
import { Box, Typography, Stack, Chip } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import CancelIcon from '@mui/icons-material/Cancel'

export type FieldMatchStatus = 'match' | 'needs_review' | 'mismatch'

export interface FieldComparisonData {
	fieldKey: string
	label: string
	providedValue: string | null | undefined
	status: FieldMatchStatus
}

const STATUS_MAP: Record<
	FieldMatchStatus,
	{ label: string; color: string; bg: string; icon: React.ReactElement }
> = {
	match: {
		label: 'Verified',
		color: '#16a34a',
		bg: '#f0fdf4',
		icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
	},
	needs_review: {
		label: 'Needs Review',
		color: '#d97706',
		bg: '#fffbeb',
		icon: <WarningIcon sx={{ fontSize: 13 }} />,
	},
	mismatch: {
		label: 'Mismatch',
		color: '#dc2626',
		bg: '#fff1f2',
		icon: <CancelIcon sx={{ fontSize: 13 }} />,
	},
}

export default function FieldComparisonRow({ data }: { data: FieldComparisonData }) {
	const cfg = STATUS_MAP[data.status] || STATUS_MAP.needs_review

	return (
		<Box
			sx={{
				p: 1.5,
				borderRadius: '10px',
				border: '1px solid #e2e8f0',
				bgcolor: '#ffffff',
				transition: 'all 0.15s ease',
				'&:hover': { borderColor: '#0d9488' },
			}}
		>
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Box sx={{ minWidth: 0, pr: 1 }}>
					<Typography variant="caption" fontWeight={800} color="#475569" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
						{data.label}
					</Typography>
					<Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mt: 0.25 }}>
						{data.providedValue || '—'}
					</Typography>
				</Box>

				<Chip
					icon={cfg.icon}
					label={cfg.label}
					size="small"
					sx={{
						height: 22,
						fontSize: '0.65rem',
						fontWeight: 800,
						color: cfg.color,
						bgcolor: cfg.bg,
						border: `1px solid ${cfg.color}30`,
						'& .MuiChip-icon': { color: cfg.color },
						flexShrink: 0,
					}}
				/>
			</Stack>
		</Box>
	)
}
