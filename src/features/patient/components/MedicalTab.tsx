// src/features/patient/components/MedicalTab.tsx
import { useState, useEffect } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import AppInput from '../../../components/common/Input/AppInput'
// import ProfileFormActions from '../../../components/common/ProfileFormActions/ProfileFormActions'
import { PatientMedical } from '../../../types/patient'
import { customCardStyle } from '../../../styles/commonStyles'
import AppButton from '../../../components/common/Button/AppButton'

interface MedicalTabProps {
	data: PatientMedical
	onChange: (updated: Partial<PatientMedical>) => void
	handleSave: () => void | Promise<void>
}

export default function MedicalTab({ data, onChange, handleSave }: MedicalTabProps) {
	const [isDirty, setIsDirty] = useState(false)
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
				Medical Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Allergies"
							value={data.allergies}
							placeholder="Enter allergies"
							onChange={(e) => onChange({ allergies: e.target.value })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Chronic Conditions"
							value={data.chronic_conditions}
							placeholder="Enter chronic conditions"
							onChange={(e) => onChange({ chronic_conditions: e.target.value })}
						/>
					</Grid>
				</Grid>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Current Medications"
							value={data.current_medications}
							placeholder="Enter current medications"
							onChange={(e) => onChange({ current_medications: e.target.value })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Past Surgeries"
							value={data.past_surgeries}
							placeholder="Enter past surgeries"
							onChange={(e) => onChange({ past_surgeries: e.target.value })}
						/>
					</Grid>
				</Grid>
				<AppInput
					label="Family Medical History"
					value={data.family_history}
					placeholder="Enter family medical history"
					onChange={(e) => onChange({ family_history: e.target.value })}
				/>
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
				<AppButton variant="contained" label="Save" disabled={!isDirty} onClick={onSave} />
			</Box>
		</Box>
	)
}
