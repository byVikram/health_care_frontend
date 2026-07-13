// src/features/Pharmacy/orders/PlaceOrderPage.tsx
//
// Web port of the React Native PlacePharmacyOrderPage.tsx.
// Rendered as drawer CONTENT — this component owns and renders its own <AppDrawer>,
// mirroring how RescheduleDrawer wraps AppDrawer. Consumers just render
// <PlaceOrderPage open={...} onClose={...} pharmacyId={...} pharmacyName={...} />.
//
// Mobile -> Web mapping is explained at the bottom of this turn's response.

import { useCallback, useEffect, useState } from 'react'
import {
	Box,
	Typography,
	CircularProgress,
	IconButton,
	Stack,
	Dialog,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import { toast } from 'react-toastify'

import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'
import AppModal from '../../../components/common/Modal/AppModal'
import { useAuth } from '../../../hooks/useAuth'
import prescriptionImage from '../../../assets/Pharmacy/Prescription.svg'
import { buildS3Url } from '../../../utils/s3'
import { formatDoctorName } from '../../../utils/Utils'

import { createPharmacyOrder, getPatientTreatmentHistory } from '../pharmacyService'
import {
	getPatientAddresses,
	addPatientAddress,
	PatientAddressOut,
} from '../../patient/patientService'
import { TreatmentRecord, DeliveryType, SelectOption } from '../../../types/pharmacyOrder'
import SectionCard from '../../../components/common/Card/SectionCard'

const BRAND_TEAL = '#1f5f68'

const formatReportDate = (
	value: string,
	options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
) => {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleDateString('en-IN', options)
}

export interface PlaceOrderPageProps {
	/** Controls whether the drawer is open. */
	open: boolean
	/** Called when the drawer should close (header X, backdrop, Cancel, or after a successful order). */
	onClose: () => void
	/** Public ID of the pharmacy the order is being placed with. */
	pharmacyId: string
	/** Display name of the pharmacy, shown in the banner and success message. */
	pharmacyName: string
	/**
	 * Called after an order is successfully placed, so the parent can navigate
	 * (e.g. to an orders list) the way mobile's navigation.navigate(ROUTES.STACK.ORDER_LIST) did.
	 * Optional — if omitted, PlaceOrderPage just closes the drawer on success.
	 */
	onOrderPlaced?: () => void
}

export default function PlaceOrderPage({
	open,
	onClose,
	pharmacyId,
	pharmacyName,
	onOrderPlaced,
}: PlaceOrderPageProps) {
	const { user } = useAuth()

	// Consultation / Treatment state
	const [treatments, setTreatments] = useState<TreatmentRecord[]>([])
	const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null)
	const [loadingReports, setLoadingReports] = useState(true)

	// Delivery preference state
	const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
	const [addresses, setAddresses] = useState<PatientAddressOut[]>([])
	const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
	const [loadingAddresses, setLoadingAddresses] = useState(false)

	// Notes & submit state
	const [notes, setNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)

	// Image viewer (full-screen prescription preview)
	const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

	// Inline "Add Address" modal state
	const [showAddressModal, setShowAddressModal] = useState(false)
	const [newLabel, setNewLabel] = useState('')
	const [newLine, setNewLine] = useState('')
	const [newCity, setNewCity] = useState('')
	const [newState, setNewState] = useState('')
	const [newPincode, setNewPincode] = useState('')
	const [savingAddress, setSavingAddress] = useState(false)

	// Reset transient state whenever the drawer is opened for a (possibly new) pharmacy.
	// Mobile didn't need this because each pharmacy got a fresh screen instance via navigation;
	// a drawer instance can be reused across opens, so we reset on open to avoid stale state.
	useEffect(() => {
		if (open) {
			setSelectedTreatmentId(null)
			setDeliveryType('pickup')
			setSelectedAddressId(null)
			setNotes('')
		}
	}, [open, pharmacyId])

	// Fetch treatment history
	useEffect(() => {
		if (!open) return
		const fetchTreatments = async () => {
			if (!user?.id) {
				setLoadingReports(false)
				return
			}
			try {
				setLoadingReports(true)
				const data = await getPatientTreatmentHistory(user.id)
				setTreatments(data)
				if (data.length > 0) {
					setSelectedTreatmentId(data[0].id)
				}
			} catch (err) {
				console.error('[PlaceOrderPage] fetchTreatments error:', err)
				toast.error('Failed to load treatments')
			} finally {
				setLoadingReports(false)
			}
		}
		fetchTreatments()
	}, [user?.id, open])

	// Fetch addresses (only once home_delivery is selected, matching mobile)
	const loadAddresses = useCallback(async () => {
		try {
			setLoadingAddresses(true)
			const res = await getPatientAddresses()
			const list = res.data ?? []
			setAddresses(list)
			const def = list.find((a) => a.is_default)
			if (def) {
				setSelectedAddressId(def.id)
			} else if (list.length > 0) {
				setSelectedAddressId(list[0].id)
			}
		} catch (err) {
			console.error('[PlaceOrderPage] loadAddresses error:', err)
		} finally {
			setLoadingAddresses(false)
		}
	}, [])

	useEffect(() => {
		if (deliveryType === 'home_delivery') {
			loadAddresses()
		}
	}, [deliveryType, loadAddresses])

	const handleAddAddress = async () => {
		if (!newLabel.trim() || !newLine.trim() || !newCity.trim() || !newState.trim() || !newPincode.trim()) {
			toast.error('Please fill in all fields for the address.')
			return
		}
		setSavingAddress(true)
		try {
			await addPatientAddress({
				label: newLabel,
				address_line: newLine,
				city: newCity,
				state: newState,
				pincode: newPincode,
				is_default: addresses.length === 0,
			})
			toast.success('New address added successfully.')
			setNewLabel('')
			setNewLine('')
			setNewCity('')
			setNewState('')
			setNewPincode('')
			setShowAddressModal(false)
			await loadAddresses()
		} catch (err) {
			console.error('[PlaceOrderPage] handleAddAddress error:', err)
			toast.error((err as { message?: string })?.message || 'Failed to add address')
		} finally {
			setSavingAddress(false)
		}
	}

	const handlePlaceOrder = async () => {
		const selectedTreatment = treatments.find((t) => t.id === selectedTreatmentId)

		if (!selectedTreatment) {
			toast.error('Please select a report.')
			return
		}
		if (deliveryType === 'home_delivery' && !selectedAddressId) {
			toast.error('Please select a delivery address.')
			return
		}

		setSubmitting(true)
		try {
			const prescriptionKey = selectedTreatment.prescription_s3_key ?? undefined

			await createPharmacyOrder({
				pharmacy_public_id: pharmacyId,
				treatment_public_id: selectedTreatment.source === 'treatment' ? selectedTreatment.id : undefined,
				external_prescription_s3_key: selectedTreatment.source === 'patient_report' ? prescriptionKey : undefined,
				delivery_type: deliveryType,
				delivery_address_public_id: deliveryType === 'home_delivery' ? (selectedAddressId ?? undefined) : undefined,
				notes: notes.trim() || undefined,
			})

			toast.success(`Your medicine booking request has been successfully submitted to ${pharmacyName}.`)
			onOrderPlaced?.()
			onClose()
		} catch (err) {
			console.error('[PlaceOrderPage] handlePlaceOrder error:', err)
			toast.error((err as { message?: string })?.message || 'An error occurred while booking medicines. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	// Dropdown options
	const treatmentOptions: SelectOption[] = treatments.map((t) => {
		const dateStr = formatReportDate(t.created_at)
		const reportType = t.report_type ? `${t.report_type.replace(/_/g, ' ')} - ` : ''
		const docStr = t.doctor_name ? ` - ${formatDoctorName(t.doctor_name)}` : ''
		const hospStr = t.hospital_name ? ` (${t.hospital_name})` : ''
		return { label: `${reportType}${dateStr}${docStr}${hospStr}`, value: t.id }
	})

	const selectedTreatment = treatments.find((t) => t.id === selectedTreatmentId)
	const selectedPrescriptionUrl = buildS3Url(selectedTreatment?.prescription_s3_key) || prescriptionImage

	const addressOptions: SelectOption[] = addresses.map((a) => ({
		label: `${a.label}: ${a.address_line}, ${a.city} - ${a.pincode}`,
		value: a.id,
	}))

	const activeAddress = addresses.find((a) => a.id === selectedAddressId)

	return (
		<AppDrawer
			open={open}
			onClose={onClose}
			title="Place Pharmacy Order"
			subtitle={pharmacyName}
			onConfirm={handlePlaceOrder}
			confirmLabel="Confirm & Book Order"
			confirmLoading={submitting}
			confirmDisabled={submitting || loadingReports}
			width={920}
		>
			{/* Pharmacy banner — sits above both columns */}
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
				<StorefrontIcon sx={{ fontSize: 32, color: BRAND_TEAL }} />
				<Box>
					<Typography sx={{ fontSize: 12, fontWeight: 600, color: BRAND_TEAL, mb: 0.2 }}>
						Ordering Medicines From
					</Typography>
					<Typography sx={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>{pharmacyName}</Typography>
				</Box>
			</Box>

			{/* Two-column layout: left = mobile's upper section, right = mobile's lower section.
			    Stacks vertically below the md breakpoint. */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2.5,
					alignItems: 'flex-start',
				}}
			>
				{/* ── LEFT COLUMN: Step 1 — Select Consultation ───────────────────────── */}
				<Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
					<SectionCard stepNumber={1} title="Select Patient Report">
						{loadingReports ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 3, gap: 1.25 }}>
								<CircularProgress size={20} sx={{ color: BRAND_TEAL }} />
								<Typography sx={{ fontSize: 13, color: '#667085' }}>
									Fetching reports...
								</Typography>
							</Stack>
						) : treatments.length === 0 ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 3, px: 2, gap: 1.25 }}>
								<DescriptionOutlinedIcon sx={{ fontSize: 36, color: '#90a4ae' }} />
								<Typography sx={{ fontSize: 13, color: '#667085', textAlign: 'center', lineHeight: 1.4 }}>
									No report history found for this patient.
								</Typography>
							</Stack>
						) : (
							<Box sx={{ mt: 0.5 }}>
								<AppSelect
									label="Select Report"
									placeholder="Choose report"
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
											label="Report Date:"
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
											<DetailRow label="Consulting Doctor:" value={formatDoctorName(selectedTreatment.doctor_name)} />
										)}

										{selectedTreatment.hospital_name && (
											<DetailRow label="Clinic / Hospital:" value={selectedTreatment.hospital_name} last />
										)}

										{selectedTreatment.prescription_s3_key && (
											<Box sx={{ pt: selectedTreatment.hospital_name ? 0 : 1.25 }}>
												<Typography sx={{ fontSize: 12, color: '#667085', fontWeight: 500, mb: 0.4 }}>
													Prescription Document (click to view full screen):
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
														alt="Prescription"
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
															Click to expand prescription document
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

					{/* "Add More Pharmacy Orders" — kept as a no-op placeholder exactly as in mobile,
					    where this button has no onPress wired up either. */}
					<AppButton
						label="+ Add More Pharmacy Orders"
						fullWidth
						sx={{ bgcolor: BRAND_TEAL, borderColor: BRAND_TEAL, mb: 0, '&:hover': { bgcolor: '#184a52' } }}
					/>
				</Box>

				{/* ── RIGHT COLUMN: Step 2 — Delivery Preference, Step 3 — Notes ──────── */}
				<Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
					<SectionCard stepNumber={2} title="Delivery Preference">
						{/* Pickup / Home Delivery toggle */}
						<Box
							sx={{
								display: 'flex',
								bgcolor: '#F2F4F7',
								borderRadius: '12px',
								p: 0.5,
								gap: 0.5,
								mb: 1.5,
							}}
						>
							<DeliveryToggleButton
								active={deliveryType === 'pickup'}
								icon={<StorefrontIcon sx={{ fontSize: 20 }} />}
								label="Store Pickup"
								onClick={() => setDeliveryType('pickup')}
							/>
							<DeliveryToggleButton
								active={deliveryType === 'home_delivery'}
								icon={<LocalShippingIcon sx={{ fontSize: 20 }} />}
								label="Home Delivery"
								onClick={() => setDeliveryType('home_delivery')}
							/>
						</Box>

						{deliveryType === 'pickup' ? (
							<Box
								sx={{
									display: 'flex',
									gap: 1.25,
									bgcolor: '#F8F9FA',
									border: '1px solid #EAECEF',
									borderRadius: '12px',
									p: 1.5,
								}}
							>
								<InfoOutlinedIcon sx={{ fontSize: 18, color: BRAND_TEAL, mt: 0.2 }} />
								<Box>
									<Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828', mb: 0.4 }}>
										Collect from Pharmacy Store
									</Typography>
									<Typography sx={{ fontSize: 12, color: '#475467', lineHeight: 1.5 }}>
										Your prescription details will be verified by the pharmacist at {pharmacyName}. Once
										packed, you will receive an alert to collect it.
									</Typography>
								</Box>
							</Box>
						) : (
							<Box
								sx={{
									bgcolor: '#F8F9FA',
									border: '1px solid #EAECEF',
									borderRadius: '12px',
									p: 1.5,
								}}
							>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
									<Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>
										Select Delivery Address
									</Typography>
									<Box
										onClick={() => setShowAddressModal(true)}
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 0.25,
											cursor: 'pointer',
											color: BRAND_TEAL,
											'&:hover': { opacity: 0.75 },
										}}
									>
										<AddIcon sx={{ fontSize: 16 }} />
										<Typography sx={{ fontSize: 12, fontWeight: 700, color: BRAND_TEAL }}>
											Add Address
										</Typography>
									</Box>
								</Box>

								{loadingAddresses ? (
									<Stack alignItems="center" justifyContent="center" sx={{ py: 1.5 }}>
										<CircularProgress size={18} sx={{ color: BRAND_TEAL }} />
									</Stack>
								) : addresses.length === 0 ? (
									<Stack alignItems="center" justifyContent="center" sx={{ py: 2, gap: 1 }}>
										<MapOutlinedIcon sx={{ fontSize: 28, color: '#90a4ae' }} />
										<Typography sx={{ fontSize: 12, color: '#667085' }}>
											No addresses saved yet.
										</Typography>
										<AppButton
											label="+ Add Address"
											onClick={() => setShowAddressModal(true)}
											variant="outlined"
											sx={{
												bgcolor: '#E8F5F5',
												borderColor: '#c6e0e0',
												color: BRAND_TEAL,
												fontWeight: 600,
												'&:hover': { bgcolor: '#dcefef', borderColor: '#c6e0e0' },
											}}
										/>
									</Stack>
								) : (
									<Box sx={{ mt: 1 }}>
										<AppSelect
											placeholder="Choose delivery address"
											options={addressOptions}
											value={selectedAddressId ?? ''}
											onChange={(e) => setSelectedAddressId(e.target.value as string)}
											size="small"
										/>

										{activeAddress && (
											<Box
												sx={{
													mt: 1.5,
													bgcolor: '#fff',
													border: '1px solid #EAECF0',
													borderRadius: '8px',
													p: 1.25,
													display: 'flex',
													alignItems: 'center',
													gap: 1,
												}}
											>
												<Box
													component="span"
													sx={{
														bgcolor: '#F2F4F7',
														borderRadius: '6px',
														px: 0.75,
														py: 0.25,
														fontSize: 11,
														fontWeight: 700,
														color: '#475467',
														whiteSpace: 'nowrap',
													}}
												>
													{activeAddress.label}
												</Box>
												<Typography sx={{ fontSize: 12, color: '#475467', lineHeight: 1.4 }}>
													{activeAddress.address_line}, {activeAddress.city}, {activeAddress.state} -{' '}
													{activeAddress.pincode}
												</Typography>
											</Box>
										)}
									</Box>
								)}
							</Box>
						)}
					</SectionCard>

					<SectionCard stepNumber={3} title="Delivery / Pharmacist Remarks">
						<AppInput
							placeholder="Add specific instructions for the pharmacist, e.g., preferred medication brands, specific delivery times, or substitute preferences."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							multiline
							rows={4}
							size="small"
						/>
					</SectionCard>
				</Box>
			</Box>

			{/* ── Inline "Add New Delivery Address" modal (mobile: AppBottomSheet) ──── */}
			<AppModal
				open={showAddressModal}
				onClose={() => {
					if (!savingAddress) setShowAddressModal(false)
				}}
				title="Add New Delivery Address"
				maxWidth="sm"
			>
				<Stack spacing={2} sx={{ pt: 0.5 }}>
					<AppInput
						label="Address Label (e.g. Home, Work)"
						placeholder="Enter address label"
						value={newLabel}
						onChange={(e) => setNewLabel(e.target.value)}
						size="small"
					/>
					<AppInput
						label="Street / Address Line"
						placeholder="Enter street name, building number"
						value={newLine}
						onChange={(e) => setNewLine(e.target.value)}
						size="small"
					/>
					<AppInput
						label="City"
						placeholder="Enter city"
						value={newCity}
						onChange={(e) => setNewCity(e.target.value)}
						size="small"
					/>
					<Box sx={{ display: 'flex', gap: 1.5 }}>
						<Box sx={{ flex: 1 }}>
							<AppInput
								label="State"
								placeholder="State"
								value={newState}
								onChange={(e) => setNewState(e.target.value)}
								size="small"
							/>
						</Box>
						<Box sx={{ flex: 1 }}>
							<AppInput
								label="Pincode"
								placeholder="Pincode"
								value={newPincode}
								onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
								inputProps={{ inputMode: 'numeric', maxLength: 6 }}
								size="small"
							/>
						</Box>
					</Box>
					<AppButton
						label="Save Address"
						fullWidth
						loading={savingAddress}
						disabled={savingAddress}
						onClick={handleAddAddress}
						sx={{ mt: 0.5 }}
					/>
				</Stack>
			</AppModal>

			{/* ── Full-screen prescription image viewer (mobile: Modal + Image) ─────── */}
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
						alt="Prescription full view"
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
//    to warrant a new components/common entry on their own. ─────────────────────────

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

function DeliveryToggleButton({
	active,
	icon,
	label,
	onClick,
}: {
	active: boolean
	icon: React.ReactNode
	label: string
	onClick: () => void
}) {
	return (
		<Box
			onClick={onClick}
			sx={{
				flex: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 0.75,
				py: 1.5,
				borderRadius: '10px',
				cursor: 'pointer',
				bgcolor: active ? BRAND_TEAL : 'transparent',
				color: active ? '#fff' : '#667085',
				transition: 'background-color 0.15s ease',
				userSelect: 'none',
			}}
		>
			{icon}
			<Typography sx={{ fontSize: 14, fontWeight: 600, color: 'inherit' }}>{label}</Typography>
		</Box>
	)
}

function DetailRow({
	label,
	value,
	multiline = false,
	last = false,
}: {
	label: string
	value: string
	multiline?: boolean
	last?: boolean
}) {
	return (
		<Box
			sx={{
				pb: 1.25,
				mb: 1.25,
				borderBottom: last ? 'none' : '1px solid #EAECEF',
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
