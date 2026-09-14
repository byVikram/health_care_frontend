// src/features/admin/pages/AdminAppointmentsPage.tsx
import { useEffect, useState, useCallback, useRef } from 'react'
import {
	Box,
	Typography,
	Stack,
	CircularProgress,
	Alert,
	Tooltip,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	InputAdornment,
	Avatar,
	Button,
} from '@mui/material'
import AppInput from '../../../components/common/Input/AppInput'
import CancelIcon from '@mui/icons-material/Cancel'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'

// import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppButton from '../../../components/common/Button/AppButton'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import StatusBadge from '../../../components/admin/StatusBadge'
import AdminRescheduleDrawer from '../components/AdminRescheduleDrawer'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import { listAdminAppointments, AdminAppointmentItem } from '../adminService'
import { useAdminAppointmentActions } from '../hooks/useAdminAppointmentActions'
import { formatINR } from '../../../utils/Utils'
import RescheduleIcon from '../../../assets/icons/reschedule.svg'

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

export default function AdminAppointmentsPage() {
	// ── Table data ──────────────────────────────────────────────────────────
	const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// ── Pagination ──────────────────────────────────────────────────────────
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [totalRows, setTotalRows] = useState(0)

	// ── Search / filter ─────────────────────────────────────────────────────
	const [searchInput, setSearchInput] = useState('')
	const [searchQuery, setSearchQuery] = useState('')
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// ── Fetch appointments ──────────────────────────────────────────────────
	const fetchAppointments = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await listAdminAppointments({ page, pageSize, search: searchQuery || undefined })
			if (res.success && res.data) {
				setAppointments(res.data.items || [])
				setTotalRows(res.data.total ?? 0)
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to fetch appointments list'))
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, searchQuery])

	useEffect(() => {
		fetchAppointments()
	}, [fetchAppointments])

	// ── Shared reschedule / cancel / refund logic ──────────────────────────
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

	// ── Debounced search ────────────────────────────────────────────────────
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		setSearchInput(val)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			setPage(1)
			setSearchQuery(val.trim())
		}, 400)
	}

	// ── Table columns ───────────────────────────────────────────────────────
	const columns: Column<AdminAppointmentItem>[] = [
		{
			field: 'id',
			label: 'Appointment ID',
			render: (_: unknown, row: AdminAppointmentItem) => (
				<Box>
					<Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: '#0f172a' }}>
						{row.id}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{row.appointment_date} @ {row.start_time}
					</Typography>
				</Box>
			),
		},
		{
			field: 'patient_name',
			label: 'Patient & Doctor',
			render: (_: unknown, row: AdminAppointmentItem) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar sx={{ bgcolor: 'rgba(13,148,136,0.12)', color: '#0d9488', width: 34, height: 34, fontSize: 12, fontWeight: 800 }}>
						{(row.patient_name || 'P').substring(0, 1).toUpperCase()}
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
							Patient: {row.patient_name || 'N/A'}
						</Typography>
						<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
							Dr. {row.doctor_name || 'N/A'}
						</Typography>
					</Box>
				</Stack>
			),
		},
		{
			field: 'fees',
			label: 'Fee',
			render: (_: unknown, row: AdminAppointmentItem) => (
				<Typography variant="body2" fontWeight={700} color="#0d9488">
					{row.fees != null ? formatINR(row.fees) : '—'}
				</Typography>
			),
		},
		{
			field: 'status',
			label: 'Status',
			render: (_: unknown, row: AdminAppointmentItem) => (
				<StatusBadge
					status={row.status || 'scheduled'}
					label={(row.status || 'SCHEDULED').toUpperCase()}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_: unknown, row: AdminAppointmentItem) => {
				const isBusy = actionLoadingId === (row.id || String(row.id))
				return (
					<Stack direction="row" spacing={0.75} justifyContent="flex-end" alignItems="center">
						<Tooltip title="Reschedule">
							<span>
								<IconButton
									size="small"
									onClick={() => handleOpenReschedule(row)}
									disabled={isBusy || !row.action?.can_reschedule}
									sx={{
										border: '1px solid #fed7aa',
										borderRadius: 1.5,
										bgcolor: '#fff7ed',
										p: 0.75,
										'&:hover': { bgcolor: '#ffedd5' },
									}}
								>
									<img src={RescheduleIcon} alt="Reschedule" width={16} height={16} />
								</IconButton>
							</span>
						</Tooltip>

						<Tooltip title="Cancel">
							<span>
								<IconButton
									size="small"
									onClick={() => handleRequestCancel(row)}
									disabled={isBusy || !row.action?.can_cancel}
									sx={{
										border: '1px solid #fecaca',
										borderRadius: 1.5,
										color: '#dc2626',
										bgcolor: '#fff1f2',
										'&:hover': { bgcolor: '#fee2e2' },
									}}
								>
									<CancelIcon sx={{ fontSize: 16 }} />
								</IconButton>
							</span>
						</Tooltip>

						<Tooltip title="Refund">
							<span>
								<IconButton
									size="small"
									onClick={() => handleRequestRefund(row)}
									disabled={isBusy || !row.action?.can_refund}
									sx={{
										border: '1px solid #e9d5ff',
										borderRadius: 1.5,
										color: '#7e22ce',
										bgcolor: '#f3e8ff',
										'&:hover': { bgcolor: '#e9d5ff' },
									}}
								>
									<CurrencyRupeeIcon sx={{ fontSize: 16 }} />
								</IconButton>
							</span>
						</Tooltip>
					</Stack>
				)
			},
		},
	]

	return (
		<Box>
			<AdminPageHeader
				title="Appointments Management"
				subtitle="Monitor system-wide appointments, handle admin overrides, perform reschedules, and trigger refunds."
				count={totalRows}
				countLabel="appointments"
				actions={
					<Button
						onClick={fetchAppointments}
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

			<Box sx={{ mb: 2.5, maxWidth: 360 }}>
				<AppInput
					size="small"
					fullWidth
					placeholder="Search patient, doctor, or ID..."
					value={searchInput}
					onChange={handleSearchChange}
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

			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
					{error}
				</Alert>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading master appointments...
					</Typography>
				</Stack>
			) : (
				<AppTable
					columns={columns}
					rows={appointments}
					emptyMessage="No appointments found matching criteria."
					page={page}
					pageSize={pageSize}
					totalRows={totalRows}
					onPageChange={(newPage) => setPage(newPage)}
					onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1) }}
				/>
			)}

			{/* Reschedule Drawer */}
			<AdminRescheduleDrawer
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

			{/* Cancel Dialog */}
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

			{/* Refund Dialog */}
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
