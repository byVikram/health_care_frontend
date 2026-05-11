import { Box, Divider, Grid, Typography } from '@mui/material'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'

interface VitalField {
	label: string
	placeholder: string
}

function LabeledInput({ label, placeholder }: VitalField) {
	return (
		<Box>
			<Typography
				sx={{
					fontSize: '13px',
					fontWeight: 500,
					color: 'text.primary',
					mb: 0.75,
				}}
			>
				{label}
			</Typography>
			<AppInput
				placeholder={placeholder}
				fullWidth
				size="small"
			/>
		</Box>
	)
}

export default function AddVitals() {
	return (
		<Box sx={{ p: '20px 24px 24px' }}>
			{/* Header */}
			<Typography
				variant="h5"
				sx={{
					fontWeight: 600,
					fontSize: '18px',
					mb: 0.5,
				}}
			>
				Add Vitals
			</Typography>

			<Typography
				sx={{
					fontSize: '14px',
					color: 'text.secondary',
					mb: 3,
				}}
			>
				Enter Patient Vitals Value
			</Typography>

			{/* Top Section */}
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="Blood Pressure" placeholder="mm/Hg" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="Fasting Sugar" placeholder="mg/dL" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="Random Sugar" placeholder="mg/dL" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="Weight" placeholder="Kg" />
				</Grid>
			</Grid>

			<Divider sx={{ my: 2.5 }} />

			{/* Other Vitals */}
			<Typography
				sx={{
					color: 'primary.main',
					fontWeight: 500,
					fontSize: '15px',
					mb: 2,
				}}
			>
				Other Vitals
			</Typography>

			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="Waist" placeholder="cms" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="LDL" placeholder="mg/dL" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="HbA1C" placeholder="%" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="HDL" placeholder="mg/dL" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="TGL" placeholder="mg/dL" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="Pulse Rate" placeholder="bpm" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="Respiration rate" placeholder="bpm" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="SpO2" placeholder="Value" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<LabeledInput label="Temperature" placeholder="F" />
				</Grid>
			</Grid>

			{/* Buttons */}
			<Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
				<AppButton
					label="Cancel"
					variant="outlined"
					fullWidth
					sx={{
						height: '48px',
						borderRadius: '8px',
						bgcolor: '#EAF2F1',
						border: 'none',
						color: 'primary.main',
						fontWeight: 600,
						fontSize: '15px',
						'&:hover': { bgcolor: '#EAF2F1', border: 'none' },
					}}
				/>
				<AppButton
					label="Save"
					fullWidth
					sx={{
						height: '48px',
						borderRadius: '8px',
						fontWeight: 600,
						fontSize: '15px',
					}}
				/>
			</Box>
		</Box>
	)
}
