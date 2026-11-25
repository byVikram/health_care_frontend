// src/features/nursing/components/NursingPromoCards.tsx
//
// The three highlight cards above the list (the design's "Need a nurse right now?", "Home after surgery?" and "Vitals check at home"). The
// catalogue has no promotions, so each card is built from what was loaded and left out when there is nothing for it: the helpline card needs
// the helpline number from the app config, the package card the best-discounted care package, the vitals card a procedure that is about vitals.
import { Box } from '@mui/material'
import DashboardCarousel from '../../../components/common/Carousel/DashboardCarousel'
import { DESK } from '../../../styles/deskTokens'
import { inr, plural } from '../../booking/bookingFormat'
import type { NursingItem } from '../nursingService'
import { offLabel } from '../nursingFormat'

interface NursingPromoCardsProps {
	packages: NursingItem[]
	procedures: NursingItem[]
	cart: string[]
	helpline: string | null
	onOpen: (item: NursingItem) => void
	onToggle: (item: NursingItem) => void
}

const cta = (bg: string, fg: string) =>
	({ mt: '6px', alignSelf: 'flex-start', height: 32, px: '12px', borderRadius: '8px', bgcolor: bg, color: fg, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center' }) as const

const cardSx = {
	width: '100%',
	height: '100%',
	boxSizing: 'border-box',
	justifyContent: 'center',
	p: '20px 26px',
	border: 0,
	borderRadius: '18px',
	fontFamily: 'inherit',
	textAlign: 'left',
	display: 'flex',
	flexDirection: 'column',
	gap: '6px',
	cursor: 'pointer',
	textDecoration: 'none',
	'&:hover': { filter: 'brightness(0.98)' },
} as const

const discount = (item: NursingItem) => (item.mrp != null && item.mrp > item.price && item.mrp > 0 ? Math.round((1 - item.price / item.mrp) * 100) : 0)

export default function NursingPromoCards({ packages, procedures, cart, helpline, onOpen, onToggle }: NursingPromoCardsProps) {
	const bestPackage = [...packages].sort((a, b) => discount(b) - discount(a) || (b.visitsCount ?? 0) - (a.visitsCount ?? 0))[0]
	const vitals = procedures.find((p) => /vital/i.test(p.name))
	const vitalsAdded = !!vitals && cart.includes(vitals.id)

	const cards = [
		helpline ? (
			<Box
				key="urgent"
				component="a"
				href={`tel:${helpline.replace(/[^+\d]/g, '')}`}
				sx={{ ...cardSx, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${DESK.hero} 0%, #1E5459 100%)`, color: '#FFFFFF' }}
			>
				<Box component="span" sx={{ alignSelf: 'flex-start', p: '3px 8px', borderRadius: '6px', bgcolor: DESK.discountBadge, fontSize: 11, fontWeight: 800 }}>
					PRIORITY · 24/7
				</Box>
				<Box component="b" sx={{ fontSize: 18, lineHeight: '24px' }}>
					Need a nurse right now?
				</Box>
				<Box component="span" sx={{ fontSize: 13, color: DESK.mintText }}>
					Emergency nurse at home, day or night · {helpline}
				</Box>
				<Box component="span" sx={cta('#FFFFFF', DESK.ink)}>
					Call now
				</Box>
			</Box>
		) : null,
		bestPackage ? (
			<Box key="package" component="button" type="button" onClick={() => onOpen(bestPackage)} sx={{ ...cardSx, bgcolor: DESK.lilacSoft, color: DESK.ink }}>
				<Box component="span" sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: DESK.lilac }}>
					RECOVERY PLAN
				</Box>
				<Box component="b" sx={{ fontSize: 17, lineHeight: '23px' }}>
					{bestPackage.name}
				</Box>
				<Box component="span" sx={{ fontSize: 13, color: '#4A3F6B' }}>
					{bestPackage.visitsCount ? `${plural(bestPackage.visitsCount, 'visit', 'visits')} for ` : ''}
					{inr(bestPackage.price)}
					{offLabel(bestPackage) ? ` · ${offLabel(bestPackage)}` : ''}
				</Box>
				<Box component="span" sx={cta(DESK.lilac, '#FFFFFF')}>
					View package
				</Box>
			</Box>
		) : null,
		vitals ? (
			<Box key="vitals" component="button" type="button" onClick={() => onToggle(vitals)} sx={{ ...cardSx, bgcolor: '#FDE8DC', color: DESK.ink }}>
				<Box component="span" sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: DESK.sand }}>
					FIRST VISIT
				</Box>
				<Box component="b" sx={{ fontSize: 17, lineHeight: '23px' }}>
					{vitals.name}
				</Box>
				<Box component="span" sx={{ fontSize: 13, color: '#6B4A3A' }}>
					{inr(vitals.price)}
					{offLabel(vitals) ? ` · ${offLabel(vitals)}` : ''}
				</Box>
				<Box component="span" sx={cta(DESK.sand, '#FFFFFF')}>
					{vitalsAdded ? 'Added' : 'Add to booking'}
				</Box>
			</Box>
		) : null,
	].filter(Boolean)

	if (cards.length === 0) return null
	// the cards slide one at a time like the native Home offers banner (auto-play every 4.5 s, pill dots)
	return <DashboardCarousel slides={cards} height={168} radius={18} autoPlay ariaLabel="Offers" />
}
