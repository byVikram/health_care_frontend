// src/components/common/Avatar/AvatarTile.tsx
//
// A square (rounded) or round tile with a photo, else the person's initials, else a tinted icon: the doctor / order tile of a booking
// row (44px square) and the patient circle of a schedule row (38px round).
import { Box } from '@mui/material'
import DeskIcon from '../Icon/DeskIcon'
import { DESK } from '../../../styles/deskTokens'

interface AvatarTileProps {
	src?: string | null
	alt?: string
	/** Shown when there is no photo and no icon ("RT"). */
	initials?: string
	/** SVG path of an icon (DESK_ICONS), shown when there is no photo. */
	icon?: string
	size?: number
	/** Corner radius in px; 'round' makes a circle. */
	radius?: number | 'round'
	bg?: string
	ink?: string
}

export default function AvatarTile({
	src,
	alt = '',
	initials,
	icon,
	size = 44,
	radius = 12,
	bg = DESK.primarySoft,
	ink = DESK.primary,
}: AvatarTileProps) {
	const corner = radius === 'round' ? '9999px' : `${radius}px`
	if (src) {
		return (
			<Box
				component="img"
				src={src}
				alt={alt}
				width={size}
				height={size}
				sx={{ flexShrink: 0, width: size, height: size, borderRadius: corner, objectFit: 'cover', bgcolor: bg }}
			/>
		)
	}
	return (
		<Box
			component="span"
			sx={{
				flexShrink: 0,
				width: size,
				height: size,
				borderRadius: corner,
				bgcolor: bg,
				color: ink,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: Math.round(size * 0.34),
				fontWeight: 800,
			}}
		>
			{icon ? <DeskIcon d={icon} size={Math.round(size * 0.45)} /> : initials}
		</Box>
	)
}
