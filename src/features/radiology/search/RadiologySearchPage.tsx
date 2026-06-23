// src/features/radiology/search/RadiologySearchPage.tsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Container, Typography, Grid, Chip, Card } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import RadiologySearchFilters, { RadiologyFilterState } from './components/RadiologySearchFilters'
import RadiologySearchCard from './components/RadiologySearchCard'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppInput from '../../../components/common/Input/AppInput'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import { customCardStyle } from '../../../styles/commonStyles'
import { searchRadiologyCenters } from '../radiologyService'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ScanTypeSelectorModal from '../../dashboard/ScanTypeSelectorModal'
import { RadiologySearchResultItem } from '../../../types/radiology-search'
import RadiologyBookingPage from '../bookings/RadiologyBookingPage'

const SORT_OPTIONS = [
	{ value: 'name_asc', label: 'Name: A to Z' },
	{ value: 'name_desc', label: 'Name: Z to A' },
	{ value: 'price_asc', label: 'Price: Low to High' },
	{ value: 'price_desc', label: 'Price: High to Low' },
]

const PAGE_SIZE = 12
// const LIMIT = 12
const DEBOUNCE_MS = 400

export default function RadiologySearchPage() {
	const [searchParams, setSearchParams] = useSearchParams()

	// ── URL-persisted state ────────────────────────────────────────────────
	const [inputValue, setInputValue] = useState(searchParams.get('search') || '')
	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
	const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name_asc')

	const [filters, setFilters] = useState<RadiologyFilterState>(() => ({
		scanTypeId: searchParams.get('scan_type_id') || '',
		maxPrice: Number(searchParams.get('max_price')) || 10000,
	}))
	const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(Number(searchParams.get('max_price')) || 10000)

	const [cityQuery, setCityQuery] = useState(searchParams.get('city') || '')
	const [scanPickerOpen, setScanPickerOpen] = useState(false)

	// ── Data state ─────────────────────────────────────────────────────────
	const [rawResults, setRawResults] = useState<RadiologySearchResultItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// ── Lazy load (client-side pagination of processed results) ────────────
	// const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
	// const [loadingMore, setLoadingMore] = useState(false)

	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore, setHasMore] = useState(false)

	// ── Book Scan drawer state -- one RadiologyBookingPage instance, fed by the
	//    (center, scan) pair the user clicked "Book Scan" on. Mirrors how
	//    PharmacySearchPage lifts PlaceOrderPage's open/selected state up from the card. ──
	const [bookingOpen, setBookingOpen] = useState(false)
	const [selectedItem, setSelectedItem] = useState<RadiologySearchResultItem | null>(null)

	const handleOpenBooking = (item: RadiologySearchResultItem) => {
		setSelectedItem(item)
		setBookingOpen(true)
	}

	// ── Re-sync filters when URL changes (e.g. modal navigates with new scan_type_id) ──
	useEffect(() => {
		const urlScanTypeId = searchParams.get('scan_type_id') || ''
		setFilters((prev) => {
			if (prev.scanTypeId === urlScanTypeId) return prev
			return { ...prev, scanTypeId: urlScanTypeId }
		})
		setPage(1)
	}, [searchParams])

	// ── Debounce: update searchQuery after DEBOUNCE_MS of no typing ────────
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const handleSearchChange = (value: string) => {
		setInputValue(value)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			setSearchQuery(value)
			setPage(1)
		}, DEBOUNCE_MS)
	}

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [])

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedMaxPrice(filters.maxPrice)
		}, DEBOUNCE_MS)

		return () => clearTimeout(timer)
	}, [filters.maxPrice])

	// ── IntersectionObserver for lazy load ────────────────────────────────
	// const stateRef = useRef({ loading: true, loadingMore: false })
	// stateRef.current = { loading, loadingMore }
	const stateRef = useRef({
		hasMore: false,
		loading: true,
		loadingMore: false,
	})

	stateRef.current = {
		hasMore,
		loading,
		loadingMore,
	}
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

				if (hasMore && !loading && !loadingMore) {
					setPage((prev) => prev + 1)
				}
			},
			{ threshold: 0.1 }
		)

		observer.observe(node)
		observerInstanceRef.current = observer
	}, [])

	// Turn off loadingMore once visibleCount increase is reflected
	// useEffect(() => {
	// 	if (loadingMore) {
	// 		const id = setTimeout(() => setLoadingMore(false), 300)
	// 		return () => clearTimeout(id)
	// 	}
	// }, [visibleCount, loadingMore])

	useEffect(() => {
		let active = true

		const fetchCenters = async () => {
			if (page === 1) {
				setLoading(true)
				setRawResults([])
			} else {
				setLoadingMore(true)
			}

			try {
				const res = await searchRadiologyCenters({
					page,
					limit: PAGE_SIZE,
					search: searchQuery.trim() || undefined,
					scan_type_id: filters.scanTypeId ? Number(filters.scanTypeId) : undefined,
					city: cityQuery.trim() || undefined,
					 max_price: debouncedMaxPrice,
				})

				if (!active) return

				const meta = res.meta

				setRawResults((prev) => (page === 1 ? res.data : [...prev, ...res.data]))

				setTotal(meta.total)

				setHasMore(meta.page < meta.pages)

				setError(null)
			} catch (err) {
				console.error(err)

				if (!active) return

				setError('Failed to load scan centers')
				setHasMore(false)
			} finally {
				if (active) {
					setLoading(false)
					setLoadingMore(false)
				}
			}
		}

		void fetchCenters()

		return () => {
			active = false
		}
	}, [page, searchQuery, cityQuery, filters.scanTypeId, debouncedMaxPrice])
	// ── Sync URL params ────────────────────────────────────────────────────
	useEffect(() => {
		const next = new URLSearchParams()
		if (searchQuery.trim()) next.set('search', searchQuery.trim())
		if (filters.scanTypeId) next.set('scan_type_id', filters.scanTypeId)
		if (filters.maxPrice !== 10000) next.set('max_price', String(filters.maxPrice))
		if (cityQuery.trim()) next.set('city', cityQuery.trim())
		if (sortBy !== 'name_asc') next.set('sort', sortBy)
		setSearchParams(next, { replace: true })
	}, [filters, searchQuery, cityQuery, sortBy, setSearchParams])

	// Reset visible count when filters/search/sort change
	useEffect(() => {
		setPage(1)
	}, [searchQuery, cityQuery, filters.scanTypeId,  debouncedMaxPrice, sortBy])

	// ── Filter and Sort client-side ────────────────────────────────────────
	const processedResults = useMemo(() => {
		let items = [...rawResults]

		const query = searchQuery.trim().toLowerCase()
		if (query) {
			items = items.filter(
				(item) =>
					item.name.toLowerCase().includes(query) ||
					item.address.toLowerCase().includes(query) ||
					item.scan_name.toLowerCase().includes(query)
			)
		}

		items = items.filter((item) => {
			if (item.pricing_model === 'quote_required' || item.base_price === null) return true
			return item.base_price <= filters.maxPrice
		})

		items.sort((a, b) => {
			if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
			if (sortBy === 'name_desc') return b.name.localeCompare(a.name)
			if (sortBy === 'price_asc') return (a.base_price ?? Infinity) - (b.base_price ?? Infinity)
			if (sortBy === 'price_desc') return (b.base_price ?? -Infinity) - (a.base_price ?? -Infinity)
			return 0
		})

		return items
	}, [rawResults, searchQuery, filters.maxPrice, sortBy])

	// Slice for lazy-load display
	const displayedResults = processedResults

	const handleClearFilters = useCallback(() => {
		setFilters({ scanTypeId: '', maxPrice: 10000 })
		setInputValue('')
		setSearchQuery('')
		setCityQuery('')
		setPage(1)
	}, [])

	const activeScanTypeLabel = useMemo(() => {
		if (!filters.scanTypeId || rawResults.length === 0) return ''
		const match = rawResults.find(
			(r) =>
				String(r.id) === filters.scanTypeId ||
				r.scan_name.toLowerCase().includes(filters.scanTypeId.toLowerCase())
		)
		return match ? match.scan_name : 'Selected Scan'
	}, [filters.scanTypeId, rawResults])

	return (
		<>
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			{/* Back to scan type picker - only shown when arriving via the scan type popup */}
			{filters.scanTypeId && (
				<Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
					<Container maxWidth="lg" sx={{ py: 1.5 }}>
						<Box
							onClick={() => setScanPickerOpen(true)}
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1,
								cursor: 'pointer',
								color: 'primary.main',
								fontWeight: 600,
								fontSize: '14px',
								width: 'fit-content',
							}}
						>
							<ArrowBackIcon sx={{ fontSize: 18 }} />
							Change scan type
						</Box>
					</Container>
				</Box>
			)}
			{/* Search & Location bar */}
			<Box sx={{ bgcolor: 'background.paper', py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
				<Container maxWidth="lg">
					<Grid container spacing={2}>
						<Grid size={{ xs: 12, sm: 8 }}>
							<AppInput
								fullWidth
								placeholder="Search by diagnostic center or scan name..."
								value={inputValue}
								onChange={(e) => handleSearchChange(e.target.value)}
								size="small"
								startIcon={<SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
								enableVoiceSearch
								onVoiceResult={(text) => {
									setInputValue(text)
									setSearchQuery(text)
									setPage(1)
								}}
								sx={{
									bgcolor: 'background.paper',
									borderRadius: '10px',
									'& .MuiOutlinedInput-root': { borderRadius: '10px' },
								}}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 4 }}>
							<AppInput
								fullWidth
								placeholder="Enter city..."
								value={cityQuery}
								onChange={(e) => setCityQuery(e.target.value)}
								size="small"
								startIcon={<TuneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
								sx={{
									bgcolor: 'background.paper',
									borderRadius: '10px',
									'& .MuiOutlinedInput-root': { borderRadius: '10px' },
								}}
							/>
						</Grid>
					</Grid>
				</Container>
			</Box>

			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Grid container spacing={3}>
					{/* LEFT: Filters */}
					<Grid size={{ xs: 12, md: 3 }}>
						<Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
							<RadiologySearchFilters
								filters={filters}
								onChange={setFilters}
								onClear={handleClearFilters}
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
								flexWrap: 'wrap',
								gap: 2,
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
								<Typography variant="h5" sx={{ fontWeight: 700 }}>
									{total} Scan Centers Found
								</Typography>
								{filters.scanTypeId && activeScanTypeLabel && (
									<Chip
										label={activeScanTypeLabel}
										size="small"
										onDelete={() => setFilters((prev) => ({ ...prev, scanTypeId: '' }))}
										sx={{
											bgcolor: 'rgba(43,111,113,0.08)',
											color: 'primary.main',
											fontWeight: 600,
										}}
									/>
								)}
								{cityQuery.trim() && (
									<Chip
										label={`City: ${cityQuery}`}
										size="small"
										onDelete={() => setCityQuery('')}
										sx={{
											bgcolor: 'rgba(43,111,113,0.08)',
											color: 'primary.main',
											fontWeight: 600,
										}}
									/>
								)}
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<TuneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
								<AppSelect
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value as string)}
									options={SORT_OPTIONS}
									fullWidth={false}
									sx={{ minWidth: 180 }}
								/>
							</Box>
						</Box>

						{/* Results Grid */}
						{loading ? (
							<Grid container spacing={3}>
								{Array.from({ length: 6 }).map((_, i) => (
									<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
										<Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
											<AppSkeleton height={160} width="100%" />
											<Box p={2}>
												<AppSkeleton height={20} width="60%" sx={{ mb: 1 }} />
												<AppSkeleton height={20} width="80%" sx={{ mb: 2 }} />
												<AppSkeleton height={40} width="100%" sx={{ mb: 2 }} />
												<AppSkeleton height={36} width="100%" />
											</Box>
										</Card>
									</Grid>
								))}
							</Grid>
						) : error ? (
							<Box sx={{ py: 6, textAlign: 'center' }}>
								<Typography sx={{ color: 'error.main' }}>{error}</Typography>
							</Box>
						) : displayedResults.length > 0 ? (
							<>
								<Grid container spacing={3}>
									{displayedResults.map((item) => (
										<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={`${item.id}-${item.scan_id}`}>
											<RadiologySearchCard item={item} onBookScan={handleOpenBooking} />
										</Grid>
									))}
								</Grid>

								{/* Sentinel for IntersectionObserver */}
								{hasMore && <Box ref={sentinelRef} sx={{ height: 40, mt: 2 }} />}

								{/* Loading more skeletons */}
								{loadingMore && (
									<Grid container spacing={3} sx={{ mt: 0 }}>
										{Array.from({ length: 3 }).map((_, i) => (
											<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
												<Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
													<AppSkeleton height={160} width="100%" />
													<Box p={2}>
														<AppSkeleton height={20} width="60%" sx={{ mb: 1 }} />
														<AppSkeleton height={20} width="80%" sx={{ mb: 2 }} />
														<AppSkeleton height={36} width="100%" />
													</Box>
												</Card>
											</Grid>
										))}
									</Grid>
								)}
							</>
						) : (
							<Box sx={{ textAlign: 'center', py: 10, ...customCardStyle, borderRadius: '12px' }}>
								<Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
									No scan centers found
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary' }}>
									Try adjusting your search query, location or filter options.
								</Typography>
							</Box>
						)}
					</Grid>
				</Grid>
			</Container>

			{/* Scan type picker re-entry: allows returning to the scan picker popup */}
			<ScanTypeSelectorModal
				open={scanPickerOpen}
				onClose={() => setScanPickerOpen(false)}
			/>
		</Box>

		{/* Book Scan drawer — single instance lifted up from RadiologySearchCard, replacing
		    the old per-card Dialog popup. */}
		{selectedItem && (
			<RadiologyBookingPage
				open={bookingOpen}
				onClose={() => setBookingOpen(false)}
				radiologyId={selectedItem.id}
				centerName={selectedItem.name}
				centerAddress={`${selectedItem.address}, ${selectedItem.city}, ${selectedItem.state}`}
				preselectedScanId={selectedItem.scan_id}
			/>
		)}
		</>
	)
}
