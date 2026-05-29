// src/features/Pharmacy/components/OrdersScreen.tsx
import React from 'react'
import { Box, Typography, Paper, Button, Grid, Stack } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { OrderCard } from '../../../components/common/Card/OrderCard'
import PendingIcon from '../../../assets/Pharmacy/Pendingorders.svg'
import OnTheWayIcon from '../../../assets/Pharmacy/Ontheway.svg'
import DeliveredIcon from '../../../assets/Pharmacy/Deliveredorders.svg'
import CancelledIcon from '../../../assets/Pharmacy/Cancelledorders.svg'
import DocIcon from '../../../assets/Pharmacy/docxs.svg'
import { customCardStyle } from '../../../styles/commonStyles'

interface StatItem {
	title: string
	stats: string
	imageSrc: string
	iconBgColor: string
}

const OrdersScreen: React.FC = () => {
	const statsData: StatItem[] = [
		{
			title: 'Pending orders',
			stats: '03 Orders',
			imageSrc: PendingIcon,
			iconBgColor: '#FFF1D9',
		},
		{
			title: 'On the way',
			stats: '08 Orders',
			imageSrc: OnTheWayIcon,
			iconBgColor: '#DEE9FF',
		},
		{
			title: 'Delivered orders',
			stats: '120 Orders',
			imageSrc: DeliveredIcon,
			iconBgColor: '#DFF5E4',
		},
		{
			title: 'Cancelled orders',
			stats: '21 Orders',
			imageSrc: CancelledIcon,
			iconBgColor: '#FFE3E7',
		},
	]

	return (
		<Box sx={{ minHeight: 'auto', p: { xs: 2, md: 3 } }}>
			<Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: '#1A2C33' }}>
				Orders
			</Typography>

			<Paper
				elevation={0}
				sx={{
					...customCardStyle,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					gap: 2,
					py: 1, 
					px: 2,
					minHeight: 'auto',
					mb: 3, 
				}}
			>
				<Stack direction="row" spacing={2} alignItems="center">
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: 2,
							bgcolor: '#eaf1ff',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<img src={DocIcon} width={24} height={24} alt="docs" />
					</Box>
					<Typography variant="body2" sx={{ color: '#333', fontWeight: 500 }}>
						Manage the orders shared by doctors/patients
					</Typography>
				</Stack>
				<Button
					endIcon={<ArrowForwardIcon />}
					size="small"
					sx={{
						color: '#2bbec7',
						fontWeight: 600,
						textTransform: 'none',
						'&:hover': { bgcolor: 'transparent', opacity: 0.8 },
					}}
				>
					View
				</Button>
			</Paper>

			{/* Grid of stat cards */}
			<Grid container spacing={2}>
				{statsData.map((item, idx) => (
					<Grid size={{ xs: 12, sm: 6 }} key={idx}>
						<OrderCard
							imageSrc={item.imageSrc}
							title={item.title}
							stats={item.stats}
							iconBgColor={item.iconBgColor}
						/>
					</Grid>
				))}
			</Grid>
		</Box>
	)
}

export default OrdersScreen
