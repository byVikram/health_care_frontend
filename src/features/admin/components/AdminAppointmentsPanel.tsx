// src/features/admin/components/AdminAppointmentsPanel.tsx

import { useEffect, useState, useCallback } from 'react'
import { Box, Chip, Stack, Typography, IconButton, Tooltip } from '@mui/material'
import CancelIcon from '@mui/icons-material/Cancel'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import { toast } from 'react-toastify'

import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'
import AppModal from '../../../components/common/Modal/AppModal'
import AppDatePicker from '../../../components/common/DatePicker/AppDatePicker'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import PaginationBar from '../../../pagination/Pagination'
import {
	listAdminAppointments,
	cancelAdminAppointment,
	rescheduleAdminAppointment,
	refundAppointment,
	AdminAppointmentItem,
	AdminReschedulePayload,
} from '../adminService'
import { formatINR } from '../../../utils/Utils'
import RescheduleIcon from '../../../assets/icons/reschedule.svg'

/* ────────────────────────────────────────────────────────────────────────────
 *  Props
 * ──────────────────────────────────────────────────────────────────────────── */

interface AdminAppointmentsPanelProps {
	/** When set, only shows appointments for this patient. */
	patientId?: string
	/** When set, only shows appointments for this doctor. */
	doctorId?: string
	/** Custom message shown when there are no results. */
	emptyMessage?: string
}

const getErrorMessage = (err: unknown, fallback: string) =>
	err instanceof Error ? err.message : fallback

/* ────────────────────────────────────────────────────────────────────────────
 *  Component
 * ──────────────────────────────────────────────────────────────────────────── */

export default function AdminAppointmentsPanel({
	patientId,
	doctorId,
	emptyMessage = 'No appointments found.',
}: AdminAppointmentsPanelProps) {
	// ── list state ──────────────────────────────────────────────────────────
	const [rows, setRows] = useState<AdminAppointmentItem[]>([])
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [search, setSearch] = useState('')
	const [loading, setLoading] = useState(false)

	// ── action state ────────────────────────────────────────────────────────
	const [actionLoading, setActionLoading] = useState(false)

	// cancel
	const [cancelTarget, setCancelTarget] = useState<AdminAppointmentItem | null>(null)

	// refund
	const [refundTarget, setRefundTarget] = useState<AdminAppointmentItem | null>(null)

	// reschedule
	const [rescheduleTarget, setRescheduleTarget] = useState<AdminAppointmentItem | null>(null)
	const [rescheduleDate, setRescheduleDate] = useState<string | null>(null)
	const [rescheduleTime, setRescheduleTime] = useState('')
	const [rescheduleReason, setRescheduleReason] = useState('')

	// Is the panel scoped to a specific user?
	const isScoped = Boolean(patientId || doctorId)

	// ── fetch ───────────────────────────────────────────────────────────────
	const fetchAppointments = useCallback(async () => {
		setLoading(true)
		try {
			const res = await listAdminAppointments({
				page,
				pageSize,
				search: search || undefined,
				patientId,
				doctorId,
			})
			if (res.success && res.data) {
				setRows(res.data.items)
				setTotal(res.data.total)
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to load appointments.'))
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, search, patientId, doctorId])

	useEffect(() => {
		fetchAppointments()
	}, [fetchAppointments])

	// reset to page 1 when filters change
	useEffect(() => {
		setPage(1)
	}, [search, patientId, doctorId])

	// ── cancel handler ──────────────────────────────────────────────────────
	const handleConfirmCancel = async () => {
		if (!cancelTarget) return
		setActionLoading(true)
		try {
			const res = await cancelAdminAppointment(cancelTarget.id)
			if (res.success) {
				toast.success('Appointment cancelled successfully.')
				setCancelTarget(null)
				fetchAppointments()
			} else {
				toast.error(res.message || 'Cancel failed.')
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Cancel failed.'))
		} finally {
			setActionLoading(false)
		}
	}

	// ── refund handler ──────────────────────────────────────────────────────
	const handleConfirmRefund = async () => {
		if (!refundTarget) return
		setActionLoading(true)
		try {
			const res = await refundAppointment(refundTarget.id)
			if (res.success) {
				toast.success('Refund processed successfully.')
				setRefundTarget(null)
				fetchAppointments()
			} else {
				toast.error(res.message || 'Refund failed.')
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Refund failed.'))
		} finally {
			setActionLoading(false)
		}
	}

	// ── reschedule handler ──────────────────────────────────────────────────
	const handleConfirmReschedule = async () => {
		if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) {
			toast.error('Please select a date and time.')
			return
		}
		setActionLoading(true)
		try {
			const payload: AdminReschedulePayload = {
				appointment_date: rescheduleDate,
				start_time: rescheduleTime,
				reason: rescheduleReason || undefined,
			}
			const res = await rescheduleAdminAppointment(rescheduleTarget.id, payload)
			if (res.success) {
				toast.success('Appointment rescheduled successfully.')
				closeRescheduleModal()
				fetchAppointments()
			} else {
				toast.error(res.message || 'Reschedule failed.')
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Reschedule failed.'))
		} finally {
			setActionLoading(false)
		}
	}

	const openRescheduleModal = (row: AdminAppointmentItem) => {
		setRescheduleTarget(row)
		setRescheduleDate(row.appointment_date)
		setRescheduleTime(row.start_time)
		setRescheduleReason('')
	}

	const closeRescheduleModal = () => {
		setRescheduleTarget(null)
		setRescheduleDate(null)
		setRescheduleTime('')
		setRescheduleReason('')
	}

	// ── columns ─────────────────────────────────────────────────────────────
	const columns: Column<AdminAppointmentItem>[] = [
		{
			field: 'id',
			label: 'ID & Date/Time',
			render: (_val, row) => (
				<Box>
					<Typography variant="subtitle2" fontWeight={700}>
						{row.id}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{row.appointment_date} @ {row.start_time}
					</Typography>
				</Box>
			),
		},
		{
			field: 'patient_id',
			label: 'Patient & Doctor',
			render: (_val, row) => (
				<Box>
					<Typography variant="body2" fontWeight={600}>
						Patient: {row.patient_name || 'N/A'}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						ID: {row.patient_id || 'N/A'}
					</Typography>
					<Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
						Doctor: {row.doctor_name || 'N/A'}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						ID: {row.doctor_id || 'N/A'}
					</Typography>
				</Box>
			),
		},
		{
			field: 'fees',
			label: 'Consultation Fee',
			render: (_val, row) => (
				<Typography variant="body2" fontWeight={700} color="#0d9488">
					{row.fees != null ? formatINR(row.fees) : 'N/A'}
				</Typography>
			),
		},
		{
			field: 'status',
			label: 'Status',
			render: (_val, row) => {
				const label = (row.status || 'SCHEDULED').toUpperCase()
				return (
					<Chip
						label={label}
						size="small"
						color={row.status === 'cancelled' ? 'error' : row.status === 'completed' ? 'success' : 'primary'}
						sx={{ fontWeight: 700 }}
					/>
				)
			},
		},
		{
			field: 'action',
			label: 'Admin Overrides',
			render: (_val, row) => {
				const flags = row.action
				if (!flags) return null
				return (
					<Stack direction="row" spacing={0.5} alignItems="center">
						{flags.can_reschedule && (
							<Tooltip title="Reschedule">
								<IconButton
									size="small"
									onClick={(e) => {
										e.stopPropagation()
										openRescheduleModal(row)
									}}
									sx={{
										width: 36,
										height: 36,
										borderRadius: '10px',
										bgcolor: '#fff8e8',
										'&:hover': { bgcolor: '#fef3c7' },
									}}
								>
									<img src={RescheduleIcon} alt="Reschedule" width={18} height={18} />
								</IconButton>
							</Tooltip>
						)}
						{flags.can_cancel && (
							<Tooltip title="Cancel">
								<IconButton
									size="small"
									onClick={(e) => {
										e.stopPropagation()
										setCancelTarget(row)
									}}
									sx={{
										width: 36,
										height: 36,
										borderRadius: '10px',
										bgcolor: '#ffeeee',
										color: '#e53935',
										'&:hover': { bgcolor: '#fecaca' },
									}}
								>
									<CancelIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						)}
						{flags.can_refund && (
							<Tooltip title="Refund">
								<IconButton
									size="small"
									onClick={(e) => {
										e.stopPropagation()
										setRefundTarget(row)
									}}
									sx={{
										width: 36,
										height: 36,
										borderRadius: '10px',
										bgcolor: '#f3e8ff',
										color: '#7e22ce',
										'&:hover': { bgcolor: '#e9d5ff' },
									}}
								>
									<CurrencyRupeeIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						)}
					</Stack>
				)
			},
		},
	]

	// ── render ───────────────────────────────────────────────────────────────
	return (
		<Box>
			{/* Search bar — only when showing the global list */}
			{!isScoped && (
				<Box sx={{ mb: 2, maxWidth: 340 }}>
					<AppInput
						placeholder="Search by name or ID..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						enableVoiceSearch
						onVoiceResult={(text) => setSearch(text)}
						size="small"
					/>
				</Box>
			)}

			<AppTable<AdminAppointmentItem>
				columns={columns}
				rows={rows}
				loading={loading}
				emptyMessage={emptyMessage}
			/>

			{total > 0 && (
				<PaginationBar
					page={page}
					pageSize={pageSize}
					totalRows={total}
					onPageChange={setPage}
					onPageSizeChange={(size) => {
						setPageSize(size)
						setPage(1)
					}}
				/>
			)}

			{/* ── Cancel confirmation ─────────────────────────────────────── */}
			<ConfirmModal
				open={Boolean(cancelTarget)}
				onClose={() => setCancelTarget(null)}
				onConfirm={handleConfirmCancel}
				variant="warning"
				title="Cancel Appointment"
				description={
					cancelTarget
						? `Are you sure you want to cancel the appointment for ${cancelTarget.patient_name || 'this patient'} with ${cancelTarget.doctor_name || 'this doctor'} on ${cancelTarget.appointment_date}?`
						: ''
				}
				confirmLabel="Cancel Appointment"
				loading={actionLoading}
			/>

			{/* ── Refund confirmation ─────────────────────────────────────── */}
			<ConfirmModal
				open={Boolean(refundTarget)}
				onClose={() => setRefundTarget(null)}
				onConfirm={handleConfirmRefund}
				variant="confirm"
				title="Process Refund"
				description={
					refundTarget
						? `Process a refund for ${refundTarget.patient_name || 'this patient'}'s appointment${refundTarget.fees != null ? ` (₹${refundTarget.fees})` : ''}?`
						: ''
				}
				confirmLabel="Confirm Refund"
				loading={actionLoading}
			/>

			{/* ── Reschedule modal ────────────────────────────────────────── */}
			<AppModal
				open={Boolean(rescheduleTarget)}
				onClose={closeRescheduleModal}
				title="Reschedule Appointment"
				maxWidth="xs"
				fullWidth
				actions={
					<>
						<AppButton
							label="Cancel"
							variant="outlined"
							onClick={closeRescheduleModal}
						/>
						<AppButton
							label="Reschedule"
							loading={actionLoading}
							onClick={handleConfirmReschedule}
						/>
					</>
				}
			>
				<Stack spacing={2.5} sx={{ pt: 1 }}>
					{rescheduleTarget && (
						<Typography variant="body2" color="text.secondary">
							Current: {rescheduleTarget.appointment_date} at{' '}
							{rescheduleTarget.start_time}
						</Typography>
					)}

					<AppDatePicker
						label="New Date"
						value={rescheduleDate}
						onChange={setRescheduleDate}
						disablePast
						size="small"
						fullWidth
					/>

					<AppInput
						label="New Time"
						placeholder="e.g. 09:30"
						value={rescheduleTime}
						onChange={(e) => setRescheduleTime(e.target.value)}
						size="small"
					/>

					<AppInput
						label="Reason (optional)"
						placeholder="Reason for rescheduling..."
						value={rescheduleReason}
						onChange={(e) => setRescheduleReason(e.target.value)}
						size="small"
					/>
				</Stack>
			</AppModal>
		</Box>
	)
}
