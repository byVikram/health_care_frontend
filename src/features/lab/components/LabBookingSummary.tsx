// src/features/lab/components/LabBookingSummary.tsx
//
// The sticky "Booking summary" on the right of the cart page: For / Where / When (a missing one reads red), the price lines and the
// "Continue to payment" button, which says what is still missing while the booking is not complete.
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import { LAB_ICONS } from '../labConstants'
import { inr, plural } from '../../booking/bookingFormat'
import { BOOKING_CARD } from '../../booking/bookingStyles'

interface SummaryRow {
	icon: string
	label: string
	/** null = not chosen yet: `missing` is shown in red instead. */
	value: string | null
	missing: string
}

interface LabBookingSummaryProps {
	forWho: string | null
	where: string | null
	when: string | null
	isHome: boolean
	count: number
	mrp: number
	savings: number
	total: number
	/** Why the booking cannot continue yet ('' = it can). */
	blocker: string
	onContinue: () => void
}

export default function LabBookingSummary({
	forWho,
	where,
	when,
	isHome,
	count,
	mrp,
	savings,
	total,
	blocker,
	onContinue,
}: LabBookingSummaryProps) {
	const rows: SummaryRow[] = [
		{ icon: DESK_ICONS.user, label: 'For', value: forWho, missing: 'Choose who it is for' },
		{
			icon: isHome ? LAB_ICONS.home : LAB_ICONS.clinic,
			label: 'Where',
			value: where,
			missing: isHome ? 'Choose an address' : 'Choose a lab',
		},
		{ icon: DESK_ICONS.calendar, label: 'When', value: when, missing: 'Pick a time' },
	]
	const ready = !blocker
	return (
		<Box
			component="aside"
			aria-label="Booking summary"
			sx={{
				...BOOKING_CARD,
				position: 'sticky',
				top: 20,
				width: { xs: '100%', lg: 380 },
				flexShrink: 0,
				p: '22px',
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				gap: '16px',
			}}
		>
			<Box component="b" sx={{ fontSize: 18 }}>
				Booking summary
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', borderRadius: '14px', bgcolor: DESK.page, overflow: 'hidden' }}>
				{rows.map((r, i) => (
					<Box
						key={r.label}
						sx={{ display: 'flex', alignItems: 'center', gap: '12px', p: '12px 14px', borderTop: i > 0 ? `1px solid ${DESK.raised}` : 0 }}
					>
						<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
							<DeskIcon d={r.icon} size={18} />
						</Box>
						<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
							<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
								{r.label}
							</Box>
							<Box component="b" sx={{ fontSize: 14, color: r.value ? DESK.ink : DESK.danger }}>
								{r.value ?? r.missing}
							</Box>
						</Box>
					</Box>
				))}
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 14 }}>
				<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.muted }}>
					<span>Price ({plural(count, 'item', 'items')})</span>
					{savings > 0 ? <s>{inr(mrp)}</s> : <span>{inr(mrp)}</span>}
				</Box>
				{savings > 0 ? (
					<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.success }}>
						<span>Discount</span>
						<b>−{inr(savings)}</b>
					</Box>
				) : null}
				{isHome ? (
					<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.muted }}>
						<span>Home collection</span>
						<Box component="b" sx={{ color: DESK.success }}>
							Free
						</Box>
					</Box>
				) : null}
				<Box
					component="span"
					sx={{ display: 'flex', justifyContent: 'space-between', pt: '10px', borderTop: `1px dashed ${DESK.lineStrong}`, fontSize: 17 }}
				>
					<b>To pay</b>
					<b>{inr(total)}</b>
				</Box>
			</Box>
			<Box
				component="button"
				type="button"
				onClick={ready ? onContinue : undefined}
				aria-disabled={!ready}
				sx={{
					height: 50,
					px: '20px',
					border: 0,
					borderRadius: '12px',
					bgcolor: ready ? DESK.primary : DESK.primaryDisabled,
					color: '#FFFFFF',
					fontFamily: 'inherit',
					fontSize: 15,
					fontWeight: 800,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '8px',
					cursor: ready ? 'pointer' : 'not-allowed',
					'&:hover': { filter: ready ? 'brightness(0.97)' : 'none' },
				}}
			>
				{ready ? 'Continue to payment' : blocker}
			</Box>
		</Box>
	)
}
