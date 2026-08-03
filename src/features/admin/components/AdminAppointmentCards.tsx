// src/features/admin/components/AdminAppointmentCards.tsx
import { useEffect, useState, useCallback, useRef } from 'react'
import {
	Box,
	Typography,
	Stack,
	CircularProgress,
	Grid,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from '@mui/material'
import EventIcon from '@mui/icons-material/Event'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CancelIcon from '@mui/icons-material/Cancel'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import SearchIcon from '@mui/icons-material/Search'

import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppButton from '../../../components/common/Button/AppButton'
import AppModal from '../../../components/common/Modal/AppModal'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import StatusBadge from '../../../components/admin/StatusBadge'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import PaginationBar from '../../../pagination/Pagination'
import RescheduleDrawer from '../../doctor/search/components/RescheduleDrawer'
import { listAdminAppointments, AdminAppointmentItem } from '../adminService'
import { useAdminAppointmentActions } from '../hooks/useAdminAppointmentActions'
import { formatINR } from '../../../utils/Utils'
import RescheduleIcon from '../../../assets/icons/reschedule.svg'

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

const STATUS_OPTIONS = [
	{ value: '', label: 'All Status' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'confirmed', label: 'Confirmed' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'cancelled', label: 'Cancelled' },
	{ value: 'no_show', label: 'No Show' },
]

const SORT_OPTIONS = [
	{ value: 'newest', label: 'Newest First' },
	{ value: 'oldest', label: 'Oldest First' },
]

const formatDate = (dateStr?: string) =>
	dateStr
		? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
		: 'N/A'

interface AdminAppointmentCardsProps {
	/** When set, only shows appointments for this patient. */
	patientId?: string
	/** When set, only shows appointments for this doctor. */
	doctorId?: string
	/** Custom message shown when there are no results. */
	emptyMessage?: string
}

export default function AdminAppointmentCards({
	patientId,
	doctorId,
	emptyMessage = 'There are no appointments for this account yet.',
}: AdminAppointmentCardsProps) {
	// ── list state ──────────────────────────────────────────────────────────
	const [rows, setRows] = useState<AdminAppointmentItem[]>([])
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(6)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// ── search / filter / sort ─────────────────────────────────────────────
	const [searchInput, setSearchInput] = useState('')
	const [searchQuery, setSearchQuery] = useState('')
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const [status, setStatus] = useState('')
	const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

	// ── view details modal ──────────────────────────────────────────────────
	const [viewTarget, setViewTarget] = useState<AdminAppointmentItem | null>(null)

	// ── fetch ───────────────────────────────────────────────────────────────
	const fetchAppointments = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await listAdminAppointments({
				page,
				pageSize,
				search: searchQuery || undefined,
				patientId,
				doctorId,
				status: status || undefined,
				sortOrder,
			})
			if (res.success && res.data) {
				setRows(res.data.items || [])
				setTotal(res.data.total ?? 0)
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to load appointments.'))
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, searchQuery, patientId, doctorId, status, sortOrder])

	useEffect(() => {
		fetchAppointments()
	}, [fetchAppointments])

	// reset to page 1 when filters change
	useEffect(() => {
		setPage(1)
	}, [searchQuery, patientId, doctorId, status, sortOrder])

	// ── shared reschedule / cancel / refund logic ──────────────────────────
	const {
		actionLoadingId,
		cancelConfirmOpen,
		apptPendingCancel,
		handleRequestCancel,
		handleCloseCancelConfirm,
		handleConfirmCancel,
		refundConfirmOpen,
		apptPendingRefund,
		handleRequestRefund,
		handleCloseRefundConfirm,
		handleConfirmRefund,
		rescheduleOpen,
		setRescheduleOpen,
		rescheduleAppt,
		rescheduleDate,
		setRescheduleDate,
		rescheduleTime,
		setRescheduleTime,
		rescheduleSlots,
		rescheduleSlotsLoading,
		rescheduleSubmitting,
		rescheduleHospitals,
		rescheduleHospitalId,
		setRescheduleHospitalId,
		appointmentType,
		setAppointmentType,
		handleOpenReschedule,
		handleRescheduleConfirm,
	} = useAdminAppointmentActions(fetchAppointments)

	// ── debounced search ────────────────────────────────────────────────────
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		setSearchInput(val)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => setSearchQuery(val.trim()), 400)
	}

	return (
		<Box>
			{/* Search + filters */}
			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
				<Box sx={{ flex: 1, minWidth: 220 }}>
					<AppInput
						placeholder="Search appointment ID, doctor, or hospital..."
						value={searchInput}
						onChange={handleSearchChange}
						size="small"
						startIcon={<SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />}
					/>
				</Box>
				<Box sx={{ width: { xs: '100%', sm: 190 } }}>
					<AppSelect
						value={sortOrder}
						onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
						options={SORT_OPTIONS}
						size="small"
					/>
				</Box>
				<Box sx={{ width: { xs: '100%', sm: 160 } }}>
					<AppSelect
						value={status}
						onChange={(e) => setStatus(e.target.value as string)}
						options={STATUS_OPTIONS}
						size="small"
					/>
				</Box>
			</Stack>

			{error && (
				<Typography variant="body2" color="error" sx={{ mb: 2 }}>
					{error}
				</Typography>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
				</Stack>
			) : rows.length === 0 ? (
				<AdminEmptyState icon={<EventIcon />} title="No appointments found" description={emptyMessage} />
			) : (
				<Grid container spacing={2}>
					{rows.map((row) => {
						const isBusy = actionLoadingId === (row.id || row.public_id)
						const flags = row.action
						return (
							<Grid size={{ xs: 12, sm: 6 }} key={row.id}>
								<Box
									sx={{
										p: 2.25,
										borderRadius: '14px',
										border: '1px solid #e2e8f0',
										bgcolor: '#ffffff',
										transition: 'all 0.15s ease',
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										'&:hover': { borderColor: '#0d9488', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' },
									}}
								>
									{/* Header: ID + status */}
									<Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.25 }}>
										<Typography
											variant="caption"
											sx={{ fontFamily: 'monospace', color: '#64748b', fontWeight: 600, wordBreak: 'break-all', pr: 1 }}
										>
											{row.id}
										</Typography>
										<StatusBadge status={row.status || 'pending'} label={(row.status || 'PENDING').toUpperCase()} />
									</Stack>

									{/* Doctor / patient + hospital + speciality */}
									<Box sx={{ mb: 1.25 }}>
										<Typography variant="subtitle2" fontWeight={800} color="#0f172a">
											{doctorId ? row.patient_name || 'Patient' : `Dr. ${row.doctor_name || 'Doctor'}`}
										</Typography>
										<Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
											<LocalHospitalIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
											<Typography variant="caption" color="text.secondary">
												{row.hospital_name || 'Clinic / Hospital'}
												{row.doctor_speciality ? ` • ${row.doctor_speciality}` : ''}
											</Typography>
										</Stack>
									</Box>

									{/* Date / time / fee */}
									<Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 1.5 }}>
										<Stack direction="row" spacing={0.5} alignItems="center">
											<EventIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
											<Typography variant="caption" color="text.secondary" fontWeight={600}>
												{formatDate(row.appointment_date)}
											</Typography>
										</Stack>
										<Stack direction="row" spacing={0.5} alignItems="center">
											<AccessTimeIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
											<Typography variant="caption" color="text.secondary" fontWeight={600}>
												{row.start_time || 'N/A'}
											</Typography>
										</Stack>
										<Typography variant="caption" fontWeight={800} color="#0d9488">
											{row.fees != null ? formatINR(row.fees) : 'N/A'}
										</Typography>
									</Stack>

									{/* Actions */}
									<Stack direction="row" spacing={0.75} sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #f1f5f9' }}>
										<Tooltip title="View Details">
											<IconButton
												size="small"
												onClick={() => setViewTarget(row)}
												sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
											>
												<VisibilityIcon sx={{ fontSize: 16, color: '#475569' }} />
											</IconButton>
										</Tooltip>
										{flags?.can_reschedule && (
											<Tooltip title="Reschedule">
												<IconButton
													size="small"
													disabled={isBusy}
													onClick={() => handleOpenReschedule(row)}
													sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#fff7ed', '&:hover': { bgcolor: '#ffedd5' } }}
												>
													<img src={RescheduleIcon} alt="Reschedule" width={16} height={16} />
												</IconButton>
											</Tooltip>
										)}
										{flags?.can_cancel && (
											<Tooltip title="Cancel">
												<IconButton
													size="small"
													disabled={isBusy}
													onClick={() => handleRequestCancel(row)}
													sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#fff1f2', color: '#dc2626', '&:hover': { bgcolor: '#fee2e2' } }}
												>
													<CancelIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</Tooltip>
										)}
										{flags?.can_refund && (
											<Tooltip title="Refund">
												<IconButton
													size="small"
													disabled={isBusy}
													onClick={() => handleRequestRefund(row)}
													sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#f3e8ff', color: '#7e22ce', '&:hover': { bgcolor: '#e9d5ff' } }}
												>
													<CurrencyRupeeIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</Tooltip>
										)}
									</Stack>
								</Box>
							</Grid>
						)
					})}
				</Grid>
			)}

			{total > 0 && (
				<Box sx={{ mt: 1 }}>
					<PaginationBar
						page={page}
						pageSize={pageSize}
						totalRows={total}
						pageSizeOptions={[6, 12, 24]}
						onPageChange={setPage}
						onPageSizeChange={(size) => {
							setPageSize(size)
							setPage(1)
						}}
					/>
				</Box>
			)}

			{/* ── View details modal ─────────────────────────────────────── */}
			<AppModal
				open={Boolean(viewTarget)}
				onClose={() => setViewTarget(null)}
				title="Appointment Details"
				maxWidth="xs"
				fullWidth
			>
				{viewTarget && (
					<Stack spacing={1.25} sx={{ py: 0.5 }}>
						<Stack direction="row" justifyContent="space-between">
							<Typography variant="caption" color="text.secondary">Appointment ID</Typography>
							<Typography variant="caption" fontWeight={700} sx={{ fontFamily: 'monospace' }}>{viewTarget.id}</Typography>
						</Stack>
						<Stack direction="row" justifyContent="space-between">
							<Typography variant="caption" color="text.secondary">Doctor</Typography>
							<Typography variant="caption" fontWeight={700}>{viewTarget.doctor_name || 'N/A'}</Typography>
						</Stack>
						{viewTarget.doctor_speciality && (
							<Stack direction="row" justifyContent="space-between">
								<Typography variant="caption" color="text.secondary">Speciality</Typography>
								<Typography variant="caption" fontWeight={700}>{viewTarget.doctor_speciality}</Typography>
							</Stack>
						)}
						<Stack direction="row" justifyContent="space-between">
							<Typography variant="caption" color="text.secondary">Patient</Typography>
							<Typography variant="caption" fontWeight={700}>{viewTarget.patient_name || 'N/A'}</Typography>
						</Stack>
						<Stack direction="row" justifyContent="space-between">
							<Typography variant="caption" color="text.secondary">Hospital</Typography>
							<Typography variant="caption" fontWeight={700}>{viewTarget.hospital_name || 'N/A'}</Typography>
						</Stack>
						<Stack direction="row" justifyContent="space-between">
							<Typography variant="caption" color="text.secondary">Date</Typography>
							<Typography variant="caption" fontWeight={700}>{formatDate(viewTarget.appointment_date)}</Typography>
						</Stack>
						<Stack direction="row" justifyContent="space-between">
							<Typography variant="caption" color="text.secondary">Time</Typography>
							<Typography variant="caption" fontWeight={700}>{viewTarget.start_time || 'N/A'}</Typography>
						</Stack>
						<Stack direction="row" justifyContent="space-between">
							<Typography variant="caption" color="text.secondary">Fee</Typography>
							<Typography variant="caption" fontWeight={700} color="#0d9488">
								{viewTarget.fees != null ? formatINR(viewTarget.fees) : 'N/A'}
							</Typography>
						</Stack>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Typography variant="caption" color="text.secondary">Status</Typography>
							<StatusBadge status={viewTarget.status || 'pending'} label={(viewTarget.status || 'PENDING').toUpperCase()} />
						</Stack>
					</Stack>
				)}
			</AppModal>

			{/* ── Reschedule Drawer (shared) ─────────────────────────────── */}
			<RescheduleDrawer
				rescheduleOpen={rescheduleOpen}
				setRescheduleOpen={setRescheduleOpen}
				rescheduleAppt={rescheduleAppt}
				rescheduleDate={rescheduleDate}
				setRescheduleDate={setRescheduleDate}
				rescheduleTime={rescheduleTime}
				setRescheduleTime={setRescheduleTime}
				rescheduleSlots={rescheduleSlots}
				rescheduleSlotsLoading={rescheduleSlotsLoading}
				rescheduleSubmitting={rescheduleSubmitting}
				handleRescheduleConfirm={handleRescheduleConfirm}
				rescheduleHospitals={rescheduleHospitals}
				rescheduleHospitalId={rescheduleHospitalId}
				setRescheduleHospitalId={setRescheduleHospitalId}
				appointmentType={appointmentType}
				setAppointmentType={setAppointmentType}
			/>

			{/* ── Cancel confirmation (shared) ───────────────────────────── */}
			<Dialog open={cancelConfirmOpen} onClose={handleCloseCancelConfirm} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
				<DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Cancel Appointment?</DialogTitle>
				<DialogContent>
					<DialogContentText color="text.secondary">
						Are you sure you want to cancel appointment {apptPendingCancel?.id}? This action will update status to cancelled.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
					<AppButton label="Keep Appointment" variant="outlined" onClick={handleCloseCancelConfirm} />
					<AppButton label="Confirm Cancel" color="error" onClick={handleConfirmCancel} />
				</DialogActions>
			</Dialog>

			{/* ── Refund confirmation (shared) ───────────────────────────── */}
			<ConfirmModal
				open={refundConfirmOpen}
				onClose={handleCloseRefundConfirm}
				onConfirm={handleConfirmRefund}
				variant="confirm"
				title="Process Refund"
				description={
					apptPendingRefund
						? `Process a refund for ${apptPendingRefund.patient_name || 'this patient'}'s appointment${apptPendingRefund.fees != null ? ` (${formatINR(apptPendingRefund.fees)})` : ''}?`
						: ''
				}
				confirmLabel="Confirm Refund"
				loading={actionLoadingId === (apptPendingRefund?.id || apptPendingRefund?.public_id)}
			/>
		</Box>
	)
}
