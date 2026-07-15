// src/features/pharmacy/components/PharmacySearchCard.tsx
import { Box, Typography, Avatar, Chip, Card } from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EmergencyIcon from '@mui/icons-material/Emergency'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
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
	/** Called when the user clicks Place Order. Parent owns the PlaceOrderPage drawer state. */
	onPlaceOrder?: (pharmacy: PharmacyItem) => void
}

export default function PharmacySearchCard({ pharmacy, onPlaceOrder }: PharmacySearchCardProps) {
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
		onPlaceOrder?.(pharmacy)
	}

	const handleCardClick = () => {
		// navigate(`/pharmacies/${id}`)
	}

	return (
		<Card
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
				height: '100%',
				'&:hover': {
					boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
					transform: 'translateY(-2px)',
				},
			}}
		>
			{/* Compact image height */}
			<Box sx={{ position: 'relative', height: 120, flexShrink: 0 }}>
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

			{/* Reduced inner padding */}
			<Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
				<Typography
					variant="subtitle1"
					sx={{ fontWeight: 700, color: 'text.primary', mb: 0.2, fontSize: '0.95rem' }}
				>
					{name}
				</Typography>

				{/* Smaller spacing for address + timing */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
					<LocationOnIcon sx={{ fontSize: 12, color: 'primary.main', flexShrink: 0 }} />
					<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
						{address}, {city}
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
					<AccessTimeIcon sx={{ fontSize: 12, color: 'primary.main', flexShrink: 0 }} />
					<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
						{is_24_x_7 ? 'Open 24×7' : `${operating_hours.open} – ${operating_hours.close}`}
					</Typography>
				</Box>

				{/* Tighter chip group */}
				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: 0.75,
						mb: 1.5,
						minHeight: 28,
					}}
				>
					{home_delivery_available && (
						<Chip
							icon={<LocalShippingIcon sx={{ fontSize: 14 }} />}
							label="Home Delivery"
							size="small"
							sx={{ bgcolor: '#e8f5f5', color: '#2B6F71', height: 24, fontSize: '0.7rem' }}
						/>
					)}
					{emergency_medicine_available && (
						<Chip
							icon={<EmergencyIcon sx={{ fontSize: 14 }} />}
							label="Emergency Meds"
							size="small"
							sx={{ bgcolor: '#ffebee', color: '#c62828', height: 24, fontSize: '0.7rem' }}
						/>
					)}
				</Box>

				<Box sx={{ flex: 1 }} />

				{/* Compact button */}
				<AppButton
					label="Place Order"
					fullWidth
					startIcon={<ShoppingCartIcon />}
					onClick={handlePlaceOrder}
					sx={{
						borderRadius: '8px',
						py: 0.5,
						bgcolor: '#2B6F71',
						'&:hover': { bgcolor: '#1f5557' },
						fontSize: '0.8rem',
					}}
				/>
			</Box>
		</Card>
	)
}
