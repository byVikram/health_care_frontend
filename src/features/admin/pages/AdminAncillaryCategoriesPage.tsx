// src/features/admin/pages/AdminAncillaryCategoriesPage.tsx
import React, { useCallback, useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Stack,
	Grid,
	Alert,
	CircularProgress,
	Chip,
	Avatar,
	Button,
	IconButton,
	Divider,
	Tooltip,
	Paper,
	Collapse,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import RefreshIcon from '@mui/icons-material/Refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppButton from '../../../components/common/Button/AppButton'
import AppModal from '../../../components/common/Modal/AppModal'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import AppSwitch from '../../../components/common/Switch/AppSwitch'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import PaginationBar from '../../../pagination/Pagination'
import {
	AdminAncillaryCategoryItem,
	AncillarySpecialtyOption,
	AncillaryProcedureFormPayload,
	listAncillarySpecialtyOptions,
	createAdminAncillarySpecialty,
	listAdminAncillaryCategories,
	createAdminAncillaryCategory,
	updateAdminAncillaryCategory,
	deleteAdminAncillaryCategory,
	addAdminAncillaryProcedure,
	updateAdminAncillaryProcedure,
	deleteAdminAncillaryProcedure,
} from '../adminService'

const getErrorMessage = (err: unknown, fallback: string) => {
	if (err && typeof err === 'object' && 'response' in err) {
		const resp = (err as { response?: { data?: { message?: string } } }).response
		if (resp?.data?.message) return resp.data.message
	}
	return err instanceof Error ? err.message : fallback
}

interface ServiceFormRow {
	id?: string
	key: string
	label: string
	price: string
	providerPrice: string
	aboutService: string
	whatsIncludedText: string
}

const makeEmptyServiceRow = (initial?: Partial<ServiceFormRow>): ServiceFormRow => ({
	id: initial?.id,
	key: initial?.key || `svc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
	label: initial?.label || '',
	price: initial?.price || '',
	providerPrice: initial?.providerPrice || '',
	aboutService: initial?.aboutService || '',
	whatsIncludedText: initial?.whatsIncludedText || '',
})

type AddMode = 'existing' | 'new'


export default function AdminAncillaryCategoriesPage() {
	// ── Choice state: "What would you like to add?" ──────────────────────────
	const [addMode, setAddMode] = useState<AddMode>('existing')

	// ── Option 1: Existing Specialty & Category form state ───────────────────
	const [specialtyId, setSpecialtyId] = useState('')
	const [categoryId, setCategoryId] = useState('')

	// ── Option 2: New Specialty & Category form state ────────────────────────
	const [newSpecialtyName, setNewSpecialtyName] = useState('')
	const [newCategoryName, setNewCategoryName] = useState('')

	// ── Services / Procedures list (Collapsed/Empty initially) ───────────────
	const [services, setServices] = useState<ServiceFormRow[]>([])
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// ── Specialty dropdown data ───────────────────────────────────────────────
	const [specialtyOptions, setSpecialtyOptions] = useState<AncillarySpecialtyOption[]>([])

	// ── Registered Categories list ────────────────────────────────────────────
	const [categories, setCategories] = useState<AdminAncillaryCategoryItem[]>([])
	const [loading, setLoading] = useState(true)
	const [listError, setListError] = useState<string | null>(null)

	// ── Expanded rows tracking ────────────────────────────────────────────────
	const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set())

	// ── Pagination state ──────────────────────────────────────────────────────
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)

	// ── Edit modal state ──────────────────────────────────────────────────────
	const [editCategory, setEditCategory] = useState<AdminAncillaryCategoryItem | null>(null)
	const [editSpecialtyId, setEditSpecialtyId] = useState('')
	const [editCategoryLabel, setEditCategoryLabel] = useState('')
	const [editServices, setEditServices] = useState<ServiceFormRow[]>([])
	const [deletedProcedureIds, setDeletedProcedureIds] = useState<string[]>([])
	const [editSubmitting, setEditSubmitting] = useState(false)
	const [editError, setEditError] = useState<string | null>(null)

	// ── Delete confirm state ──────────────────────────────────────────────────
	const [deleteTarget, setDeleteTarget] = useState<AdminAncillaryCategoryItem | null>(null)
	const [deleting, setDeleting] = useState(false)

	const loadSpecialties = useCallback(async () => {
		try {
			const res = await listAncillarySpecialtyOptions()
			if (res.success) {
				setSpecialtyOptions(res.data || [])
			}
		} catch (err) {
			console.warn('Failed to load ancillary specialties:', err)
		}
	}, [])

	const loadCategories = useCallback(async () => {
		setLoading(true)
		setListError(null)
		try {
			const res = await listAdminAncillaryCategories()
			if (res.success) {
				setCategories(res.data || [])
			}
		} catch (err: unknown) {
			setListError(getErrorMessage(err, 'Failed to load ancillary categories.'))
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadSpecialties()
		loadCategories()
	}, [loadSpecialties, loadCategories])

	// Helper to match category specialty with selected specialty (handles specialtyId / id aliases)
	const matchesSpecialty = useCallback(
		(categorySpecialtyId: string | null | undefined, selectedSpecId: string) => {
			if (!categorySpecialtyId || !selectedSpecId) return false
			if (categorySpecialtyId === selectedSpecId) return true
			const opt = specialtyOptions.find(
				(s) => s.specialtyId === selectedSpecId || s.id === selectedSpecId
			)
			if (opt) {
				return opt.specialtyId === categorySpecialtyId || opt.id === categorySpecialtyId
			}
			return false
		},
		[specialtyOptions]
	)

	// When specialty changes or categories reload, clear invalid selected category in Add Service flow
	useEffect(() => {
		if (categoryId && !categories.some((c) => c.id === categoryId && matchesSpecialty(c.specialty_id, specialtyId))) {
			setCategoryId('')
		}
	}, [categories, categoryId, specialtyId, matchesSpecialty])

	// ── Expand/collapse toggle ───────────────────────────────────────────────
	const toggleExpandCategory = (catId: string) => {
		setExpandedCategoryIds((prev) => {
			const next = new Set(prev)
			if (next.has(catId)) {
				next.delete(catId)
			} else {
				next.add(catId)
			}
			return next
		})
	}

	const expandAllCategories = () => {
		setExpandedCategoryIds(new Set(categories.map((c) => c.id)))
	}

	const collapseAllCategories = () => {
		setExpandedCategoryIds(new Set())
	}

	const handleSpecialtyChange = (nextSpecialtyId: string) => {
		setSpecialtyId(nextSpecialtyId)
		if (categoryId) {
			const currentCat = categories.find((c) => c.id === categoryId)
			if (!currentCat || !matchesSpecialty(currentCat.specialty_id, nextSpecialtyId)) {
				setCategoryId('')
			}
		}
	}

	const handleEditSpecialtyChange = (nextSpecialtyId: string) => {
		setEditSpecialtyId(nextSpecialtyId)
	}

	// ── Add-service rows (create form) ───────────────────────────────────────
	const addServiceRow = () => setServices((prev) => [...prev, makeEmptyServiceRow()])
	const removeServiceRow = (key: string) => setServices((prev) => prev.filter((s) => s.key !== key))
	const updateServiceRow = (key: string, field: keyof ServiceFormRow, value: string) =>
		setServices((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)))

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (addMode === 'existing' && services.length === 0) {
			setError('Please add at least one service by clicking "Add Service".')
			return
		}

		// Validate services if any are provided
		const procedures: AncillaryProcedureFormPayload[] = []
		for (const row of services) {
			if (!row.label.trim()) {
				setError('All services must have a valid Service Name.')
				return
			}
			const priceNum = Number(row.price)
			if (row.price.trim() && (Number.isNaN(priceNum) || priceNum < 0)) {
				setError(`"${row.label.trim()}" has an invalid Customer Price.`)
				return
			}
			const providerPriceNum = Number(row.providerPrice)
			if (row.providerPrice.trim() && (Number.isNaN(providerPriceNum) || providerPriceNum < 0)) {
				setError(`"${row.label.trim()}" has an invalid Provider Price.`)
				return
			}
			procedures.push({
				label: row.label.trim(),
				price: row.price.trim() ? priceNum : 0,
				provider_price: row.providerPrice.trim() ? providerPriceNum : 0,
				about_service: row.aboutService.trim() || undefined,
				whats_included: row.whatsIncludedText
					.split(/[\n,;]+/)
					.map((t) => t.trim())
					.filter(Boolean),
			})
		}

		setSubmitting(true)
		setError(null)

		try {
			if (addMode === 'new') {
				// Option 2: Add a new specialty & category with a new service
				if (!newSpecialtyName.trim()) {
					setError('Please enter a New Specialty Name.')
					setSubmitting(false)
					return
				}
				if (!newCategoryName.trim()) {
					setError('Please enter a New Category Name.')
					setSubmitting(false)
					return
				}

				// 1. Create or resolve the specialty
				const specRes = await createAdminAncillarySpecialty({
					label: newSpecialtyName.trim(),
				})
				const createdSpec = specRes.data
				const specPublicId = createdSpec?.specialtyId || createdSpec?.id || newSpecialtyName.trim()

				// 2. Create the category under the newly resolved specialty with procedures
				const catRes = await createAdminAncillaryCategory({
					label: newCategoryName.trim(),
					specialty_id: specPublicId,
					procedures,
				})
				const createdCategory = catRes.data

				toast.success(
					procedures.length > 0
						? `Specialty "${newSpecialtyName.trim()}" and Category "${newCategoryName.trim()}" created with ${procedures.length} service(s) successfully.`
						: `Specialty "${newSpecialtyName.trim()}" and Category "${newCategoryName.trim()}" created successfully.`
				)

				setNewSpecialtyName('')
				setNewCategoryName('')
				setServices([])
				await loadSpecialties()
				await loadCategories()
				if (createdCategory?.id) {
					setExpandedCategoryIds((prev) => new Set(prev).add(createdCategory.id))
				}
			} else {
				// Option 1: Add service to an existing specialty & category
				if (!specialtyId) {
					setError('Please select a specialty.')
					setSubmitting(false)
					return
				}
				const selectedCategory = categories.find(
					(c) => c.id === categoryId && matchesSpecialty(c.specialty_id, specialtyId)
				)
				if (!selectedCategory) {
					setError('Please select a category belonging to the selected specialty.')
					setSubmitting(false)
					return
				}

				for (const procedure of procedures) {
					await addAdminAncillaryProcedure(selectedCategory.id, procedure)
				}

				toast.success(
					`${procedures.length} service(s) added to "${selectedCategory.label}" successfully.`
				)

				setServices([])
				await loadCategories()
				setExpandedCategoryIds((prev) => new Set(prev).add(selectedCategory.id))
			}
		} catch (err: unknown) {
			setError(
				getErrorMessage(
					err,
					addMode === 'new'
						? 'Failed to create new specialty, category, or services.'
						: 'Failed to add services to this category.'
				)
			)
		} finally {
			setSubmitting(false)
		}
	}

	// ── Edit modal handlers ───────────────────────────────────────────────────
	const openEdit = (category: AdminAncillaryCategoryItem) => {
		setEditCategory(category)
		const matchedSpec = specialtyOptions.find(
			(s) => s.specialtyId === category.specialty_id || s.id === category.specialty_id
		)
		setEditSpecialtyId(matchedSpec ? (matchedSpec.specialtyId || matchedSpec.id) : (category.specialty_id || ''))
		setEditCategoryLabel(category.label || '')
		setEditServices(
			(category.procedures || []).map((p) =>
				makeEmptyServiceRow({
					id: p.id,
					label: p.label,
					price: String(p.price ?? 0),
					providerPrice: String(p.provider_price ?? p.price ?? 0),
					aboutService: p.about_service || '',
					whatsIncludedText: (p.whats_included || []).join(', '),
				})
			)
		)
		setDeletedProcedureIds([])
		setEditError(null)
	}

	const closeEdit = () => {
		setEditCategory(null)
		setEditCategoryLabel('')
		setEditServices([])
		setDeletedProcedureIds([])
		setEditError(null)
	}

	const addEditServiceRow = () => {
		setEditServices((prev) => [...prev, makeEmptyServiceRow()])
	}

	const removeEditServiceRow = (key: string) => {
		setEditServices((prev) => {
			const target = prev.find((s) => s.key === key)
			if (target?.id) {
				setDeletedProcedureIds((d) => [...d, target.id!])
			}
			return prev.filter((s) => s.key !== key)
		})
	}

	const updateEditServiceRow = (key: string, field: keyof ServiceFormRow, value: string) => {
		setEditServices((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)))
	}

	const handleSaveEditCategory = async () => {
		if (!editCategory) return
		if (!editSpecialtyId) {
			setEditError('Please select a specialty.')
			return
		}
		const finalCategoryLabel = editCategoryLabel.trim()
		if (!finalCategoryLabel) {
			setEditError('Category Name cannot be empty.')
			return
		}

		// Validate all services
		for (const row of editServices) {
			if (!row.label.trim()) {
				setEditError('All services must have a valid Service Name.')
				return
			}
			const priceNum = Number(row.price)
			if (row.price.trim() && (Number.isNaN(priceNum) || priceNum < 0)) {
				setEditError(`"${row.label.trim()}" has an invalid Customer Price.`)
				return
			}
			const providerPriceNum = Number(row.providerPrice)
			if (row.providerPrice.trim() && (Number.isNaN(providerPriceNum) || providerPriceNum < 0)) {
				setEditError(`"${row.label.trim()}" has an invalid Provider Price.`)
				return
			}
		}

		setEditSubmitting(true)
		setEditError(null)

		try {
			// 1. Update category name and/or specialty if changed
			if (finalCategoryLabel !== editCategory.label || editSpecialtyId !== editCategory.specialty_id) {
				await updateAdminAncillaryCategory(editCategory.id, {
					label: finalCategoryLabel,
					specialty_id: editSpecialtyId,
				})
			}

			// 2. Delete removed procedures
			for (const procId of deletedProcedureIds) {
				try {
					await deleteAdminAncillaryProcedure(procId)
				} catch (delErr) {
					console.warn(`Failed to delete procedure ${procId}:`, delErr)
				}
			}

			// 3. Update existing procedures / Create new procedures
			for (const row of editServices) {
				const priceNum = Number(row.price) || 0
				const providerPriceNum = Number(row.providerPrice) || 0
				const payload: AncillaryProcedureFormPayload = {
					label: row.label.trim(),
					price: priceNum,
					provider_price: providerPriceNum,
					about_service: row.aboutService.trim() || undefined,
					whats_included: row.whatsIncludedText
						.split(/[\n,;]+/)
						.map((t) => t.trim())
						.filter(Boolean),
				}

				if (row.id) {
					// Existing service -> Update
					await updateAdminAncillaryProcedure(row.id, payload)
				} else {
					// New service -> Create under selected category ID
					await addAdminAncillaryProcedure(editCategory.id, payload)
				}
			}

			toast.success(`Category "${finalCategoryLabel}" and its services updated successfully.`)
			await loadCategories()
			closeEdit()
		} catch (err: unknown) {
			setEditError(getErrorMessage(err, 'Failed to save category changes.'))
		} finally {
			setEditSubmitting(false)
		}
	}

	// ── Delete category handlers ─────────────────────────────────────────────
	const handleConfirmDelete = async () => {
		if (!deleteTarget) return
		setDeleting(true)
		try {
			await deleteAdminAncillaryCategory(deleteTarget.id)
			toast.success(`Category "${deleteTarget.label}" deleted.`)
			setDeleteTarget(null)
			await loadCategories()
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to delete category.'))
		} finally {
			setDeleting(false)
		}
	}

	const specialtySelectOptions = specialtyOptions.map((s) => ({
		value: s.specialtyId || s.id,
		label: s.label,
	}))

	const categorySelectOptions = categories
		.filter((c) => matchesSpecialty(c.specialty_id, specialtyId))
		.map((c) => ({ value: c.id, label: c.label }))

	// Sliced categories for pagination
	const totalRows = categories.length
	const totalPages = Math.max(1, Math.ceil(totalRows / Math.max(1, pageSize)))
	const safePage = Math.min(Math.max(1, page), totalPages)
	const startIndex = (safePage - 1) * pageSize
	const paginatedCategories = categories.slice(startIndex, startIndex + pageSize)

	return (
		<Box sx={{ pb: 6 }}>
			<AdminPageHeader
				title="Ancillary Categories"
				subtitle="Manage the master categories used across ancillary service discovery, booking, and service configuration."
				count={categories.length}
				countLabel="categories"
			/>

			<Grid container spacing={3} sx={{ mb: 4, alignItems: 'flex-start' }}>
				<Grid size={{ xs: 12, md: 7 }}>
					<SectionCard
						title="Add Services"
						subtitle="Add new services to an existing category, or register a new specialty and category."
					>
						<form onSubmit={handleSubmit}>
							<Stack spacing={2.5}>
								{error && (
									<Alert severity="error" sx={{ borderRadius: 2 }}>
										{error}
									</Alert>
								)}

								{/* ── 1. Choice before Specialty: "What would you like to add?" ── */}
								<Box>
									<Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
										What would you like to add?
									</Typography>
									<Stack direction="row" spacing={1.5} alignItems="center">
										<Typography
											variant="body2"
											fontWeight={addMode === 'existing' ? 700 : 500}
											color={addMode === 'existing' ? '#0f766e' : '#64748b'}
										>
											Existing
										</Typography>
										<AppSwitch
											checked={addMode === 'new'}
											onChange={(e) => {
												setAddMode(e.target.checked ? 'new' : 'existing')
												setError(null)
											}}
										/>
										<Typography
											variant="body2"
											fontWeight={addMode === 'new' ? 700 : 500}
											color={addMode === 'new' ? '#0f766e' : '#64748b'}
										>
											New
										</Typography>
									</Stack>
								</Box>

								<Divider sx={{ my: 0.5 }} />

								{/* ── 2. Option 1: Existing Specialty & Category Dropdowns ── */}
								{addMode === 'existing' ? (
									<Stack spacing={2.5}>
										{/* Specialty Dropdown */}
										<AppSelect
											label="Specialty"
											placeholder="Select the ancillary specialty"
											value={specialtyId}
											onChange={(e) => handleSpecialtyChange(e.target.value as string)}
											options={specialtySelectOptions}
											fullWidth
										/>

										{/* Category Name Dropdown (shows only categories under selected specialty) */}
										<Box>
											<AppSelect
												label="Category Name"
												placeholder={
													specialtyId
												? categorySelectOptions.length > 0
													? 'Select a category'
													: 'No categories found for this specialty'
												: 'Select a specialty first'
												}
												value={categoryId}
												onChange={(e) => setCategoryId(e.target.value as string)}
												options={categorySelectOptions}
												disabled={!specialtyId}
												required
												fullWidth
											/>
											{specialtyId && categorySelectOptions.length === 0 && (
												<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
													No categories found under this specialty. You can use "New Specialty &amp; Category" above.
												</Typography>
											)}
										</Box>
									</Stack>
								) : (
									/* ── 3. Option 2: New Specialty & Category Text Inputs ── */
									<Stack spacing={2.5}>
										<AppInput
											label="New Specialty Name"
											placeholder="e.g. Critical Care Nursing, Physiotherapy, Elder Care"
											value={newSpecialtyName}
											onChange={(e) => setNewSpecialtyName(e.target.value)}
											required
											fullWidth
										/>

										<AppInput
											label="New Category Name"
											placeholder="e.g. ICU Care at Home, Post-Op Rehabilitation"
											value={newCategoryName}
											onChange={(e) => setNewCategoryName(e.target.value)}
											required
											fullWidth
										/>
									</Stack>
								)}

								<Divider sx={{ my: 0.5 }} />

								{/* ── 4. Services / Procedures (Clean & Collapsed initially) ── */}
								<Box>
									<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: services.length > 0 ? 1.5 : 0 }}>
										<Box>
											<Typography variant="subtitle2" fontWeight={700} color="#0f172a">
												Services / Procedures
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Add the services offered under this category now, or manage them later.
											</Typography>
										</Box>
										<Button
											size="small"
											startIcon={<AddIcon fontSize="small" />}
											onClick={addServiceRow}
											sx={{ textTransform: 'none', color: '#0d9488', fontWeight: 700 }}
										>
											Add Service
										</Button>
									</Stack>

									{services.length > 0 && (
										<Stack spacing={2} sx={{ mt: 1.5 }}>
											{services.map((row, idx) => (
												<Box
													key={row.key}
													sx={{ p: 2.25, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}
												>
													{/* Service Header with Delete Icon */}
													<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
														<Typography variant="caption" fontWeight={800} color="#0d9488" sx={{ letterSpacing: '0.04em' }}>
															SERVICE {idx + 1}
														</Typography>
														<Tooltip title="Delete / Remove this service">
															<IconButton
																size="small"
																onClick={() => removeServiceRow(row.key)}
																sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
															>
																<DeleteOutlineIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</Stack>

													<Stack spacing={1.75}>
														<Grid container spacing={2}>
															<Grid size={{ xs: 12, md: 6 }}>
																<AppInput
																	label="Service Name"
																	placeholder="e.g. ICU Care at Home"
																	value={row.label}
																	onChange={(e) => updateServiceRow(row.key, 'label', e.target.value)}
																	fullWidth
																/>
															</Grid>
															<Grid size={{ xs: 12, sm: 6, md: 3 }}>
																<AppInput
																	label="Customer Price"
																	placeholder="e.g. 1299"
																	value={row.price}
																	onChange={(e) => updateServiceRow(row.key, 'price', e.target.value)}
																	type="number"
																	fullWidth
																	InputProps={{
																		startAdornment: (
																			<Box component="span" sx={{ mr: 0.5, color: 'text.secondary', fontWeight: 600 }}>
																				₹
																			</Box>
																		),
																	}}
																	sx={{
																		'& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
																			WebkitAppearance: 'none',
																			margin: 0,
																		},
																		'& input[type=number]': {
																			MozAppearance: 'textfield',
																		},
																	}}
																/>
															</Grid>
															<Grid size={{ xs: 12, sm: 6, md: 3 }}>
																<AppInput
																	label="Provider Price"
																	placeholder="e.g. 999"
																	value={row.providerPrice}
																	onChange={(e) => updateServiceRow(row.key, 'providerPrice', e.target.value)}
																	type="number"
																	fullWidth
																	InputProps={{
																		startAdornment: (
																			<Box component="span" sx={{ mr: 0.5, color: 'text.secondary', fontWeight: 600 }}>
																				₹
																			</Box>
																		),
																	}}
																	sx={{
																		'& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
																			WebkitAppearance: 'none',
																			margin: 0,
																		},
																		'& input[type=number]': {
																			MozAppearance: 'textfield',
																		},
																	}}
																/>
															</Grid>
														</Grid>

														<AppInput
															label="About Service"
															placeholder="Brief description of this service..."
															value={row.aboutService}
															onChange={(e) => updateServiceRow(row.key, 'aboutService', e.target.value)}
															multiline
															minRows={2}
															maxRows={4}
															fullWidth
														/>

														<AppInput
															label="What's Included"
															placeholder="e.g. Qualified physiotherapy professional, Functional assessment, Guided rehabilitation exercises, Progress monitoring"
															value={row.whatsIncludedText}
															onChange={(e) => updateServiceRow(row.key, 'whatsIncludedText', e.target.value)}
															multiline
															minRows={2}
															maxRows={4}
															fullWidth
															sx={{
																width: '100%',
																'& .MuiOutlinedInput-root': {
																	p: 1.25,
																	alignItems: 'flex-start',
																},
																'& .MuiInputBase-inputMultiline': {
																	lineHeight: 1.6,
																	fontSize: '0.85rem',
																	boxSizing: 'border-box',
																},
															}}
														/>

													</Stack>
												</Box>
											))}
										</Stack>
									)}
								</Box>

								<Box sx={{ pt: 0.5 }}>
									<AppButton
										label={
											submitting
												? addMode === 'new'
													? 'Creating...'
													: 'Adding Services...'
												: addMode === 'new'
													? services.length > 0
														? 'Create Specialty, Category & Services'
														: 'Create Category'
													: 'Add Services'
										}
										type="submit"
										disabled={submitting || (addMode === 'existing' && services.length === 0)}
										startIcon={<AddCircleIcon />}
										sx={{ bgcolor: '#0d9488', py: 1.2, px: 3, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#0f766e' } }}
									/>
								</Box>
							</Stack>
						</form>
					</SectionCard>
				</Grid>

				{/* ── Fixed Natural-Height Right-Side Standard Panel (No Vertical Expansion) ── */}
				<Grid size={{ xs: 12, md: 5 }} sx={{ alignSelf: 'flex-start' }}>
					<Box
						sx={{
							p: 3,
							borderRadius: '14px',
							bgcolor: '#0f172a',
							color: '#ffffff',
							border: '1px solid #1e293b',
							boxSizing: 'border-box',
						}}
					>
						<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
							<AccountTreeIcon sx={{ color: '#2dd4bf', fontSize: 28 }} />
							<Typography variant="h6" fontWeight={800}>
								Ancillary Category Standard
							</Typography>
						</Stack>
						<Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
							Ancillary categories registered in this master catalog are available across the system's ancillary service workflows:
						</Typography>
						<Box component="ul" sx={{ pl: 2, mt: 1.5, color: '#cbd5e1', fontSize: 13, lineHeight: 1.8 }}>
							<li>Ancillary service discovery and filtering.</li>
							<li>Service booking and appointment workflows.</li>
							<li>Provider and service routing.</li>
							<li>Service and pricing configuration (Customer & Provider pricing).</li>
						</Box>
					</Box>
				</Grid>
			</Grid>

			{/* ── Registered Categories Section ── */}
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
				<Box>
					<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
						Registered Ancillary Categories
					</Typography>
					<Typography variant="caption" color="text.secondary">
						All active ancillary service categories and their associated procedures
					</Typography>
				</Box>
				<Stack direction="row" spacing={1.5}>
					<Button
						variant="text"
						size="small"
						onClick={expandedCategoryIds.size === categories.length ? collapseAllCategories : expandAllCategories}
						sx={{ textTransform: 'none', color: '#0d9488', fontWeight: 600, fontSize: '0.8rem' }}
					>
						{expandedCategoryIds.size === categories.length ? 'Collapse All' : 'Expand All Services'}
					</Button>
					<Button
						variant="outlined"
						size="small"
						startIcon={<RefreshIcon />}
						onClick={loadCategories}
						disabled={loading}
						sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#0d9488', color: '#0d9488' } }}
					>
						Refresh Catalog
					</Button>
				</Stack>
			</Stack>

			{listError && (
				<Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
					{listError}
				</Alert>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
						Loading ancillary categories...
					</Typography>
				</Stack>
			) : (
				<Paper
					elevation={0}
					sx={{
						borderRadius: '14px',
						border: '1px solid',
						borderColor: 'divider',
						overflow: 'hidden',
						boxShadow: '0 4px 20px rgba(15,23,42,0.015)',
					}}
				>
					<Table>
						<TableHead>
							<TableRow sx={{ bgcolor: '#f8fafc' }}>
								<TableCell sx={{ width: 48, py: 1.5 }} />
								<TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', py: 1.5 }}>
									Category
								</TableCell>
								<TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', py: 1.5 }}>
									Specialty
								</TableCell>
								<TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', py: 1.5 }}>
									Services / Procedures
								</TableCell>
								<TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', py: 1.5 }}>
									Actions
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginatedCategories.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5}>
										<Box sx={{ py: 6, textAlign: 'center' }}>
											<Typography variant="body2" sx={{ color: 'text.secondary' }}>
												No ancillary categories found.
											</Typography>
										</Box>
									</TableCell>
								</TableRow>
							) : (
								paginatedCategories.map((category) => {
									const isExpanded = expandedCategoryIds.has(category.id)
									const procs = category.procedures || []
									const count = procs.length

									return (
										<React.Fragment key={category.id}>
											{/* Main Category Row */}
											<TableRow
												hover
												sx={{
													bgcolor: isExpanded ? 'rgba(13,148,136,0.02)' : 'inherit',
													transition: 'background 0.15s ease',
													cursor: 'pointer',
												}}
												onClick={() => toggleExpandCategory(category.id)}
											>
												<TableCell sx={{ py: 1.75, pr: 0 }}>
													<IconButton
														size="small"
														onClick={(e) => {
															e.stopPropagation()
															toggleExpandCategory(category.id)
														}}
														sx={{ color: isExpanded ? '#0d9488' : '#94a3b8' }}
													>
														{isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
													</IconButton>
												</TableCell>
												<TableCell sx={{ py: 1.75 }}>
													<Stack direction="row" spacing={1.5} alignItems="center">
														<Avatar sx={{ bgcolor: 'rgba(13,148,136,0.12)', color: '#0d9488', width: 36, height: 36, fontSize: 13, fontWeight: 800 }}>
															{(category.label || 'C').substring(0, 1).toUpperCase()}
														</Avatar>
														<Box sx={{ minWidth: 0 }}>
															<Typography variant="subtitle2" fontWeight={700} color="#0f172a">
																{category.label}
															</Typography>
															<Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
																{category.id}
															</Typography>
														</Box>
													</Stack>
												</TableCell>
												<TableCell sx={{ py: 1.75 }}>
													{category.specialty_label ? (
														<Chip
															label={category.specialty_label}
															size="small"
															sx={{ bgcolor: '#f8fafc', color: '#475569', fontSize: '0.72rem', borderRadius: '6px', height: 24, border: '1px solid #e2e8f0' }}
														/>
													) : (
														<Typography variant="caption" color="text.secondary">
															—
														</Typography>
													)}
												</TableCell>
												<TableCell sx={{ py: 1.75 }}>
													<Stack direction="row" spacing={1} alignItems="center">
														<Chip
															label={`${count} service${count === 1 ? '' : 's'}`}
															size="small"
															sx={{
																bgcolor: count > 0 ? 'rgba(13,148,136,0.1)' : '#f1f5f9',
																color: count > 0 ? '#0d9488' : '#64748b',
																fontWeight: 700,
																fontSize: '0.72rem',
																height: 24,
																borderRadius: '6px',
															}}
														/>
														<Button
															size="small"
															variant="text"
															onClick={(e) => {
																e.stopPropagation()
																toggleExpandCategory(category.id)
															}}
															sx={{
																textTransform: 'none',
																fontSize: '0.75rem',
																fontWeight: 600,
																color: isExpanded ? '#0d9488' : '#64748b',
																minWidth: 0,
																p: 0,
															}}
														>
															{isExpanded ? 'Hide services' : 'Show services'}
														</Button>
													</Stack>
												</TableCell>
												<TableCell align="right" sx={{ py: 1.75 }} onClick={(e) => e.stopPropagation()}>
													<Stack direction="row" spacing={0.5} justifyContent="flex-end">
														<Tooltip title="Edit category & services">
															<IconButton size="small" onClick={() => openEdit(category)} sx={{ color: '#64748b', '&:hover': { color: '#0d9488' } }}>
																<EditIcon fontSize="small" />
															</IconButton>
														</Tooltip>
														<Tooltip title="Delete category">
															<IconButton size="small" onClick={() => setDeleteTarget(category)} sx={{ color: '#64748b', '&:hover': { color: '#ef4444' } }}>
																<DeleteOutlineIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</Stack>
												</TableCell>
											</TableRow>

											{/* Expandable Services Row */}
											<TableRow sx={{ bgcolor: '#fcfdfd' }}>
												<TableCell colSpan={5} sx={{ py: 0, px: 3, borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none' }}>
													<Collapse in={isExpanded} timeout="auto" unmountOnExit>
														<Box sx={{ py: 2.5, px: 1 }}>
															<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
																<Typography variant="caption" fontWeight={800} color="#0f172a" sx={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>
																	SERVICES / PROCEDURES UNDER "{category.label}" ({count})
																</Typography>
																<Button
																	size="small"
																	startIcon={<AddIcon fontSize="small" />}
																	onClick={() => openEdit(category)}
																	sx={{ textTransform: 'none', color: '#0d9488', fontWeight: 700, fontSize: '0.75rem' }}
																>
																	Manage Services
																</Button>
															</Stack>

															{procs.length === 0 ? (
																<Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
																	<Typography variant="caption" color="text.secondary">
																		No services registered under this category yet. Click "Manage Services" to add services.
																	</Typography>
																</Box>
															) : (
																<Stack spacing={1}>
																	{procs.map((proc) => (
																		<Box
																			key={proc.id}
																			sx={{
																				p: 1.75,
																				borderRadius: '10px',
																				bgcolor: '#ffffff',
																				border: '1px solid #e2e8f0',
																				display: 'flex',
																				flexDirection: { xs: 'column', sm: 'row' },
																				justifyContent: 'space-between',
																				alignItems: { xs: 'flex-start', sm: 'center' },
																				gap: 1.5,
																			}}
																		>
																			<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
																				<Box sx={{ minWidth: 0, flex: 1 }}>
																					<Typography variant="body2" fontWeight={700} color="#0f172a">
																						{proc.label}
																					</Typography>
																					{proc.about_service && (
																						<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
																							{proc.about_service}
																						</Typography>
																					)}
																					{proc.whats_included && proc.whats_included.length > 0 && (
																						<Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
																							{proc.whats_included.map((item, iIdx) => (
																								<Chip
																									key={iIdx}
																									label={item}
																									size="small"
																									sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#f1f5f9', color: '#475569' }}
																								/>
																							))}
																						</Stack>
																					)}
																				</Box>
																			</Stack>

																			<Stack direction="row" spacing={2} alignItems="center" sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
																				<Box sx={{ textAlign: 'right' }}>
																					<Typography variant="body2" fontWeight={800} color="#0d9488">
																						₹{proc.price}
																					</Typography>
																					<Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block' }}>
																						Customer Price
																					</Typography>
																					{proc.provider_price !== undefined && proc.provider_price !== null && (
																						<Typography variant="caption" color="#64748b" sx={{ fontSize: 10, display: 'block', fontWeight: 600 }}>
																							Provider: ₹{proc.provider_price}
																						</Typography>
																					)}
																				</Box>
																				<Tooltip title="Edit / Remove in Manager">
																					<IconButton size="small" onClick={() => openEdit(category)} sx={{ color: '#94a3b8', '&:hover': { color: '#0d9488' } }}>
																						<EditIcon fontSize="small" />
																					</IconButton>
																				</Tooltip>
																			</Stack>
																		</Box>
																	))}
																</Stack>
															)}
														</Box>
													</Collapse>
												</TableCell>
											</TableRow>
										</React.Fragment>
									)
								})
							)}
						</TableBody>
					</Table>

					{/* ── Pagination at the Bottom ── */}
					<Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: 1 }}>
						<PaginationBar
							page={safePage}
							pageSize={pageSize}
							totalRows={totalRows}
							pageSizeOptions={[5, 10, 20, 50]}
							onPageChange={(p) => setPage(p)}
							onPageSizeChange={(s) => {
								setPageSize(s)
								setPage(1)
							}}
						/>
					</Box>
				</Paper>
			)}

			{/* ── Edit Category Modal ── */}
			<AppModal
				open={!!editCategory}
				onClose={closeEdit}
				title={editCategory ? `Edit "${editCategory.label}"` : 'Edit Category'}
				maxWidth="md"
			>
				{editCategory && (
					<Stack spacing={3} sx={{ pb: 1, pt: 0.5 }}>
						{editError && (
							<Alert severity="error" sx={{ borderRadius: 2 }}>
								{editError}
							</Alert>
						)}

						{/* 1. Specialty (FIRST in Edit order) */}
						<AppSelect
							label="Specialty"
							value={editSpecialtyId}
							onChange={(e) => handleEditSpecialtyChange(e.target.value as string)}
							options={specialtySelectOptions}
							fullWidth
						/>

						{/* 2. Category Name (SECOND in Edit order) */}
						<AppInput
							label="Category Name"
							placeholder="Enter category name"
							value={editCategoryLabel}
							onChange={(e) => setEditCategoryLabel(e.target.value)}
							fullWidth
						/>

						<Divider />

						{/* 3. Fully Editable Services / Procedures List */}
						<Box>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
								<Box>
									<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
										Services / Procedures ({editServices.length})
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Modify existing services or add new services to this category.
									</Typography>
								</Box>
								<Button
									size="small"
									startIcon={<AddIcon fontSize="small" />}
									onClick={addEditServiceRow}
									sx={{ textTransform: 'none', color: '#0d9488', fontWeight: 700 }}
								>
									Add Service
								</Button>
							</Stack>

							<Stack spacing={2.5}>
								{editServices.map((row, idx) => (
									<Box
										key={row.key}
										sx={{
											p: 2.25,
											borderRadius: 2.5,
											border: '1px solid #e2e8f0',
											bgcolor: '#f8fafc',
											boxShadow: '0 2px 8px rgba(15,23,42,0.02)',
										}}
									>
										<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
											<Stack direction="row" spacing={1} alignItems="center">
												<Typography variant="caption" fontWeight={800} color="#0d9488" sx={{ letterSpacing: '0.04em' }}>
													SERVICE {idx + 1}
												</Typography>
												<Chip
													label={row.id ? 'Existing' : 'New'}
													size="small"
													sx={{
														height: 20,
														fontSize: '0.65rem',
														fontWeight: 700,
														bgcolor: row.id ? '#e0f2fe' : '#ecfdf5',
														color: row.id ? '#0369a1' : '#047857',
													}}
												/>
											</Stack>
											<IconButton
												size="small"
												onClick={() => removeEditServiceRow(row.key)}
												sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
												title="Delete / Remove this service"
											>
												<DeleteOutlineIcon fontSize="small" />
											</IconButton>
										</Stack>

										<Stack spacing={1.75}>
											<Grid container spacing={2}>
												<Grid size={{ xs: 12, md: 6 }}>
													<AppInput
														label="Service Name"
														placeholder="e.g. ICU Care at Home"
														value={row.label}
														onChange={(e) => updateEditServiceRow(row.key, 'label', e.target.value)}
														fullWidth
													/>
												</Grid>
												<Grid size={{ xs: 12, sm: 6, md: 3 }}>
													<AppInput
														label="Customer Price"
														placeholder="e.g. 1299"
														value={row.price}
														onChange={(e) => updateEditServiceRow(row.key, 'price', e.target.value)}
														type="number"
														fullWidth
														InputProps={{
															startAdornment: (
																<Box component="span" sx={{ mr: 0.5, color: 'text.secondary', fontWeight: 600 }}>
																	₹
																</Box>
															),
														}}
														sx={{
															'& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
																WebkitAppearance: 'none',
																margin: 0,
															},
															'& input[type=number]': {
																MozAppearance: 'textfield',
															},
														}}
													/>
												</Grid>
												<Grid size={{ xs: 12, sm: 6, md: 3 }}>
													<AppInput
														label="Provider Price"
														placeholder="e.g. 999"
														value={row.providerPrice}
														onChange={(e) => updateEditServiceRow(row.key, 'providerPrice', e.target.value)}
														type="number"
														fullWidth
														InputProps={{
															startAdornment: (
																<Box component="span" sx={{ mr: 0.5, color: 'text.secondary', fontWeight: 600 }}>
																	₹
																</Box>
															),
														}}
														sx={{
															'& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
																WebkitAppearance: 'none',
																margin: 0,
															},
															'& input[type=number]': {
																MozAppearance: 'textfield',
															},
														}}
													/>
												</Grid>
											</Grid>

											<AppInput
												label="About Service"
												placeholder="Brief description of this service..."
												value={row.aboutService}
												onChange={(e) => updateEditServiceRow(row.key, 'aboutService', e.target.value)}
												multiline
												minRows={2}
												maxRows={4}
												fullWidth
											/>

											<AppInput
												label="What's Included"
												placeholder="e.g. Qualified physiotherapy professional, Functional assessment, Guided rehabilitation exercises, Progress monitoring"
												value={row.whatsIncludedText}
												onChange={(e) => updateEditServiceRow(row.key, 'whatsIncludedText', e.target.value)}
												multiline
												minRows={2}
												maxRows={4}
												fullWidth
												sx={{
													width: '100%',
													'& .MuiOutlinedInput-root': {
														p: 1.25,
														alignItems: 'flex-start',
													},
													'& .MuiInputBase-inputMultiline': {
														lineHeight: 1.6,
														fontSize: '0.85rem',
														boxSizing: 'border-box',
													},
												}}
											/>

										</Stack>
									</Box>
								))}

								{editServices.length === 0 && (
									<Box sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
										<Typography variant="body2" color="text.secondary">
											No services in this category yet. Click "+ Add Service" to add a service.
										</Typography>
									</Box>
								)}
							</Stack>
						</Box>

						<Divider />

						{/* Modal Footer Actions */}
						<Stack direction="row" spacing={1.5} justifyContent="flex-end" alignItems="center">
							<Button
								variant="outlined"
								onClick={closeEdit}
								disabled={editSubmitting}
								sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#cbd5e1', color: '#64748b' }}
							>
								Cancel
							</Button>
							<AppButton
								label={editSubmitting ? 'Saving Changes...' : 'Save Category & Services'}
								disabled={editSubmitting}
								onClick={handleSaveEditCategory}
								sx={{ bgcolor: '#0d9488', py: 1.1, px: 3, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#0f766e' } }}
							/>
						</Stack>
					</Stack>
				)}
			</AppModal>

			{/* ── Delete Confirm Modal ── */}
			<ConfirmModal
				open={!!deleteTarget}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleConfirmDelete}
				variant="delete"
				title={`Delete "${deleteTarget?.label ?? ''}"?`}
				description="This permanently removes the category from the master catalog. Categories with services still assigned to them cannot be deleted -- remove or reassign those services first."
				confirmLabel="Delete"
				loading={deleting}
			/>
		</Box>
	)
}
