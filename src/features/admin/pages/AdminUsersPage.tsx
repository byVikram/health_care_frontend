// src/features/admin/pages/AdminUsersPage.tsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Box,
	Grid,
	Typography,
	Chip,
	Stack,
	CircularProgress,
	Alert,
	Tooltip,
	IconButton,
	Avatar,
	InputAdornment,
	TextField,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import LockResetIcon from '@mui/icons-material/LockReset'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SearchIcon from '@mui/icons-material/Search'
import PeopleIcon from '@mui/icons-material/People'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import PersonIcon from '@mui/icons-material/Person'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { toast } from 'react-toastify'

import AppTable, { Column } from '../../../components/common/Table/AppTable'
import StatusBadge from '../../../components/admin/StatusBadge'
import AppSwitch from '../../../components/common/Switch/AppSwitch'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AdminStatCard from '../../../components/admin/AdminStatCard'
import { listUsers, suspendUser, resetUserOtp, AdminUserItem } from '../adminService'

const ROLE_OPTIONS = [
	{ label: 'All Roles', value: '', icon: <PeopleIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Doctors', value: 'doctor', icon: <LocalHospitalIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Patients', value: 'patient', icon: <PersonIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Pharmacies', value: 'pharmacy', icon: <StorefrontIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Radiology', value: 'radiology', icon: <StorefrontIcon sx={{ fontSize: 14 }} /> },
	{ label: 'Laboratories', value: 'laboratory', icon: <StorefrontIcon sx={{ fontSize: 14 }} /> },
]

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
	doctor:     { bg: '#dbeafe', color: '#1d4ed8' },
	patient:    { bg: '#dcfce7', color: '#15803d' },
	pharmacy:   { bg: '#f3e8ff', color: '#7e22ce' },
	radiology:  { bg: '#fff7ed', color: '#c2410c' },
	laboratory: { bg: '#fef9c3', color: '#a16207' },
	admin:      { bg: '#fce7f3', color: '#be185d' },
}

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

function resolveDetailId(user: AdminUserItem): string | null {
	switch (user.role) {
		case 'patient':    return user.patient_id || null
		case 'doctor':     return user.doctor_id || null
		case 'pharmacy':   return user.pharmacy_id || null
		case 'laboratory': return user.laboratory_id || null
		case 'radiology':  return user.radiology_id || null
		default:           return user.public_id || String(user.id) || null
	}
}

export default function AdminUsersPage() {
	const navigate = useNavigate()

	const [users, setUsers] = useState<AdminUserItem[]>([])
	const [selectedRole, setSelectedRole] = useState('')
	const [phoneNumber, setPhoneNumber] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

	const fetchUsers = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await listUsers({
				role: selectedRole || undefined,
				phoneNumber: phoneNumber.trim() || undefined,
				page,
				pageSize,
			})
			if (res.success) {
				setUsers(res.data?.items || [])
				setTotal(res.data?.total || 0)
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to fetch users list'))
		} finally {
			setLoading(false)
		}
	}, [selectedRole, phoneNumber, page, pageSize])

	useEffect(() => {
		fetchUsers()
	}, [fetchUsers])

	const handleToggleSuspend = async (user: AdminUserItem, e?: React.MouseEvent) => {
		if (e) e.stopPropagation()
		setActionLoadingId(user.public_id || String(user.id))
		try {
			const res = await suspendUser(user.public_id || String(user.id))
			if (res.success) {
				toast.success(`User ${user.email || user.contact_number} status updated.`)
				fetchUsers()
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to update user status.'))
		} finally {
			setActionLoadingId(null)
		}
	}

	const handleResetOtp = async (user: AdminUserItem, e?: React.MouseEvent) => {
		if (e) e.stopPropagation()
		setActionLoadingId(user.public_id || String(user.id))
		try {
			const res = await resetUserOtp(user.public_id || String(user.id))
			if (res.success) {
				toast.success(`OTP state reset for ${user.email || user.contact_number}.`)
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to reset OTP state.'))
		} finally {
			setActionLoadingId(null)
		}
	}

	const handleViewDetails = (user: AdminUserItem) => {
		const detailId = resolveDetailId(user)
		if (!detailId) return
		navigate(`/admin/users/${user.role}/${detailId}`)
	}

	const columns: Column<AdminUserItem>[] = [
		{
			field: 'id',
			label: 'User Info',
			render: (_: unknown, row: AdminUserItem) => {
				const initials = (row.email || row.contact_number || 'U').substring(0, 1).toUpperCase()
				const roleStyle = ROLE_COLORS[row.role] ?? { bg: '#f1f5f9', color: '#475569' }
				return (
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Avatar
							sx={{
								width: 38,
								height: 38,
								bgcolor: roleStyle.bg,
								color: roleStyle.color,
								fontSize: 14,
								fontWeight: 800,
								flexShrink: 0,
							}}
						>
							{initials}
						</Avatar>
						<Box sx={{ minWidth: 0 }}>
							<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
								{row.email || row.contact_number || 'N/A'}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{row.contact_number && row.email ? row.contact_number : ''}
							</Typography>
						</Box>
					</Stack>
				)
			},
		},
		{
			field: 'role',
			label: 'Role',
			render: (_: unknown, row: AdminUserItem) => {
				const style = ROLE_COLORS[row.role] ?? { bg: '#f1f5f9', color: '#475569' }
				return (
					<Chip
						label={(row.role || 'USER').toUpperCase()}
						size="small"
						sx={{
							bgcolor: style.bg,
							color: style.color,
							fontWeight: 700,
							fontSize: '0.62rem',
							height: 22,
							borderRadius: '6px',
						}}
					/>
				)
			},
		},
		{
			field: 'contact_number',
			label: 'Phone Number',
			render: (_: unknown, row: AdminUserItem) => (
				<Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#475569', fontSize: 12.5 }}>
					{row.contact_number || '—'}
				</Typography>
			),
		},
		{
			field: 'is_suspended',
			label: 'Status',
			render: (_: unknown, row: AdminUserItem) => {
				const isBusy = actionLoadingId === (row.public_id || String(row.id))
				return (
					<Stack direction="row" spacing={1} alignItems="center">
						<Tooltip title={row.is_suspended ? 'Account Suspended (Click to activate)' : 'Account Active (Click to suspend)'}>
							<span>
								<AppSwitch
									checked={!row.is_suspended}
									disabled={isBusy}
									onChange={(e) => handleToggleSuspend(row, e as unknown as React.MouseEvent)}
								/>
							</span>
						</Tooltip>
						<StatusBadge status={row.is_suspended ? 'suspended' : 'active'} />
					</Stack>
				)
			},
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_: unknown, row: AdminUserItem) => {
				const isBusy = actionLoadingId === (row.public_id || String(row.id))
				const detailId = resolveDetailId(row)
				return (
					<Stack direction="row" spacing={0.75} justifyContent="flex-end" alignItems="center">
						<Tooltip title={row.is_suspended ? 'Unsuspend Account' : 'Suspend Account'}>
							<span>
								<IconButton
									size="small"
									disabled={isBusy}
									onClick={(e) => handleToggleSuspend(row, e)}
									sx={{
										border: '1px solid',
										borderColor: row.is_suspended ? '#bbf7d0' : '#fecaca',
										borderRadius: 1.5,
										color: row.is_suspended ? '#16a34a' : '#dc2626',
										bgcolor: row.is_suspended ? '#f0fdf4' : '#fff1f2',
										'&:hover': {
											bgcolor: row.is_suspended ? '#dcfce7' : '#fee2e2',
										},
									}}
								>
									{row.is_suspended ? <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> : <BlockIcon sx={{ fontSize: 16 }} />}
								</IconButton>
							</span>
						</Tooltip>

						<Tooltip title="Reset Blocked OTP State">
							<span>
								<IconButton
									size="small"
									disabled={isBusy}
									onClick={(e) => handleResetOtp(row, e)}
									sx={{
										border: '1px solid #e2e8f0',
										borderRadius: 1.5,
										color: '#64748b',
										'&:hover': { borderColor: '#0d9488', color: '#0d9488', bgcolor: 'rgba(13,148,136,0.06)' },
									}}
								>
									<LockResetIcon sx={{ fontSize: 16 }} />
								</IconButton>
							</span>
						</Tooltip>

						{detailId && (
							<Tooltip title="View Account Details">
								<span>
									<IconButton
										size="small"
										onClick={(e) => {
											e.stopPropagation()
											handleViewDetails(row)
										}}
										sx={{
											border: '1px solid #e2e8f0',
											borderRadius: 1.5,
											color: '#0d9488',
											'&:hover': { borderColor: '#0d9488', bgcolor: 'rgba(13,148,136,0.06)' },
										}}
									>
										<OpenInNewIcon sx={{ fontSize: 16 }} />
									</IconButton>
								</span>
							</Tooltip>
						)}
					</Stack>
				)
			},
		},
	]

	const activeCount = users.filter((u) => !u.is_suspended).length
	const suspendedCount = users.filter((u) => u.is_suspended).length

	return (
		<Box>
			<AdminPageHeader
				title="User Directory & Moderation"
				subtitle="Manage user accounts, handle suspension states, and inspect profile details."
				count={total}
				countLabel="registered users"
			/>

			{/* KPI Summary Strip */}
			<Grid container spacing={2.5} sx={{ mb: 3.5 }}>
				<Grid size={{ xs: 12, sm: 4, md: 4 }}>
					<AdminStatCard
						label="Total Accounts"
						value={total}
						icon={<PeopleIcon />}
						iconColor="#2563eb"
						iconBg="rgba(37,99,235,0.1)"
						description="All registered platform users"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4, md: 4 }}>
					<AdminStatCard
						label="Active Page Accounts"
						value={activeCount}
						icon={<PersonIcon />}
						iconColor="#10b981"
						iconBg="rgba(16,185,129,0.12)"
						description="Current page active users"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4, md: 4 }}>
					<AdminStatCard
						label="Suspended Accounts"
						value={suspendedCount}
						icon={<BlockIcon />}
						iconColor="#ef4444"
						iconBg="rgba(239,68,68,0.12)"
						description="Current page suspended users"
					/>
				</Grid>
			</Grid>

			{/* Filter & Role Pills Bar */}
			<Stack spacing={2} sx={{ mb: 2.5 }}>
				<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
					{ROLE_OPTIONS.map((opt) => {
						const isSelected = selectedRole === opt.value
						return (
							<Chip
								key={opt.value}
								icon={opt.icon}
								label={opt.label}
								onClick={() => { setSelectedRole(opt.value); setPage(1) }}
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

				<Box sx={{ maxWidth: 360 }}>
					<TextField
						fullWidth
						size="small"
						placeholder="Search by phone number..."
						value={phoneNumber}
						onChange={(e) => { setPhoneNumber(e.target.value); setPage(1) }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
								</InputAdornment>
							),
						}}
						sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
					/>
				</Box>
			</Stack>

			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
					{error}
				</Alert>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading users directory...
					</Typography>
				</Stack>
			) : (
				<AppTable
					columns={columns}
					rows={users}
					emptyMessage="No users found matching criteria."
					onRowClick={(user) => handleViewDetails(user)}
					page={page}
					pageSize={pageSize}
					totalRows={total}
					onPageChange={(newPage) => setPage(newPage)}
					onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1) }}
				/>
			)}
		</Box>
	)
}
