// src/features/radiology/search/components/RadiologySearchCard.tsx
import { Box, Typography, Avatar } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import AppButton from '../../../../components/common/Button/AppButton'
import { RadiologySearchResultItem } from '../../../../types/radiology-search'
import { formatINR } from '../../../../utils/Utils'

// ── Local asset map keyed by logo_s3_key value stored in DB ──────────────────
import apexImg from '../../../../assets/Radiology/Apex.png'
import eliteImg from '../../../../assets/Radiology/Elite.png'
import focusImg from '../../../../assets/Radiology/Focus Scanning.png'
import metroImg from '../../../../assets/Radiology/Metro Diagnostics.png'
import primeImg from '../../../../assets/Radiology/prime.png'

const LOGO_KEY_MAP: Record<string, string> = {
	'radiology/apex.png': apexImg,
	'radiology/elite.png': eliteImg,
	'radiology/focus_scanning.png': focusImg,
	'radiology/metro_diagnostics.png': metroImg,
	'radiology/prime.png': primeImg,
}

// Fallback: match by centre name if logo_s3_key is not yet set in DB
const LOGO_NAME_MAP: Record<string, string> = {
	'apex diagnostic laboratory': apexImg,
	'elite mri & ct center': eliteImg,
	'focus scan & imaging': focusImg,
	'metro diagnostics': metroImg,
	'prime diagnostics': primeImg,
}

function resolveLogoSrc(item: RadiologySearchResultItem): string {
	if (item.logo_s3_key) {
		const byKey = LOGO_KEY_MAP[item.logo_s3_key.toLowerCase()]
		if (byKey) return byKey
	}
	// Fallback to name-based lookup
	return LOGO_NAME_MAP[item.name.toLowerCase()] ?? ''
}

interface RadiologySearchCardProps {
	item: RadiologySearchResultItem
	/** Called when the user clicks Book Scan. Parent owns the RadiologyBookingPage drawer state. */
	onBookScan?: (item: RadiologySearchResultItem) => void
}

export default function RadiologySearchCard({ item, onBookScan }: RadiologySearchCardProps) {
	const logoSrc = resolveLogoSrc(item)

	const handleBookScan = (e: React.MouseEvent) => {
		e.stopPropagation()
		onBookScan?.(item)
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
			{/* Image area — same compact height as DoctorSearchCard */}
			<Box sx={{ position: 'relative', height: 160, bgcolor: 'grey.100' }}>
				<Avatar
					src={logoSrc}
					alt={item.name}
					variant="square"
					sx={{
						width: '100%',
						height: '100%',
						'& img': { objectFit: 'cover', objectPosition: 'center', height: '100%' },
					}}
				>
					<LocalHospitalIcon sx={{ fontSize: 56, color: 'primary.main', opacity: 0.3 }} />
				</Avatar>
			</Box>

			{/* Info area — compact like DoctorSearchCard */}
			<Box sx={{ p: 2 }}>
				{/* Facility Name */}
				<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.2, lineHeight: 1.25, fontSize: '1rem' }}>
					{item.name}
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
							<Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.1rem' }}>
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

				{/* Book button — opens the AppDrawer-based booking flow owned by the parent search page */}
				<AppButton
					label="Book Scan"
					fullWidth
					onClick={handleBookScan}
					sx={{ borderRadius: '10px', py: 0.8, fontWeight: 600 }}
				/>
			</Box>
		</Box>
	)
}
