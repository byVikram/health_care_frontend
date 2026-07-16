// src/features/doctor/search/DoctorSearchPage.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Container, Typography, Grid, Chip, Card } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import DoctorSearchCard from './components/DoctorSearchCard'
import AppSelect from '../../../components/common/Select/AppSelect'
import SearchFilters, { FilterState } from './components/SearchFilters'
import { customCardStyle } from '../../../styles/commonStyles'
import { DoctorSearchItem } from '../../../types/doctor-search'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import { getDoctors } from '../doctorService'
import AppInput from '../../../components/common/Input/AppInput'

const SORT_OPTIONS = [
	{ value: 'rating',     label: 'Top Rated'          },
	{ value: 'experience', label: 'Most Experienced'   },
	{ value: 'price_asc',  label: 'Price: Low to High' },
	{ value: 'price_desc', label: 'Price: High to Low' },
]

const LIMIT = 12

export default function DoctorSearchPage() {
	const [searchParams, setSearchParams] = useSearchParams()

	const isNearby = searchParams.get('nearby') === 'true'

	// ── URL-persisted state ────────────────────────────────────────────────
	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
	const [sortBy, setSortBy]           = useState(searchParams.get('sort') || 'rating')
	const [filters, setFilters] = useState<FilterState>(() => ({
		speciality:       searchParams.get('speciality_id') || '',
		consultationType: (searchParams.get('consultation_type') as FilterState['consultationType']) || 'clinic',
		minRating:        Number(searchParams.get('min_rating')) || 0,
		maxPrice:         Number(searchParams.get('max_price')) || 1000,
	}))

	// Label for the active-speciality chip — comes from URL, no separate API call
	const specialityLabel = searchParams.get('speciality_label') || ''

	// ── Pagination ─────────────────────────────────────────────────────────
	const [page, setPage] = useState(1)

	// ── Data state ─────────────────────────────────────────────────────────
	const [doctors,     setDoctors]     = useState<DoctorSearchItem[]>([])
	const [total,       setTotal]       = useState(0)
	const [loading,     setLoading]     = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore,     setHasMore]     = useState(false)
	const [error,       setError]       = useState<string | null>(null)

	// ── IntersectionObserver refs ──────────────────────────────────────────
	const stateRef = useRef({ hasMore: false, loading: true, loadingMore: false })
	stateRef.current = { hasMore, loading, loadingMore }
	const observerInstanceRef = useRef<IntersectionObserver | null>(null)

	const sentinelRef = useCallback((node: HTMLDivElement | null) => {
		if (observerInstanceRef.current) {
			observerInstanceRef.current.disconnect()
			observerInstanceRef.current = null
		}
		if (!node) return
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries[0].isIntersecting) return
				const { hasMore, loading, loadingMore } = stateRef.current
				if (hasMore && !loading && !loadingMore) setPage((prev) => prev + 1)
			},
			{ threshold: 0.1 },
		)
		observer.observe(node)
		observerInstanceRef.current = observer
	}, [])

	// ── Sync URL params ────────────────────────────────────────────────────
	useEffect(() => {
		const next = new URLSearchParams()
		if (searchQuery.trim())                 next.set('search',            searchQuery.trim())
		if (filters.speciality)                 next.set('speciality_id',     filters.speciality)
		if (specialityLabel)                    next.set('speciality_label',  specialityLabel)
		if (filters.consultationType !== 'all') next.set('consultation_type', filters.consultationType)
		if (filters.minRating > 0)              next.set('min_rating',        String(filters.minRating))
		if (filters.maxPrice !== 1000)          next.set('max_price',         String(filters.maxPrice))
		if (sortBy !== 'rating')                next.set('sort',              sortBy)
		if (isNearby)                           next.set('nearby',            'true')
		setSearchParams(next, { replace: true })
	}, [filters, searchQuery, sortBy, specialityLabel, setSearchParams, isNearby])

	// ── Fetch doctors ──────────────────────────────────────────────────────
	useEffect(() => {
		let active = true
		const controller = new AbortController()
		const fetchDoctors = async () => {
			if (page === 1) { setLoading(true); setDoctors([]); setError(null) }
			else setLoadingMore(true)
			try {
				const queryParams = {
					page,
					limit:             LIMIT,
					search:            searchQuery.trim() || undefined,
					speciality_id:     filters.speciality || undefined,
					consultation_type: filters.consultationType !== 'all' ? filters.consultationType : undefined,
					min_rating:        filters.minRating > 0 ? filters.minRating : undefined,
					max_price:         filters.maxPrice !== 1000 ? filters.maxPrice : undefined,
					sort:              sortBy !== 'rating' ? sortBy : undefined,
				}

				let res;
				let position: GeolocationPosition | null = null;
				
				if (navigator.geolocation) {
					position = await new Promise<GeolocationPosition>((resolve, reject) => {
						navigator.geolocation.getCurrentPosition(resolve, reject, {
							enableHighAccuracy: true,
							timeout: 10000,
							maximumAge: 0,
						})
					}).catch((err) => {
						console.warn('Geolocation failed or denied, using default coordinates.', err)
						return null
					})
				} else {
					console.warn('Geolocation is not supported by your browser, using default coordinates.')
				}
				
				// Fallback if position was not retrieved
				if (!position) {
					position = {
						coords: {
							latitude: 12.9716,
							longitude: 77.5946,
						}
					} as GeolocationPosition
				}

				sessionStorage.setItem('user_lat', position.coords.latitude.toString())
				sessionStorage.setItem('user_lon', position.coords.longitude.toString())
				
				const lat = position.coords.latitude
				const lon = position.coords.longitude

				if (!active) return

				res = await getDoctors(
					{ 
						...queryParams, 
						latitude: lat, 
						longitude: lon, 
						...(isNearby ? { nearby: true } : {})
					}, 
					controller.signal
				)

				if (!active) return
				const meta = res.meta ?? {
					total: res.total ?? 0,
					page:  res.page  ?? page,
					limit: res.limit ?? LIMIT,
					pages: res.pages ?? Math.ceil((res.total ?? 0) / (res.limit ?? LIMIT)),
				}
				setDoctors((prev) => (page === 1 ? res.data : [...prev, ...res.data]))
				setTotal(meta.total)
				setHasMore(meta.page < meta.pages)
				setError(null)
			} catch (err: any) {
				console.error(err)
				if (!active) return
				setError('Failed to load doctors')
				setHasMore(false)
			} finally {
				if (active) { setLoading(false); setLoadingMore(false) }
			}
		}
		void fetchDoctors()
		return () => { 
			active = false
			controller.abort()
		}
	}, [filters.consultationType, filters.maxPrice, filters.minRating, filters.speciality, page, searchQuery, sortBy, isNearby])

	const resetAndFetch = useCallback((updater: () => void) => {
		updater()
		setPage(1)
	}, [])

	const visibleCount = total || doctors.length

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>

			{/* Search bar */}
			<Box sx={{ bgcolor: 'background.paper', py: 3 }}>
				<Container maxWidth="lg">
					<AppInput
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
						startIcon={<SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
						enableVoiceSearch
						onVoiceResult={(text) => {
							setLoading(true)
							setError(null)
							setSearchQuery(text)
							setPage(1)
						}}
						sx={{
							bgcolor: 'background.paper',
							borderRadius: '10px',
							'& .MuiOutlinedInput-root': { borderRadius: '10px' },
						}}
					/>
				</Container>
			</Box>

			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Grid container spacing={3}>

					{/* LEFT: Filters */}
					<Grid size={{ xs: 12, md: 3 }}>
						<Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
							<SearchFilters
								filters={filters}
								onChange={(next) =>
									resetAndFetch(() => {
										setError(null)
										setFilters(next)
									})
								}
							/>
						</Box>
					</Grid>

					{/* RIGHT: Results */}
					<Grid size={{ xs: 12, md: 9 }}>

						{/* Results header */}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								mb: 2.5,
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<Typography variant="h5" sx={{ fontWeight: 600 }}>
									{isNearby ? `${visibleCount} Doctors Near You` : `${visibleCount} Doctors Found`}
								</Typography>
								{filters.speciality && specialityLabel && (
									<Chip
										label={specialityLabel}
										size="small"
										onDelete={() =>
											resetAndFetch(() => {
												setFilters((prev) => ({ ...prev, speciality: '' }))
												const next = new URLSearchParams(searchParams)
												next.delete('speciality_id')
												next.delete('speciality_label')
												setSearchParams(next, { replace: true })
											})
										}
										sx={{ bgcolor: '#e8f5f5', color: 'primary.main', fontWeight: 600 }}
									/>
								)}
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<TuneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
								<AppSelect
									value={sortBy}
									onChange={(e) => resetAndFetch(() => setSortBy(e.target.value))}
									options={SORT_OPTIONS}
									fullWidth={false}
									sx={{ minWidth: 180 }}
								/>
							</Box>
						</Box>

						{/* Doctor cards */}
						{loading ? (
							<Grid container spacing={3}>
								{Array.from({ length: 6 }).map((_, i) => (
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
							<>
								<Grid container spacing={3}>
									{doctors.map((doctor, index) => (
										<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doctor.id}>
											<DoctorSearchCard doctor={doctor} recommended={index === 0} />
										</Grid>
									))}
								</Grid>

								<Box ref={sentinelRef} sx={{ height: 40, mt: 2 }} />

								{loadingMore && (
									<Grid container spacing={3} sx={{ mt: 0 }}>
										{Array.from({ length: 3 }).map((_, i) => (
											<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
												<Card>
													<AppSkeleton height={140} />
													<Box p={1} pb={4}>
														<AppSkeleton sx={{ mt: 1 }} height={20} width={200} variant="text" />
														<AppSkeleton sx={{ mt: 1 }} height={20} width={160} variant="text" />
													</Box>
												</Card>
											</Grid>
										))}
									</Grid>
								)}
							</>
						) : (
							<Box sx={{ textAlign: 'center', py: 10, ...customCardStyle }}>
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
