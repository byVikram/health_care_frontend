// src/features/lab/components/LabWhereSection.tsx
//
// Step 2 of the cart page: Home visit or Visit a lab, the patient's saved addresses (the lab checks run against the chosen one) with
// "Type an address", the availability line for that address, and below it whatever the page puts there (the list of labs).
import { Box, CircularProgress } from '@mui/material'
import type { ReactNode } from 'react'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import AppSegmentedToggle, { type SegmentedToggleOption } from '../../../components/common/Switch/AppSegmentedToggle'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import type { LabWhere } from '../labBookingStore'
import { addressLineOf, type BookingAddress } from '../../booking/useBookingAddresses'
import { choiceSx } from '../../booking/bookingStyles'
import CartSection, { RadioDot } from '../../booking/CartSection'

const WORK = 'M4 7h16v13H4zM9 7V4h6v3'

/** What the availability check says: shown as a line under the addresses. */
export type LabAvailabilityStatus = {
	kind: 'info' | 'loading' | 'error' | 'warn' | 'ok'
	text: string
	onRetry?: () => void
}

const OPTIONS: SegmentedToggleOption<LabWhere>[] = [
	{ value: 'home', label: 'Home visit' },
	{ value: 'lab', label: 'Visit a lab' },
]

interface LabWhereSectionProps {
	where: LabWhere
	onWhere: (where: LabWhere) => void
	addresses: BookingAddress[]
	addressesLoading: boolean
	addressId: string | null
	onAddress: (address: BookingAddress) => void
	onAddAddress: () => void
	/** Asks the browser for the position and starts a new address from it. */
	onUseCurrentLocation: () => void
	locating?: boolean
	status: LabAvailabilityStatus | null
	children?: ReactNode
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

export default function LabWhereSection({
	where,
	onWhere,
	addresses,
	addressesLoading,
	addressId,
	onAddress,
	onAddAddress,
	onUseCurrentLocation,
	locating = false,
	status,
	children,
}: LabWhereSectionProps) {
	const isHome = where === 'home'
	const bad = status?.kind === 'warn' || status?.kind === 'error'
	return (
		<CartSection
			step={2}
			title="Where should we collect the sample?"
			sub="Home collection is free. Or walk in at a lab near you."
		>
			{/* in a row, so it is as wide as its two options (the section stacks its children full-width) */}
			<Box sx={{ display: 'flex' }}>
				<AppSegmentedToggle variant="pill" fullWidth={false} equalWidth value={where} onChange={onWhere} options={OPTIONS} />
			</Box>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
					<Box component="span" sx={{ flexGrow: 1, fontSize: 14, fontWeight: 800 }}>
						{isHome ? 'Collection address' : 'Your address (labs near it are shown below)'}
					</Box>
					<Box
						component="button"
						type="button"
						onClick={onUseCurrentLocation}
						disabled={locating}
						sx={actionButtonSx}
					>
						<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
							<DeskIcon d={DESK_ICONS.gps} size={15} strokeWidth={2.2} />
						</Box>
						{locating ? 'Finding you...' : 'Use current location'}
					</Box>
					<Box component="button" type="button" onClick={onAddAddress} sx={actionButtonSx}>
						<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
							<DeskIcon d={DESK_ICONS.plus} size={15} strokeWidth={2.4} />
						</Box>
						Type an address
					</Box>
				</Box>
				{addresses.length > 0 ? (
					<Box
						role="radiogroup"
						aria-label="Address"
						sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: '10px' }}
					>
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
									sx={{
										...choiceSx(on),
										p: '14px',
										borderRadius: '12px',
										display: 'flex',
										alignItems: 'flex-start',
										gap: '10px',
									}}
								>
									<Box component="span" sx={{ display: 'flex', color: DESK.primary, mt: '1px' }}>
										<DeskIcon d={/work/i.test(a.label) ? WORK : DESK_ICONS.home} size={18} />
									</Box>
									<Box
										component="span"
										sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
									>
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
				) : addressesLoading ? (
					<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
						Loading your addresses…
					</Box>
				) : (
					<Box
						component="span"
						sx={{
							p: '14px',
							borderRadius: '12px',
							border: `1.5px dashed ${DESK.field}`,
							fontSize: 14,
							color: DESK.muted,
						}}
					>
						You have no saved address yet. Add one to see what is available near you.
					</Box>
				)}
			</Box>

			{status ? (
				<Box
					role="status"
					aria-live="polite"
					sx={{
						p: '10px 12px',
						borderRadius: '10px',
						bgcolor: bad ? DESK.warningSoft : status.kind === 'ok' ? DESK.successSoft : DESK.page,
						color: bad ? DESK.warning : status.kind === 'ok' ? DESK.success : DESK.muted,
						fontSize: 13,
						lineHeight: '18px',
						fontWeight: 600,
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
					}}
				>
					{status.kind === 'loading' ? (
						<CircularProgress size={14} thickness={5} sx={{ color: 'inherit' }} />
					) : null}
					<Box component="span" sx={{ flexGrow: 1 }}>
						{status.text}
					</Box>
					{status.onRetry ? (
						<Box
							component="button"
							type="button"
							onClick={status.onRetry}
							sx={{
								border: 0,
								p: 0,
								bgcolor: 'transparent',
								color: 'inherit',
								fontFamily: 'inherit',
								fontSize: 13,
								fontWeight: 800,
								textDecoration: 'underline',
								cursor: 'pointer',
							}}
						>
							Retry
						</Box>
					) : null}
				</Box>
			) : null}
			{children}
		</CartSection>
	)
}
