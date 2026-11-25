// src/features/nursing/components/NursingWhereSection.tsx
//
// Step 2 of the booking page: where the nurse comes. The patient's saved addresses (the default first), and
// "Add an address". The nurse is matched by distance, so an address needs a position: a saved one without it uses the browser's location
// when the booking is made (see useVisitAddress.ts).
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import CartSection, { RadioDot } from '../../booking/CartSection'
import { addressLineOf, type BookingAddress } from '../../booking/useBookingAddresses'
import { choiceSx } from '../../booking/bookingStyles'
import { useCareService } from '../useCareService'

const WORK = 'M4 7h16v13H4zM9 7V4h6v3'

interface NursingWhereSectionProps {
	addresses: BookingAddress[]
	loading: boolean
	error: string | null
	addressId: string | null
	onAddress: (address: BookingAddress) => void
	onAddAddress: () => void
}

const actionButtonSx = {
	height: 36,
	px: '12px',
	borderRadius: '10px',
	border: `1.5px solid ${DESK.lineStrong}`,
	bgcolor: DESK.raised,
	color: DESK.ink,
	fontFamily: 'inherit',
	fontSize: 13,
	fontWeight: 700,
	display: 'flex',
	alignItems: 'center',
	gap: '6px',
	cursor: 'pointer',
	'&:disabled': { opacity: 0.6, cursor: 'default' },
} as const

export default function NursingWhereSection({ addresses, loading, error, addressId, onAddress, onAddAddress }: NursingWhereSectionProps) {
	const care = useCareService()
	return (
		<CartSection step={2} title={`Where should the ${care.noun} come?`} sub={`The ${care.noun} visits this address. Choose a saved one or add a new one.`}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
				<Box component="span" sx={{ flexGrow: 1, fontSize: 14, fontWeight: 800 }}>
					Visit address
				</Box>
				<Box component="button" type="button" onClick={onAddAddress} sx={actionButtonSx}>
					<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
						<DeskIcon d={DESK_ICONS.plus} size={15} strokeWidth={2.4} />
					</Box>
					Add an address
				</Box>
			</Box>
			{addresses.length > 0 ? (
				<Box role="radiogroup" aria-label="Address" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: '10px' }}>
					{addresses.map((a) => {
						const on = a.id === addressId
						return (
							<Box
								key={a.id}
								component="button"
								type="button"
								role="radio"
								aria-checked={on}
								onClick={() => onAddress(a)}
								sx={{ ...choiceSx(on), p: '14px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}
							>
								<Box component="span" sx={{ display: 'flex', color: DESK.primary, mt: '1px' }}>
									<DeskIcon d={/work/i.test(a.label) ? WORK : DESK_ICONS.home} size={18} />
								</Box>
								<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
									<Box component="b" sx={{ fontSize: 14 }}>
										{a.label}
									</Box>
									<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
										{addressLineOf(a)}
									</Box>
								</Box>
								<RadioDot on={on} size={20} />
							</Box>
						)
					})}
				</Box>
			) : loading ? (
				<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
					Loading your addresses…
				</Box>
			) : (
				<Box component="span" sx={{ p: '14px', borderRadius: '12px', border: `1.5px dashed ${DESK.field}`, fontSize: 14, color: DESK.muted }}>
					You have no saved address yet. Add one so a {care.noun} can come to you.
				</Box>
			)}
			{error ? (
				<Box role="status" sx={{ p: '10px 12px', borderRadius: '10px', bgcolor: DESK.warningSoft, color: DESK.warning, fontSize: 13, fontWeight: 600 }}>
					{error}
				</Box>
			) : null}
		</CartSection>
	)
}
