// src/features/admin/pages/AdminAncillaryDetailPage.tsx
import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	Box,
	Grid,
	Typography,
	Stack,
	Chip,
	Button,
	IconButton,
	Avatar,
	CircularProgress,
	Alert,
	Divider,
	Paper,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PaymentIcon from '@mui/icons-material/Payment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import PhoneIcon from '@mui/icons-material/Phone'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import CancelIcon from '@mui/icons-material/Cancel'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import RefreshIcon from '@mui/icons-material/Refresh'

import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import StatusBadge from '../../../components/admin/StatusBadge'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import { ROUTES } from '../../../constants/routes'
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
			await cancelAdminAncillaryRequest(detail.public_id || detail.id, 'Cancelled by administrator from detail view')
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
		<Box sx={{ pb: 8 }}>
			{/* Top Page Header with Breadcrumb Back Navigation */}
			<AdminPageHeader
				title={detail ? `${detail.public_id} — ${detail.service.procedure_name || 'Care Visit'}` : 'Ancillary Request Details'}
				subtitle={detail ? `Created on ${new Date(detail.created_at).toLocaleString()}` : 'Detailed operational review'}
				leading={
					<IconButton
						onClick={handleBack}
						size="small"
						sx={{
							color: '#64748b',
							border: '1px solid #e2e8f0',
							borderRadius: 2,
							'&:hover': { borderColor: '#0f172a', color: '#0f172a', bgcolor: 'transparent' },
						}}
					>
						<ArrowBackIcon fontSize="small" />
					</IconButton>
				}
				actions={
					<Button
						variant="outlined"
						startIcon={<RefreshIcon />}
						onClick={fetchDetail}
						disabled={loading}
						sx={{
							borderRadius: 2,
							fontWeight: 700,
							textTransform: 'none',
							color: '#0f172a',
							borderColor: '#cbd5e1',
							'&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
						}}
					>
						Refresh
					</Button>
				}
			/>

			{/* Success / Error Alerts */}
			{successMsg && (
				<Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
					{successMsg}
				</Alert>
			)}
			{error && (
				<Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
					{error}
				</Alert>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 12 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading operational details...
					</Typography>
				</Stack>
			) : detail ? (
				<>
					{/* ── Hero Banner ── */}
					<Box
						sx={{
							p: { xs: 3, md: 3.5 },
							mb: 3.5,
							borderRadius: '16px',
							bgcolor: '#0f172a',
							color: '#ffffff',
							boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
							backgroundImage:
								'radial-gradient(at 90% 10%, rgba(13, 148, 136, 0.3) 0px, transparent 60%), radial-gradient(at 10% 90%, rgba(30, 58, 138, 0.25) 0px, transparent 60%)',
						}}
					>
						<Stack
							direction={{ xs: 'column', md: 'row' }}
							alignItems={{ xs: 'flex-start', md: 'center' }}
							justifyContent="space-between"
							spacing={3}
						>
							<Stack direction="row" spacing={2.5} alignItems="center">
								<Avatar
									sx={{
										width: 64,
										height: 64,
										bgcolor: '#0d9488',
										color: '#ffffff',
										boxShadow: '0 4px 20px rgba(13, 148, 136, 0.4)',
										border: '3px solid rgba(255,255,255,0.15)',
									}}
								>
									<MedicalServicesIcon sx={{ fontSize: 32 }} />
								</Avatar>
								<Box>
									<Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
										<Typography variant="h5" fontWeight={800} sx={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
											{detail.public_id}
										</Typography>
										<StatusBadge status={detail.status} />
									</Stack>
									<Typography variant="body2" sx={{ color: '#cbd5e1', mt: 0.75 }}>
										Patient: <strong style={{ color: '#ffffff' }}>{detail.patient.name}</strong> • Service:{' '}
										<strong style={{ color: '#ffffff' }}>{detail.service.procedure_name}</strong>
									</Typography>
								</Box>
							</Stack>

							{/* Action Buttons */}
							<Stack direction="row" spacing={1.5} alignItems="center">
								{isReassignable && (
									<Button
										variant="contained"
										startIcon={<SwapHorizIcon />}
										onClick={() => setShowReassignModal(true)}
										sx={{
											bgcolor: '#0d9488',
											'&:hover': { bgcolor: '#0f766e' },
											fontWeight: 700,
											textTransform: 'none',
											borderRadius: 2,
											px: 2.5,
										}}
									>
										Reassign Nurse
									</Button>
								)}
								{isCancellable && (
									<Button
										variant="outlined"
										color="error"
										startIcon={<CancelIcon />}
										onClick={() => setShowCancelModal(true)}
										sx={{
											borderColor: 'rgba(239,68,68,0.5)',
											color: '#f87171',
											'&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)' },
											fontWeight: 700,
											textTransform: 'none',
											borderRadius: 2,
										}}
									>
										Cancel Request
									</Button>
								)}
							</Stack>
						</Stack>
					</Box>

					{/* ── Main Grid Details ── */}
					<Grid container spacing={3}>
						{/* Left Column */}
						<Grid size={{ xs: 12, md: 7 }}>
							<Stack spacing={3}>
								{/* 1. Patient Information */}
								<Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
									<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
										<PersonIcon sx={{ fontSize: 22, color: '#0d9488' }} />
										<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
											Patient Details
										</Typography>
									</Stack>
									<Divider sx={{ mb: 2.5 }} />

									<Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 2.5 }}>
										<Avatar sx={{ bgcolor: '#e2e8f0', color: '#334155', width: 56, height: 56, fontWeight: 800, fontSize: 20 }}>
											{detail.patient.name ? detail.patient.name.charAt(0).toUpperCase() : 'P'}
										</Avatar>
										<Box>
											<Typography variant="h6" fontWeight={800} color="#0f172a">
												{detail.patient.name || 'Anonymous Patient'}
											</Typography>
											<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
												<Chip
													label={`Relationship: ${detail.patient.relationship || 'Self'}`}
													size="small"
													sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#f1f5f9' }}
												/>
												{detail.patient.gender && (
													<Typography variant="caption" color="text.secondary">
														{detail.patient.gender} {detail.patient.age ? `• ${detail.patient.age} yrs` : ''}
													</Typography>
												)}
											</Stack>
										</Box>
									</Stack>

									{detail.patient.contact_number && (
										<Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc' }}>
											<PhoneIcon sx={{ fontSize: 18, color: '#0d9488' }} />
											<Typography variant="body2" fontWeight={600} color="#334155">
												Contact Number: {detail.patient.contact_number}
											</Typography>
										</Stack>
									)}
								</Paper>

								{/* 2. Clinical Service Details */}
								<Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
									<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
										<MedicalServicesIcon sx={{ fontSize: 22, color: '#0d9488' }} />
										<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
											Clinical Service & Notes
										</Typography>
									</Stack>
									<Divider sx={{ mb: 2.5 }} />

									<Stack spacing={2}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Typography variant="body2" color="text.secondary">Specialty</Typography>
											<Typography variant="body2" fontWeight={700} color="#0f172a">
												{detail.service.specialty_name || 'General Nursing Care'}
											</Typography>
										</Box>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Typography variant="body2" color="text.secondary">Procedure Name</Typography>
											<Typography variant="body2" fontWeight={800} color="#0d9488">
												{detail.service.procedure_name || 'In-Home Visit'}
											</Typography>
										</Box>

										{detail.service.medical_notes && (
											<Box sx={{ mt: 1.5, p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
												<Typography variant="caption" fontWeight={700} color="#475569" sx={{ display: 'block', mb: 0.5 }}>
													Patient Clinical Notes / Chief Complaint
												</Typography>
												<Typography variant="body2" color="#334155">
													{detail.service.medical_notes}
												</Typography>
											</Box>
										)}
									</Stack>
								</Paper>

								{/* 3. Location & Doorstep Verification */}
								<Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
									<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
										<LocationOnIcon sx={{ fontSize: 22, color: '#0d9488' }} />
										<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
											Visit Location & Doorstep Session
										</Typography>
									</Stack>
									<Divider sx={{ mb: 2.5 }} />

									<Typography variant="body1" fontWeight={600} color="#0f172a" sx={{ mb: 2 }}>
										{detail.location.street_address || 'Address not specified'}
									</Typography>

									<Stack spacing={1.5}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<Typography variant="body2" color="text.secondary">Doorstep Verification</Typography>
											{detail.session?.otp_verified ? (
												<Chip
													icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
													label="Identity Verified"
													size="small"
													sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#dcfce7', color: '#15803d' }}
												/>
											) : (
												<Chip
													label="Pending Doorstep Arrival"
													size="small"
													sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#f1f5f9', color: '#64748b' }}
												/>
											)}
										</Box>

										{detail.session?.otp_verified_at && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Typography variant="body2" color="text.secondary">Verified At</Typography>
												<Typography variant="body2" fontWeight={600} color="#475569">
													{new Date(detail.session.otp_verified_at).toLocaleString()}
												</Typography>
											</Box>
										)}

										{detail.session?.clinical_notes && (
											<Box sx={{ mt: 1.5, p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
												<Typography variant="caption" fontWeight={700} color="#475569" sx={{ display: 'block', mb: 0.5 }}>
													Bedside Clinical Notes
												</Typography>
												<Typography variant="body2" color="#334155">
													{detail.session.clinical_notes}
												</Typography>
											</Box>
										)}
									</Stack>
								</Paper>
							</Stack>
						</Grid>

						{/* Right Column */}
						<Grid size={{ xs: 12, md: 5 }}>
							<Stack spacing={3}>
								{/* 1. Assigned Nurse / Provider */}
								<Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
									<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
										<MedicalServicesIcon sx={{ fontSize: 22, color: '#0d9488' }} />
										<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
											Assigned Care Provider
										</Typography>
									</Stack>
									<Divider sx={{ mb: 2.5 }} />

									{detail.nurse ? (
										<Box>
											<Stack direction="row" spacing={2} alignItems="center">
												<Avatar sx={{ bgcolor: '#ccfbf1', color: '#0f766e', width: 56, height: 56, fontWeight: 800, fontSize: 20 }}>
													{detail.nurse.name ? detail.nurse.name.charAt(0).toUpperCase() : 'N'}
												</Avatar>
												<Box sx={{ flex: 1, minWidth: 0 }}>
													<Stack direction="row" spacing={1} alignItems="center">
														<Typography variant="h6" fontWeight={800} color="#0f172a">
															{detail.nurse.name}
														</Typography>
														{detail.nurse.is_verified && (
															<Chip
																icon={<VerifiedUserIcon sx={{ fontSize: '13px !important' }} />}
																label="Verified"
																size="small"
																sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#dcfce7', color: '#15803d' }}
															/>
														)}
													</Stack>
													<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
														{detail.nurse.qualifications || 'Certified Healthcare Specialist'}
														{detail.nurse.license_number ? ` (Lic: ${detail.nurse.license_number})` : ''}
													</Typography>
												</Box>
											</Stack>

											<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
												<Chip
													label={detail.nurse.is_online ? '● Online on Duty' : '○ Offline'}
													size="small"
													sx={{
														height: 24,
														fontSize: '0.7rem',
														fontWeight: 700,
														bgcolor: detail.nurse.is_online ? '#dcfce7' : '#f1f5f9',
														color: detail.nurse.is_online ? '#15803d' : '#64748b',
													}}
												/>
												{detail.nurse.contact_number && (
													<Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#475569' }}>
														<PhoneIcon sx={{ fontSize: 16 }} />
														<Typography variant="body2" fontWeight={600}>
															{detail.nurse.contact_number}
														</Typography>
													</Stack>
												)}
											</Stack>

											{detail.nurse.last_location_update && (
												<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
													Last GPS sync: {new Date(detail.nurse.last_location_update).toLocaleTimeString()}
												</Typography>
											)}
										</Box>
									) : ['CANCELLED_BY_PATIENT', 'CANCELLED_BY_PROVIDER', 'CANCELLED'].includes((detail.status || '').toUpperCase()) ? (
										<Box sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
											<PersonOffIcon sx={{ color: '#64748b', fontSize: 36, mb: 1 }} />
											<Typography variant="subtitle1" fontWeight={700} color="#334155">
												No Care Provider Assigned
											</Typography>
											<Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
												This service request was cancelled before a care provider was dispatched.
											</Typography>
										</Box>
									) : (detail.status || '').toUpperCase() === 'COMPLETED' ? (
										<Box sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
											<CheckCircleIcon sx={{ color: '#15803d', fontSize: 36, mb: 1 }} />
											<Typography variant="subtitle1" fontWeight={700} color="#15803d">
												Service Completed
											</Typography>
											<Typography variant="body2" color="#475569" sx={{ mt: 0.5 }}>
												This service request has concluded.
											</Typography>
										</Box>
									) : (
										<Box sx={{ p: 3, borderRadius: 2, bgcolor: '#fffbeb', border: '1px dashed #f59e0b', textAlign: 'center' }}>
											<PersonOffIcon sx={{ color: '#d97706', fontSize: 36, mb: 1 }} />
											<Typography variant="subtitle1" fontWeight={800} color="#b45309">
												No Nurse Assigned Yet
											</Typography>
											<Typography variant="body2" color="#92400e" sx={{ mt: 0.5 }}>
												Request is currently active in the dispatch queue. You can manually assign an online nurse using the button above.
											</Typography>
										</Box>
									)}
								</Paper>

								{/* 2. Financials & Billing */}
								<Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
									<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
										<PaymentIcon sx={{ fontSize: 22, color: '#0d9488' }} />
										<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
											Financials & Billing
										</Typography>
									</Stack>
									<Divider sx={{ mb: 2.5 }} />

									<Stack spacing={2}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<Typography variant="body2" color="text.secondary">Total Amount</Typography>
											<Typography variant="h6" fontWeight={800} color="#0f172a">
												{formatINR(Number(detail.payment.amount || 0))}
											</Typography>
										</Box>
										<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<Typography variant="body2" color="text.secondary">Payment Status</Typography>
											<StatusBadge status={detail.payment.payment_status} />
										</Box>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Typography variant="body2" color="text.secondary">Payment Method</Typography>
											<Typography variant="body2" fontWeight={700} color="#475569">
												{detail.payment.payment_method || 'CARD'}
											</Typography>
										</Box>
									</Stack>
								</Paper>

								{/* 3. System & Timeline */}
								<Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
									<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
										<AccessTimeIcon sx={{ fontSize: 22, color: '#0d9488' }} />
										<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
											System Timeline
										</Typography>
									</Stack>
									<Divider sx={{ mb: 2.5 }} />

									<Stack spacing={1.5}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Typography variant="caption" color="text.secondary">Request ID</Typography>
											<Typography variant="caption" fontWeight={700} color="#0f172a">
												{detail.public_id}
											</Typography>
										</Box>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Typography variant="caption" color="text.secondary">Created Timestamp</Typography>
											<Typography variant="caption" fontWeight={600} color="#475569">
												{new Date(detail.created_at).toLocaleString()}
											</Typography>
										</Box>
									</Stack>
								</Paper>
							</Stack>
						</Grid>
					</Grid>

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
						description={`Are you sure you want to cancel service request ${detail.public_id}? This will immediately notify both the patient and assigned nurse, and stop dispatch.`}
						confirmLabel="Confirm Cancellation"
						cancelLabel="Keep Active"
						loading={actionLoading}
					/>
				</>
			) : null}
		</Box>
	)
}
