// src/components/common/SearchField/SearchField.tsx
//
// The rounded search box of the desktop pages (magnifier + text input).
import { Box } from '@mui/material'
import type { ChangeEvent } from 'react'
import DeskIcon from '../Icon/DeskIcon'
import VoiceMicButton from '../Voice/VoiceMicButton'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'

interface SearchFieldProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	ariaLabel?: string
	width?: number | string
	/** Shows a mic: the spoken text becomes the search text. */
	voice?: boolean
}

export default function SearchField({ value, onChange, placeholder, ariaLabel, width = 320, voice = false }: SearchFieldProps) {
	return (
		<Box
			component="label"
			sx={{
				width,
				height: 42,
				boxSizing: 'border-box',
				px: '12px',
				borderRadius: '10px',
				border: `1px solid ${DESK.field}`,
				bgcolor: DESK.raised,
				display: 'flex',
				alignItems: 'center',
				gap: '8px',
				color: DESK.muted,
				'&:focus-within': { borderColor: DESK.primary, boxShadow: '0 0 0 3px #2B6F711F' },
			}}
		>
			<DeskIcon d={DESK_ICONS.search} />
			<Box
				component="input"
				type="search"
				value={value}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
				placeholder={placeholder}
				aria-label={ariaLabel ?? placeholder}
				sx={{
					flexGrow: 1,
					minWidth: 0,
					height: 38,
					border: 0,
					outline: 'none',
					bgcolor: 'transparent',
					fontFamily: 'inherit',
					fontSize: 14,
					color: DESK.ink,
					'&::placeholder': { color: DESK.faint },
				}}
			/>
			{voice ? <VoiceMicButton onResult={onChange} iconSize={18} sx={{ mr: '-6px' }} /> : null}
		</Box>
	)
}
