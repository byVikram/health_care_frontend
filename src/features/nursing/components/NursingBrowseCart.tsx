// src/features/nursing/components/NursingBrowseCart.tsx
//
// The sticky "Your booking" card on the right of the browse page (the design's cart): the items (remove with ×), the count, the total and the
// saving, then "Book now" and "Schedule for later". Reads the booking store, so it stays in step with the later pages.
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import { inr, plural } from '../../lab/labFormat'
import { LAB_CARD } from '../../lab/labStyles'
import { instantFee, nursingBooking, perVisitFee, useNursingBooking, type BookingMode } from '../nursingBookingStore'
import { durationLabel } from '../nursingFormat'
import { useCareService } from '../useCareService'

interface NursingBrowseCartProps {
	onContinue: (mode: BookingMode) => void
}

export default function NursingBrowseCart({ onContinue }: NursingBrowseCartProps) {
	const care = useCareService()
	const { items } = useNursingBooking()
	const total = instantFee(items)
	const hasPackage = items.some((i) => i.kind === 'package')
	const visitFee = perVisitFee(items)

	return (
		<Box component="aside" aria-label="Your booking" sx={{ ...LAB_CARD, position: 'sticky', top: 20, width: 320, flexShrink: 0, p: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<Box component="b" sx={{ flexGrow: 1, fontSize: 18 }}>
					Your booking
				</Box>
				<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
					{plural(items.length, 'service', 'services')}
				</Box>
			</Box>
			{items.length === 0 ? (
				<Box sx={{ p: '24px 8px', borderRadius: '14px', bgcolor: DESK.page, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
					<Box component="span" sx={{ display: 'flex', color: DESK.fainter }}>
						<DeskIcon d={DESK_ICONS.cart} size={28} />
					</Box>
					<Box component="b" sx={{ fontSize: 14 }}>
						Nothing added yet
					</Box>
					<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
						Add a service to book a {care.noun} visit.
					</Box>
				</Box>
			) : (
				<>
					<Box sx={{ display: 'flex', flexDirection: 'column' }}>
						{items.map((item) => (
							<Box key={item.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px', py: '10px', borderBottom: `1px solid ${DESK.lineSoft}` }}>
								<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
									<Box component="b" sx={{ fontSize: 14, lineHeight: '19px' }}>
										{item.name}
									</Box>
									<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
										{[item.visitsCount ? plural(item.visitsCount, 'visit', 'visits') : '', durationLabel(item.durationMinutes)].filter(Boolean).join(' · ') || 'At your home'}
									</Box>
								</Box>
								<Box component="b" sx={{ fontSize: 14 }}>
									{inr(item.price)}
								</Box>
								<Box
									component="button"
									type="button"
									onClick={() => nursingBooking.removeItem(item.id)}
									aria-label={`Remove ${item.name}`}
									sx={{ width: 26, height: 26, border: 0, borderRadius: '8px', bgcolor: DESK.chip, color: DESK.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
								>
									<DeskIcon d={DESK_ICONS.close} size={12} strokeWidth={2.6} />
								</Box>
							</Box>
						))}
					</Box>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 14 }}>
						<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', pt: '4px', fontSize: 17 }}>
							<b>Total</b>
							<b>{inr(total)}</b>
						</Box>
						{hasPackage && visitFee !== total ? (
							<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
								{inr(visitFee)} per visit when you schedule
							</Box>
						) : null}
						<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
							Pay after the visit. Nothing is charged now.
						</Box>
					</Box>
					<Box component="button" type="button" onClick={() => onContinue('now')} sx={primarySx}>
						Book now
					</Box>
					<Box component="button" type="button" onClick={() => onContinue('later')} sx={secondarySx}>
						Schedule for later
					</Box>
				</>
			)}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', pt: '4px', borderTop: `1px solid ${DESK.lineSoft}` }}>
				{care.trust.slice(0, 3).map((t) => (
					<Box key={t.label} component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 12, color: DESK.muted, pt: '6px' }}>
						<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
							<DeskIcon d={DESK_ICONS[t.icon]} size={15} />
						</Box>
						{t.label}
					</Box>
				))}
			</Box>
		</Box>
	)
}

const primarySx = {
	minHeight: 50,
	px: '16px',
	border: 0,
	borderRadius: '12px',
	bgcolor: DESK.primary,
	color: '#FFFFFF',
	fontFamily: 'inherit',
	fontSize: 15,
	fontWeight: 800,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '8px',
	cursor: 'pointer',
	'&:hover': { filter: 'brightness(0.97)' },
} as const

const secondarySx = {
	height: 46,
	px: '16px',
	borderRadius: '12px',
	border: `1.5px solid ${DESK.primary}`,
	bgcolor: DESK.raised,
	color: DESK.primary,
	fontFamily: 'inherit',
	fontSize: 15,
	fontWeight: 800,
	cursor: 'pointer',
	'&:hover': { filter: 'brightness(0.97)' },
} as const
