// src/features/admin/pages/AdminSpecialitiesPage.tsx
import { useCallback, useEffect, useState } from 'react'
import { Box, Typography, Stack, Grid, Alert, CircularProgress, Chip, Avatar, Button } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CategoryIcon from '@mui/icons-material/Category'
import RefreshIcon from '@mui/icons-material/Refresh'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import { createSpeciality, listSpecialities, AdminSpecialityItem } from '../adminService'

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

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
		} catch (err: unknown) {
			setListError(getErrorMessage(err, 'Failed to load specialities.'))
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
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to create speciality.'))
		} finally {
			setSubmitting(false)
		}
	}

	const columns: Column<AdminSpecialityItem>[] = [
		{
			field: 'label',
			label: 'Speciality',
			render: (_: unknown, row: AdminSpecialityItem) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar sx={{ bgcolor: 'rgba(13,148,136,0.12)', color: '#0d9488', width: 36, height: 36, fontSize: 13, fontWeight: 800 }}>
						{(row.label || 'S').substring(0, 1).toUpperCase()}
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="subtitle2" fontWeight={700} color="#0f172a">
							{row.label}
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
							{row.id}
						</Typography>
					</Box>
				</Stack>
			),
		},
		{
			field: 'description',
			label: 'Description',
			render: (_: unknown, row: AdminSpecialityItem) => (
				<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
					{row.description || '—'}
				</Typography>
			),
		},
		{
			field: 'icon_key',
			label: 'Icon Reference',
			render: (_: unknown, row: AdminSpecialityItem) =>
				row.icon_key ? (
					<Chip
						label={row.icon_key}
						size="small"
						sx={{ bgcolor: '#f8fafc', color: '#475569', fontFamily: 'monospace', fontSize: '0.68rem', borderRadius: '6px', height: 22, border: '1px solid #e2e8f0' }}
					/>
				) : (
					<Typography variant="caption" color="text.secondary">
						—
					</Typography>
				),
		},
	]

	return (
		<Box>
			<AdminPageHeader
				title="Medical Specialities Catalog"
				subtitle="Manage the master clinical specialty registry used for doctor onboarding, search filtering, and department routing."
				count={specialities.length}
				countLabel="specialities"
			/>

			<Grid container spacing={3} sx={{ mb: 3.5 }}>
				<Grid size={{ xs: 12, md: 7 }}>
					<SectionCard
						title="Add New Speciality"
						subtitle="Create a new medical category entry in the catalog"
					>
						<form onSubmit={handleSubmit}>
							<Stack spacing={2.5}>
								{error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

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

								<Box sx={{ pt: 0.5 }}>
									<AppButton
										label={submitting ? 'Creating Speciality...' : 'Create Speciality'}
										type="submit"
										disabled={submitting}
										startIcon={<AddCircleIcon />}
										sx={{ bgcolor: '#0d9488', py: 1.2, px: 3, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#0f766e' } }}
									/>
								</Box>
							</Stack>
						</form>
					</SectionCard>
				</Grid>

				<Grid size={{ xs: 12, md: 5 }}>
					<Box
						sx={{
							p: 3,
							borderRadius: '14px',
							bgcolor: '#0f172a',
							color: '#ffffff',
							border: '1px solid #1e293b',
							height: '100%',
							boxSizing: 'border-box',
						}}
					>
						<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
							<CategoryIcon sx={{ color: '#2dd4bf', fontSize: 28 }} />
							<Typography variant="h6" fontWeight={800}>
								Catalog Standard
							</Typography>
						</Stack>
						<Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
							Medical specialities registered in this master catalog are immediately available across system workflows:
						</Typography>
						<Box component="ul" sx={{ pl: 2, mt: 1.5, color: '#cbd5e1', fontSize: 13, lineHeight: 1.8 }}>
							<li>Doctor profile onboarding & verification checklists.</li>
							<li>Patient dashboard search & appointment scheduling filters.</li>
							<li>Consultation referral & ancillary service routing.</li>
						</Box>
					</Box>
				</Grid>
			</Grid>

			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
				<Box>
					<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
						Registered Specialities Catalog
					</Typography>
					<Typography variant="caption" color="text.secondary">
						All active clinical specialities in the system
					</Typography>
				</Box>
				<Button
					variant="outlined"
					size="small"
					startIcon={<RefreshIcon />}
					onClick={loadSpecialities}
					disabled={loading}
					sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#0d9488', color: '#0d9488' } }}
				>
					Refresh Catalog
				</Button>
			</Stack>

			{listError && (
				<Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
					{listError}
				</Alert>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
						Loading specialities catalog...
					</Typography>
				</Stack>
			) : (
				<AppTable columns={columns} rows={specialities} emptyMessage="No specialities found." />
			)}
		</Box>
	)
}
