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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { toast } from 'react-toastify'

import AppTable, { Column } from '../../../components/common/Table/AppTable'
import StatusBadge from '../../../components/admin/StatusBadge'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AppButton from '../../../components/common/Button/AppButton'
import AppSelect from '../../../components/common/Select/AppSelect'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import AddAdminModal from '../components/AddAdminModal'

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

	// Drawer state
	const [drawerOpen, setDrawerOpen] = useState(false)

	// Confirm modal state for suspend / unsuspend
	const [confirmTarget, setConfirmTarget] = useState<SubAdminItem | null>(null)
	const [actionLoading, setActionLoading] = useState(false)

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
	}, [fetchSubAdmins, isSuperAdmin])

	const handleStatusToggleConfirm = async () => {
		if (!confirmTarget) return
		setActionLoading(true)
		const newStatus = !confirmTarget.is_suspended
		try {
			const res = await updateSubAdminStatus(confirmTarget.public_id, newStatus)
			if (res.success) {
				toast.success(
					`Sub Admin "${confirmTarget.name}" has been ${newStatus ? 'suspended' : 'activated'}.`
				)
				setConfirmTarget(null)
				fetchSubAdmins()
			} else {
				toast.error(res.message || 'Failed to update Sub Admin status.')
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to update Sub Admin status.'))
		} finally {
			setActionLoading(false)
		}
	}

	if (!isSuperAdmin) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error" sx={{ borderRadius: 2 }}>
					Access Denied: Only Super Admin accounts have permission to manage Sub Admin users.
				</Alert>
			</Box>
		)
	}

	const columns: Column<SubAdminItem>[] = [
		{
			field: 'name',
			label: 'Name',
			render: (_: unknown, row: SubAdminItem) => {
				const initials = (row.name || 'A').substring(0, 2).toUpperCase()
				return (
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Avatar
							sx={{
								bgcolor: 'rgba(43,111,113,0.12)',
								color: '#2B6F71',
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
				return row.is_suspended ? (
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
				)
			},
		},
	]

	return (
		<Box>
			{/* Page Header */}
			<AdminPageHeader
				title="Admins"
				subtitle="Manage Sub Admin accounts and operational permissions across the portal"
				count={total}
				countLabel="admins"
				actions={
					<AppButton
						label="Add Admin"
						startIcon={<AddIcon />}
						onClick={() => setDrawerOpen(true)}
						sx={{
							borderRadius: '8px',
							fontWeight: 600,
							px: 2.5,
							py: 1,
						}}
					/>
				}
			/>

			{/* Filters Bar */}
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				spacing={2}
				alignItems={{ xs: 'stretch', sm: 'center' }}
				justifyContent="space-between"
				sx={{ mb: 3 }}
			>
				<Box sx={{ width: { xs: '100%', sm: 260 } }}>
					<AppSelect
						placeholder="Filter by Role"
						value={selectedRole}
						onChange={(e) => {
							setSelectedRole(e.target.value as string)
							setPage(1)
						}}
						options={ROLE_OPTIONS}
						startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
					/>
				</Box>
			</Stack>

			{/* Error Alert */}
			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
					{error}
				</Alert>
			)}

			{/* Data Table */}
			<AppTable
				columns={columns}
				rows={subAdmins}
				loading={loading}
				emptyMessage="No Admins found."
				page={page}
				pageSize={pageSize}
				totalRows={total}
				onPageChange={(newPage) => setPage(newPage)}
				onPageSizeChange={(newPageSize) => {
					setPageSize(newPageSize)
					setPage(1)
				}}
			/>

			{/* Add Admin Modal */}
			<AddAdminModal
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onSuccess={fetchSubAdmins}
			/>

			{/* Status Confirmation Modal */}
			<ConfirmModal
				open={!!confirmTarget}
				onClose={() => setConfirmTarget(null)}
				onConfirm={handleStatusToggleConfirm}
				loading={actionLoading}
				variant={confirmTarget?.is_suspended ? 'success' : 'warning'}
				title={confirmTarget?.is_suspended ? 'Unsuspend Admin?' : 'Suspend Admin?'}
				description={
					confirmTarget?.is_suspended
						? `Are you sure you want to activate ${confirmTarget?.name}?`
						: `Are you sure you want to suspend ${confirmTarget?.name}?`
				}
				confirmLabel={confirmTarget?.is_suspended ? 'Unsuspend' : 'Suspend'}
				cancelLabel="Cancel"
			/>
		</Box>
	)
}
