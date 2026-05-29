// src/features/doctor/components/SearchFilters.tsx
import { useState, useEffect } from 'react'
import { formatINR } from '../../../../utils/Utils'
import { Box, Typography, Slider, Divider } from '@mui/material'
import { customCardStyle } from '../../../../styles/commonStyles'
import StarIcon from '@mui/icons-material/Star'

export interface FilterState {
	speciality: string
	consultationType: 'all' | 'clinic' | 'video'
	minRating: number
	maxPrice: number
}

interface SearchFiltersProps {
	filters: FilterState
	onChange: (filters: FilterState) => void
}

export default function SearchFilters({ filters, onChange }: SearchFiltersProps) {
	// Local slider value — updates smoothly on every drag pixel
	// but only propagates to parent (and triggers a fetch) on mouse-up
	const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice)

	// Keep local value in sync if parent resets filters (e.g. on search clear)
	useEffect(() => {
		setLocalMaxPrice(filters.maxPrice)
	}, [filters.maxPrice])

	const consultationTypes = [
		{ id: 'all', label: 'All' },
		{ id: 'clinic', label: 'Clinic Visit' },
		{ id: 'video', label: 'Video Call' },
	]

	const ratingOptions = [4.5, 4.0, 3.5, 3.0]

	return (
		<Box
			sx={{
				...customCardStyle,
				display: 'flex',
				flexDirection: 'column',
				gap: 3,
			}}
		>
			<Typography variant="h5" sx={{ fontWeight: 700 }}>
				Filters
			</Typography>

			<Divider />

			{/* Consultation Type */}
			<Box>
				<Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
					Consultation Type
				</Typography>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
					{consultationTypes.map((type) => (
						<Box
							key={type.id}
							onClick={() =>
								onChange({ ...filters, consultationType: type.id as FilterState['consultationType'] })
							}
							sx={{
								px: 1.5,
								py: 0.8,
								borderRadius: '8px',
								cursor: 'pointer',
								bgcolor: filters.consultationType === type.id ? 'primary.main' : 'transparent',
								color: filters.consultationType === type.id ? '#fff' : 'text.secondary',
								fontSize: '13px',
								fontWeight: filters.consultationType === type.id ? 600 : 400,
								transition: 'all 0.15s',
								'&:hover': {
									bgcolor:
										filters.consultationType === type.id ? 'primary.main' : 'rgba(43,111,113,0.06)',
								},
							}}
						>
							{type.label}
						</Box>
					))}
				</Box>
			</Box>

			<Divider />

			{/* Minimum Rating */}
			<Box>
				<Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
					Minimum Rating
				</Typography>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
					{ratingOptions.map((r) => (
						<Box
							key={r}
							onClick={() => onChange({ ...filters, minRating: r })}
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1,
								px: 1.5,
								py: 0.8,
								borderRadius: '8px',
								cursor: 'pointer',
								bgcolor: filters.minRating === r ? 'primary.main' : 'transparent',
								color: filters.minRating === r ? '#fff' : 'text.secondary',
								fontSize: '13px',
								fontWeight: filters.minRating === r ? 600 : 400,
								transition: 'all 0.15s',
								'&:hover': {
									bgcolor: filters.minRating === r ? 'primary.main' : 'rgba(43,111,113,0.06)',
								},
							}}
						>
							<StarIcon sx={{ fontSize: 15, color: filters.minRating === r ? '#fff' : '#f5a623' }} />
							<Typography
								variant="caption"
								sx={{ fontSize: '13px', fontWeight: 'inherit', color: 'inherit' }}
							>
								{r}+ & above
							</Typography>
						</Box>
					))}
				</Box>
			</Box>

			<Divider />

			{/* Max Price */}
			<Box>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
						Max Price
					</Typography>
					<Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
						{formatINR(localMaxPrice)}
					</Typography>
				</Box>
				<Slider
					value={localMaxPrice}
					min={100}
					max={1000}
					step={50}
					// Update display only — no API call while dragging
					onChange={(_, val) => setLocalMaxPrice(val as number)}
					// Fire the actual filter change (and fetch) only when the user releases
					onChangeCommitted={(_, val) => onChange({ ...filters, maxPrice: val as number })}
					sx={{ color: 'primary.main' }}
				/>
				<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>{`\u20B9100`}</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>{`\u20B91000`}</Typography>
				</Box>
			</Box>
		</Box>
	)
}
