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
import HealingIcon from '@mui/icons-material/Healing'
import VisibilityIcon from '@mui/icons-material/Visibility'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import RestartAltIcon from '@mui/icons-material/RestartAlt'

import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AdminStatCard from '../../../components/admin/AdminStatCard'
import StatusBadge from '../../../components/admin/StatusBadge'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppInput from '../../../components/common/Input/AppInput'
import AppDatePicker from '../../../components/common/DatePicker/AppDatePicker'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import { ROUTES } from '../../../constants/routes'

import {
	AdminAncillaryRequestItem,
	AdminAncillaryDetail,
	AdminAncillaryStats,
	AncillaryCategoryItem,
	ANCILLARY_SEARCHING_STATUSES,
	ANCILLARY_ACTIVE_STATUSES,
	ANCILLARY_CANCELLED_STATUSES,
	listAdminAncillaryRequests,
	getAncillaryCategories,
	cancelAdminAncillaryRequest,
} from '../adminService'
import { formatINR } from '../../../utils/Utils'

/** Single configurable threshold for highlighting long-waiting unassigned requests */
const SEARCHING_WARNING_THRESHOLD_MINUTES = 5

function isSearchingStatus(status?: string): boolean {
	if (!status) return false
	return (ANCILLARY_SEARCHING_STATUSES as string[]).includes(status.toUpperCase())
}

function isTerminalStatus(status?: string): boolean {
	if (!status) return false
	const s = status.toUpperCase()
	return s === 'COMPLETED' || (ANCILLARY_CANCELLED_STATUSES as string[]).includes(s)
}

function isCancelledStatus(status?: string): boolean {
	if (!status) return false
	return (ANCILLARY_CANCELLED_STATUSES as string[]).includes(status.toUpperCase())
}

function getWaitingDurationMinutes(createdAtStr?: string): number | null {
	if (!createdAtStr) return null
	const createdTime = new Date(createdAtStr).getTime()
	if (isNaN(createdTime)) return null
	const diffMs = Date.now() - createdTime
	return Math.max(0, Math.floor(diffMs / 60000))
}

function formatWaitingDuration(minutes: number): string {
	if (minutes < 1) return 'Waiting <1m'
	if (minutes < 60) return `Waiting ${minutes}m`
	const hrs = Math.floor(minutes / 60)
	const remMins = minutes % 60
	return remMins > 0 ? `Waiting ${hrs}h ${remMins}m` : `Waiting ${hrs}h`
}

function getErrorMessage(err: unknown, fallback: string = 'An error occurred'): string {
	if (err instanceof Error) return err.message
	if (typeof err === 'string') return err
	if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message)
	return fallback
}

function ddmmyyyyToIso(value?: string): string | undefined {
	if (!value) return undefined
	const parts = value.split('/')
	if (parts.length === 3) {
		const [day, month, year] = parts
		return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
	}
	return value
}

type OperationalTab = 'all' | 'active' | 'searching' | 'in_progress' | 'completed' | 'cancelled'

export default function AdminAncillaryPage() {
	const navigate = useNavigate()

	// State
	const [requests, setRequests] = useState<AdminAncillaryRequestItem[]>([])
	const [stats, setStats] = useState<AdminAncillaryStats | null>(null)
	const [categories, setCategories] = useState<AncillaryCategoryItem[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	// Pagination
	const [page, setPage] = useState<number>(1)
	const [pageSize, setPageSize] = useState<number>(10)
	const [totalRows, setTotalRows] = useState<number>(0)

	// Filters & Search
	const [activeTab, setActiveTab] = useState<OperationalTab>('all')
	const [searchInput, setSearchInput] = useState<string>('')
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [specialtyFilter, setSpecialtyFilter] = useState<string>('')
	const [dateFilter, setDateFilter] = useState<string>('all')
	const [startDate, setStartDate] = useState<string>('')
	const [endDate, setEndDate] = useState<string>('')
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

	// ── Map Tab to Status Parameter (Single Source of Truth) ─────────────────
	const getStatusFilterForTab = (tab: OperationalTab): string | undefined => {
		switch (tab) {
			case 'active':
				return ANCILLARY_ACTIVE_STATUSES.join(',')
			case 'searching':
				return ANCILLARY_SEARCHING_STATUSES.join(',')
			case 'in_progress':
				return 'IN_PROGRESS'
			case 'completed':
				return 'COMPLETED'
			case 'cancelled':
				return ANCILLARY_CANCELLED_STATUSES.join(',')
			case 'all':
			default:
				return undefined
		}
	}

	// ── Dynamic Specialty Categories Fetching ─────────────────────────────────
	useEffect(() => {
		let isMounted = true
		const loadCategories = async () => {
			try {
				const res = await getAncillaryCategories()
				if (isMounted && res.success && Array.isArray(res.data)) {
					setCategories(res.data)
				}
			} catch (err) {
				console.warn('Failed to load dynamic specialties:', err)
			}
		}
		loadCategories()
		return () => {
			isMounted = false
		}
	}, [])

	// ── Data Fetching (Simultaneously loads requests + stats in 1 API call) ───
	const fetchRequests = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await listAdminAncillaryRequests({
				page,
				pageSize,
				search: searchQuery.trim() || undefined,
				status: getStatusFilterForTab(activeTab),
				specialtyId: specialtyFilter || undefined,
				dateFilter: dateFilter !== 'all' ? dateFilter : undefined,
				startDate: dateFilter === 'custom' && startDate ? ddmmyyyyToIso(startDate) : undefined,
				endDate: dateFilter === 'custom' && endDate ? ddmmyyyyToIso(endDate) : undefined,
				sortOrder,
			})

			if (res.success && res.data) {
				setRequests(res.data.items || [])
				setTotalRows(res.data.total || 0)
				if (res.data.stats) {
					setStats(res.data.stats)
				}
			}
		} catch (err: unknown) {
			console.error('Error fetching admin ancillary requests:', err)
			setError(getErrorMessage(err, 'Unable to load ancillary service operations.'))
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, searchQuery, activeTab, specialtyFilter, dateFilter, startDate, endDate, sortOrder])

	useEffect(() => {
		fetchRequests()
	}, [fetchRequests])

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
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to cancel request.'))
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
			render: (_, row) => {
				const isSearching = isSearchingStatus(row.status)
				const waitingMins = isSearching ? getWaitingDurationMinutes(row.created_at) : null
				const isLongWaiting = isSearching && waitingMins !== null && waitingMins >= SEARCHING_WARNING_THRESHOLD_MINUTES

				return (
					<Box>
						<Typography variant="body2" fontWeight={800} color="#0f172a">
							{row.public_id}
						</Typography>
						<Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
							<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
								{row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
							</Typography>
							{isLongWaiting ? (
								<Chip
									icon={<WarningAmberIcon sx={{ fontSize: '11px !important', color: '#b45309 !important' }} />}
									label="Attention Required"
									size="small"
									sx={{
										height: 18,
										fontSize: '0.6rem',
										fontWeight: 800,
										bgcolor: '#fef3c7',
										color: '#b45309',
										border: '1px solid #fde68a',
									}}
								/>
							) : row.requires_attention && !isSearching ? (
								<Chip
									label="Attention Required"
									size="small"
									sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#fee2e2', color: '#dc2626' }}
								/>
							) : null}
						</Stack>
					</Box>
				)
			},
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
					const isSearching = isSearchingStatus(row.status)
					const isCancelled = isCancelledStatus(row.status)
					const isCompleted = row.status?.toUpperCase() === 'COMPLETED'

					if (isSearching) {
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
						<Chip
							label={isCancelled ? 'Not Assigned' : isCompleted ? 'None' : 'Not Assigned'}
							size="small"
							sx={{
								bgcolor: '#f1f5f9',
								color: '#64748b',
								border: '1px solid #e2e8f0',
								fontWeight: 600,
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
			render: (_, row) => {
				const isSearching = isSearchingStatus(row.status)
				const isTerminal = isTerminalStatus(row.status)
				const waitingMins = isSearching && !isTerminal ? getWaitingDurationMinutes(row.created_at) : null
				const isLongWaiting = isSearching && waitingMins !== null && waitingMins >= SEARCHING_WARNING_THRESHOLD_MINUTES

				return (
					<Box>
						<StatusBadge status={row.status} />
						{isSearching && !isTerminal && waitingMins !== null && (
							<Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
								<AccessTimeIcon sx={{ fontSize: 13, color: isLongWaiting ? '#d97706' : '#64748b' }} />
								<Typography
									variant="caption"
									fontWeight={isLongWaiting ? 800 : 600}
									sx={{
										fontSize: '0.68rem',
										color: isLongWaiting ? '#b45309' : '#64748b',
									}}
								>
									{formatWaitingDuration(waitingMins)}
								</Typography>
							</Stack>
						)}
					</Box>
				)
			},
		},
		{
			field: 'payment',
			label: 'Amount',
			render: (_, row) => (
				<Box>
					<Typography variant="body2" fontWeight={800} color="#0f172a">
						{formatINR(row.payment.amount)}
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
						onClick={fetchRequests}
						startIcon={<RefreshIcon sx={{ fontSize: 17 }} />}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							fontSize: 13,
							color: '#0d9488',
							border: '1px solid #e2e8f0',
							borderRadius: '8px',
							'&:hover': { bgcolor: 'rgba(13,148,136,0.08)' },
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
						icon={<MedicalServicesIcon />}
						iconColor="#0d9488"
						iconBg="rgba(13,148,136,0.12)"
						onClick={() => setActiveTab('active')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="Searching (Unassigned)"
						value={stats?.searching_unassigned ?? '--'}
						icon={<PersonOffIcon />}
						iconColor="#d97706"
						iconBg="rgba(217,119,6,0.12)"
						onClick={() => setActiveTab('searching')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="In Progress"
						value={stats?.in_progress ?? '--'}
						icon={<HealingIcon />}
						iconColor="#0d9488"
						iconBg="rgba(13,148,136,0.12)"
						onClick={() => setActiveTab('in_progress')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="Completed Today"
						value={stats?.completed_today ?? '--'}
						icon={<CheckCircleIcon />}
						iconColor="#059669"
						iconBg="rgba(5,150,105,0.12)"
						onClick={() => setActiveTab('completed')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="Cancelled"
						value={stats?.cancelled ?? '--'}
						icon={<CancelIcon />}
						iconColor="#64748b"
						iconBg="rgba(100,116,139,0.12)"
						onClick={() => setActiveTab('cancelled')}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 2 }}>
					<AdminStatCard
						label="Nurses on Duty"
						value={stats?.nurses_online ?? '--'}
						icon={<AccessTimeIcon />}
						iconColor="#0d9488"
						iconBg="rgba(13,148,136,0.12)"
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
				direction={{ xs: 'column', lg: 'row' }}
				spacing={1}
				alignItems={{ xs: 'stretch', lg: 'center' }}
				justifyContent="space-between"
				sx={{ mb: 3 }}
			>
				<AppInput
					placeholder="Search by Patient, Nurse, Request ID..."
					value={searchInput}
					onChange={handleSearchChange}
					startIcon={<SearchIcon sx={{ color: '#94a3b8' }} />}
					sx={{ width: { xs: '100%', lg: 220, xl: 260 } }}
				/>

				<Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ gap: 0.75 }}>
					{/* Specialty Filter */}
					<FormControl size="small" sx={{ minWidth: 135 }}>
						<InputLabel id="specialty-filter-label">Specialty</InputLabel>
						<Select
							labelId="specialty-filter-label"
							value={specialtyFilter}
							label="Specialty"
							onChange={(e) => {
								setSpecialtyFilter(e.target.value)
								setPage(1)
							}}
						>
							<MenuItem value="">All Specialties</MenuItem>
							{categories.length > 0
								? categories.map((cat) => (
										<MenuItem key={cat.id || cat.code} value={cat.id || cat.title}>
											{cat.title}
										</MenuItem>
								  ))
								: [
										<MenuItem key="nursing" value="Nursing Care">Nursing Care</MenuItem>,
										<MenuItem key="physio" value="Physiotherapy">Physiotherapy</MenuItem>,
										<MenuItem key="rehab" value="Rehab Care">Rehab Care</MenuItem>,
										<MenuItem key="elder" value="Elder Day Care">Elder Day Care</MenuItem>,
								  ]}
						</Select>
					</FormControl>

					{/* Date Filter */}
					<FormControl size="small" sx={{ minWidth: 120 }}>
						<InputLabel id="date-filter-label">Date</InputLabel>
						<Select
							labelId="date-filter-label"
							value={dateFilter}
							label="Date"
							onChange={(e) => {
								setDateFilter(e.target.value)
								setPage(1)
							}}
						>
							<MenuItem value="all">All Dates</MenuItem>
							<MenuItem value="today">Today</MenuItem>
							<MenuItem value="yesterday">Yesterday</MenuItem>
							<MenuItem value="last_7_days">Last 7 Days</MenuItem>
							<MenuItem value="custom">Custom Range</MenuItem>
						</Select>
					</FormControl>

					{/* Custom Date Range MUI Date Pickers (Indian DD/MM/YYYY Format) */}
					{dateFilter === 'custom' && (
						<Stack direction="row" spacing={0.5} alignItems="center">
							<Box sx={{ width: 152 }}>
								<AppDatePicker
									placeholder="Start Date"
									format="DD/MM/YYYY"
									value={startDate || null}
									onChange={(val) => {
										setStartDate(val || '')
										setPage(1)
									}}
									size="small"
									sx={{
										height: 40,
										'& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root': {
											height: 40,
											bgcolor: '#ffffff',
											borderRadius: '6px',
											pr: 0.5,
										},
										'& .MuiOutlinedInput-input, & .MuiPickersOutlinedInput-input, & .MuiPickersSectionList-root': {
											padding: '8px 2px 8px 10px !important',
											fontSize: '0.78rem !important',
											fontWeight: 600,
											letterSpacing: '-0.01em',
										},
										'& .MuiPickersSectionList-sectionContent': {
											fontSize: '0.78rem !important',
										},
										'& .MuiIconButton-root': {
											p: '3px !important',
										},
									}}
								/>
							</Box>
							<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, px: 0.25, fontSize: '0.8rem' }}>
								To
							</Typography>
							<Box sx={{ width: 152 }}>
								<AppDatePicker
									placeholder="End Date"
									format="DD/MM/YYYY"
									value={endDate || null}
									onChange={(val) => {
										setEndDate(val || '')
										setPage(1)
									}}
									size="small"
									sx={{
										height: 40,
										'& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root': {
											height: 40,
											bgcolor: '#ffffff',
											borderRadius: '6px',
											pr: 0.5,
										},
										'& .MuiOutlinedInput-input, & .MuiPickersOutlinedInput-input, & .MuiPickersSectionList-root': {
											padding: '8px 2px 8px 10px !important',
											fontSize: '0.78rem !important',
											fontWeight: 600,
											letterSpacing: '-0.01em',
										},
										'& .MuiPickersSectionList-sectionContent': {
											fontSize: '0.78rem !important',
										},
										'& .MuiIconButton-root': {
											p: '3px !important',
										},
									}}
								/>
							</Box>
						</Stack>
					)}

					{/* Order By Filter */}
					<FormControl size="small" sx={{ minWidth: 125 }}>
						<InputLabel id="order-by-label">Order By</InputLabel>
						<Select
							labelId="order-by-label"
							value={sortOrder}
							label="Order By"
							onChange={(e) => {
								setSortOrder(e.target.value)
								setPage(1)
							}}
						>
							<MenuItem value="newest">Newest First</MenuItem>
							<MenuItem value="oldest">Oldest First</MenuItem>
						</Select>
					</FormControl>

					{/* Reset Filter Button */}
					{(searchQuery || activeTab !== 'all' || specialtyFilter || dateFilter !== 'all' || startDate || endDate) && (
						<Tooltip title="Reset all active filters">
							<Button
								size="small"
								onClick={() => {
									setSearchInput('')
									setSearchQuery('')
									setActiveTab('all')
									setSpecialtyFilter('')
									setDateFilter('all')
									setStartDate('')
									setEndDate('')
									setPage(1)
								}}
								startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
								sx={{
									textTransform: 'none',
									color: '#64748b',
									border: '1px solid #e2e8f0',
									bgcolor: '#ffffff',
									fontWeight: 700,
									fontSize: '12px',
									height: 40,
									px: 1.25,
									borderRadius: '8px',
									whiteSpace: 'nowrap',
									'&:hover': {
										borderColor: '#cbd5e1',
										bgcolor: '#f8fafc',
										color: '#0f172a',
									},
								}}
							>
								Reset
							</Button>
						</Tooltip>
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
				rowSx={(row) => {
					const isSearching = isSearchingStatus(row.status)
					const waitingMins = isSearching ? getWaitingDurationMinutes(row.created_at) : null
					const isLongWaiting = isSearching && waitingMins !== null && waitingMins >= SEARCHING_WARNING_THRESHOLD_MINUTES

					if (isLongWaiting) {
						return {
							bgcolor: 'rgba(254, 243, 199, 0.25)',
							borderLeft: '4px solid #f59e0b',
							'&:hover': {
								bgcolor: 'rgba(254, 243, 199, 0.45) !important',
							},
						}
					}
					return {}
				}}
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

