// src/features/dashboard/QuickServicesSection.tsx
import { useState } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import { toast } from 'react-toastify'
import ScanTypeSelectorModal from '../selectors/ScanTypeSelectorModal'
import AncillarySelectorModal from '../selectors/AncillarySelectorModal'
import AlliedSelectorModal from '../selectors/AlliedSelectorModal'
import TherapeuticSelectorModal from '../selectors/TherapeuticSelectorModal'
import PharmacyIcon from '../../../assets/quick-services/pharmacy.svg'
import RadiologyIcon from '../../../assets/quick-services/radiology.svg'
import AncilaryIcon from '../../../assets/quick-services/ancilary.svg'
import AmbulanceIcon from '../../../assets/quick-services/ambulance.svg'
import BloodBankIcon from '../../../assets/quick-services/blood-bank.svg'
import IcuIcon from '../../../assets/quick-services/icu.svg'
import EmergencyIcon from '../../../assets/quick-services/emergency.svg'
import AlliedIcon from '../../../assets/quick-services/allied.png'
import TherapeuticIcon from '../../../assets/quick-services/therapeutic.png'

// Row 1: Pharmacy, Radiology, Ancillary, Allied
// Row 2: Ambulance, Blood Bank, ICU, Emergency, Therapeutic
const ROW_1 = [
	{ id: 1, title: 'Pharmacy',   image: PharmacyIcon },
	{ id: 2, title: 'Radiology',  image: RadiologyIcon },
	{ id: 3, title: 'Ancillary',  image: AncilaryIcon },
	{ id: 5, title: 'Allied',     image: AlliedIcon },
]

const ROW_2 = [
	{ id: 6,  title: 'Ambulance',    image: AmbulanceIcon },
	{ id: 7,  title: 'Blood Bank',   image: BloodBankIcon },
	{ id: 8,  title: 'ICU',          image: IcuIcon },
	{ id: 9,  title: 'Emergency',    image: EmergencyIcon },
	{ id: 10, title: 'Therapeutic',  image: TherapeuticIcon },
]

interface ServiceItem {
	id: number
	title: string
	image: string
}

interface ServiceIconProps {
	service: ServiceItem
	onClick: (title: string) => void
}

function ServiceIcon({ service, onClick }: ServiceIconProps) {
	return (
		<Box
			onClick={() => onClick(service.title)}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 1,
				cursor: 'pointer',
				'&:hover img': {
					transform: 'translateY(-3px)',
					filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.20))',
				},
			}}
		>
			<Box
				component="img"
				src={service.image}
				alt={service.title}
				sx={{
					width: 50,
					height: 50,
					objectFit: 'contain',
					transition: 'transform 0.2s ease, filter 0.2s ease',
				}}
			/>
			<Typography
				variant="body2"
				align="center"
				sx={{ fontWeight: 700, color: 'text.primary', fontSize: '15px' }}
			>
				{service.title}
			</Typography>
		</Box>
	)
}

export default function QuickServicesSection() {
	const [scanPickerOpen, setScanPickerOpen] = useState(false)
	const [ancillaryPickerOpen, setAncillaryPickerOpen] = useState(false)
	const [alliedPickerOpen, setAlliedPickerOpen] = useState(false)
	const [therapeuticPickerOpen, setTherapeuticPickerOpen] = useState(false)

	const handleServiceClick = (title: string) => {
		if (title === 'Radiology') {
			setScanPickerOpen(true)
		} else if (title === 'Ancillary') {
			setAncillaryPickerOpen(true)
		} else if (title === 'Allied') {
			setAlliedPickerOpen(true)
		} else if (title === 'Therapeutic') {
			setTherapeuticPickerOpen(true)
		} else if (title === 'Pharmacy') {
			toast.info('Medicine delivery is coming soon in your area.')
		}
	}

	return (
		<Box sx={{ py: 2 }}>
			{/* Heading */}
			<Typography variant="h3" align="center" sx={{ mb: 4 }}>
				Quick Services
			</Typography>

			{/* 5-per-row grid: ROW_1 then ROW_2, xs:2.4 = exactly 5 columns */}
			<Grid container columnSpacing={2} rowSpacing={5} justifyContent="center">
				{[...ROW_1, ...ROW_2].map((service) => (
					<Grid size={{ xs: 2.4, sm: 2.4, md: 2.4 }} key={service.id}>
						<ServiceIcon service={service} onClick={handleServiceClick} />
					</Grid>
				))}
			</Grid>

			{/* Modals */}
			<ScanTypeSelectorModal
				open={scanPickerOpen}
				onClose={() => setScanPickerOpen(false)}
			/>
			<AncillarySelectorModal
				open={ancillaryPickerOpen}
				onClose={() => setAncillaryPickerOpen(false)}
			/>
			<AlliedSelectorModal
				open={alliedPickerOpen}
				onClose={() => setAlliedPickerOpen(false)}
			/>
			<TherapeuticSelectorModal
				open={therapeuticPickerOpen}
				onClose={() => setTherapeuticPickerOpen(false)}
			/>
		</Box>
	)
}
