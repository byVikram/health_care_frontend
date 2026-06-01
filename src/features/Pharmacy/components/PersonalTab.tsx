// src/features/Pharmacy/components/PersonalTab.tsx
import { useState, useEffect } from 'react'
import { Box, Typography, Grid, InputAdornment } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppDatePicker from '../../../components/common/DatePicker/AppDatePicker'
import ProfileFormActions from '../../../components/common/ProfileFormActions/ProfileFormActions'
import { customCardStyle } from '../../../styles/commonStyles'
import { PharmacyProfilePersonal } from '../profile/PharmacyProfilePage'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { updateMyPharmacyDetails } from '../pharmacyService'

interface PharmacyPersonalTabProps {
	data: PharmacyProfilePersonal
	onChange: (updated: Partial<PharmacyProfilePersonal>) => void
}

const GENDER_OPTIONS = [
	{ value: 'male', label: 'Male' },
	{ value: 'female', label: 'Female' },
	{ value: 'other', label: 'Other' },
]

const verifiedAdornment = (
	<InputAdornment position="end">
		<CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
	</InputAdornment>
)

export default function PharmacyPersonalTab({ data, onChange }: PharmacyPersonalTabProps) {
	const [isDirty, setIsDirty] = useState(false)
	const [saved, setSaved] = useState(data)

	useEffect(() => {
		setIsDirty(JSON.stringify(data) !== JSON.stringify(saved))
	}, [data, saved])

	const handleSave = async () => {
		try {
			const payload: Record<string, string> = {}
			if (data.name !== saved.name) payload.owner_name = data.name
			if (data.location !== saved.location) payload.address = data.location
			if (data.city !== saved.city) payload.city = data.city
			if (data.state !== saved.state) payload.state = data.state

			if (Object.keys(payload).length === 0) {
				toast.info('No API-backed personal changes to save yet.')
				return
			}

			await updateMyPharmacyDetails(payload)

			setSaved((prev) => ({
				...prev,
				name: data.name,
				location: data.location,
				city: data.city,
				state: data.state,
			}))

			toast.success('Changes saved successfully!')
		} catch {
			toast.error('Something went wrong. Please try again.')
		}
	}

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Personal Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Full Name*"
							value={data.name}
							placeholder="Enter your full name"
							onChange={(e) => onChange({ name: e.target.value })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Location*"
							value={data.location}
							placeholder="Enter your location"
							onChange={(e) => onChange({ location: e.target.value })}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="City*"
							value={data.city}
							placeholder="Enter your city"
							onChange={(e) => onChange({ city: e.target.value })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="State*"
							value={data.state}
							placeholder="Enter your state"
							onChange={(e) => onChange({ state: e.target.value })}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Mobile Number*"
							value={data.contactNumber}
							placeholder="+91 XXXXXXXXXX"
							type="tel"
							disabled
							InputProps={{ endAdornment: data.contactVerified ? verifiedAdornment : undefined }}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Email ID*"
							value={data.email}
							placeholder="Enter your email"
							type="email"
							onChange={(e) => onChange({ email: e.target.value })}
							InputProps={{ endAdornment: data.emailVerified ? verifiedAdornment : undefined }}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppSelect
							label="Gender*"
							value={data.gender || ''}
							options={GENDER_OPTIONS}
							placeholder="Select gender"
							onChange={(e) => onChange({ gender: e.target.value as string })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppDatePicker
							label="Date of Birth"
							value={data.dateOfBirth}
							onChange={(val) => onChange({ dateOfBirth: val ?? '' })}
							disableFuture
						/>
					</Grid>
				</Grid>
			</Box>

			<ProfileFormActions isDirty={isDirty} onSave={handleSave} showSuccess={false} onCloseSnackbar={() => {}} />
		</Box>
	)
}
