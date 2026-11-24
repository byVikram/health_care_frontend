// src/features/lab/components/LabAddButton.tsx
//
// The "Add" / "Added" button on a test or package card (and "Add to cart" / "Remove from cart" in the details drawer): teal outline
// when the item is not in the cart, filled teal when it is.
import { Box } from '@mui/material'
import { DESK } from '../../../styles/deskTokens'

interface LabAddButtonProps {
	added: boolean
	onClick: () => void
	/** Overrides the label pair ([not in cart, in cart]). */
	labels?: [string, string]
	height?: number
	minWidth?: number
	/** Which item it is for (read out by screen readers). */
	name?: string
}

export default function LabAddButton({
	added,
	onClick,
	labels = ['Add', 'Added'],
	height = 40,
	minWidth = 104,
	name,
}: LabAddButtonProps) {
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
			aria-pressed={added}
			aria-label={name ? `${added ? 'Remove' : 'Add'} ${name} ${added ? 'from' : 'to'} cart` : undefined}
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
