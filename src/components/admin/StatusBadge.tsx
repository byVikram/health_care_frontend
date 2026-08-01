// src/components/admin/StatusBadge.tsx
import { Chip } from '@mui/material'

type StatusVariant =
	| 'active'
	| 'suspended'
	| 'pending'
	| 'verified'
	| 'rejected'
	| 'published'
	| 'draft'
	| 'featured'
	| 'approved'
	| 'flagged'
	| 'hidden'
	| string

const STATUS_MAP: Record<
	string,
	{ bg: string; color: string; label?: string }
> = {
	active:    { bg: '#dcfce7', color: '#15803d' },
	suspended: { bg: '#fee2e2', color: '#dc2626' },
	pending:   { bg: '#fef3c7', color: '#d97706' },
	verified:  { bg: '#dcfce7', color: '#15803d' },
	rejected:  { bg: '#fee2e2', color: '#dc2626' },
	published: { bg: '#ccfbf1', color: '#0f766e' },
	draft:     { bg: '#f1f5f9', color: '#64748b' },
	featured:  { bg: '#fef3c7', color: '#d97706' },
	approved:  { bg: '#dcfce7', color: '#15803d' },
	flagged:   { bg: '#fff7ed', color: '#ea580c' },
	hidden:    { bg: '#fee2e2', color: '#dc2626' },
}

interface StatusBadgeProps {
	status: StatusVariant
	label?: string
	size?: 'small' | 'medium'
}

export default function StatusBadge({ status, label, size = 'small' }: StatusBadgeProps) {
	const key = status?.toLowerCase()
	const config = STATUS_MAP[key] ?? { bg: '#f1f5f9', color: '#64748b' }
	const displayLabel = label ?? status.toUpperCase()

	return (
		<Chip
			label={displayLabel}
			size={size}
			sx={{
				bgcolor: config.bg,
				color: config.color,
				fontWeight: 700,
				fontSize: size === 'small' ? '0.65rem' : '0.75rem',
				border: 'none',
				borderRadius: '6px',
				height: size === 'small' ? 22 : 28,
			}}
		/>
	)
}
