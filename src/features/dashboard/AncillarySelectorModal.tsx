// src/features/dashboard/AncillarySelectorModal.tsx
import elderDayCareIcon from '../../assets/ancillary/elder-day-care.png'
import homeCareIcon from '../../assets/ancillary/home-care.png'
import nursingCareIcon from '../../assets/ancillary/nursing-care.png'
import physiotherapyIcon from '../../assets/ancillary/physiotherapy.png'
import CardGridSelectorModal, { SelectorCardItem } from './CardGridSelectorModal'

interface AncillarySelectorModalProps {
	open: boolean
	onClose: () => void
}

const ANCILLARY_CARDS: SelectorCardItem[] = [
	{ key: 'elder-day-care', label: 'Elder Day Care', icon: elderDayCareIcon, onClick: () => {} },
	{ key: 'home-care', label: 'Home Care', icon: homeCareIcon, onClick: () => {} },
	{ key: 'nursing-care', label: 'Nursing Care', icon: nursingCareIcon, onClick: () => {} },
	{ key: 'physiotherapy', label: 'Physiotherapy', icon: physiotherapyIcon, onClick: () => {} },
]

export default function AncillarySelectorModal({ open, onClose }: AncillarySelectorModalProps) {
	const cards: SelectorCardItem[] = ANCILLARY_CARDS.map((c) => ({
		...c,
		onClick: onClose,
	}))

	return (
		<CardGridSelectorModal
			open={open}
			onClose={onClose}
			title="Which ancillary service do you need?"
			cards={cards}
		/>
	)
}