// src/features/doctor/search/DoctorSearchPage.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Container, Typography, Grid, Chip, Card } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import DoctorSearchCard from './components/DoctorSearchCard'
import AppSelect from '../../../components/common/Select/AppSelect'
import SearchFilters, { type FilterState } from './components/SearchFilters'
import { customCardStyle } from '../../../styles/commonStyles'
import type { DoctorSearchItem } from '../../../types/doctor-search'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import { getDoctors } from '../doctorService'
import { getBrowserPosition } from '../../../hooks/useCurrentLocation'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'

const SORT_OPTIONS = [
	{ value: 'rating',     label: 'Top Rated'          },
	{ value: 'experience', label: 'Most Experienced'   },
	{ value: 'price_asc',  label: 'Price: Low to High' },
	{ value: 'price_desc', label: 'Price: High to Low' },
]

const LIMIT = 12

// Bangalore: used when the browser cannot, or may not, tell where the user is.
const DEFAULT_LOCATION = { latitude: 12.9716, longitude: 77.5946 }

type Coordinates = { latitude: number; longitude: number }

type Located = { coords: Coordinates; /** false: not found for now (timed out, unavailable), so ask again next time */ final: boolean }

/**
 * The user's position, or the default one. The page asks ONCE per visit (see `locationRef`): asking again for every page would make
 * each "load more" wait for a fresh GPS fix, up to the 10 s timeout. A fix younger than 5 minutes is reused by the browser itself.
 * An answer that is only a fallback because the lookup TIMED OUT (the permission prompt still open) or was unavailable is not
 * `final`: the page asks again on the next request, so allowing location later is picked up. A refusal (or no support) is final.
 */
function resolveLocation(): Promise<Located> {
	return getBrowserPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }).then((here): Located => {
		if (here.coords) return { coords: here.coords, final: true }
		console.warn('Geolocation is unavailable or was refused, using default coordinates.')
		// no support or a refusal is final; a time-out is not (the permission prompt may still be open)
		return { coords: DEFAULT_LOCATION, final: here.unsupported || here.denied }
	})
}

export default function DoctorSearchPage() {
	const [searchParams, setSearchParams] = useSearchParams()

	const isNearby = searchParams.get('nearby') === 'true'

	// ── URL-persisted state ────────────────────────────────────────────────
	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
	// What is typed in the box. It becomes `searchQuery` (and so a request) 300 ms after the last keystroke.
	const [searchInput, setSearchInput] = useState(searchQuery)
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
	const [, setTotal]            = useState(0)
	const [loading,     setLoading]     = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore,     setHasMore]     = useState(false)
	const [error,       setError]       = useState<string | null>(null)
	// A page after the first failed: the doctors already shown stay, with a "Try again" under them.
	const [loadMoreError, setLoadMoreError] = useState(false)
	const [retryKey, setRetryKey] = useState(0)
	const locationRef = useRef<Promise<Located> | null>(null)

	// ── Infinite scroll ────────────────────────────────────────────────────
	// The next page is asked for when the sentinel under the cards comes within 400px of the screen. The observer is made again after
	// every page, because an observer only reports CHANGES: on a tall screen the sentinel can still be in view once a page has been
	// added, and one long-lived observer would never ask for the next page (a new one reports where the sentinel is at once).
	const sentinelRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		const node = sentinelRef.current
		if (!node || !hasMore || loading || loadingMore || loadMoreError) return
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries[0].isIntersecting) return
				observer.disconnect() // one request per observer: the page that arrives makes the next one
				setPage((prev) => prev + 1)
			},
			{ rootMargin: '0px 0px 400px 0px' },
		)
		observer.observe(node)
		return () => observer.disconnect()
	}, [hasMore, loading, loadingMore, loadMoreError, doctors.length])

	// ── Search box: ask the server after the typing stops, not on every key ─
	useEffect(() => {
		if (searchInput.trim() === searchQuery.trim()) return
		const timer = window.setTimeout(() => {
			setError(null)
			setSearchQuery(searchInput)
			setPage(1)
		}, 300)
		return () => window.clearTimeout(timer)
	}, [searchInput, searchQuery])

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
			if (page === 1) { setLoading(true); setDoctors([]); setError(null); setLoadMoreError(false) }
			else { setLoadingMore(true); setLoadMoreError(false) }
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

				if (!locationRef.current) locationRef.current = resolveLocation()
				const located = await locationRef.current
				if (!located.final) locationRef.current = null // a fallback for now: the next request asks again
				const { latitude: lat, longitude: lon } = located.coords
				sessionStorage.setItem('user_lat', lat.toString())
				sessionStorage.setItem('user_lon', lon.toString())

				if (!active) return

				const res = await getDoctors(
					{
						...queryParams,
						latitude: lat,
						longitude: lon,
						...(isNearby ? { nearby: true } : {})
					},
					controller.signal
				)

				if (!active) return
				// The search endpoint's response model drops `meta` today, so the totals can be missing. Then a full page means
					// "there may be more" (what the mobile app does) and the next, short or empty, page ends the list.
					const hasTotals = res.meta !== undefined || res.pages !== undefined
					const meta = res.meta ?? {
					total: res.total ?? 0,
					page:  res.page  ?? page,
					limit: res.limit ?? LIMIT,
					pages: res.pages ?? Math.ceil((res.total ?? 0) / (res.limit ?? LIMIT)),
				}
				// Paging by offset can repeat a doctor when the list changes between two requests: each one is shown once.
				setDoctors((prev) => {
					if (page === 1) return res.data
					const seen = new Set(prev.map((d) => d.id))
					return [...prev, ...res.data.filter((d) => !seen.has(d.id))]
				})
				setTotal(meta.total)
				setHasMore(hasTotals ? meta.page < meta.pages : res.data.length >= LIMIT)
				setError(null)
			} catch (err) {
				console.error(err)
				if (!active) return
				if (page === 1) {
					setError('Failed to load doctors')
					setHasMore(false)
				} else {
					setLoadMoreError(true) // keep what is on screen: a failed next page must not wipe the list
				}
			} finally {
				if (active) { setLoading(false); setLoadingMore(false) }
			}
		}
		void fetchDoctors()
		return () => {
			active = false
			controller.abort()
		}
	}, [filters.consultationType, filters.maxPrice, filters.minRating, filters.speciality, page, searchQuery, sortBy, isNearby, retryKey])

	const resetAndFetch = useCallback((updater: () => void) => {
		updater()
		setPage(1)
	}, [])


	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>

			{/* Search bar */}
			<Box sx={{ bgcolor: 'background.paper', py: 3 }}>
				<Container maxWidth="lg">
					<AppInput
						fullWidth
						placeholder="Search by doctor name, speciality, clinic..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						size="small"
						startIcon={<SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
						enableVoiceSearch
						onVoiceResult={(text) => {
							setError(null)
							setSearchInput(text)
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
									{isNearby ? 'Doctors Near You' : 'Doctors'}
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

								{loadMoreError && (
									<Box sx={{ textAlign: 'center', py: 3 }}>
										<Typography variant="body2" sx={{ color: 'error.main', mb: 1 }}>
											Couldn't load more doctors.
										</Typography>
										<AppButton variant="outlined" size="small" label="Try again" onClick={() => setRetryKey((k) => k + 1)} />
									</Box>
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
