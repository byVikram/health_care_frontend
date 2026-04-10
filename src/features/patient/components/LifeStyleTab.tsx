// src/features/patient/components/LifeStyleTab.tsx
import { useState, useEffect } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppInput from '../../../components/common/Input/AppInput'
// import ProfileFormActions from '../../../components/common/ProfileFormActions/ProfileFormActions'
import { PatientLifeStyle } from '../../../types/patient'
import { customCardStyle } from '../../../styles/commonStyles'
import AppButton from '../../../components/common/Button/AppButton'

interface LifeStyleTabProps {
	data: PatientLifeStyle
	onChange: (updated: Partial<PatientLifeStyle>) => void
	handleSave: () => void | Promise<void>
}

const SMOKING_OPTIONS = [
	{ value: 'never', label: 'Never' },
	{ value: 'former', label: 'Former Smoker' },
	{ value: 'current', label: 'Current Smoker' },
]
const ALCOHOL_OPTIONS = [
	{ value: 'never', label: 'Never' },
	{ value: 'occasional', label: 'Occasional' },
	{ value: 'moderate', label: 'Moderate' },
	{ value: 'heavy', label: 'Heavy' },
]
const ACTIVITY_OPTIONS = [
	{ value: 'sedentary', label: 'Sedentary' },
	{ value: 'light', label: 'Lightly Active' },
	{ value: 'moderate', label: 'Moderately Active' },
	{ value: 'very', label: 'Very Active' },
]
const DIET_OPTIONS = [
	{ value: 'vegetarian', label: 'Vegetarian' },
	{ value: 'vegan', label: 'Vegan' },
	{ value: 'nonveg', label: 'Non-Veg' },
	{ value: 'eggetarian', label: 'Eggetarian' },
	{ value: 'jain', label: 'Jain' },
]

export default function LifeStyleTab({ data, onChange, handleSave }: LifeStyleTabProps) {
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
		<Box
			sx={{
				...customCardStyle,
			}}
		>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Life Style
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppSelect
							label="Smoking Status"
							value={data.smoking_status || ''}
							options={SMOKING_OPTIONS}
							placeholder="Select smoking status"
							onChange={(e) => onChange({ smoking_status: e.target.value as string })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppSelect
							label="Alcohol Consumption"
							value={data.alcohol_consumption || ''}
							options={ALCOHOL_OPTIONS}
							placeholder="Select alcohol consumption"
							onChange={(e) => onChange({ alcohol_consumption: e.target.value as string })}
						/>
					</Grid>
				</Grid>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppSelect
							label="Activity Level"
							value={data.activity_level || ''}
							options={ACTIVITY_OPTIONS}
							placeholder="Select activity level"
							onChange={(e) => onChange({ activity_level: e.target.value as string })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppSelect
							label="Diet Type"
							value={data.diet_type || ''}
							options={DIET_OPTIONS}
							placeholder="Select diet type"
							onChange={(e) => onChange({ diet_type: e.target.value as string })}
						/>
					</Grid>
				</Grid>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Sleep Hours (per night)"
							value={data.sleep_hours}
							placeholder="e.g. 7"
							onChange={(e) => onChange({ sleep_hours: e.target.value })}
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
