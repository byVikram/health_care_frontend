// src/features/admin/pages/AdminUserDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	Box,
	Grid,
	Typography,
	Chip,
	Stack,
	CircularProgress,
	Alert,
	Avatar,
	Divider,
	Rating,
	Button,
	Tabs,
	Tab,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import EventIcon from '@mui/icons-material/Event'
import StarIcon from '@mui/icons-material/Star'
import GroupsIcon from '@mui/icons-material/Groups'
import BadgeIcon from '@mui/icons-material/Badge'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'

import SectionCard from '../../../components/common/Card/SectionCard'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import StatusBadge from '../../../components/admin/StatusBadge'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import {
	getPatientAdminDetail,
	getDoctorAdminDetail,
	getProviderAdminDetail,
	AdminPatientDetail,
	DoctorVerificationDetail,
	AdminProviderDetail,
	AdminUpcomingAppointment,
} from '../adminService'
import { buildS3Url } from '../../../utils/s3'
import { ROUTES } from '../../../constants/routes'

type DetailRole = 'patient' | 'doctor' | 'pharmacy' | 'laboratory' | 'radiology'

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

function InfoTile({ label, value }: { label: string; value?: string | number | null }) {
	return (
		<Box
			sx={{
				p: 2,
				bgcolor: '#f8fafc',
				borderRadius: '10px',
				border: '1px solid #e2e8f0',
				height: '100%',
				boxSizing: 'border-box',
			}}
		>
			<Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>
				{label}
			</Typography>
			<Typography variant="body1" fontWeight={700} color="#0f172a" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
				{value ?? '—'}
			</Typography>
		</Box>
	)
}

function AppointmentsList({ appointments, nameLabel }: { appointments: AdminUpcomingAppointment[]; nameLabel: 'doctor_name' | 'patient_name' }) {
	if (!appointments.length) {
		return (
			<AdminEmptyState
				icon={<EventIcon />}
				title="No upcoming appointments"
				description="There are no scheduled appointments for this account."
			/>
		)
	}

	return (
		<Grid container spacing={2}>
			{appointments.map((appt) => (
				<Grid size={{ xs: 12, sm: 6 }} key={appt.id}>
					<Box
						sx={{
							p: 2.25,
							bgcolor: '#f8fafc',
							borderRadius: '12px',
							border: '1px solid #e2e8f0',
							transition: 'all 0.15s ease',
							'&:hover': { borderColor: '#0d9488', bgcolor: '#ffffff', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' },
						}}
					>
						<Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
							<Box>
								<Typography variant="subtitle2" fontWeight={800} color="#0f172a">
									{appt[nameLabel] || (nameLabel === 'doctor_name' ? 'Doctor' : 'Patient')}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{appt.hospital_name || 'Clinic / Hospital'}
								</Typography>
							</Box>
							<StatusBadge status={appt.status || 'scheduled'} />
						</Stack>
						<Divider sx={{ my: 1, borderColor: '#e2e8f0' }} />
						<Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }}>
							📅 {appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
							{appt.start_time ? ` • ⏰ ${appt.start_time}` : ''}
						</Typography>
					</Box>
				</Grid>
			))}
		</Grid>
	)
}

export default function AdminUserDetailPage() {
	const { role, id } = useParams<{ role: string; id: string }>()
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [patientDetail, setPatientDetail] = useState<AdminPatientDetail | null>(null)
	const [doctorDetail, setDoctorDetail] = useState<DoctorVerificationDetail | null>(null)
	const [providerDetail, setProviderDetail] = useState<AdminProviderDetail | null>(null)
	const [activePatientId, setActivePatientId] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState<'profile' | 'appointments' | 'reviews' | 'linked'>('profile')

	const detailRole = (role as DetailRole) || 'patient'

	const fetchPatient = async (patientId: string) => {
		setLoading(true)
		setError(null)
		try {
			const res = await getPatientAdminDetail(patientId)
			if (res.success && res.data) {
				setPatientDetail(res.data)
				setActivePatientId(patientId)
			} else {
				setError('Patient details could not be loaded.')
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to load patient details.'))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (!id) return

		if (detailRole === 'patient') {
			fetchPatient(id)
			return
		}

		setLoading(true)
		setError(null)

		if (detailRole === 'doctor') {
			getDoctorAdminDetail(id)
				.then((res) => {
					if (res.success && res.data) setDoctorDetail(res.data)
					else setError('Doctor details could not be loaded.')
				})
				.catch((err: unknown) => setError(getErrorMessage(err, 'Failed to load doctor details.')))
				.finally(() => setLoading(false))
			return
		}

		getProviderAdminDetail(detailRole, id)
			.then((res) => {
				if (res.success && res.data) setProviderDetail(res.data)
				else setError('Provider details could not be loaded.')
			})
			.catch((err: unknown) => setError(getErrorMessage(err, 'Failed to load provider details.')))
			.finally(() => setLoading(false))
	}, [id, detailRole])

	const handleBack = () => navigate(ROUTES.ADMIN.USERS)

	const handleSwitchLinkedProfile = (patientId: string) => {
		if (patientId === activePatientId) return
		fetchPatient(patientId)
	}

	const userName =
		detailRole === 'patient'
			? patientDetail?.personal_info?.name
			: detailRole === 'doctor'
				? doctorDetail?.name
				: providerDetail?.business_name || providerDetail?.owner_name

	const userEmail =
		detailRole === 'patient'
			? patientDetail?.personal_info?.email
			: detailRole === 'doctor'
				? doctorDetail?.email
				: providerDetail?.email

	const userPhone =
		detailRole === 'patient'
			? patientDetail?.personal_info?.contact_number
			: detailRole === 'doctor'
				? doctorDetail?.contact_number
				: providerDetail?.contact_number

	const isSuspended =
		detailRole === 'patient'
			? patientDetail?.personal_info?.is_suspended
			: detailRole === 'doctor'
				? false
				: providerDetail?.is_suspended

	const isVerified =
		detailRole === 'doctor'
			? doctorDetail?.is_verified
			: detailRole === 'patient'
				? true
				: providerDetail?.is_verified

	const avatarUrl =
		detailRole === 'patient'
			? buildS3Url(patientDetail?.personal_info?.avatar_s3_key)
			: providerDetail
				? buildS3Url(providerDetail?.avatar_s3_key)
				: undefined

	return (
		<Box>
			<AdminPageHeader
				title={userName ? userName : 'User Account Details'}
				subtitle={`Detailed profile and activity insights for ${detailRole.toUpperCase()} account #${id}`}
				actions={
					<Button
						variant="outlined"
						startIcon={<ArrowBackIcon />}
						onClick={handleBack}
						sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#0f172a', color: '#0f172a' } }}
					>
						Back to Directory
					</Button>
				}
			/>

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading account details...
					</Typography>
				</Stack>
			) : error ? (
				<Alert severity="warning" sx={{ borderRadius: 2 }}>
					{error}
				</Alert>
			) : (
				<>
					{/* Profile Hero Header Card */}
					<Box
						sx={{
							p: 3.5,
							mb: 3.5,
							borderRadius: '16px',
							bgcolor: '#0f172a',
							color: '#ffffff',
							boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
							backgroundImage:
								'radial-gradient(at 90% 10%, rgba(13, 148, 136, 0.3) 0px, transparent 60%), radial-gradient(at 10% 90%, rgba(30, 58, 138, 0.25) 0px, transparent 60%)',
						}}
					>
						<Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={3}>
							<Stack direction="row" spacing={3} alignItems="center">
								<Avatar
									src={avatarUrl}
									sx={{
										width: 72,
										height: 72,
										bgcolor: '#0d9488',
										color: '#ffffff',
										fontSize: 28,
										fontWeight: 800,
										boxShadow: '0 4px 20px rgba(13, 148, 136, 0.4)',
										border: '3px solid rgba(255,255,255,0.15)',
									}}
								>
									{(userName || 'U').substring(0, 1).toUpperCase()}
								</Avatar>

								<Box>
									<Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
										<Typography variant="h5" fontWeight={800} sx={{ color: '#ffffff', letterSpacing: -0.4 }}>
											{userName || 'User Account'}
										</Typography>
										<Chip
											label={detailRole.toUpperCase()}
											size="small"
											sx={{ bgcolor: '#0d9488', color: '#ffffff', fontWeight: 700, fontSize: '0.68rem', borderRadius: '6px' }}
										/>
										<StatusBadge status={isSuspended ? 'suspended' : 'active'} />
										{isVerified !== undefined && (
											<StatusBadge
												status={isVerified ? 'verified' : 'pending'}
												label={isVerified ? 'VERIFIED' : 'UNVERIFIED'}
											/>
										)}
									</Stack>

									<Stack direction="row" alignItems="center" spacing={2.5} sx={{ mt: 1.5, color: '#94a3b8' }} flexWrap="wrap">
										{userEmail && (
											<Stack direction="row" alignItems="center" spacing={0.75}>
												<EmailIcon sx={{ fontSize: 15, color: '#2dd4bf' }} />
												<Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: 13 }}>{userEmail}</Typography>
											</Stack>
										)}
										{userPhone && (
											<Stack direction="row" alignItems="center" spacing={0.75}>
												<PhoneIcon sx={{ fontSize: 15, color: '#2dd4bf' }} />
												<Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: 13 }}>{userPhone}</Typography>
											</Stack>
										)}
										<Stack direction="row" alignItems="center" spacing={0.75}>
											<BadgeIcon sx={{ fontSize: 15, color: '#2dd4bf' }} />
											<Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: 13 }}>ID: #{id}</Typography>
										</Stack>
									</Stack>
								</Box>
							</Stack>
						</Stack>
					</Box>

					{/* Tabbed Detail Section */}
					<SectionCard title="Account Navigation" noPadding>
						<Tabs
							value={activeTab}
							onChange={(_, v) => setActiveTab(v)}
							sx={{
								px: 3,
								pt: 2,
								borderBottom: '1px solid #e2e8f0',
								'& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13.5, pb: 1.75 },
								'& .Mui-selected': { color: '#0d9488 !important' },
								'& .MuiTabs-indicator': { bgcolor: '#0d9488', height: 3 },
							}}
						>
							<Tab value="profile" label="Profile Overview" icon={<PersonIcon sx={{ fontSize: 17 }} />} iconPosition="start" />
							<Tab
								value="appointments"
								label={
									detailRole === 'patient'
										? `Appointments (${patientDetail?.upcoming_appointments?.length || 0})`
										: detailRole === 'doctor'
											? `Appointments (${doctorDetail?.upcoming_appointments?.length || 0})`
											: 'Appointments'
								}
								icon={<EventIcon sx={{ fontSize: 17 }} />}
								iconPosition="start"
							/>
							{detailRole === 'patient' && (
								<Tab value="reviews" label={`Reviews (${patientDetail?.reviews?.length || 0})`} icon={<StarIcon sx={{ fontSize: 17 }} />} iconPosition="start" />
							)}
							{detailRole === 'patient' && (
								<Tab value="linked" label={`Linked Family (${patientDetail?.linked_profiles?.length || 0})`} icon={<GroupsIcon sx={{ fontSize: 17 }} />} iconPosition="start" />
							)}
						</Tabs>

						<Box sx={{ p: 3 }}>
							{/* TAB 1: Profile Overview */}
							{activeTab === 'profile' && (
								<Box>
									{detailRole === 'patient' && patientDetail && (
										<Grid container spacing={2}>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Patient ID" value={patientDetail.personal_info.patient_id} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Email Address" value={patientDetail.personal_info.email} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Phone Number" value={patientDetail.personal_info.contact_number} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Gender" value={patientDetail.personal_info.gender} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}>
												<InfoTile
													label="Date of Birth / Age"
													value={patientDetail.personal_info.date_of_birth ? `${patientDetail.personal_info.date_of_birth} (${patientDetail.personal_info.age ?? '—'} yrs)` : null}
												/>
											</Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Blood Group" value={patientDetail.personal_info.blood_group} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Marital Status" value={patientDetail.personal_info.marital_status} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Occupation" value={patientDetail.personal_info.occupation} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Registration Date" value={patientDetail.personal_info.registration_date ? new Date(patientDetail.personal_info.registration_date).toLocaleDateString('en-IN') : null} /></Grid>
											<Grid size={{ xs: 12 }}><InfoTile label="Primary Address" value={patientDetail.personal_info.address} /></Grid>
										</Grid>
									)}

									{detailRole === 'doctor' && doctorDetail && (
										<Grid container spacing={2}>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Doctor ID" value={doctorDetail.id} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Email Address" value={doctorDetail.email} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Phone Number" value={doctorDetail.contact_number} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Registration Number" value={doctorDetail.registration_number} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Qualification" value={doctorDetail.qualification} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Experience" value={doctorDetail.experience_years != null ? `${doctorDetail.experience_years} years` : null} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Specialities" value={doctorDetail.specialities?.join(', ')} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Hospital Affiliation" value={doctorDetail.hospital} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Consultation Fee" value={doctorDetail.consultation_fee != null ? `₹${doctorDetail.consultation_fee}` : null} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Languages" value={doctorDetail.languages?.join(', ')} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 8 }}><InfoTile label="Location" value={doctorDetail.location} /></Grid>
											{doctorDetail.about && (
												<Grid size={{ xs: 12 }}>
													<InfoTile label="About Summary" value={doctorDetail.about} />
												</Grid>
											)}
										</Grid>
									)}

									{providerDetail && (
										<Grid container spacing={2}>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Business Name" value={providerDetail.business_name} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Owner Name" value={providerDetail.owner_name} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Email Address" value={providerDetail.email} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Phone Number" value={providerDetail.contact_number} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="Alternate Mobile" value={providerDetail.alternate_mobile} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="WhatsApp Number" value={providerDetail.whatsapp_number} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="License Number" value={providerDetail.license_number} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="GST Number" value={providerDetail.gst_number} /></Grid>
											<Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoTile label="City & State" value={providerDetail.city ? `${providerDetail.city}, ${providerDetail.state || ''}` : null} /></Grid>
											<Grid size={{ xs: 12 }}><InfoTile label="Full Address" value={providerDetail.address} /></Grid>
										</Grid>
									)}
								</Box>
							)}

							{/* TAB 2: Appointments */}
							{activeTab === 'appointments' && (
								<AppointmentsList
									appointments={
										detailRole === 'patient'
											? patientDetail?.upcoming_appointments || []
											: detailRole === 'doctor'
												? doctorDetail?.upcoming_appointments || []
												: []
									}
									nameLabel={detailRole === 'patient' ? 'doctor_name' : 'patient_name'}
								/>
							)}

							{/* TAB 3: Reviews */}
							{activeTab === 'reviews' && patientDetail && (
								<Box>
									{patientDetail.reviews.length > 0 ? (
										<Grid container spacing={2}>
											{patientDetail.reviews.map((rev) => (
												<Grid size={{ xs: 12, sm: 6 }} key={rev.id}>
													<Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
														<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
															<Box>
																<Typography variant="subtitle2" fontWeight={700}>{rev.doctor_name || 'Doctor'}</Typography>
																<Typography variant="caption" color="text.secondary">{rev.hospital_name || 'Clinic'}</Typography>
															</Box>
															<Rating value={rev.rating} readOnly size="small" />
														</Stack>
														{rev.comment && (
															<Typography variant="body2" sx={{ mt: 1.5, color: '#334155', fontSize: '13px', lineHeight: 1.6 }}>
																"{rev.comment}"
															</Typography>
														)}
														<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
															{rev.review_date ? new Date(rev.review_date).toLocaleDateString('en-IN') : ''}
														</Typography>
													</Box>
												</Grid>
											))}
										</Grid>
									) : (
										<AdminEmptyState
											icon={<StarIcon />}
											title="No reviews submitted"
											description="This patient has not reviewed any doctors yet."
										/>
									)}
								</Box>
							)}

							{/* TAB 4: Linked Family Profiles */}
							{activeTab === 'linked' && patientDetail && (
								<Box>
									{patientDetail.linked_profiles.length > 0 ? (
										<Grid container spacing={2}>
											{patientDetail.linked_profiles.map((profile) => (
												<Grid size={{ xs: 12, sm: 6, md: 4 }} key={profile.patient_id}>
													<Box
														onClick={() => handleSwitchLinkedProfile(profile.patient_id)}
														sx={{
															p: 2,
															borderRadius: '12px',
															border: '2px solid',
															borderColor: profile.is_current ? '#0d9488' : '#e2e8f0',
															bgcolor: profile.is_current ? 'rgba(13, 148, 136, 0.05)' : '#ffffff',
															cursor: 'pointer',
															transition: 'all 0.15s ease',
															'&:hover': { borderColor: '#0d9488' },
														}}
													>
														<Stack direction="row" spacing={2} alignItems="center">
															<Avatar src={buildS3Url(profile.avatar_s3_key)} sx={{ width: 44, height: 44, bgcolor: '#e2e8f0' }}>
																<PersonIcon />
															</Avatar>
															<Box sx={{ flex: 1, minWidth: 0 }}>
																<Typography variant="subtitle2" fontWeight={700} noWrap>
																	{profile.name}
																</Typography>
																<Typography variant="caption" color="text.secondary">
																	Relation: {profile.relation || 'SELF'}
																</Typography>
															</Box>
															{profile.is_current && (
																<Chip label="Active" size="small" sx={{ bgcolor: '#0d9488', color: '#fff', fontWeight: 700, fontSize: '0.65rem' }} />
															)}
														</Stack>
													</Box>
												</Grid>
											))}
										</Grid>
									) : (
										<AdminEmptyState
											icon={<GroupsIcon />}
											title="No linked family profiles"
											description="No family member profiles are associated with this patient account."
										/>
									)}
								</Box>
							)}
						</Box>
					</SectionCard>
				</>
			)}
		</Box>
	)
}
