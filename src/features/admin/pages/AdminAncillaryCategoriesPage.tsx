// src/features/admin/pages/AdminAncillaryCategoriesPage.tsx
// The ancillary (home-care) catalogue: specialty -> category -> service. The catalogue is the page; adding a category
// is a short dialog, and a service is edited one at a time in a side drawer (with its picture, uploaded to S3).
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
	Alert,
	Avatar,
	Box,
	Chip,
	Collapse,
	Grid,
	IconButton,
	InputAdornment,
	Paper,
	Skeleton,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { toast } from 'react-toastify'

import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppButton from '../../../components/common/Button/AppButton'
import AppModal from '../../../components/common/Modal/AppModal'
import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import ContentImageField from '../../../components/admin/ContentImageField'
import PaginationBar from '../../../pagination/Pagination'
import {
	AdminAncillaryCategoryItem,
	AdminAncillaryProcedureItem,
	AncillaryProcedureFormPayload,
	AncillarySpecialtyOption,
	addAdminAncillaryProcedure,
	createAdminAncillaryCategory,
	createAdminAncillarySpecialty,
	deleteAdminAncillaryCategory,
	deleteAdminAncillaryProcedure,
	listAdminAncillaryCategories,
	listAncillarySpecialtyOptions,
	updateAdminAncillaryCategory,
	updateAdminAncillaryProcedure,
} from '../adminService'

const NEW_SPECIALTY = '__new__'
const TEAL = '#0d9488'

const money = (n: number | null | undefined) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`

// ── a service's picture, with the first letter when it has none or it cannot be loaded ──
function ServiceThumb({ src, label, size = 44 }: { src?: string | null; label: string; size?: number }) {
	return (
		<Avatar
			variant="rounded"
			src={src || undefined}
			alt={label}
			sx={{
				width: size,
				height: size,
				bgcolor: 'rgba(13,148,136,0.1)',
				color: TEAL,
				fontWeight: 800,
				fontSize: size * 0.4,
				borderRadius: '10px',
			}}
		>
			{(label || '?').substring(0, 1).toUpperCase()}
		</Avatar>
	)
}

// ── a price that is edited in place: click, type, Enter (or leave the box) to save, Esc to cancel ──
function InlinePrice({
	value,
	onSave,
	color = '#0f172a',
	label,
}: {
	value: number
	onSave: (next: number) => Promise<void>
	color?: string
	label: string
}) {
	const [editing, setEditing] = useState(false)
	const [draft, setDraft] = useState('')
	const [saving, setSaving] = useState(false)

	const open = () => {
		setDraft(String(value ?? 0))
		setEditing(true)
	}

	const commit = async () => {
		if (saving) return
		const next = Number(draft)
		if (draft.trim() === '' || Number.isNaN(next) || next < 0) {
			toast.warning(`Enter a valid ${label.toLowerCase()}.`)
			setEditing(false)
			return
		}
		if (next === Number(value)) {
			setEditing(false)
			return
		}
		setSaving(true)
		try {
			await onSave(next)
		} finally {
			setSaving(false)
			setEditing(false)
		}
	}

	if (editing) {
		return (
			<AppInput
				autoFocus
				size="small"
				type="number"
				value={draft}
				disabled={saving}
				onChange={(e) => setDraft(e.target.value)}
				onBlur={commit}
				onKeyDown={(e: React.KeyboardEvent) => {
					if (e.key === 'Enter') commit()
					if (e.key === 'Escape') setEditing(false)
				}}
				sx={{ width: 110 }}
				InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
			/>
		)
	}
	return (
		<Tooltip title={`Click to change the ${label.toLowerCase()}`}>
			<Box
				onClick={open}
				sx={{
					display: 'inline-block',
					px: 1,
					py: 0.25,
					borderRadius: 1,
					cursor: 'pointer',
					fontWeight: 700,
					color,
					'&:hover': { bgcolor: 'rgba(13,148,136,0.08)' },
				}}
			>
				{money(value)}
			</Box>
		</Tooltip>
	)
}

interface ServiceForm {
	label: string
	price: string
	providerPrice: string
	about: string
	included: string
	imageUrl: string
}

const EMPTY_SERVICE: ServiceForm = { label: '', price: '', providerPrice: '', about: '', included: '', imageUrl: '' }

const splitIncluded = (text: string) =>
	text
		.split(/[\n,;]+/)
		.map((t) => t.trim())
		.filter(Boolean)

export default function AdminAncillaryCategoriesPage() {
	const [categories, setCategories] = useState<AdminAncillaryCategoryItem[]>([])
	const [specialties, setSpecialties] = useState<AncillarySpecialtyOption[]>([])
	const [loading, setLoading] = useState(true)
	const [listError, setListError] = useState<string | null>(null)

	// filters + list
	const [search, setSearch] = useState('')
	const [specialtyFilter, setSpecialtyFilter] = useState('')
	const [expanded, setExpanded] = useState<Set<string>>(new Set())
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)

	// category dialog (add / rename / move)
	const [catDialog, setCatDialog] = useState<{ category: AdminAncillaryCategoryItem | null } | null>(null)
	const [catName, setCatName] = useState('')
	const [catSpecialty, setCatSpecialty] = useState('')
	const [catNewSpecialty, setCatNewSpecialty] = useState('')
	const [catSaving, setCatSaving] = useState(false)

	// service drawer (add / edit one service)
	const [svcDrawer, setSvcDrawer] = useState<{
		category: AdminAncillaryCategoryItem
		procedure: AdminAncillaryProcedureItem | null
	} | null>(null)
	const [svc, setSvc] = useState<ServiceForm>(EMPTY_SERVICE)
	const [svcSaving, setSvcSaving] = useState(false)

	// deletes
	const [deleteCategory, setDeleteCategory] = useState<AdminAncillaryCategoryItem | null>(null)
	const [deleteService, setDeleteService] = useState<AdminAncillaryProcedureItem | null>(null)
	const [deleting, setDeleting] = useState(false)

	// ── data ──────────────────────────────────────────────────────────────────
	const loadSpecialties = useCallback(async () => {
		try {
			const res = await listAncillarySpecialtyOptions()
			if (res.success) setSpecialties(res.data || [])
		} catch (err) {
			console.warn('Failed to load ancillary specialties:', err)
		}
	}, [])

	const loadCategories = useCallback(async (silent = false) => {
		if (!silent) setLoading(true)
		setListError(null)
		try {
			const res = await listAdminAncillaryCategories()
			if (res.success) setCategories(res.data || [])
		} catch (err) {
			console.error('Failed to load ancillary categories:', err)
			setListError('Could not load the catalogue. Try again.')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadSpecialties()
		loadCategories()
	}, [loadSpecialties, loadCategories])

	const specialtyKey = (s: AncillarySpecialtyOption) => s.specialtyId || s.id
	const sameSpecialty = useCallback(
		(categorySpecialtyId: string | null | undefined, selected: string) => {
			if (!categorySpecialtyId || !selected) return false
			if (categorySpecialtyId === selected) return true
			const opt = specialties.find((s) => s.specialtyId === selected || s.id === selected)
			return !!opt && (opt.specialtyId === categorySpecialtyId || opt.id === categorySpecialtyId)
		},
		[specialties]
	)

	// ── list: filter, search, page ──────────────────────────────────────────────
	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase()
		return categories.filter((c) => {
			if (specialtyFilter && !sameSpecialty(c.specialty_id, specialtyFilter)) return false
			if (!q) return true
			return (
				c.label.toLowerCase().includes(q) ||
				(c.procedures || []).some((p) => p.label.toLowerCase().includes(q))
			)
		})
	}, [categories, search, specialtyFilter, sameSpecialty])

	const totalPages = Math.max(1, Math.ceil(filtered.length / Math.max(1, pageSize)))
	const safePage = Math.min(Math.max(1, page), totalPages)
	const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

	const countFor = (specialtyId: string) => categories.filter((c) => sameSpecialty(c.specialty_id, specialtyId)).length

	const toggle = (id: string) =>
		setExpanded((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})

	// ── category dialog ──────────────────────────────────────────────────────────
	const openAddCategory = () => {
		setCatDialog({ category: null })
		setCatName('')
		setCatSpecialty(specialtyFilter || '')
		setCatNewSpecialty('')
	}

	const openEditCategory = (category: AdminAncillaryCategoryItem) => {
		setCatDialog({ category })
		setCatName(category.label)
		const match = specialties.find((s) => s.specialtyId === category.specialty_id || s.id === category.specialty_id)
		setCatSpecialty(match ? specialtyKey(match) : category.specialty_id || '')
		setCatNewSpecialty('')
	}

	const saveCategory = async () => {
		if (!catDialog) return
		const name = catName.trim()
		if (!name) {
			toast.warning('Enter a category name.')
			return
		}
		if (!catSpecialty) {
			toast.warning('Choose a specialty.')
			return
		}
		if (catSpecialty === NEW_SPECIALTY && !catNewSpecialty.trim()) {
			toast.warning('Enter the new specialty name.')
			return
		}
		setCatSaving(true)
		try {
			let specialtyId = catSpecialty
			if (catSpecialty === NEW_SPECIALTY) {
				const created = await createAdminAncillarySpecialty({ label: catNewSpecialty.trim() })
				specialtyId = created.data?.specialtyId || created.data?.id || ''
				await loadSpecialties()
			}
			const editing = catDialog.category
			if (editing) {
				await updateAdminAncillaryCategory(editing.id, { label: name, specialty_id: specialtyId })
				toast.success('Category updated.')
			} else {
				const res = await createAdminAncillaryCategory({ label: name, specialty_id: specialtyId })
				toast.success(`Category "${name}" added. Add its services next.`)
				if (res.data?.id) setExpanded((prev) => new Set(prev).add(res.data.id))
			}
			setCatDialog(null)
			await loadCategories(true)
		} catch (err) {
			console.error('Failed to save category:', err) // the API wrapper already showed the message
		} finally {
			setCatSaving(false)
		}
	}

	// ── service drawer ──────────────────────────────────────────────────────────
	const openAddService = (category: AdminAncillaryCategoryItem) => {
		setSvcDrawer({ category, procedure: null })
		setSvc(EMPTY_SERVICE)
		setExpanded((prev) => new Set(prev).add(category.id))
	}

	const openEditService = (category: AdminAncillaryCategoryItem, procedure: AdminAncillaryProcedureItem) => {
		setSvcDrawer({ category, procedure })
		setSvc({
			label: procedure.label,
			price: String(procedure.price ?? 0),
			providerPrice: String(procedure.provider_price ?? procedure.price ?? 0),
			about: procedure.about_service || '',
			included: (procedure.whats_included || []).join('\n'),
			imageUrl: procedure.image_url || '',
		})
	}

	const setField = (field: keyof ServiceForm) => (value: string) => setSvc((prev) => ({ ...prev, [field]: value }))

	const saveService = async () => {
		if (!svcDrawer) return
		const label = svc.label.trim()
		if (!label) {
			toast.warning('Enter the service name.')
			return
		}
		const price = Number(svc.price)
		if (svc.price.trim() === '' || Number.isNaN(price) || price < 0) {
			toast.warning('Enter a valid customer price.')
			return
		}
		const providerPrice = Number(svc.providerPrice)
		if (svc.providerPrice.trim() !== '' && (Number.isNaN(providerPrice) || providerPrice < 0)) {
			toast.warning('Enter a valid provider price.')
			return
		}

		const { category, procedure } = svcDrawer
		const payload: AncillaryProcedureFormPayload = {
			label,
			price,
			about_service: svc.about.trim(),
			whats_included: splitIncluded(svc.included),
		}
		if (svc.providerPrice.trim() !== '') payload.provider_price = providerPrice
		// The picture is only sent when it changed ('' removes it): an older service may carry a value the
		// server would not accept as new input, and an unchanged picture needs no write.
		const original = procedure?.image_url || ''
		if (svc.imageUrl !== original) payload.image_url = svc.imageUrl

		setSvcSaving(true)
		try {
			if (procedure) {
				await updateAdminAncillaryProcedure(procedure.id, payload)
				toast.success(`"${label}" updated.`)
			} else {
				await addAdminAncillaryProcedure(category.id, payload)
				toast.success(`"${label}" added to ${category.label}.`)
			}
			setSvcDrawer(null)
			await loadCategories(true)
		} catch (err) {
			console.error('Failed to save service:', err)
		} finally {
			setSvcSaving(false)
		}
	}

	const savePrice = (procedure: AdminAncillaryProcedureItem, field: 'price' | 'provider_price') => async (next: number) => {
		try {
			await updateAdminAncillaryProcedure(procedure.id, { [field]: next })
			toast.success(`${procedure.label}: ${field === 'price' ? 'customer' : 'provider'} price saved.`)
			await loadCategories(true)
		} catch (err) {
			console.error('Failed to save price:', err)
		}
	}

	// ── deletes ───────────────────────────────────────────────────────────────────
	const confirmDelete = async () => {
		setDeleting(true)
		try {
			if (deleteCategory) {
				await deleteAdminAncillaryCategory(deleteCategory.id)
				toast.success(`Category "${deleteCategory.label}" deleted.`)
				setDeleteCategory(null)
			} else if (deleteService) {
				await deleteAdminAncillaryProcedure(deleteService.id)
				toast.success(`Service "${deleteService.label}" deleted.`)
				setDeleteService(null)
			}
			await loadCategories(true)
		} catch (err) {
			console.error('Failed to delete:', err)
		} finally {
			setDeleting(false)
		}
	}

	const specialtyOptions = specialties.map((s) => ({ value: specialtyKey(s), label: s.label }))
	const dialogSpecialtyOptions = [...specialtyOptions, { value: NEW_SPECIALTY, label: '+ Add a new specialty…' }]

	// ── render ────────────────────────────────────────────────────────────────────
	return (
		<Box sx={{ pb: 6 }}>
			<AdminPageHeader
				title="Ancillary Categories"
				subtitle="The home-care catalogue: categories under each specialty, and the services (with prices and pictures) inside them."
				count={categories.length}
				countLabel="categories"
				actions={
					<AppButton
						startIcon={<AddIcon />}
						label="Add category"
						onClick={openAddCategory}
						sx={{ bgcolor: TEAL, fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }}
					/>
				}
			/>

			{/* ── find what you need ── */}
			<Stack spacing={1.5} sx={{ mb: 2.5 }}>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
					<AppInput
						size="small"
						placeholder="Search a category or a service"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						enableVoiceSearch
						onVoiceResult={(text) => {
							setSearch(text)
							setPage(1)
						}}
						sx={{ flex: 1, maxWidth: 420 }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon fontSize="small" />
								</InputAdornment>
							),
						}}
					/>
					<Box sx={{ flex: 1 }} />
					<AppButton
						variant="text"
						size="small"
						onClick={() =>
							setExpanded(expanded.size >= filtered.length ? new Set() : new Set(filtered.map((c) => c.id)))
						}
						label={expanded.size >= filtered.length && filtered.length > 0 ? 'Collapse all' : 'Expand all'}
						sx={{ color: TEAL, fontWeight: 600 }}
					/>
					<Tooltip title="Refresh">
						<span>
							<IconButton size="small" disabled={loading} onClick={() => loadCategories()} sx={{ color: '#64748b' }}>
								<RefreshIcon fontSize="small" />
							</IconButton>
						</span>
					</Tooltip>
				</Stack>
				<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
					<Chip
						clickable
						label={`All (${categories.length})`}
						onClick={() => {
							setSpecialtyFilter('')
							setPage(1)
						}}
						sx={{
							fontWeight: 700,
							bgcolor: specialtyFilter === '' ? TEAL : '#f1f5f9',
							color: specialtyFilter === '' ? '#fff' : '#475569',
							'&:hover': { bgcolor: specialtyFilter === '' ? '#0f766e' : '#e2e8f0' },
						}}
					/>
					{specialties.map((s) => {
						const key = specialtyKey(s)
						const active = specialtyFilter === key
						return (
							<Chip
								key={key}
								clickable
								label={`${s.label} (${countFor(key)})`}
								onClick={() => {
									setSpecialtyFilter(active ? '' : key)
									setPage(1)
								}}
								sx={{
									fontWeight: 600,
									bgcolor: active ? TEAL : '#f1f5f9',
									color: active ? '#fff' : '#475569',
									'&:hover': { bgcolor: active ? '#0f766e' : '#e2e8f0' },
								}}
							/>
						)
					})}
				</Stack>
			</Stack>

			{listError && (
				<Alert
					severity="error"
					sx={{ mb: 2, borderRadius: 2 }}
					action={<AppButton variant="text" size="small" label="Retry" onClick={() => loadCategories()} />}
				>
					{listError}
				</Alert>
			)}

			{/* ── the catalogue ── */}
			{loading ? (
				<Stack spacing={1.5}>
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} variant="rounded" height={76} sx={{ borderRadius: '14px' }} />
					))}
				</Stack>
			) : visible.length === 0 ? (
				<Paper variant="outlined" sx={{ borderRadius: '14px', borderColor: 'divider' }}>
					<AdminEmptyState
						icon={<AccountTreeIcon sx={{ fontSize: 40, color: '#94a3b8' }} />}
						title={categories.length === 0 ? 'No categories yet' : 'Nothing matches'}
						description={
							categories.length === 0
								? 'Add your first category, then the services inside it.'
								: 'Try another search or specialty.'
						}
						action={
							categories.length === 0 ? (
								<AppButton startIcon={<AddIcon />} label="Add category" onClick={openAddCategory} />
							) : undefined
						}
					/>
				</Paper>
			) : (
				<Stack spacing={1.5}>
					{visible.map((category) => {
						const open = expanded.has(category.id)
						const procs = category.procedures || []
						const cover = procs.find((p) => p.image_url)?.image_url
						return (
							<Paper
								key={category.id}
								elevation={0}
								sx={{
									borderRadius: '14px',
									border: '1px solid',
									borderColor: open ? 'rgba(13,148,136,0.4)' : 'divider',
									overflow: 'hidden',
								}}
							>
								{/* category header */}
								<Stack
									direction="row"
									alignItems="center"
									spacing={1.5}
									sx={{ px: 2, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#fafcfc' } }}
									onClick={() => toggle(category.id)}
								>
									<ServiceThumb src={cover} label={category.label} size={48} />
									<Box sx={{ minWidth: 0, flex: 1 }}>
										<Typography variant="subtitle1" fontWeight={800} color="#0f172a" noWrap>
											{category.label}
										</Typography>
										<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
											{category.specialty_label && (
												<Chip
													size="small"
													label={category.specialty_label}
													sx={{ height: 22, fontSize: '0.72rem', bgcolor: '#f1f5f9', color: '#475569' }}
												/>
											)}
											<Typography variant="caption" color="text.secondary">
												{procs.length} service{procs.length === 1 ? '' : 's'}
											</Typography>
										</Stack>
									</Box>
									<Stack direction="row" spacing={0.5} alignItems="center" onClick={(e) => e.stopPropagation()}>
										<Tooltip title="Add service">
											<IconButton
												size="small"
												onClick={() => openAddService(category)}
												sx={{ color: TEAL, '&:hover': { bgcolor: 'rgba(13,148,136,0.08)' } }}
											>
												<AddIcon fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip title="Rename or move to another specialty">
											<IconButton size="small" onClick={() => openEditCategory(category)}>
												<EditIcon fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete category">
											<IconButton
												size="small"
												onClick={() => setDeleteCategory(category)}
												sx={{ '&:hover': { color: '#ef4444' } }}
											>
												<DeleteOutlineIcon fontSize="small" />
											</IconButton>
										</Tooltip>
										<IconButton size="small" onClick={() => toggle(category.id)}>
											{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
										</IconButton>
									</Stack>
								</Stack>

								{/* its services */}
								<Collapse in={open} timeout="auto" unmountOnExit>
									<Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fcfdfd' }}>
										{procs.length === 0 ? (
											<Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
												<Typography variant="body2" color="text.secondary">
													No services in this category yet.
												</Typography>
												<AppButton
													size="small"
													startIcon={<AddIcon fontSize="small" />}
													label="Add the first service"
													onClick={() => openAddService(category)}
													sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#0f766e' } }}
												/>
											</Stack>
										) : (
											<>
												<Grid
													container
													sx={{
														px: 2,
														py: 0.75,
														color: '#64748b',
														fontSize: '0.7rem',
														fontWeight: 800,
														letterSpacing: '0.06em',
														textTransform: 'uppercase',
														display: { xs: 'none', md: 'flex' },
													}}
												>
													<Grid size={{ md: 6 }}>Service</Grid>
													<Grid size={{ md: 2 }}>Customer price</Grid>
													<Grid size={{ md: 2 }}>Provider price</Grid>
													<Grid size={{ md: 2 }} sx={{ textAlign: 'right' }}>
														Actions
													</Grid>
												</Grid>
												{procs.map((p) => (
													<Grid
														container
														key={p.id}
														alignItems="center"
														rowSpacing={1}
														sx={{ px: 2, py: 1.25, borderTop: '1px solid #eef2f6' }}
													>
														<Grid size={{ xs: 12, md: 6 }}>
															<Stack direction="row" spacing={1.5} alignItems="center">
																<ServiceThumb src={p.image_url} label={p.label} />
																<Box sx={{ minWidth: 0 }}>
																	<Typography variant="body2" fontWeight={700} color="#0f172a">
																		{p.label}
																	</Typography>
																	{p.about_service && (
																		<Typography
																			variant="caption"
																			color="text.secondary"
																			sx={{
																				display: '-webkit-box',
																				WebkitLineClamp: 1,
																				WebkitBoxOrient: 'vertical',
																				overflow: 'hidden',
																			}}
																		>
																			{p.about_service}
																		</Typography>
																	)}
																</Box>
															</Stack>
														</Grid>
														<Grid size={{ xs: 6, md: 2 }}>
															<InlinePrice
																label="Customer price"
																value={p.price}
																color={TEAL}
																onSave={savePrice(p, 'price')}
															/>
														</Grid>
														<Grid size={{ xs: 6, md: 2 }}>
															<InlinePrice
																label="Provider price"
																value={p.provider_price}
																color="#475569"
																onSave={savePrice(p, 'provider_price')}
															/>
														</Grid>
														<Grid size={{ xs: 12, md: 2 }}>
															<Stack direction="row" spacing={0.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
																<Tooltip title="Edit details and picture">
																	<IconButton size="small" onClick={() => openEditService(category, p)}>
																		<EditIcon fontSize="small" />
																	</IconButton>
																</Tooltip>
																<Tooltip title="Delete service">
																	<IconButton
																		size="small"
																		onClick={() => setDeleteService(p)}
																		sx={{ '&:hover': { color: '#ef4444' } }}
																	>
																		<DeleteOutlineIcon fontSize="small" />
																	</IconButton>
																</Tooltip>
															</Stack>
														</Grid>
													</Grid>
												))}
											</>
										)}
									</Box>
								</Collapse>
							</Paper>
						)
					})}

					<Paper variant="outlined" sx={{ borderRadius: '14px', borderColor: 'divider' }}>
						<PaginationBar
							page={safePage}
							pageSize={pageSize}
							totalRows={filtered.length}
							pageSizeOptions={[5, 10, 20, 50]}
							onPageChange={setPage}
							onPageSizeChange={(s) => {
								setPageSize(s)
								setPage(1)
							}}
						/>
					</Paper>
				</Stack>
			)}

			{/* ── add / rename a category ── */}
			<AppModal
				open={!!catDialog}
				onClose={() => !catSaving && setCatDialog(null)}
				title={catDialog?.category ? 'Edit category' : 'Add category'}
				actions={
					<>
						<AppButton variant="text" label="Cancel" disabled={catSaving} onClick={() => setCatDialog(null)} sx={{ color: '#64748b' }} />
						<AppButton
							label={catDialog?.category ? 'Save changes' : 'Add category'}
							loading={catSaving}
							onClick={saveCategory}
							sx={{ bgcolor: TEAL, fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }}
						/>
					</>
				}
			>
				<Stack spacing={2.5} sx={{ pt: 1 }}>
					<AppSelect
						label="Specialty"
						placeholder="Choose a specialty"
						value={catSpecialty}
						onChange={(e) => setCatSpecialty(e.target.value as string)}
						options={dialogSpecialtyOptions}
						fullWidth
					/>
					{catSpecialty === NEW_SPECIALTY && (
						<AppInput
							label="New specialty name"
							placeholder="e.g. Elder Care"
							value={catNewSpecialty}
							onChange={(e) => setCatNewSpecialty(e.target.value)}
							fullWidth
							autoFocus
						/>
					)}
					<AppInput
						label="Category name"
						placeholder="e.g. ICU Care at Home"
						value={catName}
						onChange={(e) => setCatName(e.target.value)}
						fullWidth
					/>
				</Stack>
			</AppModal>

			{/* ── add / edit one service ── */}
			<AppDrawer
				open={!!svcDrawer}
				onClose={() => !svcSaving && setSvcDrawer(null)}
				title={svcDrawer?.procedure ? 'Edit service' : 'Add service'}
				subtitle={svcDrawer ? `in ${svcDrawer.category.label}` : undefined}
				confirmLabel={svcDrawer?.procedure ? 'Save changes' : 'Add service'}
				confirmLoading={svcSaving}
				onConfirm={saveService}
				width={480}
			>
				<Stack spacing={2.5}>
					<ContentImageField
						label="Service picture"
						kind="services"
						value={svc.imageUrl}
						onChange={setField('imageUrl')}
						previewHeight={170}
						disabled={svcSaving}
						hint="Shown to patients when they browse home-care services. JPEG, PNG or WebP, up to 5 MB."
					/>
					<AppInput
						label="Service name"
						placeholder="e.g. ICU Care at Home"
						value={svc.label}
						onChange={(e) => setField('label')(e.target.value)}
						fullWidth
					/>
					<Stack direction="row" spacing={2}>
						<AppInput
							label="Customer price"
							type="number"
							placeholder="1299"
							value={svc.price}
							onChange={(e) => setField('price')(e.target.value)}
							fullWidth
							InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
						/>
						<AppInput
							label="Provider price"
							type="number"
							placeholder="Same as customer"
							value={svc.providerPrice}
							onChange={(e) => setField('providerPrice')(e.target.value)}
							fullWidth
							InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
						/>
					</Stack>
					<AppInput
						label="About this service"
						placeholder="A short description patients will read"
						value={svc.about}
						onChange={(e) => setField('about')(e.target.value)}
						multiline
						minRows={3}
						fullWidth
					/>
					<AppInput
						label="What's included"
						placeholder={'One item per line\nQualified professional\nProgress notes'}
						value={svc.included}
						onChange={(e) => setField('included')(e.target.value)}
						multiline
						minRows={4}
						fullWidth
						helperText="One item per line (commas also work)."
					/>
				</Stack>
			</AppDrawer>

			{/* ── delete a category or a service ── */}
			<ConfirmModal
				open={!!deleteCategory || !!deleteService}
				onClose={() => {
					setDeleteCategory(null)
					setDeleteService(null)
				}}
				onConfirm={confirmDelete}
				variant="delete"
				title={deleteCategory ? `Delete "${deleteCategory.label}"?` : `Delete "${deleteService?.label ?? ''}"?`}
				description={
					deleteCategory
						? 'This removes the category from the catalogue. A category that still has services cannot be deleted: remove or move those first.'
						: 'This removes the service and its uploaded picture. A service that was already booked cannot be deleted.'
				}
				confirmLabel="Delete"
				loading={deleting}
			/>
		</Box>
	)
}
