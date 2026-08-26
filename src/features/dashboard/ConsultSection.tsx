// src/features/dashboard/ConsultSection.tsx
import { useEffect, useState } from 'react'
import { Box, Typography, Grid, Skeleton } from '@mui/material'
import AppButton from '../../components/common/Button/AppButton'
import ConsultCard from '../../components/common/Card/ConsultCard'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { getSpecialities } from '../doctor/doctorService'
import { SpecialityItem } from '../../types/speciality'

import dentistImage from '../../assets/specialties/dentist.png'
import gynoCologistImage from '../../assets/specialties/gynocologist.png'
import nutritionImage from '../../assets/specialties/nutrition.png'
import physiotherapistImage from '../../assets/specialties/physiotherapist.png'

// Each dashboard card maps to the real specialty by its DB label -- this is
// only used to pick the right illustration/description; the id used for
// navigation always comes from the fetched specialty record, never from here.
const CONSULTS = [
	{
		id: 1,
		title: 'Dentist',
		description: 'Teething troubles? Schedule a dental checkup',
		image: dentistImage,
		specialityLabel: 'Dentistry',
	},
	{
		id: 2,
		title: 'Gynecologist',
		description: "Explore for women's health, pregnancy & infertility treatments",
		image: gynoCologistImage,
		specialityLabel: 'Gynecology',
	},
	{
		id: 3,
		title: 'Dietitian/Nutrition',
		description: 'Get guidance on eating right, weight management & sports nutrition',
		image: nutritionImage,
		specialityLabel: 'Nutrition & Dietetics',
	},
	{
		id: 4,
		title: 'Physiotherapist',
		description: 'Pulled a muscle? Get it treated by a trained physiotherapist',
		image: physiotherapistImage,
		specialityLabel: 'Physiotherapy',
	},
]

export default function ConsultSection() {
	const navigate = useNavigate()
	const [specialities, setSpecialities] = useState<SpecialityItem[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let active = true
		setLoading(true)
		getSpecialities()
			.then((res) => {
				if (!active) return
				setSpecialities(res.data)
			})
			.catch((err) => {
				console.error('Failed to load specialities:', err)
			})
			.finally(() => {
				if (active) setLoading(false)
			})
		return () => {
			active = false
		}
	}, [])

	const handleConsult = (specialityLabel: string) => {
		// Mirrors AllSpecialitiesPage.handleConsult: resolve the real
		// specialty record and use its actual id, never a hardcoded one.
		const match = specialities.find((s) => s.label === specialityLabel)
		if (!match) {
			navigate(ROUTES.DOCTORS.SEARCH)
			return
		}
		const next = new URLSearchParams({
			speciality_id: match.id,
			speciality_label: match.label,
		})
		navigate(`/doctors/search?${next.toString()}`)
	}

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
						onClick={() => navigate(ROUTES.SPECIALITIES)}
					/>
				</Grid>
			</Grid>

			{/* Consult Cards */}
			<Grid container spacing={3}>
				{loading
					? Array.from({ length: 4 }).map((_, i) => (
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
								<Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '4/3', borderRadius: '6px' }} />
							</Grid>
						))
					: CONSULTS.map((s) => (
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={s.id}>
								<ConsultCard
									image={s.image}
									title={s.title}
									description={s.description}
									onConsult={() => handleConsult(s.specialityLabel)}
								/>
							</Grid>
						))}
			</Grid>
		</Box>
	)
}
