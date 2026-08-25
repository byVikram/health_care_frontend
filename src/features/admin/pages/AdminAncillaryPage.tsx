// src/features/admin/pages/AdminAncillaryPage.tsx
import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Box,
	Grid,
	Typography,
	Stack,
	Tabs,
	Tab,
	InputAdornment,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Button,
	Alert,
	Chip,
	IconButton,
	Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import VisibilityIcon from '@mui/icons-material/Visibility'

import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AdminStatCard from '../../../components/admin/AdminStatCard'
import StatusBadge from '../../../components/admin/StatusBadge'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppInput from '../../../components/common/Input/AppInput'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import { ROUTES } from '../../../constants/routes'

import {
	AdminAncillaryRequestItem,
	AdminAncillaryDetail,
	AdminAncillaryStats,
	listAdminAncillaryRequests,
	getAdminAncillaryStats,
	getAdminAncillaryRequestDetail,
	cancelAdminAncillaryRequest,
	reassignAdminAncillaryRequest,
} from '../adminService'
import { formatINR } from '../../../utils/Utils'

type OperationalTab = 'all' | 'active' | 'searching' | 'in_progress' | 'completed' | 'cancelled'

export default function AdminAncillaryPage() {
	const navigate = useNavigate()

	// State
	const [requests, setRequests] = useState<AdminAncillaryRequestItem[]>([])
	const [stats, setStats] = useState<AdminAncillaryStats | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const [statsLoading, setStatsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	// Pagination
	const [page, setPage] = useState<number>(1)
	const [pageSize, setPageSize] = useState<number>(10)
	const [totalRows, setTotalRows] = useState<number>(0)

	// Filters & Search
	const [activeTab, setActiveTab] = useState<OperationalTab>('all')
	const [searchInput, setSearchInput] = useState<string>('')
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [sortOrder, setSortOrder] = useState<string>('newest')
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Modals
	const [cancelTarget, setCancelTarget] = useState<AdminAncillaryDetail | null>(null)
	const [actionLoading, setActionLoading] = useState<boolean>(false)
	const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)

	// ── Debounced Search ─────────────────────────────────────────────────────
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		setSearchInput(val)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			setSearchQuery(val)
			setPage(1)
		}, 400)
	}

	// ── Map Tab to Status Parameter ──────────────────────────────────────────
	const getStatusFilterForTab = (tab: OperationalTab): string | undefined => {
		switch (tab) {
			case 'active':
				return 'ASSIGNED,EN_ROUTE,ARRIVED,IN_PROGRESS'
			case 'searching':
				return 'SEARCHING,SEARCHING_FOR_NURSE'
			case 'in_progress':
				return 'IN_PROGRESS'
			case 'completed':
				return 'COMPLETED'
			case 'cancelled':
				return 'CANCELLED_BY_PATIENT,CANCELLED_BY_PROVIDER,CANCELLED,EXPIRED,FAILED'
			case 'all':
			default:
				return undefined
		}
	}

	// ── Data Fetching ────────────────────────────────────────────────────────
	const fetchRequests = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await listAdminAncillaryRequests({
				page,
				pageSize,
				search: searchQuery.trim() || undefined,
				status: getStatusFilterForTab(activeTab),
				sortOrder,
			})

			if (res.success && res.data) {
				setRequests(res.data.items || [])
				setTotalRows(res.data.total || 0)
				if (res.data.stats) {
					setStats(res.data.stats)
				}
			}
		} catch (err: any) {
			console.error('Error fetching admin ancillary requests:', err)
			setError(err?.message || 'Unable to load ancillary service operations.')
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, searchQuery, activeTab, sortOrder])

	const fetchStats = useCallback(async () => {
		setStatsLoading(true)
		try {
			const res = await getAdminAncillaryStats()
			if (res.success && res.data) {
				setStats(res.data)
			}
		} catch (err) {
			console.error('Error fetching ancillary stats:', err)
		} finally {
			setStatsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchRequests()
	}, [fetchRequests])

	useEffect(() => {
		fetchStats()
	}, [fetchStats])

	// ── Navigate to Full Detail View ─────────────────────────────────────────
	const handleRowClick = (row: AdminAncillaryRequestItem) => {
		navigate(ROUTES.ADMIN.ANCILLARY_DETAIL.replace(':id', row.public_id || row.id))
	}

	// ── Actions ──────────────────────────────────────────────────────────────
	const handleCancelConfirm = async () => {
		if (!cancelTarget) return
		setActionLoading(true)
		try {
			await cancelAdminAncillaryRequest(cancelTarget.public_id || cancelTarget.id, 'Cancelled by Administrator via Operations Portal')
			setActionSuccessMsg(`Successfully cancelled request ${cancelTarget.public_id}.`)
			fetchRequests()
			fetchStats()
		} catch (err: any) {
			setError(err?.message || 'Failed to cancel request.')
		} finally {
			setActionLoading(false)
			setCancelTarget(null)
		}
	}


	// ── Table Columns ────────────────────────────────────────────────────────
	const columns: Column<AdminAncillaryRequestItem>[] = [
		{
			field: 'public_id',
			label: 'Request ID',
			render: (_, row) => (
				<Box>
					<Typography variant="body2" fontWeight={800} color="#0f172a">
						{row.public_id}
					</Typography>
					<Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
						<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
							{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
						</Typography>
						{row.requires_attention && (
							<Chip
								label="Attention Required"
								size="small"
								sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#fee2e2', color: '#dc2626' }}
							/>
						)}
					</Stack>
				</Box>
			),
		},
		{
			field: 'patient',
			label: 'Patient',
			render: (_, row) => (
				<Box>
					<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
						{row.patient.name || 'Anonymous Patient'}
					</Typography>
					<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
						{row.patient.relationship ? `${row.patient.relationship}` : 'Self'}
						{row.patient.contact_number ? ` • ${row.patient.contact_number}` : ''}
					</Typography>
				</Box>
			),
		},
		{
			field: 'nurse',
			label: 'Assigned Nurse',
			render: (_, row) => {
				if (!row.nurse) {
					return (
						<Chip
							icon={<PersonOffIcon sx={{ fontSize: '13px !important', color: '#d97706 !important' }} />}
							label="⚠️ Unassigned"
							size="small"
							sx={{
								bgcolor: '#fffbeb',
								color: '#b45309',
								border: '1px dashed #f59e0b',
								fontWeight: 800,
								fontSize: '0.68rem',
								height: 24,
							}}
						/>
					)
				}
				return (
					<Box>
						<Stack direction="row" spacing={0.75} alignItems="center">
							<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
								{row.nurse.name}
							</Typography>
							{row.nurse.is_online && (
								<Box
									component="span"
									sx={{
										width: 7,
										height: 7,
										borderRadius: '50%',
										bgcolor: '#10b981',
										display: 'inline-block',
									}}
								/>
							)}
						</Stack>
						<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
							{row.nurse.qualifications || 'RN Specialist'}
						</Typography>
					</Box>
				)
			},
		},
		{
			field: 'service',
			label: 'Service & Dept',
			render: (_, row) => (
				<Box>
					<Typography variant="body2" fontWeight={700} color="#0d9488" noWrap>
						{row.service.procedure_name || 'Healthcare Visit'}
					</Typography>
					<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
						{row.service.specialty_name || 'General Nursing Care'}
					</Typography>
				</Box>
			),
		},
		{
			field: 'location',
			label: 'Visit Location',
			render: (_, row) => (
				<Typography variant="caption" color="#475569" sx={{ maxWidth: 160, display: 'block', lineHeight: 1.3 }} noWrap>
					{row.location.street_address || 'Address on file'}
				</Typography>
			),
		},
		{
			field: 'status',
			label: 'Status',
			render: (_, row) => <StatusBadge status={row.status} />,
		},
		{
			field: 'payment',
			label: 'Amount',
			render: (_, row) => (
				<Box>
					<Typography variant="body2" fontWeight={800} color="#0f172a">
						{formatINR(Number(row.payment.amount || 0))}
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
						{row.payment.payment_method || 'CARD'}
					</Typography>
				</Box>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_, row) => (
				<Stack direction="row" spacing={0.5} justifyContent="flex-end">
					<Tooltip title="View Details">
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation()
								handleRowClick(row)
							}}
							sx={{ color: '#0d9488', '&:hover': { bgcolor: 'rgba(13, 148, 136, 0.08)' } }}
						>
							<VisibilityIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
			),
		},
	]

	return (
		<Box sx={{ pb: 6 }}>
			{/* ── Page Header ── */}
			<AdminPageHeader
				title="Ancillary Operations"
				subtitle="Real-time in-home nursing, physiotherapy, and rehabilitation service dispatch & operational control"
				actions={
					<Button
						variant="outlined"
						startIcon={<RefreshIcon />}
						onClick={() => {
							fetchRequests()
							fetchStats()
						}}
						disabled={loading || statsLoading}
						sx={{
							borderRadius: 2,
							fontWeight: 700,
							textTransform: 'none',
							color: '#0f172a',
							borderColor: '#cbd5e1',
							'&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
						}}
					>
						Refresh
					</Button>
				}
			/>

			{/* Success Alert */}
			{actionSuccessMsg && (
				<Alert
					severity="success"
					onClose={() => setActionSuccessMsg(null)}
					sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
				>
					{actionSuccessMsg}
				</Alert>
			)}

			{/* Error Alert */}
			{error && (
				<Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
					{error}
				</Alert>
			)}

			{/* ── KPI Stat Cards ── */}
			<Grid container spacing={2.5} sx={{ mb: 3.5 }}>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="Active Services"
						value={stats?.active_services ?? '--'}
						icon={<TwoWheelerIcon />}
						iconColor="#0284c7"
						iconBg="#e0f2fe"
						onClick={() => setActiveTab('active')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="Searching (Unassigned)"
						value={stats?.searching_unassigned ?? '--'}
						icon={<PersonOffIcon />}
						iconColor="#d97706"
						iconBg="#fef3c7"
						onClick={() => setActiveTab('searching')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="In Progress"
						value={stats?.in_progress ?? '--'}
						icon={<MedicalServicesIcon />}
						iconColor="#7c3aed"
						iconBg="#ede9fe"
						onClick={() => setActiveTab('in_progress')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="Completed Today"
						value={stats?.completed_today ?? '--'}
						icon={<CheckCircleIcon />}
						iconColor="#10b981"
						iconBg="#d1fae5"
						onClick={() => setActiveTab('completed')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="Cancelled"
						value={stats?.cancelled ?? '--'}
						icon={<CancelIcon />}
						iconColor="#ef4444"
						iconBg="#fee2e2"
						onClick={() => setActiveTab('cancelled')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="Nurses on Duty"
						value={stats?.nurses_online ?? '--'}
						icon={<AccessTimeIcon />}
						iconColor="#0d9488"
						iconBg="#ccfbf1"
					/>
				</Grid>
			</Grid>

			{/* ── Status Tabs ── */}
			<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
				<Tabs
					value={activeTab}
					onChange={(_, val) => {
						setActiveTab(val)
						setPage(1)
					}}
					variant="scrollable"
					scrollButtons="auto"
					sx={{
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 700,
							fontSize: '0.88rem',
							minWidth: 100,
						},
						'& .Mui-selected': {
							color: '#0d9488 !important',
						},
						'& .MuiTabs-indicator': {
							bgcolor: '#0d9488',
							height: 3,
							borderRadius: '3px 3px 0 0',
						},
					}}
				>
					<Tab label="All Services" value="all" />
					<Tab label="Active / En Route" value="active" />
					<Tab label="Searching (Unassigned)" value="searching" />
					<Tab label="In Progress" value="in_progress" />
					<Tab label="Completed" value="completed" />
					<Tab label="Cancelled / Failed" value="cancelled" />
				</Tabs>
			</Box>

			{/* ── Filter & Search Toolbar ── */}
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={2}
				alignItems={{ xs: 'stretch', md: 'center' }}
				justifyContent="space-between"
				sx={{ mb: 3 }}
			>
				<AppInput
					placeholder="Search by Patient, Nurse, Request ID..."
					value={searchInput}
					onChange={handleSearchChange}
					startIcon={<SearchIcon sx={{ color: '#94a3b8' }} />}
					sx={{ width: { xs: '100%', md: 360 } }}
				/>


				<Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
					<FormControl size="small" sx={{ minWidth: 140 }}>
						<InputLabel id="sort-order-label">Sort</InputLabel>
						<Select
							labelId="sort-order-label"
							value={sortOrder}
							label="Sort"
							onChange={(e) => {
								setSortOrder(e.target.value)
								setPage(1)
							}}
						>
							<MenuItem value="newest">Newest First</MenuItem>
							<MenuItem value="oldest">Oldest First</MenuItem>
						</Select>
					</FormControl>

					{(searchQuery || activeTab !== 'all') && (
						<Button
							variant="text"
							onClick={() => {
								setSearchInput('')
								setSearchQuery('')
								setActiveTab('all')
								setPage(1)
							}}
							sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600 }}
						>
							Reset Filters
						</Button>
					)}
				</Stack>
			</Stack>

			{/* ── Operational Data Grid ── */}
			<AppTable
				columns={columns}
				rows={requests}
				loading={loading}
				onRowClick={handleRowClick}
				emptyMessage="No ancillary service requests matching current operational filters."
				page={page}
				pageSize={pageSize}
				totalRows={totalRows}
				onPageChange={setPage}
				onPageSizeChange={setPageSize}
			/>

			{/* ── Cancel Confirmation Modal ── */}
			<ConfirmModal
				open={Boolean(cancelTarget)}
				onClose={() => setCancelTarget(null)}
				onConfirm={handleCancelConfirm}
				title="Cancel Ancillary Service Request"
				description={`Are you sure you want to cancel service request ${cancelTarget?.public_id}? This will immediately notify both the patient and assigned nurse, and stop dispatch.`}
				confirmLabel="Confirm Cancellation"
				cancelLabel="Keep Active"
				loading={actionLoading}
			/>
		</Box>
	)
}

