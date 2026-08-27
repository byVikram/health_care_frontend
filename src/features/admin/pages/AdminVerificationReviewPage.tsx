// src/features/admin/pages/AdminVerificationReviewPage.tsx
import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	Box,
	Typography,
	Chip,
	Stack,
	CircularProgress,
	Alert,
	Divider,
	IconButton,
	Tooltip,
	Avatar,
	Grid,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import BadgeIcon from '@mui/icons-material/Badge'
import SchoolIcon from '@mui/icons-material/School'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import PaymentsIcon from '@mui/icons-material/Payments'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import { toast } from 'react-toastify'

import { ROUTES } from '../../../constants/routes'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import StatusBadge from '../../../components/admin/StatusBadge'

import DocumentRail from '../../../components/admin/verification/DocumentRail'
import DocumentViewer from '../../../components/admin/verification/DocumentViewer'
import IssueFlagSelector from '../../../components/admin/verification/IssueFlagSelector'
import AuditTimeline, { AuditTimelineEvent } from '../../../components/admin/verification/AuditTimeline'
import VerificationActionBar from '../../../components/admin/verification/VerificationActionBar'

import {
	getDoctorVerificationDetail,
	getProvidersVerificationQueue,
	getProviderAdminDetail,
	verifyDoctor,
	verifyProvider,
	getVerificationAuditHistory,
	recordSingleDocumentReview,
	DoctorVerificationDetail,
	ProviderVerificationItem,
	AuditHistoryEventItem,
} from '../adminService'

export type DocumentStatus =
	| 'verified'
	| 'requires_reupload'
	| 'rejected'
	| 'not_reviewed'
	| 'flagged'
	| 'under_review'

export interface VerificationDocumentItem {
	id: string
	name: string
	url: string
	type: string
	status: DocumentStatus
	issueTag?: string
}

const getErrorMessage = (err: unknown, fallback: string) =>
	err instanceof Error ? err.message : fallback

function calculateAge(dateOfBirth?: string | null): number | null {
	if (!dateOfBirth) return null
	const dob = new Date(dateOfBirth)
	if (isNaN(dob.getTime())) return null
	const diffMs = Date.now() - dob.getTime()
	const ageDt = new Date(diffMs)
	return Math.abs(ageDt.getUTCFullYear() - 1970)
}

function formatDoctorName(rawName?: string | null): string {
	if (!rawName) return 'Dr. Applicant'
	const trimmed = rawName.trim()
	if (/^dr\.?/i.test(trimmed)) return trimmed
	return `Dr. ${trimmed}`
}

function InfoTile({
	label,
	value,
	icon,
}: {
	label: string
	value?: string | number | null
	icon?: React.ReactNode
}) {
	return (
		<Box sx={{ p: 1.25, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
				{icon}
				<Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
					{label}
				</Typography>
			</Stack>
			<Typography variant="body2" fontWeight={800} color="#0f172a" noWrap sx={{ fontSize: '13px' }}>
				{value || '—'}
			</Typography>
		</Box>
	)
}

export default function AdminVerificationReviewPage() {
	const { type, id } = useParams<{ type: string; id: string }>()
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [doctorDetail, setDoctorDetail] = useState<DoctorVerificationDetail | null>(null)
	const [providerItem, setProviderItem] = useState<ProviderVerificationItem | null>(null)

	// Documents inspection state
	const [documents, setDocuments] = useState<VerificationDocumentItem[]>([])
	const [selectedDocIndex, setSelectedDocIndex] = useState(0)

	// Issue flags & reviewer notes
	const [selectedFlags, setSelectedFlags] = useState<string[]>([])
	const [reviewerNotes, setReviewerNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)

	// Audit activity log timeline
	const [auditEvents, setAuditEvents] = useState<AuditTimelineEvent[]>([
		{
			id: '1',
			reviewerName: 'Admin Auditor',
			action: 'Opened verification session',
			timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		},
	])

	const isDoctor = type === 'doctor'
	const isNurse = type === 'ancillary' || type === 'nurse'

	const fetchData = useCallback(async () => {
		if (!id) return
		setLoading(true)
		setError(null)

		try {
			// 1. Fetch live audit history logs from backend first
			const targetType = isDoctor ? 'doctor' : isNurse ? 'ancillary' : type || 'provider'
			const auditRes = await getVerificationAuditHistory(targetType, id)
			let fetchedAuditLogs: AuditHistoryEventItem[] = []

			if (auditRes.success && auditRes.data) {
				fetchedAuditLogs = auditRes.data
				setAuditEvents(
					auditRes.data.map((item) => ({
						id: item.id,
						reviewerName: item.reviewer_name || 'Admin Auditor',
						action: item.action.replace('_', ' ').toUpperCase(),
						documentName: item.document_name,
						timestamp: item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
						reason: item.notes || (item.issue_tags && item.issue_tags.length > 0 ? item.issue_tags.join(', ') : undefined),
					}))
				)
			}

			// Helper to get doc status from audit logs
			const getDocStatus = (docId: string, docName: string): DocumentStatus => {
				const latestLog = fetchedAuditLogs.find(
					(log) =>
						log.document_id === docId ||
						(log.document_name && log.document_name.toLowerCase() === docName.toLowerCase())
				)
				if (latestLog) {
					if (latestLog.action === 'document_verified') return 'verified'
					if (latestLog.action === 'document_rejected') return 'rejected'
					if (latestLog.action === 'document_requires_reupload') return 'requires_reupload'
				}
				return 'not_reviewed'
			}

			const getDocIssueTag = (docId: string, docName: string): string | undefined => {
				const latestLog = fetchedAuditLogs.find(
					(log) =>
						log.document_id === docId ||
						(log.document_name && log.document_name.toLowerCase() === docName.toLowerCase())
				)
				return latestLog?.issue_tags && latestLog.issue_tags.length > 0
					? latestLog.issue_tags.join(', ')
					: undefined
			}

			// 2. Fetch doctor verification detail or providers / nurses
			if (isDoctor) {
				const res = await getDoctorVerificationDetail(id)
				if (res.success && res.data) {
					const data = res.data
					setDoctorDetail(data)

					// Build documents rail items
					const docs: VerificationDocumentItem[] = []

					if (data.documents && data.documents.length > 0) {
						data.documents.forEach((d) => {
							docs.push({
								id: String(d.id),
								name: d.name,
								url: d.url,
								type: d.type,
								status: getDocStatus(String(d.id), d.name),
								issueTag: getDocIssueTag(String(d.id), d.name),
							})
						})
					}

					if (data.degrees && data.degrees.length > 0) {
						data.degrees.forEach((deg, idx) => {
							if (deg.qualification_proof_s3_key) {
								const dId = `deg_proof_${idx}`
								const dName = `${deg.degree} Certificate${deg.college ? ` (${deg.college})` : ''}`
								if (!docs.some((d) => d.url === deg.qualification_proof_s3_key)) {
									docs.push({
										id: dId,
										name: dName,
										url: deg.qualification_proof_s3_key,
										type: 'degree_certificate',
										status: getDocStatus(dId, dName),
										issueTag: getDocIssueTag(dId, dName),
									})
								}
							}
						})
					}

					if (data.registration_proof_s3_key && !docs.some((d) => d.url === data.registration_proof_s3_key)) {
						const dId = 'reg_proof'
						const dName = 'Medical Registration License Proof'
						docs.push({
							id: dId,
							name: dName,
							url: data.registration_proof_s3_key,
							type: 'registration_license',
							status: getDocStatus(dId, dName),
							issueTag: getDocIssueTag(dId, dName),
						})
					}

					if (data.identity_proof_s3_key && !docs.some((d) => d.url === data.identity_proof_s3_key)) {
						const dId = 'id_proof'
						const dName = 'Government Photo ID Proof'
						docs.push({
							id: dId,
							name: dName,
							url: data.identity_proof_s3_key,
							type: 'identity_proof',
							status: getDocStatus(dId, dName),
							issueTag: getDocIssueTag(dId, dName),
						})
					}

					setDocuments(docs)
				} else {
					setError('Doctor verification details could not be loaded.')
				}
			} else {
				// Fetch detail endpoint for nurse / provider
				let matchedProvider: ProviderVerificationItem | null = null

				try {
					const detailRes = await getProviderAdminDetail(isNurse ? 'ancillary' : type || 'pharmacy', id)
					if (detailRes.success && detailRes.data) {
						const d = detailRes.data
						matchedProvider = {
							id: d.provider_id || id,
							public_id: d.provider_id || id,
							provider_type: (d.provider_type as any) || (type as any) || 'ancillary',
							name: d.owner_name || d.business_name || (isNurse ? 'Nurse Professional' : 'Provider'),
							owner_name: (d.owner_name || d.business_name) ?? undefined,
							email: d.email || undefined,
							contact_number: d.contact_number || undefined,
							license_number: d.license_number || undefined,
							license_proof_s3_key: d.avatar_s3_key || undefined,
							specialty: d.specialty || undefined,
							qualifications: d.qualifications || undefined,
							capabilities: d.capabilities || [],
							is_verified: d.is_verified,
							verification_status: d.verification_status || undefined,
							created_at: d.registration_date || new Date().toISOString(),
						}
					}
				} catch {
					// Fallback to queue if detail endpoint error
				}

				if (!matchedProvider) {
					const res = await getProvidersVerificationQueue()
					if (res.success && res.data) {
						const rawData = res.data as any
						const items: ProviderVerificationItem[] = Array.isArray(res.data)
							? res.data
							: Array.isArray(rawData.items)
							? rawData.items
							: [
									...(rawData.ancillary || []),
									...(rawData.pharmacies || []),
									...(rawData.radiology || []),
									...(rawData.laboratories || []),
							  ]
						const matched = items.find((p: ProviderVerificationItem) => p.id === id || p.public_id === id)
						if (matched) {
							matchedProvider = matched
						}
					}
				}

				if (matchedProvider) {
					setProviderItem(matchedProvider)
					const docs: VerificationDocumentItem[] = []

					if (matchedProvider.license_proof_s3_key) {
						const dId = 'prov_license'
						const dName = isNurse ? 'Nursing License Document' : 'Business License Proof'
						docs.push({
							id: dId,
							name: dName,
							url: matchedProvider.license_proof_s3_key,
							type: 'license',
							status: getDocStatus(dId, dName),
							issueTag: getDocIssueTag(dId, dName),
						})
					} else {
						const dId = 'nurse_credential'
						const dName = isNurse ? 'Nurse Professional Registration & License' : 'Facility Provider Registration'
						docs.push({
							id: dId,
							name: dName,
							url: '',
							type: 'registration_license',
							status: getDocStatus(dId, dName),
							issueTag: getDocIssueTag(dId, dName),
						})
					}
					setDocuments(docs)
				} else {
					setError('Verification details could not be loaded.')
				}
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to load verification record.'))
		} finally {
			setLoading(false)
		}
	}, [id, isDoctor, isNurse, type])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	// Keyboard shortcuts navigation (P for Prev, N for Next)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
			if (e.key === 'ArrowUp' || e.key === 'p' || e.key === 'P') {
				setSelectedDocIndex((prev) => Math.max(prev - 1, 0))
			} else if (e.key === 'ArrowDown' || e.key === 'n' || e.key === 'N') {
				setSelectedDocIndex((prev) => Math.min(prev + 1, documents.length - 1))
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [documents.length])

	// Sync issue flags and reviewer notes when document is selected/switched
	useEffect(() => {
		const activeDoc = documents[selectedDocIndex]
		if (activeDoc) {
			const flags = activeDoc.issueTag
				? activeDoc.issueTag.split(', ').map((f) => f.trim()).filter(Boolean)
				: []
			setSelectedFlags(flags)

			// Prefill notes from the latest audit event of this document if notes are empty
			const latestLog = auditEvents.find(
				(evt) =>
					evt.documentName &&
					activeDoc.name &&
					evt.documentName.toLowerCase() === activeDoc.name.toLowerCase()
			)
			setReviewerNotes(latestLog?.reason || '')
		} else {
			setSelectedFlags([])
			setReviewerNotes('')
		}
	}, [selectedDocIndex, documents, auditEvents])

	const handleBack = () => navigate(ROUTES.ADMIN.VERIFICATIONS)

	// Document-level action handler (saves to DB immediately)
	const handleDocAction = async (action: 'approve' | 'reject' | 'reupload') => {
		if (documents.length === 0 || !id) return
		const activeDoc = documents[selectedDocIndex]
		if (!activeDoc) return

		let nextStatus: DocumentStatus = 'verified'
		if (action === 'reject') nextStatus = 'rejected'
		if (action === 'reupload') nextStatus = 'requires_reupload'

		setDocuments((prev) =>
			prev.map((d, i) =>
				i === selectedDocIndex
					? {
							...d,
							status: nextStatus,
							issueTag: selectedFlags.length > 0 ? selectedFlags.join(', ') : undefined,
					  }
					: d
			)
		)

		setAuditEvents((prev) => [
			{
				id: String(Date.now()),
				reviewerName: 'Admin Auditor',
				action: `Marked document as ${nextStatus.toUpperCase()}`,
				documentName: activeDoc.name,
				timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				reason: selectedFlags.length > 0 ? selectedFlags.join(', ') : reviewerNotes || undefined,
			},
			...prev,
		])

		try {
			const targetType = isDoctor ? 'doctor' : isNurse ? 'ancillary' : type || 'provider'
			await recordSingleDocumentReview({
				target_type: targetType,
				target_id: id,
				document_id: activeDoc.id,
				document_name: activeDoc.name,
				status: nextStatus,
				issue_tags: selectedFlags,
				notes: reviewerNotes.trim() || undefined,
			})
			toast.success(`Document "${activeDoc.name}" status saved to database.`)
			await fetchData()
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to save document status to database.'))
		}
	}

	// Applicant-level action handler
	const handleApplicantAction = async (verdict: 'approve' | 'request_changes' | 'reject') => {
		if (!id) return
		setSubmitting(true)
		try {
			const isApproved = verdict === 'approve'
			const notesPayload = selectedFlags.length > 0 ? `${selectedFlags.join(', ')}; ${reviewerNotes}` : reviewerNotes

			const docReviewsPayload = documents.map((d) => ({
				document_id: d.id,
				document_name: d.name,
				status: d.status,
				issue_tags: d.issueTag ? [d.issueTag] : [],
			}))

			if (isDoctor) {
				const res = await verifyDoctor(id, {
					is_verified: isApproved,
					rejection_reason: !isApproved ? notesPayload.trim() || undefined : undefined,
					reviewer_notes: reviewerNotes.trim() || undefined,
					issue_flags: selectedFlags,
					document_reviews: docReviewsPayload,
				})
				if (res.success) {
					toast.success(`Doctor ${doctorDetail?.name || id} verification verdict submitted: ${verdict.toUpperCase()}.`)
					navigate(ROUTES.ADMIN.VERIFICATIONS)
				}
			} else {
				const pType = isNurse ? 'ancillary' : providerItem?.provider_type || (type as any) || 'pharmacy'
				const res = await verifyProvider(pType, id, {
					is_verified: isApproved,
					rejection_reason: !isApproved ? notesPayload.trim() || undefined : undefined,
					reviewer_notes: reviewerNotes.trim() || undefined,
					issue_flags: selectedFlags,
					document_reviews: docReviewsPayload,
				})
				if (res.success) {
					toast.success(`${isNurse ? 'Nurse' : 'Provider'} ${providerItem?.name || id} verification verdict submitted: ${verdict.toUpperCase()}.`)
					navigate(ROUTES.ADMIN.VERIFICATIONS)
				}
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Verification submission failed.'))
		} finally {
			setSubmitting(false)
		}
	}

	const handleToggleFlag = (flag: string) => {
		setSelectedFlags((prev) =>
			prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
		)
	}

	const rawName = isDoctor ? doctorDetail?.name : providerItem?.name
	const applicantDisplayName = isDoctor ? formatDoctorName(rawName) : (isNurse && rawName && !rawName.startsWith('Nurse') ? `Nurse ${rawName}` : rawName)
	const isVerified = isDoctor ? doctorDetail?.is_verified : providerItem?.is_verified
	const activeDocument = documents[selectedDocIndex] || null

	const doctorAge = calculateAge(doctorDetail?.date_of_birth)

	const qualificationsSummary = isDoctor
		? doctorDetail?.degrees && doctorDetail.degrees.length > 0
			? doctorDetail.degrees.map((d) => `${d.degree}${d.college ? ` (${d.college})` : ''}`).join(', ')
			: doctorDetail?.qualification
		: providerItem?.qualifications || (isNurse ? 'B.Sc Nursing Certified' : undefined)

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', bgcolor: '#f8fafc' }}>
			{/* CLEAN TOP NAVIGATION HEADER */}
			<Box sx={{ bgcolor: '#0f172a', color: '#ffffff', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
				<Box sx={{ px: 3, py: 1.5 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Stack direction="row" spacing={2} alignItems="center">
							<AppButton
								variant="outlined"
								size="small"
								startIcon={<ArrowBackIcon />}
								onClick={handleBack}
								label="Back to Queue"
								sx={{ borderRadius: 1.5, borderColor: '#334155', color: '#94a3b8', '&:hover': { borderColor: '#ffffff', color: '#ffffff' } }}
							/>

							<Stack direction="row" spacing={1.25} alignItems="center">
								<Typography variant="h6" fontWeight={800} color="#ffffff" sx={{ fontSize: 17 }}>
									{applicantDisplayName || 'Applicant'}
								</Typography>
								<Chip
									label={(isDoctor ? 'Doctor' : isNurse ? 'Nurse' : providerItem?.provider_type || 'Provider').toUpperCase()}
									size="small"
									sx={{ bgcolor: isDoctor || isNurse ? '#0d9488' : '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '0.62rem', height: 20 }}
								/>
								<StatusBadge status={isVerified ? 'verified' : (providerItem?.verification_status === 'rejected' ? 'rejected' : 'pending')} label={isVerified ? 'VERIFIED' : (providerItem?.verification_status === 'rejected' ? 'REJECTED' : 'AWAITING AUDIT')} />
							</Stack>
						</Stack>

						{/* Queue Document Navigation Shortcuts */}
						<Stack direction="row" spacing={1} alignItems="center">
							<Tooltip title="Previous Document (Key P / Arrow Up)">
								<span>
									<IconButton
										size="small"
										disabled={selectedDocIndex === 0}
										onClick={() => setSelectedDocIndex((prev) => Math.max(prev - 1, 0))}
										sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
									>
										<NavigateBeforeIcon />
									</IconButton>
								</span>
							</Tooltip>
							<Typography variant="caption" color="#94a3b8" fontWeight={700}>
								Doc {selectedDocIndex + 1} of {documents.length}
							</Typography>
							<Tooltip title="Next Document (Key N / Arrow Down)">
								<span>
									<IconButton
										size="small"
										disabled={selectedDocIndex >= documents.length - 1}
										onClick={() => setSelectedDocIndex((prev) => Math.min(prev + 1, documents.length - 1))}
										sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
									>
										<NavigateNextIcon />
									</IconButton>
								</span>
							</Tooltip>
						</Stack>
					</Stack>
				</Box>
			</Box>

			{/* DEDICATED APPLICANT PROFILE & DEMOGRAPHICS CARD (BELOW TOP HEADER) */}
			{!loading && !error && (
				<Box sx={{ px: 3, py: 2, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
					<Stack direction="row" spacing={2.5} alignItems="center">
						<Avatar
							sx={{
								width: 52,
								height: 52,
								bgcolor: isDoctor || isNurse ? '#0d9488' : '#2563eb',
								color: '#ffffff',
								fontSize: 22,
								fontWeight: 800,
								boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
							}}
						>
							{(applicantDisplayName || 'V').substring(0, 1).toUpperCase()}
						</Avatar>

						<Box sx={{ flex: 1 }}>
							<Typography variant="caption" fontWeight={800} color="#0d9488" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
								{isNurse ? 'Nurse Professional Profile & Credentials' : isDoctor ? 'Doctor Profile & Demographics' : 'Provider Profile & Business Credentials'}
							</Typography>

							<Grid container spacing={1.5}>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Demographics & Role"
										value={isDoctor ? `${doctorDetail?.gender || 'Gender N/A'} • ${doctorAge != null ? `${doctorAge} yrs` : 'N/A'}` : isNurse ? 'Certified Healthcare Nurse' : 'Provider Organization'}
										icon={<PersonIcon sx={{ fontSize: 13, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Email Address"
										value={isDoctor ? doctorDetail?.email : providerItem?.email}
										icon={<EmailIcon sx={{ fontSize: 13, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Contact Phone"
										value={isDoctor ? doctorDetail?.contact_number : providerItem?.contact_number}
										icon={<PhoneIcon sx={{ fontSize: 13, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Registration / License #"
										value={isDoctor ? (doctorDetail?.registration_number ? `#${doctorDetail.registration_number}` : 'Pending') : (providerItem?.license_number ? `#${providerItem.license_number}` : 'Pending')}
										icon={<BadgeIcon sx={{ fontSize: 13, color: '#0d9488' }} />}
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Qualifications / Degrees"
										value={qualificationsSummary}
										icon={<SchoolIcon sx={{ fontSize: 13, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label={isNurse ? 'Specialty / Care Focus' : 'Specialization / Location'}
										value={isDoctor ? doctorDetail?.specialities?.join(', ') : isNurse ? providerItem?.specialty || 'General In-Home Nursing' : 'Diagnostic Services'}
										icon={isNurse ? <MedicalServicesIcon sx={{ fontSize: 13, color: '#0d9488' }} /> : <LocationOnIcon sx={{ fontSize: 13, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Hospital / Organization"
										value={isDoctor ? `${doctorDetail?.hospital || 'Hospital N/A'}` : isNurse ? 'In-Home Care Delivery' : providerItem?.name}
										icon={<LocalHospitalIcon sx={{ fontSize: 13, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Registration Date"
										value={isDoctor ? (doctorDetail?.date_of_birth ? `DOB: ${doctorDetail.date_of_birth}` : 'N/A') : providerItem?.created_at ? new Date(providerItem.created_at).toLocaleDateString('en-IN') : '—'}
										icon={<PaymentsIcon sx={{ fontSize: 13, color: '#0d9488' }} />}
									/>
								</Grid>
							</Grid>
						</Box>
					</Stack>
				</Box>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
					<CircularProgress sx={{ color: '#0d9488' }} size={36} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading verification command center...
					</Typography>
				</Stack>
			) : error ? (
				<Box sx={{ p: 4 }}>
					<Alert severity="warning">{error}</Alert>
				</Box>
			) : (
				/* 3-PANEL VERIFICATION WORKSPACE */
				<Box sx={{ height: 'calc(100vh - 240px)', minHeight: 680, display: 'flex', overflow: 'hidden' }}>
					{/* PANEL 1: Document Navigation Rail (260px) */}
					<Box sx={{ width: 260, borderRight: '1px solid #e2e8f0', bgcolor: '#ffffff', flexShrink: 0 }}>
						<DocumentRail
							documents={documents}
							selectedIndex={selectedDocIndex}
							onSelectDocument={(idx: number) => setSelectedDocIndex(idx)}
						/>
					</Box>

					{/* PANEL 2: Document Inspection Canvas (Flex Grow) */}
					<Box sx={{ flex: 1, overflow: 'hidden' }}>
						<DocumentViewer documents={documents} activeDocument={activeDocument} />
					</Box>

					{/* PANEL 3: Audit & Verification Actions Panel (380px) */}
					<Box sx={{ width: 380, borderLeft: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
						{/* Scrollable Audit Section */}
						<Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
							{/* Document Issue Flag Selector */}
							<IssueFlagSelector selectedFlags={selectedFlags} onToggleFlag={handleToggleFlag} />

							{/* Reviewer Notes Box */}
							<Box>
								<Typography variant="caption" fontWeight={800} color="#475569" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1 }}>
									Reviewer Audit Comments
								</Typography>
								<AppInput
									label=""
									placeholder="Enter review findings, comments, or re-upload instructions..."
									value={reviewerNotes}
									onChange={(e) => setReviewerNotes(e.target.value)}
									multiline
									rows={3}
									fullWidth
								/>
							</Box>

							<Divider />

							{/* Review History / Audit Trail Timeline */}
							<AuditTimeline events={auditEvents} />
						</Box>

						{/* Sticky Verification Action Bar */}
						<VerificationActionBar
							activeDocument={activeDocument}
							documents={documents}
							submitting={submitting}
							onDocAction={handleDocAction}
							onApplicantAction={handleApplicantAction}
						/>
					</Box>
				</Box>
			)}
		</Box>
	)
}
