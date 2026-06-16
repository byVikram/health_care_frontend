// src/features/radiology/search/components/RadiologySearchFilters.tsx
import { useState, useEffect } from 'react'
import { Box, Typography, Slider, Divider, Button, CircularProgress } from '@mui/material'
import { customCardStyle } from '../../../../styles/commonStyles'
import { formatINR } from '../../../../utils/Utils'
import { getScanTypes, ScanType } from '../../radiologyService'

export interface RadiologyFilterState {
	scanTypeId: string
	maxPrice: number
}

interface RadiologySearchFiltersProps {
	filters: RadiologyFilterState
	onChange: (filters: RadiologyFilterState) => void
	onClear: () => void
}

export default function RadiologySearchFilters({ filters, onChange, onClear }: RadiologySearchFiltersProps) {
	const [scanTypes, setScanTypes] = useState<ScanType[]>([])
	const [loading, setLoading] = useState(true)
	const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice)

	// Sync local price slider with parent prop if it changes externally (like clear all)
	useEffect(() => {
		setLocalMaxPrice(filters.maxPrice)
	}, [filters.maxPrice])

	// Fetch scan types on mount
	useEffect(() => {
		const fetchTypes = async () => {
			try {
				const res = await getScanTypes()
				if (res.success && res.data) {
					setScanTypes(res.data)
				}
			} catch (err) {
				console.error('Failed to load scan types', err)
			} finally {
				setLoading(false)
			}
		}
		void fetchTypes()
	}, [])

	return (
		<Box
			sx={{
				...customCardStyle,
				display: 'flex',
				flexDirection: 'column',
				gap: 3,
				maxHeight: 'calc(100vh - 48px)',
				overflowY: 'auto',
				'&::-webkit-scrollbar': {
					width: '6px',
				},
				'&::-webkit-scrollbar-thumb': {
					backgroundColor: 'rgba(0,0,0,0.1)',
					borderRadius: '4px',
				},
				'&::-webkit-scrollbar-thumb:hover': {
					backgroundColor: 'rgba(0,0,0,0.2)',
				},
			}}
		>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="h6" sx={{ fontWeight: 700 }}>
					Filters
				</Typography>
				<Button size="small" onClick={onClear} sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 600 }}>
					Clear All
				</Button>
			</Box>

			<Divider />

			{/* Scan Types */}
			<Box>
				<Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
					Scan Type
				</Typography>
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
						<CircularProgress size={24} sx={{ color: 'primary.main' }} />
					</Box>
				) : (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
						<Box
							onClick={() => onChange({ ...filters, scanTypeId: '' })}
							sx={{
								px: 1.5,
								py: 0.8,
								borderRadius: '8px',
								cursor: 'pointer',
								bgcolor: filters.scanTypeId === '' ? 'primary.main' : 'transparent',
								color: filters.scanTypeId === '' ? '#fff' : 'text.secondary',
								fontSize: '13px',
								fontWeight: filters.scanTypeId === '' ? 600 : 400,
								transition: 'all 0.15s',
								'&:hover': {
									bgcolor: filters.scanTypeId === '' ? 'primary.main' : 'rgba(43,111,113,0.06)',
								},
							}}
						>
							All Scans
						</Box>
						{scanTypes.map((type) => (
							<Box
								key={type.id}
								onClick={() => onChange({ ...filters, scanTypeId: String(type.id) })}
								sx={{
									px: 1.5,
									py: 0.8,
									borderRadius: '8px',
									cursor: 'pointer',
									bgcolor: filters.scanTypeId === String(type.id) ? 'primary.main' : 'transparent',
									color: filters.scanTypeId === String(type.id) ? '#fff' : 'text.secondary',
									fontSize: '13px',
									fontWeight: filters.scanTypeId === String(type.id) ? 600 : 400,
									transition: 'all 0.15s',
									'&:hover': {
										bgcolor: filters.scanTypeId === String(type.id) ? 'primary.main' : 'rgba(43,111,113,0.06)',
									},
								}}
							>
								{type.name}
							</Box>
						))}
					</Box>
				)}
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
					min={500}
					max={10000}
					step={250}
					onChange={(_, val) => setLocalMaxPrice(val as number)}
					onChangeCommitted={(_, val) => onChange({ ...filters, maxPrice: val as number })}
					sx={{ color: 'primary.main' }}
				/>
				<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>{`\u20B9500`}</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>{`\u20B910,000`}</Typography>
				</Box>
			</Box>
		</Box>
	)
}
