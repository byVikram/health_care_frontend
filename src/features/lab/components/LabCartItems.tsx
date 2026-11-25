// src/features/lab/components/LabCartItems.tsx
//
// "Tests in your cart" on the cart page: each item with its price at the chosen (or cheapest) lab, a Remove button, and "Add more tests".
import { Box } from '@mui/material'
import { Link } from 'react-router-dom'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { ROUTES } from '../../../constants/routes'
import { DESK, DESK_ICONS, DESK_TILES } from '../../../styles/deskTokens'
import { labBooking } from '../labBookingStore'
import { LAB_ICONS, type LabItem } from '../labConstants'
import { inr } from '../../booking/bookingFormat'
import { fastingKnown } from '../labStyles'
import CartSection from '../../booking/CartSection'

/** One cart line: the item, with the price it has at the lab shown (`price` / `mrp` replace the catalogue's "from" price). */
export type LabCartLine = { item: LabItem; price: number; mrp: number; fromPrice: boolean }

const metaOf = (item: LabItem) =>
	[
		item.tests ? `${item.tests} tests` : item.sample,
		item.report,
		fastingKnown(item) ? (item.fasting ? `${item.fastingLabel ?? ''} fasting`.trim() : 'No fasting') : null,
	]
		.filter(Boolean)
		.join(' · ')

export default function LabCartItems({ lines }: { lines: LabCartLine[] }) {
	return (
		<CartSection
			title="Tests in your cart"
			right={
				<Box
					component={Link}
					to={ROUTES.LAB.HOME}
					sx={{ fontSize: 14, fontWeight: 800, textDecoration: 'none', color: DESK.primary, display: 'flex', alignItems: 'center', gap: '4px' }}
				>
					<DeskIcon d={DESK_ICONS.plus} size={15} strokeWidth={2.4} />
					Add more tests
				</Box>
			}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column' }}>
				{lines.map(({ item, price, mrp, fromPrice }) => {
					const tile = item.kind === 'package' ? DESK_TILES.all : DESK_TILES.lab
					return (
						<Box
							key={item.id}
							sx={{ display: 'flex', alignItems: 'center', gap: '12px', py: '12px', borderBottom: `1px solid ${DESK.lineSoft}`, '&:last-of-type': { borderBottom: 0 } }}
						>
							<Box
								component="span"
								sx={{
									width: 40,
									height: 40,
									flexShrink: 0,
									borderRadius: '11px',
									bgcolor: tile.bg,
									color: tile.ink,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<DeskIcon d={item.kind === 'package' ? LAB_ICONS.package : LAB_ICONS.flask} size={20} />
							</Box>
							<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
								<Box component="b" sx={{ fontSize: 15 }}>
									{item.name}
								</Box>
								<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
									{metaOf(item)}
								</Box>
							</Box>
							<Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
								<Box component="b" sx={{ fontSize: 15 }}>
									{fromPrice ? 'From ' : ''}
									{inr(price)}
								</Box>
								{mrp > price ? (
									<Box component="s" sx={{ fontSize: 12, color: DESK.faint }}>
										{inr(mrp)}
									</Box>
								) : null}
							</Box>
							<Box
								component="button"
								type="button"
								onClick={() => labBooking.removeItem(item.id)}
								aria-label={`Remove ${item.name}`}
								sx={{
									height: 34,
									px: '12px',
									borderRadius: '9px',
									border: `1px solid ${DESK.lineStrong}`,
									bgcolor: DESK.raised,
									color: DESK.inkSoft,
									fontFamily: 'inherit',
									fontSize: 13,
									fontWeight: 700,
									cursor: 'pointer',
								}}
							>
								Remove
							</Box>
						</Box>
					)
				})}
			</Box>
		</CartSection>
	)
}
