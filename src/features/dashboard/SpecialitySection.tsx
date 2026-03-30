// src/features/dashboard/SpecialitySection.tsx
import { Box, Typography, Grid } from '@mui/material'
import AppButton from '../../components/common/Button/AppButton'
import SpecialityCard from '../../components/common/Card/SpecialityCard'

import PregnancyIcon from '../../assets/specialties/pregnancy.svg'
import AcneIcon from '../../assets/specialties/acne.svg'
import PerformanceIcon from '../../assets/specialties/performance.svg'
import ColdIcon from '../../assets/specialties/cough.svg'
import ChildIcon from '../../assets/specialties/child.svg'
import DepressionIcon from '../../assets/specialties/depression.svg'
import { useNavigate } from 'react-router-dom'

// Placeholder illustrations from a free public CDN
const specialities = [
	{
		id: 1,
		title: 'Pregnancy or Period doubts',
		image: PregnancyIcon,
	},
	{
		id: 2,
		title: 'Acne, pimple or Skin Issues',
		image: AcneIcon,
	},
	{
		id: 3,
		title: 'Performance issues in bed',
		image: PerformanceIcon,
	},
	{
		id: 4,
		title: 'Cold, cough or fever',
		image: ColdIcon,
	},
	{
		id: 5,
		title: 'Child not feeling well',
		image: ChildIcon,
	},
	{
		id: 6,
		title: 'Depression or anxiety',
		image: DepressionIcon,
	},
]

export default function SpecialitySection() {
	const navigate = useNavigate()
	return (
		<Box sx={{ py: 2 }}>
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
				{/* Left: accent border + text */}
				<Grid
					size={{ xs: 12, md: 8 }}
					sx={{
						borderLeft: '3px solid',
						borderColor: 'primary.main',
						pl: 1.5,
					}}
				>
					<Typography variant="h4">Consult top doctors online for any health concern</Typography>
					<Typography variant="body2">Find experienced doctors across all specialties</Typography>
				</Grid>

				{/* Right: View All button */}
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

			{/* Speciality Cards */}
			<Grid container spacing={2}>
				{specialities.map((s) => (
					<Grid size={{ xs: 6, sm: 4, md: 2 }} key={s.id}>
						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<SpecialityCard
								image={s.image}
								title={s.title}
								onConsult={() =>
									navigate('/doctors/search?speciality_id=3c7b1e9d-8a2f-4d6c-b5a1-7f0e2d9a8c55')
								}
							/>
						</Box>
					</Grid>
				))}
			</Grid>
		</Box>
	)
}
