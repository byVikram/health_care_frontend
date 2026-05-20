// src/features/doctor/components/SearchFilters.tsx
import { formatINR } from '../../../../utils/Utils'
import { Box, Typography, Slider, Divider } from '@mui/material'
import { customCardStyle } from '../../../../styles/commonStyles'
import StarIcon from '@mui/icons-material/Star'
// import { getSpecialityIcon } from '../../../../components/common/SpecialityIconMap'
// import { SpecialityItem } from '../../../../types/speciality'

export interface FilterState {
	speciality: string
	consultationType: 'all' | 'clinic' | 'video'
	minRating: number
	maxPrice: number
}

interface SearchFiltersProps {
	filters: FilterState
	onChange: (filters: FilterState) => void
	// specialities: SpecialityItem[]
}

export default function SearchFilters({ filters, onChange }: SearchFiltersProps) {
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

			{/* <Divider /> */}

			{/* Speciality */}
			{/* <Box>
				<Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
					Speciality
				</Typography>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
					<Box
						onClick={() => onChange({ ...filters, speciality: '' })}
						sx={{
							px: 1.5,
							py: 0.8,
							borderRadius: '8px',
							cursor: 'pointer',
							bgcolor: filters.speciality === '' ? 'primary.main' : 'transparent',
							color: filters.speciality === '' ? '#fff' : 'text.secondary',
							fontSize: '13px',
							fontWeight: filters.speciality === '' ? 600 : 400,
							transition: 'all 0.15s',
							'&:hover': {
								bgcolor: filters.speciality === '' ? 'primary.main' : 'rgba(43,111,113,0.06)',
							},
						}}
					>
						All Specialities
					</Box>
					{specialities.map((s) => (
						<Box
							key={s.id}
							onClick={() => onChange({ ...filters, speciality: s.id })}
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1.5,
								px: 1.5,
								py: 0.8,
								borderRadius: '8px',
								cursor: 'pointer',
								bgcolor: filters.speciality === s.id ? 'primary.main' : 'transparent',
								color: filters.speciality === s.id ? '#fff' : 'text.secondary',
								fontSize: '13px',
								fontWeight: filters.speciality === s.id ? 600 : 400,
								transition: 'all 0.15s',
								'&:hover': {
									bgcolor: filters.speciality === s.id ? 'primary.main' : 'rgba(43,111,113,0.06)',
								},
							}}
						>
							<Box
								sx={{ display: 'flex', alignItems: 'center', '& svg': { fontSize: '18px !important' } }}
							>
								{getSpecialityIcon(s.icon_key, filters.speciality === s.id ? '#fff' : 'primary.main')}
							</Box>
							{s.label}
						</Box>
					))}
				</Box>
			</Box> */}

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
						{formatINR(filters.maxPrice)}
					</Typography>
				</Box>
				<Slider
					value={filters.maxPrice}
					min={100}
					max={1000}
					step={50}
					onChange={(_, val) => onChange({ ...filters, maxPrice: val as number })}
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
