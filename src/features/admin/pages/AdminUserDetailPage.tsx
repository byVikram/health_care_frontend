// src/features/admin/pages/AdminUserDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	Box,
	Tabs,
	Tab,
	Typography,
	Chip,
	Stack,
	CircularProgress,
	Alert,
	Avatar,
	Divider,
	Rating,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import EventIcon from '@mui/icons-material/Event'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppButton from '../../../components/common/Button/AppButton'
import AdminAppointmentsPanel from '../components/AdminAppointmentsPanel'
import {
	getPatientAdminDetail,
	getDoctorAdminDetail,
	getProviderAdminDetail,
	AdminPatientDetail,
	DoctorVerificationDetail,
	AdminProviderDetail,
} from '../adminService'
import { buildS3Url } from '../../../utils/s3'
import { ROUTES } from '../../../constants/routes'

type DetailRole = 'patient' | 'doctor' | 'pharmacy' | 'laboratory' | 'radiology'
type DetailTab = 'info' | 'ratings' | 'appointments'

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

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

function DetailTabs({
	value,
	onChange,
	showRatings,
}: {
	value: DetailTab
	onChange: (tab: DetailTab) => void
	showRatings: boolean
}) {
	return (
		<Tabs
			value={value}
			onChange={(_, val) => onChange(val)}
			sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}
		>
			<Tab
				value="info"
				label="Info"
				icon={<InfoOutlinedIcon />}
				iconPosition="start"
				sx={{ fontWeight: 700, textTransform: 'none' }}
			/>
			{showRatings && (
				<Tab
					value="ratings"
					label="Ratings"
					icon={<StarBorderIcon />}
					iconPosition="start"
					sx={{ fontWeight: 700, textTransform: 'none' }}
				/>
			)}
			<Tab
				value="appointments"
				label="Appointments"
				icon={<EventIcon />}
				iconPosition="start"
				sx={{ fontWeight: 700, textTransform: 'none' }}
			/>
		</Tabs>
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
	const [activeTab, setActiveTab] = useState<DetailTab>('info')

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

		setActiveTab('info')

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

		// pharmacy / laboratory / radiology
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

	const pageTitle =
		detailRole === 'patient'
			? patientDetail?.personal_info?.name
			: detailRole === 'doctor'
				? doctorDetail?.name
				: providerDetail?.owner_name

	return (
		<Box>
			<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
				<AppButton
					label="Back to Users"
					variant="outlined"
					size="small"
					startIcon={<ArrowBackIcon />}
					onClick={handleBack}
				/>
			</Stack>

			<SectionCard title={pageTitle ? `${pageTitle} -- Account Details` : 'Account Details'}>
				{loading ? (
					<Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
						<CircularProgress sx={{ color: '#0d9488' }} />
						<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
							Loading account details...
						</Typography>
					</Stack>
				) : error ? (
					<Alert severity="warning" sx={{ mt: 2 }}>
						{error}
					</Alert>
				) : detailRole === 'patient' && patientDetail ? (
					<Box>
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

						<DetailTabs value={activeTab} onChange={setActiveTab} showRatings />

						{activeTab === 'info' && (
							<Box>
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

								<Divider sx={{ my: 2 }} />

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

						{activeTab === 'ratings' && (
							<Box>
								{patientDetail.reviews.length > 0 ? (
									<Stack spacing={1.5} sx={{ mt: 1 }}>
										{patientDetail.reviews.map((review) => (
											<Box
												key={review.id}
												sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}
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
							</Box>
						)}

						{activeTab === 'appointments' && (
							<AdminAppointmentsPanel
								patientId={patientDetail.personal_info.patient_id}
								emptyMessage="No appointments found for this patient."
							/>
						)}
					</Box>
				) : detailRole === 'doctor' && doctorDetail ? (
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

						<DetailTabs value={activeTab} onChange={setActiveTab} showRatings={false} />

						{activeTab === 'info' && (
							<Box>
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

						{activeTab === 'appointments' && (
							<AdminAppointmentsPanel
								doctorId={doctorDetail.id}
								emptyMessage="No appointments found for this doctor."
							/>
						)}
					</Box>
				) : providerDetail ? (
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
				) : (
					<Alert severity="warning" sx={{ mt: 2 }}>
						Account details could not be loaded.
					</Alert>
				)}
			</SectionCard>
		</Box>
	)
}
