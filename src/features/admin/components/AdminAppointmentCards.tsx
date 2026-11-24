// src/features/admin/components/AdminAppointmentCards.tsx
import { useEffect, useState, useCallback, useRef } from 'react'
import {
	Box,
	Typography,
	Stack,
	CircularProgress,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Avatar,
} from '@mui/material'
import EventIcon from '@mui/icons-material/Event'

import CancelIcon from '@mui/icons-material/Cancel'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import SearchIcon from '@mui/icons-material/Search'

import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppButton from '../../../components/common/Button/AppButton'

import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import StatusBadge from '../../../components/admin/StatusBadge'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import PaginationBar from '../../../pagination/Pagination'
import AdminRescheduleDrawer from './AdminRescheduleDrawer'
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

/** Convert a 24-hour time string to 12-hour format with AM/PM: "14:00:00" → "2:00 PM" */
const formatTime = (time?: string) => {
	if (!time) return 'N/A'
	const parts = time.split(':')
	if (parts.length < 2) return time
	let hours = parseInt(parts[0], 10)
	const minutes = parts[1]
	const period = hours >= 12 ? 'PM' : 'AM'
	hours = hours % 12
	if (hours === 0) hours = 12
	return `${hours}:${minutes} ${period}`
}

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
	const [pageSize, setPageSize] = useState(10)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// ── search / filter / sort ─────────────────────────────────────────────
	const [searchInput, setSearchInput] = useState('')
	const [searchQuery, setSearchQuery] = useState('')
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const [status, setStatus] = useState('')
	const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')



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
	const applySearch = (val: string) => {
		setSearchInput(val)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => setSearchQuery(val.trim()), 400)
	}
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => applySearch(e.target.value)

	return (
		<Box>
			{/* Search + filters */}
			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
				<Box sx={{ width: { xs: '100%', sm: 320 }, maxWidth: '100%' }}>
					<AppInput
						placeholder="Search appointment ID, doctor, or hospital..."
						value={searchInput}
						onChange={handleSearchChange}
						enableVoiceSearch
						onVoiceResult={applySearch}
						size="small"
						startIcon={<SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />}
					/>
				</Box>
				<Box sx={{ width: { xs: '100%', sm: 160 } }}>
					<AppSelect
						value={sortOrder}
						onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
						options={SORT_OPTIONS}
						size="small"
					/>
				</Box>
				<Box sx={{ width: { xs: '100%', sm: 140 } }}>
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
				<Box>
					{/* Table-style column headers */}
					<Stack
						direction="row"
						alignItems="center"
						sx={{
							px: 2.5,
							py: 1.25,
							mb: 0.5,
							borderBottom: '2px solid #e2e8f0',
						}}
					>
						<Typography
							variant="caption"
							fontWeight={800}
							color="#64748b"
							sx={{ width: '28%', minWidth: 180, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}
						>
							Date & Time
						</Typography>
						<Typography
							variant="caption"
							fontWeight={800}
							color="#64748b"
							sx={{ width: '26%', minWidth: 160, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}
						>
							{doctorId ? 'Patient' : 'Doctor & Hospital'}
						</Typography>
						<Typography
							variant="caption"
							fontWeight={800}
							color="#64748b"
							sx={{ width: '12%', minWidth: 80, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}
						>
							Fee
						</Typography>
						<Typography
							variant="caption"
							fontWeight={800}
							color="#64748b"
							sx={{ width: '14%', minWidth: 90, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}
						>
							Status
						</Typography>
						<Typography
							variant="caption"
							fontWeight={800}
							color="#64748b"
							sx={{ width: '20%', minWidth: 120, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', textAlign: 'right' }}
						>
							Actions
						</Typography>
					</Stack>

					{/* Appointment rows */}
					{rows.map((row) => {
						const isBusy = actionLoadingId === (row.id || row.public_id)
						const flags = row.action
						return (
							<Stack
								key={row.id}
								direction="row"
								alignItems="center"
								sx={{
									px: 2.5,
									py: 1.75,
									borderBottom: '1px solid #f1f5f9',
									transition: 'background 0.15s ease',
									'&:hover': { bgcolor: '#f8fafc' },
								}}
							>
								{/* Date & Time */}
								<Box sx={{ width: '28%', minWidth: 180 }}>
									<Typography variant="body2" fontWeight={700} color="#0f172a">
										{formatDate(row.appointment_date)}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{formatTime(row.start_time)}
									</Typography>
								</Box>

								{/* Doctor */}
								<Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '26%', minWidth: 160 }}>
									<Avatar sx={{ bgcolor: 'rgba(13,148,136,0.12)', color: '#0d9488', width: 34, height: 34, fontSize: 12, fontWeight: 800 }}>
										{(doctorId ? (row.patient_name || 'P') : (row.doctor_name || 'D')).substring(0, 1).toUpperCase()}
									</Avatar>
									<Box sx={{ minWidth: 0 }}>
										<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
											{doctorId ? (row.patient_name || 'N/A') : `Dr. ${row.doctor_name || 'N/A'}`}
										</Typography>
										<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
											{doctorId
												? `${row.hospital_name || 'Clinic'}${row.doctor_speciality ? ` • ${row.doctor_speciality}` : ''}`
												: (row.hospital_name || 'Clinic')}
										</Typography>
									</Box>
								</Stack>
								{/* Fee */}
								<Box sx={{ width: '12%', minWidth: 80 }}>
									<Typography variant="body2" fontWeight={700} color="#0d9488">
										{row.fees != null ? formatINR(row.fees) : '—'}
									</Typography>
								</Box>

								{/* Status */}
								<Box sx={{ width: '14%', minWidth: 90 }}>
									<StatusBadge status={row.status || 'pending'} label={(row.status || 'PENDING').toUpperCase()} />
								</Box>

								{/* Actions */}
								<Stack direction="row" spacing={0.75} justifyContent="flex-end" alignItems="center" sx={{ width: '20%', minWidth: 120 }}>

									{flags?.can_reschedule && (
										<Tooltip title="Reschedule">
											<span>
												<IconButton
													size="small"
													disabled={isBusy}
													onClick={() => handleOpenReschedule(row)}
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
									)}
									{flags?.can_cancel && (
										<Tooltip title="Cancel">
											<span>
												<IconButton
													size="small"
													disabled={isBusy}
													onClick={() => handleRequestCancel(row)}
													sx={{
														border: '1px solid #fecaca',
														borderRadius: 1.5,
														color: '#dc2626',
														bgcolor: '#fff1f2',
														p: 0.75,
														'&:hover': { bgcolor: '#fee2e2' },
													}}
												>
													<CancelIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</span>
										</Tooltip>
									)}
									{flags?.can_refund && (
										<Tooltip title="Refund">
											<span>
												<IconButton
													size="small"
													disabled={isBusy}
													onClick={() => handleRequestRefund(row)}
													sx={{
														border: '1px solid #e9d5ff',
														borderRadius: 1.5,
														color: '#7e22ce',
														bgcolor: '#f3e8ff',
														p: 0.75,
														'&:hover': { bgcolor: '#e9d5ff' },
													}}
												>
													<CurrencyRupeeIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</span>
										</Tooltip>
									)}
								</Stack>
							</Stack>
						)
					})}
				</Box>
			)}

			{total > 0 && (
				<Box sx={{ mt: 1 }}>
					<PaginationBar
						page={page}
						pageSize={pageSize}
						totalRows={total}
						pageSizeOptions={[10, 20,50]}
						onPageChange={setPage}
						onPageSizeChange={(size) => {
							setPageSize(size)
							setPage(1)
						}}
					/>
				</Box>
			)}



			{/* ── Reschedule Drawer (shared) ─────────────────────────────── */}
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
