// src/features/dashboard/TherapeuticSelectorModal.tsx
import rehabilitationIcon from '../../../assets/therapeutic/rehabilitation.png'
import specializedServiceIcon from '../../../assets/therapeutic/specialized-service.png'
import CardGridSelectorModal, { SelectorCardItem } from './CardGridSelectorModal'

interface TherapeuticSelectorModalProps {
	open: boolean
	onClose: () => void
}

const THERAPEUTIC_CARDS: SelectorCardItem[] = [
	{ key: 'rehabilitation', label: 'Rehabilitation', icon: rehabilitationIcon, onClick: () => {} },
	{ key: 'specialized-service', label: 'Specialized Service', icon: specializedServiceIcon, onClick: () => {} },
]

export default function TherapeuticSelectorModal({ open, onClose }: TherapeuticSelectorModalProps) {
	const cards: SelectorCardItem[] = THERAPEUTIC_CARDS.map((c) => ({
		...c,
		onClick: onClose,
	}))

	return (
		<CardGridSelectorModal
			open={open}
			onClose={onClose}
			title="Which therapeutic service do you need?"
			cards={cards}
		/>
	)
}