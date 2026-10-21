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
	Button,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import StorefrontIcon from '@mui/icons-material/Storefront'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import PeopleIcon from '@mui/icons-material/People'
import RefreshIcon from '@mui/icons-material/Refresh'
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
	getVerificationKpiCounts,
	VerificationKpiCounts,
	getAncillaryCategories,
	DoctorVerificationItem,
	NurseVerificationItem,
	ProviderVerificationItem,
	listSubAdmins,
	assignDoctorsToSubadmin,
	assignProvidersToSubadmin,
	listSpecialities,
	SubAdminItem,
} from '../adminService'

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

const DEFAULT_ANCILLARY_SUBCATEGORIES = [
	{ label: 'All Specialities', value: '', icon: <PeopleIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Nursing Care', value: 'Nursing Care', icon: <MedicalServicesIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Physiotherapy', value: 'Physiotherapy', icon: <MedicalServicesIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Rehabilitation', value: 'Rehabilitation', icon: <MedicalServicesIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Elderly Care', value: 'Elderly Care', icon: <MedicalServicesIcon sx={{ fontSize: 14 }} /> },
]

const PROVIDER_SUBCATEGORIES = [
	{ label: 'All', value: '', icon: <StorefrontIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Pharmacies', value: 'pharmacy', icon: <StorefrontIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Radiology', value: 'radiology', icon: <StorefrontIcon sx={{ fontSize: 14 }} /> },
]

export default function AdminVerificationsPage() {
	const { role } = useAuth()
	const isSuperAdmin = role === 'super_admin'
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()

	const initialTab =
		searchParams.get('tab') === 'nurses' || searchParams.get('tab') === 'ancillary'
			? 'ancillary'
			: searchParams.get('tab') === 'providers'
			? 'providers'
			: 'doctors'

	const [activeTab, setActiveTab] = useState<'doctors' | 'ancillary' | 'providers'>(initialTab)

	// ── Subcategory State ───────────────────────────────────────────────────
	const [ancillarySubcategories, setAncillarySubcategories] = useState(DEFAULT_ANCILLARY_SUBCATEGORIES)
	const [selectedAncillarySubcategory, setSelectedAncillarySubcategory] = useState<string>('')
	const [selectedProviderSubcategory, setSelectedProviderSubcategory] = useState<string>('')

	// ── Doctor Specialities Filter ──────────────────────────────────────────
	const [doctorSpecialities, setDoctorSpecialities] = useState<{ label: string; value: string }[]>([
		{ label: 'All Specialities', value: '' },
	])
	const [selectedDoctorSpeciality, setSelectedDoctorSpeciality] = useState<string>('')

	useEffect(() => {
		listSpecialities()
			.then((res) => {
				if (res.success && Array.isArray(res.data) && res.data.length > 0) {
					const opts = [
						{ label: 'All Specialities', value: '' },
						...res.data.map((s) => ({ label: s.label, value: s.label })),
					]
					setDoctorSpecialities(opts)
				}
			})
			.catch(() => {
				// Keep default
			})
	}, [])

	useEffect(() => {
		const paramTab = searchParams.get('tab')
		if (paramTab === 'providers' || paramTab === 'doctors' || paramTab === 'ancillary' || paramTab === 'nurses') {
			setActiveTab(paramTab === 'nurses' ? 'ancillary' : (paramTab as 'doctors' | 'ancillary' | 'providers'))
		}
	}, [searchParams])

	// Fetch dynamic ancillary categories if available
	useEffect(() => {
		getAncillaryCategories()
			.then((res) => {
				if (res.success && Array.isArray(res.data) && res.data.length > 0) {
					const dynamicOptions = [
						{ label: 'All Specialities', value: '', icon: <PeopleIcon sx={{ fontSize: 14 }} /> },
						...res.data.map((cat) => ({
							label: cat.title || cat.code,
							value: cat.title || cat.code,
							icon: <MedicalServicesIcon sx={{ fontSize: 14 }} />,
						})),
					]
					setAncillarySubcategories(dynamicOptions)
				}
			})
			.catch(() => {
				// Keep default subcategories
			})
	}, [])

	const handleTabChange = (_: React.SyntheticEvent, val: 'doctors' | 'ancillary' | 'providers') => {
		setActiveTab(val)
		setSelectedIds([])
		setSelectedAncillarySubcategory('')
		setSelectedProviderSubcategory('')
		setSelectedDoctorSpeciality('')
		if (val === 'doctors') {
			setDocPage(1)
		} else if (val === 'ancillary') {
			setNursePage(1)
		} else {
			setProvPage(1)
		}
		setSearchParams(val !== 'doctors' ? { tab: val } : {})
	}

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// ── Dedicated KPI Counts State (Independent from queue lists) ───────────
	const [kpiCounts, setKpiCounts] = useState<VerificationKpiCounts>({
		pending_doctors: 0,
		pending_ancillary: 0,
		pending_providers: 0,
		total_applications: 0,
	})

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

	// ── Multi Selection & Sub Admin assignment ──────────────────────────────
	const [selectedIds, setSelectedIds] = useState<string[]>([])
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

	const toggleSelection = (id: string) => {
		setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
	}

	// ── 1. Fetch Dedicated KPI Counts (Card Counts) ──────────────────────────
	const fetchKpiCounts = useCallback(async () => {
		try {
			const res = await getVerificationKpiCounts()
			if (res.success && res.data) {
				setKpiCounts(res.data)
			}
		} catch (err) {
			console.warn('Failed to load verification KPI counts:', err)
		}
	}, [])

	useEffect(() => {
		fetchKpiCounts()
	}, [fetchKpiCounts])

	// ── 2. Lazy-Load Active Queue Only (Called only for active tab) ──────────
	const fetchActiveQueue = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			if (activeTab === 'doctors') {
				const res = await getDoctorsVerificationQueue({ page: docPage, pageSize: docPageSize })
				if (res.success && res.data) {
					setDoctorsQueue(res.data.items || [])
					setDocTotalRows(res.data.total ?? 0)
				}
			} else if (activeTab === 'ancillary') {
				const res = await getNursesVerificationQueue({
					page: nursePage,
					pageSize: nursePageSize,
					subcategory: selectedAncillarySubcategory || undefined,
				})
				if (res.success && res.data) {
					setNursesQueue(res.data.items || [])
					setNurseTotalRows(res.data.total ?? 0)
				} else {
					setNursesQueue([])
					setNurseTotalRows(0)
				}
			} else if (activeTab === 'providers') {
				const res = await getProvidersVerificationQueue({
					page: provPage,
					pageSize: provPageSize,
					subcategory: selectedProviderSubcategory || undefined,
				})
				if (res.success && res.data) {
					setProvidersQueue(res.data.items || [])
					setProvTotalRows(res.data.total ?? 0)
				} else {
					setProvidersQueue([])
					setProvTotalRows(0)
				}
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to load verification queue.'))
		} finally {
			setLoading(false)
		}
	}, [
		activeTab,
		docPage,
		docPageSize,
		nursePage,
		nursePageSize,
		selectedAncillarySubcategory,
		provPage,
		provPageSize,
		selectedProviderSubcategory,
	])

	useEffect(() => {
		fetchActiveQueue()
	}, [fetchActiveQueue])

	const handleRefresh = async () => {
		await Promise.all([fetchKpiCounts(), fetchActiveQueue()])
	}

	const handleAssignToSubAdmin: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
		const assignedToId = e.target.value
		if (!assignedToId) return
		if (selectedIds.length === 0) {
			const label = activeTab === 'doctors' ? 'doctor' : activeTab === 'ancillary' ? 'ancillary application' : 'provider'
			toast.info(`Select at least one ${label} to assign first.`)
			return
		}

		setAssigning(true)
		try {
			if (activeTab === 'doctors') {
				const res = await assignDoctorsToSubadmin(selectedIds, assignedToId)
				if (res.success) {
					const subAdminName = subAdmins.find((s) => s.public_id === assignedToId)?.name
					toast.success(`${selectedIds.length} doctor(s) assigned to ${subAdminName || 'Sub Admin'}.`)
					setSelectedIds([])
					fetchKpiCounts()
					fetchActiveQueue()
				}
			} else if (activeTab === 'ancillary') {
				const res = await assignProvidersToSubadmin(selectedIds, assignedToId, 'ancillary')
				if (res.success) {
					const subAdminName = subAdmins.find((s) => s.public_id === assignedToId)?.name
					toast.success(`${selectedIds.length} ancillary application(s) assigned to ${subAdminName || 'Sub Admin'}.`)
					setSelectedIds([])
					fetchKpiCounts()
					fetchActiveQueue()
				}
			} else {
				const res = await assignProvidersToSubadmin(selectedIds, assignedToId, selectedProviderSubcategory || 'provider')
				if (res.success) {
					const subAdminName = subAdmins.find((s) => s.public_id === assignedToId)?.name
					toast.success(`${selectedIds.length} provider(s) assigned to ${subAdminName || 'Sub Admin'}.`)
					setSelectedIds([])
					fetchKpiCounts()
					fetchActiveQueue()
				}
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to assign applications.'))
		} finally {
			setAssigning(false)
		}
	}

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
								checked={selectedIds.includes(rowId)}
								onClick={(e) => e.stopPropagation()}
								onChange={() => toggleSelection(rowId)}
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

	// ── Dedicated Ancillary / Nurse Columns ────────────────────────────────────
	const nurseColumns: Column<NurseVerificationItem>[] = [
		{
			field: 'name',
			label: 'Applicant',
			render: (_: unknown, row: NurseVerificationItem) => {
				const rowId = row.public_id || row.id
				const rawName = row.name || row.owner_name || 'Nurse'
				const displayName = rawName.startsWith('Nurse') ? rawName : `Nurse ${rawName}`
				return (
					<Stack direction="row" spacing={1} alignItems="center">
						{isSuperAdmin && (
							<Checkbox
								size="medium"
								checked={selectedIds.includes(rowId)}
								onClick={(e) => e.stopPropagation()}
								onChange={() => toggleSelection(rowId)}
								sx={{ p: 0.75, color: '#cbd5e1', '& .MuiSvgIcon-root': { fontSize: 24 }, '&.Mui-checked': { color: '#0d9488' } }}
							/>
						)}
						<Box sx={{ minWidth: 0 }}>
							<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
								{displayName}
							</Typography>
						</Box>
					</Stack>
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
			render: (_: unknown, row: ProviderVerificationItem) => {
				const rowId = row.public_id || row.id
				return (
					<Stack direction="row" spacing={1.5} alignItems="center">
						{isSuperAdmin && (
							<Checkbox
								size="medium"
								checked={selectedIds.includes(rowId)}
								onClick={(e) => e.stopPropagation()}
								onChange={() => toggleSelection(rowId)}
								sx={{ p: 0.75, color: '#cbd5e1', '& .MuiSvgIcon-root': { fontSize: 24 }, '&.Mui-checked': { color: '#0d9488' } }}
							/>
						)}
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
				)
			},
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
				subtitle="Review, audit, approve, or reject healthcare providers, doctors, and nurses credential applications."
				count={kpiCounts.total_applications}
				countLabel="pending applications"
				actions={
					<Button
						variant="outlined"
						size="small"
						startIcon={<RefreshIcon sx={{ fontSize: 17 }} />}
						onClick={handleRefresh}
						disabled={loading}
						sx={{
							borderRadius: 2,
							fontWeight: 700,
							textTransform: 'none',
							border: '1px solid #e2e8f0',
							color: '#0d9488',
							bgcolor: '#ffffff',
							fontSize: '0.8rem',
							height: 38,
							px: 2,
							'&:hover': {
								borderColor: '#0d9488',
								bgcolor: 'rgba(13,148,136,0.04)',
							},
						}}
					>
						Refresh
					</Button>
				}
			/>

			{/* Top Metric Cards */}
			<Grid container spacing={2.5} sx={{ mb: 3.5 }}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<AdminStatCard
						label="Pending Doctors"
						value={kpiCounts.pending_doctors}
						icon={<LocalHospitalIcon />}
						iconColor="#d97706"
						iconBg="rgba(217,119,6,0.12)"
						description="Doctors awaiting credential review"
						onClick={() => setActiveTab('doctors')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<AdminStatCard
						label="Pending Ancillary"
						value={kpiCounts.pending_ancillary}
						icon={<MedicalServicesIcon />}
						iconColor="#0d9488"
						iconBg="rgba(13,148,136,0.12)"
						description="Ancillary care providers awaiting registration verification"
						onClick={() => setActiveTab('ancillary')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<AdminStatCard
						label="Pending Providers"
						value={kpiCounts.pending_providers}
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
						value={kpiCounts.total_applications}
						icon={<AssignmentTurnedInIcon />}
						iconColor="#2563eb"
						iconBg="rgba(37,99,235,0.1)"
						description="Total pending review requests"
					/>
				</Grid>
			</Grid>

			{/* Main Queue Tabs & Sub Admin Assignment Bar */}
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
						label="Doctors Queue"
						icon={<LocalHospitalIcon sx={{ fontSize: 17 }} />}
						iconPosition="start"
					/>
					<Tab
						value="ancillary"
						label="Ancillary Queue"
						icon={<MedicalServicesIcon sx={{ fontSize: 17 }} />}
						iconPosition="start"
					/>
					<Tab
						value="providers"
						label="Providers Queue"
						icon={<StorefrontIcon sx={{ fontSize: 17 }} />}
						iconPosition="start"
					/>
				</Tabs>

				{isSuperAdmin && (
					<Stack direction="row" spacing={1.5} alignItems="center">
						{selectedIds.length > 0 && (
							<Chip
								label={`${selectedIds.length} selected`}
								size="small"
								sx={{ bgcolor: 'rgba(13,148,136,0.1)', color: '#0d9488', fontWeight: 700 }}
							/>
						)}
						<Box sx={{ minWidth: 220 }}>
							<AppSelect
								placeholder={
									assigning
										? 'Assigning...'
										: selectedIds.length === 0
										? `Select ${activeTab === 'doctors' ? 'doctors' : activeTab === 'ancillary' ? 'ancillary' : 'providers'} to assign`
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

			{/* Doctor Specialities Filter Pills */}
			{activeTab === 'doctors' && doctorSpecialities.length > 1 && (
				<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
					{doctorSpecialities.map((opt) => {
						const isSelected = selectedDoctorSpeciality === opt.value
						return (
							<Chip
								key={opt.value || 'all'}
								icon={<LocalHospitalIcon sx={{ fontSize: 14 }} />}
								label={opt.label}
								onClick={() => {
									setSelectedDoctorSpeciality(opt.value)
									setDocPage(1)
									setSelectedIds([])
								}}
								sx={{
									bgcolor: isSelected ? '#0f172a' : '#ffffff',
									color: isSelected ? '#ffffff' : '#475569',
									fontWeight: isSelected ? 700 : 500,
									border: '1px solid',
									borderColor: isSelected ? '#0f172a' : '#e2e8f0',
									fontSize: '0.75rem',
									py: 1.75,
									px: 0.5,
									cursor: 'pointer',
									boxShadow: isSelected ? '0 2px 8px rgba(15,23,42,0.15)' : 'none',
									'& .MuiChip-icon': {
										color: isSelected ? '#2dd4bf !important' : '#64748b !important',
									},
									'&:hover': {
										bgcolor: isSelected ? '#0f172a' : '#f8fafc',
									},
								}}
							/>
						)
					})}
				</Stack>
			)}

			{/* Subcategory Filter Pills (Matching Admin Users UI styling) */}
			{activeTab === 'ancillary' && (
				<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
					{ancillarySubcategories.map((opt) => {
						const isSelected = selectedAncillarySubcategory === opt.value
						return (
							<Chip
								key={opt.value || 'all'}
								icon={opt.icon}
								label={opt.label}
								onClick={() => {
									setSelectedAncillarySubcategory(opt.value)
									setNursePage(1)
									setSelectedIds([])
								}}
								sx={{
									bgcolor: isSelected ? '#0f172a' : '#ffffff',
									color: isSelected ? '#ffffff' : '#475569',
									fontWeight: isSelected ? 700 : 500,
									border: '1px solid',
									borderColor: isSelected ? '#0f172a' : '#e2e8f0',
									fontSize: '0.75rem',
									py: 1.75,
									px: 0.5,
									cursor: 'pointer',
									boxShadow: isSelected ? '0 2px 8px rgba(15,23,42,0.15)' : 'none',
									'& .MuiChip-icon': {
										color: isSelected ? '#2dd4bf !important' : '#64748b !important',
									},
									'&:hover': {
										bgcolor: isSelected ? '#0f172a' : '#f8fafc',
									},
								}}
							/>
						)
					})}
				</Stack>
			)}

			{activeTab === 'providers' && (
				<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
					{PROVIDER_SUBCATEGORIES.map((opt) => {
						const isSelected = selectedProviderSubcategory === opt.value
						return (
							<Chip
								key={opt.value || 'all'}
								icon={opt.icon}
								label={opt.label}
								onClick={() => {
									setSelectedProviderSubcategory(opt.value)
									setProvPage(1)
									setSelectedIds([])
								}}
								sx={{
									bgcolor: isSelected ? '#0f172a' : '#ffffff',
									color: isSelected ? '#ffffff' : '#475569',
									fontWeight: isSelected ? 700 : 500,
									border: '1px solid',
									borderColor: isSelected ? '#0f172a' : '#e2e8f0',
									fontSize: '0.75rem',
									py: 1.75,
									px: 0.5,
									cursor: 'pointer',
									boxShadow: isSelected ? '0 2px 8px rgba(15,23,42,0.15)' : 'none',
									'& .MuiChip-icon': {
										color: isSelected ? '#2dd4bf !important' : '#64748b !important',
									},
									'&:hover': {
										bgcolor: isSelected ? '#0f172a' : '#f8fafc',
									},
								}}
							/>
						)
					})}
				</Stack>
			)}

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
						rows={
							selectedDoctorSpeciality
								? doctorsQueue.filter(
										(doc) => doc.speciality?.toLowerCase() === selectedDoctorSpeciality.toLowerCase()
								  )
								: doctorsQueue
						}
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
			) : activeTab === 'ancillary' ? (
				nurseTotalRows === 0 ? (
					<AdminEmptyState
						icon={<MedicalServicesIcon />}
						title="Ancillary queue is clear"
						description="No ancillary verification applications pending at this time."
					/>
				) : (
					<AppTable
						columns={nurseColumns}
						rows={nursesQueue}
						emptyMessage="No ancillary applications awaiting verification."
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
					description="No pharmacy or diagnostic applications pending."
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
