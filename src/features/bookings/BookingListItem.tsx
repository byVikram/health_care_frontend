// src/features/bookings/BookingListItem.tsx
//
// One booking row of the My bookings list: the doctor's photo or a tinted category tile, the kind (small capitals in the category's
// colour), the title, "when · where", the status chip and a chevron. The chosen row has a teal outline.
import { Box } from '@mui/material'
import AvatarTile from '../../components/common/Avatar/AvatarTile'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import StatusPill from '../../components/common/StatusPill/StatusPill'
import { buildS3Url } from '../../utils/s3'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import type { BookingItem } from './bookingsTypes'
import { categoryLook, statusTone, whenLabel } from './bookingListUtils'

interface BookingListItemProps {
	item: BookingItem
	selected: boolean
	onSelect: () => void
}

const ellipsis = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as const

export default function BookingListItem({ item, selected, onSelect }: BookingListItemProps) {
	const look = categoryLook(item.category)
	const meta = [whenLabel(item), item.where].filter(Boolean).join(' · ')
	return (
		<Box
			component="button"
			type="button"
			onClick={onSelect}
			aria-pressed={selected}
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: '12px',
				p: '14px',
				borderRadius: '14px',
				border: `1.5px solid ${selected ? DESK.primary : DESK.line}`,
				bgcolor: DESK.raised,
				boxShadow: selected ? '0 0 0 3px #2B6F7122' : 'none',
				color: DESK.ink,
				textAlign: 'left',
				fontFamily: 'inherit',
				cursor: 'pointer',
				width: '100%',
			}}
		>
			<AvatarTile
				src={buildS3Url(item.avatar_url) || undefined}
				icon={look.icon}
				size={44}
				radius={12}
				bg={look.tile.bg}
				ink={look.tile.ink}
			/>
			<Box
				component="span"
				sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}
			>
				<Box
					component="span"
					sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', color: look.tile.ink, ...ellipsis }}
				>
					{item.kind_label}
				</Box>
				<Box component="b" sx={{ fontSize: 15, lineHeight: '20px', ...ellipsis }}>
					{item.title}
				</Box>
				{meta ? (
					<Box component="span" sx={{ fontSize: 13, color: DESK.muted, ...ellipsis }}>
						{meta}
					</Box>
				) : null}
			</Box>
			<StatusPill label={item.status.label} tone={statusTone(item.status)} />
			<Box component="span" sx={{ flexShrink: 0, display: 'flex', color: DESK.fainter }}>
				<DeskIcon d={DESK_ICONS.chevronRight} />
			</Box>
		</Box>
	)
}
