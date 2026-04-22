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
