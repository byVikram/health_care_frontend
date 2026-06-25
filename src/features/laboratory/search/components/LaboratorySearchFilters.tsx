// src/features/laboratory/search/components/LaboratorySearchFilters.tsx
import { useState, useEffect } from 'react'
import { Box, Typography, Slider, Divider, Button } from '@mui/material'
import { customCardStyle } from '../../../../styles/commonStyles'
import { formatINR } from '../../../../utils/Utils'

export interface LaboratoryFilterState {
	testTypeId: string
	maxPrice: number
}

interface LaboratorySearchFiltersProps {
	filters: LaboratoryFilterState
	onChange: (filters: LaboratoryFilterState) => void
	onClear: () => void
}

// UI-only sample categories — not wired to backend filter, just for future use
const TEST_CATEGORIES = [
	'Blood Tests',
	'Urine Tests',
	'Thyroid Panel',
	'Lipid Profile',
	'Liver Function',
	'Kidney Function',
	'Diabetes',
	'Hormones',
	'Vitamins',
	'Others',
]

export default function LaboratorySearchFilters({
	filters,
	onChange,
	onClear,
}: LaboratorySearchFiltersProps) {
	const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice)
	const [selectedCategory, setSelectedCategory] = useState<string>('')

	// Sync when parent clears
	useEffect(() => {
		setLocalMaxPrice(filters.maxPrice)
	}, [filters.maxPrice])

	const handleClear = () => {
		setSelectedCategory('')
		onClear()
	}

	return (
		<Box
			sx={{
				...customCardStyle,
				display: 'flex',
				flexDirection: 'column',
				gap: 3,
				maxHeight: 'calc(100vh - 48px)',
				overflowY: 'auto',
				'&::-webkit-scrollbar': { width: '6px' },
				'&::-webkit-scrollbar-thumb': {
					backgroundColor: 'rgba(0,0,0,0.1)',
					borderRadius: '4px',
				},
				'&::-webkit-scrollbar-thumb:hover': {
					backgroundColor: 'rgba(0,0,0,0.2)',
				},
			}}
		>
			{/* Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="h6" sx={{ fontWeight: 700 }}>
					Filters
				</Typography>
				<Button
					size="small"
					onClick={handleClear}
					sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 600 }}
				>
					Clear All
				</Button>
			</Box>

			<Divider />

			{/* Test Category (UI-only) */}
			<Box>
				<Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
					Test Category
				</Typography>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
					{TEST_CATEGORIES.map((cat) => {
						const active = selectedCategory === cat
						return (
							<Box
								key={cat}
								onClick={() => setSelectedCategory(active ? '' : cat)}
								sx={{
									px: 1.5,
									py: 0.5,
									borderRadius: '20px',
									border: '1px solid',
									borderColor: active ? 'primary.main' : 'divider',
									bgcolor: active ? 'primary.main' : 'transparent',
									color: active ? '#fff' : 'text.secondary',
									fontSize: '12px',
									fontWeight: active ? 600 : 400,
									cursor: 'pointer',
									transition: 'all 0.15s',
									userSelect: 'none',
									'&:hover': {
										borderColor: 'primary.main',
										color: active ? '#fff' : 'primary.main',
									},
								}}
							>
								{cat}
							</Box>
						)
					})}
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
					max={10000}
					step={100}
					onChange={(_, val) => setLocalMaxPrice(val as number)}
					onChangeCommitted={(_, val) =>
						onChange({ ...filters, maxPrice: val as number })
					}
					sx={{ color: 'primary.main' }}
				/>
				<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>
						{'₹100'}
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>
						{'₹10,000'}
					</Typography>
				</Box>
			</Box>
		</Box>
	)
}
