// src/features/radiology/bookings/BookingDetailPage.tsx

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	Alert,
	Avatar,
	Box,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Grid,
	IconButton,
	Snackbar,
	Stack,
	// Tooltip,
	Typography,
} from '@mui/material'
import {
	ArrowBack,
	CheckCircle,
	// Cancel,
	CloudUpload,
	FilePresent,
	Payments,
	Description,
	AssignmentTurnedIn,
	Verified,
} from '@mui/icons-material'

import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import AppSwitch from '../../../components/common/Switch/AppSwitch'
import AppTable from '../../../components/common/Table/AppTable'

import prescriptionImage from '../../../assets/Pharmacy/Prescription.svg'
import {
	getRadiologyBookingById,
	submitRadiologyBookingQuote,
	verifyRadiologyPrescription,
	uploadRadiologyReport,
	RadiologyBooking,
	RadiologyBookingItem,
	RadiologyReport,
} from '../radiologyService'
import { customCardStyle } from '../../../styles/commonStyles'
import { formatINR } from '../../../utils/Utils'

interface QuoteFormItem {
	booking_item_id: number
	scanName: string
	custom_scan_name: string
	quoted_price: number
}

const SectionCard = ({ title, children }: { title: string; children: ReactNode }) => (
	<Card sx={{ ...customCardStyle, height: '100%' }}>
		<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
			<Typography variant="subtitle2" fontWeight={700} color="#1E2A2A" sx={{ mb: 1.5 }}>
				{title}
			</Typography>
			{children}
		</CardContent>
	</Card>
)

const getStatusLabel = (status: string) => {
	switch (status.toLowerCase()) {
		case 'pending_quote':
			return 'Pending Quote'
		case 'pending_payment':
			return 'Pending Payment'
		case 'confirmed':
			return 'Confirmed'
		case 'completed':
			return 'Completed'
		case 'cancelled':
			return 'Cancelled'
		default:
			return status
	}
}

const getStatusChipSx = (status: string) => {
	switch (status.toLowerCase()) {
		case 'pending_quote':
			return { bgcolor: '#FEF3C7', color: '#D97706' }
		case 'pending_payment':
			return { bgcolor: '#EEF2FF', color: '#4F46E5' }
		case 'confirmed':
			return { bgcolor: '#CCFBF1', color: '#0D9488' }
		case 'completed':
			return { bgcolor: '#DCFCE7', color: '#16A34A' }
		case 'cancelled':
			return { bgcolor: '#FEE2E2', color: '#DC2626' }
		default:
			return { bgcolor: '#F5F5F5', color: '#616161' }
	}
}

export default function BookingDetailPage() {
	const { bookingId } = useParams<{ bookingId: string }>()
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [booking, setBooking] = useState<RadiologyBooking | null>(null)

	// Quote submission states
	const [quoteItems, setQuoteItems] = useState<QuoteFormItem[]>([])
	const [quoteNotes, setQuoteNotes] = useState('')
	const [submittingQuote, setSubmittingQuote] = useState(false)

	// Verification state
	const [verifyingPrescription, setVerifyingPrescription] = useState(false)

	// Report upload states
	const [reportPdfKey, setReportPdfKey] = useState('')
	const [dicomKeys, setDicomKeys] = useState<string>('')
	const [summaryFindings, setSummaryFindings] = useState('')
	const [submittingReport, setSubmittingReport] = useState(false)
	const [reportDetails, setReportDetails] = useState<RadiologyReport | null>(null)

	const [toast, setToast] = useState<{
		open: boolean
		message: string
		severity: 'success' | 'info' | 'error'
	}>({
		open: false,
		message: '',
		severity: 'success',
	})

	const s3Base = import.meta.env.VITE_S3_BASE_URL as string | undefined

	const showToast = useCallback((message: string, severity: 'success' | 'info' | 'error') => {
		setToast({ open: true, message, severity })
	}, [])

	const buildS3Url = useCallback(
		(key?: string | null) => {
			if (!key || !s3Base) return ''
			return `${s3Base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
		},
		[s3Base]
	)

	const fetchBookingDetails = useCallback(async () => {
		if (!bookingId) {
			setError('Booking ID is missing.')
			setLoading(false)
			return
		}

		setLoading(true)
		setError(null)

		try {
			const result = await getRadiologyBookingById(bookingId)
			if (!result.success || !result.data) {
				throw new Error(result.message || 'Failed to load booking details.')
			}

			const data = result.data
			setBooking(data)

			// Initialize quote items if pending quote
			if (data.status === 'pending_quote') {
				const initialItems = data.booking_items.map((item) => ({
					booking_item_id: item.id,
					scanName: item.radiology_scan.scan_type.name,
					custom_scan_name: item.custom_scan_name || item.radiology_scan.scan_type.name,
					quoted_price: item.quoted_price || 0,
				}))
				setQuoteItems(initialItems)
			}

			// If completed, fetch or render reports if they are returned inside booking.
			// Let's check if there is a report attached. Since report model is linked via reports list,
			// let's grab the first report if available.

			
			// if (data.status === 'completed' && (data as any).reports?.length) {
			// 	setReportDetails((data as any).reports[0])
			// }
			const bookingWithReports = data as RadiologyBooking & {
				reports?: RadiologyReport[]
			}

			if (data.status === 'completed' && bookingWithReports.reports?.length) {
				setReportDetails(bookingWithReports.reports[0])
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load booking details.')
		} finally {
			setLoading(false)
		}
	}, [bookingId])

	useEffect(() => {
		fetchBookingDetails()
	}, [fetchBookingDetails])

	const handleVerifyPrescription = async (checked: boolean) => {
		if (!booking || verifyingPrescription) return

		setVerifyingPrescription(true)
		try {
			if (checked) {
				const result = await verifyRadiologyPrescription(booking.public_id)
				if (result.success) {
					showToast('Prescription verified successfully!', 'success')
					setBooking((prev) => (prev ? { ...prev, prescription_verified: true } : null))
				} else {
					throw new Error(result.message)
				}
			}
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Failed to verify prescription.', 'error')
		} finally {
			setVerifyingPrescription(false)
		}
	}

	const handleQuotePriceChange = (bookingItemId: number, value: string) => {
		const parsed = parseFloat(value) || 0
		setQuoteItems((prev) =>
			prev.map((item) => (item.booking_item_id === bookingItemId ? { ...item, quoted_price: parsed } : item))
		)
	}

	const handleCustomNameChange = (bookingItemId: number, value: string) => {
		setQuoteItems((prev) =>
			prev.map((item) => (item.booking_item_id === bookingItemId ? { ...item, custom_scan_name: value } : item))
		)
	}

	const handleSubmitQuote = async () => {
		if (!booking) return

		// Validation
		const missingPrices = quoteItems.some((item) => item.quoted_price <= 0)
		if (missingPrices) {
			showToast('Please enter a valid price greater than 0 for all scans.', 'error')
			return
		}

		setSubmittingQuote(true)
		try {
			const payload = {
				items: quoteItems.map((item) => ({
					booking_item_id: item.booking_item_id,
					custom_scan_name: item.custom_scan_name,
					quoted_price: item.quoted_price,
				})),
				prescription_verified: booking.prescription_verified,
				notes: quoteNotes || undefined,
			}
			const result = await submitRadiologyBookingQuote(booking.public_id, payload)
			if (result.success) {
				showToast('Quotation submitted successfully!', 'success')
				await fetchBookingDetails()
			} else {
				throw new Error(result.message)
			}
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Failed to submit quote.', 'error')
		} finally {
			setSubmittingQuote(false)
		}
	}

	const handleSubmitReport = async () => {
		if (!booking) return

		if (!reportPdfKey.trim()) {
			showToast('Report PDF Key/Link is required.', 'error')
			return
		}

		setSubmittingReport(true)
		try {
			const dicomList = dicomKeys
				.split(',')
				.map((key) => key.trim())
				.filter(Boolean)

			const payload = {
				report_pdf_s3_key: reportPdfKey.trim(),
				dicom_images_s3_keys: dicomList.length ? dicomList : undefined,
				summary_findings: summaryFindings.trim() || undefined,
			}

			const result = await uploadRadiologyReport(booking.public_id, payload)
			if (result.success) {
				showToast('Report uploaded and booking marked as completed!', 'success')
				setReportDetails(result.data)
				await fetchBookingDetails()
			} else {
				throw new Error(result.message)
			}
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Failed to submit report.', 'error')
		} finally {
			setSubmittingReport(false)
		}
	}

	const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }))

	const patientData = useMemo(() => {
		return {
			name: booking?.patient_name || 'Patient',
			id: booking?.patient_id || '-',
			date: booking
				? new Date(booking.booking_date).toLocaleDateString('en-GB', {
						day: '2-digit',
						month: 'short',
						year: 'numeric',
					})
				: '—',
			time: booking?.booking_time || '—',
			notes: booking?.notes || 'No notes provided by patient.',
			prescriptionUrl: booking?.external_prescription_s3_key
				? buildS3Url(booking.external_prescription_s3_key)
				: prescriptionImage,
		}
	}, [booking, buildS3Url])

	const timelineSteps = useMemo(() => {
		if (!booking) return []
		const statusLower = booking.status.toLowerCase()
		return [
			{
				key: 'created',
				label: 'Booking Created',
				isCompleted: true,
				icon: <AssignmentTurnedIn fontSize="small" />,
			},
			{
				key: 'verified',
				label: 'Prescription Verified',
				isCompleted: booking.prescription_verified,
				icon: <Verified fontSize="small" />,
			},
			{
				key: 'quoted',
				label: 'Quotation Shared',
				isCompleted: statusLower !== 'pending_quote',
				icon: <Payments fontSize="small" />,
			},
			{
				key: 'payment',
				label: 'Payment Completed',
				isCompleted:
					booking.payment_status === 'paid' || statusLower === 'confirmed' || statusLower === 'completed',
				icon: <CheckCircle fontSize="small" />,
			},
			{
				key: 'report',
				label: 'Report Uploaded',
				isCompleted: statusLower === 'completed',
				icon: <Description fontSize="small" />,
			},
		]
	}, [booking])

	if (loading && !booking) {
		return (
			<Box sx={{ p: 4, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<CircularProgress />
			</Box>
		)
	}

	if (error || !booking) {
		return (
			<Box sx={{ p: 3, minHeight: '100vh' }}>
				<AppButton
					label="Back to Bookings"
					startIcon={<ArrowBack />}
					onClick={() => navigate('/radiology/bookings')}
					sx={{ mb: 2 }}
				/>
				<Alert severity="error">{error || 'Booking details not found.'}</Alert>
			</Box>
		)
	}

	return (
		<Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F4F9F9', minHeight: '100vh' }}>
			{/* Top bar */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<IconButton
						onClick={() => navigate('/radiology/bookings')}
						sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}
					>
						<ArrowBack />
					</IconButton>
					<Box>
						<Typography variant="h5" fontWeight={700} color="primary.dark">
							Booking Details
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Ref: {booking.public_id}
						</Typography>
					</Box>
				</Box>
				<Chip
					label={getStatusLabel(booking.status)}
					sx={{ ...getStatusChipSx(booking.status), fontWeight: 700, px: 1 }}
				/>
			</Box>

			<Grid container spacing={3}>
				{/* Left column */}
				<Grid size={{ xs: 12, md: 8 }}>
					<Stack spacing={3}>
						{/* Patient details */}
						<SectionCard title="Patient Details">
							<Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
								<Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontWeight: 600 }}>
									{patientData.name.charAt(0)}
								</Avatar>
								<Box sx={{ flex: 1 }}>
									<Typography variant="subtitle1" fontWeight={700} color="text.primary">
										{patientData.name}
									</Typography>
									<Grid container spacing={2} sx={{ mt: 0.5 }}>
										<Grid size={{ xs: 6, sm: 4 }}>
											<Typography variant="caption" color="text.secondary">
												Patient ID
											</Typography>
											<Typography variant="body2" fontWeight={600}>
												{patientData.id}
											</Typography>
										</Grid>
										<Grid size={{ xs: 6, sm: 4 }}>
											<Typography variant="caption" color="text.secondary">
												Scheduled Date
											</Typography>
											<Typography variant="body2" fontWeight={600}>
												{patientData.date}
											</Typography>
										</Grid>
										<Grid size={{ xs: 6, sm: 4 }}>
											<Typography variant="caption" color="text.secondary">
												Scheduled Time
											</Typography>
											<Typography variant="body2" fontWeight={600}>
												{patientData.time}
											</Typography>
										</Grid>
									</Grid>
								</Box>
							</Box>
							<Box
								sx={{
									mt: 2,
									p: 1.5,
									bgcolor: '#F8FCFC',
									borderRadius: 1.5,
									border: '1px solid #E2E8F0',
								}}
							>
								<Typography variant="caption" color="text.secondary" fontWeight={600}>
									Patient Notes:
								</Typography>
								<Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
									{patientData.notes}
								</Typography>
							</Box>
						</SectionCard>

						{/* Prescription verification */}
						<SectionCard title="Prescription Verification">
							<Grid container spacing={2}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Card
										elevation={0}
										sx={{
											bgcolor: '#F8FCFC',
											borderRadius: 1.5,
											border: '1px solid #E2E8F0',
											position: 'relative',
											minHeight: 200,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											overflow: 'hidden',
											p: 1,
										}}
									>
										<img
											src={patientData.prescriptionUrl}
											alt="Prescription Scan"
											style={{
												maxWidth: '100%',
												maxHeight: '180px',
												objectFit: 'contain',
												borderRadius: '4px',
											}}
										/>
									</Card>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Box
										sx={{
											height: '100%',
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'center',
										}}
									>
										<Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
											Please review the attached prescription file uploaded by the patient. Ensure
											all requested scans are medically referred before finalizing quotes or
											uploads.
										</Typography>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
											<Typography variant="body2" fontWeight={600}>
												Prescription Verified:
											</Typography>
											<AppSwitch
												checked={booking.prescription_verified}
												onChange={(e) => handleVerifyPrescription(e.target.checked)}
												disabled={verifyingPrescription || booking.prescription_verified}
											/>
										</Box>
										{booking.prescription_verified && (
											<Typography
												variant="caption"
												color="success.main"
												sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
											>
												<CheckCircle fontSize="inherit" /> Verified by diagnostic center staff.
											</Typography>
										)}
									</Box>
								</Grid>
							</Grid>
						</SectionCard>

						{/* Booking Scans Quote/List Card */}
						{booking.status === 'pending_quote' ? (
							<SectionCard title="Pricing Quotation Entry">
								<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
									Submit the quoted price for each scan. You can also specify custom names (e.g.
									specialized scan types) if appropriate.
								</Typography>

								<Stack spacing={2} sx={{ mb: 3 }}>
									{quoteItems.map((item, idx) => (
										<Box
											key={item.booking_item_id}
											sx={{
												p: 2,
												bgcolor: '#F8FCFC',
												borderRadius: 1.5,
												border: '1px solid #E2E8F0',
											}}
										>
											<Typography
												variant="subtitle2"
												fontWeight={700}
												color="primary.dark"
												sx={{ mb: 1.5 }}
											>
												Scan #{idx + 1}: {item.scanName}
											</Typography>
											<Grid container spacing={2}>
												<Grid size={{ xs: 12, sm: 7 }}>
													<AppInput
														label="Custom/Specific Scan Name"
														value={item.custom_scan_name}
														onChange={(e) =>
															handleCustomNameChange(item.booking_item_id, e.target.value)
														}
														placeholder="Defaults to standard name"
														size="small"
													/>
												</Grid>
												<Grid size={{ xs: 12, sm: 5 }}>
													<AppInput
														label="Quoted Price (INR)"
														type="number"
														value={item.quoted_price || ''}
														onChange={(e) =>
															handleQuotePriceChange(item.booking_item_id, e.target.value)
														}
														placeholder="Price in ₹"
														size="small"
													/>
												</Grid>
											</Grid>
										</Box>
									))}

									<AppInput
										label="Quotation Notes / Terms"
										value={quoteNotes}
										onChange={(e) => setQuoteNotes(e.target.value)}
										placeholder="e.g. Patient should be fasting 12 hrs, etc."
										multiline
										rows={2}
									/>
								</Stack>

								<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
									<AppButton
										label={
											submittingQuote ? 'Submitting Quote...' : 'Submit Quote & Send to Patient'
										}
										onClick={handleSubmitQuote}
										disabled={submittingQuote}
										sx={{ bgcolor: '#00796B', '&:hover': { bgcolor: '#00695C' } }}
									/>
								</Box>
							</SectionCard>
						) : (
							<SectionCard title="Booked Scans Details">
								<AppTable<RadiologyBookingItem & Record<string, unknown>>
									columns={[
										{
											field: 'scan_name',
											label: 'Scan Name',
											render: (_: unknown, row: RadiologyBookingItem) => (
												<Typography fontSize={13} fontWeight={600}>
													{row.custom_scan_name || row.radiology_scan.scan_type.name}
												</Typography>
											),
										},
										{
											field: 'pricing_model',
											label: 'Pricing Model',
											render: (_: unknown, row: RadiologyBookingItem) => (
												<Typography fontSize={13} sx={{ textTransform: 'capitalize' }}>
													{row.radiology_scan.pricing_model.replace('_', ' ')}
												</Typography>
											),
										},
										{
											field: 'quoted_price',
											label: 'Quoted Price',
											render: (_: unknown, row: RadiologyBookingItem) => (
												<Typography fontSize={13} fontWeight={700}>
													{row.quoted_price !== null ? formatINR(row.quoted_price) : '—'}
												</Typography>
											),
										},
									]}
									rows={
										booking.booking_items as Array<RadiologyBookingItem & Record<string, unknown>>
									}
									emptyMessage="No scans in booking"
								/>
								<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 4 }}>
									<Typography variant="body2" color="text.secondary">
										Payment Status: <strong>{booking.payment_status.toUpperCase()}</strong>
									</Typography>
									<Typography variant="subtitle1" fontWeight={700} color="primary.dark">
										Total Price:{' '}
										{booking.total_price !== null
											? formatINR(booking.total_price)
											: 'Quote Required'}
									</Typography>
								</Box>
							</SectionCard>
						)}
					</Stack>
				</Grid>

				{/* Right column */}
				<Grid size={{ xs: 12, md: 4 }}>
					<Stack spacing={3}>
						{/* Timeline step list */}
						<SectionCard title="Booking Workflow Status">
							<Box sx={{ pl: 1 }}>
								{timelineSteps.map((step, idx) => {
									const isLast = idx === timelineSteps.length - 1
									return (
										<Box key={step.key} sx={{ position: 'relative', pb: isLast ? 0 : 2.5 }}>
											{!isLast && (
												<Box
													sx={{
														position: 'absolute',
														left: 12,
														top: 24,
														bottom: 0,
														width: 2,
														bgcolor: step.isCompleted ? '#00796B' : '#E2E8F0',
														zIndex: 0,
													}}
												/>
											)}

											<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
												<Box
													sx={{
														width: 26,
														height: 26,
														borderRadius: '50%',
														bgcolor: step.isCompleted ? '#E0F2F1' : '#F1F5F9',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														zIndex: 1,
														color: step.isCompleted ? '#00796B' : '#94A3B8',
													}}
												>
													{step.icon}
												</Box>

												<Box sx={{ flex: 1, mt: 0.25 }}>
													<Typography
														variant="body2"
														fontWeight={step.isCompleted ? 600 : 400}
														color={step.isCompleted ? 'text.primary' : 'text.secondary'}
													>
														{step.label}
													</Typography>
													<Typography variant="caption" color="text.secondary">
														{step.isCompleted ? 'Done' : 'Pending'}
													</Typography>
												</Box>
											</Box>
										</Box>
									)
								})}
							</Box>
						</SectionCard>

						{/* Report Upload/Detail section */}
						{(booking.status.toLowerCase() === 'confirmed' ||
							booking.status.toLowerCase() === 'completed') && (
							<SectionCard title="Diagnostic Scan Report">
								{booking.status.toLowerCase() === 'confirmed' ? (
									<Stack spacing={2}>
										<Typography variant="body2" color="text.secondary">
											Upload the PDF scan findings, optionally add DICOM medical imaging keys, and
											enter the summary findings to complete the booking.
										</Typography>

										<AppInput
											label="Report PDF Key (S3 Reference)"
											value={reportPdfKey}
											onChange={(e) => setReportPdfKey(e.target.value)}
											placeholder="e.g. reports/patient_mri_report.pdf"
											size="small"
											required
											startIcon={<CloudUpload fontSize="small" />}
										/>

										<AppInput
											label="DICOM Keys (Comma separated)"
											value={dicomKeys}
											onChange={(e) => setDicomKeys(e.target.value)}
											placeholder="e.g. dicom/mri_brain_001.dcm, ..."
											size="small"
										/>

										<AppInput
											label="Summary Findings / Notes"
											value={summaryFindings}
											onChange={(e) => setSummaryFindings(e.target.value)}
											placeholder="Specify clinical observations..."
											multiline
											rows={3}
										/>

										<AppButton
											label={
												submittingReport
													? 'Uploading Report...'
													: 'Upload Report & Complete Booking'
											}
											startIcon={
												submittingReport ? (
													<CircularProgress size={18} sx={{ color: 'white' }} />
												) : (
													<CloudUpload />
												)
											}
											onClick={handleSubmitReport}
											disabled={submittingReport}
											sx={{ bgcolor: '#00796B', '&:hover': { bgcolor: '#00695C' } }}
										/>
									</Stack>
								) : (
									<Stack spacing={2}>
										<Box
											sx={{
												p: 1.5,
												bgcolor: '#F0FDF4',
												borderRadius: 1.5,
												border: '1px solid #DCFCE7',
											}}
										>
											<Typography variant="body2" color="#166534" fontWeight={600}>
												Report successfully uploaded and delivered.
											</Typography>
										</Box>

										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<FilePresent color="action" />
											<Typography
												variant="body2"
												sx={{
													flex: 1,
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
											>
												{reportDetails?.report_pdf_s3_key || 'report_file.pdf'}
											</Typography>
											<AppButton
												label="View PDF"
												size="small"
												onClick={() => {
													const url = buildS3Url(reportDetails?.report_pdf_s3_key)
													if (url) window.open(url, '_blank')
												}}
												sx={{ minWidth: 70, py: 0.5 }}
											/>
										</Box>

										{reportDetails?.dicom_images_s3_keys &&
											reportDetails.dicom_images_s3_keys.length > 0 && (
												<Box>
													<Typography
														variant="caption"
														color="text.secondary"
														fontWeight={600}
													>
														DICOM Images ({reportDetails.dicom_images_s3_keys.length})
													</Typography>
													<Stack spacing={0.5} sx={{ mt: 0.5 }}>
														{reportDetails.dicom_images_s3_keys.map((k, idx) => (
															<Typography
																key={idx}
																variant="caption"
																noWrap
																color="primary.main"
															>
																{k}
															</Typography>
														))}
													</Stack>
												</Box>
											)}

										{reportDetails?.summary_findings && (
											<Box>
												<Typography variant="caption" color="text.secondary" fontWeight={600}>
													Summary Findings:
												</Typography>
												<Typography
													variant="body2"
													sx={{
														mt: 0.5,
														p: 1.25,
														bgcolor: 'background.paper',
														borderRadius: 1,
														border: '1px solid #E2E8F0',
													}}
												>
													{reportDetails.summary_findings}
												</Typography>
											</Box>
										)}
									</Stack>
								)}
							</SectionCard>
						)}
					</Stack>
				</Grid>
			</Grid>

			<Snackbar
				open={toast.open}
				autoHideDuration={4000}
				onClose={handleCloseToast}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				sx={{ mt: 7 }}
			>
				<Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
					{toast.message}
				</Alert>
			</Snackbar>
		</Box>
	)
}
