// src/features/lab/components/LabPromoCards.tsx
//
// The three highlight cards above the list (full body checkup, diabetes care, vitamin check). The catalogue has no promotions, so each card
// is built from what was loaded and is left out when the catalogue has nothing for it (no invented prices or offers).
import { Box } from '@mui/material'
import DashboardCarousel from '../../../components/common/Carousel/DashboardCarousel'
import { DESK } from '../../../styles/deskTokens'
import type { LabItem } from '../labConstants'
import { inr } from '../labFormat'
import { offLabel } from '../labStyles'

interface LabPromoCardsProps {
	packages: LabItem[]
	tests: LabItem[]
	cart: string[]
	onOpen: (item: LabItem) => void
	/** Adds the items, or removes them when they are all in the cart already. */
	onToggleAll: (items: LabItem[]) => void
}

const cta = (bg: string, fg: string) =>
	({
		mt: '6px',
		alignSelf: 'flex-start',
		height: 32,
		px: '12px',
		borderRadius: '8px',
		bgcolor: bg,
		color: fg,
		fontSize: 13,
		fontWeight: 800,
		display: 'flex',
		alignItems: 'center',
	}) as const

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
	'&:hover': { filter: 'brightness(0.98)' },
} as const

export default function LabPromoCards({ packages, tests, cart, onOpen, onToggleAll }: LabPromoCardsProps) {
	const biggest = [...packages].sort((a, b) => (b.tests ?? 0) - (a.tests ?? 0))[0]
	const maxOff = Math.max(0, ...packages.map((p) => (p.mrp > p.price && p.mrp > 0 ? Math.round((1 - p.price / p.mrp) * 100) : 0)))
	const diabetes = packages.find((p) => p.tags.includes('diabetes') && p.id !== biggest?.id) ?? packages.find((p) => p.tags.includes('diabetes'))
	const vitD = tests.find((t) => /vitamin\s*d/i.test(t.name))
	const b12 = tests.find((t) => /b[\s-]?12/i.test(t.name))
	const pair = vitD && b12 ? [vitD, b12] : null
	const pairAdded = !!pair && pair.every((t) => cart.includes(t.id))

	const cards = [
		biggest ? (
			<Box
				key="full"
				component="button"
				type="button"
				onClick={() => onOpen(biggest)}
				sx={{ ...cardSx, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${DESK.hero} 0%, #1E5459 100%)`, color: '#FFFFFF' }}
			>
				{maxOff > 0 ? (
					<Box component="span" sx={{ alignSelf: 'flex-start', p: '3px 8px', borderRadius: '6px', bgcolor: DESK.discountBadge, fontSize: 11, fontWeight: 800 }}>
						UP TO {maxOff}% OFF
					</Box>
				) : null}
				<Box component="b" sx={{ fontSize: 18, lineHeight: '24px' }}>
					{biggest.name}
				</Box>
				<Box component="span" sx={{ fontSize: 13, color: DESK.mintText }}>
					{biggest.tests ? `${biggest.tests} tests · ` : ''}from {inr(biggest.price)}
					{offLabel(biggest) ? ` · ${offLabel(biggest)}` : ''}
				</Box>
				<Box component="span" sx={cta('#FFFFFF', DESK.ink)}>
					View package
				</Box>
			</Box>
		) : null,
		diabetes ? (
			<Box key="diabetes" component="button" type="button" onClick={() => onOpen(diabetes)} sx={{ ...cardSx, bgcolor: DESK.lilacSoft, color: DESK.ink }}>
				<Box component="span" sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: DESK.lilac }}>
					DIABETES CARE
				</Box>
				<Box component="b" sx={{ fontSize: 17, lineHeight: '23px' }}>
					Know your sugar numbers
				</Box>
				<Box component="span" sx={{ fontSize: 13, color: '#4A3F6B' }}>
					{diabetes.name} for {inr(diabetes.price)}
				</Box>
				<Box component="span" sx={cta(DESK.lilac, '#FFFFFF')}>
					View package
				</Box>
			</Box>
		) : null,
		pair ? (
			<Box key="vitamins" component="button" type="button" onClick={() => onToggleAll(pair)} sx={{ ...cardSx, bgcolor: '#FDE8DC', color: DESK.ink }}>
				<Box component="span" sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: DESK.sand }}>
					VITAMIN CHECK
				</Box>
				<Box component="b" sx={{ fontSize: 17, lineHeight: '23px' }}>
					Low energy? Check D &amp; B12
				</Box>
				<Box component="span" sx={{ fontSize: 13, color: '#6B4A3A' }}>
					Both tests for {inr(pair[0].price + pair[1].price)}
				</Box>
				<Box component="span" sx={cta(DESK.sand, '#FFFFFF')}>
					{pairAdded ? 'Added' : 'Add both'}
				</Box>
			</Box>
		) : null,
	].filter(Boolean)

	if (cards.length === 0) return null
	// the cards slide one at a time like the native Home offers banner (auto-play every 4.5 s, pill dots)
	return <DashboardCarousel slides={cards} height={168} radius={18} autoPlay ariaLabel="Offers" />
}
