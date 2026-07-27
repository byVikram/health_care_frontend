// src/features/admin/pages/AdminUsersPage.tsx
import { useEffect, useState, useCallback } from 'react'
import {
	Box,
	Grid,
	Typography,
	Chip,
	Stack,
	CircularProgress,
	Alert,
	Tooltip,
	IconButton,
	Avatar,
	Divider,
	Rating,
	TablePagination,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import LockResetIcon from '@mui/icons-material/LockReset'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PersonIcon from '@mui/icons-material/Person'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable from '../../../components/common/Table/AppTable'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppButton from '../../../components/common/Button/AppButton'
import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import {
	listUsers,
	suspendUser,
	resetUserOtp,
	getPatientAdminDetail,
	getDoctorAdminDetail,
	getProviderAdminDetail,
	AdminUserItem,
	AdminPatientDetail,
	DoctorVerificationDetail,
	AdminProviderDetail,
} from '../adminService'
import { buildS3Url } from '../../../utils/s3'

// ── Styled info row (same pattern as the Admin Verification review drawer) ─
function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
	return (
		<Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8 }}>
			<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, minWidth: 140 }}>
				{label}
			</Typography>
			<Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', maxWidth: '55%' }}>
				{value ?? 'N/A'}
			</Typography>
		</Box>
	)
}

// ── Section header inside the drawer ────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
	return (
		<Typography
			variant="subtitle2"
			sx={{
				fontWeight: 700,
				color: '#0f172a',
				mt: 2.5,
				mb: 1,
				pb: 0.5,
				borderBottom: '2px solid #e2e8f0',
				textTransform: 'uppercase',
				fontSize: '11px',
				letterSpacing: '0.08em',
			}}
		>
			{title}
		</Typography>
	)
}

const ROLE_OPTIONS = [
	{ label: 'All Roles', value: '' },
	{ label: 'Doctors', value: 'doctor' },
	{ label: 'Patients', value: 'patient' },
	{ label: 'Pharmacies', value: 'pharmacy' },
	{ label: 'Radiology Centers', value: 'radiology' },
	{ label: 'Laboratories', value: 'laboratory' },
	{ label: 'Admins', value: 'admin' },
]

export default function AdminUsersPage() {
	const [users, setUsers] = useState<AdminUserItem[]>([])
	const [selectedRole, setSelectedRole] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

	// ── Patient Details Drawer state ─────────────────────────────────────────
	const [patientDrawerOpen, setPatientDrawerOpen] = useState(false)
	const [patientDetail, setPatientDetail] = useState<AdminPatientDetail | null>(null)
	const [patientDetailLoading, setPatientDetailLoading] = useState(false)
	const [activePatientId, setActivePatientId] = useState<string | null>(null)

	// ── Doctor Details Drawer state ──────────────────────────────────────────
	const [doctorDrawerOpen, setDoctorDrawerOpen] = useState(false)
	const [doctorDetail, setDoctorDetail] = useState<DoctorVerificationDetail | null>(null)
	const [doctorDetailLoading, setDoctorDetailLoading] = useState(false)

	const [providerDrawerOpen, setProviderDrawerOpen] = useState(false)
	const [providerDetail, setProviderDetail] = useState<AdminProviderDetail | null>(null)
	const [providerDetailLoading, setProviderDetailLoading] = useState(false)

	const fetchUsers = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await listUsers({ role: selectedRole || undefined, page, pageSize })
			if (res.success) {
				setUsers(res.data?.items || [])
				setTotal(res.data?.total || 0)
			}
		} catch (err: any) {
			setError(err?.message || 'Failed to fetch users list')
		} finally {
			setLoading(false)
		}
	}, [selectedRole, page, pageSize])

	useEffect(() => {
		fetchUsers()
	}, [fetchUsers])

	const handleToggleSuspend = async (user: AdminUserItem) => {
		setActionLoadingId(user.public_id || String(user.id))
		try {
			const res = await suspendUser(user.public_id || String(user.id))
			if (res.success) {
				toast.success(`User ${user.email || user.contact_number} status updated.`)
				fetchUsers()
			}
		} catch (err: any) {
			toast.error(err?.message || 'Failed to update user status.')
		} finally {
			setActionLoadingId(null)
		}
	}

	const handleResetOtp = async (user: AdminUserItem) => {
		setActionLoadingId(user.public_id || String(user.id))
		try {
			const res = await resetUserOtp(user.public_id || String(user.id))
			if (res.success) {
				toast.success(`OTP state reset for ${user.email || user.contact_number}.`)
			}
		} catch (err: any) {
			toast.error(err?.message || 'Failed to reset OTP state.')
		} finally {
			setActionLoadingId(null)
		}
	}

	// ── Patient Details Drawer ───────────────────────────────────────────────
	const fetchPatientDetail = async (patientId: string) => {
		setPatientDetailLoading(true)
		try {
			const res = await getPatientAdminDetail(patientId)
			if (res.success && res.data) {
				setPatientDetail(res.data)
				setActivePatientId(patientId)
			}
		} catch (err: any) {
			toast.error(err?.message || 'Failed to load patient details.')
		} finally {
			setPatientDetailLoading(false)
		}
	}

	const handleOpenPatientDrawer = (user: AdminUserItem) => {
		if (!user.patient_id) return
		setPatientDrawerOpen(true)
		setPatientDetail(null)
		fetchPatientDetail(user.patient_id)
	}

	const handleSwitchLinkedProfile = (patientId: string) => {
		if (patientId === activePatientId) return
		fetchPatientDetail(patientId)
	}

	const handleClosePatientDrawer = () => {
		setPatientDrawerOpen(false)
		setPatientDetail(null)
		setActivePatientId(null)
	}

	// ── Doctor Details Drawer ────────────────────────────────────────────────
	const handleOpenDoctorDrawer = async (user: AdminUserItem) => {
		if (!user.doctor_id) return
		setDoctorDrawerOpen(true)
		setDoctorDetail(null)
		setDoctorDetailLoading(true)
		try {
			const res = await getDoctorAdminDetail(user.doctor_id)
			if (res.success && res.data) {
				setDoctorDetail(res.data)
			}
		} catch (err: any) {
			toast.error(err?.message || 'Failed to load doctor details.')
		} finally {
			setDoctorDetailLoading(false)
		}
	}

	const handleCloseDoctorDrawer = () => {
		setDoctorDrawerOpen(false)
		setDoctorDetail(null)
	}

	const handleOpenProviderDrawer = async (user: AdminUserItem) => {
		const providerType =
			user.role === 'pharmacy'
				? 'pharmacy'
				: user.role === 'laboratory'
					? 'laboratory'
					: user.role === 'radiology'
						? 'radiology'
						: null
		const providerId = user.pharmacy_id || user.laboratory_id || user.radiology_id
		if (!providerType || !providerId) return
		setProviderDrawerOpen(true)
		setProviderDetail(null)
		setProviderDetailLoading(true)
		try {
			const res = await getProviderAdminDetail(providerType, providerId)
			if (res.success && res.data) {
				setProviderDetail(res.data)
			}
		} catch (err: any) {
			toast.error(err?.message || 'Failed to load provider details.')
		} finally {
			setProviderDetailLoading(false)
		}
	}

	const handleCloseProviderDrawer = () => {
		setProviderDrawerOpen(false)
		setProviderDetail(null)
	}

	const columns = [
		{
			field: 'id',
			label: 'User Info',
			render: (_: any, row: AdminUserItem) => (
				<Box>
					<Typography variant="subtitle2" fontWeight={700}>
						{row.email || row.contact_number}
					</Typography>
				</Box>
			),
		},
		{
			field: 'role',
			label: 'Role',
			render: (_: any, row: AdminUserItem) => (
				<Chip
					label={(row.role || 'USER').toUpperCase()}
					size="small"
					sx={{ bgcolor: '#f1f5f9', color: '#0f172a', fontWeight: 700 }}
				/>
			),
		},
		{
			field: 'contact_number',
			label: 'Mobile Contact',
			render: (_: any, row: AdminUserItem) => (
				<Typography variant="body2">{row.contact_number || 'N/A'}</Typography>
			),
		},
		{
			field: 'is_suspended',
			label: 'Account State',
			render: (_: any, row: AdminUserItem) => (
				<Chip
					label={row.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
					size="small"
					color={row.is_suspended ? 'error' : 'success'}
					sx={{ fontWeight: 700 }}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Moderation Actions',
			render: (_: any, row: AdminUserItem) => {
				const isBusy = actionLoadingId === (row.public_id || String(row.id))
				return (
					<Stack direction="row" spacing={1} alignItems="center">
						<Tooltip title={row.is_suspended ? 'Unsuspend Account' : 'Suspend Account'}>
							<span>
								<AppButton
									label={row.is_suspended ? 'Unsuspend' : 'Suspend'}
									size="small"
									color={row.is_suspended ? 'success' : 'error'}
									startIcon={row.is_suspended ? <CheckCircleOutlineIcon /> : <BlockIcon />}
									onClick={() => handleToggleSuspend(row)}
									disabled={isBusy}
								/>
							</span>
						</Tooltip>

						<Tooltip title="Reset Blocked OTP State">
							<span>
								<AppButton
									label="Reset OTP"
									size="small"
									variant="outlined"
									startIcon={<LockResetIcon />}
									onClick={() => handleResetOtp(row)}
									disabled={isBusy}
								/>
							</span>
						</Tooltip>

						{row.role === 'patient' && row.patient_id && (
							<Tooltip title="View Patient Details">
								<span>
									<IconButton
										size="small"
										onClick={() => handleOpenPatientDrawer(row)}
										sx={{
											color: '#0d9488',
											border: '1px solid #e2e8f0',
											'&:hover': { bgcolor: 'rgba(13, 148, 136, 0.08)' },
										}}
									>
										<VisibilityIcon fontSize="small" />
									</IconButton>
								</span>
							</Tooltip>
						)}

						{row.role === 'doctor' && row.doctor_id && (
							<Tooltip title="View Doctor Details">
								<span>
									<IconButton
										size="small"
										onClick={() => handleOpenDoctorDrawer(row)}
										sx={{
											color: '#0d9488',
											border: '1px solid #e2e8f0',
											'&:hover': { bgcolor: 'rgba(13, 148, 136, 0.08)' },
										}}
									>
										<VisibilityIcon fontSize="small" />
									</IconButton>
								</span>
							</Tooltip>
						)}

						{row.role === 'pharmacy' && row.pharmacy_id && (
							<Tooltip title="View Pharmacy Details">
								<span>
									<IconButton
										size="small"
										onClick={() => handleOpenProviderDrawer(row)}
										sx={{
											color: '#0d9488',
											border: '1px solid #e2e8f0',
											'&:hover': { bgcolor: 'rgba(13, 148, 136, 0.08)' },
										}}
									>
										<VisibilityIcon fontSize="small" />
									</IconButton>
								</span>
							</Tooltip>
						)}

						{row.role === 'laboratory' && row.laboratory_id && (
							<Tooltip title="View Laboratory Details">
								<span>
									<IconButton
										size="small"
										onClick={() => handleOpenProviderDrawer(row)}
										sx={{
											color: '#0d9488',
											border: '1px solid #e2e8f0',
											'&:hover': { bgcolor: 'rgba(13, 148, 136, 0.08)' },
										}}
									>
										<VisibilityIcon fontSize="small" />
									</IconButton>
								</span>
							</Tooltip>
						)}
						{row.role === 'radiology' && row.radiology_id && (
							<Tooltip title="View Radiology Details">
								<span>
									<IconButton
										size="small"
										onClick={() => handleOpenProviderDrawer(row)}
										sx={{
											color: '#0d9488',
											border: '1px solid #e2e8f0',
											'&:hover': { bgcolor: 'rgba(13, 148, 136, 0.08)' },
										}}
									>
										<VisibilityIcon fontSize="small" />
									</IconButton>
								</span>
							</Tooltip>
						)}
					</Stack>
				)
			},
		},
	]

	return (
		<Box>
			<SectionCard title="User Moderation & Account Oversight">
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Manage system accounts, handle suspensions, and reset security states
				</Typography>
				<Box sx={{ mb: 3, maxWidth: 300 }}>
					<AppSelect
						label="Filter by Role"
						options={ROLE_OPTIONS}
						value={selectedRole}
						onChange={(e) => { setSelectedRole(e.target.value); setPage(1) }}
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
							Loading users directory...
						</Typography>
					</Stack>
				) : (
					<>
						<AppTable columns={columns as any} rows={users as any} emptyMessage="No users found matching criteria." />
						<TablePagination
							component="div"
							count={total}
							page={page - 1}
							onPageChange={(_, newPage) => setPage(newPage + 1)}
							rowsPerPage={pageSize}
							onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1) }}
							rowsPerPageOptions={[10, 25, 50]}
						/>
					</>
				)}
			</SectionCard>

			{/* ── Patient Details Drawer ─────────────────────────────────────────── */}
			<AppDrawer
				open={patientDrawerOpen}
				onClose={handleClosePatientDrawer}
				title={patientDetail?.personal_info?.name ? `Patient Details -- ${patientDetail.personal_info.name}` : 'Patient Details'}
				subtitle={patientDetail?.personal_info?.relation ? `Profile: ${patientDetail.personal_info.relation}` : undefined}
				onConfirm={handleClosePatientDrawer}
				confirmLabel="Close"
				cancelLabel=""
				width={480}
				sx={{ top: '56px', height: 'calc(100% - 82px)' }}
			>
				{patientDetailLoading ? (
					<Stack alignItems="center" sx={{ py: 6 }}>
						<CircularProgress size={28} sx={{ color: '#0d9488' }} />
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							Loading patient details...
						</Typography>
					</Stack>
				) : !patientDetail ? (
					<Alert severity="warning" sx={{ mt: 2 }}>
						Patient details could not be loaded.
					</Alert>
				) : (
					<Box>
						{/* Section 1 — Personal Information */}
						<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
							<Avatar
								src={buildS3Url(patientDetail.personal_info.avatar_s3_key)}
								sx={{ width: 56, height: 56, bgcolor: '#e2e8f0', color: '#0f172a' }}
							>
								<PersonIcon />
							</Avatar>
							<Box>
								<Typography variant="subtitle1" fontWeight={700}>
									{patientDetail.personal_info.name}
								</Typography>
								<Chip
									label={patientDetail.personal_info.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
									size="small"
									color={patientDetail.personal_info.is_suspended ? 'error' : 'success'}
									sx={{ fontWeight: 700, mt: 0.5 }}
								/>
							</Box>
						</Stack>

						<SectionHeader title="Personal Information" />
						<InfoRow label="Patient ID" value={patientDetail.personal_info.patient_id} />
						<InfoRow label="Email" value={patientDetail.personal_info.email} />
						<InfoRow label="Phone Number" value={patientDetail.personal_info.contact_number} />
						<InfoRow label="Gender" value={patientDetail.personal_info.gender} />
						<InfoRow
							label="Date of Birth / Age"
							value={
								patientDetail.personal_info.date_of_birth
									? `${patientDetail.personal_info.date_of_birth}${patientDetail.personal_info.age != null ? ` (${patientDetail.personal_info.age} yrs)` : ''}`
									: null
							}
						/>
						<InfoRow label="Blood Group" value={patientDetail.personal_info.blood_group} />
						<InfoRow label="Marital Status" value={patientDetail.personal_info.marital_status} />
						<InfoRow label="Occupation" value={patientDetail.personal_info.occupation} />
						<InfoRow label="Address" value={patientDetail.personal_info.address} />
						<InfoRow
							label="Registration Date"
							value={
								patientDetail.personal_info.registration_date
									? new Date(patientDetail.personal_info.registration_date).toLocaleDateString()
									: null
							}
						/>
						<InfoRow label="Status" value={patientDetail.personal_info.is_suspended ? 'Suspended' : 'Active'} />

						<Divider sx={{ my: 2 }} />

						{/* Section 2 — Ratings & Reviews */}
						<SectionHeader title="Ratings & Reviews" />
						{patientDetail.reviews.length > 0 ? (
							<Stack spacing={1.5} sx={{ mt: 1 }}>
								{patientDetail.reviews.map((review) => (
									<Box
										key={review.id}
										sx={{
											p: 1.5,
											bgcolor: '#f8fafc',
											borderRadius: 2,
											border: '1px solid #e2e8f0',
										}}
									>
										<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
											<Box>
												<Typography variant="body2" fontWeight={700}>
													{review.doctor_name || 'Doctor'}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{review.hospital_name || 'N/A'}
												</Typography>
											</Box>
											<Rating value={review.rating} readOnly size="small" />
										</Stack>
										{review.comment && (
											<Typography variant="body2" sx={{ mt: 1, fontSize: '13px', lineHeight: 1.6 }}>
												{review.comment}
											</Typography>
										)}
										<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
											{review.review_date ? new Date(review.review_date).toLocaleDateString() : 'N/A'}
										</Typography>
									</Box>
								))}
							</Stack>
						) : (
							<Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
								This patient has not submitted any reviews yet.
							</Typography>
						)}

						<Divider sx={{ my: 2 }} />

						{/* Section 3 — Linked Profiles */}
						<SectionHeader title="Linked Profiles" />
						{patientDetail.linked_profiles.length > 1 ? (
							<Stack spacing={1} sx={{ mt: 1 }}>
								{patientDetail.linked_profiles.map((profile) => (
									<Box
										key={profile.patient_id}
										onClick={() => handleSwitchLinkedProfile(profile.patient_id)}
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 1.5,
											p: 1.25,
											borderRadius: 2,
											border: '1px solid',
											borderColor: profile.is_current ? '#0d9488' : '#e2e8f0',
											bgcolor: profile.is_current ? 'rgba(13, 148, 136, 0.06)' : '#fff',
											cursor: 'pointer',
											'&:hover': { borderColor: '#0d9488' },
										}}
									>
										<Avatar src={buildS3Url(profile.avatar_s3_key)} sx={{ width: 36, height: 36, bgcolor: '#e2e8f0' }}>
											<PersonIcon fontSize="small" />
										</Avatar>
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Typography variant="body2" fontWeight={700} noWrap>
												{profile.name}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{profile.relation || 'SELF'}
											</Typography>
										</Box>
										{profile.is_current && (
											<Chip label="Viewing" size="small" sx={{ bgcolor: '#0d9488', color: '#fff', fontWeight: 700 }} />
										)}
									</Box>
								))}
							</Stack>
						) : (
							<Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
								No linked family member profiles found.
							</Typography>
						)}
					</Box>
				)}
			</AppDrawer>

			{/* --- Doctor Details Drawer --- */}
			<AppDrawer
				open={doctorDrawerOpen}
				onClose={handleCloseDoctorDrawer}
				title={doctorDetail?.name ? `Doctor Details -- ${doctorDetail.name}` : 'Doctor Details'}
				onConfirm={handleCloseDoctorDrawer}
				confirmLabel="Close"
				cancelLabel=""
				width={480}
				sx={{ top: '56px', height: 'calc(100% - 82px)' }}
			>
				{doctorDetailLoading ? (
					<Stack alignItems="center" sx={{ py: 6 }}>
						<CircularProgress size={28} sx={{ color: '#0d9488' }} />
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							Loading doctor details...
						</Typography>
					</Stack>
				) : !doctorDetail ? (
					<Alert severity="warning" sx={{ mt: 2 }}>
						Doctor details could not be loaded.
					</Alert>
				) : (
					<Box>
						<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
							<Avatar sx={{ width: 56, height: 56, bgcolor: '#e2e8f0', color: '#0f172a' }}>
								<PersonIcon />
							</Avatar>
							<Box>
								<Typography variant="subtitle1" fontWeight={700}>
									{doctorDetail.name}
								</Typography>
								<Chip
									label={doctorDetail.is_verified ? 'VERIFIED' : 'NOT VERIFIED'}
									size="small"
									color={doctorDetail.is_verified ? 'success' : 'warning'}
									sx={{ fontWeight: 700, mt: 0.5 }}
								/>
							</Box>
						</Stack>

						<SectionHeader title="Personal Information" />
						<InfoRow label="Email" value={doctorDetail.email} />
						<InfoRow label="Phone Number" value={doctorDetail.contact_number} />
						<InfoRow label="Gender" value={doctorDetail.gender} />
						<InfoRow label="Date of Birth" value={doctorDetail.date_of_birth} />
						<InfoRow label="Location" value={doctorDetail.location} />

						<Divider sx={{ my: 2 }} />

						<SectionHeader title="Professional Information" />
						<InfoRow label="Registration Number" value={doctorDetail.registration_number} />
						<InfoRow label="Qualification" value={doctorDetail.qualification} />
						<InfoRow label="Experience" value={doctorDetail.experience_years != null ? `${doctorDetail.experience_years} yrs` : null} />
						<InfoRow label="Specialities" value={doctorDetail.specialities?.length ? doctorDetail.specialities.join(', ') : null} />
						<InfoRow label="Languages" value={doctorDetail.languages?.length ? doctorDetail.languages.join(', ') : null} />
						<InfoRow label="Hospital" value={doctorDetail.hospital} />
						<InfoRow label="Consultation Fee" value={doctorDetail.consultation_fee != null ? `${doctorDetail.consultation_fee}` : null} />
						<InfoRow label="About" value={doctorDetail.about} />
					</Box>
				)}
			</AppDrawer>

			{/* --- Pharmacy / Laboratory / Radiology Provider Details Drawer --- */}
			<AppDrawer
				open={providerDrawerOpen}
				onClose={handleCloseProviderDrawer}
				title={
					providerDetail?.owner_name
						? `${providerDetail.provider_type.charAt(0).toUpperCase() + providerDetail.provider_type.slice(1)} Details -- ${providerDetail.owner_name}`
						: 'Provider Details'
				}
				onConfirm={handleCloseProviderDrawer}
				confirmLabel="Close"
				cancelLabel=""
				width={480}
				sx={{ top: '56px', height: 'calc(100% - 82px)' }}
			>
				{providerDetailLoading ? (
					<Stack alignItems="center" sx={{ py: 6 }}>
						<CircularProgress size={28} sx={{ color: '#0d9488' }} />
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							Loading provider details...
						</Typography>
					</Stack>
				) : !providerDetail ? (
					<Alert severity="warning" sx={{ mt: 2 }}>
						Provider details could not be loaded.
					</Alert>
				) : (
					<Box>
						<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
							<Avatar src={buildS3Url(providerDetail.avatar_s3_key)} sx={{ width: 56, height: 56, bgcolor: '#e2e8f0', color: '#0f172a' }}>
								<PersonIcon />
							</Avatar>
							<Box>
								<Typography variant="subtitle1" fontWeight={700}>
									{providerDetail.owner_name}
								</Typography>
								<Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }}>
									<Chip
										label={providerDetail.is_verified ? 'VERIFIED' : 'NOT VERIFIED'}
										size="small"
										color={providerDetail.is_verified ? 'success' : 'warning'}
										sx={{ fontWeight: 700 }}
									/>
									<Chip
										label={providerDetail.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
										size="small"
										color={providerDetail.is_suspended ? 'error' : 'success'}
										sx={{ fontWeight: 700 }}
									/>
								</Stack>
							</Box>
						</Stack>

						<SectionHeader title="Business Information" />
						<InfoRow label="Business Name" value={providerDetail.business_name} />
						<InfoRow label="Owner Name" value={providerDetail.owner_name} />
						<InfoRow label="Email" value={providerDetail.email} />
						<InfoRow label="Phone Number" value={providerDetail.contact_number} />
						<InfoRow label="Alternate Mobile" value={providerDetail.alternate_mobile} />
						<InfoRow label="WhatsApp Number" value={providerDetail.whatsapp_number} />

						<Divider sx={{ my: 2 }} />

						<SectionHeader title="Compliance & Location" />
						<InfoRow label="License Number" value={providerDetail.license_number} />
						<InfoRow label="GST Number" value={providerDetail.gst_number} />
						<InfoRow label="Address" value={providerDetail.address} />
						<InfoRow label="City" value={providerDetail.city} />
						<InfoRow label="State" value={providerDetail.state} />
						<InfoRow label="Pincode" value={providerDetail.pincode} />
						<InfoRow
							label="Registration Date"
							value={providerDetail.registration_date ? new Date(providerDetail.registration_date).toLocaleDateString() : null}
						/>
					</Box>
				)}
			</AppDrawer>
		</Box>
	)
}
