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
	TextField,
	InputAdornment,
	Avatar,
} from '@mui/material'
import CancelIcon from '@mui/icons-material/Cancel'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import SearchIcon from '@mui/icons-material/Search'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppButton from '../../../components/common/Button/AppButton'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import StatusBadge from '../../../components/admin/StatusBadge'
import RescheduleDrawer from '../../doctor/search/components/RescheduleDrawer'
import { SlotGroup } from '../../../components/common/DateSlotPicker/DateSlotPicker'
import { LookupHospital } from '../../../hooks/useAuth'
import { Appointment } from '../../../types/appointment'
import {
	listAdminAppointments,
	cancelAdminAppointment,
	rescheduleAdminAppointment,
	refundAppointment,
	AdminAppointmentItem,
} from '../adminService'
import { getDoctorAvailability, getDoctorById, getAvailabilityModeBlocks } from '../../doctor/doctorService'
import { formatINR } from '../../../utils/Utils'
import RescheduleIcon from '../../../assets/icons/reschedule.svg'

type DoctorHospitalResponse = {
	hospitals?: Array<{ hospital: { id: string; name: string } }>
}

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

export default function AdminAppointmentsPage() {
	// ── Table data ───────────────────────────────────────────────────────────
	const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

	// ── Pagination ────────────────────────────────────────────────────────────
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [totalRows, setTotalRows] = useState(0)

	// ── Search / filter ───────────────────────────────────────────────────────
	const [searchInput, setSearchInput] = useState('')
	const [searchQuery, setSearchQuery] = useState('')
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// ── Reschedule drawer state ───────────────────────────────────────────────
	const [rescheduleOpen, setRescheduleOpen] = useState(false)
	const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null)
	const [rescheduleDate, setRescheduleDate] = useState(new Date())
	const [rescheduleTime, setRescheduleTime] = useState('')
	const [rescheduleSlots, setRescheduleSlots] = useState<SlotGroup[]>([])
	const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false)
	const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
	const [rescheduleHospitals, setRescheduleHospitals] = useState<LookupHospital[]>([])
	const [rescheduleHospitalId, setRescheduleHospitalId] = useState<string>('')
	const [appointmentType, setAppointmentType] = useState<'clinic' | 'video'>('clinic')

	// ── Cancel confirmation dialog state ──────────────────────────────────────
	const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
	const [apptPendingCancel, setApptPendingCancel] = useState<AdminAppointmentItem | null>(null)

	// ── Fetch appointments ────────────────────────────────────────────────────
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

	// ── Debounced search ──────────────────────────────────────────────────────
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		setSearchInput(val)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			setPage(1)
			setSearchQuery(val.trim())
		}, 400)
	}

	// ── Admin actions ─────────────────────────────────────────────────────────
	const handleCancel = async (appt: AdminAppointmentItem) => {
		const publicId = appt.id || appt.public_id || ''
		setActionLoadingId(publicId)
		try {
			const res = await cancelAdminAppointment(publicId)
			if (res.success) {
				toast.success(`Appointment ${publicId} cancelled.`)
				fetchAppointments()
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to cancel appointment.'))
		} finally {
			setActionLoadingId(null)
		}
	}

	// ── Cancel confirmation flow ──────────────────────────────────────────────
	const handleRequestCancel = (appt: AdminAppointmentItem) => {
		setApptPendingCancel(appt)
		setCancelConfirmOpen(true)
	}

	const handleCloseCancelConfirm = () => {
		setCancelConfirmOpen(false)
		setApptPendingCancel(null)
	}

	const handleConfirmCancel = async () => {
		if (!apptPendingCancel) return
		const appt = apptPendingCancel
		setCancelConfirmOpen(false)
		setApptPendingCancel(null)
		await handleCancel(appt)
	}

	const handleRefund = async (appt: AdminAppointmentItem) => {
		const publicId = appt.id || appt.public_id || ''
		setActionLoadingId(publicId)
		try {
			const res = await refundAppointment(publicId)
			if (res.success) {
				toast.success(`Refund triggered for appointment ${publicId}.`)
				fetchAppointments()
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to refund appointment.'))
		} finally {
			setActionLoadingId(null)
		}
	}

	// ── Open reschedule drawer ────────────────────────────────────────────────
	const handleOpenReschedule = async (row: AdminAppointmentItem) => {
		const targetDocId = row.doctor_id || ''
		const targetHospitalId = row.hospital_id || ''

		const apptObject: Appointment = {
			id: row.id,
			public_id: row.public_id || row.id,
			appointment_mode: 'clinic visit',
			appointment_date: row.appointment_date,
			start_time: row.start_time,
			end_time: row.start_time,
			fees: row.fees || 0,
			created_at: new Date().toISOString(),
			status: (row.status as Appointment['status']) || 'scheduled',
			doctor: {
				id: targetDocId,
				name: row.doctor_name || 'Doctor',
				avatar_s3_key: undefined,
				speciality: 'General',
			},
			patient: row.patient_id ? { id: row.patient_id, name: row.patient_name || '', avatar_s3_key: null, age: 0, gender: '' } : null,
			hospital: targetHospitalId ? { id: targetHospitalId, name: row.hospital_name || '', address: '' } : null,
		}

		setRescheduleAppt(apptObject)
		setRescheduleDate(new Date(row.appointment_date || Date.now()))
		setRescheduleTime('')
		setRescheduleSlots([])
		setRescheduleHospitalId(targetHospitalId)
		setRescheduleHospitals([])
		setRescheduleOpen(true)

		if (targetDocId) {
			try {
				const docRes = (await getDoctorById(targetDocId)) as DoctorHospitalResponse
				if (docRes?.hospitals?.length) {
					const mapped: LookupHospital[] = docRes.hospitals.map((h) => ({
						id: h.hospital.id,
						label: h.hospital.name,
					}))
					setRescheduleHospitals(mapped)
				}
			} catch {
				setRescheduleHospitals([])
			}
		}
	}

	// ── Fetch slots when reschedule date/hospital changes ──────────────────────
	useEffect(() => {
		if (!rescheduleOpen || !rescheduleAppt?.doctor?.id) return

		const doctorId = rescheduleAppt.doctor.id
		const hospitalId = rescheduleHospitalId || rescheduleAppt.hospital?.id

		if (!doctorId || !hospitalId) return

		const dateStr = rescheduleDate.toISOString().split('T')[0]

		const fetchSlots = async () => {
			setRescheduleSlotsLoading(true)
			setRescheduleSlots([])
			setRescheduleTime('')
			try {
				const responseData = await getDoctorAvailability({
					doctor_id: doctorId,
					hospital_id: hospitalId,
					date: dateStr,
				})
				const selectedTypeMode = appointmentType === 'clinic' ? 'clinic_visit' : 'video_call'
				const selectedModeData = getAvailabilityModeBlocks(responseData).find(
					(item) => item.appointment_mode === selectedTypeMode
				)

				const processedData = selectedModeData?.sessions || []
				setRescheduleSlots(processedData)
			} catch {
				toast.error('Could not load available slots.')
			} finally {
				setRescheduleSlotsLoading(false)
			}
		}

		fetchSlots()
	}, [rescheduleDate, rescheduleOpen, rescheduleAppt, rescheduleHospitalId, appointmentType])

	// ── Submit reschedule ─────────────────────────────────────────────────────
	const handleRescheduleConfirm = async () => {
		if (!rescheduleAppt || !rescheduleTime) {
			toast.warning('Please select a time slot before confirming.')
			return
		}
		setRescheduleSubmitting(true)
		try {
			const dateStr = rescheduleDate.toISOString().split('T')[0]
			const res = await rescheduleAdminAppointment(rescheduleAppt.id, {
				appointment_date: dateStr,
				start_time: rescheduleTime,
				hospital_id: rescheduleHospitalId || rescheduleAppt.hospital?.id,
				reason: 'Admin rescheduled',
			})
			if (res.success) {
				toast.success('Appointment rescheduled successfully.')
				setRescheduleOpen(false)
				fetchAppointments()
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to reschedule appointment.'))
		} finally {
			setRescheduleSubmitting(false)
		}
	}

	// ── Table columns ─────────────────────────────────────────────────────────
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
									onClick={() => handleRefund(row)}
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
			/>

			<Box sx={{ mb: 2.5, maxWidth: 360 }}>
				<TextField
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

			{/* Cancel Dialog */}
			<Dialog open={cancelConfirmOpen} onClose={handleCloseCancelConfirm} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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
		</Box>
	)
}
