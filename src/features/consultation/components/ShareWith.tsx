// src/features/consultation/components/ShareWith.tsx
import { useState } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppButton from '../../../components/common/Button/AppButton'
import { customCardStyle } from '../../../styles/commonStyles'

const TABS = [
	{ id: 'pharmacy', label: 'Pharmacy' },
	{ id: 'laboratory', label: 'Laboratory' },
	{ id: 'radiology', label: 'Radiology' },
	{ id: 'ancillary', label: 'Ancillary' },
]

const TAB_ICONS: Record<string, React.ReactNode> = {
	pharmacy: (
		<Box sx={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<svg viewBox="0 0 48 48" width="44" height="44">
				<rect x="10" y="4" width="28" height="36" rx="3" fill="#f0f7f8" stroke="#2B6F71" strokeWidth="1.5" />
				<text x="18" y="26" fontSize="14" fill="#2B6F71" fontWeight="bold">
					Rx
				</text>
				<line x1="14" y1="32" x2="34" y2="32" stroke="#2B6F71" strokeWidth="1.2" />
				<line x1="14" y1="36" x2="28" y2="36" stroke="#2B6F71" strokeWidth="1.2" />
			</svg>
		</Box>
	),
	laboratory: (
		<Box sx={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<svg viewBox="0 0 48 48" width="44" height="44">
				<rect x="8" y="4" width="32" height="36" rx="3" fill="#f0f7f8" stroke="#2B6F71" strokeWidth="1.5" />
				<rect x="13" y="10" width="22" height="4" rx="1" fill="#2B6F71" opacity="0.3" />
				<circle cx="18" cy="28" r="4" fill="#e53935" opacity="0.7" />
				<circle cx="30" cy="28" r="4" fill="#2B6F71" opacity="0.5" />
				<line x1="13" y1="20" x2="35" y2="20" stroke="#2B6F71" strokeWidth="1.2" />
			</svg>
		</Box>
	),
	radiology: (
		<Box sx={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<svg viewBox="0 0 48 48" width="44" height="44">
				<rect x="8" y="4" width="32" height="36" rx="3" fill="#f0f7f8" stroke="#2B6F71" strokeWidth="1.5" />
				<ellipse cx="24" cy="22" rx="10" ry="12" fill="none" stroke="#2B6F71" strokeWidth="1.5" />
				<line x1="24" y1="10" x2="24" y2="34" stroke="#2B6F71" strokeWidth="1" strokeDasharray="2" />
				<line x1="14" y1="22" x2="34" y2="22" stroke="#2B6F71" strokeWidth="1" strokeDasharray="2" />
			</svg>
		</Box>
	),
	ancillary: (
		<Box sx={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<svg viewBox="0 0 48 48" width="44" height="44">
				<rect x="8" y="4" width="32" height="36" rx="3" fill="#f0f7f8" stroke="#2B6F71" strokeWidth="1.5" />
				<path d="M20 18 L24 14 L28 18" fill="none" stroke="#e53935" strokeWidth="1.5" />
				<rect x="21" y="18" width="6" height="8" fill="#e53935" opacity="0.7" />
				<line x1="13" y1="30" x2="35" y2="30" stroke="#2B6F71" strokeWidth="1.2" />
				<line x1="13" y1="34" x2="28" y2="34" stroke="#2B6F71" strokeWidth="1.2" />
			</svg>
		</Box>
	),
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
const LOCALITY_OPTIONS = [
	{ value: 'chikpet', label: 'Chikpet' },
	{ value: 'kr_market', label: 'KR Market' },
	{ value: 'indiranagar', label: 'Indiranagar' },
]

interface Place {
	id: string
	name: string
	address: string
	phone: string
	distance: string
}

const MOCK_PLACES: Place[] = [
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

export default function ShareWith() {
	const [activeTab, setActiveTab] = useState('laboratory')
	const [city, setCity] = useState('')
	const [area, setArea] = useState('')
	const [locality, setLocality] = useState('')

	return (
		<Box sx={{ ...customCardStyle, mt: 2 }}>
			<Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.dark' }}>
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
							{TAB_ICONS[tab.id]}
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
				<Grid size={{ xs: 4 }}>
					<AppSelect
						label="City"
						value={city}
						options={CITY_OPTIONS}
						// placeholder="City"
						onChange={(e) => setCity(e.target.value as string)}
						size="small"
					/>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<AppSelect
						label="Area"
						value={area}
						options={AREA_OPTIONS}
						onChange={(e) => setArea(e.target.value as string)}
						size="small"
					/>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<AppSelect
						label="Locality"
						value={locality}
						options={LOCALITY_OPTIONS}
						// placeholder="Locality"
						onChange={(e) => setLocality(e.target.value as string)}
						size="small"
					/>
				</Grid>
			</Grid>

			{/* Place list */}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
				{MOCK_PLACES.map((place, index) => (
					<Box
						key={place.id}
						sx={{
							py: 1.5,
							borderTop: index === 0 ? 'none' : '1px solid',
							borderColor: 'divider',
						}}
					>
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
								mb: 0.8,
							}}
						>
							{place.address}
						</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
									<PhoneIcon sx={{ fontSize: 13, color: 'primary.main' }} />
									<Typography variant="caption" sx={{ color: 'primary.main', fontSize: '12px' }}>
										{place.phone}
									</Typography>
								</Box>
								<Typography variant="caption" sx={{ color: 'text.disabled' }}>
									|
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
									<LocationOnOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
									<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
										{place.distance}
									</Typography>
								</Box>
							</Box>
							<AppButton
								variant="contained"
								label="Share"
								size="small"
								sx={{
									borderRadius: '8px',
									textTransform: 'none',
									fontWeight: 600,
									px: 2.5,
									py: 0.6,
									fontSize: '12px',
								}}
							/>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	)
}
