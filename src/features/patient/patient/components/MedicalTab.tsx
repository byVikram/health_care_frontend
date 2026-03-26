// src/features/patient/components/MedicalTab.tsx
import { useState, useEffect } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import AppInput from '../../../components/common/Input/AppInput'
import ProfileFormActions from '../../../components/common/ProfileFormActions/ProfileFormActions'
import { PatientMedical } from '../../../types/patient'
import { customCardStyle } from '../../../styles/commonStyles'

interface MedicalTabProps {
	data: PatientMedical
	onChange: (updated: Partial<PatientMedical>) => void
}

export default function MedicalTab({ data, onChange }: MedicalTabProps) {
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
							value={data.chronicConditions}
							placeholder="Enter chronic conditions"
							onChange={(e) => onChange({ chronicConditions: e.target.value })}
						/>
					</Grid>
				</Grid>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Current Medications"
							value={data.currentMedications}
							placeholder="Enter current medications"
							onChange={(e) => onChange({ currentMedications: e.target.value })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Past Surgeries"
							value={data.pastSurgeries}
							placeholder="Enter past surgeries"
							onChange={(e) => onChange({ pastSurgeries: e.target.value })}
						/>
					</Grid>
				</Grid>
				<AppInput
					label="Family Medical History"
					value={data.familyHistory}
					placeholder="Enter family medical history"
					onChange={(e) => onChange({ familyHistory: e.target.value })}
				/>
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
