// src/features/admin/pages/AdminSpecialitiesPage.tsx
import { useCallback, useEffect, useState } from 'react'
import { Box, Typography, Stack, Grid, Alert, CircularProgress, Chip } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CategoryIcon from '@mui/icons-material/Category'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'
import AppTable from '../../../components/common/Table/AppTable'
import { createSpeciality, listSpecialities, AdminSpecialityItem } from '../adminService'

export default function AdminSpecialitiesPage() {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [iconUrl, setIconUrl] = useState('')
	const [specialities, setSpecialities] = useState<AdminSpecialityItem[]>([])
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [listError, setListError] = useState<string | null>(null)

	const loadSpecialities = useCallback(async () => {
		setLoading(true)
		setListError(null)
		try {
			const res = await listSpecialities()
			if (res.success) {
				setSpecialities(res.data || [])
			}
		} catch (err: any) {
			setListError(err?.message || 'Failed to load specialities.')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadSpecialities()
	}, [loadSpecialities])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const trimmedName = name.trim()
		if (!trimmedName) {
			setError('Speciality name is required.')
			return
		}
		if (specialities.some((speciality) => speciality.label.toLowerCase() === trimmedName.toLowerCase())) {
			setError('A speciality with this name already exists.')
			return
		}

		setSubmitting(true)
		setError(null)
		try {
			const res = await createSpeciality({
				label: trimmedName,
				description: description.trim() || undefined,
				icon_key: iconUrl.trim() || undefined,
			})

			if (res.success) {
				toast.success(`Speciality "${trimmedName}" created successfully.`)
				setName('')
				setDescription('')
				setIconUrl('')
				await loadSpecialities()
			}
		} catch (err: any) {
			setError(err?.message || 'Failed to create speciality.')
		} finally {
			setSubmitting(false)
		}
	}

	const columns = [
		{
			field: 'label',
			label: 'Speciality',
			render: (_: any, row: AdminSpecialityItem) => (
				<Stack spacing={0.5}>
					<Typography variant="subtitle2" fontWeight={700}>
						{row.label}
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
						{row.id}
					</Typography>
				</Stack>
			),
		},
		{
			field: 'description',
			label: 'Description',
			render: (_: any, row: AdminSpecialityItem) => (
				<Typography variant="body2" color="text.secondary">
					{row.description || 'N/A'}
				</Typography>
			),
		},
		{
			field: 'icon_key',
			label: 'Icon Asset',
			render: (_: any, row: AdminSpecialityItem) =>
				row.icon_key ? (
					<Chip label={row.icon_key} size="small" sx={{ bgcolor: '#f1f5f9', maxWidth: 260 }} />
				) : (
					<Typography variant="body2" color="text.secondary">
						N/A
					</Typography>
				),
		},
	]

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

			<SectionCard title="Current Specialities Catalog">
				<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
					<Typography variant="body2" color="text.secondary">
						{loading ? 'Loading catalog...' : `${specialities.length} specialities available`}
					</Typography>
					<AppButton label="Refresh" variant="outlined" size="small" onClick={loadSpecialities} disabled={loading} />
				</Stack>

				{listError && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{listError}
					</Alert>
				)}

				{loading ? (
					<Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
						<CircularProgress sx={{ color: '#0d9488' }} />
						<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
							Loading specialities catalog...
						</Typography>
					</Stack>
				) : (
					<AppTable columns={columns as any} rows={specialities as any} emptyMessage="No specialities found." />
				)}
			</SectionCard>
		</Box>
	)
}
