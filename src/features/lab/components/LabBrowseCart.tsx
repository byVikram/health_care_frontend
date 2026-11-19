// src/features/lab/components/LabBrowseCart.tsx
//
// The sticky "Your cart" card on the right of the browse page: the items (remove with ×), the price lines, a fasting note and the
// "Choose slot & book" button. Reads the booking store, so it stays in step with the cart page.
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { ROUTES } from '../../../constants/routes'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import { labBooking, totalsOf, useLabBooking } from '../labBookingStore'
import { inr, plural } from '../labFormat'
import { LAB_CARD, fastingKnown } from '../labStyles'

export default function LabBrowseCart() {
	const navigate = useNavigate()
	const booking = useLabBooking()
	const { items, total, mrp, savings } = totalsOf(booking)
	const fasting = items.filter((i) => fastingKnown(i) && i.fasting)

	return (
		<Box
			component="aside"
			aria-label="Your cart"
			sx={{
				...LAB_CARD,
				position: 'sticky',
				top: 20,
				width: 320,
				flexShrink: 0,
				p: '20px',
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				gap: '14px',
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<Box component="b" sx={{ flexGrow: 1, fontSize: 18 }}>
					Your cart
				</Box>
				<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
					{plural(items.length, 'item', 'items')}
				</Box>
			</Box>
			{items.length === 0 ? (
				<Box
					sx={{
						p: '24px 8px',
						borderRadius: '14px',
						bgcolor: DESK.page,
						textAlign: 'center',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '6px',
					}}
				>
					<Box component="span" sx={{ display: 'flex', color: DESK.fainter }}>
						<DeskIcon d={DESK_ICONS.cart} size={28} />
					</Box>
					<Box component="b" sx={{ fontSize: 14 }}>
						Your cart is empty
					</Box>
					<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
						Add a test or package to book a home collection.
					</Box>
				</Box>
			) : (
				<>
					<Box sx={{ display: 'flex', flexDirection: 'column' }}>
						{items.map((item) => (
							<Box
								key={item.id}
								sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px', py: '10px', borderBottom: `1px solid ${DESK.lineSoft}` }}
							>
								<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
									<Box component="b" sx={{ fontSize: 14, lineHeight: '19px' }}>
										{item.name}
									</Box>
									<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
										{item.mrp > item.price ? (
											<>
												<s>{inr(item.mrp)}</s> ·{' '}
											</>
										) : null}
										{item.report}
									</Box>
								</Box>
								<Box component="b" sx={{ fontSize: 14 }}>
									{inr(item.price)}
								</Box>
								<Box
									component="button"
									type="button"
									onClick={() => labBooking.removeItem(item.id)}
									aria-label={`Remove ${item.name}`}
									sx={{
										width: 26,
										height: 26,
										border: 0,
										borderRadius: '8px',
										bgcolor: DESK.chip,
										color: DESK.inkSoft,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
									}}
								>
									<DeskIcon d={DESK_ICONS.close} size={12} strokeWidth={2.6} />
								</Box>
							</Box>
						))}
					</Box>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 14 }}>
						<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.muted }}>
							<span>Price ({plural(items.length, 'item', 'items')})</span>
							{savings > 0 ? <s>{inr(mrp)}</s> : <span>{inr(mrp)}</span>}
						</Box>
						{savings > 0 ? (
							<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.success }}>
								<span>Discount</span>
								<b>−{inr(savings)}</b>
							</Box>
						) : null}
						<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.muted }}>
							<span>Home collection</span>
							<Box component="b" sx={{ color: DESK.success }}>
								Free
							</Box>
						</Box>
						<Box
							component="span"
							sx={{ display: 'flex', justifyContent: 'space-between', pt: '10px', borderTop: `1px dashed ${DESK.lineStrong}`, fontSize: 17 }}
						>
							<b>Total</b>
							<b>{inr(total)}</b>
						</Box>
					</Box>
					{fasting.length > 0 ? (
						<Box
							component="span"
							sx={{ p: '10px 12px', borderRadius: '10px', bgcolor: DESK.warningSoft, color: DESK.warning, fontSize: 13, lineHeight: '18px', display: 'flex', gap: '8px' }}
						>
							<Box component="span" sx={{ display: 'flex', flexShrink: 0 }}>
								<DeskIcon d={DESK_ICONS.clock} size={16} />
							</Box>
							Fasting needed for {fasting.map((i) => i.name.split(' (')[0]).join(', ')}. Book a morning slot.
						</Box>
					) : null}
					<Box
						component="button"
						type="button"
						onClick={() => navigate(ROUTES.LAB.CART)}
						sx={{
							height: 50,
							px: '20px',
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
						}}
					>
						Choose slot &amp; book
						<DeskIcon d={DESK_ICONS.chevronRight} size={16} strokeWidth={2.4} />
					</Box>
					{savings > 0 ? (
						<Box component="span" sx={{ textAlign: 'center', fontSize: 12, color: DESK.success, fontWeight: 700 }}>
							You save {inr(savings)} on this order
						</Box>
					) : null}
				</>
			)}
		</Box>
	)
}
