// src/features/admin/components/SubAdminLogsDrawer.tsx
import { useEffect, useState, useCallback } from 'react'
import {
	Drawer,
	Box,
	Typography,
	IconButton,
	Stack,
	Chip,
	Avatar,
	TextField,
	MenuItem,
	InputAdornment,
	CircularProgress,
	Alert,
	Paper,
	Divider,
	Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import HistoryIcon from '@mui/icons-material/History'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

import AppButton from '../../../components/common/Button/AppButton'
import {
	getOperationalLogs,
	OperationalLogItem,
	OperationalLogListResult,
	SubAdminItem,
} from '../adminService'

interface SubAdminLogsDrawerProps {
	open: boolean
	subAdmin: SubAdminItem | null
	onClose: () => void
}

const ACTION_FILTER_OPTIONS = [
	{ label: 'All Actions', value: '' },
	{ label: 'Verifications & Approvals', value: 'verification' },
	{ label: 'Document Reviews', value: 'document' },
	{ label: 'Provider Assignments', value: 'assign' },
	{ label: 'User Suspensions', value: 'suspend' },
	{ label: 'Refunds', value: 'refund' },
]

const ROLE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
	compliance_admin: { bg: '#ffedf7', color: '#9d174d', label: 'Compliance Admin' },
	support_admin: { bg: '#e0f2fe', color: '#0369a1', label: 'Support Admin' },
	billing_admin: { bg: '#f3e8ff', color: '#6b21a8', label: 'Billing Admin' },
	super_admin: { bg: '#f1f5f9', color: '#0f172a', label: 'Super Admin' },
}

function getActionStyle(action: string, actionLabel?: string) {
	const text = (actionLabel || action).toLowerCase()
	if (text.includes('approved') || text.includes('completed') || text.includes('verified')) {
		return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' }
	}
	if (text.includes('rejected') || text.includes('failed') || text.includes('suspend')) {
		return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' }
	}
	if (text.includes('changes') || text.includes('reupload') || text.includes('re-upload')) {
		return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' }
	}
	if (text.includes('assign')) {
		return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' }
	}
	if (text.includes('unsuspend')) {
		return { bg: '#ccfbf1', color: '#0f766e', border: '#99f6e4' }
	}
	return { bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' }
}

export default function SubAdminLogsDrawer({ open, subAdmin, onClose }: SubAdminLogsDrawerProps) {
	const [logs, setLogs] = useState<OperationalLogItem[]>([])
	const [total, setTotal] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [page, setPage] = useState(1)
	const pageSize = 10
	const [selectedAction, setSelectedAction] = useState('')
	const [searchQuery, setSearchQuery] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchSubAdminLogs = useCallback(async () => {
		if (!subAdmin) return
		setLoading(true)
		setError(null)
		try {
			// Query scoped strictly to this subAdmin using user_id or public_id
			const adminUserIdParam = subAdmin.user_id || subAdmin.public_id
			const res = await getOperationalLogs({
				adminUserId: adminUserIdParam,
				action: selectedAction || undefined,
				search: searchQuery.trim() || undefined,
				page,
				pageSize,
			})

			if (res.success && res.data) {
				if (Array.isArray(res.data)) {
					setLogs(res.data)
					setTotal(res.data.length)
					setTotalPages(1)
				} else {
					const result = res.data as OperationalLogListResult
					setLogs(result.items || [])
					setTotal(result.total || 0)
					setTotalPages(result.total_pages || 1)
				}
			} else {
				setError('Failed to fetch activity logs for this Sub Admin')
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Failed to fetch Sub Admin logs')
		} finally {
			setLoading(false)
		}
	}, [subAdmin, page, selectedAction, searchQuery])

	useEffect(() => {
		if (open && subAdmin) {
			setPage(1)
			fetchSubAdminLogs()
		} else {
			setLogs([])
			setTotal(0)
		}
	}, [open, subAdmin, fetchSubAdminLogs])

	if (!subAdmin) return null

	const roleConfig = ROLE_COLORS[subAdmin.role] || {
		bg: '#f1f5f9',
		color: '#475569',
		label: subAdmin.role,
	}

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			slotProps={{
				backdrop: {
					sx: {
						top: '64px',
						height: 'calc(100vh - 64px)',
					},
				},
				paper: {
					sx: {
						width: { xs: '100%', sm: 540, md: 600 },
						top: '64px',
						height: 'calc(100vh - 64px)',
						bgcolor: '#f8fafc',
						display: 'flex',
						flexDirection: 'column',
						boxShadow: '-8px 0 32px rgba(15,23,42,0.12)',
						borderLeft: '1px solid #e2e8f0',
					},
				},
			}}
		>
			{/* Drawer Header */}
			<Box sx={{ p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
				<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
					<Stack direction="row" spacing={2} alignItems="center">
						<Avatar
							sx={{
								bgcolor: roleConfig.color,
								color: '#ffffff',
								width: 46,
								height: 46,
								fontWeight: 800,
								fontSize: 18,
								boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
							}}
						>
							{subAdmin.name ? subAdmin.name.charAt(0).toUpperCase() : 'A'}
						</Avatar>
						<Box>
							<Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: '1.15rem' }}>
								{subAdmin.name}
							</Typography>
							<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
								<Chip
									label={roleConfig.label}
									size="small"
									sx={{
										bgcolor: roleConfig.bg,
										color: roleConfig.color,
										fontWeight: 800,
										fontSize: '0.7rem',
										height: 22,
										borderRadius: '5px',
									}}
								/>
								{subAdmin.department && (
									<Typography variant="caption" color="text.secondary" fontWeight={600}>
										• {subAdmin.department}
									</Typography>
								)}
							</Stack>
							<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
								{subAdmin.email} | ID: {subAdmin.public_id}
							</Typography>
						</Box>
					</Stack>

					<Stack direction="row" spacing={1} alignItems="center">
						<Tooltip title="Refresh logs">
							<IconButton
								size="small"
								onClick={fetchSubAdminLogs}
								disabled={loading}
								sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5 }}
							>
								<RefreshIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<IconButton size="small" onClick={onClose} sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Stack>
				</Stack>
			</Box>

			{/* Sub Admin Activity Logs Section Title & Scope Notice */}
			<Box sx={{ px: 3, py: 2, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Stack direction="row" spacing={1} alignItems="center">
						<HistoryIcon sx={{ color: '#0d9488', fontSize: 20 }} />
						<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
							Activity Logs
						</Typography>
					</Stack>
					<Chip
						label={`${total} Audited Actions`}
						size="small"
						sx={{ bgcolor: '#f0fdfa', color: '#0d9488', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #ccfbf1' }}
					/>
				</Stack>

				{/* In-Drawer Filter Bar */}
				<Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
					<TextField
						select
						size="small"
						value={selectedAction}
						onChange={(e) => {
							setSelectedAction(e.target.value)
							setPage(1)
						}}
						sx={{ minWidth: 160 }}
					>
						{ACTION_FILTER_OPTIONS.map((opt) => (
							<MenuItem key={opt.value} value={opt.value}>
								{opt.label}
							</MenuItem>
						))}
					</TextField>

					<TextField
						size="small"
						placeholder="Search target, notes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') setPage(1)
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
								</InputAdornment>
							),
						}}
						sx={{ flexGrow: 1 }}
					/>
				</Stack>
			</Box>

			{/* Drawer Content Body: Audited Actions */}
			<Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
				{error && (
					<Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
						{error}
					</Alert>
				)}

				{loading ? (
					<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
						<CircularProgress sx={{ color: '#0d9488' }} size={32} />
						<Typography variant="body2" sx={{ color: '#64748b', mt: 2, fontWeight: 600 }}>
							Loading {subAdmin.name}'s activity logs...
						</Typography>
					</Stack>
				) : logs.length === 0 ? (
					<Paper
						elevation={0}
						sx={{
							p: 4,
							textAlign: 'center',
							borderRadius: '12px',
							border: '1px dashed #cbd5e1',
							bgcolor: '#ffffff',
						}}
					>
						<HistoryIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
						<Typography variant="subtitle2" fontWeight={700} color="#0f172a">
							No Activity Logs Found
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.82rem' }}>
							{selectedAction || searchQuery
								? 'No actions match the selected filter criteria for this Sub Admin.'
								: `No state-changing administrative actions have been recorded for ${subAdmin.name} yet.`}
						</Typography>
					</Paper>
				) : (
					<Stack spacing={2}>
						{logs.map((log) => {
							const actionStyle = getActionStyle(log.action, log.action_label)
							return (
								<Paper
									key={log.id}
									elevation={0}
									sx={{
										p: 2.25,
										borderRadius: '12px',
										border: '1px solid #e2e8f0',
										bgcolor: '#ffffff',
										transition: 'all 0.2s ease',
										'&:hover': {
											borderColor: '#cbd5e1',
											boxShadow: '0 4px 12px rgba(15,23,42,0.04)',
										},
									}}
								>
									{/* Top Header Row: Timestamp & Action Badge */}
									<Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
										<Box>
											<Typography variant="body2" fontWeight={800} color="#0f172a" sx={{ fontSize: '0.88rem' }}>
												{log.action_label || log.action.replace(/_/g, ' ').toUpperCase()}
											</Typography>
											<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.74rem' }}>
												{log.created_at
													? new Date(log.created_at).toLocaleString('en-IN', {
															day: '2-digit',
															month: 'short',
															year: 'numeric',
															hour: '2-digit',
															minute: '2-digit',
															hour12: true,
													  })
													: '—'}
											</Typography>
										</Box>
										<Chip
											label={log.target_type || log.target_table || 'Resource'}
											size="small"
											sx={{
												bgcolor: '#f8fafc',
												color: '#475569',
												border: '1px solid #e2e8f0',
												fontWeight: 700,
												fontSize: '0.68rem',
												height: 22,
												borderRadius: '5px',
											}}
										/>
									</Stack>

									<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />

									{/* Target Details */}
									<Box sx={{ mb: 1.25 }}>
										<Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.04em' }}>
											TARGET
										</Typography>
										<Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ fontSize: '0.86rem' }}>
											{log.target_name || (log.target_row_id ? `ID #${log.target_row_id}` : '—')}
										</Typography>
										{log.target_public_id && (
											<Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
												ID: {log.target_public_id}
											</Typography>
										)}
									</Box>

									{/* State Transition (WHAT CHANGED) */}
									{log.state_change && (
										<Box sx={{ mb: 1.25 }}>
											<Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
												CHANGE
											</Typography>
											<Chip
												label={log.state_change}
												size="small"
												sx={{
													bgcolor: '#f8fafc',
													color: '#0f172a',
													border: '1px solid #cbd5e1',
													fontWeight: 700,
													fontFamily: 'monospace',
													fontSize: '0.75rem',
													height: 24,
													borderRadius: '6px',
												}}
											/>
										</Box>
									)}

									{/* Reviewer Notes / Reason */}
									{log.notes && (
										<Box sx={{ mt: 1 }}>
											<Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.04em', display: 'block', mb: 0.25 }}>
												NOTES / REASON
											</Typography>
											<Typography
												variant="body2"
												sx={{
													bgcolor: '#f8fafc',
													color: '#334155',
													p: 1.25,
													borderRadius: '8px',
													fontSize: '0.78rem',
													border: '1px solid #f1f5f9',
													fontStyle: 'italic',
												}}
											>
												"{log.notes}"
											</Typography>
										</Box>
									)}
								</Paper>
							)
						})}
					</Stack>
				)}
			</Box>

			{/* Drawer Footer: Pagination */}
			{totalPages > 1 && (
				<Box sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography variant="caption" color="text.secondary" fontWeight={600}>
							Page {page} of {totalPages} ({total} total)
						</Typography>
						<Stack direction="row" spacing={1}>
							<AppButton
								label="Previous"
								size="small"
								variant="outlined"
								disabled={page <= 1 || loading}
								startIcon={<NavigateBeforeIcon />}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								sx={{ borderRadius: '6px', textTransform: 'none', height: 32, fontSize: '0.75rem' }}
							/>
							<AppButton
								label="Next"
								size="small"
								variant="outlined"
								disabled={page >= totalPages || loading}
								endIcon={<NavigateNextIcon />}
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								sx={{ borderRadius: '6px', textTransform: 'none', height: 32, fontSize: '0.75rem' }}
							/>
						</Stack>
					</Stack>
				</Box>
			)}
		</Drawer>
	)
}
