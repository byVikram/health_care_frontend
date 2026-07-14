// src/features/referrals/ReferralBadge.tsx
import { Chip } from '@mui/material'

interface Props {
	size?: 'small' | 'medium'
}

/**
 * A visual badge shown on referred appointments.
 * Styled to match the Pending status Chip in DoctorAppointments.tsx —
 * same font-size (9px), height (16), font-weight (600), and border-radius.
 */
export default function ReferralBadge({ size = 'small' }: Props) {
	return (
		<Chip
			label="referred"
			size={size}
			sx={{
				fontSize: size === 'small' ? '9px' : '11px',
				height: size === 'small' ? 16 : 20,
				fontWeight: 600,
				bgcolor: '#e8f4f8',
				color: '#0c7c7c',
				// border: '1px solid rgba(12,124,124,0.25)',
				'& .MuiChip-label': { px: 0.8 },
			}}
		/>
	)
}
