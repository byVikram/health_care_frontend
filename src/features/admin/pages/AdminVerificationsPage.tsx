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
	IconButton,
	Tooltip,
	Avatar,
	Grid,
	Checkbox,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import StorefrontIcon from '@mui/icons-material/Storefront'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import { toast } from 'react-toastify'

import { useAuth } from '../../../hooks/useAuth'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppSelect from '../../../components/common/Select/AppSelect'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AdminStatCard from '../../../components/admin/AdminStatCard'
import StatusBadge from '../../../components/admin/StatusBadge'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'

import {
	getDoctorsVerificationQueue,
	getNursesVerificationQueue,
	getProvidersVerificationQueue,
	DoctorVerificationItem,
	NurseVerificationItem,
	ProviderVerificationItem,
	listSubAdmins,
	assignDoctorsToSubadmin,
	SubAdminItem,
} from '../adminService'

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

export default function AdminVerificationsPage() {
	const { role } = useAuth()
	const isSuperAdmin = role === 'super_admin'
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const initialTab =
		searchParams.get('tab') === 'nurses'
			? 'nurses'
			: searchParams.get('tab') === 'providers'
			? 'providers'
			: 'doctors'
	const [activeTab, setActiveTab] = useState<'doctors' | 'nurses' | 'providers'>(initialTab)

	useEffect(() => {
		const paramTab = searchParams.get('tab')
		if (paramTab === 'providers' || paramTab === 'doctors' || paramTab === 'nurses') {
			setActiveTab(paramTab)
		}
	}, [searchParams])

	const handleTabChange = (_: React.SyntheticEvent, val: 'doctors' | 'nurses' | 'providers') => {
		setActiveTab(val)
		if (val === 'doctors') {
			setDocPage(1)
		} else if (val === 'nurses') {
			setNursePage(1)
		} else {
			setProvPage(1)
		}
		setSearchParams(val !== 'doctors' ? { tab: val } : {})
	}
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// ── Pagination ──────────────────────────────────────────────────────────
	const [docPage, setDocPage] = useState(1)
	const [docPageSize, setDocPageSize] = useState(10)
	const [docTotalRows, setDocTotalRows] = useState(0)

	const [nursePage, setNursePage] = useState(1)
	const [nursePageSize, setNursePageSize] = useState(10)
	const [nurseTotalRows, setNurseTotalRows] = useState(0)

	const [provPage, setProvPage] = useState(1)
	const [provPageSize, setProvPageSize] = useState(10)
	const [provTotalRows, setProvTotalRows] = useState(0)

	const [doctorsQueue, setDoctorsQueue] = useState<DoctorVerificationItem[]>([])
	const [nursesQueue, setNursesQueue] = useState<NurseVerificationItem[]>([])
	const [providersQueue, setProvidersQueue] = useState<ProviderVerificationItem[]>([])

	// ── Doctor -> Sub Admin assignment (bulk select + assign) ────────────────
	const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([])
	const [subAdmins, setSubAdmins] = useState<SubAdminItem[]>([])
	const [assigning, setAssigning] = useState(false)

	useEffect(() => {
		if (!isSuperAdmin) return
		listSubAdmins({ role: 'compliance_admin', pageSize: 100 })
			.then((res) => {
				if (res.success && res.data) {
					setSubAdmins(res.data.items || [])
				}
			})
			.catch(() => {
				// Non-fatal -- assign dropdown simply stays empty.
			})
	}, [isSuperAdmin])

	const toggleDoctorSelection = (id: string) => {
		setSelectedDoctorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
	}

	const handleAssignToSubAdmin: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
		const assignedToId = e.target.value
		if (!assignedToId) return
		if (selectedDoctorIds.length === 0) {
			toast.info('Select at least one doctor to assign first.')
			return
		}

		setAssigning(true)
		try {
			const res = await assignDoctorsToSubadmin(selectedDoctorIds, assignedToId)
			if (res.success) {
				const subAdminName = subAdmins.find((s) => s.public_id === assignedToId)?.name
				toast.success(`${selectedDoctorIds.length} doctor(s) assigned to ${subAdminName || 'Sub Admin'}.`)
				setSelectedDoctorIds([])
				fetchQueues()
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to assign doctors.'))
		} finally {
			setAssigning(false)
		}
	}

	const fetchQueues = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const [docRes, nurseRes, provRes] = await Promise.allSettled([
				getDoctorsVerificationQueue({ page: docPage, pageSize: docPageSize }),
				getNursesVerificationQueue({ page: nursePage, pageSize: nursePageSize }),
				getProvidersVerificationQueue({ page: provPage, pageSize: provPageSize }),
			])

			if (docRes.status === 'fulfilled' && docRes.value?.success && docRes.value?.data) {
				setDoctorsQueue(docRes.value.data.items || [])
				setDocTotalRows(docRes.value.data.total ?? 0)
			}
			if (nurseRes.status === 'fulfilled' && nurseRes.value?.success && nurseRes.value?.data) {
				setNursesQueue(nurseRes.value.data.items || [])
				setNurseTotalRows(nurseRes.value.data.total ?? 0)
			} else {
				setNursesQueue([])
				setNurseTotalRows(0)
			}
			if (provRes.status === 'fulfilled' && provRes.value?.success && provRes.value?.data) {
				setProvidersQueue(provRes.value.data.items || [])
				setProvTotalRows(provRes.value.data.total ?? 0)
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to load verification queue.'))
		} finally {
			setLoading(false)
		}
	}, [docPage, docPageSize, nursePage, nursePageSize, provPage, provPageSize])

	useEffect(() => {
		fetchQueues()
	}, [fetchQueues])

	const handleOpenReview = (
		type: 'doctor' | 'nurse' | 'provider',
		item: DoctorVerificationItem | NurseVerificationItem | ProviderVerificationItem
	) => {
		const targetId = item.public_id || item.id
		if (type === 'doctor') {
			navigate(`/admin/verifications/doctor/${targetId}`)
		} else if (type === 'nurse') {
			navigate(`/admin/verifications/ancillary/${targetId}`)
		} else {
			const resolvedType = (item as ProviderVerificationItem).provider_type || 'pharmacy'
			navigate(`/admin/verifications/${resolvedType}/${targetId}`)
		}
	}

	// ── Expanded Doctor Columns ────────────────────────────────────────────────
	const doctorColumns: Column<DoctorVerificationItem>[] = [
		{
			field: 'name',
			label: 'Applicant',
			render: (_: unknown, row: DoctorVerificationItem) => {
				const rowId = row.public_id || row.id
				return (
					<Stack direction="row" spacing={1} alignItems="center">
						{isSuperAdmin && (
							<Checkbox
								size="medium"
								checked={selectedDoctorIds.includes(rowId)}
								onClick={(e) => e.stopPropagation()}
								onChange={() => toggleDoctorSelection(rowId)}
								sx={{ p: 0.75, color: '#cbd5e1', '& .MuiSvgIcon-root': { fontSize: 24 }, '&.Mui-checked': { color: '#0d9488' } }}
							/>
						)}
						<Box sx={{ minWidth: 0 }}>
							<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
								Dr. {row.name}
							</Typography>
						</Box>
					</Stack>
				)
			},
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
				<Box>
					<StatusBadge
						status={row.is_verified ? 'verified' : 'pending'}
						label={row.is_verified ? 'Verified' : 'Awaiting Review'}
					/>
					{row.assigned_admin_name && (
						<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
							Assigned: {row.assigned_admin_name}
						</Typography>
					)}
				</Box>
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

	// ── Dedicated Nurse Columns ───────────────────────────────────────────────
	const nurseColumns: Column<NurseVerificationItem>[] = [
		{
			field: 'name',
			label: 'Applicant',
			render: (_: unknown, row: NurseVerificationItem) => {
				const rawName = row.name || row.owner_name || 'Nurse'
				const displayName = rawName.startsWith('Nurse') ? rawName : `Nurse ${rawName}`
				return (
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
							{displayName}
						</Typography>
					</Box>
				)
			},
		},
		{
			field: 'email',
			label: 'Contact Info',
			render: (_: unknown, row: NurseVerificationItem) => (
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
			render: (_: unknown, row: NurseVerificationItem) => (
				<Chip
					label={row.speciality || 'General Nursing'}
					size="small"
					sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700, fontSize: '0.65rem', height: 22, borderRadius: '6px' }}
				/>
			),
		},
		{
			field: 'license_number',
			label: 'Registration #',
			render: (_: unknown, row: NurseVerificationItem) => (
				<Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569', fontSize: 12.5 }}>
					{row.license_number ? `#${row.license_number}` : 'Pending'}
				</Typography>
			),
		},
		{
			field: 'created_at',
			label: 'Submitted Date',
			render: (_: unknown, row: NurseVerificationItem) => {
				if (!row.created_at) return <Typography variant="caption" color="text.secondary">—</Typography>
				try {
					const dt = new Date(row.created_at)
					return (
						<Typography variant="caption" color="text.secondary">
							{isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
						</Typography>
					)
				} catch {
					return <Typography variant="caption" color="text.secondary">—</Typography>
				}
			},
		},
		{
			field: 'is_verified',
			label: 'Status',
			render: (_: unknown, row: NurseVerificationItem) => (
				<Box>
					<StatusBadge
						status={row.is_verified ? 'verified' : (row.verification_status === 'rejected' ? 'rejected' : 'pending')}
						label={row.is_verified ? 'Verified' : (row.verification_status === 'rejected' ? 'Rejected' : 'Awaiting Review')}
					/>
				</Box>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_: unknown, row: NurseVerificationItem) => (
				<Stack direction="row" spacing={0.75} justifyContent="flex-end" alignItems="center">
					<Tooltip title="Review Application">
						<span>
							<IconButton
								size="small"
								onClick={(e) => {
									e.stopPropagation()
									handleOpenReview('nurse', row)
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

	const totalAllApplications = docTotalRows + nurseTotalRows + provTotalRows

	return (
		<Box>
			<AdminPageHeader
				title="Verifications Center"
				subtitle="Review, audit, approve, or reject healthcare providers, doctors, and nurses credential applications."
				count={totalAllApplications}
				countLabel="pending applications"
			/>

			{/* Top Metric Cards */}
			<Grid container spacing={2.5} sx={{ mb: 3.5 }}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<AdminStatCard
						label="Pending Doctors"
						value={docTotalRows}
						icon={<LocalHospitalIcon />}
						iconColor="#d97706"
						iconBg="rgba(217,119,6,0.12)"
						description="Doctors awaiting credential review"
						onClick={() => setActiveTab('doctors')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<AdminStatCard
						label="Pending Nurses"
						value={nurseTotalRows}
						icon={<MedicalServicesIcon />}
						iconColor="#0d9488"
						iconBg="rgba(13,148,136,0.12)"
						description="Nurses awaiting registration verification"
						onClick={() => setActiveTab('nurses')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<AdminStatCard
						label="Pending Providers"
						value={provTotalRows}
						icon={<StorefrontIcon />}
						iconColor="#7e22ce"
						iconBg="rgba(126,34,206,0.12)"
						description="Labs, Pharmacies & Diagnostic centers"
						onClick={() => setActiveTab('providers')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<AdminStatCard
						label="Total Applications"
						value={totalAllApplications}
						icon={<AssignmentTurnedInIcon />}
						iconColor="#2563eb"
						iconBg="rgba(37,99,235,0.1)"
						description="Total pending review requests"
					/>
				</Grid>
			</Grid>

			{/* Main Queue Tabs & Table */}
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					sx={{
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
						value="nurses"
						label={`Nurses Queue (${nurseTotalRows})`}
						icon={<MedicalServicesIcon sx={{ fontSize: 17 }} />}
						iconPosition="start"
					/>
					<Tab
						value="providers"
						label={`Providers Queue (${provTotalRows})`}
						icon={<StorefrontIcon sx={{ fontSize: 17 }} />}
						iconPosition="start"
					/>
				</Tabs>

				{activeTab === 'doctors' && isSuperAdmin && (
					<Stack direction="row" spacing={1.5} alignItems="center">
						{selectedDoctorIds.length > 0 && (
							<Chip
								label={`${selectedDoctorIds.length} selected`}
								size="small"
								sx={{ bgcolor: 'rgba(13,148,136,0.1)', color: '#0d9488', fontWeight: 700 }}
							/>
						)}
						<Box sx={{ minWidth: 220 }}>
							<AppSelect
								placeholder={
									assigning
										? 'Assigning...'
										: selectedDoctorIds.length === 0
										? 'Select doctors to assign'
										: 'Assign to Sub Admin'
								}
								value=""
								disabled={assigning}
								onChange={handleAssignToSubAdmin}
								options={
									subAdmins.length > 0
										? subAdmins.map((s) => ({ value: s.public_id, label: s.name || s.email || 'Unnamed' }))
										: [{ value: '', label: 'No sub admins available', disabled: true }]
								}
							/>
						</Box>
					</Stack>
				)}
			</Box>

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
			) : activeTab === 'nurses' ? (
				nurseTotalRows === 0 ? (
					<AdminEmptyState
						icon={<MedicalServicesIcon />}
						title="Nurses queue is clear"
						description="No nurse verification applications pending at this time."
					/>
				) : (
					<AppTable
						columns={nurseColumns}
						rows={nursesQueue}
						emptyMessage="No nurses awaiting verification."
						onRowClick={(nurse) => handleOpenReview('nurse', nurse)}
						page={nursePage}
						pageSize={nursePageSize}
						totalRows={nurseTotalRows}
						onPageChange={(newPage) => setNursePage(newPage)}
						onPageSizeChange={(newSize) => {
							setNursePageSize(newSize)
							setNursePage(1)
						}}
					/>
				)
			) : provTotalRows === 0 ? (
				<AdminEmptyState
					icon={<VerifiedUserIcon />}
					title="Providers queue is clear"
					description="No pharmacy, lab, or diagnostic applications pending."
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
		</Box>
	)
}
