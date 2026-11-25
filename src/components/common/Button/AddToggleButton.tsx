// src/components/common/Button/AddToggleButton.tsx
//
// The "Add" / "Added" toggle of a card or details drawer (Lab tests, home-care services): teal outline
// when the item is not in the cart (or booking), filled teal when it is.
import { Box } from '@mui/material'
import { DESK } from '../../../styles/deskTokens'

interface AddToggleButtonProps {
	added: boolean
	onClick: () => void
	/** Overrides the label pair ([not in cart, in cart]). */
	labels?: [string, string]
	height?: number
	minWidth?: number
	/** Which item it is for (read out by screen readers). */
	name?: string
	/** What the item goes into, for the accessible label: "cart" (Lab tests) or "booking" (home care). */
	noun?: string
}

export default function AddToggleButton({
	added,
	onClick,
	labels = ['Add', 'Added'],
	height = 40,
	minWidth = 104,
	name,
	noun = 'cart',
}: AddToggleButtonProps) {
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
			aria-pressed={added}
			aria-label={name ? `${added ? 'Remove' : 'Add'} ${name} ${added ? 'from' : 'to'} ${noun}` : undefined}
			sx={{
				height,
				minWidth,
				px: height > 40 ? '22px' : '16px',
				borderRadius: height > 40 ? '12px' : '10px',
				border: `1.5px solid ${DESK.primary}`,
				bgcolor: added ? DESK.primary : DESK.raised,
				color: added ? '#FFFFFF' : DESK.primary,
				fontFamily: 'inherit',
				fontSize: height > 40 ? 15 : 14,
				fontWeight: 800,
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: '6px',
				cursor: 'pointer',
				whiteSpace: 'nowrap',
				'&:hover': { filter: 'brightness(0.97)' },
			}}
		>
			{added ? labels[1] : labels[0]}
		</Box>
	)
}
