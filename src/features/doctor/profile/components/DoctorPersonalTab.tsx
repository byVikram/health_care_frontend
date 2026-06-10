// src/features/doctor/profile/components/DoctorPersonalTab.tsx
import { useState, useEffect } from 'react'
import ProfileFormActions from '../../../../components/common/ProfileFormActions/ProfileFormActions'
import { Box, Typography, Grid, InputAdornment } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AppInput from '../../../../components/common/Input/AppInput'
import AppSelect from '../../../../components/common/Select/AppSelect'
import { DoctorProfilePersonal } from '../../../../types/doctor-profile'
import { customCardStyle } from '../../../../styles/commonStyles'
import AppDatePicker from '../../../../components/common/DatePicker/AppDatePicker'
import { updatePersonalDetails } from '../../doctorService'
import 'react-toastify/dist/ReactToastify.css'
import { toast } from 'react-toastify'
import AppMultiSelect from '../../../../components/common/Select/AppMultiSelect'

interface DoctorPersonalTabProps {
	data: DoctorProfilePersonal
	onChange: (updated: Partial<DoctorProfilePersonal>) => void
	onSaveSuccess?: () => void
}

const GENDER_OPTIONS = [
	{ value: 'male', label: 'Male' },
	{ value: 'female', label: 'Female' },
	{ value: 'other', label: 'Other' },
]
const EXPERIENCE_OPTIONS = Array.from({ length: 30 }, (_, i) => ({
	value: String(i + 1),
	label: `${i + 1} ${i + 1 === 1 ? 'year' : 'years'}`,
}))
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Marathi'].map((l) => ({
	value: l.toLowerCase(),
	label: l,
}))

const verifiedAdornment = (
	<InputAdornment position="end">
		<CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
	</InputAdornment>
)

export default function DoctorPersonalTab({ data, onChange, onSaveSuccess }: DoctorPersonalTabProps) {
	const [isDirty, setIsDirty] = useState(false)
	const [saved, setSaved] = useState(data)

	useEffect(() => {
		setIsDirty(JSON.stringify(data) !== JSON.stringify(saved))
	}, [data, saved])

	const handleSave = async () => {
		try {
			const payload: Record<string, unknown> = {
				name: data.name,
				location: data.location,
				gender: data.gender,
				languages: data.languages,
				email: data.email,
			}
			if (data.dateOfBirth) payload.date_of_birth = data.dateOfBirth
			if (data.instagram) payload.instagram = data.instagram
			if (data.facebook) payload.facebook = data.facebook
			if (data.twitter) payload.twitter = data.twitter

			await updatePersonalDetails(payload)

			toast.success('Personal details saved successfully!')
			setSaved(data)
			setIsDirty(false)
			onSaveSuccess?.()
		} catch (error) {
			toast.error('Something went wrong. Please try again.')
			console.error(error)
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
							label="Full Name *"
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
							value={data.contactNumber}
							placeholder="+91 XXXXXXXXXX"
							type="tel"
							disabled
							slotProps={{ inputLabel: { shrink: true } }}
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

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppSelect
							label="Years of Experience*"
							value={data.experience || ''}
							options={EXPERIENCE_OPTIONS}
							placeholder="Select experience"
							onChange={(e) => onChange({ experience: e.target.value as string })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppMultiSelect
							label="Languages Known"
							value={data.languages || []}
							options={LANGUAGE_OPTIONS}
							placeholder="Select language"
							onChange={(selected) => onChange({ languages: selected as string[] })}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Instagram"
							value={data.instagram}
							placeholder="https://instagram.com/your-handle"
							type="url"
							slotProps={{ inputLabel: { shrink: true } }}
							onChange={(e) => onChange({ instagram: e.target.value })}
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Facebook"
							value={data.facebook}
							placeholder="https://facebook.com/your-profile"
							type="url"
							slotProps={{ inputLabel: { shrink: true } }}
							onChange={(e) => onChange({ facebook: e.target.value })}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Twitter"
							value={data.twitter}
							placeholder="https://twitter.com/your-handle"
							type="url"
							slotProps={{ inputLabel: { shrink: true } }}
							onChange={(e) => onChange({ twitter: e.target.value })}
						/>
					</Grid>
				</Grid>
				<Grid size={{ xs: 12 }} mt={2} display={'flex'} justifyContent={'flex-end'}></Grid>
			</Box>
			<ProfileFormActions isDirty={isDirty} onSave={handleSave} showSuccess={false} onCloseSnackbar={() => {}} />
		</Box>
	)
}
