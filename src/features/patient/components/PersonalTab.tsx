// src/features/patient/components/PersonalTab.tsx
import { useState, useEffect } from 'react'
import { customCardStyle } from '../../../styles/commonStyles'
import { Box, Typography, Grid, InputAdornment } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
// import ProfileFormActions from '../../../components/common/ProfileFormActions/ProfileFormActions'
import { PatientPersonal } from '../../../types/patient'
import AppButton from '../../../components/common/Button/AppButton'

interface PersonalTabProps {
	data: PatientPersonal
	onChange: (updated: Partial<PatientPersonal>) => void
	onAvatarChange?: (file: File) => void
	handleSave: () => void | Promise<void>
}

const GENDER_OPTIONS = [
	{ value: 'male', label: 'Male' },
	{ value: 'female', label: 'Female' },
	{ value: 'other', label: 'Other' },
]
const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((v) => ({ value: v, label: v }))
const MARITAL_STATUS_OPTIONS = [
	{ value: 'single', label: 'Single' },
	{ value: 'married', label: 'Married' },
	{ value: 'divorced', label: 'Divorced' },
	{ value: 'widowed', label: 'Widowed' },
]

const verifiedAdornment = (
	<InputAdornment position="end">
		<CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
	</InputAdornment>
)

export default function PersonalTab({ data, onChange, handleSave }: PersonalTabProps) {
	const [isDirty, setIsDirty] = useState(false)
	// const [showSuccess, setShowSuccess] = useState(false)
	const [saved, setSaved] = useState(data)

	useEffect(() => {
		setIsDirty(JSON.stringify(data) !== JSON.stringify(saved))
	}, [data, saved])

	const onSave = async () => {
		try {
			await handleSave()
			setSaved(data)
			setIsDirty(false)
		} catch {
			// Keep the form dirty if save fails.
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
							label="Mobile Number*"
							value={data.contact_number}
							placeholder="+91 XXXXXXXXXX"
							type="tel"
							disabled
							InputProps={{ endAdornment: data.contact_verified ? verifiedAdornment : undefined }}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Email ID*"
							value={data.email}
							placeholder="Enter your email"
							type="email"
							onChange={(e) => onChange({ email: e.target.value })}
							InputProps={{ endAdornment: data.email_verified ? verifiedAdornment : undefined }}
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
						<AppInput
							label="Date of Birth"
							value={data.date_of_birth}
							type="date"
							onChange={(e) => onChange({ date_of_birth: e.target.value })}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppSelect
							label="Blood Group"
							value={data.blood_group || ''}
							options={BLOOD_GROUP_OPTIONS}
							placeholder="Select blood group"
							onChange={(e) => onChange({ blood_group: e.target.value as string })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppSelect
							label="Marital Status"
							value={data.marital_status || ''}
							options={MARITAL_STATUS_OPTIONS}
							placeholder="Select marital status"
							onChange={(e) => onChange({ marital_status: e.target.value as string })}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Height (cm)"
							value={data.height}
							placeholder="e.g. 170"
							onChange={(e) => onChange({ height: e.target.value })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Weight (kg)"
							value={data.weight}
							placeholder="e.g. 65"
							onChange={(e) => onChange({ weight: e.target.value })}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Emergency Contact Name"
							value={data.emergency_contact.name}
							placeholder="Enter contact name"
							onChange={(e) =>
								onChange({ emergency_contact: { ...data.emergency_contact, name: e.target.value } })
							}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Emergency Contact Number"
							value={data.emergency_contact.number}
							placeholder="+91 XXXXXXXXXX"
							type="tel"
							onChange={(e) =>
								onChange({ emergency_contact: { ...data.emergency_contact, number: e.target.value } })
							}
						/>
					</Grid>
				</Grid>
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
				<AppButton variant="contained" label="Save" disabled={!isDirty} onClick={onSave} />
			</Box>
		</Box>
	)
}
