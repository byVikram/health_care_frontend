// src/features/radiology/search/components/RadiologySearchFilters.tsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Typography, Slider, Divider, Button } from '@mui/material'
import { customCardStyle } from '../../../../styles/commonStyles'
import { formatINR } from '../../../../utils/Utils'

export interface RadiologyFilterState {
	scanTypeId: string
	maxPrice: number
}

interface RadiologySearchFiltersProps {
	filters: RadiologyFilterState
	onChange: (filters: RadiologyFilterState) => void
	onClear: () => void
}

// ── Body-part config (UI-only, not wired to backend) ─────────────────────────
const BODY_PARTS_BY_MODALITY: Record<string, string[]> = {
	mri:        ['Brain', 'Spine', 'Knee', 'Shoulder', 'Neck', 'Hip', 'Wrist', 'Pelvis', 'Abdomen', 'Others'],
	ct:         ['Brain', 'Spine', 'Abdomen', 'Chest', 'Pelvis', 'Neck', 'Others'],
	xray:       ['Chest', 'Wrist', 'Knee', 'Leg', 'Shoulder', 'Hip', 'Others'],
	ultrasound: ['Abdomen', 'Pelvis', 'Neck', 'Shoulder', 'Others'],
}
const ALL_BODY_PARTS = ['Brain', 'Spine', 'Knee', 'Shoulder', 'Pelvis', 'Leg', 'Wrist', 'Hip', 'Neck', 'Abdomen', 'Chest', 'Others']

function modalityFromScanName(name: string): string {
	const lower = name.toLowerCase()
	if (lower.includes('mri'))                                  return 'mri'
	if (lower.includes('ct'))                                   return 'ct'
	if (lower.includes('x-ray') || lower.includes('xray'))     return 'xray'
	if (lower.includes('ultrasound') || lower.includes('sono')) return 'ultrasound'
	return 'other'
}

export default function RadiologySearchFilters({ filters, onChange, onClear }: RadiologySearchFiltersProps) {
	const [searchParams] = useSearchParams()
	const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice)
	const [selectedBodyPart, setSelectedBodyPart] = useState<string>('')

	// Sync price slider when parent clears
	useEffect(() => {
		setLocalMaxPrice(filters.maxPrice)
	}, [filters.maxPrice])

	// Reset body part when scan type changes (URL-driven)
	const scanTypeName = searchParams.get('scan_type_name') || ''
	useEffect(() => {
		setSelectedBodyPart('')
	}, [scanTypeName])

	// Derive body parts from the scan_type_name URL param set by the modal
	const bodyParts = (() => {
		if (!scanTypeName) return ALL_BODY_PARTS
		const key = modalityFromScanName(scanTypeName)
		return BODY_PARTS_BY_MODALITY[key] ?? ALL_BODY_PARTS
	})()

	const handleClear = () => {
		setSelectedBodyPart('')
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

			{/* Body Part (UI-only) */}
			<Box>
				<Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
					Body Part
				</Typography>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
					{bodyParts.map((part) => {
						const active = selectedBodyPart === part
						return (
							<Box
								key={part}
								onClick={() => setSelectedBodyPart(active ? '' : part)}
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
								{part}
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
					min={500}
					max={10000}
					step={250}
					onChange={(_, val) => setLocalMaxPrice(val as number)}
					onChangeCommitted={(_, val) => onChange({ ...filters, maxPrice: val as number })}
					sx={{ color: 'primary.main' }}
				/>
				<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>{'₹500'}</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>{'₹10,000'}</Typography>
				</Box>
			</Box>
		</Box>
	)
}
