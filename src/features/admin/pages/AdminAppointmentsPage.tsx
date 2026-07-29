// src/features/admin/pages/AdminAppointmentsPage.tsx
import { useEffect, useState, useCallback, useRef } from 'react'
import {
	Box,
	Typography,
	Chip,
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
} from '@mui/material'
import CancelIcon from '@mui/icons-material/Cancel'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import PaginationBar from '../../../pagination/Pagination'
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

	// ── Reschedule drawer state (matches Patient/Doctor pattern) ─────────────
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
				toast.success(`Refund processed for appointment ${publicId}.`)
				fetchAppointments()
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to process refund.'))
		} finally {
			setActionLoadingId(null)
		}
	}

	// ── Open reschedule drawer (same pattern as Patient/Doctor pages) ────────
	const handleOpenReschedule = (appt: AdminAppointmentItem) => {
		// Build a minimal Appointment shape so the shared RescheduleDrawer can consume it
		const apptShim: Appointment = {
			id: appt.id,
			public_id: appt.public_id || appt.id,
			appointment_mode: 'clinic visit',
			appointment_date: appt.appointment_date,
			start_time: appt.start_time,
			end_time: '',
			fees: appt.fees ?? 0,
			created_at: '',
			status: appt.status,
			doctor: {
				id: appt.doctor_id || '',
				name: appt.doctor_name || '',
				avatar_s3_key: undefined,
			},
			patient: {
				id: appt.patient_id || '',
				name: appt.patient_name || '',
				avatar_s3_key: null,
				age: 0,
				gender: '',
			},
			hospital: appt.hospital_id
				? { id: appt.hospital_id, name: appt.hospital_name || '', address: '' }
				: null,
		}

		setRescheduleAppt(apptShim)
		setRescheduleHospitalId(apptShim.hospital?.id ?? '')
		setRescheduleDate(new Date())
		setRescheduleTime('')
		setRescheduleSlots([])
		setRescheduleHospitals([])
		setRescheduleOpen(true)
	}

	// ── Fetch doctor hospitals when drawer opens (same as PatientAppointments) ──
	useEffect(() => {
		if (!rescheduleAppt || !rescheduleOpen) return

		const fetchDoctorHospitals = async () => {
			if (rescheduleAppt.doctor?.id) {
				try {
					const res = await getDoctorById(rescheduleAppt.doctor.id)
					if (res.success && res.data) {
						const doctorData = res.data as DoctorHospitalResponse
						setRescheduleHospitals(
							(doctorData.hospitals || []).map((h) => ({ id: h.hospital.id, label: h.hospital.name }))
						)
					}
				} catch {
					console.log('Failed to fetch doctor hospitals')
				}
			}
		}

		fetchDoctorHospitals()
	}, [rescheduleAppt, rescheduleOpen])

	// ── Fetch available slots (same pattern as Patient/Doctor pages) ─────────
	useEffect(() => {
		if (!rescheduleOpen || !rescheduleAppt) return

		const doctorId = rescheduleAppt.doctor?.id
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

	// ── Submit reschedule (uses admin endpoint) ──────────────────────────────
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
			label: 'ID & Date/Time',
			render: (_: unknown, row: AdminAppointmentItem) => (
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
			render: (_: unknown, row: AdminAppointmentItem) => (
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
			render: (_: unknown, row: AdminAppointmentItem) => (
				<Typography variant="body2" fontWeight={700} color="#0d9488">
					{row.fees != null ? formatINR(row.fees) : 'N/A'}
				</Typography>
			),
		},
		{
			field: 'status',
			label: 'Status',
			render: (_: unknown, row: AdminAppointmentItem) => (
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
			render: (_: unknown, row: AdminAppointmentItem) => {
				const isBusy = actionLoadingId === (row.id || String(row.id))
				return (
					<Stack direction="row" spacing={0.5} alignItems="center">
						{/* Reschedule — reuses the shared SVG icon from Patient/Doctor pages */}
						<Tooltip title="Reschedule">
							<IconButton
								size="small"
								onClick={() => handleOpenReschedule(row)}
								disabled={isBusy || !row.action?.can_reschedule}
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

						{/* Cancel — reuses the MUI CancelIcon consistent with the app */}
						<Tooltip title="Cancel">
							<IconButton
								size="small"
								onClick={() => handleRequestCancel(row)}
								disabled={isBusy || !row.action?.can_cancel}
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

						{/* Refund */}
						<Tooltip title="Refund">
							<IconButton
								size="small"
								onClick={() => handleRefund(row)}
								disabled={isBusy || !row.action?.can_refund}
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
					</Stack>
				)
			},
		},
	]

	// ── Render ─────────────────────────────────────────────────────────────────
	return (
		<Box>
			<SectionCard title="Master Appointment Management & Overrides">
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					View all appointments, reschedule slots, override cancellations, or trigger manual refunds
				</Typography>

				{/* Search input */}
				<Box sx={{ mb: 2, maxWidth: 400 }}>
					<AppInput
						label=""
						placeholder="Search by patient name, doctor name, or ID..."
						value={searchInput}
						onChange={handleSearchChange}
						fullWidth
						size="small"
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
							Loading master appointments...
						</Typography>
					</Stack>
				) : (
					<>
						<AppTable columns={columns} rows={appointments} emptyMessage="No appointments found." />
						<Box sx={{ mt: 2 }}>
							<PaginationBar
								page={page}
								pageSize={pageSize}
								totalRows={totalRows}
								onPageChange={(p) => setPage(p)}
								onPageSizeChange={(s) => {
									setPageSize(s)
									setPage(1)
								}}
							/>
						</Box>
					</>
				)}
			</SectionCard>

			{/* Reused shared RescheduleDrawer — same component used by Patient & Doctor pages */}
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
				sx={{ top: '54px', height: 'calc(100% - 52px)' }}
			/>

			{/* Cancel confirmation dialog */}
			<Dialog
				open={cancelConfirmOpen}
				onClose={handleCloseCancelConfirm}
				slotProps={{
					paper: {
						sx: { borderRadius: '16px', minWidth: 320 },
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Are You Sure?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This will cancel appointment {apptPendingCancel?.id || apptPendingCancel?.public_id}. This action
						cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
					<AppButton
						label="Cancel"
						variant="outlined"
						startIcon={<CancelIcon fontSize="small" />}
						onClick={handleCloseCancelConfirm}
						sx={{
							borderRadius: '20px',
							color: 'text.secondary',
							borderColor: 'divider',
							'&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
						}}
					/>
					<AppButton
						label="Yes"
						onClick={handleConfirmCancel}
						sx={{
							borderRadius: '20px',
							bgcolor: '#e53935',
							'&:hover': { bgcolor: '#c62828' },
						}}
					/>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
