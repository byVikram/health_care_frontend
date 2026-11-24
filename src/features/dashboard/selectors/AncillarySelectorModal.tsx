// src/features/dashboard/AncillarySelectorModal.tsx
//
// "Which ancillary service do you need?": the home-care services. Each one the web has a booking flow for (nursing, home care, rehab, physiotherapy,
// medical equipment: see careServices.ts) opens its page; any other card says it is in the mobile app.
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import homeCareIcon from '../../../assets/ancillary/home-care.png'
import medicalEquipmentIcon from '../../../assets/ancillary/medical-equipment.svg'
import nursingCareIcon from '../../../assets/ancillary/nursing-care.png'
import physiotherapyIcon from '../../../assets/ancillary/physiotherapy.png'
import rehabCareIcon from '../../../assets/therapeutic/rehabilitation.png'
import { carePath, isCareServiceKey } from '../../nursing/careServices'
import CardGridSelectorModal, { type SelectorCardItem } from './CardGridSelectorModal'

interface AncillarySelectorModalProps {
	open: boolean
	onClose: () => void
}

const ANCILLARY_CARDS: Omit<SelectorCardItem, 'onClick'>[] = [
	{ key: 'nursing-care', label: 'Nursing Care', icon: nursingCareIcon },
	{ key: 'home-care', label: 'Home Care', icon: homeCareIcon },
	{ key: 'rehab-care', label: 'Rehab Care', icon: rehabCareIcon },
	{ key: 'physiotherapy', label: 'Physiotherapy', icon: physiotherapyIcon },
	{ key: 'medical-equipment', label: 'Medical Equipment', icon: medicalEquipmentIcon },
]

export default function AncillarySelectorModal({ open, onClose }: AncillarySelectorModalProps) {
	const navigate = useNavigate()

	const choose = (key: string, label: string) => {
		onClose()
		if (isCareServiceKey(key)) {
			navigate(carePath(key, 'home'))
			return
		}
		toast.info(`${label} is available in the mobile app for now.`)
	}

	const cards: SelectorCardItem[] = ANCILLARY_CARDS.map((c) => ({
		...c,
		onClick: () => choose(c.key, c.label),
	}))

	return <CardGridSelectorModal open={open} onClose={onClose} title="Which ancillary service do you need?" cards={cards} />
}
