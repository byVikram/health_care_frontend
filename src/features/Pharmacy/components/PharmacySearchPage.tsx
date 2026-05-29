import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
	Box,
	Card,
	Chip,
	Container,
	Grid,
	Pagination,
	Stack,
	Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MicIcon from '@mui/icons-material/Mic'
import TuneIcon from '@mui/icons-material/Tune'
import PharmacySearchCard from '../../Pharmacy/components/PharmacySearchCard'
import PharmacyFilters, { PharmacyFilterState } from '../../Pharmacy/components/PharmacyFilters'
import { getPharmacies } from '../../Pharmacy/pharmacyService'
import { PharmacyItem } from '../../../types/pharmacy'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import AppInput from '../../../components/common/Input/AppInput'

const LIMIT = 12

export default function PharmacySearchPage() {
	const [searchParams, setSearchParams] = useSearchParams()

	const getNumberParam = (key: string, fallback: number) => {
		const value = Number(searchParams.get(key))
		return Number.isFinite(value) && value > 0 ? value : fallback
	}

	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
	const [page, setPage] = useState(getNumberParam('page', 1))
	const [filters, setFilters] = useState<PharmacyFilterState>(() => ({
		city: searchParams.get('city') || '',
		homeDelivery: searchParams.get('home_delivery') === 'true',
		is24x7: searchParams.get('is_24_x_7') === 'true',
		emergencyMeds: searchParams.get('emergency_medicine') === 'true',
	}))
	const [allPharmacies, setAllPharmacies] = useState<PharmacyItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const nextParams = new URLSearchParams()

		if (searchQuery.trim()) nextParams.set('search', searchQuery.trim())
		if (filters.city) nextParams.set('city', filters.city)
		if (filters.homeDelivery) nextParams.set('home_delivery', 'true')
		if (filters.is24x7) nextParams.set('is_24_x_7', 'true')
		if (filters.emergencyMeds) nextParams.set('emergency_medicine', 'true')
		if (page !== 1) nextParams.set('page', String(page))

		setSearchParams(nextParams, { replace: true })
	}, [filters, page, searchQuery, setSearchParams])

	useEffect(() => {
	let active = true

	const fetchPharmacies = async () => {
		setLoading(true)
		setError(null)

		try {
			const response = await getPharmacies()
			if (!active) return
		
			const mappedPharmacies: PharmacyItem[] = (response.data ?? []).map((item) => ({
				...item,
				owner_name: item.owner_name ?? '',
			}))
			setAllPharmacies(mappedPharmacies)
		} catch (err) {
			console.log(err)
			if (!active) return
			setError('Failed to load pharmacies')
		} finally {
			if (active) setLoading(false)
		}
	}

	fetchPharmacies()

	return () => {
		active = false
	}
}, [])

	const filteredPharmacies = allPharmacies.filter((pharmacy) => {
		const query = searchQuery.trim().toLowerCase()
		const matchesSearch =
			!query ||
			[pharmacy.name, pharmacy.owner_name, pharmacy.address, pharmacy.city]
				.filter(Boolean)
				.some((value) => value.toLowerCase().includes(query))

		const matchesCity = !filters.city || pharmacy.city === filters.city
		const matchesHomeDelivery = !filters.homeDelivery || pharmacy.home_delivery_available
		const matches24x7 = !filters.is24x7 || pharmacy.is_24_x_7
		const matchesEmergency = !filters.emergencyMeds || pharmacy.emergency_medicine_available

		return matchesSearch && matchesCity && matchesHomeDelivery && matches24x7 && matchesEmergency
	})

	const total = filteredPharmacies.length
	const totalPages = Math.ceil(total / LIMIT)
	const visiblePharmacies = filteredPharmacies.slice((page - 1) * LIMIT, page * LIMIT)

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
		setPage(1)
	}

	const handleFilterChange = (newFilters: PharmacyFilterState) => {
		setFilters(newFilters)
		setPage(1)
	}

	const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
		setPage(value)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const clearAllFilters = () => {
		setFilters({ city: '', homeDelivery: false, is24x7: false, emergencyMeds: false })
		setSearchQuery('')
		setPage(1)
	}

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Box sx={{ bgcolor: 'background.paper', py: 3 }}>
				<Container maxWidth="lg">
					<AppInput
						placeholder="Search by pharmacy name, owner, city..."
						value={searchQuery}
						onChange={handleSearchChange}
						size="small"
						startIcon={<SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
						endIcon={<MicIcon sx={{ color: 'text.secondary', fontSize: 20, cursor: 'pointer' }} />}
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: '10px',
								bgcolor: 'background.paper',
							},
						}}
					/>
				</Container>
			</Box>

			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 3 }}>
						<Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
							<PharmacyFilters filters={filters} onChange={handleFilterChange} />
						</Box>
					</Grid>

					<Grid size={{ xs: 12, md: 9 }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								mb: 2.5,
								gap: 2,
								flexWrap: 'wrap',
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
								<Typography variant="h5" sx={{ fontWeight: 600 }}>
									{total} Pharmacies Found
								</Typography>
								{filters.city && (
									<Chip
										label={filters.city}
										size="small"
										onDelete={() => handleFilterChange({ ...filters, city: '' })}
										sx={{ bgcolor: '#e8f5f5', color: 'primary.main', fontWeight: 600 }}
									/>
								)}
								{(filters.homeDelivery || filters.is24x7 || filters.emergencyMeds || searchQuery) && (
									<Chip
										label="Clear all filters"
										size="small"
										onClick={clearAllFilters}
										sx={{ bgcolor: '#f5f5f5', cursor: 'pointer', fontWeight: 600 }}
									/>
								)}
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<TuneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
								<Typography variant="body2" color="text.secondary">
									Filters
								</Typography>
							</Box>
						</Box>

						{loading ? (
							<Grid container spacing={3}>
								{Array.from({ length: 6 }).map((_, i) => (
									<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
										<Card>
											<AppSkeleton height={140} />
											<Box p={1} pb={4}>
												<AppSkeleton sx={{ mt: 1 }} height={20} width={200} variant="text" />
												<AppSkeleton sx={{ mt: 1 }} height={20} width={200} variant="text" />
												<AppSkeleton sx={{ mt: 1 }} height={20} width={160} variant="text" />
											</Box>
										</Card>
									</Grid>
								))}
							</Grid>
						) : error ? (
							<Card sx={{ py: 6, px: 3, borderRadius: 3 }}>
								<Typography variant="body1" sx={{ color: 'error.main' }}>
									{error}
								</Typography>
							</Card>
						) : visiblePharmacies.length > 0 ? (
							<>
								<Grid container spacing={3}>
									{visiblePharmacies.map((pharmacy) => (
										<Grid size={{ xs: 12, sm: 6, lg: 4 }} key={pharmacy.id}>
											<PharmacySearchCard pharmacy={pharmacy} />
										</Grid>
									))}
								</Grid>
								{totalPages > 1 && (
									<Stack alignItems="center" sx={{ mt: 4 }}>
										<Pagination
											count={totalPages}
											page={page}
											onChange={handlePageChange}
											color="primary"
											size="large"
										/>
									</Stack>
								)}
							</>
						) : (
							<Card
								sx={{
									textAlign: 'center',
									py: 10,
									px: 3,
									borderRadius: 3,
									border: '1px solid',
									borderColor: 'divider',
								}}
							>
								<Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
									No pharmacies found
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary' }}>
									Try adjusting your search or filters
								</Typography>
							</Card>
						)}
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}