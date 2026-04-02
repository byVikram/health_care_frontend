// src/features/dashboard/ConsultSection.tsx
import { Box, Typography, Grid } from '@mui/material'
import AppButton from '../../components/common/Button/AppButton'
import ConsultCard from '../../components/common/Card/ConsultCard'
import { useNavigate } from 'react-router-dom'

import dentistImage from '../../assets/specialties/dentist.png'
import gynoCologistImage from '../../assets/specialties/gynocologist.png'
import nutritionImage from '../../assets/specialties/nutrition.png'
import physiotherapistImage from '../../assets/specialties/physiotherapist.png'

const consults = [
	{
		id: 1,
		title: 'Dentist',
		description: 'Teething troubles? Schedule a dental checkup',
		image: dentistImage,
	},
	{
		id: 2,
		title: 'Gynecologist',
		description: "Explore for women's health, pregnancy & infertility treatments",
		image: gynoCologistImage,
	},
	{
		id: 3,
		title: 'Dietitian/Nutrition',
		description: 'Get guidance on eating right, weight management & sports nutrition',
		image: nutritionImage,
	},
	{
		id: 4,
		title: 'Physiotherapist',
		description: 'Pulled a muscle? Get it treated by a trained physiotherapist',
		image: physiotherapistImage,
	},
]

export default function ConsultSection() {
	const navigate = useNavigate()
	return (
		<Box sx={{ pt: 2 }}>
			{/* Header Row */}
			<Grid
				container
				sx={{
					display: 'flex',
					alignItems: 'flex-start',
					justifyContent: 'space-between',
					mb: 4,
				}}
			>
				<Grid
					size={{ xs: 12, md: 8 }}
					sx={{
						borderLeft: '3px solid',
						borderColor: 'primary.main',
						pl: 1.5,
					}}
				>
					<Typography variant="h4">Book an appointment for an in-clinic consultation</Typography>
					<Typography variant="body2">Find experienced doctors across all specialties</Typography>
				</Grid>

				<Grid size={{ xs: 12, md: 2 }}>
					<AppButton
						fullWidth
						variant="outlined"
						label="View All"
						borderRadius="30px"
						sx={{ mt: { xs: 2, md: 0 } }}
					/>
				</Grid>
			</Grid>

			{/* Consult Cards */}
			<Grid container spacing={3}>
				{consults.map((s) => (
					<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={s.id}>
						<ConsultCard
							image={s.image}
							title={s.title}
							description={s.description}
							onConsult={() =>
								navigate('/doctors/search?speciality_id=3c7b1e9d-8a2f-4d6c-b5a1-7f0e2d9a8c55')
							}
						/>
					</Grid>
				))}
			</Grid>
		</Box>
	)
}
