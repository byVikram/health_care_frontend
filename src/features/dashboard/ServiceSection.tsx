import { Grid } from '@mui/material'
import ServiceCard from '../../components/common/Card/ServiceCard'

import DoctorsService from '../../assets/Services/doctors-service.png'
import VideoConsultation from '../../assets/Services/doctor-video-consultation.png'
import LabTests from '../../assets/Services/lab-service.png'
import Surgeries from '../../assets/Services/serguries.png'
import { useNavigate } from 'react-router-dom'

interface ServicesType {
	id: number
	image: string
	title: string
	description: string
	bgColor: string
}

export default function ServicesSection() {
	const navigate = useNavigate()

	const services: ServicesType[] = [
		{
			id: 1,
			image: DoctorsService,
			title: 'Find Doctors Near You',
			description: 'Confirmed appointments',
			bgColor: '#919191',
		},
		{
			id: 2,
			image: VideoConsultation,
			title: 'Instant Video Consultation',
			description: 'Connect within 60 sec',
			bgColor: '#B98C8D',
		},
		{ id: 3, image: LabTests, title: 'Lab Tests', description: 'Safe and trusted Lab tests', bgColor: '#8CAFB9' },
		{
			id: 4,
			image: Surgeries,
			title: 'Surgeries',
			description: 'Safe and trusted surgery centers',
			bgColor: '#8CA0B9',
		},
	]

	return (
		<Grid container spacing={3}>
			{services.map((service) => (
				<Grid size={{ xs: 12, sm: 4, md: 3, lg: 3 }} key={service.id}>
					<ServiceCard
						image={service.image}
						title={service.title}
						description={service.description}
						bgColor={service.bgColor}
						onClick={() => navigate('/doctors/search')}
					/>
				</Grid>
			))}
		</Grid>
	)
}
