import { useState, useEffect } from 'react'
import { Box, Container, Typography, Grid, Card } from '@mui/material'
import DoctorSearchCard from '../search/components/DoctorSearchCard'
import { customCardStyle } from '../../../styles/commonStyles'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import { getPatientFavouriteDoctors, FavouriteDoctor } from '../doctorService'
import { DoctorSearchItem } from '../../../types/doctor-search'

export default function FavouriteDoctorsPage() {
	const [doctors, setDoctors] = useState<FavouriteDoctor[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let active = true
		const fetchFavourites = async () => {
			setLoading(true)
			try {
				const res = await getPatientFavouriteDoctors()
				if (!active) return
				setDoctors(res.data.favourites || [])
				setError(null)
			} catch (err) {
				console.error(err)
				if (!active) return
				setError('Failed to load favourite doctors')
			} finally {
				if (active) setLoading(false)
			}
		}
		void fetchFavourites()
		return () => { active = false }
	}, [])

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
			<Container maxWidth="lg">
				<Box sx={{ mb: 4 }}>
					<Typography variant="h5" sx={{ fontWeight: 600 }}>
						My Favourite Doctors
					</Typography>
				</Box>

				{loading ? (
					<Grid container spacing={3}>
						{Array.from({ length: 4 }).map((_, i) => (
							<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
								<Card>
									<AppSkeleton height={140} />
									<Box p={1} pb={4}>
										<AppSkeleton sx={{ mt: 1 }} height={20} width={200} variant="text" />
										<AppSkeleton sx={{ mt: 1 }} height={20} width={160} variant="text" />
										<AppSkeleton sx={{ mt: 1 }} height={20} width={180} variant="text" />
									</Box>
								</Card>
							</Grid>
						))}
					</Grid>
				) : error ? (
					<Box sx={{ py: 6 }}>
						<Typography sx={{ color: 'error.main' }}>{error}</Typography>
					</Box>
				) : doctors.length > 0 ? (
					<Grid container spacing={3}>
						{doctors.map((doctor) => {
							const searchItem: DoctorSearchItem = {
								id: doctor.id,
								name: doctor.name,
								is_verified: doctor.is_verified,
								avatar_s3_key: doctor.avatar_s3_key,
								location: doctor.location || 'Clinic',
								experience_years: doctor.experience_years || 0,
								specialities: doctor.specialities
							}
							return (
								<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doctor.id}>
									<DoctorSearchCard doctor={searchItem} />
								</Grid>
							)
						})}
					</Grid>
				) : (
					<Box sx={{ textAlign: 'center', py: 10, ...customCardStyle }}>
						<Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
							No Favourite Doctors
						</Typography>
						<Typography variant="body2" sx={{ color: 'text.secondary' }}>
							Doctors you mark as favourites will appear here.
						</Typography>
					</Box>
				)}
			</Container>
		</Box>
	)
}
