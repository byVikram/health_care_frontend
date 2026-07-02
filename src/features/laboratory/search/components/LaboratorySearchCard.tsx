// src/features/laboratory/search/components/LaboratorySearchCard.tsx
import { Box, Typography, Avatar } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BiotechIcon from '@mui/icons-material/Biotech'
import AppButton from '../../../../components/common/Button/AppButton'
import { LaboratorySearchResultItem } from '../../../../types/laboratory-search'
import { formatINR } from '../../../../utils/Utils'

// ── Local asset map keyed by logo_s3_key value stored in DB ──────────────────
import lab1Img from '../../../../assets/Laboratory/lab1.png'
import lab2Img from '../../../../assets/Laboratory/lab2.png'
import lab3Img from '../../../../assets/Laboratory/lab3.png'
import lab4Img from '../../../../assets/Laboratory/lab4.png'
import lab5Img from '../../../../assets/Laboratory/lab5.png'
import lab6Img from '../../../../assets/Laboratory/lab6.png'
import lab7Img from '../../../../assets/Laboratory/lab7.png'

const LOGO_KEY_MAP: Record<string, string> = {
	'laboratory/apollo.png': lab1Img,
	'laboratory/metropolis.png': lab2Img,
	'laboratory/lal_pathlabs.png': lab3Img,
	'laboratory/thyrocare.png': lab4Img,
	'laboratory/srl.png': lab5Img,
	'laboratory/vijaya.png': lab6Img,
	'laboratory/neuberg.png': lab7Img,
}

// Fallback: match by lab name if logo_s3_key is not yet set in DB
const LOGO_NAME_MAP: Record<string, string> = {
	'apollo diagnostics': lab1Img,
	'metropolis healthcare': lab2Img,
	'lal pathlabs': lab3Img,
	'thyrocare technologies': lab4Img,
	'srl diagnostics': lab5Img,
	'vijaya diagnostic centre': lab6Img,
	'neuberg diagnostics': lab7Img,
}

function resolveLogoSrc(item: LaboratorySearchResultItem): string {
	if (item.logo_s3_key) {
		const byKey = LOGO_KEY_MAP[item.logo_s3_key.toLowerCase()]
		if (byKey) return byKey
	}
	// Fallback to name-based lookup
	return LOGO_NAME_MAP[item.name.toLowerCase()] ?? ''
}

interface LaboratorySearchCardProps {
	item: LaboratorySearchResultItem
	onBookTest?: (item: LaboratorySearchResultItem) => void
}

export default function LaboratorySearchCard({ item, onBookTest }: LaboratorySearchCardProps) {
	const logoSrc = resolveLogoSrc(item)
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
					src={logoSrc}
					alt={item.name}
					variant="square"
					sx={{
						width: '100%',
						height: '100%',
						'& img': { objectFit: 'cover', objectPosition: 'center', height: '100%' },
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
