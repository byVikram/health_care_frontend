// src/features/admin/pages/AdminUsersPage.tsx
import { useEffect, useState, useCallback } from 'react'
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
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import LockResetIcon from '@mui/icons-material/LockReset'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable from '../../../components/common/Table/AppTable'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppButton from '../../../components/common/Button/AppButton'
import { listUsers, suspendUser, resetUserOtp, AdminUserItem } from '../adminService'

const ROLE_OPTIONS = [
	{ label: 'All Roles', value: '' },
	{ label: 'Doctors', value: 'doctor' },
	{ label: 'Patients', value: 'patient' },
	{ label: 'Pharmacies', value: 'pharmacy' },
	{ label: 'Radiology Centers', value: 'radiology' },
	{ label: 'Laboratories', value: 'laboratory' },
	{ label: 'Admins', value: 'admin' },
]

export default function AdminUsersPage() {
	const [users, setUsers] = useState<AdminUserItem[]>([])
	const [selectedRole, setSelectedRole] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

	const fetchUsers = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await listUsers(selectedRole || undefined)
			if (res.success) {
				setUsers(res.data || [])
			}
		} catch (err: any) {
			setError(err?.message || 'Failed to fetch users list')
		} finally {
			setLoading(false)
		}
	}, [selectedRole])

	useEffect(() => {
		fetchUsers()
	}, [fetchUsers])

	const handleToggleSuspend = async (user: AdminUserItem) => {
		setActionLoadingId(user.public_id || String(user.id))
		try {
			const res = await suspendUser(user.public_id || String(user.id))
			if (res.success) {
				toast.success(`User ${user.email || user.contact_number} status updated.`)
				fetchUsers()
			}
		} catch (err: any) {
			toast.error(err?.message || 'Failed to update user status.')
		} finally {
			setActionLoadingId(null)
		}
	}

	const handleResetOtp = async (user: AdminUserItem) => {
		setActionLoadingId(user.public_id || String(user.id))
		try {
			const res = await resetUserOtp(user.public_id || String(user.id))
			if (res.success) {
				toast.success(`OTP state reset for ${user.email || user.contact_number}.`)
			}
		} catch (err: any) {
			toast.error(err?.message || 'Failed to reset OTP state.')
		} finally {
			setActionLoadingId(null)
		}
	}

	const columns = [
		{
			field: 'id',
			label: 'User Info',
			render: (_: any, row: AdminUserItem) => (
				<Box>
					<Typography variant="subtitle2" fontWeight={700}>
						{row.email || row.contact_number}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Public ID: {row.public_id || row.id}
					</Typography>
				</Box>
			),
		},
		{
			field: 'role',
			label: 'Role',
			render: (_: any, row: AdminUserItem) => (
				<Chip
					label={(row.role || 'USER').toUpperCase()}
					size="small"
					sx={{ bgcolor: '#f1f5f9', color: '#0f172a', fontWeight: 700 }}
				/>
			),
		},
		{
			field: 'contact_number',
			label: 'Mobile Contact',
			render: (_: any, row: AdminUserItem) => (
				<Typography variant="body2">{row.contact_number || 'N/A'}</Typography>
			),
		},
		{
			field: 'is_suspended',
			label: 'Account State',
			render: (_: any, row: AdminUserItem) => (
				<Chip
					label={row.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
					size="small"
					color={row.is_suspended ? 'error' : 'success'}
					sx={{ fontWeight: 700 }}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Moderation Actions',
			render: (_: any, row: AdminUserItem) => {
				const isBusy = actionLoadingId === (row.public_id || String(row.id))
				return (
					<Stack direction="row" spacing={1}>
						<Tooltip title={row.is_suspended ? 'Unsuspend Account' : 'Suspend Account'}>
							<span>
								<AppButton
									label={row.is_suspended ? 'Unsuspend' : 'Suspend'}
									size="small"
									color={row.is_suspended ? 'success' : 'error'}
									startIcon={row.is_suspended ? <CheckCircleOutlineIcon /> : <BlockIcon />}
									onClick={() => handleToggleSuspend(row)}
									disabled={isBusy}
								/>
							</span>
						</Tooltip>

						<Tooltip title="Reset Blocked OTP State">
							<span>
								<AppButton
									label="Reset OTP"
									size="small"
									variant="outlined"
									startIcon={<LockResetIcon />}
									onClick={() => handleResetOtp(row)}
									disabled={isBusy}
								/>
							</span>
						</Tooltip>
					</Stack>
				)
			},
		},
	]

	return (
		<Box>
			<SectionCard title="User Moderation & Account Oversight">
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Manage system accounts, handle suspensions, and reset security states
				</Typography>
				<Box sx={{ mb: 3, maxWidth: 300 }}>
					<AppSelect
						label="Filter by Role"
						options={ROLE_OPTIONS}
						value={selectedRole}
						onChange={(e) => setSelectedRole(e.target.value)}
					/>
				</Box>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{loading ? (
					<Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
						<CircularProgress sx={{ color: '#0d9488' }} />
						<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
							Loading users directory...
						</Typography>
					</Stack>
				) : (
					<AppTable columns={columns as any} rows={users as any} emptyMessage="No users found matching criteria." />
				)}
			</SectionCard>
		</Box>
	)
}
