// src/features/lab/components/CartSection.tsx
//
// The numbered white card each step of the cart page sits in (1 Who, 2 Where, 3 When): a teal number, a title with a grey line under it,
// and the content. Also the round radio mark the choice cards use.
import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { DESK } from '../../styles/deskTokens'
import { BOOKING_CARD } from './bookingStyles'

interface CartSectionProps {
	step?: number
	title: string
	sub?: string
	/** Right-aligned action in the header ("Add more tests"). */
	right?: ReactNode
	children: ReactNode
}

export default function CartSection({ step, title, sub, right, children }: CartSectionProps) {
	return (
		<Box component="section" aria-label={title} sx={{ ...BOOKING_CARD, p: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				{step ? (
					<Box
						component="span"
						sx={{
							width: 30,
							height: 30,
							flexShrink: 0,
							borderRadius: '9999px',
							bgcolor: DESK.primary,
							color: '#FFFFFF',
							fontSize: 14,
							fontWeight: 800,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{step}
					</Box>
				) : null}
				<Box component="span" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
					<Box component="h2" sx={{ m: 0, fontSize: 18, lineHeight: '24px', fontWeight: 800 }}>
						{title}
					</Box>
					{sub ? (
						<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
							{sub}
						</Box>
					) : null}
				</Box>
				{right}
			</Box>
			{children}
		</Box>
	)
}

/** The round mark at the end of a choice card: a thick teal ring when chosen, a thin grey ring when not. */
export function RadioDot({ on, size = 22 }: { on: boolean; size?: number }) {
	return (
		<Box
			component="span"
			aria-hidden="true"
			sx={{
				width: size,
				height: size,
				flexShrink: 0,
				boxSizing: 'border-box',
				borderRadius: '9999px',
				border: on ? `6px solid ${DESK.primary}` : `2px solid ${DESK.fainter}`,
				bgcolor: DESK.raised,
			}}
		/>
	)
}
