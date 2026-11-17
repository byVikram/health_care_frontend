// src/components/common/FactList/FactList.tsx
//
// The grey box of label / value pairs in a detail panel ("When  Today, 5:30 PM", "Where  Indiranagar clinic", "Booking ID  ...").
import { Box } from '@mui/material'
import { DESK } from '../../../styles/deskTokens'

export interface Fact {
	label: string
	value: string
}

export default function FactList({ facts }: { facts: Fact[] }) {
	return (
		<Box
			component="dl"
			sx={{
				m: 0,
				p: '14px',
				borderRadius: '12px',
				bgcolor: DESK.page,
				display: 'grid',
				gridTemplateColumns: 'auto 1fr',
				gap: '8px 14px',
				fontSize: 14,
			}}
		>
			{facts.map((fact) => (
				<Box key={fact.label} sx={{ display: 'contents' }}>
					<Box component="dt" sx={{ color: DESK.muted }}>
						{fact.label}
					</Box>
					<Box component="dd" sx={{ m: 0, fontWeight: 700, overflowWrap: 'anywhere' }}>
						{fact.value}
					</Box>
				</Box>
			))}
		</Box>
	)
}
