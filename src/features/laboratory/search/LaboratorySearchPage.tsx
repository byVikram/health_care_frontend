// src/features/laboratory/search/LaboratorySearchPage.tsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Container, Typography, Grid, Chip, Card } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import LaboratorySearchFilters, { LaboratoryFilterState } from './components/LaboratorySearchFilters'
import LaboratorySearchCard from './components/LaboratorySearchCard'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppInput from '../../../components/common/Input/AppInput'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import { customCardStyle } from '../../../styles/commonStyles'
import { searchLaboratories } from '../laboratoryService'
import { LaboratorySearchResultItem } from '../../../types/laboratory-search'
import LaboratoryBookingPage from '../bookings/LaboratoryBookingPage'

const SORT_OPTIONS = [
	{ value: 'name_asc', label: 'Name: A to Z' },
	{ value: 'name_desc', label: 'Name: Z to A' },
	{ value: 'price_asc', label: 'Price: Low to High' },
	{ value: 'price_desc', label: 'Price: High to Low' },
]

const PAGE_SIZE = 12
const DEBOUNCE_MS = 400

export default function LaboratorySearchPage() {
	const [searchParams, setSearchParams] = useSearchParams()

	const [inputValue, setInputValue] = useState(searchParams.get('search') || '')
	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
	const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name_asc')

	const [filters, setFilters] = useState<LaboratoryFilterState>(() => ({
		testTypeId: searchParams.get('test_type_id') || '',
		maxPrice: Number(searchParams.get('max_price')) || 10000,
	}))
	const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(
		Number(searchParams.get('max_price')) || 10000,
	)
	const [cityQuery, setCityQuery] = useState(searchParams.get('city') || '')

	const [rawResults, setRawResults] = useState<LaboratorySearchResultItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore, setHasMore] = useState(false)

	// Book Test drawer state — one LaboratoryBookingPage instance, fed by the
	// (laboratory, test) pair the user clicked "Book Test" on. Mirrors how
	// RadiologySearchPage lifts RadiologyBookingPage's open/selected state up from the card.
	const [bookingOpen, setBookingOpen] = useState(false)
	const [selectedItem, setSelectedItem] = useState<LaboratorySearchResultItem | null>(null)

	const handleOpenBooking = (item: LaboratorySearchResultItem) => {
		setSelectedItem(item)
		setBookingOpen(true)
	}

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const handleSearchChange = (value: string) => {
		setInputValue(value)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => { setSearchQuery(value); setPage(1) }, DEBOUNCE_MS)
	}
	useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedMaxPrice(filters.maxPrice), DEBOUNCE_MS)
		return () => clearTimeout(timer)
	}, [filters.maxPrice])

	const stateRef = useRef({ hasMore: false, loading: true, loadingMore: false })
	stateRef.current = { hasMore, loading, loadingMore }
	const observerInstanceRef = useRef<IntersectionObserver | null>(null)

	const sentinelRef = useCallback((node: HTMLDivElement | null) => {
		if (observerInstanceRef.current) { observerInstanceRef.current.disconnect(); observerInstanceRef.current = null }
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

	useEffect(() => {
		let active = true
		const fetchData = async () => {
			if (page === 1) { setLoading(true); setRawResults([]) } else { setLoadingMore(true) }
			try {
				const res = await searchLaboratories({
					page, limit: PAGE_SIZE,
					search: searchQuery.trim() || undefined,
					test_type_id: filters.testTypeId ? Number(filters.testTypeId) : undefined,
					city: cityQuery.trim() || undefined,
					max_price: debouncedMaxPrice,
				})
				if (!active) return
				setRawResults((prev) => (page === 1 ? res.data : [...prev, ...res.data]))
				setTotal(res.meta.total)
				setHasMore(res.meta.page < res.meta.pages)
				setError(null)
			} catch {
				if (!active) return
				setError('Failed to load laboratories')
				setHasMore(false)
			} finally {
				if (active) { setLoading(false); setLoadingMore(false) }
			}
		}
		void fetchData()
		return () => { active = false }
	}, [page, searchQuery, cityQuery, filters.testTypeId, debouncedMaxPrice])

	useEffect(() => { setPage(1) }, [searchQuery, cityQuery, filters.testTypeId, debouncedMaxPrice, sortBy])

	useEffect(() => {
		const next = new URLSearchParams()
		if (searchQuery.trim()) next.set('search', searchQuery.trim())
		if (filters.testTypeId) next.set('test_type_id', filters.testTypeId)
		if (filters.maxPrice !== 10000) next.set('max_price', String(filters.maxPrice))
		if (cityQuery.trim()) next.set('city', cityQuery.trim())
		if (sortBy !== 'name_asc') next.set('sort', sortBy)
		setSearchParams(next, { replace: true })
	}, [filters, searchQuery, cityQuery, sortBy, setSearchParams])

	const processedResults = useMemo(() => {
		let items = [...rawResults]
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
	}, [rawResults, filters.maxPrice, sortBy])

	const handleClearFilters = useCallback(() => {
		setFilters({ testTypeId: '', maxPrice: 10000 })
		setInputValue('')
		setSearchQuery('')
		setCityQuery('')
		setPage(1)
	}, [])

	return (
		<>
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Box sx={{ bgcolor: 'background.paper', py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
				<Container maxWidth="lg">
					<Grid container spacing={2}>
						<Grid size={{ xs: 12, sm: 8 }}>
							<AppInput
								fullWidth
								placeholder="Search by laboratory name or test..."
								value={inputValue}
								onChange={(e) => handleSearchChange(e.target.value)}
								size="small"
								startIcon={<SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
								enableVoiceSearch
								onVoiceResult={(text) => { setInputValue(text); setSearchQuery(text); setPage(1) }}
								sx={{ bgcolor: 'background.paper', borderRadius: '10px', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
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
								sx={{ bgcolor: 'background.paper', borderRadius: '10px', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
							/>
						</Grid>
					</Grid>
				</Container>
			</Box>

			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 3 }}>
						<Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
							<LaboratorySearchFilters filters={filters} onChange={setFilters} onClear={handleClearFilters} />
						</Box>
					</Grid>

					<Grid size={{ xs: 12, md: 9 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
								<Typography variant="h5" sx={{ fontWeight: 700 }}>
									{total} Laboratories Found
								</Typography>
								{cityQuery.trim() && (
									<Chip
										label={`City: ${cityQuery}`}
										size="small"
										onDelete={() => setCityQuery('')}
										sx={{ bgcolor: 'rgba(43,111,113,0.08)', color: 'primary.main', fontWeight: 600 }}
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
						) : processedResults.length > 0 ? (
							<>
								<Grid container spacing={3}>
									{processedResults.map((item) => (
										<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={`${item.id}-${item.test_id}`}>
											<LaboratorySearchCard item={item} onBookTest={handleOpenBooking} />
										</Grid>
									))}
								</Grid>

								{hasMore && <Box ref={sentinelRef} sx={{ height: 40, mt: 2 }} />}

								{loadingMore && (
									<Grid container spacing={3} sx={{ mt: 0 }}>
										{Array.from({ length: 3 }).map((_, i) => (
											<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
												<Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
													<AppSkeleton height={160} width="100%" />
													<Box p={2}>
														<AppSkeleton height={20} width="60%" sx={{ mb: 1 }} />
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
									No laboratories found
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary' }}>
									Try adjusting your search query, location or filter options.
								</Typography>
							</Box>
						)}
					</Grid>
				</Grid>
			</Container>
		</Box>

		{/* Book Test drawer — single instance lifted up from LaboratorySearchCard, replacing
		    the old per-card popup (mirrors RadiologySearchPage). */}
		{selectedItem && (
			<LaboratoryBookingPage
				open={bookingOpen}
				onClose={() => setBookingOpen(false)}
				laboratoryId={selectedItem.id}
				centerName={selectedItem.name}
				centerAddress={`${selectedItem.address}, ${selectedItem.city}, ${selectedItem.state}`}
				preselectedTestId={selectedItem.test_id}
			/>
		)}
		</>
	)
}