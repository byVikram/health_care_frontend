// src/features/admin/pages/AdminAdminsPage.tsx
import { useEffect, useState, useCallback } from 'react'
import {
	Box,
	Typography,
	Chip,
	Stack,
	Alert,
	Avatar,
	IconButton,
	Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HistoryIcon from '@mui/icons-material/History'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { toast } from 'react-toastify'

import AppTable, { Column } from '../../../components/common/Table/AppTable'
import StatusBadge from '../../../components/admin/StatusBadge'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AppButton from '../../../components/common/Button/AppButton'
import AppSelect from '../../../components/common/Select/AppSelect'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import AddAdminModal from '../components/AddAdminModal'
import SubAdminLogsDrawer from '../components/SubAdminLogsDrawer'

import { useAuth } from '../../../hooks/useAuth'
import {
	listSubAdmins,
	updateSubAdminStatus,
	SubAdminItem,
} from '../adminService'

const ROLE_OPTIONS = [
	{ label: 'All Roles', value: '' },
	{ label: 'Support Admin', value: 'support_admin' },
	{ label: 'Billing Admin', value: 'billing_admin' },
	{ label: 'Compliance Admin', value: 'compliance_admin' },
]

const ROLE_LABELS: Record<string, string> = {
	support_admin: 'Support Admin',
	billing_admin: 'Billing Admin',
	compliance_admin: 'Compliance Admin',
}

const ROLE_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
	support_admin: { bg: '#e0f2fe', color: '#0369a1' },
	billing_admin: { bg: '#f3e8ff', color: '#6b21a8' },
	compliance_admin: { bg: '#ffedf7', color: '#9d174d' },
}

const getErrorMessage = (err: unknown, fallback: string) =>
	err instanceof Error ? err.message : fallback

export default function AdminAdminsPage() {
	const { role: currentUserRole } = useAuth()
	const isSuperAdmin = currentUserRole === 'super_admin'

	const [subAdmins, setSubAdmins] = useState<SubAdminItem[]>([])
	const [selectedRole, setSelectedRole] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Drawer state for adding admin
	const [drawerOpen, setDrawerOpen] = useState(false)

	// Confirm modal state for suspend / unsuspend
	const [confirmTarget, setConfirmTarget] = useState<SubAdminItem | null>(null)
	const [actionLoading, setActionLoading] = useState(false)

	// Activity Logs Drawer state for selected Sub Admin
	const [selectedSubAdminForLogs, setSelectedSubAdminForLogs] = useState<SubAdminItem | null>(null)

	const fetchSubAdmins = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await listSubAdmins({
				role: selectedRole || undefined,
				page,
				pageSize,
			})
			if (res.success) {
				setSubAdmins(res.data?.items || [])
				setTotal(res.data?.total || 0)
			} else {
				setError(res.message || 'Failed to fetch Sub Admins')
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to fetch Sub Admins list'))
		} finally {
			setLoading(false)
		}
	}, [selectedRole, page, pageSize])

	useEffect(() => {
		if (isSuperAdmin) {
			fetchSubAdmins()
		}
	}, [isSuperAdmin, fetchSubAdmins])

	const handleStatusToggle = async () => {
		if (!confirmTarget) return
		setActionLoading(true)
		try {
			const newStatus = !confirmTarget.is_suspended
			const res = await updateSubAdminStatus(confirmTarget.public_id, newStatus)
			if (res.success) {
				toast.success(
					`Sub Admin ${confirmTarget.name} ${newStatus ? 'suspended' : 'unsuspended'} successfully.`
				)
				setConfirmTarget(null)
				fetchSubAdmins()
			} else {
				toast.error(res.message || 'Status update failed.')
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to update Sub Admin status.'))
		} finally {
			setActionLoading(false)
		}
	}

	const handleAdminCreated = () => {
		fetchSubAdmins()
	}

	const columns: Column<SubAdminItem>[] = [
		{
			field: 'name',
			label: 'Sub Admin',
			render: (_: unknown, row: SubAdminItem) => {
				const initials = row.name
					? row.name
							.split(' ')
							.map((n) => n[0])
							.join('')
							.toUpperCase()
							.slice(0, 2)
					: 'A'
				const roleColor = ROLE_CHIP_COLORS[row.role] || { bg: '#f1f5f9', color: '#475569' }

				return (
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Avatar
							sx={{
								bgcolor: roleColor.bg,
								color: roleColor.color,
								width: 36,
								height: 36,
								fontSize: 13,
								fontWeight: 800,
							}}
						>
							{initials}
						</Avatar>
						<Box sx={{ minWidth: 0 }}>
							<Typography variant="subtitle2" fontWeight={700} color="#0f172a">
								{row.name}
							</Typography>
							<Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
								ID: {row.public_id}
							</Typography>
						</Box>
					</Stack>
				)
			},
		},
		{
			field: 'email',
			label: 'Email',
			render: (_: unknown, row: SubAdminItem) => (
				<Typography variant="body2" color="text.primary">
					{row.email || '—'}
				</Typography>
			),
		},
		{
			field: 'contact_number',
			label: 'Contact Number',
			render: (_: unknown, row: SubAdminItem) => (
				<Typography variant="body2" color="text.primary" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
					{row.contact_number || '—'}
				</Typography>
			),
		},
		{
			field: 'role',
			label: 'Role',
			render: (_: unknown, row: SubAdminItem) => {
				const displayRole = ROLE_LABELS[row.role] || row.role.replace(/_/g, ' ')
				const colors = ROLE_CHIP_COLORS[row.role] || { bg: '#f1f5f9', color: '#475569' }
				return (
					<Chip
						label={displayRole}
						size="small"
						sx={{
							bgcolor: colors.bg,
							color: colors.color,
							fontWeight: 700,
							fontSize: '0.68rem',
							borderRadius: '6px',
							height: 22,
						}}
					/>
				)
			},
		},
		{
			field: 'department',
			label: 'Department',
			render: (_: unknown, row: SubAdminItem) => (
				<Typography variant="body2" color="text.secondary">
					{row.department || '—'}
				</Typography>
			),
		},
		{
			field: 'is_suspended',
			label: 'Status',
			render: (_: unknown, row: SubAdminItem) => (
				<StatusBadge
					status={row.is_suspended ? 'suspended' : 'active'}
					label={row.is_suspended ? 'Suspended' : 'Active'}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_: unknown, row: SubAdminItem) => {
				return (
					<Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
						{/* Suspend / Unsuspend action */}
						{row.is_suspended ? (
							<Tooltip title="Unsuspend Admin">
								<IconButton
									size="small"
									color="success"
									onClick={() => setConfirmTarget(row)}
									sx={{ bgcolor: 'rgba(34, 197, 94, 0.08)', '&:hover': { bgcolor: 'rgba(34, 197, 94, 0.16)' } }}
								>
									<CheckCircleOutlineIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						) : (
							<Tooltip title="Suspend Admin">
								<IconButton
									size="small"
									color="error"
									onClick={() => setConfirmTarget(row)}
									sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.16)' } }}
								>
									<BlockIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						)}

						{/* View Logs Button specifically scoped to this Sub Admin */}
						<Tooltip title={`View activity logs for ${row.name}`}>
							<AppButton
								label="Logs"
								size="small"
								variant="outlined"
								startIcon={<HistoryIcon sx={{ fontSize: 16 }} />}
								onClick={() => setSelectedSubAdminForLogs(row)}
								sx={{
									borderRadius: '8px',
									textTransform: 'none',
									fontWeight: 700,
									fontSize: '0.75rem',
									color: '#0d9488',
									borderColor: '#99f6e4',
									bgcolor: '#f0fdfa',
									'&:hover': { bgcolor: '#ccfbf1', borderColor: '#0d9488' },
									height: 32,
									px: 1.5,
								}}
							/>
						</Tooltip>
					</Stack>
				)
			},
		},
	]

	if (!isSuperAdmin) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<AdminPanelSettingsIcon sx={{ fontSize: 56, color: '#94a3b8', mb: 2 }} />
				<Typography variant="h6" fontWeight={700} color="#0f172a" gutterBottom>
					Access Restricted
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Only Super Admins have permission to manage Sub Admins.
				</Typography>
			</Box>
		)
	}

	return (
		<Box>
			{/* Page Header */}
			<AdminPageHeader
				title="Sub Admins"
				subtitle="Manage delegated operational admin accounts and inspect individual Sub Admin activity logs."
				count={total}
				countLabel="sub admins"
				actions={
					<AppButton
						label="Add Admin"
						startIcon={<AddIcon />}
						variant="contained"
						color="primary"
						onClick={() => setDrawerOpen(true)}
						sx={{
							borderRadius: '10px',
							bgcolor: '#0f172a',
							color: '#ffffff',
							fontWeight: 700,
							fontSize: 13,
							textTransform: 'none',
							px: 2.5,
							py: 1,
							'&:hover': { bgcolor: '#1e293b' },
						}}
					/>
				}
			/>

			{/* Filter Bar */}
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				spacing={2}
				alignItems={{ xs: 'stretch', sm: 'center' }}
				sx={{ mb: 3 }}
			>
				<Box sx={{ minWidth: 200 }}>
					<AppSelect
						placeholder="Filter by Role"
						value={selectedRole}
						options={ROLE_OPTIONS}
						onChange={(e) => {
							setSelectedRole(e.target.value as string)
							setPage(1)
						}}
					/>
				</Box>
			</Stack>

			{/* Error State */}
			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
					{error}
				</Alert>
			)}

			{/* Sub Admins Table */}
			<AppTable
				columns={columns}
				rows={subAdmins}
				loading={loading}
				emptyMessage="No Sub Admins found."
				page={page}
				pageSize={pageSize}
				totalRows={total}
				pageSizeOptions={[10, 25, 50]}
				onPageChange={(newPage) => setPage(newPage)}
				onPageSizeChange={(newSize) => {
					setPageSize(newSize)
					setPage(1)
				}}
			/>

			{/* Add Admin Drawer */}
			<AddAdminModal
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onSuccess={handleAdminCreated}
			/>

			{/* Activity Logs Drawer for Selected Sub Admin */}
			<SubAdminLogsDrawer
				open={Boolean(selectedSubAdminForLogs)}
				subAdmin={selectedSubAdminForLogs}
				onClose={() => setSelectedSubAdminForLogs(null)}
			/>

			{/* Suspend / Unsuspend Confirmation Modal */}
			<ConfirmModal
				open={Boolean(confirmTarget)}
				title={confirmTarget?.is_suspended ? 'Unsuspend Sub Admin' : 'Suspend Sub Admin'}
				description={
					confirmTarget?.is_suspended
						? `Are you sure you want to unsuspend "${confirmTarget?.name}"? They will regain access to their assigned operational dashboard.`
						: `Are you sure you want to suspend "${confirmTarget?.name}"? They will immediately lose access to all admin capabilities.`
				}
				confirmLabel={confirmTarget?.is_suspended ? 'Unsuspend' : 'Suspend'}
				variant={confirmTarget?.is_suspended ? 'confirm' : 'delete'}
				loading={actionLoading}
				onConfirm={handleStatusToggle}
				onClose={() => setConfirmTarget(null)}
			/>
		</Box>
	)
}
