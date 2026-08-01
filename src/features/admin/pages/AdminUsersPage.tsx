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
	TablePagination,
	SxProps,
	Theme,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import LockResetIcon from '@mui/icons-material/LockReset'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppInput from '../../../components/common/Input/AppInput'
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

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

/** Resolves the role-specific id (patient_id / doctor_id / provider id) that
 *  AdminUserDetailPage's route (/admin/users/:role/:id) expects to receive. */
function resolveDetailId(user: AdminUserItem): string | null {
	switch (user.role) {
		case 'patient':
			return user.patient_id || null
		case 'doctor':
			return user.doctor_id || null
		case 'pharmacy':
			return user.pharmacy_id || null
		case 'laboratory':
			return user.laboratory_id || null
		case 'radiology':
			return user.radiology_id || null
		default:
			return user.public_id || String(user.id) || null
	}
}

/** Shared base styles for moderation action buttons */
const moderationButtonBaseSx: SxProps<Theme> = {
	height: 30,
	px: 1,
	py: 0,
	fontSize: 12,
	justifyContent: 'center',
	whiteSpace: 'nowrap',
	lineHeight: 1.1,
}

/** Fixed-width style for the Suspend / Unsuspend toggle button */
const suspendButtonSx: SxProps<Theme> = {
	...moderationButtonBaseSx,
	width: 120,
	minWidth: 120,
	maxWidth: 120,
}

/** Fixed-width style for the Reset OTP button */
const resetOtpButtonSx: SxProps<Theme> = {
	...moderationButtonBaseSx,
	width: 110,
	minWidth: 110,
	maxWidth: 110,
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

	const handleToggleSuspend = async (user: AdminUserItem) => {
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

	const handleResetOtp = async (user: AdminUserItem) => {
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
		// {
		// 	field: 'public_id',
		// 	label: 'ID',
		// 	render: (_: unknown, row: AdminUserItem) => (
		// 		<Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#475569' }}>
		// 			{row.public_id || 'N/A'}
		// 		</Typography>
		// 	),
		// },
		{
			field: 'id',
			label: 'User Info',
			render: (_: unknown, row: AdminUserItem) => (
				<Box>
					<Typography variant="subtitle2" fontWeight={700}>
						{row.email || row.contact_number}
					</Typography>
				</Box>
			),
		},
		{
			field: 'role',
			label: 'Role',
			render: (_: unknown, row: AdminUserItem) => (
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
			render: (_: unknown, row: AdminUserItem) => (
				<Typography variant="body2">{row.contact_number || 'N/A'}</Typography>
			),
		},
		{
			field: 'is_suspended',
			label: 'Account State',
			render: (_: unknown, row: AdminUserItem) => (
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
			render: (_: unknown, row: AdminUserItem) => {
				const isBusy = actionLoadingId === (row.public_id || String(row.id))
				const detailId = resolveDetailId(row)
				return (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 300 }}>
						{/* Fixed-width slot for Suspend / Unsuspend */}
						<Box sx={{ width: 120, flexShrink: 0 }}>
							<Tooltip title={row.is_suspended ? 'Unsuspend Account' : 'Suspend Account'}>
								<span>
									<AppButton
										// label={row.is_suspended ? 'Unsuspend' : 'Suspend'}
										size="small"
										color={row.is_suspended ? 'success' : 'error'}
										startIcon={row.is_suspended ? <CheckCircleOutlineIcon /> : <BlockIcon />}
										onClick={() => handleToggleSuspend(row)}
										disabled={isBusy}
										sx={suspendButtonSx}
									/>
								</span>
							</Tooltip>
						</Box>

						{/* Fixed-width slot for Reset OTP */}
						<Box sx={{ width: 110, flexShrink: 0 }}>
							<Tooltip title="Reset Blocked OTP State">
								<span>
									<AppButton
										// label="Reset OTP"
										size="small"
										variant="outlined"
										startIcon={<LockResetIcon />}
										onClick={() => handleResetOtp(row)}
										disabled={isBusy}
										sx={resetOtpButtonSx}
									/>
								</span>
							</Tooltip>
						</Box>

						{/* Arrow with extra left spacing */}
						{detailId && (
							<Box sx={{ ml: 1, flexShrink: 0 }}>
								<Tooltip title="View Account Details">
									<span>
										<IconButton
											size="small"
											onClick={() => handleViewDetails(row)}
											sx={{
												color: '#0d9488',
												border: '1px solid #e2e8f0',
												'&:hover': { bgcolor: 'rgba(13, 148, 136, 0.08)' },
											}}
										>
											<ChevronRightIcon fontSize="small" />
										</IconButton>
									</span>
								</Tooltip>
							</Box>
						)}
					</Box>
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
				<Grid container spacing={2} sx={{ mb: 3 }}>
					<Grid size={{ xs: 12, sm: 5, md: 3 }}>
						<AppSelect
							label="Filter by Role"
							options={ROLE_OPTIONS}
							value={selectedRole}
							onChange={(e) => { setSelectedRole(e.target.value); setPage(1) }}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 5, md: 3 }}>
						<AppInput
							label="Filter by Phone Number"
							placeholder="Search phone number"
							value={phoneNumber}
							onChange={(e) => { setPhoneNumber(e.target.value); setPage(1) }}
						/>
					</Grid>
				</Grid>

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
					<>
						<AppTable
							columns={columns}
							rows={users}
							emptyMessage="No users found matching criteria."
							page={page}
							pageSize={pageSize}
							totalRows={total}
							onPageChange={(newPage) => setPage(newPage)}
							onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1) }}
						/>
					</>
				)}
			</SectionCard>
		</Box>
	)
}
