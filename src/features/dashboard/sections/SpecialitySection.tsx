// src/features/dashboard/SpecialitySection.tsx
import { useEffect, useState } from 'react'
import { Box, Typography, Grid, Skeleton } from '@mui/material'
import AppButton from '../../../components/common/Button/AppButton'
import SpecialityCard from '../../../components/common/Card/SpecialityCard'
import DashboardEmptyState from '../components/DashboardEmptyState'
import { getSymptoms } from '../../doctor/doctorService'
import { SymptomItem } from '../../../types/speciality'

import PregnancyIcon from '../../../assets/specialties/pregnancy.svg'
import AcneIcon from '../../../assets/specialties/acne.svg'
import PerformanceIcon from '../../../assets/specialties/performance.svg'
import ColdIcon from '../../../assets/specialties/cough.svg'
import ChildIcon from '../../../assets/specialties/child.svg'
import DepressionIcon from '../../../assets/specialties/depression.svg'
import { useNavigate } from 'react-router-dom'

// icon_key (from the symptoms API) -> local illustration. Falls back to the
// pregnancy icon only if the backend ever returns a key we don't recognise.
const ICON_MAP: Record<string, string> = {
	pregnancy: PregnancyIcon,
	acne: AcneIcon,
	performance: PerformanceIcon,
	cough: ColdIcon,
	child: ChildIcon,
	depression: DepressionIcon,
}

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
				setSymptoms(res.data)
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
								<SpecialityCard
									image={(s.icon_key && ICON_MAP[s.icon_key]) || PregnancyIcon}
									title={s.label}
									onConsult={() => handleConsult(s)}
								/>
							</Box>
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	)
}
