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

interface DoctorPersonalTabProps {
	data: DoctorProfilePersonal
	onChange: (updated: Partial<DoctorProfilePersonal>) => void
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

export default function DoctorPersonalTab({ data, onChange }: DoctorPersonalTabProps) {
	const [isDirty, setIsDirty] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
	const [saved, setSaved] = useState(data)

	useEffect(() => {
		setIsDirty(JSON.stringify(data) !== JSON.stringify(saved))
	}, [data, saved])

	const handleSave = () => {
		setSaved(data)
		setIsDirty(false)
		setShowSuccess(true)
	}
	return (
		<Box
			sx={{
				...customCardStyle,
			}}
		>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Personal Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Full Name"
							value={data.name}
							placeholder="Enter your full name"
							onChange={(e) => onChange({ name: e.target.value })}
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Location"
							value={data.location}
							placeholder="Enter your location"
							onChange={(e) => onChange({ location: e.target.value })}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Mobile Number"
							value={data.contactNumber}
							placeholder="+91 XXXXXXXXXX"
							type="tel"
							disabled
							InputProps={{ endAdornment: data.contactVerified ? verifiedAdornment : undefined }}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Email ID"
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
							label="Gender"
							value={data.gender || ''}
							options={GENDER_OPTIONS}
							placeholder="Select gender"
							onChange={(e) => onChange({ gender: e.target.value as string })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						{/* <AppInput
							label="Date of Birth"
							value={data.dateOfBirth}
							type="date"
							onChange={(e) => onChange({ dateOfBirth: e.target.value })}
						/> */}

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
							label="Years of Experience"
							value={data.experience || ''}
							options={EXPERIENCE_OPTIONS}
							placeholder="Select experience"
							onChange={(e) => onChange({ experience: e.target.value as string })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppSelect
							label="Languages Known"
							value={data.languages?.[0] || ''}
							options={LANGUAGE_OPTIONS}
							placeholder="Select language"
							onChange={(e) => onChange({ languages: [e.target.value as string] })}
						/>
					</Grid>
				</Grid>

				<Grid size={{ xs: 12 }} mt={2} display={'flex'} justifyContent={'flex-end'}></Grid>
			</Box>
			<ProfileFormActions
				isDirty={isDirty}
				showSuccess={showSuccess}
				onSave={handleSave}
				onCloseSnackbar={() => setShowSuccess(false)}
			/>
		</Box>
	)
}
