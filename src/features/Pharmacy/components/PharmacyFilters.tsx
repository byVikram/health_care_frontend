import { Box, Typography, Divider } from '@mui/material'
import { customCardStyle } from '../../../styles/commonStyles'
import AppSwitch from '../../../components/common/Switch/AppSwitch'

export interface PharmacyFilterState {
	homeDelivery: boolean
	is24x7: boolean
	emergencyMeds: boolean
}

interface Props {
	filters: PharmacyFilterState
	onChange: (newFilters: PharmacyFilterState) => void
}

export default function PharmacyFilters({ filters, onChange }: Props) {
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
			<Typography variant="h5" sx={{ fontWeight: 700 }}>
				Filters
			</Typography>

			<Divider />

			{/* Services & Status */}
			<Box>
				<Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
					Services & Status
				</Typography>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Typography sx={{ color: 'text.secondary', fontSize: '13px', fontWeight: 500 }}>
							Home Delivery
						</Typography>
						<AppSwitch
							checked={filters.homeDelivery}
							onChange={(e) => onChange({ ...filters, homeDelivery: e.target.checked })}
						/>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Typography sx={{ color: 'text.secondary', fontSize: '13px', fontWeight: 500 }}>
							Open 24×7
						</Typography>
						<AppSwitch
							checked={filters.is24x7}
							onChange={(e) => onChange({ ...filters, is24x7: e.target.checked })}
						/>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Typography sx={{ color: 'text.secondary', fontSize: '13px', fontWeight: 500 }}>
							Emergency Medicines
						</Typography>
						<AppSwitch
							checked={filters.emergencyMeds}
							onChange={(e) => onChange({ ...filters, emergencyMeds: e.target.checked })}
						/>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
