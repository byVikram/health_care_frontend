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
	Divider,
	IconButton,
	Tooltip,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import DescriptionIcon from '@mui/icons-material/Description'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable from '../../../components/common/Table/AppTable'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import {
	getDoctorsVerificationQueue,
	getProvidersVerificationQueue,
	verifyDoctor,
	verifyProvider,
	getDoctorVerificationDetail,
	DoctorVerificationItem,
	ProviderVerificationItem,
	DoctorVerificationDetail,
	DoctorVerificationDocument,
} from '../adminService'
import { buildS3Url } from '../../../utils/s3'

// ── Styled info row (same pattern as AppointmentDetailsDrawer) ─────────────
function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
	return (
		<Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8 }}>
			<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, minWidth: 140 }}>
				{label}
			</Typography>
			<Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', maxWidth: '55%' }}>
				{value ?? 'N/A'}
			</Typography>
		</Box>
	)
}

// ── Section header inside the drawer ──────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
	return (
		<Typography
			variant="subtitle2"
			sx={{
				fontWeight: 700,
				color: '#0f172a',
				mt: 2.5,
				mb: 1,
				pb: 0.5,
				borderBottom: '2px solid #e2e8f0',
				textTransform: 'uppercase',
				fontSize: '11px',
				letterSpacing: '0.08em',
			}}
		>
			{title}
		</Typography>
	)
}

export default function AdminVerificationsPage() {
	const [activeTab, setActiveTab] = useState<'doctors' | 'providers'>('doctors')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [doctorsQueue, setDoctorsQueue] = useState<DoctorVerificationItem[]>([])
	const [providersQueue, setProvidersQueue] = useState<ProviderVerificationItem[]>([])

	// ── Review Drawer State ──────────────────────────────────────────────────
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [selectedItemType, setSelectedItemType] = useState<'doctor' | 'provider' | null>(null)
	const [selectedItemData, setSelectedItemData] = useState<DoctorVerificationItem | ProviderVerificationItem | null>(null)
	const [doctorDetail, setDoctorDetail] = useState<DoctorVerificationDetail | null>(null)
	const [detailLoading, setDetailLoading] = useState(false)
	const [notes, setNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)

	// ── Fetch queues ─────────────────────────────────────────────────────────
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

	// ── Open drawer ──────────────────────────────────────────────────────────
	const handleOpenReview = async (type: 'doctor' | 'provider', data: DoctorVerificationItem | ProviderVerificationItem) => {
		setSelectedItemType(type)
		setSelectedItemData(data)
		setDoctorDetail(null)
		setNotes('')
		setDrawerOpen(true)

		if (type === 'doctor') {
			const doc = data as DoctorVerificationItem
			setDetailLoading(true)
			try {
				const res = await getDoctorVerificationDetail(doc.public_id || doc.id)
				if (res.success && res.data) {
					setDoctorDetail(res.data)
				}
			} catch {
				toast.error('Failed to load doctor details')
			} finally {
				setDetailLoading(false)
			}
		}
	}

	// ── Submit verify/reject ─────────────────────────────────────────────────
	const handleVerifySubmit = async (isApproved: boolean) => {
		if (!selectedItemData || !selectedItemType) return
		setSubmitting(true)
		try {
			if (selectedItemType === 'doctor') {
				const doc = selectedItemData as DoctorVerificationItem
				const res = await verifyDoctor(doc.public_id || doc.id, {
					is_verified: isApproved,
					rejection_reason: !isApproved ? notes.trim() || undefined : undefined,
				})
				if (res.success) {
					toast.success(`Doctor ${doc.name} ${isApproved ? 'approved' : 'rejected'} successfully.`)
				}
			} else {
				const prov = selectedItemData as ProviderVerificationItem
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
			setDrawerOpen(false)
			setSelectedItemData(null)
			setNotes('')
			fetchQueues()
		} catch (err: any) {
			toast.error(err?.message || 'Verification update failed.')
		} finally {
			setSubmitting(false)
		}
	}

	// ── Open document in new tab ─────────────────────────────────────────────
	const handleOpenDocument = (doc: DoctorVerificationDocument) => {
		const url = buildS3Url(doc.url)
		if (url) {
			window.open(url, '_blank')
		} else {
			toast.error('Document URL is not available')
		}
	}

	// ── Table columns ────────────────────────────────────────────────────────
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
					onClick={() => handleOpenReview('doctor', row)}
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
					onClick={() => handleOpenReview('provider', row)}
					sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
				/>
			),
		},
	]

	// ── Drawer body for doctor ───────────────────────────────────────────────
	const renderDoctorDrawerBody = () => {
		if (detailLoading) {
			return (
				<Stack alignItems="center" sx={{ py: 6 }}>
					<CircularProgress size={28} sx={{ color: '#0d9488' }} />
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
						Loading doctor details...
					</Typography>
				</Stack>
			)
		}

		if (!doctorDetail) {
			return (
				<Alert severity="warning" sx={{ mt: 2 }}>
					Doctor details could not be loaded.
				</Alert>
			)
		}

		const d = doctorDetail

		return (
			<Box>
				{/* Personal Information */}
				<SectionHeader title="Personal Information" />
				<InfoRow label="Full Name" value={d.name} />
				<InfoRow label="Gender" value={d.gender} />
				<InfoRow label="Date of Birth" value={d.date_of_birth} />
				<InfoRow label="Email" value={d.email} />
				<InfoRow label="Phone" value={d.contact_number} />
				<InfoRow label="Location" value={d.location} />

				<Divider sx={{ my: 2 }} />

				{/* Professional Information */}
				<SectionHeader title="Professional Information" />
				<InfoRow label="Doctor ID" value={d.id} />
				<InfoRow label="Specialization" value={d.specialities?.join(', ')} />
				<InfoRow label="Qualification" value={d.qualification} />
				<InfoRow label="Experience" value={d.experience_years != null ? `${d.experience_years} years` : null} />
				<InfoRow label="Registration No." value={d.registration_number} />
				<InfoRow label="Hospital" value={d.hospital} />
				<InfoRow label="Consultation Fee" value={d.consultation_fee != null ? `₹${d.consultation_fee}` : null} />
				<InfoRow label="Languages" value={d.languages?.join(', ')} />
				{d.about && (
					<Box sx={{ mt: 1 }}>
						<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
							About
						</Typography>
						<Typography
							variant="body2"
							sx={{
								bgcolor: '#f8fafc',
								p: 1.5,
								borderRadius: 1.5,
								border: '1px solid #e2e8f0',
								fontSize: '13px',
								lineHeight: 1.6,
							}}
						>
							{d.about}
						</Typography>
					</Box>
				)}

				<Divider sx={{ my: 2 }} />

				{/* Documents */}
				<SectionHeader title="Verification Documents" />
				{d.documents && d.documents.length > 0 ? (
					<Stack spacing={1} sx={{ mt: 1 }}>
						{d.documents.map((doc) => (
							<Box
								key={doc.id}
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									p: 1.5,
									bgcolor: '#f8fafc',
									borderRadius: 2,
									border: '1px solid #e2e8f0',
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
									<DescriptionIcon sx={{ color: '#64748b', fontSize: 20 }} />
									<Box sx={{ minWidth: 0 }}>
										<Typography variant="body2" fontWeight={600} noWrap>
											{doc.name}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{doc.type.toUpperCase()}
										</Typography>
									</Box>
								</Box>
								<Tooltip title="Open in new tab">
									<IconButton
										size="small"
										onClick={() => handleOpenDocument(doc)}
										sx={{
											color: '#0d9488',
											'&:hover': { bgcolor: 'rgba(13, 148, 136, 0.08)' },
										}}
									>
										<OpenInNewIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</Box>
						))}
					</Stack>
				) : (
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
						No documents uploaded yet.
					</Typography>
				)}

				<Divider sx={{ my: 2 }} />

				{/* Admin Notes */}
				<SectionHeader title="Admin Review Notes" />
				<AppInput
					label=""
					placeholder="Enter administrative notes (optional)..."
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					multiline
					rows={3}
					fullWidth
				/>
			</Box>
		)
	}

	// ── Drawer body for provider (simpler, no extra detail endpoint) ─────────
	const renderProviderDrawerBody = () => {
		if (!selectedItemData) return null
		const prov = selectedItemData as ProviderVerificationItem

		return (
			<Box>
				<SectionHeader title="Provider Information" />
				<InfoRow label="Name" value={prov.name} />
				<InfoRow label="Owner" value={prov.owner_name} />
				<InfoRow label="Email" value={prov.email} />
				<InfoRow label="Contact" value={prov.contact_number} />
				<InfoRow label="Provider Type" value={prov.provider_type?.toUpperCase()} />
				<InfoRow label="License #" value={prov.license_number} />
				<InfoRow label="Status" value={prov.is_verified ? 'Verified' : 'Pending'} />

				<Divider sx={{ my: 2 }} />

				<SectionHeader title="Admin Review Notes" />
				<AppInput
					label=""
					placeholder="Enter administrative notes (optional)..."
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					multiline
					rows={3}
					fullWidth
				/>
			</Box>
		)
	}

	// ── Render ────────────────────────────────────────────────────────────────
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

			{/* ── Review & Verify Drawer ──────────────────────────────────────── */}
			<AppDrawer
				open={drawerOpen}
				onClose={() => {
					setDrawerOpen(false)
					setSelectedItemData(null)
					setDoctorDetail(null)
				}}
				title={`Verification Review — ${selectedItemData?.name ?? ''}`}
				subtitle={selectedItemType === 'doctor' ? 'Doctor Profile Review' : 'Provider Review'}
				onConfirm={() => handleVerifySubmit(true)}
				confirmLoading={submitting}
				width={480}
				sx={{top:'56px', height: 'calc(100% - 82px)',}}
				footerContent={
					<>
						<AppButton
							label="Reject Application"
							color="error"
							fullWidth
							startIcon={<CancelIcon />}
							onClick={() => handleVerifySubmit(false)}
							disabled={submitting}
							sx={{ borderRadius: '20px' }}
						/>
						<AppButton
							label="Approve & Verify"
							fullWidth
							startIcon={<CheckCircleIcon />}
							onClick={() => handleVerifySubmit(true)}
							disabled={submitting}
							loading={submitting}
							sx={{
								borderRadius: '20px',
								bgcolor: '#0d9488',
								'&:hover': { bgcolor: '#0f766e' },
							}}
						/>
					</>
				}
			>
				{selectedItemType === 'doctor' ? renderDoctorDrawerBody() : renderProviderDrawerBody()}
			</AppDrawer>
		</Box>
	)
}
