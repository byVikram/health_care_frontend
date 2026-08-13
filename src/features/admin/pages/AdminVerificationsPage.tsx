// src/features/admin/pages/AdminVerificationsPage.tsx
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
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
	Avatar,
	Grid,
	Button,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import DescriptionIcon from '@mui/icons-material/Description'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import StorefrontIcon from '@mui/icons-material/Storefront'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'

import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AdminStatCard from '../../../components/admin/AdminStatCard'
import StatusBadge from '../../../components/admin/StatusBadge'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'

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

const REJECTION_PRESETS = [
	'Illegible License Document',
	'Expired Medical Registration',
	'Qualification Certificate Missing',
	'Name Mismatch on Submitted ID',
	'Incomplete Hospital Affiliation Proof',
]

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
	return (
		<Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
			<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
				{label}
			</Typography>
			<Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', textAlign: 'right', wordBreak: 'break-word', maxWidth: '60%' }}>
				{value ?? '—'}
			</Typography>
		</Box>
	)
}

function SectionHeader({ title }: { title: string }) {
	return (
		<Typography
			variant="subtitle2"
			sx={{
				fontWeight: 800,
				color: '#0f172a',
				mt: 2,
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
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const initialTab = searchParams.get('tab') === 'providers' ? 'providers' : 'doctors'
	const [activeTab, setActiveTab] = useState<'doctors' | 'providers'>(initialTab)

	useEffect(() => {
		const paramTab = searchParams.get('tab')
		if (paramTab === 'providers' || paramTab === 'doctors') {
			setActiveTab(paramTab)
		}
	}, [searchParams])

	const handleTabChange = (_: React.SyntheticEvent, val: 'doctors' | 'providers') => {
		setActiveTab(val)
		if (val === 'doctors') {
			setDocPage(1)
		} else {
			setProvPage(1)
		}
		setSearchParams(val === 'providers' ? { tab: 'providers' } : {})
	}
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// ── Pagination ──────────────────────────────────────────────────────────
	const [docPage, setDocPage] = useState(1)
	const [docPageSize, setDocPageSize] = useState(10)
	const [docTotalRows, setDocTotalRows] = useState(0)

	const [provPage, setProvPage] = useState(1)
	const [provPageSize, setProvPageSize] = useState(10)
	const [provTotalRows, setProvTotalRows] = useState(0)

	const [doctorsQueue, setDoctorsQueue] = useState<DoctorVerificationItem[]>([])
	const [providersQueue, setProvidersQueue] = useState<ProviderVerificationItem[]>([])
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

	// Drawer state (for fallback inline inspections)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [selectedItemType, setSelectedItemType] = useState<'doctor' | 'provider' | null>(null)
	const [selectedItemData, setSelectedItemData] = useState<DoctorVerificationItem | ProviderVerificationItem | null>(null)
	const [doctorDetail, setDoctorDetail] = useState<DoctorVerificationDetail | null>(null)
	const [detailLoading, setDetailLoading] = useState(false)
	const [notes, setNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)

	const fetchQueues = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const [docRes, provRes] = await Promise.all([
				getDoctorsVerificationQueue({ page: docPage, pageSize: docPageSize }),
				getProvidersVerificationQueue({ page: provPage, pageSize: provPageSize }),
			])
			if (docRes.success && docRes.data) {
				setDoctorsQueue(docRes.data.items || [])
				setDocTotalRows(docRes.data.total ?? 0)
			}
			if (provRes.success && provRes.data) {
				setProvidersQueue(provRes.data.items || [])
				setProvTotalRows(provRes.data.total ?? 0)
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to load verification queue.'))
		} finally {
			setLoading(false)
		}
	}, [docPage, docPageSize, provPage, provPageSize])

	useEffect(() => {
		fetchQueues()
	}, [fetchQueues])

	const handleOpenReview = (type: 'doctor' | 'provider', item: DoctorVerificationItem | ProviderVerificationItem) => {
		const targetId = item.public_id || item.id
		const resolvedType = type === 'doctor' ? 'doctor' : (item as ProviderVerificationItem).provider_type || 'pharmacy'
		navigate(`/admin/verifications/${resolvedType}/${targetId}`)
	}

	const handleQuickVerify = async (
		type: 'doctor' | 'provider',
		item: DoctorVerificationItem | ProviderVerificationItem,
		isApproved: boolean,
		e?: React.MouseEvent
	) => {
		if (e) e.stopPropagation()

		const targetId = item.public_id || item.id
		setActionLoadingId(targetId)

		try {
			if (type === 'doctor') {
				const doc = item as DoctorVerificationItem
				const res = await verifyDoctor(targetId, { is_verified: isApproved })
				if (res.success) {
					toast.success(`Dr. ${doc.name} ${isApproved ? 'approved' : 'rejected'}.`)
				}
			} else {
				const prov = item as ProviderVerificationItem
				const res = await verifyProvider(prov.provider_type, targetId, { is_verified: isApproved })
				if (res.success) {
					toast.success(`${prov.name} ${isApproved ? 'approved' : 'rejected'}.`)
				}
			}
			fetchQueues()
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Quick verification failed.'))
		} finally {
			setActionLoadingId(null)
		}
	}

	const handleVerifySubmit = async (isApproved: boolean) => {
		if (!selectedItemType || !selectedItemData) return

		setSubmitting(true)
		try {
			if (selectedItemType === 'doctor') {
				const doc = selectedItemData as DoctorVerificationItem
				const targetId = doc.public_id || doc.id
				const res = await verifyDoctor(targetId, {
					is_verified: isApproved,
					rejection_reason: !isApproved ? notes.trim() || undefined : undefined,
				})
				if (res.success) {
					toast.success(`Dr. ${doc.name} ${isApproved ? 'approved & verified' : 'rejected'} successfully.`)
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
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Verification update failed.'))
		} finally {
			setSubmitting(false)
		}
	}

	const handleOpenDocument = (doc: DoctorVerificationDocument) => {
		const url = buildS3Url(doc.url)
		if (url) {
			window.open(url, '_blank')
		} else {
			toast.error('Document URL is not available')
		}
	}

	const handleOpenS3Proof = (s3Key?: string, e?: React.MouseEvent) => {
		if (e) e.stopPropagation()
		if (!s3Key) {
			toast.warning('No document proof attached.')
			return
		}
		const url = buildS3Url(s3Key)
		if (url) {
			window.open(url, '_blank')
		} else {
			toast.error('Document URL unavailable.')
		}
	}

	const handleAddPresetNote = (preset: string) => {
		setNotes((prev) => (prev ? `${prev}; ${preset}` : preset))
	}

	// ── Expanded Doctor Columns ────────────────────────────────────────────────
	const doctorColumns: Column<DoctorVerificationItem>[] = [
		{
			field: 'name',
			label: 'Applicant',
			render: (_: unknown, row: DoctorVerificationItem) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar sx={{ bgcolor: 'rgba(13,148,136,0.12)', color: '#0d9488', width: 38, height: 38, fontSize: 14, fontWeight: 800 }}>
						{(row.name || 'D').substring(0, 1).toUpperCase()}
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
							Dr. {row.name}
						</Typography>
						<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
							ID: #{row.public_id || row.id}
						</Typography>
					</Box>
				</Stack>
			),
		},
		{
			field: 'email',
			label: 'Contact Info',
			render: (_: unknown, row: DoctorVerificationItem) => (
				<Box>
					<Typography variant="body2" color="#0f172a" fontSize={13}>
						{row.email || '—'}
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
						{row.contact_number || '—'}
					</Typography>
				</Box>
			),
		},
		{
			field: 'speciality',
			label: 'Speciality',
			render: (_: unknown, row: DoctorVerificationItem) => (
				<Chip
					label={row.speciality || 'General Medicine'}
					size="small"
					sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: '0.65rem', height: 22, borderRadius: '6px' }}
				/>
			),
		},
		{
			field: 'registration_number',
			label: 'Registration #',
			render: (_: unknown, row: DoctorVerificationItem) => (
				<Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569', fontSize: 12.5 }}>
					{row.registration_number ? `#${row.registration_number}` : 'Pending'}
				</Typography>
			),
		},
		{
			field: 'created_at',
			label: 'Submitted Date',
			render: (_: unknown, row: DoctorVerificationItem) => (
				<Typography variant="caption" color="text.secondary">
					{row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
				</Typography>
			),
		},
		{
			field: 'is_verified',
			label: 'Status',
			render: (_: unknown, row: DoctorVerificationItem) => (
				<StatusBadge
					status={row.is_verified ? 'verified' : 'pending'}
					label={row.is_verified ? 'Verified' : 'Awaiting Review'}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_: unknown, row: DoctorVerificationItem) => (
				<Stack direction="row" spacing={0.75} justifyContent="flex-end" alignItems="center">
					<Tooltip title="Review Application">
						<span>
							<IconButton
								size="small"
								onClick={(e) => {
									e.stopPropagation()
									handleOpenReview('doctor', row)
								}}
								sx={{
									border: '1px solid #e2e8f0',
									borderRadius: 1.5,
									color: '#0d9488',
									'&:hover': { borderColor: '#0d9488', bgcolor: 'rgba(13,148,136,0.06)' },
								}}
							>
								<VisibilityIcon sx={{ fontSize: 16 }} />
							</IconButton>
						</span>
					</Tooltip>
				</Stack>
			),
		},
	]

	// ── Expanded Provider Columns ──────────────────────────────────────────────
	const providerColumns: Column<ProviderVerificationItem>[] = [
		{
			field: 'name',
			label: 'Facility Name',
			render: (_: unknown, row: ProviderVerificationItem) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: '#2563eb', width: 38, height: 38, fontSize: 14, fontWeight: 800 }}>
						{(row.name || 'P').substring(0, 1).toUpperCase()}
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
							{row.name}
						</Typography>
						<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
							Owner: {row.owner_name || 'N/A'}
						</Typography>
					</Box>
				</Stack>
			),
		},
		{
			field: 'email',
			label: 'Contact Info',
			render: (_: unknown, row: ProviderVerificationItem) => (
				<Box>
					<Typography variant="body2" color="#0f172a" fontSize={13}>
						{row.email || '—'}
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
						{row.contact_number || '—'}
					</Typography>
				</Box>
			),
		},
		{
			field: 'provider_type',
			label: 'Facility Type',
			render: (_: unknown, row: ProviderVerificationItem) => (
				<Chip
					label={row.provider_type.toUpperCase()}
					size="small"
					sx={{ bgcolor: '#f3e8ff', color: '#7e22ce', fontWeight: 700, fontSize: '0.65rem', height: 22, borderRadius: '6px' }}
				/>
			),
		},
		{
			field: 'license_number',
			label: 'License Number',
			render: (_: unknown, row: ProviderVerificationItem) => (
				<Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569', fontSize: 12.5 }}>
					{row.license_number ? `#${row.license_number}` : '—'}
				</Typography>
			),
		},
		{
			field: 'created_at',
			label: 'Submitted Date',
			render: (_: unknown, row: ProviderVerificationItem) => (
				<Typography variant="caption" color="text.secondary">
					{row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
				</Typography>
			),
		},
		{
			field: 'is_verified',
			label: 'Status',
			render: (_: unknown, row: ProviderVerificationItem) => (
				<StatusBadge
					status={row.is_verified ? 'verified' : 'pending'}
					label={row.is_verified ? 'Verified' : 'Awaiting Review'}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_: unknown, row: ProviderVerificationItem) => (
				<Stack direction="row" spacing={0.75} justifyContent="flex-end" alignItems="center">
					<Tooltip title="Review Application">
						<span>
							<IconButton
								size="small"
								onClick={(e) => {
									e.stopPropagation()
									handleOpenReview('provider', row)
								}}
								sx={{
									border: '1px solid #e2e8f0',
									borderRadius: 1.5,
									color: '#0d9488',
									'&:hover': { borderColor: '#0d9488', bgcolor: 'rgba(13,148,136,0.06)' },
								}}
							>
								<VisibilityIcon sx={{ fontSize: 16 }} />
							</IconButton>
						</span>
					</Tooltip>
				</Stack>
			),
		},
	]

	return (
		<Box>
			<AdminPageHeader
				title="Verifications Center"
				subtitle="Review, audit, approve, or reject healthcare providers and doctor credential applications."
				count={docTotalRows + provTotalRows}
				countLabel="pending applications"
			/>

			{/* Top Metric Cards */}
			<Grid container spacing={2.5} sx={{ mb: 3.5 }}>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard
						label="Pending Doctors Queue"
						value={docTotalRows}
						icon={<LocalHospitalIcon />}
						iconColor="#d97706"
						iconBg="rgba(217,119,6,0.12)"
						description="Doctors awaiting credential verification"
						onClick={() => setActiveTab('doctors')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard
						label="Pending Providers Queue"
						value={provTotalRows}
						icon={<StorefrontIcon />}
						iconColor="#0d9488"
						iconBg="rgba(13,148,136,0.12)"
						description="Labs, Pharmacies & Radiology"
						onClick={() => setActiveTab('providers')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard
						label="Total Applications"
						value={docTotalRows + provTotalRows}
						icon={<AssignmentTurnedInIcon />}
						iconColor="#2563eb"
						iconBg="rgba(37,99,235,0.1)"
						description="Total pending review requests"
					/>
				</Grid>
			</Grid>

			{/* Main Queue Tabs & Table */}
			<Tabs
				value={activeTab}
				onChange={handleTabChange}
				sx={{
					mb: 2.5,
					'& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 13.5 },
					'& .Mui-selected': { color: '#0d9488 !important' },
					'& .MuiTabs-indicator': { bgcolor: '#0d9488', height: 3 },
				}}
			>
				<Tab
					value="doctors"
					label={`Doctors Queue (${docTotalRows})`}
					icon={<LocalHospitalIcon sx={{ fontSize: 17 }} />}
					iconPosition="start"
				/>
				<Tab
					value="providers"
					label={`Providers Queue (${provTotalRows})`}
					icon={<StorefrontIcon sx={{ fontSize: 17 }} />}
					iconPosition="start"
				/>
			</Tabs>

			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
					{error}
				</Alert>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading verification queue...
					</Typography>
				</Stack>
			) : activeTab === 'doctors' ? (
				docTotalRows === 0 ? (
					<AdminEmptyState
						icon={<VerifiedUserIcon />}
						title="Doctors queue is clear"
						description="No doctor verification applications pending at this time."
					/>
				) : (
					<AppTable
						columns={doctorColumns}
						rows={doctorsQueue}
						emptyMessage="No doctors awaiting verification."
						onRowClick={(doc) => handleOpenReview('doctor', doc)}
						page={docPage}
						pageSize={docPageSize}
						totalRows={docTotalRows}
						onPageChange={(newPage) => setDocPage(newPage)}
						onPageSizeChange={(newSize) => {
							setDocPageSize(newSize)
							setDocPage(1)
						}}
					/>
				)
			) : provTotalRows === 0 ? (
				<AdminEmptyState
					icon={<VerifiedUserIcon />}
					title="Providers queue is clear"
					description="No pharmacy, lab, or radiology applications pending."
				/>
			) : (
				<AppTable
					columns={providerColumns}
					rows={providersQueue}
					emptyMessage="No providers awaiting verification."
					onRowClick={(prov) => handleOpenReview('provider', prov)}
					page={provPage}
					pageSize={provPageSize}
					totalRows={provTotalRows}
					onPageChange={(newPage) => setProvPage(newPage)}
					onPageSizeChange={(newSize) => {
						setProvPageSize(newSize)
						setProvPage(1)
					}}
				/>
			)}

			{/* ── Spacious 2-Column Inspection Drawer ───────────────────────────── */}
			<AppDrawer
				open={drawerOpen}
				onClose={() => {
					setDrawerOpen(false)
					setSelectedItemData(null)
					setDoctorDetail(null)
				}}
				onConfirm={() => handleVerifySubmit(true)}
				title={`Application Review — ${selectedItemData?.name ?? ''}`}
				subtitle={selectedItemType === 'doctor' ? 'Doctor License & Credential Inspection' : 'Provider Business License Inspection'}
				width={620}
				sx={{ top: '64px', height: 'calc(100% - 64px)' }}
				footerContent={
					<Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
						<AppButton
							label="Reject Application"
							color="error"
							variant="outlined"
							fullWidth
							startIcon={<CancelIcon />}
							onClick={() => handleVerifySubmit(false)}
							disabled={submitting}
							sx={{ borderRadius: '10px', fontWeight: 700 }}
						/>
						<AppButton
							label="Approve & Verify"
							fullWidth
							startIcon={<CheckCircleIcon />}
							onClick={() => handleVerifySubmit(true)}
							disabled={submitting}
							loading={submitting}
							sx={{
								borderRadius: '10px',
								fontWeight: 700,
								bgcolor: '#0d9488',
								'&:hover': { bgcolor: '#0f766e' },
							}}
						/>
					</Stack>
				}
			>
				{selectedItemType === 'doctor' ? (
					detailLoading ? (
						<Stack alignItems="center" sx={{ py: 8 }}>
							<CircularProgress size={32} sx={{ color: '#0d9488' }} />
							<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
								Loading doctor credentials & documents...
							</Typography>
						</Stack>
					) : !doctorDetail ? (
						<Alert severity="warning" sx={{ mt: 2 }}>Doctor details could not be loaded.</Alert>
					) : (
						<Box>
							{/* Doctor Overview Banner */}
							<Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', mb: 3 }}>
								<Stack direction="row" spacing={2} alignItems="center">
									<Avatar sx={{ width: 56, height: 56, bgcolor: '#0d9488', color: '#ffffff', fontSize: 22, fontWeight: 800 }}>
										{(doctorDetail.name || 'D').substring(0, 1).toUpperCase()}
									</Avatar>
									<Box>
										<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
											Dr. {doctorDetail.name}
										</Typography>
										<Typography variant="caption" color="text.secondary" display="block">
											{doctorDetail.email} | {doctorDetail.contact_number}
										</Typography>
										<Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
											<Chip label={doctorDetail.specialities?.join(', ') || 'General'} size="small" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: '0.62rem', height: 20 }} />
											<StatusBadge status={doctorDetail.is_verified ? 'verified' : 'pending'} label={doctorDetail.is_verified ? 'Verified' : 'Pending Review'} />
										</Stack>
									</Box>
								</Stack>
							</Box>

							{/* 2-Column Inspection Grid */}
							<Grid container spacing={3}>
								<Grid size={{ xs: 12, md: 6 }}>
									<SectionHeader title="Personal Information" />
									<InfoRow label="Gender" value={doctorDetail.gender} />
									<InfoRow label="Date of Birth" value={doctorDetail.date_of_birth} />
									<InfoRow label="Location" value={doctorDetail.location} />

									<SectionHeader title="Professional Credentials" />
									<InfoRow label="Registration #" value={doctorDetail.registration_number} />
									<InfoRow label="Qualification" value={doctorDetail.qualification} />
									<InfoRow label="Experience" value={doctorDetail.experience_years != null ? `${doctorDetail.experience_years} years` : null} />
									<InfoRow label="Hospital" value={doctorDetail.hospital} />
									<InfoRow label="Consult Fee" value={doctorDetail.consultation_fee != null ? `₹${doctorDetail.consultation_fee}` : null} />
									<InfoRow label="Languages" value={doctorDetail.languages?.join(', ')} />
								</Grid>

								<Grid size={{ xs: 12, md: 6 }}>
									<SectionHeader title="Submitted Documents" />
									{doctorDetail.documents && doctorDetail.documents.length > 0 ? (
										<Stack spacing={1.5}>
											{doctorDetail.documents.map((doc) => (
												<Box
													key={doc.id}
													sx={{
														p: 1.75,
														bgcolor: '#ffffff',
														borderRadius: '10px',
														border: '1px solid #e2e8f0',
														transition: 'all 0.15s ease',
														'&:hover': { borderColor: '#0d9488' },
													}}
												>
													<Stack direction="row" alignItems="center" justifyContent="space-between">
														<Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
															<DescriptionIcon sx={{ color: '#0d9488', fontSize: 22 }} />
															<Box sx={{ minWidth: 0 }}>
																<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
																	{doc.name}
																</Typography>
																<Typography variant="caption" color="text.secondary">
																	TYPE: {doc.type.toUpperCase()}
																</Typography>
															</Box>
														</Stack>
														<Tooltip title="Inspect document in new tab">
															<IconButton
																size="small"
																onClick={() => handleOpenDocument(doc)}
																sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#0d9488', '&:hover': { bgcolor: 'rgba(13,148,136,0.08)' } }}
															>
																<OpenInNewIcon sx={{ fontSize: 16 }} />
															</IconButton>
														</Tooltip>
													</Stack>
												</Box>
											))}
										</Stack>
									) : (
										<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
											No verification documents attached.
										</Typography>
									)}
								</Grid>
							</Grid>

							<Divider sx={{ my: 3 }} />

							{/* Rejection Presets & Notes */}
							<SectionHeader title="Reviewer Notes & Presets" />
							<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
								Click preset reasons below to quickly populate rejection notes:
							</Typography>
							<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
								{REJECTION_PRESETS.map((preset) => (
									<Chip
										key={preset}
										label={preset}
										size="small"
										onClick={() => handleAddPresetNote(preset)}
										sx={{
											bgcolor: '#f1f5f9',
											color: '#475569',
											fontSize: '0.68rem',
											fontWeight: 600,
											cursor: 'pointer',
											'&:hover': { bgcolor: '#fee2e2', color: '#dc2626' },
										}}
									/>
								))}
							</Stack>
							<AppInput
								label=""
								placeholder="Enter administrative review notes or rejection reason..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								multiline
								rows={3}
								fullWidth
							/>
						</Box>
					)
				) : selectedItemData ? (
					(() => {
						const prov = selectedItemData as ProviderVerificationItem
						return (
							<Box>
								<Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', mb: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center">
										<Avatar sx={{ width: 56, height: 56, bgcolor: '#2563eb', color: '#ffffff', fontSize: 22, fontWeight: 800 }}>
											{(prov.name || 'P').substring(0, 1).toUpperCase()}
										</Avatar>
										<Box>
											<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
												{prov.name}
											</Typography>
											<Typography variant="caption" color="text.secondary" display="block">
												Owner: {prov.owner_name} | {prov.email}
											</Typography>
											<Chip label={prov.provider_type?.toUpperCase()} size="small" sx={{ bgcolor: '#f3e8ff', color: '#7e22ce', fontWeight: 700, fontSize: '0.62rem', height: 20, mt: 0.75 }} />
										</Box>
									</Stack>
								</Box>

								<SectionHeader title="Provider Information" />
								<InfoRow label="Business Name" value={prov.name} />
								<InfoRow label="Owner Name" value={prov.owner_name} />
								<InfoRow label="Email Address" value={prov.email} />
								<InfoRow label="Phone Number" value={prov.contact_number} />
								<InfoRow label="Provider Type" value={prov.provider_type?.toUpperCase()} />
								<InfoRow label="License Number" value={prov.license_number} />
								<InfoRow label="Status" value={prov.is_verified ? 'Verified' : 'Pending Review'} />

								<Divider sx={{ my: 3 }} />

								<SectionHeader title="Reviewer Notes & Presets" />
								<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
									{REJECTION_PRESETS.map((preset) => (
										<Chip
											key={preset}
											label={preset}
											size="small"
											onClick={() => handleAddPresetNote(preset)}
											sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', '&:hover': { bgcolor: '#fee2e2', color: '#dc2626' } }}
										/>
									))}
								</Stack>
								<AppInput
									label=""
									placeholder="Enter administrative review notes or rejection reason..."
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									multiline
									rows={3}
									fullWidth
								/>
							</Box>
						)
					})()
				) : null}
			</AppDrawer>
		</Box>
	)
}
