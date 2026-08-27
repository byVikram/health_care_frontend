// src/features/admin/components/AdminAncillaryDetailDrawer.tsx
import {
	Drawer,
	Box,
	Typography,
	Stack,
	IconButton,
	Divider,
	Avatar,
	Chip,
	Button,
	Alert,
	CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
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

import StatusBadge from '../../../components/admin/StatusBadge'
import { AdminAncillaryDetail, ANCILLARY_TERMINAL_STATUSES } from '../adminService'
import { formatINR } from '../../../utils/Utils'
import { customScrollbar } from '../../../styles/commonStyles'

interface AdminAncillaryDetailDrawerProps {
	open: boolean
	onClose: () => void
	detail: AdminAncillaryDetail | null
	loading?: boolean
	onReassignClick?: (request: AdminAncillaryDetail) => void
	onCancelClick?: (request: AdminAncillaryDetail) => void
}

export default function AdminAncillaryDetailDrawer({
	open,
	onClose,
	detail,
	loading = false,
	onReassignClick,
	onCancelClick,
}: AdminAncillaryDetailDrawerProps) {
	if (!detail && !loading) return null

	const isCancellable = detail && !(ANCILLARY_TERMINAL_STATUSES as string[]).includes(detail.status.toUpperCase())
	const isReassignable = detail && !(ANCILLARY_TERMINAL_STATUSES as string[]).includes(detail.status.toUpperCase())

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: '100%', sm: 540, md: 600 },
					bgcolor: '#ffffff',
					boxShadow: '-8px 0 32px rgba(15,23,42,0.12)',
					display: 'flex',
					flexDirection: 'column',
				},
			}}
		>
			{/* ── Top Header ── */}
			<Box
				sx={{
					p: 2.5,
					borderBottom: '1px solid #e2e8f0',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					bgcolor: '#f8fafc',
				}}
			>
				<Stack direction="row" alignItems="center" spacing={1.5}>
					<Avatar sx={{ bgcolor: '#0d9488', width: 40, height: 40 }}>
						<MedicalServicesIcon sx={{ fontSize: 22, color: '#ffffff' }} />
					</Avatar>
					<Box>
						<Typography variant="subtitle1" fontWeight={800} sx={{ color: '#0f172a', lineHeight: 1.2 }}>
							{detail?.public_id || 'Request Details'}
						</Typography>
						<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
							{detail && <StatusBadge status={detail.status} />}
						</Stack>
					</Box>
				</Stack>
				<IconButton onClick={onClose} size="small" sx={{ color: '#64748b', '&:hover': { bgcolor: '#e2e8f0' } }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</Box>

			{/* ── Content Body ── */}
			<Box sx={{ flex: 1, overflowY: 'auto', p: 3, ...customScrollbar }}>
				{loading ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
						<CircularProgress size={36} sx={{ color: '#0d9488' }} />
						<Typography variant="body2" color="text.secondary">
							Loading operational context...
						</Typography>
					</Box>
				) : detail ? (
					<Stack spacing={3}>
						{/* Attention Banner if flagged */}
						{detail.requires_attention && (
							<Alert severity="warning" sx={{ borderRadius: 2, fontWeight: 600 }}>
								{detail.attention_reason || 'This service request requires administrator review.'}
							</Alert>
						)}

						{/* ── 1. Patient Information ── */}
						<Box sx={{ p: 2, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#fbfcfd' }}>
							<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
								<PersonIcon sx={{ fontSize: 20, color: '#0d9488' }} />
								<Typography variant="subtitle2" fontWeight={800} color="#0f172a">
									Patient Details
								</Typography>
							</Stack>
							<Stack direction="row" spacing={2} alignItems="center">
								<Avatar sx={{ bgcolor: '#e2e8f0', color: '#334155', width: 48, height: 48, fontWeight: 800 }}>
									{detail.patient.name ? detail.patient.name.charAt(0).toUpperCase() : 'P'}
								</Avatar>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography variant="body1" fontWeight={700} color="#0f172a">
										{detail.patient.name || 'Anonymous Patient'}
									</Typography>
									<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
										<Chip
											label={detail.patient.relationship || 'Self'}
											size="small"
											sx={{ height: 20, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#f1f5f9' }}
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
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5, color: '#475569' }}>
									<PhoneIcon sx={{ fontSize: 16 }} />
									<Typography variant="body2" fontWeight={500}>
										{detail.patient.contact_number}
									</Typography>
								</Stack>
							)}
						</Box>

						{/* ── 2. Assigned Nurse / Care Provider ── */}
						<Box sx={{ p: 2, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#fbfcfd' }}>
							<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
								<MedicalServicesIcon sx={{ fontSize: 20, color: '#0d9488' }} />
								<Typography variant="subtitle2" fontWeight={800} color="#0f172a">
									Assigned Nurse / Provider
								</Typography>
							</Stack>

							{detail.nurse ? (
								<Box>
									<Stack direction="row" spacing={2} alignItems="center">
										<Avatar sx={{ bgcolor: '#ccfbf1', color: '#0f766e', width: 48, height: 48, fontWeight: 800 }}>
											{detail.nurse.name ? detail.nurse.name.charAt(0).toUpperCase() : 'N'}
										</Avatar>
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Stack direction="row" spacing={1} alignItems="center">
												<Typography variant="body1" fontWeight={700} color="#0f172a">
													{detail.nurse.name}
												</Typography>
												{detail.nurse.is_verified && (
													<Chip
														icon={<VerifiedUserIcon sx={{ fontSize: '13px !important' }} />}
														label="Verified"
														size="small"
														sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#dcfce7', color: '#15803d' }}
													/>
												)}
											</Stack>
											<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
												{detail.nurse.qualifications || 'Certified Healthcare Specialist'}
												{detail.nurse.license_number ? ` (Lic: ${detail.nurse.license_number})` : ''}
											</Typography>
										</Box>
									</Stack>

									<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
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
										{detail.nurse.contact_number && (
											<Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#475569' }}>
												<PhoneIcon sx={{ fontSize: 15 }} />
												<Typography variant="caption" fontWeight={600}>
													{detail.nurse.contact_number}
												</Typography>
											</Stack>
										)}
									</Stack>

									{detail.nurse.last_location_update && (
										<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
											Last GPS sync: {new Date(detail.nurse.last_location_update).toLocaleTimeString()}
										</Typography>
									)}
								</Box>
							) : ['CANCELLED_BY_PATIENT', 'CANCELLED_BY_PROVIDER', 'CANCELLED'].includes((detail.status || '').toUpperCase()) ? (
								<Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
									<PersonOffIcon sx={{ color: '#64748b', fontSize: 28, mb: 0.5 }} />
									<Typography variant="subtitle2" fontWeight={600} color="#334155">
										No Care Provider Assigned
									</Typography>
									<Typography variant="caption" color="#64748b">
										Service request was cancelled prior to provider assignment.
									</Typography>
								</Box>
							) : (detail.status || '').toUpperCase() === 'COMPLETED' ? (
								<Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
									<CheckCircleIcon sx={{ color: '#15803d', fontSize: 28, mb: 0.5 }} />
									<Typography variant="subtitle2" fontWeight={600} color="#15803d">
										Service Completed
									</Typography>
									<Typography variant="caption" color="#475569">
										This service request has concluded.
									</Typography>
								</Box>
							) : (
								<Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fffbeb', border: '1px dashed #f59e0b', textAlign: 'center' }}>
									<PersonOffIcon sx={{ color: '#d97706', fontSize: 32, mb: 0.5 }} />
									<Typography variant="subtitle2" fontWeight={700} color="#b45309">
										No Nurse Assigned Yet
									</Typography>
									<Typography variant="caption" color="#92400e">
										Request is currently active in the dispatch queue. Nearby verified nurses within geofence are being pinged.
									</Typography>
								</Box>
							)}
						</Box>

						{/* ── 3. Clinical Service Information ── */}
						<Box sx={{ p: 2, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#fbfcfd' }}>
							<Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 1.5 }}>
								Service Information
							</Typography>
							<Stack spacing={1}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="caption" color="text.secondary">Specialty</Typography>
									<Typography variant="body2" fontWeight={600} color="#0f172a">
										{detail.service.specialty_name || 'General Nursing Care'}
									</Typography>
								</Box>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="caption" color="text.secondary">Procedure</Typography>
									<Typography variant="body2" fontWeight={700} color="#0d9488">
										{detail.service.procedure_name || 'In-Home Visit'}
									</Typography>
								</Box>
								{detail.service.medical_notes && (
									<Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: '#f1f5f9' }}>
										<Typography variant="caption" fontWeight={700} color="#475569" sx={{ display: 'block', mb: 0.5 }}>
											Patient Clinical Notes / Chief Complaint
										</Typography>
										<Typography variant="body2" color="#334155" sx={{ fontSize: '0.82rem' }}>
											{detail.service.medical_notes}
										</Typography>
									</Box>
								)}
							</Stack>
						</Box>

						{/* ── 4. Location & Session Execution ── */}
						<Box sx={{ p: 2, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#fbfcfd' }}>
							<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
								<LocationOnIcon sx={{ fontSize: 20, color: '#0d9488' }} />
								<Typography variant="subtitle2" fontWeight={800} color="#0f172a">
									Visit Location & Session
								</Typography>
							</Stack>
							<Typography variant="body2" color="#334155" sx={{ mb: 1.5 }}>
								{detail.location.street_address || 'Address not specified'}
							</Typography>

							<Divider sx={{ my: 1.5 }} />

							<Stack spacing={1}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Typography variant="caption" color="text.secondary">Doorstep Verification</Typography>
									{detail.session?.otp_verified ? (
										<Chip
											icon={<CheckCircleIcon sx={{ fontSize: '13px !important' }} />}
											label="Identity Verified"
											size="small"
											sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#dcfce7', color: '#15803d' }}
										/>
									) : (
										<Chip
											label="Pending Doorstep Arrival"
											size="small"
											sx={{ height: 20, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#f1f5f9', color: '#64748b' }}
										/>
									)}
								</Box>
								{detail.session?.otp_verified_at && (
									<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
										<Typography variant="caption" color="text.secondary">Verified At</Typography>
										<Typography variant="caption" fontWeight={600} color="#475569">
											{new Date(detail.session.otp_verified_at).toLocaleString()}
										</Typography>
									</Box>
								)}
								{detail.session?.clinical_notes && (
									<Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: '#f1f5f9' }}>
										<Typography variant="caption" fontWeight={700} color="#475569" sx={{ display: 'block', mb: 0.5 }}>
											Bedside Clinical Notes
										</Typography>
										<Typography variant="body2" color="#334155" sx={{ fontSize: '0.82rem' }}>
											{detail.session.clinical_notes}
										</Typography>
									</Box>
								)}
							</Stack>
						</Box>

						{/* ── 5. Payment & Financials ── */}
						<Box sx={{ p: 2, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#fbfcfd' }}>
							<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
								<PaymentIcon sx={{ fontSize: 20, color: '#0d9488' }} />
								<Typography variant="subtitle2" fontWeight={800} color="#0f172a">
									Financials & Billing
								</Typography>
							</Stack>
							<Stack spacing={1}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Typography variant="caption" color="text.secondary">Total Amount</Typography>
									<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
										{formatINR(detail.payment.amount)}
									</Typography>
								</Box>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Typography variant="caption" color="text.secondary">Payment Status</Typography>
									<StatusBadge status={detail.payment.payment_status} />
								</Box>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="caption" color="text.secondary">Payment Method</Typography>
									<Typography variant="body2" fontWeight={600} color="#475569">
										{detail.payment.payment_method || 'Card'}
									</Typography>
								</Box>
							</Stack>
						</Box>

						{/* ── 6. Timestamps ── */}
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
							<AccessTimeIcon sx={{ fontSize: 16 }} />
							<Typography variant="caption">
								Created: {new Date(detail.created_at).toLocaleString()}
							</Typography>
						</Box>
					</Stack>
				) : null}
			</Box>

			{/* ── Action Footer ── */}
			{detail && (
				<Box
					sx={{
						p: 2.5,
						borderTop: '1px solid #e2e8f0',
						bgcolor: '#ffffff',
						display: 'flex',
						gap: 1.5,
						justifyContent: 'flex-end',
					}}
				>
					{isReassignable && onReassignClick && (
						<Button
							variant="outlined"
							color="primary"
							startIcon={<SwapHorizIcon />}
							onClick={() => onReassignClick(detail)}
							sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
						>
							Reassign Nurse
						</Button>
					)}
					{isCancellable && onCancelClick && (
						<Button
							variant="outlined"
							color="error"
							startIcon={<CancelIcon />}
							onClick={() => onCancelClick(detail)}
							sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
						>
							Cancel Request
						</Button>
					)}
					<Button
						variant="contained"
						onClick={onClose}
						sx={{
							bgcolor: '#0f172a',
							'&:hover': { bgcolor: '#1e293b' },
							fontWeight: 700,
							textTransform: 'none',
							borderRadius: 2,
						}}
					>
						Close
					</Button>
				</Box>
			)}
		</Drawer>
	)
}
