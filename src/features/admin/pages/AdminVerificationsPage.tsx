// src/features/admin/pages/AdminVerificationsPage.tsx
import { useEffect, useState, useCallback } from 'react'
import {
	Box,
	Tabs,
	Tab,
	Typography,
	Chip,
	Stack,
	CircularProgress,
	Alert,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable from '../../../components/common/Table/AppTable'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import AppModal from '../../../components/common/Modal/AppModal'
import {
	getDoctorsVerificationQueue,
	getProvidersVerificationQueue,
	verifyDoctor,
	verifyProvider,
	DoctorVerificationItem,
	ProviderVerificationItem,
} from '../adminService'

export default function AdminVerificationsPage() {
	const [activeTab, setActiveTab] = useState<'doctors' | 'providers'>('doctors')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [doctorsQueue, setDoctorsQueue] = useState<DoctorVerificationItem[]>([])
	const [providersQueue, setProvidersQueue] = useState<ProviderVerificationItem[]>([])

	// Review Dialog State
	const [selectedItem, setSelectedItem] = useState<{
		type: 'doctor' | 'provider'
		data: DoctorVerificationItem | ProviderVerificationItem
	} | null>(null)
	const [notes, setNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)

	const fetchQueues = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const [docsRes, provsRes] = await Promise.all([
				getDoctorsVerificationQueue(),
				getProvidersVerificationQueue(),
			])
			if (docsRes.success) setDoctorsQueue(docsRes.data || [])
			if (provsRes.success) setProvidersQueue(provsRes.data || [])
		} catch (err: any) {
			setError(err?.message || 'Failed to fetch verification queues')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchQueues()
	}, [fetchQueues])

	const handleVerifySubmit = async (isApproved: boolean) => {
		if (!selectedItem) return
		setSubmitting(true)
		try {
			if (selectedItem.type === 'doctor') {
				const doc = selectedItem.data as DoctorVerificationItem
				const res = await verifyDoctor(doc.public_id || doc.id, {
					is_verified: isApproved,
					rejection_reason: !isApproved ? notes.trim() || undefined : undefined,
				})
				if (res.success) {
					toast.success(`Doctor ${doc.name} ${isApproved ? 'approved' : 'rejected'} successfully.`)
				}
			} else {
				const prov = selectedItem.data as ProviderVerificationItem
				const res = await verifyProvider(prov.provider_type, prov.public_id || prov.id, {
					is_verified: isApproved,
					rejection_reason: !isApproved ? notes.trim() || undefined : undefined,
				})
				if (res.success) {
					toast.success(
						`${prov.provider_type.toUpperCase()} ${prov.name} ${isApproved ? 'approved' : 'rejected'} successfully.`
					)
				}
			}
			setSelectedItem(null)
			setNotes('')
			fetchQueues()
		} catch (err: any) {
			toast.error(err?.message || 'Verification update failed.')
		} finally {
			setSubmitting(false)
		}
	}

	const doctorColumns = [
		{
			field: 'name',
			label: 'Doctor Name',
			render: (_: any, row: DoctorVerificationItem) => (
				<Box>
					<Typography variant="subtitle2" fontWeight={700}>
						{row.name}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{row.email} | {row.contact_number}
					</Typography>
				</Box>
			),
		},
		{
			field: 'speciality',
			label: 'Speciality / Reg. No.',
			render: (_: any, row: DoctorVerificationItem) => (
				<Box>
					<Typography variant="body2" fontWeight={600}>
						{row.speciality || 'General Medicine'}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Reg #: {row.registration_number || 'Pending'}
					</Typography>
				</Box>
			),
		},
		{
			field: 'is_verified',
			label: 'Status',
			render: (_: any, row: DoctorVerificationItem) => (
				<Chip
					label={row.is_verified ? 'Verified' : 'Pending Verification'}
					size="small"
					color={row.is_verified ? 'success' : 'warning'}
					sx={{ fontWeight: 700 }}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			render: (_: any, row: DoctorVerificationItem) => (
				<AppButton
					label="Review & Verify"
					size="small"
					startIcon={<VisibilityIcon />}
					onClick={() => setSelectedItem({ type: 'doctor', data: row })}
					sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
				/>
			),
		},
	]

	const providerColumns = [
		{
			field: 'name',
			label: 'Provider Details',
			render: (_: any, row: ProviderVerificationItem) => (
				<Box>
					<Typography variant="subtitle2" fontWeight={700}>
						{row.name}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Owner: {row.owner_name || 'N/A'} | {row.contact_number}
					</Typography>
				</Box>
			),
		},
		{
			field: 'provider_type',
			label: 'Type',
			render: (_: any, row: ProviderVerificationItem) => (
				<Chip
					label={row.provider_type.toUpperCase()}
					size="small"
					sx={{ bgcolor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}
				/>
			),
		},
		{
			field: 'is_verified',
			label: 'Status',
			render: (_: any, row: ProviderVerificationItem) => (
				<Chip
					label={row.is_verified ? 'Verified' : 'Pending Review'}
					size="small"
					color={row.is_verified ? 'success' : 'warning'}
					sx={{ fontWeight: 700 }}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			render: (_: any, row: ProviderVerificationItem) => (
				<AppButton
					label="Review & Verify"
					size="small"
					startIcon={<VisibilityIcon />}
					onClick={() => setSelectedItem({ type: 'provider', data: row })}
					sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
				/>
			),
		},
	]

	return (
		<Box>
			<SectionCard title="Provider & Medical Professional Verifications">
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Review, approve, or reject registered healthcare providers and doctors
				</Typography>
				<Tabs
					value={activeTab}
					onChange={(_, val) => setActiveTab(val)}
					sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}
				>
					<Tab
						value="doctors"
						label={`Doctors Queue (${doctorsQueue.length})`}
						sx={{ fontWeight: 700, textTransform: 'none' }}
					/>
					<Tab
						value="providers"
						label={`Providers Queue (${providersQueue.length})`}
						sx={{ fontWeight: 700, textTransform: 'none' }}
					/>
				</Tabs>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{loading ? (
					<Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
						<CircularProgress sx={{ color: '#0d9488' }} />
						<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
							Loading verification queue...
						</Typography>
					</Stack>
				) : activeTab === 'doctors' ? (
					<AppTable columns={doctorColumns as any} rows={doctorsQueue as any} emptyMessage="No doctors awaiting verification." />
				) : (
					<AppTable columns={providerColumns as any} rows={providersQueue as any} emptyMessage="No providers awaiting verification." />
				)}
			</SectionCard>

			{/* Review Modal Dialog */}
			{selectedItem && (
				<AppModal open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} maxWidth="sm">
					<DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
						Verification Review — {selectedItem.data.name}
					</DialogTitle>
					<DialogContent sx={{ py: 3 }}>
						<Stack spacing={2}>
							<Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
								<Typography variant="subtitle2" fontWeight={700}>
									Entity Summary
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Email: {selectedItem.data.email}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Contact: {selectedItem.data.contact_number}
								</Typography>
								{selectedItem.type === 'doctor' ? (
									<>
										<Typography variant="body2" color="text.secondary">
											Speciality: {(selectedItem.data as DoctorVerificationItem).speciality || 'N/A'}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Registration #: {(selectedItem.data as DoctorVerificationItem).registration_number || 'N/A'}
										</Typography>
									</>
								) : (
									<>
										<Typography variant="body2" color="text.secondary">
											Provider Type: {(selectedItem.data as ProviderVerificationItem).provider_type?.toUpperCase()}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											License #: {(selectedItem.data as ProviderVerificationItem).license_number || 'N/A'}
										</Typography>
									</>
								)}
							</Box>

							<AppInput
								label="Verification Review Notes"
								placeholder="Enter administrative notes (optional)..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								multiline
								rows={3}
								fullWidth
							/>
						</Stack>
					</DialogContent>
					<DialogActions sx={{ px: 3, pb: 3 }}>
						<AppButton
							label="Reject Application"
							color="error"
							startIcon={<CancelIcon />}
							onClick={() => handleVerifySubmit(false)}
							disabled={submitting}
						/>
						<AppButton
							label="Approve & Verify"
							startIcon={<CheckCircleIcon />}
							onClick={() => handleVerifySubmit(true)}
							disabled={submitting}
							sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
						/>
					</DialogActions>
				</AppModal>
			)}
		</Box>
	)
}
