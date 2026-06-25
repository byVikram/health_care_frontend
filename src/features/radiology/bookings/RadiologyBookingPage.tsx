// src/features/radiology/bookings/RadiologyBookingPage.tsx
//
// Web port of the React Native RadiologyBookingPage.tsx.
// Rendered as drawer CONTENT — this component owns and renders its own <AppDrawer>,
// mirroring how Pharmacy's PlaceOrderPage.tsx wraps AppDrawer. Consumers just render
// <RadiologyBookingPage open={...} onClose={...} radiologyId={...} centerName={...} ... />
// from the radiology search page/card instead of opening the old Dialog-based popup.

import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	CircularProgress,
	IconButton,
	Stack,
	Dialog,
	Checkbox,
} from '@mui/material'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'

import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppInput from '../../../components/common/Input/AppInput'
import AppDatePicker from '../../../components/common/DatePicker/AppDatePicker'
import { useAuth } from '../../../hooks/useAuth'
import prescriptionImage from '../../../assets/Pharmacy/Prescription.svg'
import { buildS3Url } from '../../../utils/s3'

import {
	createRadiologyBooking,
	fetchRadiologyScansForCenter,
	RadiologyScan,
	RadiologyBookingCreatePayload,
} from '../radiologyService'
import { getPatientTreatmentHistory } from '../../pharmacy/pharmacyService'
import { TreatmentRecord, SelectOption } from '../../../types/pharmacyOrder'
import { formatINR } from '../../../utils/Utils'
import SectionCard from '../../../components/common/Card/SectionCard'

const BRAND_TEAL = '#1f5f68'

const TIME_SLOTS: SelectOption[] = [
	{ label: 'Morning', value: 'Morning' },
	{ label: 'Afternoon', value: 'Afternoon' },
	{ label: 'Evening', value: 'Evening' },
]

const formatReportDate = (
	value: string,
	options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
) => {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleDateString('en-IN', options)
}

const formatScanPrice = (scan: RadiologyScan): string => {
	if (scan.pricing_model === 'quote_required' || scan.base_price === null) {
		return 'Quote on request'
	}
	const formatted = formatINR(scan.base_price)
	return scan.pricing_model === 'starting_from' ? `From ${formatted}` : formatted
}

export interface RadiologyBookingPageProps {
	/** Controls whether the drawer is open. */
	open: boolean
	/** Called when the drawer should close (header X, backdrop, Cancel, or after a successful booking). */
	onClose: () => void
	/** Public ID of the radiology/diagnostic center the booking is being placed with. */
	radiologyId: string
	/** Display name of the center, shown in the banner and success message. */
	centerName: string
	/** Optional address line, shown under the center name in the banner. */
	centerAddress?: string
	/**
	 * Scan the patient clicked "Book Scan" on from the search results. Pre-selected in the
	 * scan list when the catalog loads, but the patient can still add/remove other scans
	 * available at this center — same multi-scan selection mobile supports.
	 */
	preselectedScanId?: number
	/**
	 * Called after a booking is successfully created, so the parent can react
	 * (e.g. navigate to a bookings list) if it wants to. Optional — if omitted,
	 * RadiologyBookingPage just closes the drawer on success, matching PlaceOrderPage.
	 */
	onBookingPlaced?: () => void
}

export default function RadiologyBookingPage({
	open,
	onClose,
	radiologyId,
	centerName,
	centerAddress,
	preselectedScanId,
	onBookingPlaced,
}: RadiologyBookingPageProps) {
	const { user } = useAuth()

	// STEP 1: Consultation / treatment — carries the referral diagnosis
	const [treatments, setTreatments] = useState<TreatmentRecord[]>([])
	const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null)
	const [loadingTreatments, setLoadingTreatments] = useState(true)

	// STEP 2: Scans
	const [scans, setScans] = useState<RadiologyScan[]>([])
	const [selectedScanIds, setSelectedScanIds] = useState<number[]>([])
	const [loadingScans, setLoadingScans] = useState(true)

	// STEP 3: Schedule & notes
	const [bookingDate, setBookingDate] = useState<string | null>(null)
	const [bookingTime, setBookingTime] = useState('')
	const [notes, setNotes] = useState('')

	const [submitting, setSubmitting] = useState(false)
	const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

	// Reset transient state whenever the drawer is opened for a (possibly new) center.
	// Mobile didn't need this because each center got a fresh screen instance via navigation;
	// a drawer instance can be reused across opens, so we reset on open to avoid stale state.
	useEffect(() => {
		if (open) {
			setSelectedTreatmentId(null)
			setSelectedScanIds(preselectedScanId != null ? [preselectedScanId] : [])
			setBookingDate(null)
			setBookingTime('')
			setNotes('')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, radiologyId])

	// Fetch consultations / treatments
	useEffect(() => {
		if (!open) return
		const fetchTreatments = async () => {
			if (!user?.id) {
				setLoadingTreatments(false)
				return
			}
			try {
				setLoadingTreatments(true)
				const data = await getPatientTreatmentHistory(user.id)
				setTreatments(data)
				if (data.length > 0) {
					setSelectedTreatmentId(data[0].id)
				}
			} catch (err) {
				console.error('[RadiologyBookingPage] fetchTreatments error:', err)
				toast.error('Failed to load consultations')
			} finally {
				setLoadingTreatments(false)
			}
		}
		fetchTreatments()
	}, [user?.id, open])

	// Fetch scans available at this center
	useEffect(() => {
		if (!open || !radiologyId) return
		const fetchScans = async () => {
			try {
				setLoadingScans(true)
				const res = await fetchRadiologyScansForCenter(radiologyId)
				setScans(res.data ?? [])
			} catch (err) {
				console.error('[RadiologyBookingPage] fetchScans error:', err)
				toast.error('Failed to load available scans')
			} finally {
				setLoadingScans(false)
			}
		}
		fetchScans()
	}, [radiologyId, open])

	const toggleScan = (scanId: number) => {
		setSelectedScanIds((prev) => (prev.includes(scanId) ? prev.filter((id) => id !== scanId) : [...prev, scanId]))
	}

	const selectedTreatment = treatments.find((t) => t.id === selectedTreatmentId)

	const treatmentOptions: SelectOption[] = treatments.map((t) => {
		const dateStr = formatReportDate(t.created_at)
		const docStr = t.doctor_name ? ` - ${t.doctor_name}` : ''
		const hospStr = t.hospital_name ? ` (${t.hospital_name})` : ''
		return { label: `${dateStr}${docStr}${hospStr}`, value: t.id }
	})

	const selectedScans = scans.filter((s) => selectedScanIds.includes(s.id))
	const estimatedTotal = selectedScans.reduce((sum, s) => sum + (s.base_price ?? 0), 0)
	const hasQuoteRequired = selectedScans.some((s) => s.pricing_model === 'quote_required')

	const selectedPrescriptionUrl = buildS3Url(selectedTreatment?.prescription_s3_key) || prescriptionImage

	// ── Submit ──
	const handleBookScan = async () => {
		if (!selectedTreatmentId) {
			toast.error('Please select a consultation with a diagnosis.')
			return
		}
		if (selectedScanIds.length === 0) {
			toast.error('Please select at least one scan.')
			return
		}
		if (!bookingDate) {
			toast.error('Please select a preferred booking date.')
			return
		}
		if (!bookingTime) {
			toast.error('Please select a preferred time slot.')
			return
		}

		setSubmitting(true)
		try {
			const payload: RadiologyBookingCreatePayload = {
				radiology_id: radiologyId,
				scan_ids: selectedScanIds,
				booking_date: bookingDate,
				booking_time: bookingTime,
				treatment_id: selectedTreatmentId,
				notes: notes.trim() || undefined,
			}

			await createRadiologyBooking(payload)

			toast.success(`Your radiology scan booking has been successfully submitted to ${centerName}.`)
			onBookingPlaced?.()
			onClose()
		} catch (err) {
			console.error('[RadiologyBookingPage] handleBookScan error:', err)
			toast.error((err as { message?: string })?.message || 'An error occurred while booking the scan. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<AppDrawer
			open={open}
			onClose={onClose}
			title="Book Radiology Scan"
			subtitle={centerName}
			onConfirm={handleBookScan}
			confirmLabel="Confirm & Book Scan"
			confirmLoading={submitting}
			confirmDisabled={submitting || loadingScans || loadingTreatments}
			width={920}
		>
			{/* Center banner — sits above both columns */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1.5,
					bgcolor: '#E8F5F5',
					border: '1px solid #c6e0e0',
					borderRadius: '12px',
					p: 2,
					mb: 2.5,
				}}
			>
				<LocalHospitalIcon sx={{ fontSize: 32, color: BRAND_TEAL }} />
				<Box>
					<Typography sx={{ fontSize: 12, fontWeight: 600, color: BRAND_TEAL, mb: 0.2 }}>
						Booking Radiology Scan At
					</Typography>
					<Typography sx={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>{centerName}</Typography>
					{centerAddress ? (
						<Typography sx={{ fontSize: 12, color: '#667085', mt: 0.2 }}>{centerAddress}</Typography>
					) : null}
				</Box>
			</Box>

			{/* Two-column layout: left = Step 1 (consultation), right = Step 2 (scans) + Step 3 (schedule & notes).
			    Stacks vertically below the md breakpoint. */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2.5,
					alignItems: 'flex-start',
				}}
			>
				{/* ── LEFT COLUMN: Step 1 — Select Doctor Consultation ────────────────── */}
				<Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
					<SectionCard stepNumber={1} title="Select Doctor Consultation">
						{loadingTreatments ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 3, gap: 1.25 }}>
								<CircularProgress size={20} sx={{ color: BRAND_TEAL }} />
								<Typography sx={{ fontSize: 13, color: '#667085' }}>
									Fetching consultations...
								</Typography>
							</Stack>
						) : treatments.length === 0 ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 3, px: 2, gap: 1.25 }}>
								<DescriptionOutlinedIcon sx={{ fontSize: 36, color: '#90a4ae' }} />
								<Typography sx={{ fontSize: 13, color: '#667085', textAlign: 'center', lineHeight: 1.4 }}>
									No consultation history found. A valid referral diagnosis is required to book a scan.
								</Typography>
							</Stack>
						) : (
							<Box sx={{ mt: 0.5 }}>
								<AppSelect
									label="Select Consultation"
									placeholder="Choose consultation"
									options={treatmentOptions}
									value={selectedTreatmentId ?? ''}
									onChange={(e) => setSelectedTreatmentId(e.target.value as string)}
									size="small"
								/>

								{selectedTreatment && (
									<Box
										sx={{
											mt: 1.75,
											bgcolor: '#F8F9FA',
											border: '1px solid #EAECEF',
											borderRadius: '12px',
											p: 1.75,
										}}
									>
										<DetailRow
											label="Consultation Date:"
											value={formatReportDate(selectedTreatment.created_at, {
												weekday: 'long',
												day: 'numeric',
												month: 'long',
												year: 'numeric',
											})}
										/>

										{selectedTreatment.notes && (
											<DetailRow label="Diagnosis / Notes:" value={selectedTreatment.notes} multiline />
										)}

										{selectedTreatment.doctor_name && (
											<DetailRow label="Referring Doctor:" value={selectedTreatment.doctor_name} />
										)}

										{selectedTreatment.prescription_s3_key && (
											<Box sx={{ pt: selectedTreatment.doctor_name ? 0 : 1.25 }}>
												<Typography sx={{ fontSize: 12, color: '#667085', fontWeight: 500, mb: 0.4 }}>
													Diagnosis Document (click to view full screen):
												</Typography>
												<Box
													onClick={() => setIsImageViewerOpen(true)}
													sx={{
														bgcolor: '#fff',
														borderRadius: '10px',
														border: '1px solid #EAECF0',
														p: 1,
														cursor: 'pointer',
														'&:hover': { borderColor: BRAND_TEAL },
													}}
												>
													<Box
														component="img"
														src={selectedPrescriptionUrl}
														alt="Diagnosis document"
														onError={(event) => {
															event.currentTarget.src = prescriptionImage
														}}
														sx={{
															width: '100%',
															height: 180,
															objectFit: 'contain',
															bgcolor: '#f2f4f7',
															borderRadius: '8px',
															display: 'block',
														}}
													/>
													<Box
														sx={{
															display: 'flex',
															alignItems: 'center',
															gap: 0.5,
															mt: 0.75,
															bgcolor: '#F8F9FA',
															p: 0.75,
															borderRadius: '6px',
														}}
													>
														<FullscreenIcon sx={{ fontSize: 16, color: BRAND_TEAL }} />
														<Typography sx={{ fontSize: 11, color: '#475467' }} noWrap>
															Click to expand diagnosis document
														</Typography>
													</Box>
												</Box>
											</Box>
										)}
									</Box>
								)}
							</Box>
						)}
					</SectionCard>
				</Box>

				{/* ── RIGHT COLUMN: Step 2 — Select Scans, Step 3 — Schedule & Notes ──── */}
				<Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
					<SectionCard stepNumber={2} title="Select Scans">
						{loadingScans ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 3, gap: 1.25 }}>
								<CircularProgress size={20} sx={{ color: BRAND_TEAL }} />
								<Typography sx={{ fontSize: 13, color: '#667085' }}>
									Loading available scans...
								</Typography>
							</Stack>
						) : scans.length === 0 ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 3, px: 2, gap: 1.25 }}>
								<LocalHospitalOutlinedIcon sx={{ fontSize: 36, color: '#90a4ae' }} />
								<Typography sx={{ fontSize: 13, color: '#667085', textAlign: 'center', lineHeight: 1.4 }}>
									No scans available at this center right now.
								</Typography>
							</Stack>
						) : (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
								{scans.map((scan) => {
									const checked = selectedScanIds.includes(scan.id)
									return (
										<Box
											key={scan.id}
											onClick={() => toggleScan(scan.id)}
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 1.25,
												bgcolor: checked ? '#E8F5F5' : '#F8F9FA',
												border: '1px solid',
												borderColor: checked ? BRAND_TEAL : '#EAECEF',
												borderRadius: '12px',
												p: 1.5,
												cursor: 'pointer',
												transition: 'background-color 0.15s ease, border-color 0.15s ease',
											}}
										>
											<Checkbox
												checked={checked}
												size="small"
												sx={{ p: 0, color: '#98a2b3', '&.Mui-checked': { color: BRAND_TEAL } }}
											/>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>
													{scan.scan_type?.name}
												</Typography>
												{scan.scan_type?.description && (
													<Typography sx={{ fontSize: 12, color: '#667085', mt: 0.2 }}>
														{scan.scan_type.description}
													</Typography>
												)}
											</Box>
											<Typography sx={{ fontSize: 13, fontWeight: 700, color: BRAND_TEAL, whiteSpace: 'nowrap' }}>
												{formatScanPrice(scan)}
											</Typography>
										</Box>
									)
								})}

								{selectedScans.length > 0 && (
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											mt: 0.5,
											pt: 1.25,
											borderTop: '1px solid #EAECF0',
										}}
									>
										<Typography sx={{ fontSize: 13, color: '#475467' }}>
											{hasQuoteRequired
												? 'Estimated Total (excl. quoted items):'
												: 'Estimated Total:'}
										</Typography>
										<Typography sx={{ fontSize: 18, fontWeight: 700, color: BRAND_TEAL }}>
											{formatINR(estimatedTotal)}
										</Typography>
									</Box>
								)}
							</Box>
						)}
					</SectionCard>

					<SectionCard stepNumber={3} title="Schedule & Notes">
						<Stack spacing={2}>
							<AppDatePicker
								label="Preferred Date"
								value={bookingDate}
								onChange={setBookingDate}
								placeholder="Select date"
								format="YYYY-MM-DD"
								disablePast
								size="small"
							/>

							<AppSelect
								label="Preferred Time"
								placeholder="Choose a time slot"
								options={TIME_SLOTS}
								value={bookingTime}
								onChange={(e) => setBookingTime(e.target.value as string)}
								size="small"
							/>

							<AppInput
								label="Additional Notes / Instructions"
								placeholder="Any special instructions or requirements"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								multiline
								rows={4}
								size="small"
							/>
						</Stack>
					</SectionCard>
				</Box>
			</Box>

			{/* ── Full-screen diagnosis document viewer (mobile: Modal + Image) ─────── */}
			<Dialog
				open={isImageViewerOpen}
				onClose={() => setIsImageViewerOpen(false)}
				maxWidth={false}
				PaperProps={{
					sx: {
						bgcolor: 'rgba(0,0,0,0.95)',
						boxShadow: 'none',
						width: '90vw',
						height: '85vh',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						position: 'relative',
					},
				}}
			>
				<IconButton
					onClick={() => setIsImageViewerOpen(false)}
					sx={{
						position: 'absolute',
						top: 16,
						right: 16,
						bgcolor: 'rgba(255,255,255,0.25)',
						color: '#fff',
						'&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
						zIndex: 10,
					}}
				>
					<CloseIcon />
				</IconButton>

				{selectedTreatment?.prescription_s3_key && (
					<Box
						component="img"
						src={selectedPrescriptionUrl}
						alt="Diagnosis document full view"
						onError={(event) => {
							event.currentTarget.src = prescriptionImage
						}}
						sx={{ width: '90%', height: '80%', objectFit: 'contain' }}
					/>
				)}
			</Dialog>
		</AppDrawer>
	)
}

// ── Small shared pieces, kept local to this file since they're not generic enough
//    to warrant a new components/common entry on their own (mirrors PlaceOrderPage.tsx). ────

// function SectionCard({
// 	stepNumber,
// 	title,
// 	children,
// }: {
// 	stepNumber: number
// 	title: string
// 	children: React.ReactNode
// }) {
// 	return (
// 		<Box
// 			sx={{
// 				bgcolor: '#fff',
// 				borderRadius: '16px',
// 				border: '1px solid #EAECF0',
// 				p: 2,
// 				mb: 2,
// 				boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
// 			}}
// 		>
// 			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
// 				<Box
// 					sx={{
// 						width: 24,
// 						height: 24,
// 						borderRadius: '50%',
// 						bgcolor: BRAND_TEAL,
// 						display: 'flex',
// 						alignItems: 'center',
// 						justifyContent: 'center',
// 						flexShrink: 0,
// 					}}
// 				>
// 					<Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{stepNumber}</Typography>
// 				</Box>
// 				<Typography sx={{ fontSize: 16, fontWeight: 700, color: '#101828' }}>{title}</Typography>
// 			</Box>
// 			{children}
// 		</Box>
// 	)
// }

function DetailRow({
	label,
	value,
	multiline = false,
}: {
	label: string
	value: string
	multiline?: boolean
}) {
	return (
		<Box
			sx={{
				pb: 1.25,
				mb: 1.25,
				borderBottom: '1px solid #EAECEF',
				'&:last-child': { borderBottom: 'none', pb: 0, mb: 0 },
			}}
		>
			<Typography sx={{ fontSize: 12, color: '#667085', fontWeight: 500, mb: 0.4 }}>{label}</Typography>
			<Typography
				sx={{
					fontSize: 14,
					color: multiline ? '#475467' : '#101828',
					fontWeight: multiline ? 400 : 600,
					lineHeight: multiline ? 1.45 : 1.3,
				}}
			>
				{value}
			</Typography>
		</Box>
	)
}
