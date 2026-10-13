// src/features/doctor/profile/components/DoctorAchievementsTab.tsx
import { useCallback, useEffect, useMemo, useRef, useState, ReactNode, DragEvent, ChangeEvent } from 'react'
import { Box, Typography, ButtonBase, IconButton, Grid, Divider } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

import AppButton from '../../../../components/common/Button/AppButton'
import AppInput from '../../../../components/common/Input/AppInput'
import AppDatePicker from '../../../../components/common/DatePicker/AppDatePicker'
import AppSwitch from '../../../../components/common/Switch/AppSwitch'
import AppSkeleton from '../../../../components/common/Skeleton/AppSkeleton'
import { customCardStyle } from '../../../../styles/commonStyles'
import { DoctorAchievementItem, DoctorAchievementType } from '../../../../types/doctor-profile'
import { getAchievements, createAchievement, updateAchievement, AchievementPayload } from '../../doctorService'

// ── Category metadata ──────────────────────────────────────────────────────────

interface CategoryMeta {
	value: DoctorAchievementType
	label: string
	icon: ReactNode
	color: string
}

const CATEGORIES: CategoryMeta[] = [
	{ value: 'Award', label: 'Award', icon: <EmojiEventsOutlinedIcon fontSize="small" />, color: '#2B6F71' },
	{ value: 'Research', label: 'Research', icon: <ScienceOutlinedIcon fontSize="small" />, color: '#E4572E' },
	{ value: 'Publication', label: 'Publication', icon: <ArticleOutlinedIcon fontSize="small" />, color: '#7C3AED' },
	{ value: 'Conference', label: 'Conference', icon: <GroupsOutlinedIcon fontSize="small" />, color: '#0EA5E9' },
	{
		value: 'Certification',
		label: 'Certification',
		icon: <WorkspacePremiumOutlinedIcon fontSize="small" />,
		color: '#2563EB',
	},
	{ value: 'Recognition', label: 'Recognition', icon: <MilitaryTechOutlinedIcon fontSize="small" />, color: '#D97706' },
]

const getCategoryMeta = (type: string): CategoryMeta =>
	CATEGORIES.find((c) => c.value === type) ?? CATEGORIES[0]

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

// ── Form state ──────────────────────────────────────────────────────────────────

interface AchievementFormState {
	title: string
	achievement_type: DoctorAchievementType | ''
	achievement_date: string | null
	organization: string
	description: string
	is_public: boolean
	documentFile: File | null
	documentName: string | null
}

const EMPTY_FORM: AchievementFormState = {
	title: '',
	achievement_type: '',
	achievement_date: null,
	organization: '',
	description: '',
	is_public: true,
	documentFile: null,
	documentName: null,
}

interface FormErrors {
	title?: string
	achievement_type?: string
	document?: string
}

const formatDateBadge = (value?: string | null): string | null => {
	if (!value) return null
	const parsed = dayjs(value, 'YYYY-MM-DD')
	return parsed.isValid() ? parsed.format('MMMM YYYY') : null
}

// ── Info cards (empty state) ────────────────────────────────────────────────────

const INFO_CARDS = [
	{
		icon: <EmojiEventsOutlinedIcon fontSize="small" />,
		color: '#6D5BD0',
		title: 'Awards & Recognition',
		description: 'Honors from hospitals, medical associations, or community leadership recognitions.',
	},
	{
		icon: <WorkspacePremiumOutlinedIcon fontSize="small" />,
		color: '#2B6F71',
		title: 'Certifications',
		description: 'Board certifications, specialized training, and active medical licenses or fellowships.',
	},
	{
		icon: <ArticleOutlinedIcon fontSize="small" />,
		color: '#C4703A',
		title: 'Research & Publications',
		description: 'Published papers, medical journals, clinical trials, or keynote presentations.',
	},
]

// ── Section card heading helper ─────────────────────────────────────────────────

function SectionCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
	return (
		<Box sx={{ ...customCardStyle, borderRadius: '12px', border: '1px solid #E2E8F0', p: 2.5 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: 28,
						height: 28,
						borderRadius: '6px',
						bgcolor: 'rgba(43, 111, 113, 0.08)',
						color: '#2B6F71',
					}}
				>
					{icon}
				</Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A4345' }}>
					{title}
				</Typography>
			</Box>
			{children}
		</Box>
	)
}

export default function DoctorAchievementsTab() {
	const [achievements, setAchievements] = useState<DoctorAchievementItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// ── Inline form state (mirrors DoctorHospitalsTab pattern) ──────────────────
	const [showForm, setShowForm] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [form, setForm] = useState<AchievementFormState>(EMPTY_FORM)
	const [formErrors, setFormErrors] = useState<FormErrors>({})
	const [saving, setSaving] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const fetchAchievements = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await getAchievements()
			if (res.success) {
				setAchievements(res.data ?? [])
			} else {
				setError(res.message || 'Failed to load achievements')
			}
		} catch {
			setError('Failed to load achievements')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchAchievements()
	}, [fetchAchievements])

	const sortedAchievements = useMemo(
		() =>
			[...achievements].sort((a, b) => {
				const da = a.achievement_date ? dayjs(a.achievement_date).valueOf() : 0
				const db = b.achievement_date ? dayjs(b.achievement_date).valueOf() : 0
				return db - da
			}),
		[achievements]
	)

	// ── Form helpers ─────────────────────────────────────────────────────────────

	const resetForm = () => {
		setEditingId(null)
		setForm(EMPTY_FORM)
		setFormErrors({})
	}

	const openAdd = () => {
		resetForm()
		setShowForm(true)
	}

	const openEdit = (item: DoctorAchievementItem) => {
		setEditingId(item.id)
		setForm({
			title: item.title,
			achievement_type: item.achievement_type,
			achievement_date: item.achievement_date ?? null,
			organization: item.organization ?? '',
			description: item.description ?? '',
			is_public: item.is_public,
			documentFile: null,
			documentName: item.document_s3_key ? item.document_s3_key.split('/').pop() ?? 'Document' : null,
		})
		setFormErrors({})
		setShowForm(true)
	}

	// ── File handling ────────────────────────────────────────────────────────────

	const applyFile = (file: File | null) => {
		if (!file) return
		if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
			setFormErrors((prev) => ({ ...prev, document: 'Only PDF, JPG, or PNG files are supported' }))
			return
		}
		if (file.size > MAX_FILE_SIZE_BYTES) {
			setFormErrors((prev) => ({ ...prev, document: 'File size must be 5MB or less' }))
			return
		}
		setFormErrors((prev) => ({ ...prev, document: undefined }))
		setForm((prev) => ({ ...prev, documentFile: file, documentName: file.name }))
	}

	const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null
		applyFile(file)
		e.target.value = ''
	}

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
		const file = e.dataTransfer.files?.[0] ?? null
		applyFile(file)
	}

	const handleRemoveFile = () => {
		setForm((prev) => ({ ...prev, documentFile: null, documentName: null }))
		setFormErrors((prev) => ({ ...prev, document: undefined }))
	}

	// ── Validation & save ────────────────────────────────────────────────────────

	const validate = (): boolean => {
		const errors: FormErrors = {}
		if (!form.title.trim()) errors.title = 'Achievement title is required'
		if (!form.achievement_type) errors.achievement_type = 'Please select a category'
		setFormErrors((prev) => ({ ...prev, ...errors }))
		return !errors.title && !errors.achievement_type
	}

	const handleSave = async () => {
		if (!validate()) return
		setSaving(true)
		try {
			const payload: AchievementPayload = {
				title: form.title.trim(),
				achievement_type: form.achievement_type as DoctorAchievementType,
				organization: form.organization.trim() || null,
				achievement_date: form.achievement_date || null,
				description: form.description.trim() || null,
				is_public: form.is_public,
			}

			if (editingId) {
				const res = await updateAchievement(editingId, payload, form.documentFile)
				toast.success(res.message || 'Achievement updated successfully')
			} else {
				const res = await createAchievement(payload, form.documentFile)
				toast.success(res.message || 'Achievement added successfully')
			}

			resetForm()
			setShowForm(false)
			await fetchAchievements()
		} catch {
			// Global API interceptor already surfaces a toast for the failure.
		} finally {
			setSaving(false)
		}
	}

	// ── Loading / error guards ───────────────────────────────────────────────────

	if (loading) {
		return (
			<Box sx={{ ...customCardStyle, p: 3 }}>
				<AppSkeleton height={28} width={240} sx={{ mb: 2 }} />
				{[1, 2, 3].map((i) => (
					<AppSkeleton key={i} height={80} sx={{ mb: 1.5 }} />
				))}
			</Box>
		)
	}

	if (error) {
		return (
			<Box sx={{ ...customCardStyle, p: 4, textAlign: 'center' }}>
				<Typography sx={{ color: 'error.main', mb: 2 }}>{error}</Typography>
				<AppButton label="Retry" variant="outlined" onClick={fetchAchievements} />
			</Box>
		)
	}

	// ── Inline form view (mirrors DoctorHospitalsTab showForm block) ─────────────

	if (showForm) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				{/* Header Back Bar */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Box
						onClick={() => {
							setShowForm(false)
							resetForm()
						}}
						sx={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 0.8,
							cursor: 'pointer',
							color: 'text.secondary',
							transition: 'color 0.2s',
							'&:hover': { color: '#2B6F71' },
						}}
					>
						<ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
						<Typography variant="caption" sx={{ fontWeight: 700 }}>
							Back to achievements
						</Typography>
					</Box>
					<Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px' }}>
						* required fields
					</Typography>
				</Box>

				{/* Page title */}
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.2, fontSize: '18px' }}>
						{editingId ? 'Edit Achievement Details' : 'Add New Achievement'}
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
						Highlight your awards, certifications, research, and publications to build trust with patients and peers.
					</Typography>
				</Box>

				{/* Section 1 — Title, Category & Date */}
				<SectionCard icon={<TextFieldsOutlinedIcon sx={{ fontSize: 16 }} />} title="Achievement Info">
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						{/* Title */}
						<AppInput
							label="Achievement Title *"
							placeholder="e.g. Outstanding Contribution to Cardiology 2024"
							value={form.title}
							onChange={(e) => {
								setForm((prev) => ({ ...prev, title: e.target.value }))
								if (formErrors.title) setFormErrors((prev) => ({ ...prev, title: undefined }))
							}}
							error={Boolean(formErrors.title)}
							helperText={formErrors.title}
							size="small"
						/>

						{/* Category + Date */}
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 7 }}>
								<Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
									Achievement Category *
								</Typography>
								<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
									{CATEGORIES.map((cat) => {
										const selected = form.achievement_type === cat.value
										return (
											<ButtonBase
												key={cat.value}
												onClick={() => {
													setForm((prev) => ({ ...prev, achievement_type: cat.value }))
													if (formErrors.achievement_type)
														setFormErrors((prev) => ({ ...prev, achievement_type: undefined }))
												}}
												sx={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													gap: 0.5,
													py: 1,
													borderRadius: '8px',
													border: '1px solid',
													borderColor: selected ? cat.color : 'divider',
													bgcolor: selected ? `${cat.color}14` : 'background.paper',
													color: selected ? cat.color : 'text.secondary',
													transition: 'all 0.15s ease',
												}}
											>
												{cat.icon}
												<Typography sx={{ fontSize: '0.68rem', fontWeight: 600 }}>{cat.label}</Typography>
											</ButtonBase>
										)
									})}
								</Box>
								{formErrors.achievement_type && (
									<Typography sx={{ fontSize: '0.72rem', color: 'error.main', mt: 0.5 }}>
										{formErrors.achievement_type}
									</Typography>
								)}
							</Grid>
							<Grid size={{ xs: 12, sm: 5 }}>
								<AppDatePicker
									label="Date Awarded"
									value={form.achievement_date}
									onChange={(val) => setForm((prev) => ({ ...prev, achievement_date: val }))}
									format="YYYY-MM-DD"
									placeholder="mm/dd/yyyy"
									disableFuture
								/>
							</Grid>
						</Grid>
					</Box>
				</SectionCard>

				{/* Section 2 — Organization & Description */}
				<SectionCard
					icon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}
					title="Organization & Description"
				>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						<AppInput
							label="Issuing Organization / Hospital"
							placeholder="e.g. Royal College of Surgeons"
							value={form.organization}
							onChange={(e) => setForm((prev) => ({ ...prev, organization: e.target.value }))}
							size="small"
						/>
						<AppInput
							label="Description"
							placeholder="Describe the significance of this achievement..."
							value={form.description}
							onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
							multiline
							rows={4}
							size="small"
						/>
					</Box>
				</SectionCard>

				{/* Section 3 — Document Upload */}
				<SectionCard
					icon={<CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />}
					title="Verification Document / Photo"
				>
					<input
						ref={fileInputRef}
						type="file"
						hidden
						accept=".pdf,.jpg,.jpeg,.png"
						onChange={handleFileInputChange}
					/>

					{form.documentName ? (
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1.5,
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: '10px',
								p: 1.5,
								bgcolor: 'action.hover',
							}}
						>
							<InsertDriveFileOutlinedIcon sx={{ color: 'primary.main' }} />
							<Typography sx={{ fontSize: '0.82rem', flex: 1, wordBreak: 'break-all' }}>
								{form.documentName}
							</Typography>
							<IconButton size="small" onClick={handleRemoveFile}>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Box>
					) : (
						<Box
							onClick={() => fileInputRef.current?.click()}
							onDragOver={(e) => {
								e.preventDefault()
								setIsDragging(true)
							}}
							onDragLeave={() => setIsDragging(false)}
							onDrop={handleDrop}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 0.5,
								border: '1.5px dashed',
								borderColor: isDragging ? 'primary.main' : 'divider',
								borderRadius: '10px',
								py: 3.5,
								px: 2,
								cursor: 'pointer',
								bgcolor: isDragging ? 'rgba(43,111,113,0.06)' : 'action.hover',
								transition: 'all 0.15s ease',
							}}
						>
							<CloudUploadOutlinedIcon sx={{ color: 'primary.main', fontSize: 28, mb: 0.5 }} />
							<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'text.primary' }}>
								Click to upload or drag and drop
							</Typography>
							<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
								PDF, JPG, or PNG (Max 5MB)
							</Typography>
						</Box>
					)}
					{formErrors.document && (
						<Typography sx={{ fontSize: '0.72rem', color: 'error.main', mt: 0.5 }}>
							{formErrors.document}
						</Typography>
					)}
					<Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', mt: 0.75 }}>
						Document upload is coming soon — the rest of this achievement will be saved now.
					</Typography>
				</SectionCard>

				{/* Section 4 — Visibility */}
				<SectionCard icon={<LockOpenOutlinedIcon sx={{ fontSize: 16 }} />} title="Profile Visibility">
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							border: '1px solid',
							borderColor: form.is_public ? 'rgba(43, 111, 113, 0.2)' : 'divider',
							bgcolor: form.is_public ? 'rgba(43, 111, 113, 0.02)' : 'transparent',
							borderRadius: '10px',
							p: 1.5,
							transition: 'all 0.2s',
						}}
					>
						<Box>
							<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>
								Show on public profile
							</Typography>
							<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
								Visible to patients and potential recruits
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<AppSwitch
								checked={form.is_public}
								onChange={(e) => setForm((prev) => ({ ...prev, is_public: e.target.checked }))}
							/>
							<Typography
								variant="caption"
								sx={{
									fontWeight: 700,
									color: form.is_public ? '#2B6F71' : '#64748B',
									fontSize: '11px',
									minWidth: 42,
								}}
							>
								{form.is_public ? 'Public' : 'Private'}
							</Typography>
						</Box>
					</Box>
				</SectionCard>

				{/* Inline Save / Cancel — mirrors Hospitals pattern */}
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
					<AppButton
						variant="outlined"
						onClick={() => {
							setShowForm(false)
							resetForm()
						}}
						label="Cancel"
					/>
					<AppButton
						variant="contained"
						onClick={handleSave}
						loading={saving}
						label={editingId ? 'Save Changes' : 'Save Achievement'}
					/>
				</Box>
			</Box>
		)
	}

	// ── List / empty-state view ──────────────────────────────────────────────────

	return (
		<>
			{sortedAchievements.length === 0 ? (
				<EmptyState onAdd={openAdd} />
			) : (
				<AchievementsList achievements={sortedAchievements} onAdd={openAdd} onEdit={openEdit} />
			)}
		</>
	)
}

// ── Empty state ──────────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
	return (
		<Box sx={{ ...customCardStyle, p: { xs: 3, md: 5 }, textAlign: 'center' }}>
			<Box
				sx={{
					width: 96,
					height: 96,
					borderRadius: '50%',
					bgcolor: 'rgba(43,111,113,0.08)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					mx: 'auto',
					mb: 3,
				}}
			>
				<EmojiEventsOutlinedIcon sx={{ fontSize: 44, color: 'primary.main' }} />
			</Box>

			<Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'text.primary', mb: 1 }}>
				No achievements added yet
			</Typography>
			<Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', maxWidth: 420, mx: 'auto', mb: 3 }}>
				Highlight your awards, certifications, research, and publications to build trust with patients and peers.
			</Typography>

			<AppButton
				label="Add Your First Achievement"
				startIcon={<AddIcon />}
				onClick={onAdd}
				sx={{ borderRadius: '24px', px: 3 }}
			/>

			<Divider sx={{ my: 4 }} />

			<Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', textAlign: 'left', mb: 2 }}>
				What you can add
			</Typography>
			<Grid container spacing={2}>
				{INFO_CARDS.map((card) => (
					<Grid key={card.title} size={{ xs: 12, sm: 4 }}>
						<Box
							sx={{
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: '12px',
								p: 2,
								textAlign: 'left',
								height: '100%',
							}}
						>
							<Box
								sx={{
									width: 36,
									height: 36,
									borderRadius: '8px',
									bgcolor: `${card.color}18`,
									color: card.color,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									mb: 1.25,
								}}
							>
								{card.icon}
							</Box>
							<Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
								{card.title}
							</Typography>
							<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{card.description}</Typography>
						</Box>
					</Grid>
				))}
			</Grid>
		</Box>
	)
}

// ── List state ───────────────────────────────────────────────────────────────────

function AchievementsList({
	achievements,
	onAdd,
	onEdit,
}: {
	achievements: DoctorAchievementItem[]
	onAdd: () => void
	onEdit: (item: DoctorAchievementItem) => void
}) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
			<Box sx={{ ...customCardStyle, p: 0, overflow: 'hidden' }}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						px: 2.5,
						py: 2,
						borderBottom: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
						<Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
							Achievements & Recognition
						</Typography>
					</Box>
					<AppButton
						label="Add Achievement"
						startIcon={<AddIcon />}
						size="small"
						onClick={onAdd}
						sx={{ borderRadius: '20px' }}
					/>
				</Box>

				{achievements.map((item, idx) => {
					const meta = getCategoryMeta(item.achievement_type)
					const dateBadge = formatDateBadge(item.achievement_date)
					return (
						<Box
							key={item.id}
							sx={{
								display: 'flex',
								gap: 2,
								px: 2.5,
								py: 2,
								borderBottom: idx < achievements.length - 1 ? '1px solid' : 'none',
								borderColor: 'divider',
							}}
						>
							<Box
								sx={{
									width: 36,
									height: 36,
									borderRadius: '50%',
									bgcolor: `${meta.color}18`,
									color: meta.color,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
								}}
							>
								{meta.icon}
							</Box>

							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography
									sx={{
										fontSize: '0.68rem',
										fontWeight: 700,
										color: meta.color,
										textTransform: 'uppercase',
										letterSpacing: '0.03em',
									}}
								>
									{item.achievement_type}
								</Typography>
								<Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: 'text.primary', mt: 0.25 }}>
									{item.title}
								</Typography>

								<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
									{item.organization && (
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
											<ApartmentOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
											<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
												{item.organization}
											</Typography>
										</Box>
									)}
									{dateBadge && (
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
											<CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
											<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{dateBadge}</Typography>
										</Box>
									)}
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
										{item.is_public ? (
											<VisibilityOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
										) : (
											<VisibilityOffOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
										)}
										<Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
											{item.is_public ? 'Public' : 'Private'}
										</Typography>
									</Box>
								</Box>

								{item.description && (
									<Typography
										sx={{
											fontSize: '0.78rem',
											color: 'text.secondary',
											mt: 0.75,
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
										}}
									>
										{item.description}
									</Typography>
								)}
							</Box>

							<IconButton size="small" onClick={() => onEdit(item)} sx={{ height: 'fit-content' }}>
								<EditOutlinedIcon fontSize="small" />
							</IconButton>
						</Box>
					)
				})}
		</Box>
	</Box>
)
}
