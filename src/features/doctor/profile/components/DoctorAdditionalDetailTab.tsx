// src/features/doctor/profile/components/DoctorAdditionalDetailTab.tsx
import { useState, useEffect } from 'react'
import {
	Box,
	Typography,
	Autocomplete,
	TextField,
	CircularProgress,
} from '@mui/material'
import { DoctorAdditionalDetail, OptionItem } from '../../../../types/doctor-profile'
import { customCardStyle } from '../../../../styles/commonStyles'
import AppButton from '../../../../components/common/Button/AppButton'
import { getAreaOfExpertise, getTreatmentOfferings } from '../../doctorService'

interface AdditionalDetailTabProps {
	data: DoctorAdditionalDetail
	onChange: (updated: Partial<DoctorAdditionalDetail>) => void
	handleSave: () => void | Promise<void>
}

export default function AdditionalDetailTab({ data, onChange, handleSave }: AdditionalDetailTabProps) {
	const [isDirty, setIsDirty] = useState(false)
	const [saving, setSaving] = useState(false)
	const [loading, setLoading] = useState(true)

	const [masterAreas, setMasterAreas] = useState<OptionItem[]>([])
	const [masterTreatments, setMasterTreatments] = useState<OptionItem[]>([])

	useEffect(() => {
		const loadMasterData = async () => {
			setLoading(true)
			try {
				const [areasRes, treatmentsRes] = await Promise.all([
					getAreaOfExpertise(),
					getTreatmentOfferings(),
				]) as [
					{ success?: boolean; data?: Array<{ id: string | number; label: string }> },
					{ success?: boolean; data?: Array<{ id: string | number; label: string }> }
				]
				if (areasRes.success) {
					setMasterAreas((areasRes.data ?? []).map((item) => ({ id: String(item.id), label: item.label })))
				}
				if (treatmentsRes.success) {
					setMasterTreatments((treatmentsRes.data ?? []).map((item) => ({ id: String(item.id), label: item.label })))
				}
			} catch (error) {
				console.error('Failed to load master data', error)
			} finally {
				setLoading(false)
			}
		}
		loadMasterData()
	}, [])

	const onSave = async () => {
		setSaving(true)
		try {
			await handleSave()
			setIsDirty(false)
		} finally {
			setSaving(false)
		}
	}

	if (!data || loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress />
			</Box>
		)
	}

	return (
		<Box sx={{ ...customCardStyle, p: 2.5 }}>
			<Typography variant="h6" fontWeight={600} sx={{ mb: 2.5, color: 'text.primary' }}>
				Additional Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Autocomplete
					multiple
					options={masterTreatments}
					getOptionLabel={(option) => option.label}
					value={data.treatments || []}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					onChange={(_, newValue) => {
						onChange({ treatments: newValue })
						setIsDirty(true)
					}}
					renderInput={(params) => (
						<TextField
							{...params}
							variant="outlined"
							label="Treatments"
							placeholder="Select treatments"
						/>
					)}
					sx={{
						'& .MuiOutlinedInput-root': {
							fontSize: '0.875rem',
						},
						'& .MuiInputLabel-root': {
							fontSize: '0.875rem',
						}
					}}
				/>

				<Autocomplete
					multiple
					options={masterAreas}
					getOptionLabel={(option) => option.label}
					value={data.areas_of_expertise || []}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					onChange={(_, newValue) => {
						onChange({ areas_of_expertise: newValue })
						setIsDirty(true)
					}}
					renderInput={(params) => (
						<TextField
							{...params}
							variant="outlined"
							label="Areas of Expertise"
							placeholder="Select areas of expertise"
						/>
					)}
					sx={{
						'& .MuiOutlinedInput-root': {
							fontSize: '0.875rem',
						},
						'& .MuiInputLabel-root': {
							fontSize: '0.875rem',
						}
					}}
				/>
			</Box>

			{/* Save button */}
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
				<AppButton
					variant="contained"
					label="Save Changes"
					disabled={!isDirty}
					loading={saving}
					onClick={onSave}
				/>
			</Box>
		</Box>
	)
}
