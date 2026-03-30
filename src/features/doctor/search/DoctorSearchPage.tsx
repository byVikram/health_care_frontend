// src/features/doctor/DoctorSearchPage.tsx
import { useState, useEffect } from 'react'

import { useSearchParams } from 'react-router-dom'
import { Box, Container, Typography, Grid, InputAdornment, TextField, Chip, Card } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MicIcon from '@mui/icons-material/Mic'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import TuneIcon from '@mui/icons-material/Tune'
import DoctorSearchCard from './components/DoctorSearchCard'
import AppSelect from '../../../components/common/Select/AppSelect'
import SearchFilters, { FilterState } from './components/SearchFilters'
import { getSpecialityIcon } from '../../../components/common/SpecialityIconMap'
import { customCardStyle } from '../../../styles/commonStyles'
// import { getDoctors } from '../../../services/DoctorService'
import { DoctorSearchItem } from '../../../types/doctor-search'
// import { getSpecialities } from '../../../services/SpecialityService'
import { SpecialityItem } from '../../../types/speciality'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import { getDoctors, getSpecialities } from '../doctorService'

const SORT_OPTIONS = [
	{ value: 'rating', label: 'Top Rated' },
	{ value: 'experience', label: 'Most Experienced' },
	{ value: 'price_asc', label: 'Price: Low to High' },
	{ value: 'price_desc', label: 'Price: High to Low' },
]

export default function DoctorSearchPage() {
	const [searchParams, setSearchParams] = useSearchParams()
	const getNumberParam = (key: string, fallback: number) => {
		const value = Number(searchParams.get(key))
		return Number.isFinite(value) && value > 0 ? value : fallback
	}

	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
	const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating')
	const [page, setPage] = useState(getNumberParam('page', 1))
	const [limit] = useState(getNumberParam('limit', 12))
	const [filters, setFilters] = useState<FilterState>(() => ({
		speciality: searchParams.get('speciality_id') || '',
		consultationType: (searchParams.get('consultation_type') as FilterState['consultationType']) || 'all',
		minRating: Number(searchParams.get('min_rating')) || 0,
		maxPrice: Number(searchParams.get('max_price')) || 1000,
	}))
	const [doctors, setDoctors] = useState<DoctorSearchItem[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [specialityLoading, setSpecialityLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [specialities, setSpecialities] = useState<SpecialityItem[]>([])
	const [specialitiesError, setSpecialitiesError] = useState<string | null>(null)

	useEffect(() => {
		const nextParams = new URLSearchParams()

		if (searchQuery.trim()) nextParams.set('search', searchQuery.trim())
		if (filters.speciality) nextParams.set('speciality_id', filters.speciality)
		if (filters.consultationType !== 'all') nextParams.set('consultation_type', filters.consultationType)
		if (filters.minRating > 0) nextParams.set('min_rating', String(filters.minRating))
		if (filters.maxPrice !== 1000) nextParams.set('max_price', String(filters.maxPrice))
		if (sortBy !== 'rating') nextParams.set('sort', sortBy)
		if (page !== 1) nextParams.set('page', String(page))
		if (limit !== 12) nextParams.set('limit', String(limit))

		setSearchParams(nextParams, { replace: true })
	}, [filters, limit, page, searchQuery, setSearchParams, sortBy])

	// useEffect(() => {
	// 	let active = true

	// 	getDoctors({
	// 		page,
	// 		limit,
	// 		search: searchQuery.trim() ? searchQuery.trim() : undefined,
	// 		speciality_id: filters.speciality || undefined,
	// 	})
	// 		.then((res) => {
	// 			if (!active) return
	// 			setDoctors(res.data)
	// 			setTotal(res.total)
	// 		})
	// 		.catch(() => {
	// 			if (!active) return
	// 			setError('Failed to load doctors')
	// 			setLoading(false)
	// 		})
	// 		.finally(() => {
	// 			if (!active) return
	// 			setLoading(false)
	// 		})

	// 	return () => {
	// 		active = false
	// 	}
	// }, [filters.speciality, limit, page, searchQuery])

	useEffect(() => {
		let active = true

		const fetchDoctors = async () => {
			try {
				const res = await getDoctors({
					page,
					limit,
					search: searchQuery.trim() || undefined,
					speciality_id: filters.speciality || undefined,
					consultation_type: filters.consultationType !== 'all' ? filters.consultationType : undefined,
					min_rating: filters.minRating > 0 ? filters.minRating : undefined,
					max_price: filters.maxPrice !== 1000 ? filters.maxPrice : undefined,
					sort: sortBy !== 'rating' ? sortBy : undefined,
				})

				if (!active) return
				setDoctors(res.data)
				setTotal(res.total)
			} catch (err) {
				console.log(err)
				if (!active) return
				setError('Failed to load doctors')
			} finally {
				// if (!active) return
				setLoading(false)
			}
		}

		fetchDoctors()

		return () => {
			active = false
		}
	}, [
		filters.consultationType,
		filters.maxPrice,
		filters.minRating,
		filters.speciality,
		limit,
		page,
		searchQuery,
		sortBy,
	])

	useEffect(() => {
		let active = true
		setSpecialityLoading(true)

		const fetchSpecialities = async () => {
			try {
				const res = await getSpecialities()
				if (!active) return
				setSpecialities(res.data)
			} catch (err) {
				console.log(err)
				if (!active) return
				setSpecialitiesError('Failed to load specialities')
			} finally {
				setSpecialityLoading(false)
			}
		}

		fetchSpecialities()

		return () => {
			active = false
		}
	}, [])

	const activeSpecialityLabel = filters.speciality
		? specialities.find((s) => s.id === filters.speciality)?.label
		: null

	const visibleCount = total || doctors.length

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			{/* Top search bar */}
			<Box sx={{ bgcolor: 'background.paper', py: 3 }}>
				<Container maxWidth="lg">
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						{/* Location pill */}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 0.5,
								// bgcolor: "rgba(255,255,255,0.12)",
								border: '1px solid #000',
								borderRadius: '10px',
								px: 1.5,
								py: 1,
								cursor: 'pointer',
								flexShrink: 0,
								color: '#fff',
								'&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
							}}
						>
							<LocationOnIcon sx={{ fontSize: 16, color: '#000' }} />
							<Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
								KR Market
							</Typography>
							<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
						</Box>

						{/* Search input */}
						<TextField
							fullWidth
							placeholder="Search by doctor name, speciality, clinic..."
							value={searchQuery}
							onChange={(e) => {
								setLoading(true)
								setError(null)
								setSearchQuery(e.target.value)
								setPage(1)
							}}
							size="small"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">
										<MicIcon sx={{ color: 'text.secondary', fontSize: 20, cursor: 'pointer' }} />
									</InputAdornment>
								),
							}}
							sx={{
								bgcolor: 'background.paper',
								borderColor: '#000',
								borderRadius: '10px',
								'& .MuiOutlinedInput-root': { borderRadius: '10px' },
								// "& .MuiOutlinedInput-notchedOutline": { border: "none" },
							}}
						/>
					</Box>
				</Container>
			</Box>

			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Grid container spacing={3}>
					{/* -- LEFT: Filters -- */}
					<Grid size={{ xs: 12, md: 3 }}>
						<Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
							<SearchFilters
								filters={filters}
								onChange={(next) => {
									setLoading(true)
									setError(null)
									setFilters(next)
									setPage(1)
								}}
								// specialities={specialities}
							/>
						</Box>
					</Grid>

					{/* -- RIGHT: Results -- */}
					<Grid size={{ xs: 12, md: 9 }}>
						{/* Specialities Row */}
						<Box sx={{ mb: 3 }}>
							<Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
								Search by Specialities
							</Typography>
							<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
								{specialityLoading ? (
									<>
										{Array.from({ length: 5 }).map(() => (
											<AppSkeleton width={70} height={70} />
										))}
									</>
								) : (
									<>
										{specialities.map((s) => {
											const isActive = filters.speciality === s.id
											return (
												<Box
													key={s.id}
													onClick={() => {
														setLoading(true)
														setError(null)
														setFilters((prev) => ({
															...prev,
															speciality: isActive ? '' : s.id,
														}))
														setPage(1)
													}}
													sx={{
														display: 'flex',
														flexDirection: 'column',
														alignItems: 'center',
														gap: 0.8,
														cursor: 'pointer',
													}}
												>
													<Box
														sx={{
															width: 64,
															height: 64,
															borderRadius: '14px',
															border: '2px solid',
															borderColor: isActive ? 'primary.main' : 'divider',
															bgcolor: isActive ? 'primary.main' : 'background.paper',
															color: isActive ? 'background.paper' : 'primary.main',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															transition: 'all 0.15s',
															'&:hover': {
																borderColor: 'primary.main',
																transform: 'translateY(-2px)',
															},
														}}
													>
														{getSpecialityIcon(
															s.icon_key,
															isActive ? '#fff' : 'primary.main'
														)}
													</Box>
													<Typography
														variant="caption"
														sx={{
															fontSize: '12px',
															fontWeight: isActive ? 700 : 400,
															color: isActive ? 'primary.main' : 'text.secondary',
														}}
													>
														{s.label}
													</Typography>
												</Box>
											)
										})}
									</>
								)}
							</Box>
						</Box>

						{/* Results header */}
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<Typography variant="h5" sx={{ fontWeight: 600 }}>
									{visibleCount} Doctors Found
								</Typography>
								{activeSpecialityLabel && (
									<Chip
										label={activeSpecialityLabel}
										size="small"
										onDelete={() => {
											setFilters((prev) => ({ ...prev, speciality: '' }))
											setPage(1)
										}}
										sx={{ bgcolor: '#e8f5f5', color: 'primary.main', fontWeight: 600 }}
									/>
								)}
							</Box>

							{/* Sort */}
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<TuneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
								<AppSelect
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									options={SORT_OPTIONS}
									fullWidth={false}
									sx={{ minWidth: 180 }}
								/>
							</Box>
						</Box>

						{/* Doctor Cards Grid */}
						{loading ? (
							<Grid container spacing={3}>
								{Array.from({ length: 5 }).map((_, i) => (
									<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
										<Card>
											<AppSkeleton key={i} height={140} />
											<Box p={1} pb={4}>
												<AppSkeleton sx={{ mt: 1 }} height={20} width={200} variant="text" />
												<AppSkeleton sx={{ mt: 1 }} height={20} width={200} variant="text" />
												<AppSkeleton sx={{ mt: 1 }} height={20} width={200} variant="text" />
											</Box>
										</Card>
										{/*  */}
									</Grid>
								))}
							</Grid>
						) : specialitiesError ? (
							<Box sx={{ py: 6 }}>
								<Typography variant="body1" sx={{ color: 'error.main' }}>
									{specialitiesError}
								</Typography>
							</Box>
						) : error ? (
							<Box sx={{ py: 6 }}>
								<Typography variant="body1" sx={{ color: 'error.main' }}>
									{error}
								</Typography>
							</Box>
						) : doctors.length > 0 ? (
							<Grid container spacing={3}>
								{doctors.map((doctor, index) => (
									<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doctor.id}>
										<DoctorSearchCard doctor={doctor} recommended={index === 0} />
									</Grid>
								))}
							</Grid>
						) : (
							<Box
								sx={{
									textAlign: 'center',
									py: 10,
									...customCardStyle,
								}}
							>
								<Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
									No doctors found
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary' }}>
									Try adjusting your search or filters
								</Typography>
							</Box>
						)}
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
