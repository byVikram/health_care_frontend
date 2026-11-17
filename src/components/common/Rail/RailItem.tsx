// src/components/common/Rail/RailItem.tsx
//
// One row of a left rail on the desktop pages: a tinted icon tile, a label (with an optional second line) and, at the end, either a
// count (My bookings' category rail) or a tick when chosen (the Schedule page's clinic switcher).
import { Box } from '@mui/material'
import DeskIcon from '../Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'

interface RailItemProps {
	label: string
	/** A second, smaller line under the label ("7 in-clinic today · 5–8 PM"). */
	sub?: string
	/** SVG path of the icon (DESK_ICONS). */
	icon: string
	tileBg: string
	tileInk: string
	selected: boolean
	onClick: () => void
	/** A number at the end of the row. */
	count?: number
	/** A tick at the end of the row while it is chosen. */
	tickWhenSelected?: boolean
	/** Background of the chosen row: white for the category rail, a light teal for the clinic list. */
	selectedBg?: string
	/** The taller category-rail row (44px, 30px tile) or the clinic-list row (32px tile, two lines). */
	size?: 'category' | 'clinic'
}

export default function RailItem({
	label,
	sub,
	icon,
	tileBg,
	tileInk,
	selected,
	onClick,
	count,
	tickWhenSelected = false,
	selectedBg = DESK.raised,
	size = 'category',
}: RailItemProps) {
	const category = size === 'category'
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
			aria-pressed={selected}
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: '10px',
				height: category ? 44 : 'auto',
				px: '10px',
				py: category ? 0 : '8px',
				border: 0,
				borderRadius: '10px',
				bgcolor: selected ? selectedBg : 'transparent',
				color: DESK.ink,
				textAlign: 'left',
				fontFamily: 'inherit',
				cursor: 'pointer',
				'&:hover': { bgcolor: selected ? selectedBg : DESK.page },
			}}
		>
			<Box
				component="span"
				sx={{
					flexShrink: 0,
					width: category ? 30 : 32,
					height: category ? 30 : 32,
					borderRadius: category ? '8px' : '9px',
					bgcolor: tileBg,
					color: tileInk,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<DeskIcon d={icon} />
			</Box>
			<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
				<Box component="span" sx={{ fontSize: 14, fontWeight: selected ? 800 : 600 }}>
					{label}
				</Box>
				{sub ? (
					<Box component="span" sx={{ fontSize: 11, color: DESK.muted }}>
						{sub}
					</Box>
				) : null}
			</Box>
			{count !== undefined ? (
				<Box component="span" sx={{ fontSize: 12, fontWeight: 700, color: DESK.muted }}>
					{count}
				</Box>
			) : null}
			{tickWhenSelected ? (
				<Box component="span" sx={{ display: 'flex', color: DESK.primary, opacity: selected ? 1 : 0 }}>
					<DeskIcon d={DESK_ICONS.tick} size={15} strokeWidth={2.8} />
				</Box>
			) : null}
		</Box>
	)
}
