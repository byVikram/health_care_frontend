// src/features/dashboard/AlliedSelectorModal.tsx
import acupunctureIcon from '../../assets/allied-health/acupuncture.png'
import ayurvedaIcon from '../../assets/allied-health/ayurveda.png'
import homeopathyIcon from '../../assets/allied-health/homeopathy.png'
import CardGridSelectorModal, { SelectorCardItem } from './CardGridSelectorModal'

interface AlliedSelectorModalProps {
	open: boolean
	onClose: () => void
}

const ALLIED_CARDS: SelectorCardItem[] = [
	{ key: 'acupuncture', label: 'Acupuncture', icon: acupunctureIcon, onClick: () => {} },
	{ key: 'ayurveda', label: 'Ayurveda', icon: ayurvedaIcon, onClick: () => {} },
	{ key: 'homeopathy', label: 'Homeopathy', icon: homeopathyIcon, onClick: () => {} },
]

export default function AlliedSelectorModal({ open, onClose }: AlliedSelectorModalProps) {
	const cards: SelectorCardItem[] = ALLIED_CARDS.map((c) => ({
		...c,
		onClick: onClose,
	}))

	return (
		<CardGridSelectorModal
			open={open}
			onClose={onClose}
			title="Which allied health service do you need?"
			cards={cards}
		/>
	)
}