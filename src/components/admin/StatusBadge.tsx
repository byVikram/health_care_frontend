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
	| 'deleted'
	| 'searching'
	| 'searching_for_nurse'
	| 'assigned'
	| 'en_route'
	| 'arrived'
	| 'in_progress'
	| 'completed'
	| 'cancelled_by_patient'
	| 'cancelled_by_provider'
	| 'cancelled'
	| 'expired'
	| 'failed'
	| string

const STATUS_MAP: Record<
	string,
	{ bg: string; color: string; label?: string }
> = {
	active:                 { bg: '#dcfce7', color: '#15803d', label: 'Active' },
	suspended:              { bg: '#fee2e2', color: '#dc2626', label: 'Suspended' },
	pending:                { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
	verified:               { bg: '#dcfce7', color: '#15803d', label: 'Verified' },
	rejected:               { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
	published:              { bg: '#ccfbf1', color: '#0f766e', label: 'Published' },
	draft:                  { bg: '#f1f5f9', color: '#64748b', label: 'Draft' },
	featured:               { bg: '#fef3c7', color: '#d97706', label: 'Featured' },
	approved:               { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
	flagged:                { bg: '#fff7ed', color: '#ea580c', label: 'Flagged' },
	hidden:                 { bg: '#fee2e2', color: '#dc2626', label: 'Hidden' },
	deleted:                { bg: '#f1f5f9', color: '#475569', label: 'Deleted' },
	searching:              { bg: '#fffbeb', color: '#b45309', label: 'Searching' },
	searching_for_nurse:    { bg: '#fffbeb', color: '#b45309', label: 'Searching' },
	assigned:               { bg: '#e0f2fe', color: '#0369a1', label: 'Assigned' },
	en_route:               { bg: '#e0e7ff', color: '#4338ca', label: 'En Route' },
	arrived:                { bg: '#f3e8ff', color: '#7e22ce', label: 'Arrived' },
	in_progress:            { bg: '#ccfbf1', color: '#0f766e', label: 'In Progress' },
	completed:              { bg: '#dcfce7', color: '#15803d', label: 'Completed' },
	cancelled_by_patient:   { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled by Patient' },
	cancelled_by_provider:  { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled by Provider' },
	cancelled:              { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' },
	expired:                { bg: '#f1f5f9', color: '#475569', label: 'Expired' },
	failed:                 { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
}

function formatDefaultLabel(str: string): string {
	return str
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase())
}

interface StatusBadgeProps {
	status: StatusVariant
	label?: string
	size?: 'small' | 'medium'
}

export default function StatusBadge({ status, label, size = 'small' }: StatusBadgeProps) {
	if (!status) return null
	const key = status?.toLowerCase()
	const config = STATUS_MAP[key] ?? { bg: '#f1f5f9', color: '#64748b' }
	const displayLabel = label ?? config.label ?? formatDefaultLabel(status)

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
