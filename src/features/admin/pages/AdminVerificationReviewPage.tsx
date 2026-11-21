// src/features/admin/pages/AdminVerificationReviewPage.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	Box,
	Typography,
	Chip,
	Stack,
	CircularProgress,
	Alert,
	IconButton,
	Tooltip,
	Avatar,
	Grid,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import BadgeIcon from '@mui/icons-material/Badge'
import SchoolIcon from '@mui/icons-material/School'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import { toast } from 'react-toastify'

import { ROUTES } from '../../../constants/routes'
import AppInput from '../../../components/common/Input/AppInput'

import DocumentRail from '../../../components/admin/verification/DocumentRail'
import DocumentViewer from '../../../components/admin/verification/DocumentViewer'
import IssueFlagSelector from '../../../components/admin/verification/IssueFlagSelector'
import AuditTimeline, { type AuditTimelineEvent } from '../../../components/admin/verification/AuditTimeline'
import VerificationActionBar from '../../../components/admin/verification/VerificationActionBar'

import {
	getDoctorVerificationDetail,
	getProvidersVerificationQueue,
	getNursesVerificationQueue,
	getProviderAdminDetail,
	verifyDoctor,
	verifyProvider,
	getVerificationAuditHistory,
	recordSingleDocumentReview,
	type AdminProviderQualificationItem,
	type DoctorVerificationDetail,
	type DoctorVerificationDocument,
	type ProviderVerificationItem,
	type AuditHistoryEventItem,
} from '../adminService'

export type DocumentStatus =
	| 'verified'
	| 'requires_reupload'
	| 'rejected'
	| 'not_reviewed'
	| 'flagged'
	| 'under_review'

export interface VerificationDocumentItem {
	id: string | null
	document_type?: string
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
		<Box
			sx={{
				p: 1,
				bgcolor: '#ffffff',
				borderRadius: '8px',
				border: '1px solid #e2e8f0',
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
					sx={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}
				>
					{label}
				</Typography>
			</Stack>
			<Typography variant="body2" fontWeight={800} color="#0f172a" noWrap sx={{ fontSize: '12px' }}>
				{value || '—'}
			</Typography>
		</Box>
	)
}

// The review state stored on the document itself (pending / approved / rejected / reupload) is the source of truth:
// unlike the audit log it goes back to "pending" when the doctor uploads a new file. The audit-log result is only the
// fallback for an older response that has no status.
const docStatusFromApi = (apiStatus: string | null | undefined, fallback: DocumentStatus): DocumentStatus => {
	switch (apiStatus) {
		case 'approved':
			return 'verified'
		case 'rejected':
			return 'rejected'
		case 'reupload':
			return 'requires_reupload'
		case 'pending':
			return 'not_reviewed'
		default:
			return fallback
	}
}

const getDocStatusFromLogs = (
	docId: string | null,
	category: string,
	fetchedAuditLogs: AuditHistoryEventItem[]
): DocumentStatus => {
	const latestLog = fetchedAuditLogs.find((log) => {
		const act = log.action || ''
		const logDocId = log.document_id

		if (category === 'registration' || category === 'license') {
			return (act.startsWith('registration_') || act.startsWith('license_')) &&
				(logDocId === null || logDocId === undefined || logDocId === 'None' || logDocId === '' || logDocId === 'null')
		}
		if (category === 'qualification') {
			if (!docId) return false
			return act.startsWith('qualification_') && String(logDocId) === String(docId)
		}
		if (docId === null) {
			return logDocId === null || logDocId === undefined || logDocId === 'None' || logDocId === '' || logDocId === 'null'
		}
		return String(logDocId) === String(docId)
	})

	if (latestLog) {
		const act = latestLog.action
		if (act.endsWith('_verified')) return 'verified'
		if (act.endsWith('_rejected')) return 'rejected'
		if (act.endsWith('_requires_reupload')) return 'requires_reupload'
	}
	return 'not_reviewed'
}

const getDocIssueTagFromLogs = (
	docId: string | null,
	category: string,
	fetchedAuditLogs: AuditHistoryEventItem[]
): string | undefined => {
	const latestLog = fetchedAuditLogs.find((log) => {
		const act = log.action || ''
		const logDocId = log.document_id

		if (category === 'registration' || category === 'license') {
			return (act.startsWith('registration_') || act.startsWith('license_')) &&
				(logDocId === null || logDocId === undefined || logDocId === 'None' || logDocId === '' || logDocId === 'null')
		}
		if (category === 'qualification') {
			if (!docId) return false
			return act.startsWith('qualification_') && String(logDocId) === String(docId)
		}
		if (docId === null) {
			return logDocId === null || logDocId === undefined || logDocId === 'None' || logDocId === '' || logDocId === 'null'
		}
		return String(logDocId) === String(docId)
	})
	return latestLog?.issue_tags && latestLog.issue_tags.length > 0
		? latestLog.issue_tags.join(', ')
		: undefined
}

/** The audit timeline for the log, naming each reviewed document from the documents just loaded for this page. */
const toAuditEvents = (logs: AuditHistoryEventItem[], docs: VerificationDocumentItem[]): AuditTimelineEvent[] =>
	logs.map((item) => ({
		id: item.id,
		reviewerName: item.reviewer_name || 'Admin Auditor',
		action: item.action.replace('_', ' ').toUpperCase(),
		documentName: item.document_id
			? (docs.find((d) => String(d.id) === String(item.document_id))?.name || `Qualification #${item.document_id}`)
			: (item.action.startsWith('registration') ? 'Medical Registration' : item.action.startsWith('license') ? 'Professional License' : undefined),
		timestamp: item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
		reason: item.notes || (item.issue_tags && item.issue_tags.length > 0 ? item.issue_tags.join(', ') : undefined),
	}))

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
	const [auditEvents, setAuditEvents] = useState<AuditTimelineEvent[]>([])

	const isDoctor = type === 'doctor'
	const isDiagnostic = type === 'radiology'
	const isAncillary = !isDoctor && !isDiagnostic

	const fetchData = useCallback(async () => {
		if (!id) return
		setLoading(true)
		setError(null)

		try {
			const targetType = isDoctor ? 'doctor' : isAncillary ? 'ancillary' : type || 'provider'
			const auditRes = await getVerificationAuditHistory(targetType, id)
			let fetchedAuditLogs: AuditHistoryEventItem[] = []

			if (auditRes.success && auditRes.data) {
				fetchedAuditLogs = auditRes.data
			}

			if (isDoctor) {
				const res = await getDoctorVerificationDetail(id)
				if (res.success && res.data) {
					const data = res.data
					setDoctorDetail(data)

					const docs: VerificationDocumentItem[] = []

					if (data.documents && Array.isArray(data.documents) && data.documents.length > 0) {
						data.documents.forEach((d) => {
							const isIdentity = d.document_type === 'identity'
							const isReg = !isIdentity && (d.document_type === 'registration' || d.type === 'license' || d.type === 'registration_license' || d.id === null || d.id === 'null')
							const docId = isReg ? null : (d.id !== null && d.id !== undefined && d.id !== 'null' ? String(d.id) : null)
							const category = isReg ? 'registration' : isIdentity ? 'identity' : 'qualification'
							docs.push({
								id: docId,
								document_type: category,
								name: d.name,
								url: d.url,
								type: d.type || category,
								status: docStatusFromApi(d.status, getDocStatusFromLogs(docId, category, fetchedAuditLogs)),
								issueTag: getDocIssueTagFromLogs(docId, category, fetchedAuditLogs),
							})
						})
					} else {
						if (data.registration_proof_s3_key) {
							docs.push({
								id: null,
								document_type: 'registration',
								name: 'Medical Registration License Proof',
								url: data.registration_proof_s3_key,
								type: 'registration_license',
								status: getDocStatusFromLogs(null, 'registration', fetchedAuditLogs),
								issueTag: getDocIssueTagFromLogs(null, 'registration', fetchedAuditLogs),
							})
						}

						const degList = (data.qualifications || data.degrees || [])
						degList.forEach((deg) => {
							const proof = deg.proof_url || deg.proof_s3_key || deg.qualification_proof_s3_key
							if (proof) {
								const dId = deg.id ? String(deg.id) : null
								const dName = `${deg.qualification || deg.degree || 'Degree'} Certificate${deg.institution || deg.college ? ` (${deg.institution || deg.college})` : ''}`
								docs.push({
									id: dId,
									document_type: 'qualification',
									name: dName,
									url: proof,
									type: 'qualification',
									status: getDocStatusFromLogs(dId, 'qualification', fetchedAuditLogs),
									issueTag: getDocIssueTagFromLogs(dId, 'qualification', fetchedAuditLogs),
								})
							}
						})
					}

					setDocuments(docs)
					setAuditEvents(toAuditEvents(fetchedAuditLogs, docs))
					setSelectedDocIndex(0)
				} else {
					setError('Doctor verification details could not be loaded.')
				}
			} else {
				let matchedProvider: ProviderVerificationItem | null = null
				let providerQualifications: AdminProviderQualificationItem[] = []
				let backendDocs: DoctorVerificationDocument[] = []

				try {
					const detailRes = await getProviderAdminDetail(isAncillary ? 'ancillary' : type || 'radiology', id)
					if (detailRes.success && detailRes.data) {
						const d = detailRes.data
						if (d.documents && Array.isArray(d.documents) && d.documents.length > 0) {
							backendDocs = d.documents
						}
						if (d.qualifications_list && Array.isArray(d.qualifications_list)) {
							providerQualifications = d.qualifications_list
						} else if (d.qualifications && Array.isArray(d.qualifications)) {
							providerQualifications = d.qualifications
						}
						matchedProvider = {
							id: d.provider_id || id,
							public_id: d.provider_id || id,
							provider_type: (d.provider_type || type || 'ancillary') as ProviderVerificationItem['provider_type'],
							name: d.owner_name || d.business_name || (isAncillary ? 'Ancillary Professional' : 'Provider'),
							owner_name: (d.owner_name || d.business_name) ?? undefined,
							email: d.email || undefined,
							contact_number: d.contact_number || undefined,
							license_number: d.license_number || undefined,
							license_proof_s3_key: d.license_proof_s3_key || d.avatar_s3_key || undefined,
							specialty: d.specialty || undefined,
							qualifications: d.qualifications || undefined,
							capabilities: d.capabilities || [],
							is_verified: d.is_verified,
							verification_status: d.verification_status || undefined,
							created_at: d.registration_date || new Date().toISOString(),
						}
					}
				} catch (detailErr) {
					console.warn('getProviderAdminDetail warning:', detailErr)
				}

				if (!matchedProvider) {
					if (isAncillary) {
						const res = await getNursesVerificationQueue()
						if (res && res.success && res.data && res.data.items) {
							const matched = res.data.items.find((p) => p.id === id || p.public_id === id)
							if (matched) {
								matchedProvider = {
									id: matched.id,
									public_id: matched.public_id,
									provider_type: 'ancillary',
									name: matched.name,
									owner_name: matched.owner_name,
									email: matched.email,
									contact_number: matched.contact_number,
									license_number: matched.license_number,
									license_proof_s3_key: matched.license_proof_s3_key,
									specialty: matched.speciality,
									qualifications: matched.qualifications,
									capabilities: matched.capabilities,
									is_verified: matched.is_verified,
									verification_status: matched.verification_status,
									created_at: matched.created_at,
								}
								if (matched.qualifications && Array.isArray(matched.qualifications)) {
									providerQualifications = matched.qualifications
								}
							}
						}
					} else {
						const res = await getProvidersVerificationQueue()
						if (res.success && res.data) {
							// the queue comes back as a list, as { items }, or grouped by provider type
							const queue = res.data as unknown as
								| ProviderVerificationItem[]
								| ({ items?: ProviderVerificationItem[] } & Partial<
										Record<'ancillary' | 'radiology', ProviderVerificationItem[]>
								  >)
							const items: ProviderVerificationItem[] = Array.isArray(queue)
								? queue
								: Array.isArray(queue.items)
								? queue.items
								: [
										...(queue.ancillary || []),
										...(queue.radiology || []),
								  ]
							const matched = items.find((p: ProviderVerificationItem) => p.id === id || p.public_id === id)
							if (matched) {
								matchedProvider = matched
							}
						}
					}
				}

				if (matchedProvider) {
					setProviderItem(matchedProvider)
					const docs: VerificationDocumentItem[] = []

					if (backendDocs.length > 0) {
						backendDocs.forEach((dItem) => {
							const isIdentity = dItem.document_type === 'identity'
							const isLic = !isIdentity && (dItem.document_type === 'license' || dItem.type === 'registration_license' || dItem.id === null || dItem.id === 'null')
							const docId = isLic ? null : (dItem.id !== null && dItem.id !== undefined && dItem.id !== 'null' ? String(dItem.id) : null)
							const category = isLic ? 'license' : isIdentity ? 'identity' : 'qualification'
							docs.push({
								id: docId,
								document_type: category,
								name: dItem.name,
								url: dItem.url,
								type: dItem.type || category,
								status: docStatusFromApi(dItem.status, getDocStatusFromLogs(docId, category, fetchedAuditLogs)),
								issueTag: getDocIssueTagFromLogs(docId, category, fetchedAuditLogs),
							})
						})
					} else {
						if (matchedProvider.license_proof_s3_key) {
							const dName = isAncillary ? 'Professional Registration & License Proof' : 'Business License Proof'
							docs.push({
								id: null,
								document_type: 'license',
								name: dName,
								url: matchedProvider.license_proof_s3_key,
								type: 'registration_license',
								status: getDocStatusFromLogs(null, 'license', fetchedAuditLogs),
								issueTag: getDocIssueTagFromLogs(null, 'license', fetchedAuditLogs),
							})
						}

						if (providerQualifications.length > 0) {
							providerQualifications.forEach((q) => {
								const qUrl = q.proof_url || q.proof_s3_key || q.qualification_proof_s3_key
								if (qUrl) {
									const qId = q.id ? String(q.id) : null
									const qName = `${q.qualification || 'Qualification'}${q.institution ? ` (${q.institution})` : ''}`
									docs.push({
										id: qId,
										document_type: 'qualification',
										name: qName,
										url: qUrl,
										type: 'qualification',
										status: getDocStatusFromLogs(qId, 'qualification', fetchedAuditLogs),
										issueTag: getDocIssueTagFromLogs(qId, 'qualification', fetchedAuditLogs),
									})
								}
							})
						}
					}

					setDocuments(docs)
					setAuditEvents(toAuditEvents(fetchedAuditLogs, docs))
					setSelectedDocIndex(0)
				} else {
					setError('Verification details could not be loaded.')
				}
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to load verification record.'))
		} finally {
			setLoading(false)
		}
	}, [id, isDoctor, isAncillary, type])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	// Keyboard shortcuts navigation
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

	const handleBack = () => {
		navigate(ROUTES.ADMIN.VERIFICATIONS)
	}

	const handleDocAction = async (action: 'approve' | 'reject' | 'reupload') => {
		const activeDoc = documents[selectedDocIndex]
		if (!activeDoc || !id) return

		const nextStatus: DocumentStatus =
			action === 'approve'
				? 'verified'
				: action === 'reject'
				? 'rejected'
				: 'requires_reupload'

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
			const targetType = isDoctor ? 'doctor' : isAncillary ? 'ancillary' : type || 'provider'
			await recordSingleDocumentReview({
				target_type: targetType,
				target_id: id,
				document_id: activeDoc.id,
				...(activeDoc.document_type === 'identity' ? { document_type: 'identity' } : {}),
				status: nextStatus,
				issue_tags: selectedFlags,
				notes: reviewerNotes.trim() || undefined,
			})
			toast.success(`Document "${activeDoc.name}" status saved.`)
			await fetchData()
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to save document status.'))
		}
	}

	const handleApplicantAction = async (verdict: 'approve' | 'request_changes' | 'reject') => {
		if (!id) return
		setSubmitting(true)
		try {
			const isApproved = verdict === 'approve'
			const notesPayload = selectedFlags.length > 0 ? `${selectedFlags.join(', ')}; ${reviewerNotes}` : reviewerNotes

			const docReviewsPayload = documents.map((d) => ({
				document_id: d.id,
				...(d.document_type === 'identity' ? { document_type: 'identity' } : {}),
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
				const pType = isAncillary ? 'ancillary' : providerItem?.provider_type || type || 'radiology'
				const res = await verifyProvider(pType, id, {
					is_verified: isApproved,
					rejection_reason: !isApproved ? notesPayload.trim() || undefined : undefined,
					reviewer_notes: reviewerNotes.trim() || undefined,
					issue_flags: selectedFlags,
					document_reviews: docReviewsPayload,
				})
				if (res.success) {
					toast.success(`${isAncillary ? 'Ancillary Provider' : 'Provider'} ${providerItem?.name || id} verification verdict submitted: ${verdict.toUpperCase()}.`)
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
	const applicantDisplayName = isDoctor ? formatDoctorName(rawName) : rawName
	const isVerified = isDoctor ? doctorDetail?.is_verified : providerItem?.is_verified
	const activeDocument = documents[selectedDocIndex] || null

	const doctorAge = calculateAge(doctorDetail?.date_of_birth)

	const qualificationsSummary = isDoctor
		? doctorDetail?.degrees && doctorDetail.degrees.length > 0
			? doctorDetail.degrees.map((d) => `${d.degree}${d.college ? ` (${d.college})` : ''}`).join(', ')
			: doctorDetail?.qualification
		: Array.isArray(providerItem?.qualifications)
		? providerItem.qualifications.map((q) => `${q.qualification || 'Degree'}${q.institution ? ` (${q.institution})` : ''}`).join(', ')
		: typeof providerItem?.qualifications === 'string'
		? providerItem.qualifications
		: (isAncillary ? 'Qualifications Registered' : undefined)

	const roleLabel = (isDoctor ? 'Doctor' : isAncillary ? (providerItem?.specialty || 'Ancillary') : providerItem?.provider_type || 'Provider').toUpperCase()

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
			{/* APPLICANT HEADER ROW (Clean, minimal navigation row) */}
			<Stack
				direction="row"
				alignItems="center"
				spacing={1.5}
				sx={{ mb: 2.5 }}
			>
				<Tooltip title="Back to Queue">
					<IconButton
						onClick={handleBack}
						size="small"
						sx={{
							p: 0.5,
							color: '#475569',
							'&:hover': { color: '#0d9488', bgcolor: 'rgba(13,148,136,0.08)' },
						}}
					>
						<ArrowBackIcon sx={{ fontSize: 22 }} />
					</IconButton>
				</Tooltip>

				<Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: 18, lineHeight: 1.2 }}>
					{applicantDisplayName || 'Applicant'}
				</Typography>

				<Chip
					label={roleLabel}
					size="small"
					sx={{
						bgcolor: '#ccfbf1',
						color: '#0f766e',
						fontWeight: 800,
						fontSize: '0.68rem',
						height: 22,
						borderRadius: '5px',
						px: 0.25,
					}}
				/>

				<Chip
					label={isVerified ? 'VERIFIED' : (providerItem?.verification_status === 'rejected' ? 'REJECTED' : 'AWAITING AUDIT')}
					size="small"
					sx={{
						bgcolor: isVerified ? '#dcfce7' : (providerItem?.verification_status === 'rejected' ? '#fee2e2' : '#fef3c7'),
						color: isVerified ? '#15803d' : (providerItem?.verification_status === 'rejected' ? '#b91c1c' : '#d97706'),
						fontWeight: 800,
						fontSize: '0.68rem',
						height: 22,
						borderRadius: '5px',
						px: 0.25,
					}}
				/>
			</Stack>

			{/* APPLICANT PROFILE & DEMOGRAPHICS CARD */}
			{!loading && !error && (
				<Box
					sx={{
						bgcolor: '#ffffff',
						borderRadius: '12px',
						border: '1px solid #e2e8f0',
						p: 1.75,
						mb: 1.5,
						boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
					}}
				>
					<Stack direction="row" spacing={2} alignItems="flex-start">
						<Avatar
							sx={{
								width: 44,
								height: 44,
								bgcolor: '#0d9488',
								color: '#ffffff',
								fontSize: 19,
								fontWeight: 800,
								flexShrink: 0,
								mt: 0.25,
							}}
						>
							{(applicantDisplayName || 'A').substring(0, 1).toUpperCase()}
						</Avatar>

						<Box sx={{ flex: 1 }}>
							<Typography
								variant="caption"
								fontWeight={800}
								color="#0d9488"
								sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1, fontSize: '11px' }}
							>
								{isAncillary
									? 'ANCILLARY PROVIDER PROFILE & CREDENTIALS'
									: isDoctor
									? 'DOCTOR PROFILE & DEMOGRAPHICS'
									: 'PROVIDER PROFILE & BUSINESS CREDENTIALS'}
							</Typography>

							<Grid container spacing={1}>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Demographics & Role"
										value={isDoctor ? `${doctorDetail?.gender || 'Gender N/A'} • ${doctorAge != null ? `${doctorAge} yrs` : 'N/A'}` : isAncillary ? (providerItem?.specialty || 'Certified Healthcare Provider') : 'Provider Organization'}
										icon={<PersonIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Email Address"
										value={isDoctor ? doctorDetail?.email : providerItem?.email}
										icon={<EmailIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Contact Phone"
										value={isDoctor ? doctorDetail?.contact_number : providerItem?.contact_number}
										icon={<PhoneIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Registration / License #"
										value={isDoctor ? (doctorDetail?.registration_number ? `#${doctorDetail.registration_number}` : 'Pending') : (providerItem?.license_number ? `#${providerItem.license_number}` : 'Pending')}
										icon={<BadgeIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Qualifications / Degrees"
										value={qualificationsSummary}
										icon={<SchoolIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label={isAncillary ? 'Specialty / Care Focus' : 'Specialization / Location'}
										value={isDoctor ? doctorDetail?.specialities?.join(', ') : isAncillary ? providerItem?.specialty || 'Ancillary Care' : 'Diagnostic Services'}
										icon={isAncillary ? <MedicalServicesIcon sx={{ fontSize: 12, color: '#0d9488' }} /> : <LocationOnIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Hospital / Organization"
										value={isDoctor ? `${doctorDetail?.hospital || 'Hospital N/A'}` : isAncillary ? 'Healthcare Service Delivery' : providerItem?.name}
										icon={<LocalHospitalIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6, md: 3 }}>
									<InfoTile
										label="Registration Date"
										value={isDoctor ? (doctorDetail?.date_of_birth ? `DOB: ${doctorDetail.date_of_birth}` : 'N/A') : providerItem?.created_at ? new Date(providerItem.created_at).toLocaleDateString('en-GB') : '—'}
										icon={<CalendarTodayIcon sx={{ fontSize: 12, color: '#0d9488' }} />}
									/>
								</Grid>
							</Grid>
						</Box>
					</Stack>
				</Box>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ flex: 1, minHeight: 340 }}>
					<CircularProgress sx={{ color: '#0d9488' }} size={32} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 1.5, fontWeight: 600 }}>
						Loading verification workspace...
					</Typography>
				</Stack>
			) : error ? (
				<Box sx={{ p: 3 }}>
					<Alert severity="warning">{error}</Alert>
				</Box>
			) : (
				/* 3-PANEL UNIFIED VERIFICATION WORKSPACE */
				<Box
					sx={{
						bgcolor: '#ffffff',
						borderRadius: '12px',
						border: '1px solid #e2e8f0',
						minHeight: 500,
						display: 'flex',
						overflow: 'hidden',
						boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
					}}
				>
					{/* PANEL 1: Review Progress & Document List (240px) */}
					<Box sx={{ width: 240, borderRight: '1px solid #e2e8f0', bgcolor: '#ffffff', flexShrink: 0 }}>
						<DocumentRail
							documents={documents}
							selectedIndex={selectedDocIndex}
							onSelectDocument={(idx: number) => setSelectedDocIndex(idx)}
						/>
					</Box>

					{/* PANEL 2: Document Inspection Canvas (Flex Grow) */}
					<Box sx={{ flex: 1, overflow: 'hidden', bgcolor: '#ffffff' }}>
						<DocumentViewer documents={documents} activeDocument={activeDocument} />
					</Box>

					{/* PANEL 3: Audit, Issue Flags & Actions Panel (310px) */}
					<Box
						sx={{
							width: 310,
							borderLeft: '1px solid #e2e8f0',
							bgcolor: '#ffffff',
							display: 'flex',
							flexDirection: 'column',
							flexShrink: 0,
							overflow: 'hidden',
						}}
					>
						{/* Scrollable Audit Section */}
						<Box sx={{ flex: 1, overflowY: 'auto', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
							{/* Document Issue Flag Selector */}
							<IssueFlagSelector selectedFlags={selectedFlags} onToggleFlag={handleToggleFlag} />

							{/* Reviewer Comments Box */}
							<Box>
								<Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
									<ChatBubbleOutlineIcon sx={{ fontSize: 15, color: '#0d9488' }} />
									<Typography
										variant="caption"
										fontWeight={800}
										color="#0f172a"
										sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11px' }}
									>
										Reviewer Audit Comments
									</Typography>
								</Stack>
								<AppInput
									label=""
									placeholder="Enter review findings, comments, or re-upload instructions..."
									value={reviewerNotes}
									onChange={(e) => setReviewerNotes(e.target.value)}
									multiline
									rows={2}
									fullWidth
								/>
							</Box>

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
