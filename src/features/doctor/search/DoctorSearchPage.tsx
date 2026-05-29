// src/features/doctor/DoctorSearchPage.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
	Box,
	Container,
	Typography,
	Grid,
	//  InputAdornment, TextField,
	Chip,
	Card,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
// import MicIcon from '@mui/icons-material/Mic'
import TuneIcon from '@mui/icons-material/Tune'
import DoctorSearchCard from './components/DoctorSearchCard'
import AppSelect from '../../../components/common/Select/AppSelect'
import SearchFilters, { FilterState } from './components/SearchFilters'
import { getSpecialityIcon } from '../../../components/common/SpecialityIconMap'
import { customCardStyle } from '../../../styles/commonStyles'
import { DoctorSearchItem } from '../../../types/doctor-search'
import { SpecialityItem } from '../../../types/speciality'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import { getDoctors, getSpecialities } from '../doctorService'

const SORT_OPTIONS = [
	{ value: 'rating', label: 'Top Rated' },
	{ value: 'experience', label: 'Most Experienced' },
	{ value: 'price_asc', label: 'Price: Low to High' },
	{ value: 'price_desc', label: 'Price: High to Low' },
]

const LIMIT = 12

export default function DoctorSearchPage() {
	const [searchParams, setSearchParams] = useSearchParams()

	// ── URL-persisted state (no page) ──────────────────────────────────────
	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
	const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating')
	const [filters, setFilters] = useState<FilterState>(() => ({
		speciality: searchParams.get('speciality_id') || '',
		consultationType: (searchParams.get('consultation_type') as FilterState['consultationType']) || 'all',
		minRating: Number(searchParams.get('min_rating')) || 0,
		maxPrice: Number(searchParams.get('max_price')) || 1000,
	}))

	// ── Local-only pagination state (NOT in URL) ───────────────────────────
	const [page, setPage] = useState(1)

	// ── Data state ─────────────────────────────────────────────────────────
	const [doctors, setDoctors] = useState<DoctorSearchItem[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore, setHasMore] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// ── Specialities ───────────────────────────────────────────────────────
	const [specialities, setSpecialities] = useState<SpecialityItem[]>([])
	const [specialityLoading, setSpecialityLoading] = useState(false)
	const [specialitiesError, setSpecialitiesError] = useState<string | null>(null)

	// ── Refs for IntersectionObserver ──────────────────────────────────────
	// stateRef always holds the latest values so the observer callback
	// never reads stale closure values.
	const stateRef = useRef({ hasMore: false, loading: true, loadingMore: false })
	stateRef.current = { hasMore, loading, loadingMore }

	// observerInstanceRef holds the active IntersectionObserver so we can
	// disconnect it when the sentinel node is removed from the DOM.
	const observerInstanceRef = useRef<IntersectionObserver | null>(null)

	// sentinelRef is a callback ref — it fires every time the sentinel node
	// mounts OR unmounts (node is null on unmount). This is the key fix:
	// a plain useRef + useEffect([]) never fires when the node appears
	// conditionally inside doctors.length > 0.
	const sentinelRef = useCallback((node: HTMLDivElement | null) => {
		// Disconnect any previous observer
		if (observerInstanceRef.current) {
			observerInstanceRef.current.disconnect()
			observerInstanceRef.current = null
		}

		if (!node) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries[0].isIntersecting) return
				const { hasMore, loading, loadingMore } = stateRef.current
				if (hasMore && !loading && !loadingMore) {
					setPage((prev) => prev + 1)
				}
			},
			{ threshold: 0.1 }
		)

		observer.observe(node)
		observerInstanceRef.current = observer
	}, []) // stable — no deps needed, state is read via stateRef

	// ── Sync URL params (never writes page) ───────────────────────────────
	useEffect(() => {
		const nextParams = new URLSearchParams()

		if (searchQuery.trim()) nextParams.set('search', searchQuery.trim())
		if (filters.speciality) nextParams.set('speciality_id', filters.speciality)
		if (filters.consultationType !== 'all') nextParams.set('consultation_type', filters.consultationType)
		if (filters.minRating > 0) nextParams.set('min_rating', String(filters.minRating))
		if (filters.maxPrice !== 1000) nextParams.set('max_price', String(filters.maxPrice))
		if (sortBy !== 'rating') nextParams.set('sort', sortBy)

		setSearchParams(nextParams, { replace: true })
	}, [filters, searchQuery, setSearchParams, sortBy])

	// ── Fetch doctors ──────────────────────────────────────────────────────
	useEffect(() => {
		let active = true

		const fetchDoctors = async () => {
			if (page === 1) {
				setLoading(true)
				setDoctors([])
			} else {
				setLoadingMore(true)
			}

			try {
				const res = await getDoctors({
					page,
					limit: LIMIT,
					search: searchQuery.trim() || undefined,
					speciality_id: filters.speciality || undefined,
					consultation_type: filters.consultationType !== 'all' ? filters.consultationType : undefined,
					min_rating: filters.minRating > 0 ? filters.minRating : undefined,
					max_price: filters.maxPrice !== 1000 ? filters.maxPrice : undefined,
					sort: sortBy !== 'rating' ? sortBy : undefined,
				})

				if (!active) return

				const responseMeta = res.meta ?? {
					total: res.total ?? 0,
					page: res.page ?? page,
					limit: res.limit ?? LIMIT,
					pages: res.pages ?? Math.ceil((res.total ?? 0) / (res.limit ?? LIMIT)),
				}

				setDoctors((prev) => (page === 1 ? res.data : [...prev, ...res.data]))
				setTotal(responseMeta.total)
				setHasMore(responseMeta.page < responseMeta.pages)
				setError(null)
			} catch (err) {
				console.error(err)
				if (!active) return
				setError('Failed to load doctors')
				setHasMore(false)
			} finally {
				if (active) {
					setLoading(false)
					setLoadingMore(false)
				}
			}
		}

		void fetchDoctors()

		return () => {
			active = false
		}
	}, [filters.consultationType, filters.maxPrice, filters.minRating, filters.speciality, page, searchQuery, sortBy])

	// ── Reset to page 1 when filters/search/sort change ───────────────────
	const resetAndFetch = useCallback((updater: () => void) => {
		updater()
		setPage(1)
	}, [])

	// ── Specialities ───────────────────────────────────────────────────────
	useEffect(() => {
		let active = true
		setSpecialityLoading(true)

		const fetchSpecialities = async () => {
			try {
				const res = await getSpecialities()
				if (!active) return
				setSpecialities(res.data)
			} catch (err) {
				console.error(err)
				if (!active) return
				setSpecialitiesError('Failed to load specialities')
			} finally {
				if (active) setSpecialityLoading(false)
			}
		}

		void fetchSpecialities()
		return () => { active = false }
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
						<TextField
							fullWidth
							placeholder="Search by doctor name, speciality, clinic..."
							value={searchQuery}
							onChange={(e) => {
								resetAndFetch(() => {
									setError(null)
									setSearchQuery(e.target.value)
								})
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
								borderRadius: '10px',
								'& .MuiOutlinedInput-root': { borderRadius: '10px' },
							}}
						/> */}

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
								borderColor: '#000',
								borderRadius: '10px',
								'& .MuiOutlinedInput-root': {
									borderRadius: '10px',
								},
							}}
						/>
					</Box>
				</Container>
			</Box>

			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Grid container spacing={3}>
					{/* LEFT: Filters */}
					<Grid size={{ xs: 12, md: 3 }}>
						<Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
							<SearchFilters
								filters={filters}
								onChange={(next) => {
									resetAndFetch(() => {
										setError(null)
										setFilters(next)
									})
								}}
							/>
						</Box>
					</Grid>

					{/* RIGHT: Results */}
					<Grid size={{ xs: 12, md: 9 }}>
						{/* Specialities Row */}
						<Box sx={{ mb: 3 }}>
							<Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
								Search by Specialities
							</Typography>
							<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
								{specialityLoading ? (
									Array.from({ length: 5 }).map((_, i) => (
										<AppSkeleton key={i} width={70} height={70} />
									))
								) : (
									specialities.map((s) => {
										const isActive = filters.speciality === s.id
										return (
											<Box
												key={s.id}
												onClick={() => {
													resetAndFetch(() => {
														setError(null)
														setFilters((prev) => ({
															...prev,
															speciality: isActive ? '' : s.id,
														}))
													})
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
													{getSpecialityIcon(s.icon_key, isActive ? '#fff' : 'primary.main')}
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
									})
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
											resetAndFetch(() =>
												setFilters((prev) => ({ ...prev, speciality: '' }))
											)
										}}
										sx={{ bgcolor: '#e8f5f5', color: 'primary.main', fontWeight: 600 }}
									/>
								)}
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<TuneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
								<AppSelect
									value={sortBy}
									onChange={(e) => {
										resetAndFetch(() => setSortBy(e.target.value))
									}}
									options={SORT_OPTIONS}
									fullWidth={false}
									sx={{ minWidth: 180 }}
								/>
							</Box>
						</Box>

						{/* Doctor Cards */}
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
							<>
								<Grid container spacing={3}>
									{doctors.map((doctor, index) => (
										<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doctor.id}>
											<DoctorSearchCard doctor={doctor} recommended={index === 0} />
										</Grid>
									))}
								</Grid>

								{/* Sentinel — callback ref attaches the observer the moment this node mounts */}
								<Box ref={sentinelRef} sx={{ height: 40, mt: 2 }} />

								{/* Skeleton cards appended below while loading next page */}
								{loadingMore && (
									<Grid container spacing={3} sx={{ mt: 0 }}>
										{Array.from({ length: 3 }).map((_, i) => (
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
