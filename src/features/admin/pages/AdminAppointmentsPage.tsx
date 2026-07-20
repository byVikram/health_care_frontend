// src/features/admin/pages/AdminAppointmentsPage.tsx
import { useEffect, useState, useCallback } from 'react'
import {
	Box,
	Typography,
	Chip,
	Stack,
	CircularProgress,
	Alert,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material'
import EventRepeatIcon from '@mui/icons-material/EventRepeat'
import CancelIcon from '@mui/icons-material/Cancel'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable from '../../../components/common/Table/AppTable'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import AppDatePicker from '../../../components/common/DatePicker/AppDatePicker'
import AppModal from '../../../components/common/Modal/AppModal'
import {
	listAdminAppointments,
	cancelAdminAppointment,
	rescheduleAdminAppointment,
	refundAppointment,
	AdminAppointmentItem,
} from '../adminService'
import { formatINR } from '../../../utils/Utils'

export default function AdminAppointmentsPage() {
	const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

	// Reschedule Modal State
	const [selectedAppt, setSelectedAppt] = useState<AdminAppointmentItem | null>(null)
	const [newDate, setNewDate] = useState<string | null>(null)
	const [newTime, setNewTime] = useState('')
	const [rescheduleReason, setRescheduleReason] = useState('')
	const [submittingReschedule, setSubmittingReschedule] = useState(false)

	const fetchAppointments = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await listAdminAppointments()
			if (res.success) {
				setAppointments(res.data || [])
			}
		} catch (err: any) {
			setError(err?.message || 'Failed to fetch appointments list')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchAppointments()
	}, [fetchAppointments])

	const handleCancel = async (appt: AdminAppointmentItem) => {
		const publicId = appt.id || appt.public_id || ''
		setActionLoadingId(publicId)
		try {
			const res = await cancelAdminAppointment(publicId)
			if (res.success) {
				toast.success(`Appointment ${publicId} cancelled.`)
				fetchAppointments()
			}
		} catch (err: any) {
			toast.error(err?.message || 'Failed to cancel appointment.')
		} finally {
			setActionLoadingId(null)
		}
	}

	const handleRefund = async (appt: AdminAppointmentItem) => {
		const publicId = appt.id || appt.public_id || ''
		setActionLoadingId(publicId)
		try {
			const res = await refundAppointment(publicId)
			if (res.success) {
				toast.success(`Refund processed for appointment ${publicId}.`)
				fetchAppointments()
			}
		} catch (err: any) {
			toast.error(err?.message || 'Failed to process refund.')
		} finally {
			setActionLoadingId(null)
		}
	}

	const handleRescheduleSubmit = async () => {
		if (!selectedAppt || !newDate || !newTime) {
			toast.error('Please specify both new date and time slot.')
			return
		}
		const publicId = selectedAppt.id || selectedAppt.public_id || ''
		setSubmittingReschedule(true)
		try {
			const res = await rescheduleAdminAppointment(publicId, {
				appointment_date: newDate,
				start_time: newTime,
				reason: rescheduleReason.trim() || undefined,
			})
			if (res.success) {
				toast.success('Appointment rescheduled successfully.')
				setSelectedAppt(null)
				setNewDate(null)
				setNewTime('')
				setRescheduleReason('')
				fetchAppointments()
			}
		} catch (err: any) {
			toast.error(err?.message || 'Failed to reschedule appointment.')
		} finally {
			setSubmittingReschedule(false)
		}
	}

	const columns = [
		{
			field: 'id',
			label: 'ID & Date/Time',
			render: (_: any, row: AdminAppointmentItem) => (
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
			label: 'Patient & Doctor IDs',
			render: (_: any, row: AdminAppointmentItem) => (
				<Box>
					<Typography variant="body2" fontWeight={600}>
						Patient ID: {row.patient_id || 'N/A'}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Doctor ID: {row.doctor_id || 'N/A'}
					</Typography>
				</Box>
			),
		},
		{
			field: 'fees',
			label: 'Consultation Fee',
			render: (_: any, row: AdminAppointmentItem) => (
				<Typography variant="body2" fontWeight={700} color="#0d9488">
					{row.fees != null ? formatINR(row.fees) : 'N/A'}
				</Typography>
			),
		},
		{
			field: 'status',
			label: 'Status',
			render: (_: any, row: AdminAppointmentItem) => (
				<Chip
					label={(row.status || 'SCHEDULED').toUpperCase()}
					size="small"
					color={row.status === 'cancelled' ? 'error' : row.status === 'completed' ? 'success' : 'primary'}
					sx={{ fontWeight: 700 }}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Admin Overrides',
			render: (_: any, row: AdminAppointmentItem) => {
				const isBusy = actionLoadingId === (row.id || String(row.id))
				const isCancelled = row.status === 'cancelled'
				return (
					<Stack direction="row" spacing={1}>
						<AppButton
							label="Reschedule"
							size="small"
							variant="outlined"
							startIcon={<EventRepeatIcon />}
							onClick={() => {
								setSelectedAppt(row)
								setNewDate(row.appointment_date)
								setNewTime(row.start_time)
							}}
							disabled={isBusy || isCancelled}
						/>

						<AppButton
							label="Cancel"
							size="small"
							color="error"
							startIcon={<CancelIcon />}
							onClick={() => handleCancel(row)}
							disabled={isBusy || isCancelled}
						/>

						<AppButton
							label="Refund"
							size="small"
							sx={{ bgcolor: '#7e22ce', color: '#ffffff', '&:hover': { bgcolor: '#6b21a8' } }}
							startIcon={<CurrencyRupeeIcon />}
							onClick={() => handleRefund(row)}
							disabled={isBusy}
						/>
					</Stack>
				)
			},
		},
	]

	return (
		<Box>
			<SectionCard title="Master Appointment Management & Overrides">
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					View all appointments, reschedule slots, override cancellations, or trigger manual refunds
				</Typography>
				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{loading ? (
					<Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
						<CircularProgress sx={{ color: '#0d9488' }} />
						<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
							Loading master appointments...
						</Typography>
					</Stack>
				) : (
					<AppTable columns={columns as any} rows={appointments as any} emptyMessage="No appointments found." />
				)}
			</SectionCard>

			{/* Reschedule Modal */}
			{selectedAppt && (
				<AppModal open={Boolean(selectedAppt)} onClose={() => setSelectedAppt(null)} maxWidth="xs">
					<DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
						Admin Reschedule Appointment
					</DialogTitle>
					<DialogContent sx={{ py: 3 }}>
						<Stack spacing={2.5}>
							<Typography variant="body2" color="text.secondary">
								Rescheduling appointment <strong>#{selectedAppt.id}</strong> (Patient ID: #{selectedAppt.patient_id || 'N/A'}, Doctor ID: #{selectedAppt.doctor_id || 'N/A'}).
							</Typography>

							<AppDatePicker
								label="New Appointment Date"
								value={newDate}
								onChange={(val) => setNewDate(val)}
								fullWidth
							/>

							<AppInput
								label="New Time Slot"
								placeholder="e.g. 10:30 AM or Morning"
								value={newTime}
								onChange={(e) => setNewTime(e.target.value)}
								fullWidth
							/>

							<AppInput
								label="Override Reason (Optional)"
								placeholder="Reason for administrative rescheduling..."
								value={rescheduleReason}
								onChange={(e) => setRescheduleReason(e.target.value)}
								multiline
								rows={2}
								fullWidth
							/>
						</Stack>
					</DialogContent>
					<DialogActions sx={{ px: 3, pb: 3 }}>
						<AppButton label="Cancel" variant="outlined" onClick={() => setSelectedAppt(null)} />
						<AppButton
							label="Confirm Reschedule"
							onClick={handleRescheduleSubmit}
							disabled={submittingReschedule}
							sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
						/>
					</DialogActions>
				</AppModal>
			)}
		</Box>
	)
}
