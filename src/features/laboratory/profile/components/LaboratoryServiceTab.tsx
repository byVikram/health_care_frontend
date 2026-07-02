// src/features/laboratory/profile/components/LaboratoryServiceTab.tsx
import { useEffect, useState } from 'react'
import { Box, Typography, Divider, Grid, FormControlLabel, CircularProgress, IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AppInput from '../../../../components/common/Input/AppInput'
import AppSelect from '../../../../components/common/Select/AppSelect'
import AppSwitch from '../../../../components/common/Switch/AppSwitch'
import AppButton from '../../../../components/common/Button/AppButton'
import ProfileFormActions from '../../../../components/common/ProfileFormActions/ProfileFormActions'
import { customCardStyle } from '../../../../styles/commonStyles'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
	getLaboratoryTestTypes,
	getMyLaboratoryTests,
	updateMyLaboratoryTests,
	LaboratoryTestType,
	LaboratoryTestSetupItem,
} from '../../laboratoryService'

const PRICING_MODELS = [
	{ value: 'fixed', label: 'Fixed Price' },
	{ value: 'starting_from', label: 'Starting From' },
	{ value: 'quote_required', label: 'Request Quote' },
]

interface ServiceCardDraft {
	uid: string
	test_type_id: number | null
	is_available: boolean
	pricing_model: 'fixed' | 'starting_from' | 'quote_required'
	base_price: string
	price_details: string
}

const makeUid = () => `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const emptyCard = (): ServiceCardDraft => ({
	uid: makeUid(),
	test_type_id: null,
	is_available: true,
	pricing_model: 'starting_from',
	base_price: '',
	price_details: '',
})

export default function LaboratoryServiceTab() {
	const [loading, setLoading] = useState(true)
	const [testTypes, setTestTypes] = useState<LaboratoryTestType[]>([])
	const [cards, setCards] = useState<ServiceCardDraft[]>([emptyCard()])
	const [isDirty, setIsDirty] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true)
				const [typesRes, testsRes] = await Promise.all([getLaboratoryTestTypes(), getMyLaboratoryTests()])
				if (typesRes.success && testsRes.success) {
					setTestTypes(typesRes.data)
					if (testsRes.data.length > 0) {
						setCards(
							testsRes.data.map((t) => ({
								uid: `test-${t.id}`,
								test_type_id: t.test_type.id,
								is_available: t.is_available,
								pricing_model: t.pricing_model,
								base_price: t.base_price != null ? String(t.base_price) : '',
								price_details: t.price_details ?? '',
							}))
						)
					}
					// if testsRes.data is empty, keep the initial emptyCard() already in state
				}
			} catch {
				toast.error('Failed to load test catalog.')
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [])

	const updateCard = (uid: string, patch: Partial<ServiceCardDraft>) => {
		setCards((prev) => prev.map((c) => (c.uid === uid ? { ...c, ...patch } : c)))
		setIsDirty(true)
	}

	// + Add Service: only allowed when the last card already has a test selected
	const lastCardHasSelection = cards.length > 0 && cards[cards.length - 1].test_type_id !== null
	const canAddCard = lastCardHasSelection

	const handleAddCard = () => {
		if (!canAddCard) return
		setCards((prev) => [...prev, emptyCard()])
		setIsDirty(true)
	}

	const handleRemoveCard = (uid: string) => {
		setCards((prev) => {
			const next = prev.filter((c) => c.uid !== uid)
			// always keep at least one card
			return next.length === 0 ? [emptyCard()] : next
		})
		setIsDirty(true)
	}

	const handleTestTypeChange = (uid: string, value: number) => {
		updateCard(uid, { test_type_id: value })
	}

	const handleToggleAvailable = (uid: string, checked: boolean) => {
		updateCard(uid, { is_available: checked })
	}

	const handlePricingModelChange = (uid: string, value: 'fixed' | 'starting_from' | 'quote_required') => {
		const current = cards.find((c) => c.uid === uid)
		updateCard(uid, {
			pricing_model: value,
			base_price: value === 'quote_required' ? '' : current?.base_price ?? '',
		})
	}

	const handleBasePriceChange = (uid: string, value: string) => {
		updateCard(uid, { base_price: value })
	}

	const handlePriceDetailsChange = (uid: string, value: string) => {
		updateCard(uid, { price_details: value })
	}

	const handleSave = async () => {
		const hasIncompleteCard = cards.some((c) => c.test_type_id === null)
		if (hasIncompleteCard) {
			toast.error('Please select a test for every service card before saving.')
			return
		}

		try {
			const testsPayload: LaboratoryTestSetupItem[] = cards.map((c) => {
				const basePriceNum = c.pricing_model === 'quote_required' ? null : Number(c.base_price)
				return {
					test_type_id: c.test_type_id as number,
					pricing_model: c.pricing_model,
					base_price: isNaN(basePriceNum as number) ? null : basePriceNum,
					price_details: c.price_details || null,
					is_available: c.is_available,
				}
			})

			const res = await updateMyLaboratoryTests({ tests: testsPayload })
			if (res.success) {
				setCards(
					res.data.map((t) => ({
						uid: `test-${t.id}`,
						test_type_id: t.test_type.id,
						is_available: t.is_available,
						pricing_model: t.pricing_model,
						base_price: t.base_price != null ? String(t.base_price) : '',
						price_details: t.price_details ?? '',
					}))
				)
				setIsDirty(false)
				setShowSuccess(true)
				toast.success('Test catalog updated successfully!')
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
			{/* Header */}
			<Box
				sx={{
					display: 'flex',
					alignItems: { xs: 'flex-start', sm: 'center' },
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					gap: 1.5,
					mb: 3,
				}}
			>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
						Service Details
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary' }}>
						Manage the list of laboratory tests offered at your center along with their pricing models.
					</Typography>
				</Box>

			<Tooltip title={!lastCardHasSelection ? 'Select a test on the current card first' : ''}>
					<span>
						<AppButton
							variant="contained"
							startIcon={<AddIcon />}
							label="Add Service"
							size="small"
							disabled={!canAddCard}
							onClick={handleAddCard}
						/>
					</span>
				</Tooltip>
			</Box>

			{/* Cards list */}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				{cards.map((card, idx) => {
					// IDs already selected in OTHER cards (excluding the current card).
					// Derived directly from `cards` on every render — no separate disabled-list state —
					// so add/edit/remove automatically keeps the dropdowns in sync.
					const selectedElsewhere = new Set(
						cards.filter((c) => c.uid !== card.uid && c.test_type_id !== null).map((c) => c.test_type_id)
					)
					const options = testTypes.map((t) => ({
						value: t.id,
						label: t.name,
						disabled: selectedElsewhere.has(t.id),
					}))

					return (
						<Box key={card.uid}>
							{idx > 0 && <Divider sx={{ mb: 3 }} />}

							{/* Test selector row */}
							<Grid container spacing={2} alignItems="center">
								<Grid size={{ xs: 12, sm: 6 }}>
									<AppSelect
										label="Laboratory Test"
										value={card.test_type_id ?? ''}
										options={options}
										placeholder="Select a test"
										onChange={(e) => handleTestTypeChange(card.uid, Number(e.target.value))}
									/>
								</Grid>
								<Grid
									size={{ xs: 12, sm: 6 }}
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: { xs: 'space-between', sm: 'flex-end' },
										gap: 1,
									}}
								>
									{/* Only show toggle + delete after a test is selected */}
									{card.test_type_id !== null && (
										<>
											<FormControlLabel
												control={
													<AppSwitch
														checked={card.is_available}
														onChange={(e) => handleToggleAvailable(card.uid, e.target.checked)}
													/>
												}
												label={card.is_available ? 'Offered' : 'Not Offered'}
												sx={{ mr: 0 }}
											/>
											<Tooltip title="Remove service">
												<IconButton size="small" onClick={() => handleRemoveCard(card.uid)}>
													<DeleteOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
												</IconButton>
											</Tooltip>
										</>
									)}
									{/* Show only delete for blank card (not the last remaining card) */}
									{card.test_type_id === null && cards.length > 1 && (
										<Tooltip title="Remove service">
											<IconButton size="small" onClick={() => handleRemoveCard(card.uid)}>
												<DeleteOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
											</IconButton>
										</Tooltip>
									)}
								</Grid>
							</Grid>

							{/* Pricing section — only when a test is selected AND is offered */}
							{card.test_type_id !== null && card.is_available && (
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
												value={card.pricing_model}
												options={PRICING_MODELS}
												placeholder="Select pricing model"
												onChange={(e) =>
													handlePricingModelChange(
														card.uid,
														e.target.value as 'fixed' | 'starting_from' | 'quote_required'
													)
												}
											/>
										</Grid>

										{card.pricing_model !== 'quote_required' && (
											<Grid size={{ xs: 12, sm: 4 }}>
												<AppInput
													label="Base Price (Rs) *"
													value={card.base_price}
													placeholder="e.g. 500"
													type="number"
													onChange={(e) => handleBasePriceChange(card.uid, e.target.value)}
													size="small"
												/>
											</Grid>
										)}

										<Grid size={{ xs: 12, sm: card.pricing_model === 'quote_required' ? 8 : 4 }}>
											<AppInput
												label="Pricing Notes / Details"
												value={card.price_details}
												placeholder="e.g. Includes home sample collection"
												onChange={(e) => handlePriceDetailsChange(card.uid, e.target.value)}
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
