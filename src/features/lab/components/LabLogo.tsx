// src/features/lab/components/LabLogo.tsx
//
// A lab's logo in a rounded tile; the flask icon stands in when the lab has none (or the picture does not load).
import { Box } from '@mui/material'
import { useState } from 'react'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_TILES } from '../../../styles/deskTokens'
import { LAB_ICONS } from '../labConstants'

interface LabLogoProps {
	url?: string | null
	size?: number
}

export default function LabLogo({ url, size = 42 }: LabLogoProps) {
	const [failed, setFailed] = useState(false)
	const tile = DESK_TILES.lab
	return (
		<Box
			aria-hidden="true"
			sx={{
				width: size,
				height: size,
				flexShrink: 0,
				borderRadius: '12px',
				overflow: 'hidden',
				bgcolor: url && !failed ? '#FFFFFF' : tile.bg,
				color: tile.ink,
				border: url && !failed ? `1px solid ${DESK.cardLine}` : 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{url && !failed ? (
				<Box
					component="img"
					src={url}
					alt=""
					onError={() => setFailed(true)}
					sx={{ width: '100%', height: '100%', objectFit: 'contain', p: '4px', boxSizing: 'border-box' }}
				/>
			) : (
				<DeskIcon d={LAB_ICONS.flask} size={Math.round(size * 0.5)} />
			)}
		</Box>
	)
}
