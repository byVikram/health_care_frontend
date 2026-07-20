// src/features/admin/pages/AdminSpecialitiesPage.tsx
import { useState } from 'react'
import { Box, Typography, Stack, Grid, Alert } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CategoryIcon from '@mui/icons-material/Category'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'
import { createSpeciality } from '../adminService'

export default function AdminSpecialitiesPage() {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [iconUrl, setIconUrl] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim()) {
			setError('Speciality name is required.')
			return
		}

		setSubmitting(true)
		setError(null)
		try {
			const res = await createSpeciality({
				label: name.trim(),
				description: description.trim() || undefined,
			})

			if (res.success) {
				toast.success(`Speciality "${name.trim()}" created successfully.`)
				setName('')
				setDescription('')
				setIconUrl('')
			}
		} catch (err: any) {
			setError(err?.message || 'Failed to create speciality.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Box>
			<SectionCard title="Medical Specialities Catalog Management">
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Add new medical specialities to the platform catalog for doctor onboarding and search filtering
				</Typography>
				<Grid container spacing={4}>
					<Grid size={{ xs: 12, md: 7 }}>
						<form onSubmit={handleSubmit}>
							<Stack spacing={2.5}>
								{error && <Alert severity="error">{error}</Alert>}

								<AppInput
									label="Speciality Name"
									placeholder="e.g. Cardiology, Orthopedics, Pediatrics"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									fullWidth
								/>

								<AppInput
									label="Description"
									placeholder="Brief description of clinical domain..."
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									multiline
									rows={3}
									fullWidth
								/>

								<AppInput
									label="Icon Asset Key / URL"
									placeholder="e.g. assets/icons/cardiology.svg"
									value={iconUrl}
									onChange={(e) => setIconUrl(e.target.value)}
									fullWidth
								/>

								<Box sx={{ pt: 1 }}>
									<AppButton
										label={submitting ? 'Creating Speciality...' : 'Create Speciality'}
										type="submit"
										disabled={submitting}
										startIcon={<AddCircleIcon />}
										sx={{ bgcolor: '#0d9488', py: 1.2, px: 3, '&:hover': { bgcolor: '#0f766e' } }}
									/>
								</Box>
							</Stack>
						</form>
					</Grid>

					<Grid size={{ xs: 12, md: 5 }}>
						<Box
							sx={{
								p: 3,
								borderRadius: 3,
								bgcolor: '#0f172a',
								color: '#ffffff',
								border: '1px solid #334155',
							}}
						>
							<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
								<CategoryIcon sx={{ color: '#2dd4bf', fontSize: 32 }} />
								<Typography variant="h6" fontWeight={700}>
									Catalog Standard
								</Typography>
							</Stack>
							<Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
								Medical specialities created here become immediately available across the system for:
							</Typography>
							<Box component="ul" sx={{ pl: 2, mt: 1, color: '#cbd5e1', fontSize: 14 }}>
								<li>Doctor profile onboarding & verification checklists.</li>
								<li>Patient dashboard speciality search & appointment scheduling filters.</li>
								<li>Consultation referral & ancillary service routing.</li>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</SectionCard>
		</Box>
	)
}
