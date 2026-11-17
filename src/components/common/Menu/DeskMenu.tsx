// src/components/common/Menu/DeskMenu.tsx
//
// The three-dots button and the menu it opens: every item has a tinted icon tile, a title and a second line ("Ask to reschedule /
// Patient picks a new slot"). Used on the Schedule page's rows and request cards.
import { Box, Menu } from '@mui/material'
import { useState, type MouseEvent } from 'react'
import DeskIcon, { DotsIcon } from '../Icon/DeskIcon'
import { DESK } from '../../../styles/deskTokens'

export interface DeskMenuItem {
	key: string
	label: string
	/** The second line. */
	sub?: string
	/** SVG path of the icon (DESK_ICONS). */
	icon: string
	/** Tile colours behind the icon. */
	tileBg: string
	tileInk: string
	/** Red label (a destructive choice). */
	danger?: boolean
	/** Greyed out; still clickable so the page can say why it is not available. */
	dimmed?: boolean
	onSelect: () => void
}

interface DeskMenuProps {
	items: DeskMenuItem[]
	ariaLabel: string
	/** A bare button without the grey outline (inside a request card). */
	bare?: boolean
}

export default function DeskMenu({ items, ariaLabel, bare = false }: DeskMenuProps) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null)
	const open = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)
	const close = () => setAnchor(null)

	return (
		<>
			<Box
				component="button"
				type="button"
				onClick={open}
				aria-haspopup="menu"
				aria-expanded={!!anchor}
				aria-label={ariaLabel}
				sx={{
					width: bare ? 30 : 34,
					height: bare ? 30 : 34,
					borderRadius: '9px',
					border: bare ? 0 : `1px solid ${DESK.lineStrong}`,
					bgcolor: DESK.raised,
					color: DESK.ink,
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
					flexShrink: 0,
				}}
			>
				<DotsIcon />
			</Box>
			<Menu
				anchorEl={anchor}
				open={!!anchor}
				onClose={close}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{
					paper: {
						sx: {
							mt: '4px',
							width: 270,
							p: '6px',
							borderRadius: '12px',
							border: '1px solid #E3EAEB',
							boxShadow: DESK.shadowMenu,
						},
					},
					list: { sx: { p: 0, display: 'flex', flexDirection: 'column', gap: '2px' } },
				}}
			>
				{items.map((item) => (
					<Box
						key={item.key}
						component="button"
						type="button"
						role="menuitem"
						onClick={() => {
							close()
							item.onSelect()
						}}
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
							p: '8px 10px',
							border: 0,
							borderRadius: '8px',
							bgcolor: 'transparent',
							color: item.danger ? DESK.danger : DESK.ink,
							textAlign: 'left',
							fontFamily: 'inherit',
							opacity: item.dimmed ? 0.5 : 1,
							cursor: 'pointer',
							'&:hover': { bgcolor: DESK.page },
						}}
					>
						<Box
							component="span"
							sx={{
								flexShrink: 0,
								width: 28,
								height: 28,
								borderRadius: '8px',
								bgcolor: item.tileBg,
								color: item.tileInk,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<DeskIcon d={item.icon} size={14} />
						</Box>
						<Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
							<Box component="b" sx={{ fontSize: 13 }}>
								{item.label}
							</Box>
							{item.sub ? (
								<Box component="span" sx={{ fontSize: 11, color: DESK.muted }}>
									{item.sub}
								</Box>
							) : null}
						</Box>
					</Box>
				))}
			</Menu>
		</>
	)
}
