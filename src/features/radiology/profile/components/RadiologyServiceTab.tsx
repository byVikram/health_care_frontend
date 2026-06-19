// src/features/radiology/profile/components/RadiologyServiceTab.tsx
import { useEffect, useState } from 'react'
import { Box, Typography, Divider, Grid, FormControlLabel, CircularProgress } from '@mui/material'
import AppInput from '../../../../components/common/Input/AppInput'
import AppSelect from '../../../../components/common/Select/AppSelect'
import AppSwitch from '../../../../components/common/Switch/AppSwitch'
import ProfileFormActions from '../../../../components/common/ProfileFormActions/ProfileFormActions'
import { customCardStyle } from '../../../../styles/commonStyles'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getScanTypes, getMyScans, updateMyScans, ScanType, RadiologyScan, ScanSetupItem } from '../../radiologyService'

const PRICING_MODELS = [
	{ value: 'fixed', label: 'Fixed Price' },
	{ value: 'starting_from', label: 'Starting From' },
	{ value: 'quote_required', label: 'Request Quote' },
]

export default function RadiologyServiceTab() {
	const [loading, setLoading] = useState(true)
	const [scanTypes, setScanTypes] = useState<ScanType[]>([])
	// const [myScans, setMyScans] = useState<RadiologyScan[]>([])
	const [, setMyScans] = useState<RadiologyScan[]>([])
	const [isDirty, setIsDirty] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)

	// State for managing local edits
	const [catalogDraft, setCatalogDraft] = useState<
		Record<
			number,
			{
				is_available: boolean
				pricing_model: 'fixed' | 'starting_from' | 'quote_required'
				base_price: string
				price_details: string
			}
		>
	>({})

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true)
				const [typesRes, scansRes] = await Promise.all([getScanTypes(), getMyScans()])
				if (typesRes.success && scansRes.success) {
					setScanTypes(typesRes.data)
					setMyScans(scansRes.data)

					// Initialize draft state from existing scans
					const draft: typeof catalogDraft = {}
					typesRes.data.forEach((t) => {
						const existing = scansRes.data.find((s) => s.scan_type.id === t.id)
						draft[t.id] = {
							is_available: existing ? existing.is_available : false,
							pricing_model: existing ? existing.pricing_model : 'starting_from',
							base_price: existing?.base_price != null ? String(existing.base_price) : '',
							price_details: existing?.price_details ?? '',
						}
					})
					setCatalogDraft(draft)
				}
			} catch {
				toast.error('Failed to load scan catalog.')
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [])

	const handleToggleAvailable = (scanTypeId: number, checked: boolean) => {
		setCatalogDraft((prev) => {
			const next = {
				...prev,
				[scanTypeId]: {
					...prev[scanTypeId],
					is_available: checked,
				},
			}
			setIsDirty(true)
			return next
		})
	}

	const handlePricingModelChange = (scanTypeId: number, value: 'fixed' | 'starting_from' | 'quote_required') => {
		setCatalogDraft((prev) => {
			const next = {
				...prev,
				[scanTypeId]: {
					...prev[scanTypeId],
					pricing_model: value,
					// clear base price if quote required
					base_price: value === 'quote_required' ? '' : prev[scanTypeId].base_price,
				},
			}
			setIsDirty(true)
			return next
		})
	}

	const handleBasePriceChange = (scanTypeId: number, value: string) => {
		setCatalogDraft((prev) => {
			const next = {
				...prev,
				[scanTypeId]: {
					...prev[scanTypeId],
					base_price: value,
				},
			}
			setIsDirty(true)
			return next
		})
	}

	const handlePriceDetailsChange = (scanTypeId: number, value: string) => {
		setCatalogDraft((prev) => {
			const next = {
				...prev,
				[scanTypeId]: {
					...prev[scanTypeId],
					price_details: value,
				},
			}
			setIsDirty(true)
			return next
		})
	}

	const handleSave = async () => {
		try {
			// Construct setup items
			const scansPayload: ScanSetupItem[] = []

			// Only send active/offered scans to backend setup endpoint
			scanTypes.forEach((t) => {
				const draft = catalogDraft[t.id]
				if (draft.is_available) {
					const basePriceNum = draft.pricing_model === 'quote_required' ? null : Number(draft.base_price)
					scansPayload.push({
						scan_type_id: t.id,
						pricing_model: draft.pricing_model,
						base_price: isNaN(basePriceNum as number) ? null : basePriceNum,
						price_details: draft.price_details || null,
						is_available: true,
					})
				}
			})

			const res = await updateMyScans({ scans: scansPayload })
			if (res.success) {
				setMyScans(res.data)
				setIsDirty(false)
				setShowSuccess(true)
				toast.success('Scan catalog updated successfully!')
			}
		} catch {
			toast.error('Something went wrong. Please try again.')
		}
	}

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
				<CircularProgress sx={{ color: 'primary.main' }} />
			</Box>
		)
	}

	return (
		<Box sx={{ ...customCardStyle, p: { xs: 2.5, md: 3 } }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
				Service Details
			</Typography>
			<Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
				Manage the list of diagnostic scans offered at your center along with their pricing models.
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				{scanTypes.map((t, idx) => {
					const draft = catalogDraft[t.id] || {
						is_available: false,
						pricing_model: 'starting_from',
						base_price: '',
						price_details: '',
					}

					return (
						<Box key={t.id}>
							{idx > 0 && <Divider sx={{ my: 3 }} />}
							<Grid container spacing={2} alignItems="center">
								<Grid size={{ xs: 12, sm: 6 }}>
									<Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
										{t.name}
									</Typography>
									{t.description && (
										<Typography
											variant="caption"
											sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
										>
											{t.description}
										</Typography>
									)}
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { sm: 'right' } }}>
									<FormControlLabel
										control={
											<AppSwitch
												checked={draft.is_available}
												onChange={(e) => handleToggleAvailable(t.id, e.target.checked)}
											/>
										}
										label={draft.is_available ? 'Offered' : 'Not Offered'}
										sx={{ mr: 0 }}
									/>
								</Grid>
							</Grid>

							{draft.is_available && (
								<Box
									sx={{
										mt: 2.5,
										pl: { sm: 2 },
										borderLeft: '3px solid',
										borderColor: 'primary.main',
									}}
								>
									<Grid container spacing={2}>
										<Grid size={{ xs: 12, sm: 4 }}>
											<AppSelect
												label="Pricing Model"
												value={draft.pricing_model}
												options={PRICING_MODELS}
												placeholder="Select pricing model"
												// onChange={(e) => handlePricingModelChange(t.id, e.target.value as any)}
												onChange={(e) =>
													handlePricingModelChange(
														t.id,
														e.target.value as 'fixed' | 'starting_from' | 'quote_required'
													)
												}
											/>
										</Grid>

										{draft.pricing_model !== 'quote_required' && (
											<Grid size={{ xs: 12, sm: 4 }}>
												<AppInput
													label="Base Price (Rs) *"
													value={draft.base_price}
													placeholder="e.g. 1500"
													type="number"
													onChange={(e) => handleBasePriceChange(t.id, e.target.value)}
													size="small"
												/>
											</Grid>
										)}

										<Grid size={{ xs: 12, sm: draft.pricing_model === 'quote_required' ? 8 : 4 }}>
											<AppInput
												label="Pricing Notes / Details"
												value={draft.price_details}
												placeholder="e.g. Includes report, high-res images"
												onChange={(e) => handlePriceDetailsChange(t.id, e.target.value)}
												size="small"
											/>
										</Grid>
									</Grid>
								</Box>
							)}
						</Box>
					)
				})}
			</Box>

			<ProfileFormActions
				isDirty={isDirty}
				showSuccess={showSuccess}
				onSave={handleSave}
				onCloseSnackbar={() => setShowSuccess(false)}
			/>
		</Box>
	)
}
