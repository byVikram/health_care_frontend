// src/features/laboratory/search/components/LaboratorySearchCard.tsx
import { Box, Typography, Avatar } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BiotechIcon from '@mui/icons-material/Biotech'
import AppButton from '../../../../components/common/Button/AppButton'
import { LaboratorySearchResultItem } from '../../../../types/laboratory-search'
import { formatINR } from '../../../../utils/Utils'

interface LaboratorySearchCardProps {
	item: LaboratorySearchResultItem
	onBookTest?: (item: LaboratorySearchResultItem) => void
}

export default function LaboratorySearchCard({ item, onBookTest }: LaboratorySearchCardProps) {
	const handleBook = (e: React.MouseEvent) => {
		e.stopPropagation()
		onBookTest?.(item)
	}

	const getPricingLabel = () => {
		if (item.pricing_model === 'starting_from') return 'Starts from'
		if (item.pricing_model === 'fixed') return 'Fixed'
		return item.pricing_model
	}

	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '8px',
				overflow: 'hidden',
				transition: 'box-shadow 0.2s, transform 0.2s',
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				justifyContent: 'space-between',
				'&:hover': {
					boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
					transform: 'translateY(-2px)',
				},
			}}
		>
			{/* Banner */}
			<Box sx={{ position: 'relative', height: 160, bgcolor: 'grey.100' }}>
				<Avatar
					variant="square"
					sx={{
						width: '100%',
						height: '100%',
						bgcolor: 'grey.100',
					}}
				>
					<BiotechIcon sx={{ fontSize: 56, color: 'primary.main', opacity: 0.35 }} />
				</Avatar>
			</Box>

			{/* Info */}
			<Box sx={{ p: 2 }}>
				{/* Lab name */}
				<Typography
					variant="h6"
					sx={{ fontWeight: 700, color: 'text.primary', mb: 0.2, lineHeight: 1.25, fontSize: '1rem' }}
				>
					{item.name}
				</Typography>

				{/* Test name chip */}
				<Typography
					variant="caption"
					sx={{
						display: 'inline-block',
						bgcolor: 'rgba(43,111,113,0.08)',
						color: 'primary.main',
						fontWeight: 600,
						borderRadius: '20px',
						px: 1,
						py: 0.25,
						mb: 1,
						fontSize: '11px',
					}}
				>
					{item.test_name}
				</Typography>

				{/* Address */}
				<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.4, mb: 1.5 }}>
					<LocationOnIcon sx={{ fontSize: 13, color: 'primary.main', mt: 0.3 }} />
					<Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
						{item.address}, {item.city}, {item.state}
					</Typography>
				</Box>

				{/* Pricing */}
				<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 2 }}>
					{item.pricing_model !== 'quote_required' && item.base_price !== null ? (
						<>
							<Typography
								variant="h6"
								sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.1rem' }}
							>
								{formatINR(item.base_price)}
							</Typography>
							{item.pricing_model === 'starting_from' && (
								<Typography variant="caption" sx={{ color: 'text.secondary' }}>
									{getPricingLabel()}
								</Typography>
							)}
						</>
					) : (
						<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Contact for pricing
						</Typography>
					)}
				</Box>

				<AppButton
					label="Book Test"
					fullWidth
					onClick={handleBook}
					sx={{ borderRadius: '10px', py: 0.8, fontWeight: 600 }}
				/>
			</Box>
		</Box>
	)
}
