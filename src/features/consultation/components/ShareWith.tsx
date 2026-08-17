// src/features/consultation/components/ShareWith.tsx
import { useEffect, useState } from 'react'
import { Box, Typography, Grid, CircularProgress } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppButton from '../../../components/common/Button/AppButton'
import { customCardStyle, customScrollbar } from '../../../styles/commonStyles'
import { getPharmacies, PharmacyListItem } from '../../pharmacy/pharmacyService'
import { searchLaboratories } from '../../laboratory/laboratoryService'
import { searchRadiologyCenters } from '../../radiology/radiologyService'
import { LaboratorySearchResultItem } from '../../../types/laboratory-search'
import { RadiologySearchResultItem } from '../../../types/radiology-search'
import ApiService from '../../../services/apiService'
import { toast } from 'react-toastify'

const TABS = [
	{ id: 'pharmacy', label: 'Pharmacy' },
	{ id: 'laboratory', label: 'Laboratory' },
	{ id: 'radiology', label: 'Radiology' },
	{ id: 'ancillary', label: 'Ancillary' },
]

import PrescriptionIcon from '../../../assets/icons/consultation/prescription.svg'
import LabIcon from '../../../assets/icons/consultation/lab.svg'
import RadiologyIcon from '../../../assets/icons/consultation/radiology.svg'
import AncillaryIcon from '../../../assets/icons/consultation/ancillary.svg'

const TAB_ICONS: Record<string, string> = {
	pharmacy: PrescriptionIcon,
	laboratory: LabIcon,
	radiology: RadiologyIcon,
	ancillary: AncillaryIcon,
}

const CITY_OPTIONS = [
	{ value: 'bengaluru', label: 'Bengaluru' },
	{ value: 'mysuru', label: 'Mysuru' },
]
const AREA_OPTIONS = [
	{ value: 'kr_puram', label: 'KR Puram' },
	{ value: 'whitefield', label: 'Whitefield' },
	{ value: 'marathalli', label: 'Marathalli' },
]

// Fixed height for the results panel — the list scrolls internally instead
// of pushing the rest of the page down when it changes tabs/loads more rows.
const RESULTS_MAX_HEIGHT = 360

interface Place {
	id: string
	name: string
	address: string
	phone?: string
	distance?: string
}

// Ancillary centers are not backed by an API yet — keep the existing
// placeholder list for that tab only.
const ANCILLARY_MOCK_PLACES: Place[] = [
	{
		id: '1',
		name: 'Apollo Pharmacy, Chikpet - KR Puram',
		address:
			'1st Block, 318, 9th Main Rd, near The Studio, HRBR Layout 1st Block, HRBR Layout, Kalyan Nagar, Bengaluru, Karnataka 560043',
		phone: '+91 9876543250',
		distance: '300m away',
	},
	{
		id: '2',
		name: 'Med plus, Chikpet - KR Puram',
		address:
			'1st Block, 318, 9th Main Rd, near The Studio, HRBR Layout 1st Block, HRBR Layout, Kalyan Nagar, Bengaluru, Karnataka 560043',
		phone: '+91 9876543250',
		distance: '300m away',
	},
	{
		id: '3',
		name: 'jeevan medstore, Chikpet- KR Puram',
		address:
			'1st Block, 318, 9th Main Rd, near The Studio, HRBR Layout 1st Block, HRBR Layout, Kalyan Nagar, Bengaluru, Karnataka 560043',
		phone: '+91 9876543250',
		distance: '300m away',
	},
]

// ── Helpers ─────────────────────────────────────────────────────────────
type SearchResultLike = {
	id: string
	name: string
	address: string
	city: string
	state: string
}

/** Search results are one row per test/scan — collapse them into one entry per center. */
function toPlaces<T extends SearchResultLike>(items: T[]): Place[] {
	const byId = new Map<string, Place>()

	items.forEach((item) => {
		if (byId.has(item.id)) return
		byId.set(item.id, {
			id: item.id,
			name: item.name,
			address: [item.address, item.city, item.state].filter(Boolean).join(', '),
		})
	})

	return Array.from(byId.values())
}

/** Pharmacy list is already one row per pharmacy — just reshape it. */
function toPharmacyPlaces(items: PharmacyListItem[]): Place[] {
	return items.map((item) => ({
		id: item.id,
		name: item.name || item.owner_name || 'Pharmacy',
		address: [item.address, item.city].filter(Boolean).join(', ') || 'Address not available',
	}))
}

interface ShareWithProps {
	appointmentId?: string
}

export default function ShareWith({ appointmentId }: ShareWithProps) {
	const [activeTab, setActiveTab] = useState('laboratory')
	const [city, setCity] = useState('')
	const [area, setArea] = useState('')

	const handleShare = async (place: Place) => {
		if (!appointmentId) {
			toast.error('No active appointment context found.')
			return
		}
		try {
			await ApiService.post('/api/referrals/share', {
				appointment_id: appointmentId,
				target_type: activeTab,
				target_id: place.id,
			})
			toast.success(`Successfully shared prescription with ${place.name}!`)
		} catch {
			toast.error('Failed to share prescription with selected center.')
		}
	}

	const [pharmacyPlaces, setPharmacyPlaces] = useState<Place[]>([])
	const [laboratoryPlaces, setLaboratoryPlaces] = useState<Place[]>([])
	const [radiologyPlaces, setRadiologyPlaces] = useState<Place[]>([])
	const [placesLoading, setPlacesLoading] = useState(false)
	const [placesError, setPlacesError] = useState<string | null>(null)

	const isBackedTab = activeTab === 'pharmacy' || activeTab === 'laboratory' || activeTab === 'radiology'

	useEffect(() => {
		if (!isBackedTab) return

		let cancelled = false

		const fetchPlaces = async () => {
			setPlacesLoading(true)
			setPlacesError(null)

			try {
				if (activeTab === 'pharmacy') {
					const res = await getPharmacies({ city: city || undefined, limit: 50 })
					if (!cancelled) setPharmacyPlaces(toPharmacyPlaces(res.data))
				} else if (activeTab === 'laboratory') {
					const res = await searchLaboratories({ city: city || undefined, limit: 50 })
					if (!cancelled) setLaboratoryPlaces(toPlaces<LaboratorySearchResultItem>(res.data))
				} else {
					const res = await searchRadiologyCenters({ city: city || undefined, limit: 50 })
					if (!cancelled) setRadiologyPlaces(toPlaces<RadiologySearchResultItem>(res.data))
				}
			} catch {
				if (!cancelled) setPlacesError('Unable to load centers right now. Please try again.')
			} finally {
				if (!cancelled) setPlacesLoading(false)
			}
		}

		fetchPlaces()

		return () => {
			cancelled = true
		}
	}, [activeTab, city, isBackedTab])

	const places: Place[] =
		activeTab === 'pharmacy'
			? pharmacyPlaces
			: activeTab === 'laboratory'
				? laboratoryPlaces
				: activeTab === 'radiology'
					? radiologyPlaces
					: ANCILLARY_MOCK_PLACES

	const showLoading = isBackedTab && placesLoading
	const showError = isBackedTab && !placesLoading && !!placesError
	const showEmpty = !showLoading && !showError && places.length === 0
	const showList = !showLoading && !showError && places.length > 0

	const emptyStateLabel =
		activeTab === 'pharmacy'
			? 'No pharmacies found nearby.'
			: activeTab === 'laboratory'
				? 'No laboratories found nearby.'
				: activeTab === 'radiology'
					? 'No radiology centers found nearby.'
					: 'No results found nearby.'

	return (
		<Box sx={{ ...customCardStyle, mt: 2 }}>
			<Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
				Share with:
			</Typography>

			{/* Category tabs */}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-around',
					mb: 2.5,
					borderBottom: '1px solid',
					borderColor: 'divider',
					pb: 1,
				}}
			>
				{TABS.map((tab) => {
					const isActive = activeTab === tab.id
					return (
						<Box
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								cursor: 'pointer',
								px: 1,
								pb: 1,
								borderBottom: isActive ? '2.5px solid' : '2.5px solid transparent',
								borderColor: isActive ? 'primary.main' : 'transparent',
								transition: 'all 0.15s',
							}}
						>
							{/* {TAB_ICONS[tab.id]} */}
							<img
								src={TAB_ICONS[tab.id]}
								// alt={title}
								style={{ width: 42, height: 42, objectFit: 'cover' }}
							/>
							<Typography
								variant="caption"
								sx={{
									fontSize: '12px',
									fontWeight: isActive ? 600 : 400,
									mt: 0.5,
									color: isActive ? 'primary.main' : 'text.secondary',
								}}
							>
								{tab.label}
							</Typography>
						</Box>
					)
				})}
			</Box>

			{/* Select address */}
			<Typography
				variant="caption"
				sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 500, display: 'block', mb: 1 }}
			>
				Select address
			</Typography>
			<Grid container spacing={1.5} sx={{ mb: 2.5 }}>
				<Grid size={{ xs: 6 }}>
					<AppSelect
						label="City"
						value={city}
						options={CITY_OPTIONS}
						// placeholder="City"
						onChange={(e) => setCity(e.target.value as string)}
						size="small"
					/>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<AppSelect
						label="Area"
						value={area}
						options={AREA_OPTIONS}
						onChange={(e) => setArea(e.target.value as string)}
						size="small"
					/>
				</Grid>
			</Grid>

			{/* Results panel — fixed height + internal scroll so the card (and the
			    rest of the page) doesn't jump around as the list loads/changes. */}
			<Box
				sx={{
					maxHeight: RESULTS_MAX_HEIGHT,
					overflowY: 'auto',
					pr: 0.5,
					...customScrollbar,
				}}
			>
				{/* Loading state */}
				{showLoading && (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
						<CircularProgress size={22} />
					</Box>
				)}

				{/* Error state */}
				{showError && (
					<Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 2 }}>
						{placesError}
					</Typography>
				)}

				{/* Empty state */}
				{showEmpty && (
					<Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
						{emptyStateLabel}
					</Typography>
				)}

				{/* Place list */}
				{showList && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
						{places.map((place, index) => (
							<Box
								key={place.id}
								sx={{
									py: 1,
									borderTop: index === 0 ? 'none' : '1px solid',
									borderColor: 'divider',
									display: 'flex',
									alignItems: 'flex-start',
									justifyContent: 'space-between',
									gap: 1.5,
								}}
							>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 700, color: 'text.primary', fontSize: '13.5px', mb: 0.4 }}
									>
										{place.name}
									</Typography>
									<Typography
										variant="caption"
										sx={{
											color: 'text.secondary',
											fontSize: '12px',
											lineHeight: 1.5,
											display: 'block',
											mb: place.phone || place.distance ? 0.6 : 0,
										}}
									>
										{place.address}
									</Typography>
									{(place.phone || place.distance) && (
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
											{place.phone && (
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
													<PhoneIcon sx={{ fontSize: 13, color: 'primary.main' }} />
													<Typography variant="caption" sx={{ color: 'primary.main', fontSize: '12px' }}>
														{place.phone}
													</Typography>
												</Box>
											)}
											{place.phone && place.distance && (
												<Typography variant="caption" sx={{ color: 'text.disabled' }}>
													|
												</Typography>
											)}
											{place.distance && (
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
													<LocationOnOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
													<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
														{place.distance}
													</Typography>
												</Box>
											)}
										</Box>
									)}
								</Box>
								<AppButton
									variant="contained"
									label="Share"
									size="small"
									onClick={() => handleShare(place)}
									sx={{
										flexShrink: 0,
										alignSelf: 'flex-start',
										borderRadius: '8px',
										textTransform: 'none',
										fontWeight: 600,
										px: 2.5,
										py: 0.6,
										fontSize: '12px',
									}}
								/>
							</Box>
						))}
					</Box>
				)}
			</Box>
		</Box>
	)
}
