// src/features/dashboard/QuickServicesSection.tsx
import { useState } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import ScanTypeSelectorModal from './ScanTypeSelectorModal'
import PharmacyIcon from '../../assets/quick-services/pharmacy.svg'
import RadiologyIcon from '../../assets/quick-services/radiology.svg'
import AncilaryIcon from '../../assets/quick-services/ancilary.svg'
import LabIcon from '../../assets/quick-services/lab.svg'
import AmbulanceIcon from '../../assets/quick-services/ambulance.svg'
import BloodBankIcon from '../../assets/quick-services/blood-bank.svg'
import IcuIcon from '../../assets/quick-services/icu.svg'
import EmergencyIcon from '../../assets/quick-services/emergency.svg'

const quickServices = [
	{
		id: 1,
		title: 'Pharmacy',
		image: PharmacyIcon,
	},
	{
		id: 2,
		title: 'Radiology',
		image: RadiologyIcon,
	},
	{
		id: 3,
		title: 'Ancillary',
		image: AncilaryIcon,
	},
	{
		id: 4,
		title: 'Lab',
		image: LabIcon,
	},
	{
		id: 5,
		title: 'Ambulance',
		image: AmbulanceIcon,
	},
	{
		id: 6,
		title: 'Blood Bank',
		image: BloodBankIcon,
	},
	{
		id: 7,
		title: 'ICU',
		image: IcuIcon,
	},
	{
		id: 8,
		title: 'Emergency',
		image: EmergencyIcon,
	},
]

export default function QuickServicesSection() {
	const navigate = useNavigate()
	const [scanPickerOpen, setScanPickerOpen] = useState(false)

	const handleServiceClick = (title: string) => {
		if (title === 'Radiology') {
			setScanPickerOpen(true)
		} else if (title === 'Pharmacy') {
			navigate(ROUTES.PHARMACY.SEARCH)
		}
	}

	return (
		<Box sx={{ py: 2 }}>
			{/* Heading */}
			<Typography variant="h3" align="center" sx={{ mb: 4 }}>
				Quick Services
			</Typography>

			{/* Icons Grid */}
			<Grid container columnSpacing={2} rowSpacing={5} justifyContent="center">
				{quickServices.map((service) => (
					<Grid size={{ xs: 3, sm: 3, md: 3 }} key={service.id}>
						<Box
							onClick={() => handleServiceClick(service.title)}
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
					</Grid>
				))}
			</Grid>

			{/* Scan type picker popup, opened when the Radiology quick service icon is clicked */}
			<ScanTypeSelectorModal
				open={scanPickerOpen}
				onClose={() => setScanPickerOpen(false)}
			/>
		</Box>
	)
}
