// src/components/common/SectionLabel/SectionLabel.tsx
//
// The small spaced capitals above a group ("CATEGORY", "TODAY", "UP NEXT · 7"). With `onToggle` it is a button that folds the group
// ("EARLIER TODAY · 5 ⌄").
import { Box } from '@mui/material'
import DeskIcon from '../Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'

interface SectionLabelProps {
	label: string
	/** Makes the label a fold / unfold button. */
	onToggle?: () => void
	expanded?: boolean
}

const textSx = { fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: DESK.muted }

export default function SectionLabel({ label, onToggle, expanded = false }: SectionLabelProps) {
	if (!onToggle) {
		return (
			<Box component="span" sx={{ ...textSx, pt: '6px' }}>
				{label}
			</Box>
		)
	}
	return (
		<Box
			component="button"
			type="button"
			onClick={onToggle}
			aria-expanded={expanded}
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: '8px',
				pt: '10px',
				pb: '4px',
				px: '2px',
				border: 0,
				bgcolor: 'transparent',
				fontFamily: 'inherit',
				cursor: 'pointer',
			}}
		>
			<Box component="span" sx={textSx}>
				{label}
			</Box>
			<Box component="span" sx={{ display: 'flex', color: DESK.muted, transform: `rotate(${expanded ? 180 : 0}deg)` }}>
				<DeskIcon d={DESK_ICONS.chevronDown} size={14} strokeWidth={2.4} />
			</Box>
		</Box>
	)
}
