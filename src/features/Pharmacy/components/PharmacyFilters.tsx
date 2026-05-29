import { Card, CardContent, FormControlLabel, MenuItem, Switch, Typography } from '@mui/material'
import AppInput from '../../../components/common/Input/AppInput'

export interface PharmacyFilterState {
	city: string
	homeDelivery: boolean
	is24x7: boolean
	emergencyMeds: boolean
}

interface Props {
	filters: PharmacyFilterState
	onChange: (newFilters: PharmacyFilterState) => void
}

const CITIES = [
	'All Cities',
	'Mumbai',
	'Delhi',
	'Bangalore',
	'Chennai',
	'Kolkata',
	'Hyderabad',
	'Pune',
	'Ahmedabad',
	'Jaipur',
	'Surat',
]

export default function PharmacyFilters({ filters, onChange }: Props) {
	const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		onChange({ ...filters, city: value === 'All Cities' ? '' : value })
	}

	const handleToggle =
		(key: keyof Omit<PharmacyFilterState, 'city'>) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange({ ...filters, [key]: e.target.checked })
		}

	return (
		<Card sx={{ borderRadius: 3, border: '1px solid #EAECF0' }}>
			<CardContent>
				<Typography variant="subtitle1" fontWeight={600} mb={2}>
					Filters
				</Typography>

				<AppInput
					select
					label="City"
					value={filters.city || 'All Cities'}
					onChange={handleCityChange}
					size="small"
					sx={{ mb: 2 }}
				>
					{CITIES.map((city) => (
						<MenuItem key={city} value={city}>
							{city}
						</MenuItem>
					))}
				</AppInput>

				<FormControlLabel
					control={
						<Switch
							checked={filters.homeDelivery}
							onChange={handleToggle('homeDelivery')}
							color="primary"
						/>
					}
					label="Home Delivery Available"
					sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', ml: 0 }}
					labelPlacement="start"
				/>
				<FormControlLabel
					control={
						<Switch
							checked={filters.is24x7}
							onChange={handleToggle('is24x7')}
							color="primary"
						/>
					}
					label="Open 24×7"
					sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', ml: 0 }}
					labelPlacement="start"
				/>
				<FormControlLabel
					control={
						<Switch
							checked={filters.emergencyMeds}
							onChange={handleToggle('emergencyMeds')}
							color="primary"
						/>
					}
					label="Emergency Medicines"
					sx={{ display: 'flex', justifyContent: 'space-between', ml: 0 }}
					labelPlacement="start"
				/>
			</CardContent>
		</Card>
	)
}