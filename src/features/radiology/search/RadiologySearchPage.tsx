// src/features/radiology/search/RadiologySearchPage.tsx
import { useState, useEffect, useMemo, useCallback } from 'react'
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
import { RadiologySearchResultItem } from '../../../types/radiology-search'

const SORT_OPTIONS = [
	{ value: 'name_asc', label: 'Name: A to Z' },
	{ value: 'name_desc', label: 'Name: Z to A' },
	{ value: 'price_asc', label: 'Price: Low to High' },
	{ value: 'price_desc', label: 'Price: High to Low' },
]

export default function RadiologySearchPage() {
	const [searchParams, setSearchParams] = useSearchParams()

	// ── URL-persisted state ────────────────────────────────────────────────
	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
	const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name_asc')
	
	const [filters, setFilters] = useState<RadiologyFilterState>(() => ({
		scanTypeId: searchParams.get('scan_type_id') || '',
		maxPrice: Number(searchParams.get('max_price')) || 10000,
	}))

	const [cityQuery, setCityQuery] = useState(searchParams.get('city') || '')

	// ── Data state ─────────────────────────────────────────────────────────
	const [rawResults, setRawResults] = useState<RadiologySearchResultItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

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

	// ── Fetch radiology centers ────────────────────────────────────────────
	useEffect(() => {
		let active = true
		const fetchCenters = async () => {
			setLoading(true)
			setError(null)
			try {
				const res = await searchRadiologyCenters({
					scan_type_id: filters.scanTypeId ? Number(filters.scanTypeId) : undefined,
					city: cityQuery.trim() || undefined,
				})
				if (!active) return

				if (res.success && res.data) {
					setRawResults(res.data)
				} else {
					throw new Error(res.message || 'Failed to fetch scan centers')
				}
			} catch (err) {
				console.error(err)
				if (!active) return
				setError('Failed to load scan centers')
			} finally {
				if (active) {
					setLoading(false)
				}
			}
		}
		void fetchCenters()
		return () => {
			active = false
		}
	}, [filters.scanTypeId, cityQuery])

	// ── Filter and Sort client-side ────────────────────────────────────────
	const processedResults = useMemo(() => {
		let items = [...rawResults]

		// 1. Client-side Search Query Filter (on facility name, address, or scan type)
		const query = searchQuery.trim().toLowerCase()
		if (query) {
			items = items.filter(
				(item) =>
					item.name.toLowerCase().includes(query) ||
					item.address.toLowerCase().includes(query) ||
					item.scan_name.toLowerCase().includes(query)
			)
		}

		// 2. Client-side Max Price Filter
		items = items.filter((item) => {
			if (item.pricing_model === 'quote_required' || item.base_price === null) {
				return true // Always show quote required centers
			}
			return item.base_price <= filters.maxPrice
		})

		// 3. Client-side Sorting
		items.sort((a, b) => {
			if (sortBy === 'name_asc') {
				return a.name.localeCompare(b.name)
			}
			if (sortBy === 'name_desc') {
				return b.name.localeCompare(a.name)
			}
			if (sortBy === 'price_asc') {
				const priceA = a.base_price ?? Infinity
				const priceB = b.base_price ?? Infinity
				return priceA - priceB
			}
			if (sortBy === 'price_desc') {
				const priceA = a.base_price ?? -Infinity
				const priceB = b.base_price ?? -Infinity
				return priceB - priceA
			}
			return 0
		})

		return items
	}, [rawResults, searchQuery, filters.maxPrice, sortBy])

	const handleClearFilters = useCallback(() => {
		setFilters({
			scanTypeId: '',
			maxPrice: 10000,
		})
		setSearchQuery('')
		setCityQuery('')
	}, [])

	// Determine active scan type label if a type is filtered
	const activeScanTypeLabel = useMemo(() => {
		if (!filters.scanTypeId || rawResults.length === 0) return ''
		const match = rawResults.find((r) => String(r.scan_id) === filters.scanTypeId || r.scan_name.toLowerCase().includes(filters.scanTypeId.toLowerCase()))
		return match ? match.scan_name : 'Selected Scan'
	}, [filters.scanTypeId, rawResults])

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			{/* Search & Location bar */}
			<Box sx={{ bgcolor: 'background.paper', py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
				<Container maxWidth="lg">
					<Grid container spacing={2}>
						<Grid size={{ xs: 12, sm: 8 }}>
							<AppInput
								fullWidth
								placeholder="Search by diagnostic center or scan name..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								size="small"
								startIcon={<SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
								enableVoiceSearch
								onVoiceResult={(text) => setSearchQuery(text)}
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
									{processedResults.length} Scan Centers Found
								</Typography>
								{filters.scanTypeId && activeScanTypeLabel && (
									<Chip
										label={activeScanTypeLabel}
										size="small"
										onDelete={() => setFilters((prev) => ({ ...prev, scanTypeId: '' }))}
										sx={{ bgcolor: 'rgba(43,111,113,0.08)', color: 'primary.main', fontWeight: 600 }}
									/>
								)}
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

						{/* Results Grid */}
						{loading ? (
							<Grid container spacing={3}>
								{Array.from({ length: 6 }).map((_, i) => (
									<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
										<Card sx={{ p: 2, borderRadius: '12px' }}>
											<AppSkeleton height={32} width="60%" sx={{ mb: 1 }} />
											<AppSkeleton height={20} width="80%" sx={{ mb: 2 }} />
											<AppSkeleton height={40} width="100%" sx={{ mb: 2 }} />
											<AppSkeleton height={36} width="100%" />
										</Card>
									</Grid>
								))}
							</Grid>
						) : error ? (
							<Box sx={{ py: 6, textAlign: 'center' }}>
								<Typography sx={{ color: 'error.main' }}>{error}</Typography>
							</Box>
						) : processedResults.length > 0 ? (
							<Grid container spacing={3}>
								{processedResults.map((item) => (
									<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={`${item.radiology_id}-${item.scan_id}`}>
										<RadiologySearchCard item={item} />
									</Grid>
								))}
							</Grid>
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
		</Box>
	)
}
