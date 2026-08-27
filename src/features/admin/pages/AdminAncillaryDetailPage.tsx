// src/features/admin/pages/AdminAncillaryDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	Box,
	Typography,
	Chip,
	Stack,
	CircularProgress,
	Alert,
	Avatar,
	Grid,
	Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import BadgeIcon from '@mui/icons-material/Badge'
import SchoolIcon from '@mui/icons-material/School'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PaymentIcon from '@mui/icons-material/Payment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import CancelIcon from '@mui/icons-material/Cancel'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import StickyNote2Icon from '@mui/icons-material/StickyNote2'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

import { ROUTES } from '../../../constants/routes'
import AppButton from '../../../components/common/Button/AppButton'
import StatusBadge from '../../../components/admin/StatusBadge'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'

import {
	AdminAncillaryDetail,
	ANCILLARY_TERMINAL_STATUSES,
	getAdminAncillaryRequestDetail,
	cancelAdminAncillaryRequest,
	reassignAdminAncillaryRequest,
} from '../adminService'
import { formatINR } from '../../../utils/Utils'

function getErrorMessage(err: unknown, fallback: string = 'An error occurred'): string {
	if (err instanceof Error) return err.message
	if (typeof err === 'string') return err
	if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message)
	return fallback
}

function InfoTile({
	label,
	value,
	icon,
	highlight = false,
}: {
	label: string
	value?: string | number | null
	icon?: React.ReactNode
	highlight?: boolean
}) {
	return (
		<Box
			sx={{
				p: 1.25,
				bgcolor: highlight ? '#f0fdfa' : '#f8fafc',
				borderRadius: '8px',
				border: '1px solid',
				borderColor: highlight ? '#99f6e4' : '#e2e8f0',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
			}}
		>
			<Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.25 }}>
				{icon}
				<Typography
					variant="caption"
					color="#64748b"
					fontWeight={700}
					sx={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}
				>
					{label}
				</Typography>
			</Stack>
			<Typography
				variant="body2"
				fontWeight={800}
				color={highlight ? '#0f766e' : '#0f172a'}
				noWrap
				sx={{ fontSize: '12.5px' }}
			>
				{value || '—'}
			</Typography>
		</Box>
	)
}

export default function AdminAncillaryDetailPage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const [detail, setDetail] = useState<AdminAncillaryDetail | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)

	// Action modals
	const [showReassignModal, setShowReassignModal] = useState<boolean>(false)
	const [showCancelModal, setShowCancelModal] = useState<boolean>(false)
	const [actionLoading, setActionLoading] = useState<boolean>(false)

	const fetchDetail = useCallback(async () => {
		if (!id) return
		setLoading(true)
		setError(null)
		try {
			const res = await getAdminAncillaryRequestDetail(id)
			if (res.success && res.data) {
				setDetail(res.data)
			} else {
				setError('Unable to load service request details.')
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to fetch ancillary request details.'))
		} finally {
			setLoading(false)
		}
	}, [id])

	useEffect(() => {
		fetchDetail()
	}, [fetchDetail])

	const handleBack = () => navigate(ROUTES.ADMIN.ANCILLARY)

	const handleReassignConfirm = async () => {
		if (!detail) return
		setActionLoading(true)
		setError(null)
		try {
			const res = await reassignAdminAncillaryRequest(detail.public_id || detail.id)
			const nurseName = res.data?.providerName ? ` to ${res.data.providerName}` : ''
			setSuccessMsg(`Successfully reassigned care nurse${nurseName}.`)
			setShowReassignModal(false)
			await fetchDetail()
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to reassign care nurse.'))
		} finally {
			setActionLoading(false)
		}
	}

	const handleCancelConfirm = async () => {
		if (!detail) return
		setActionLoading(true)
		try {
			await cancelAdminAncillaryRequest(detail.public_id || detail.id, 'Cancelled by administrator from review view')
			setSuccessMsg(`Service request ${detail.public_id} successfully cancelled.`)
			setShowCancelModal(false)
			await fetchDetail()
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to cancel service request.'))
		} finally {
			setActionLoading(false)
		}
	}

	const isCancellable = detail && !(ANCILLARY_TERMINAL_STATUSES as string[]).includes(detail.status.toUpperCase())
	const isReassignable = detail && !(ANCILLARY_TERMINAL_STATUSES as string[]).includes(detail.status.toUpperCase())

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
			{/* SUCCESS & ERROR ALERTS */}
			{successMsg && (
				<Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 2, borderRadius: 2, fontWeight: 600 }}>
					{successMsg}
				</Alert>
			)}
			{error && (
				<Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2, fontWeight: 600 }}>
					{error}
				</Alert>
			)}

			{/* FLOATING TOP HEADER CARD (All Operational Actions Kept Exclusively Here) */}
			<Box
				sx={{
					bgcolor: '#ffffff',
					borderRadius: '12px',
					border: '1px solid #e2e8f0',
					px: 2.5,
					py: 1.25,
					mb: 2,
					boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
				}}
			>
				<Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
					<Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
						<AppButton
							variant="outlined"
							size="small"
							startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
							onClick={handleBack}
							label="Back to Operations"
							sx={{
								borderRadius: '8px',
								borderColor: '#e2e8f0',
								color: '#334155',
								bgcolor: '#f8fafc',
								fontWeight: 700,
								fontSize: '0.78rem',
								py: 0.4,
								px: 1.25,
								'&:hover': {
									borderColor: '#0d9488',
									color: '#0d9488',
									bgcolor: '#f0fdfa',
								},
							}}
						/>

						<Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: 18 }}>
							{detail?.public_id || 'Ancillary Request'}
						</Typography>

						{detail && <StatusBadge status={detail.status} />}
					</Stack>

					{/* Primary Operational Action Buttons */}
					<Stack direction="row" spacing={1} alignItems="center">
						{isReassignable && (
							<AppButton
								variant="contained"
								size="small"
								startIcon={<SwapHorizIcon sx={{ fontSize: 15 }} />}
								onClick={() => setShowReassignModal(true)}
								disabled={actionLoading}
								label="Reassign Nurse"
								sx={{
									bgcolor: '#0d9488',
									color: '#ffffff',
									fontWeight: 800,
									fontSize: '0.78rem',
									borderRadius: '8px',
									py: 0.45,
									px: 1.75,
									'&:hover': {
										bgcolor: '#0f766e',
									},
								}}
							/>
						)}

						{isCancellable && (
							<AppButton
								variant="outlined"
								color="error"
								size="small"
								startIcon={<CancelIcon sx={{ fontSize: 15 }} />}
								onClick={() => setShowCancelModal(true)}
								disabled={actionLoading}
								label="Cancel Request"
								sx={{
									borderRadius: '8px',
									fontWeight: 700,
									fontSize: '0.78rem',
									py: 0.45,
									px: 1.5,
								}}
							/>
						)}
					</Stack>
				</Stack>
			</Box>

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ flex: 1, minHeight: 340 }}>
					<CircularProgress sx={{ color: '#0d9488' }} size={32} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 1.5, fontWeight: 600 }}>
						Loading operational details...
					</Typography>
				</Stack>
			) : detail ? (
				<Stack spacing={2}>
					{/* ATTENTION REQUIRED BANNER (If flagged by system) */}
					{detail.requires_attention && (
						<Box
							sx={{
								p: 1.5,
								borderRadius: '10px',
								bgcolor: '#fffbeb',
								border: '1px solid #fde68a',
								display: 'flex',
								alignItems: 'center',
								gap: 1.25,
							}}
						>
							<WarningAmberIcon sx={{ color: '#d97706', fontSize: 20, flexShrink: 0 }} />
							<Typography variant="body2" fontWeight={700} color="#92400e" sx={{ fontSize: '13px' }}>
								Operational Flag: {detail.attention_reason || 'This request requires administrator review due to prolonged dispatch time.'}
							</Typography>
						</Box>
					)}

					{/* ── 2-SIDED DUAL OPERATIONAL CARDS: PATIENT vs ASSIGNED NURSE ── */}
					<Grid container spacing={2}>
						{/* LEFT SIDE: PATIENT INFORMATION */}
						<Grid size={{ xs: 12, md: 6 }}>
							<Box
								sx={{
									bgcolor: '#ffffff',
									borderRadius: '12px',
									border: '1px solid #e2e8f0',
									p: 2,
									height: '100%',
									boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
								}}
							>
								{/* Patient Header */}
								<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.75 }}>
									<Avatar
										sx={{
											width: 42,
											height: 42,
											bgcolor: '#0d9488',
											color: '#ffffff',
											fontSize: 18,
											fontWeight: 800,
										}}
									>
										{(detail.patient.name || 'P').substring(0, 1).toUpperCase()}
									</Avatar>
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Typography
											variant="caption"
											fontWeight={800}
											color="#0d9488"
											sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontSize: '10.5px' }}
										>
											PATIENT INFORMATION
										</Typography>
										<Typography variant="h6" fontWeight={800} color="#0f172a" noWrap sx={{ fontSize: 16 }}>
											{detail.patient.name || 'Patient'}
										</Typography>
									</Box>
									<Chip
										label={`Booked for: ${detail.patient.relationship || 'Self'}`}
										size="small"
										sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#f1f5f9', color: '#475569' }}
									/>
								</Stack>

								<Divider sx={{ mb: 1.75 }} />

								{/* Info Tiles */}
								<Grid container spacing={1}>
									<Grid size={{ xs: 12, sm: 6 }}>
										<InfoTile
											label="Demographics"
											value={`${detail.patient.gender || 'Not specified'}${detail.patient.age ? ` • ${detail.patient.age} yrs` : ''}`}
											icon={<PersonIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<InfoTile
											label="Contact Phone"
											value={detail.patient.contact_number || 'No phone on file'}
											icon={<PhoneIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<InfoTile
											label="Visit Address"
											value={detail.location.street_address || 'Address on file'}
											icon={<LocationOnIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<InfoTile
											label="GPS Delivery Zone"
											value={detail.location.latitude && detail.location.longitude ? `${detail.location.latitude.toFixed(4)}, ${detail.location.longitude.toFixed(4)}` : 'Standard Coverage Area'}
											icon={<LocationOnIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
										/>
									</Grid>
								</Grid>
							</Box>
						</Grid>

						{/* RIGHT SIDE: ASSIGNED NURSE / PROVIDER INFORMATION */}
						<Grid size={{ xs: 12, md: 6 }}>
							<Box
								sx={{
									bgcolor: '#ffffff',
									borderRadius: '12px',
									border: '1px solid #e2e8f0',
									p: 2,
									height: '100%',
									boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
								}}
							>
								{/* Nurse Header */}
								<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.75 }}>
									<Avatar
										sx={{
											width: 42,
											height: 42,
											bgcolor: detail.nurse ? '#047857' : '#f59e0b',
											color: '#ffffff',
											fontSize: 18,
											fontWeight: 800,
										}}
									>
										{detail.nurse ? (detail.nurse.name || 'N').substring(0, 1).toUpperCase() : <PersonOffIcon sx={{ fontSize: 20 }} />}
									</Avatar>
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Typography
											variant="caption"
											fontWeight={800}
											color={detail.nurse ? '#047857' : '#b45309'}
											sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontSize: '10.5px' }}
										>
											ASSIGNED NURSE / PROVIDER
										</Typography>
										<Stack direction="row" spacing={1} alignItems="center">
											<Typography variant="h6" fontWeight={800} color="#0f172a" noWrap sx={{ fontSize: 16 }}>
												{detail.nurse?.name || 'Unassigned / Searching'}
											</Typography>
											{detail.nurse?.is_verified && (
												<Chip
													icon={<VerifiedUserIcon sx={{ fontSize: '12px !important' }} />}
													label="Verified"
													size="small"
													sx={{ height: 19, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#dcfce7', color: '#15803d' }}
												/>
											)}
										</Stack>
									</Box>
									{detail.nurse && (
										<Chip
											label={detail.nurse.is_online ? '● Online on Duty' : '○ Offline'}
											size="small"
											sx={{
												height: 22,
												fontSize: '0.68rem',
												fontWeight: 700,
												bgcolor: detail.nurse.is_online ? '#dcfce7' : '#f1f5f9',
												color: detail.nurse.is_online ? '#15803d' : '#64748b',
											}}
										/>
									)}
								</Stack>

								<Divider sx={{ mb: 1.75 }} />

								{detail.nurse ? (
									<Grid container spacing={1}>
										<Grid size={{ xs: 12, sm: 6 }}>
											<InfoTile
												label="Specialty & License"
												value={`${detail.nurse.qualifications || 'Registered Care Nurse'}${detail.nurse.license_number ? ` (${detail.nurse.license_number})` : ''}`}
												icon={<SchoolIcon sx={{ fontSize: 12, color: '#047857' }} />}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<InfoTile
												label="Nurse Contact"
												value={detail.nurse.contact_number || 'No phone on file'}
												icon={<PhoneIcon sx={{ fontSize: 12, color: '#047857' }} />}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<InfoTile
												label="Provider ID"
												value={detail.nurse.public_id || detail.nurse.provider_id || 'Active Staff'}
												icon={<BadgeIcon sx={{ fontSize: 12, color: '#047857' }} />}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<InfoTile
												label="Last GPS Sync"
												value={detail.nurse.last_location_update ? new Date(detail.nurse.last_location_update).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Connected'}
												icon={<LocationOnIcon sx={{ fontSize: 12, color: '#047857' }} />}
											/>
										</Grid>
									</Grid>
								) : (
									<Box
										sx={{
											p: 2,
											bgcolor: '#fffbeb',
											borderRadius: '8px',
											border: '1px dashed #f59e0b',
											textAlign: 'center',
										}}
									>
										<Typography variant="body2" fontWeight={800} color="#b45309">
											No Care Nurse Assigned Yet
										</Typography>
										<Typography variant="caption" color="#92400e" sx={{ display: 'block', mt: 0.5 }}>
											Request is currently in the dispatch queue. Click Reassign Nurse in the top header to manually assign an available nurse.
										</Typography>
									</Box>
								)}
							</Box>
						</Grid>
					</Grid>

					{/* ── SERVICE, SCHEDULE & BILLING SUMMARY CARD ── */}
					<Box
						sx={{
							bgcolor: '#ffffff',
							borderRadius: '12px',
							border: '1px solid #e2e8f0',
							p: 2,
							boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
						}}
					>
						<Typography
							variant="caption"
							fontWeight={800}
							color="#64748b"
							sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1.25, fontSize: '10.5px' }}
						>
							SERVICE, SCHEDULE & BILLING SUMMARY
						</Typography>

						<Grid container spacing={1}>
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
								<InfoTile
									label="Requested Procedure"
									value={detail.service.procedure_name}
									icon={<MedicalServicesIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
									highlight
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
								<InfoTile
									label="Specialty Dept"
									value={detail.service.specialty_name || 'General Nursing'}
									icon={<BadgeIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
								<InfoTile
									label="Scheduled / Created"
									value={new Date(detail.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
									icon={<CalendarTodayIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
								<InfoTile
									label="Est. Duration"
									value={detail.service.estimated_duration || '45-60 mins'}
									icon={<AccessTimeIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
								<InfoTile
									label="Payment & Method"
									value={`${formatINR(Number(detail.payment.amount || 0))} (${detail.payment.payment_method || 'CARD'})`}
									icon={<PaymentIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
								<InfoTile
									label="Doorstep OTP Status"
									value={detail.session?.otp_verified ? 'Verified on Arrival' : 'Pending Arrival'}
									icon={detail.session?.otp_verified ? <CheckCircleIcon sx={{ fontSize: 12, color: '#16a34a' }} /> : <AccessTimeIcon sx={{ fontSize: 12, color: '#64748b' }} />}
								/>
							</Grid>
						</Grid>
					</Box>

					{/* ── OPERATIONAL NOTES & PATIENT REQUEST INSTRUCTIONS (Only if available) ── */}
					{(detail.service.medical_notes || detail.service.chief_complaint || detail.session?.clinical_notes) && (
						<Box
							sx={{
								bgcolor: '#ffffff',
								borderRadius: '12px',
								border: '1px solid #e2e8f0',
								p: 2,
								boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
							}}
						>
							<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
								<StickyNote2Icon sx={{ fontSize: 16, color: '#0d9488' }} />
								<Typography variant="caption" fontWeight={800} color="#0f172a" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11px' }}>
									Operational Notes & Booking Instructions
								</Typography>
							</Stack>
							<Typography variant="body2" color="#334155" sx={{ fontSize: '13px', lineHeight: 1.6, bgcolor: '#f8fafc', p: 1.5, borderRadius: '8px', border: '1px solid #e2e8f0' }}>
								{detail.service.medical_notes || detail.service.chief_complaint || detail.session?.clinical_notes}
							</Typography>
						</Box>
					)}
				</Stack>
			) : null}

			{/* ── Reassign Confirmation Modal ── */}
			<ConfirmModal
				open={showReassignModal}
				onClose={() => setShowReassignModal(false)}
				onConfirm={handleReassignConfirm}
				title="Reassign Nurse?"
				description="This will automatically find and assign an eligible available nurse for this service."
				confirmLabel="Confirm Reassign"
				cancelLabel="Cancel"
				loading={actionLoading}
			/>

			{/* ── Cancel Confirmation Modal ── */}
			<ConfirmModal
				open={showCancelModal}
				onClose={() => setShowCancelModal(false)}
				onConfirm={handleCancelConfirm}
				title="Cancel Ancillary Service Request"
				description={`Are you sure you want to cancel service request ${detail?.public_id}? This will immediately notify both the patient and assigned nurse, and stop dispatch.`}
				confirmLabel="Confirm Cancellation"
				cancelLabel="Keep Active"
				loading={actionLoading}
			/>
		</Box>
	)
}
