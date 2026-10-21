// src/features/appointments/components/AppointmentDetailsDrawer.tsx
import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Avatar,
	Chip,
	Divider,
	Skeleton,
} from '@mui/material'
import {
	CalendarToday,
	AccessTime,
	LocalHospital,
	LocationOn,
	CurrencyRupee,
	Person,
	CheckCircleOutline,
	EventRepeat,
	CancelOutlined,
	PendingOutlined,
	FiberManualRecord,
	OpenInNew as OpenInNewIcon,
} from '@mui/icons-material'
import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import { getAppointmentById } from '../../../services/appointmentService'
import { Appointment, AppointmentHistoryEntry } from '../../../types/appointment'
import { buildS3Url } from '../../../utils/s3'

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(t: string | null | undefined): string {
	if (!t) return '—'
	const [h, m] = t.split(':')
	const hour = parseInt(h, 10)
	const ampm = hour >= 12 ? 'PM' : 'AM'
	const h12 = hour % 12 || 12
	return `${h12}:${m} ${ampm}`
}

function formatDate(d: string | null | undefined): string {
	if (!d) return '—'
	const date = new Date(d)
	if (isNaN(date.getTime())) return d
	return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(iso: string): string {
	const d = new Date(iso)
	if (isNaN(d.getTime())) return iso
	return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
		' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function capitalise(s: string): string {
	return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Safely convert a history slot value to a display string.
 * The backend can return:
 *   - null / undefined  → show nothing
 *   - a plain string    → use as-is
 *   - a slot object     → { appointment_date, start_time, end_time }
 *   - any other object  → JSON.stringify as a fallback
 */
function formatSlotValue(raw: unknown): string | null {
	if (raw === null || raw === undefined) return null
	if (typeof raw === 'string') return raw || null
	if (typeof raw === 'object') {
		const slot = raw as Record<string, string | null | undefined>
		const date = slot.appointment_date ?? slot.date ?? ''
		const start = slot.start_time ?? slot.startTime ?? ''
		const end = slot.end_time ?? slot.endTime ?? ''
		const parts: string[] = []
		if (date) parts.push(formatDate(date))
		if (start) parts.push(formatTime(start) + (end ? ' – ' + formatTime(end) : ''))
		return parts.length ? parts.join(', ') : JSON.stringify(raw)
	}
	return String(raw)
}

function getStatusChipSx(status: string) {
	const s = status.toLowerCase()
	if (s === 'confirmed') return { bgcolor: '#e8f5e9', color: '#2e7d32' }
	if (s === 'cancelled') return { bgcolor: '#ffebee', color: '#c62828' }
	if (s === 'completed') return { bgcolor: '#e3f2fd', color: '#1565c0' }
	if (s === 'rescheduled') return { bgcolor: '#fff8e1', color: '#e65100' }
	return { bgcolor: '#f3e5f5', color: '#6a1b9a' } // pending / other
}

// ── History icon per action ────────────────────────────────────────────────

function HistoryActionIcon({ action }: { action: string }) {
	const a = action.toLowerCase()
	const iconSx = { fontSize: 16 }
	if (a === 'created') return <CheckCircleOutline sx={{ ...iconSx, color: '#43a047' }} />
	if (a === 'rescheduled') return <EventRepeat sx={{ ...iconSx, color: '#fb8c00' }} />
	if (a === 'cancelled') return <CancelOutlined sx={{ ...iconSx, color: '#e53935' }} />
	if (a === 'confirmed') return <CheckCircleOutline sx={{ ...iconSx, color: '#1e88e5' }} />
	return <PendingOutlined sx={{ ...iconSx, color: '#8e24aa' }} />
}

// ── Sub-components ─────────────────────────────────────────────────────────

function InfoRow({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode
	label: string
	value: React.ReactNode
}) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.6 }}>
			<Box sx={{ mt: 0.2, color: 'text.secondary', flexShrink: 0 }}>{icon}</Box>
			<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.1 }}>
				<Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
					{label}
				</Typography>
				<Typography fontSize={13} fontWeight={500} color="text.primary">
					{value}
				</Typography>
			</Box>
		</Box>
	)
}

function HistoryTimeline({ entries }: { entries: AppointmentHistoryEntry[] }) {
	if (!entries.length) {
		return (
			<Typography fontSize={13} color="text.secondary" sx={{ mt: 1 }}>
				No history available.
			</Typography>
		)
	}

	return (
		<Box sx={{ mt: 0.5 }}>
			{entries.map((entry, idx) => {
				const fromStr = formatSlotValue(entry.old_value)
				const toStr = formatSlotValue(entry.new_value)
				return (
				<Box
					key={idx}
					sx={{
						display: 'flex',
						gap: 1.5,
						position: 'relative',
						pb: idx < entries.length - 1 ? 2 : 0,
					}}
				>
					{/* Vertical line connector */}
					{idx < entries.length - 1 && (
						<Box
							sx={{
								position: 'absolute',
								left: 7.5,
								top: 20,
								bottom: 0,
								width: '1px',
								bgcolor: 'divider',
							}}
						/>
					)}

					{/* Icon bubble */}
					<Box
						sx={{
							width: 16,
							height: 16,
							mt: 0.2,
							flexShrink: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 1,
						}}
					>
						<HistoryActionIcon action={entry.action} />
					</Box>

					{/* Content */}
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
							<Typography fontSize={13} fontWeight={600} color="text.primary">
								{capitalise(entry.action)}
							</Typography>
							<Chip
								label={capitalise(entry.actor_type)}
								size="small"
								sx={{
									height: 18,
									fontSize: 10,
									fontWeight: 600,
									bgcolor: entry.actor_type === 'doctor' ? '#e3f2fd' : '#fce4ec',
									color: entry.actor_type === 'doctor' ? '#1565c0' : '#880e4f',
									'& .MuiChip-label': { px: 1 },
								}}
							/>
						</Box>

						<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
							{formatDateTime(entry.created_at)}
						</Typography>

						{/* Skip From/To card for status-only changes (confirmed, cancelled) */}
						{(fromStr || toStr) && entry.action.toLowerCase() !== 'confirmed' && entry.action.toLowerCase() !== 'cancelled' && (
							<Box
								sx={{
									mt: 0.75,
									p: 1,
									bgcolor: 'action.hover',
									borderRadius: '8px',
									borderLeft: '3px solid',
									borderColor: 'divider',
								}}
							>
								{fromStr && (
									<Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
										<FiberManualRecord sx={{ fontSize: 6, mt: 0.7, color: 'text.disabled', flexShrink: 0 }} />
										<Typography variant="caption" color="text.secondary">
											<strong>From:</strong> {fromStr}
										</Typography>
									</Box>
								)}
								{toStr && (
									<Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start', mt: 0.3 }}>
										<FiberManualRecord sx={{ fontSize: 6, mt: 0.7, color: 'text.disabled', flexShrink: 0 }} />
										<Typography variant="caption" color="text.secondary">
											<strong>To:</strong> {toStr}
										</Typography>
									</Box>
								)}
							</Box>
						)}

						{entry.reason && (
							<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
								Reason: {entry.reason}
							</Typography>
						)}
					</Box>
				</Box>
				)
			})}
		</Box>
	)
}

function DrawerSkeleton() {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
				<Skeleton variant="circular" width={48} height={48} />
				<Box sx={{ flex: 1 }}>
					<Skeleton variant="text" width="60%" height={20} />
					<Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
				</Box>
			</Box>
			<Divider />
			{Array.from({ length: 5 }).map((_, i) => (
				<Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
					<Skeleton variant="circular" width={18} height={18} />
					<Box sx={{ flex: 1 }}>
						<Skeleton variant="text" width="30%" height={14} />
						<Skeleton variant="text" width="55%" height={18} sx={{ mt: 0.3 }} />
					</Box>
				</Box>
			))}
			<Divider />
			<Skeleton variant="text" width="40%" height={20} />
			{Array.from({ length: 3 }).map((_, i) => (
				<Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
					<Skeleton variant="circular" width={16} height={16} sx={{ mt: 0.5 }} />
					<Box sx={{ flex: 1 }}>
						<Skeleton variant="text" width="50%" height={16} />
						<Skeleton variant="text" width="70%" height={14} sx={{ mt: 0.3 }} />
					</Box>
				</Box>
			))}
		</Box>
	)
}

// ── Main component ─────────────────────────────────────────────────────────

interface Props {
	open: boolean
	onClose: () => void
	appointmentId: string | null
}

export default function AppointmentDetailsDrawer({ open, onClose, appointmentId }: Props) {
	const [appt, setAppt] = useState<Appointment | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open || !appointmentId) {
			setAppt(null)
			setError(null)
			return
		}
		let cancelled = false
		setLoading(true)
		setError(null)
		setAppt(null)

		getAppointmentById(appointmentId)
			.then((data) => {
				if (!cancelled) setAppt(data)
			})
			.catch(() => {
				if (!cancelled) setError('Failed to load appointment details. Please try again.')
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [open, appointmentId])

	const rawStatus =
		appt
			? typeof appt.status === 'string'
				? appt.status
				: (appt.status as { label: string }).label
			: ''

	const bookingLabel = appt?.booking_id || appt?.public_id || '—'

	return (
		<AppDrawer
			open={open}
			onClose={onClose}
			title="Appointment Details"
			confirmLabel="Close"
			cancelLabel=""
			onConfirm={onClose}
			width={460}
		>
			{loading && <DrawerSkeleton />}

			{error && !loading && (
				<Box sx={{ textAlign: 'center', py: 6 }}>
					<Typography color="error" fontSize={14} fontWeight={500}>
						{error}
					</Typography>
				</Box>
			)}

			{appt && !loading && (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
					{/* ── Doctor header ─────────────────────────────────── */}
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
							pb: 2,
							borderBottom: '1px solid',
							borderColor: 'divider',
						}}
					>
						<Avatar
							src={appt.doctor?.avatar_s3_key ?? undefined}
							alt={appt.doctor?.name}
							sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: 18, fontWeight: 700 }}
						>
							{appt.doctor?.name?.charAt(0) ?? 'D'}
						</Avatar>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
								<Typography fontWeight={700} fontSize={15} color="text.primary">
									{appt.doctor?.name ?? '—'}
								</Typography>
								<Chip
									label={capitalise(rawStatus)}
									size="small"
									sx={{
										height: 20,
										fontSize: 11,
										fontWeight: 700,
										...getStatusChipSx(rawStatus),
										'& .MuiChip-label': { px: 1.2 },
									}}
								/>
							</Box>
							{(appt.doctor?.specialty || appt.doctor?.specialization) && (
								<Typography variant="caption" color="text.secondary" sx={{ mt: 0.2, display: 'block' }}>
									{appt.doctor?.specialty ?? appt.doctor?.specialization}
								</Typography>
							)}
						</Box>
					</Box>

					{/* ── Appointment info ───────────────────────────────── */}
					<Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 0 }}>
						<InfoRow
							icon={<CalendarToday sx={{ fontSize: 16 }} />}
							label="Date"
							value={formatDate(appt.appointment_date)}
						/>
						<InfoRow
							icon={<AccessTime sx={{ fontSize: 16 }} />}
							label="Time"
							value={
								`${formatTime(appt.start_time)}${appt.end_time ? ' – ' + formatTime(appt.end_time) : ''}`
							}
						/>
						<InfoRow
							icon={<LocalHospital sx={{ fontSize: 16 }} />}
							label="Mode"
							value={capitalise(appt.appointment_mode)}
						/>
						{appt.hospital && (
							<InfoRow
								icon={<LocationOn sx={{ fontSize: 16 }} />}
								label="Hospital"
								value={
									<>
										{appt.hospital.name}
										{appt.hospital.address && (
											<Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
												{appt.hospital.address}
											</Typography>
										)}
										{(appt.hospital.address || appt.hospital.name) && (
											<Typography
												component="a"
												href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
													(appt.hospital.address ? appt.hospital.address + ', ' : '') + appt.hospital.name
												)}`}
												target="_blank"
												rel="noopener noreferrer"
												variant="caption"
												sx={{
													display: 'inline-flex',
													alignItems: 'center',
													gap: 0.3,
													mt: 0.4,
													color: 'primary.main',
													textDecoration: 'none',
													fontWeight: 600,
													'&:hover': { textDecoration: 'underline' },
												}}
											>
												<OpenInNewIcon sx={{ fontSize: 11 }} />
												View on Map
											</Typography>
										)}
									</>
								}
							/>
						)}
						<InfoRow
							icon={<CurrencyRupee sx={{ fontSize: 16 }} />}
							label="Consultation Fee"
							value={appt.fees != null ? `₹${appt.fees}` : '—'}
						/>
						{appt.patient && (
							<InfoRow
								icon={<Person sx={{ fontSize: 16 }} />}
								label="Patient"
								value={
									`${appt.patient.name}` +
									(appt.patient.gender ? ` · ${capitalise(appt.patient.gender)}` : '') +
									(appt.patient.age ? `, ${appt.patient.age} yrs` : '')
								}
							/>
						)}
					</Box>

					<Divider />

					{/* ── History timeline ───────────────────────────────── */}
					<Box sx={{ pt: 2 }}>
						<Typography fontWeight={700} fontSize={14} color="text.primary" sx={{ mb: 1.5 }}>
							Appointment History
						</Typography>
						<HistoryTimeline entries={appt.history ?? []} />
					</Box>
				</Box>
			)}
		</AppDrawer>
	)
}
