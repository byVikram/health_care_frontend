// src/features/dashboard/SpecialitySection.tsx
import { useEffect, useState } from 'react'
import { Box, Typography, Grid, Skeleton } from '@mui/material'
import AppButton from '../../../components/common/Button/AppButton'
import DashboardEmptyState from '../components/DashboardEmptyState'
import { getSymptoms } from '../../doctor/doctorService'
import type { SymptomItem } from '../../../types/speciality'
import { ROUTES } from '../../../constants/routes'
import SpecialityCard from '../../../components/common/Card/SpecialityCard'
import { isDashboardSymptom, symptomCardProps } from '../symptomCardData'
import { useNavigate } from 'react-router-dom'

export default function SpecialitySection() {
	const navigate = useNavigate()
	const [symptoms, setSymptoms] = useState<SymptomItem[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let active = true
		const load = async () => {
			setLoading(true)
			try {
				const res = await getSymptoms()
				if (!active) return
				// The dashboard keeps its own cards (the order the API gave them); every symptom, new ones included, is on the
				// All Symptoms page (View All). With none of its own cards in the list it shows the first six.
				const own = res.data.filter(isDashboardSymptom)
				setSymptoms(own.length > 0 ? own : res.data.slice(0, 6))
			} catch (err) {
				// ApiService's shared axios interceptor already shows a global
				// error toast on failure -- just log for developers here.
				console.error('Failed to load health concerns:', err)
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [])

	const handleConsult = (symptom: SymptomItem) => {
		// The symptom -> specialty mapping comes from the backend
		// (speciality_symptoms). If a symptom has no resolved specialty yet,
		// send the user to the unfiltered doctor list rather than guessing.
		if (!symptom.speciality_id) {
			navigate('/doctors/search')
			return
		}
		const next = new URLSearchParams({
			speciality_id: symptom.speciality_id,
			speciality_label: symptom.speciality_label ?? '',
		})
		navigate(`/doctors/search?${next.toString()}`)
	}

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
						onClick={() => navigate(ROUTES.SYMPTOMS)}
					/>
				</Grid>
			</Grid>

			{/* Speciality Cards */}
			{loading ? (
				<Grid container spacing={2}>
					{Array.from({ length: 6 }).map((_, i) => (
						<Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
								<Skeleton variant="circular" width={72} height={72} />
								<Skeleton variant="text" width="80%" />
							</Box>
						</Grid>
					))}
				</Grid>
			) : symptoms.length === 0 ? (
				<DashboardEmptyState message="No health concerns configured yet." />
			) : (
				<Grid container spacing={2}>
					{symptoms.map((s) => (
						<Grid size={{ xs: 6, sm: 4, md: 2 }} key={s.id}>
							<Box sx={{ display: 'flex', justifyContent: 'center' }}>
								<SpecialityCard {...symptomCardProps(s)} onConsult={() => handleConsult(s)} />
							</Box>
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	)
}
