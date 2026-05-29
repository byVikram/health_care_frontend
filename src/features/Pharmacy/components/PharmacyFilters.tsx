import { Card, CardContent, FormControlLabel, Switch, Typography } from '@mui/material'
import AppSelect from '../../../components/common/Select/AppSelect'

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

const CITY_OPTIONS = [
	{ label: 'All Cities', value: '' },
	{ label: 'Mumbai', value: 'Mumbai' },
	{ label: 'Delhi', value: 'Delhi' },
	{ label: 'Bangalore', value: 'Bangalore' },
	{ label: 'Chennai', value: 'Chennai' },
	{ label: 'Kolkata', value: 'Kolkata' },
	{ label: 'Hyderabad', value: 'Hyderabad' },
	{ label: 'Pune', value: 'Pune' },
	{ label: 'Ahmedabad', value: 'Ahmedabad' },
	{ label: 'Jaipur', value: 'Jaipur' },
	{ label: 'Surat', value: 'Surat' },
]

export default function PharmacyFilters({ filters, onChange }: Props) {
	const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ ...filters, city: e.target.value })
	}

	const handleToggle = (key: keyof Omit<PharmacyFilterState, 'city'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ ...filters, [key]: e.target.checked })
	}

	return (
		<Card sx={{ borderRadius: 3, border: '1px solid #EAECF0' }}>
			<CardContent>
				<Typography variant="subtitle1" fontWeight={600} mb={2}>
					Filters
				</Typography>

				<AppSelect
    label="City"
    value={filters.city}
    onChange={handleCityChange}
    options={CITY_OPTIONS}
    sx={{ mb: 2 }}
/>

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
					control={<Switch checked={filters.is24x7} onChange={handleToggle('is24x7')} color="primary" />}
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
