// src/features/pharmacy/components/PharmacySearchCard.tsx
import { Box, Typography, Avatar, Chip } from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EmergencyIcon from '@mui/icons-material/Emergency'
import LocationOnIcon from '@mui/icons-material/LocationOn'
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
// import { useNavigate } from 'react-router-dom'
import AppButton from '../../../components/common/Button/AppButton'
import { PharmacyItem } from '../../../types/pharmacy'

import pharmacyImg2 from '../../../assets/Pharmacy/pharmacy2.png'
import pharmacyImg3 from '../../../assets/Pharmacy/pharmacy3.png'
import pharmacyImg4 from '../../../assets/Pharmacy/pharmacy4.png'

const pharmacyImages = [pharmacyImg2, pharmacyImg3, pharmacyImg4]

const getPharmacyImage = (id: string) => {
	let hash = 0
	for (let i = 0; i < id.length; i++) {
		hash = (hash << 5) - hash + id.charCodeAt(i)
		hash |= 0
	}
	return pharmacyImages[Math.abs(hash) % pharmacyImages.length]
}

interface PharmacySearchCardProps {
	pharmacy: PharmacyItem
}

export default function PharmacySearchCard({ pharmacy }: PharmacySearchCardProps) {
	// const navigate = useNavigate()
	const {
		id,
		name,
		address,
		city,
		operating_hours,
		home_delivery_available,
		is_24_x_7,
		emergency_medicine_available,
	} = pharmacy

	const handlePlaceOrder = (e: React.MouseEvent) => {
		e.stopPropagation()
		// navigate(`/order/new?pharmacyId=${id}`)
	}

	const handleCardClick = () => {
		// navigate(`/pharmacies/${id}`)
	}

	return (
		<Box
			onClick={handleCardClick}
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '8px',
				overflow: 'hidden',
				cursor: 'pointer',
				transition: 'box-shadow 0.2s, transform 0.2s',
				display: 'flex',
				flexDirection: 'column',
				height: '100%', // Makes all cards same height in grid
				'&:hover': {
					boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
					transform: 'translateY(-2px)',
				},
			}}
		>
			{/* Fixed image area */}
			<Box sx={{ position: 'relative', height: 160, flexShrink: 0 }}>
				<Avatar
					src={getPharmacyImage(id)}
					alt={name}
					variant="square"
					sx={{
						width: '100%',
						height: '100%',
						m: 'auto',
						'& img': { objectFit: 'cover', objectPosition: 'center', height: '100%' },
					}}
				/>
			</Box>

			<Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
				<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.2 }}>
					{name}
				</Typography>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
					<LocationOnIcon sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} />
					<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
						{address}, {city}
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
					<AccessTimeIcon sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} />
					<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
						{is_24_x_7 ? 'Open 24×7' : `${operating_hours.open} – ${operating_hours.close}`}
					</Typography>
				</Box>

				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: 1,
						mb: 2,
						minHeight: 32,
					}}
				>
					{home_delivery_available && (
						<Chip
							icon={<LocalShippingIcon sx={{ fontSize: 16 }} />}
							label="Home Delivery"
							size="small"
							sx={{ bgcolor: '#e8f5f5', color: '#2B6F71' }}
						/>
					)}
					{emergency_medicine_available && (
						<Chip
							icon={<EmergencyIcon sx={{ fontSize: 16 }} />}
							label="Emergency Meds"
							size="small"
							sx={{ bgcolor: '#ffebee', color: '#c62828' }}
						/>
					)}
				</Box>

				<Box sx={{ flex: 1 }} />

				<AppButton
					label="Place Order"
					fullWidth
					// startIcon={<ShoppingCartIcon />}
					onClick={handlePlaceOrder}
					sx={{
						borderRadius: '10px',
						py: 0.8,
						bgcolor: '#2B6F71',
						'&:hover': { bgcolor: '#1f5557' },
					}}
				/>
			</Box>
		</Box>
	)
}
