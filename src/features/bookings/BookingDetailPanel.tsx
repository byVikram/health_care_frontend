// src/features/bookings/BookingDetailPanel.tsx
//
// The sticky panel on the right of My bookings: the chosen booking's photo / tile, kind, title, subtitle and status, a grey box of facts
// (When, Where / Delivery, For, Booking ID), a note (the server's preparation hint or why it was cancelled), the buttons and the
// booking's id. A booking with no web page (home care, lab) has no buttons, only a line saying it is managed in the app.
import { Box } from '@mui/material'
import AvatarTile from '../../components/common/Avatar/AvatarTile'
import DeskButton from '../../components/common/Button/DeskButton'
import FactList, { type Fact } from '../../components/common/FactList/FactList'
import StatusPill from '../../components/common/StatusPill/StatusPill'
import { buildS3Url } from '../../utils/s3'
import { DESK } from '../../styles/deskTokens'
import type { BookingItem } from './bookingsTypes'
import { categoryLook, noteColours, patientLabel, statusTone, whenLabel } from './bookingListUtils'
import type { PanelAction } from './useBookingActions'

interface BookingDetailPanelProps {
	item: BookingItem
	actions: PanelAction[]
	/** A small "View details" link under the buttons (an open appointment whose first button is Get directions). */
	onViewDetails: (() => void) | null
}

export default function BookingDetailPanel({ item, actions, onViewDetails }: BookingDetailPanelProps) {
	const look = categoryLook(item.category)
	const facts: Fact[] = []
	const when = whenLabel(item)
	if (when) facts.push({ label: 'When', value: when })
	if (item.where) facts.push({ label: item.category === 'pharmacy' ? 'Delivery' : 'Where', value: item.where })
	const forWhom = patientLabel(item)
	if (forWhom) facts.push({ label: 'For', value: forWhom.replace(/^For /, '') })
	if (item.ref) facts.push({ label: 'Booking ID', value: item.ref })
	const note = noteColours(item.category)

	return (
		<Box
			component="aside"
			sx={{
				flexShrink: 0,
				width: { xs: '100%', lg: 400 },
				position: { xs: 'static', lg: 'sticky' },
				top: 88,
				boxSizing: 'border-box',
				bgcolor: DESK.raised,
				border: `1px solid ${DESK.line}`,
				borderRadius: '16px',
				p: '22px',
				display: 'flex',
				flexDirection: 'column',
				gap: '18px',
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
				<AvatarTile
					src={buildS3Url(item.avatar_url) || undefined}
					icon={look.icon}
					size={56}
					radius={14}
					bg={look.tile.bg}
					ink={look.tile.ink}
				/>
				<Box
					component="span"
					sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}
				>
					<Box
						component="span"
						sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', color: look.tile.ink }}
					>
						{item.kind_label}
					</Box>
					<Box component="b" sx={{ fontSize: 19, lineHeight: '24px' }}>
						{item.title}
					</Box>
					{item.subtitle ? (
						<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
							{item.subtitle}
						</Box>
					) : null}
					<Box sx={{ alignSelf: 'flex-start', mt: '4px' }}>
						<StatusPill label={item.status.label} tone={statusTone(item.status)} />
					</Box>
				</Box>
			</Box>

			{facts.length > 0 ? <FactList facts={facts} /> : null}

			{item.note ? (
				<Box
					component="p"
					sx={{
						m: 0,
						p: '10px 12px',
						borderRadius: '10px',
						bgcolor: note.bg,
						color: note.fg,
						fontSize: 13,
						lineHeight: '18px',
						fontWeight: 700,
					}}
				>
					{item.note}
				</Box>
			) : null}

			{actions.length > 0 ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mt: 'auto' }}>
					{actions.map((action) => (
						<DeskButton
							key={action.key}
							label={action.label}
							kind={action.kind}
							icon={action.icon}
							href={action.href}
							external={!!action.href}
							onClick={action.run}
							loading={action.loading}
						/>
					))}
					{onViewDetails ? (
						<Box
							component="button"
							type="button"
							onClick={onViewDetails}
							sx={{
								alignSelf: 'center',
								p: '4px',
								border: 0,
								bgcolor: 'transparent',
								color: DESK.primary,
								fontFamily: 'inherit',
								fontSize: 13,
								fontWeight: 700,
								cursor: 'pointer',
							}}
						>
							View details
						</Box>
					) : null}
				</Box>
			) : (
				<Box
					component="p"
					sx={{
						m: 0,
						p: '12px 14px',
						borderRadius: '10px',
						bgcolor: DESK.page,
						color: DESK.muted,
						fontSize: 13,
					}}
				>
					Manage this booking in the Karolahealth app.
				</Box>
			)}

			{item.ref ? (
				<Box component="span" sx={{ fontSize: 12, color: DESK.faint, textAlign: 'center' }}>
					{item.ref}
				</Box>
			) : null}
		</Box>
	)
}
