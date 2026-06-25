// src/features/laboratory/bookings/LaboratoryBookingPage.tsx
//
// Patient-facing "Book a Lab Test" drawer.
// Mirrors RadiologyBookingPage.tsx exactly — same 3-step layout, same AppDrawer wrapper.
// Consumers: <LaboratoryBookingPage open={...} onClose={...} laboratoryId={...} ... />

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
import BiotechIcon from '@mui/icons-material/Biotech'
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined'
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

import {
	createLaboratoryBooking,
	fetchLaboratoryTestsForCenter,
	LaboratoryTest,
	LaboratoryBookingCreatePayload,
} from '../laboratoryService'
import { getPatientTreatmentHistory } from '../../Pharmacy/pharmacyService'
import { TreatmentRecord, SelectOption } from '../../../types/pharmacyOrder'
import { formatINR } from '../../../utils/Utils'

const S3_BASE_URL =
	(import.meta.env.VITE_S3_BASE_URL as string | undefined) ||
	'https://healthcare-s3-bucket.s3.amazonaws.com'

const buildS3Url = (key?: string | null): string | null => {
	if (!key) return null
	if (key.startsWith('http://') || key.startsWith('https://')) return key
	return `${S3_BASE_URL.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}

const BRAND_TEAL = '#1f5f68'

const TIME_SLOTS: SelectOption[] = [
	{ label: 'Morning', value: 'Morning' },
	{ label: 'Afternoon', value: 'Afternoon' },
	{ label: 'Evening', value: 'Evening' },
]

const formatDate = (
	value: string,
	options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
) => {
	const d = new Date(value)
	if (Number.isNaN(d.getTime())) return value
	return d.toLocaleDateString('en-IN', options)
}

const formatTestPrice = (test: LaboratoryTest): string => {
	if (test.pricing_model === 'quote_required' || test.base_price === null)
		return 'Quote on request'
	const formatted = formatINR(test.base_price)
	return test.pricing_model === 'starting_from' ? `From ${formatted}` : formatted
}

export interface LaboratoryBookingPageProps {
	open: boolean
	onClose: () => void
	laboratoryId: string
	centerName: string
	centerAddress?: string
	/** Pre-selected test when the patient clicked "Book Test" on a specific result card. */
	preselectedTestId?: number
	onBookingPlaced?: () => void
}

export default function LaboratoryBookingPage({
	open,
	onClose,
	laboratoryId,
	centerName,
	centerAddress,
	preselectedTestId,
	onBookingPlaced,
}: LaboratoryBookingPageProps) {
	const { user } = useAuth()

	const [treatments, setTreatments] = useState<TreatmentRecord[]>([])
	const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null)
	const [loadingTreatments, setLoadingTreatments] = useState(true)

	const [tests, setTests] = useState<LaboratoryTest[]>([])
	const [selectedTestIds, setSelectedTestIds] = useState<number[]>([])
	const [loadingTests, setLoadingTests] = useState(true)

	const [bookingDate, setBookingDate] = useState<string | null>(null)
	const [bookingTime, setBookingTime] = useState('')
	const [notes, setNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

	// Reset transient state on every open / new center
	useEffect(() => {
		if (open) {
			setSelectedTreatmentId(null)
			setSelectedTestIds(preselectedTestId != null ? [preselectedTestId] : [])
			setBookingDate(null)
			setBookingTime('')
			setNotes('')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, laboratoryId])

	// Fetch treatments
	useEffect(() => {
		if (!open) return
		const fetch = async () => {
			if (!user?.id) { setLoadingTreatments(false); return }
			try {
				setLoadingTreatments(true)
				const data = await getPatientTreatmentHistory(user.id)
				setTreatments(data)
				if (data.length > 0) setSelectedTreatmentId(data[0].id)
			} catch {
				toast.error('Failed to load consultations')
			} finally {
				setLoadingTreatments(false)
			}
		}
		void fetch()
	}, [user?.id, open])

	// Fetch tests available at this center
	useEffect(() => {
		if (!open || !laboratoryId) return
		const fetch = async () => {
			try {
				setLoadingTests(true)
				const res = await fetchLaboratoryTestsForCenter(laboratoryId)
				setTests(res.data ?? [])
			} catch {
				toast.error('Failed to load available tests')
			} finally {
				setLoadingTests(false)
			}
		}
		void fetch()
	}, [laboratoryId, open])

	const toggleTest = (testId: number) => {
		setSelectedTestIds((prev) =>
			prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId],
		)
	}

	const selectedTreatment = treatments.find((t) => t.id === selectedTreatmentId)

	const treatmentOptions: SelectOption[] = treatments.map((t) => {
		const dateStr = formatDate(t.created_at)
		const docStr = t.doctor_name ? ` - ${t.doctor_name}` : ''
		const hospStr = t.hospital_name ? ` (${t.hospital_name})` : ''
		return { label: `${dateStr}${docStr}${hospStr}`, value: t.id }
	})

	const selectedTests = tests.filter((t) => selectedTestIds.includes(t.id))
	const estimatedTotal = selectedTests.reduce((sum, t) => sum + (t.base_price ?? 0), 0)
	const hasQuoteRequired = selectedTests.some((t) => t.pricing_model === 'quote_required')

	const selectedPrescriptionUrl =
		buildS3Url(selectedTreatment?.prescription_s3_key) ?? prescriptionImage

	const handleBook = async () => {
		if (!selectedTreatmentId) {
			toast.error('Please select a consultation with a diagnosis.')
			return
		}
		if (selectedTestIds.length === 0) {
			toast.error('Please select at least one test.')
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
			const payload: LaboratoryBookingCreatePayload = {
				laboratory_id: laboratoryId,
				test_ids: selectedTestIds,
				booking_date: bookingDate,
				booking_time: bookingTime,
				treatment_id: selectedTreatmentId,
				notes: notes.trim() || undefined,
			}
			await createLaboratoryBooking(payload)
			toast.success(`Your lab test booking has been successfully submitted to ${centerName}.`)
			onBookingPlaced?.()
			onClose()
		} catch (err) {
			toast.error(
				(err as { message?: string })?.message ||
					'An error occurred while booking. Please try again.',
			)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<AppDrawer
			open={open}
			onClose={onClose}
			title="Book Lab Test"
			subtitle={centerName}
			onConfirm={handleBook}
			confirmLabel="Confirm & Book Test"
			confirmLoading={submitting}
			confirmDisabled={submitting || loadingTests || loadingTreatments}
			width={920}
		>
			{/* Center banner */}
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
				<BiotechIcon sx={{ fontSize: 32, color: BRAND_TEAL }} />
				<Box>
					<Typography sx={{ fontSize: 12, fontWeight: 600, color: BRAND_TEAL, mb: 0.2 }}>
						Booking Lab Test At
					</Typography>
					<Typography sx={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>{centerName}</Typography>
					{centerAddress && (
						<Typography sx={{ fontSize: 12, color: '#667085', mt: 0.2 }}>{centerAddress}</Typography>
					)}
				</Box>
			</Box>

			{/* Two-column layout */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2.5,
					alignItems: 'flex-start',
				}}
			>
				{/* LEFT: Step 1 — Select Consultation */}
				<Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
					<SectionCard stepNumber={1} title="Select Doctor Consultation">
						{loadingTreatments ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 3, gap: 1.25 }}>
								<CircularProgress size={20} sx={{ color: BRAND_TEAL }} />
								<Typography sx={{ fontSize: 13, color: '#667085' }}>Fetching consultations...</Typography>
							</Stack>
						) : treatments.length === 0 ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 3, px: 2, gap: 1.25 }}>
								<DescriptionOutlinedIcon sx={{ fontSize: 36, color: '#90a4ae' }} />
								<Typography sx={{ fontSize: 13, color: '#667085', textAlign: 'center', lineHeight: 1.4 }}>
									No consultation history found. A valid referral diagnosis is required to book a test.
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
											value={formatDate(selectedTreatment.created_at, {
												weekday: 'long',
												day: 'numeric',
												month: 'long',
												year: 'numeric',
											})}
										/>
										{selectedTreatment.notes && (
											<DetailRow
												label="Diagnosis / Notes:"
												value={selectedTreatment.notes}
												multiline
											/>
										)}
										{selectedTreatment.doctor_name && (
											<DetailRow
												label="Referring Doctor:"
												value={selectedTreatment.doctor_name}
											/>
										)}
										{selectedTreatment.prescription_s3_key && (
											<Box>
												<Typography
													sx={{ fontSize: 12, color: '#667085', fontWeight: 500, mb: 0.4 }}
												>
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
														onError={(e) => { e.currentTarget.src = prescriptionImage }}
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

				{/* RIGHT: Step 2 — Tests, Step 3 — Schedule */}
				<Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
					<SectionCard stepNumber={2} title="Select Tests">
						{loadingTests ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 3, gap: 1.25 }}>
								<CircularProgress size={20} sx={{ color: BRAND_TEAL }} />
								<Typography sx={{ fontSize: 13, color: '#667085' }}>Loading available tests...</Typography>
							</Stack>
						) : tests.length === 0 ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 3, px: 2, gap: 1.25 }}>
								<BiotechOutlinedIcon sx={{ fontSize: 36, color: '#90a4ae' }} />
								<Typography sx={{ fontSize: 13, color: '#667085', textAlign: 'center', lineHeight: 1.4 }}>
									No tests available at this laboratory right now.
								</Typography>
							</Stack>
						) : (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
								{tests.map((test) => {
									const checked = selectedTestIds.includes(test.id)
									return (
										<Box
											key={test.id}
											onClick={() => toggleTest(test.id)}
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
													{test.test_type?.name}
												</Typography>
												{test.test_type?.description && (
													<Typography sx={{ fontSize: 12, color: '#667085', mt: 0.2 }}>
														{test.test_type.description}
													</Typography>
												)}
											</Box>
											<Typography
												sx={{ fontSize: 13, fontWeight: 700, color: BRAND_TEAL, whiteSpace: 'nowrap' }}
											>
												{formatTestPrice(test)}
											</Typography>
										</Box>
									)
								})}

								{selectedTests.length > 0 && (
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
											{hasQuoteRequired ? 'Estimated Total (excl. quoted items):' : 'Estimated Total:'}
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
								placeholder="Any special instructions or fasting requirements"
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

			{/* Full-screen prescription viewer */}
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
						onError={(e) => { e.currentTarget.src = prescriptionImage }}
						sx={{ width: '90%', height: '80%', objectFit: 'contain' }}
					/>
				)}
			</Dialog>
		</AppDrawer>
	)
}

// ── Local helpers ──────────────────────────────────────────────────────────

function SectionCard({ stepNumber, title, children }: { stepNumber: number; title: string; children: React.ReactNode }) {
	return (
		<Box
			sx={{
				bgcolor: '#fff',
				borderRadius: '16px',
				border: '1px solid #EAECF0',
				p: 2,
				mb: 2,
				boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
				<Box
					sx={{
						width: 24,
						height: 24,
						borderRadius: '50%',
						bgcolor: BRAND_TEAL,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{stepNumber}</Typography>
				</Box>
				<Typography sx={{ fontSize: 16, fontWeight: 700, color: '#101828' }}>{title}</Typography>
			</Box>
			{children}
		</Box>
	)
}

function DetailRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
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
