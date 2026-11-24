// src/features/admin/pages/AdminArticlesPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Box,
	Typography,
	IconButton,
	Stack,
	Chip,
	CircularProgress,
	Tooltip,
	Avatar,
	Tabs,
	Tab,
	Grid,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SearchIcon from '@mui/icons-material/Search'

import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import StatusBadge from '../../../components/admin/StatusBadge'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import { ARTICLE_CATEGORIES } from '../../../components/admin/ArticleForm'

import {
	listAdminArticles,
	deleteAdminArticle,
	AdminArticleItem,
} from '../adminService'
import { ROUTES } from '../../../constants/routes'
import { toast } from 'react-toastify'

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
	Cardiology: { bg: '#fee2e2', color: '#dc2626' },
	Pediatrics: { bg: '#dbeafe', color: '#1d4ed8' },
	Endocrinology: { bg: '#fef9c3', color: '#a16207' },
	Oncology: { bg: '#fce7f3', color: '#be185d' },
	Neurology: { bg: '#f3e8ff', color: '#7e22ce' },
	'General Health': { bg: '#ccfbf1', color: '#0f766e' },
	'Preventive Care': { bg: '#dcfce7', color: '#15803d' },
	Nutrition: { bg: '#ffedd5', color: '#c2410c' },
	'Mental Wellness': { bg: '#e0e7ff', color: '#4338ca' },
	Other: { bg: '#f1f5f9', color: '#475569' },
}

export default function AdminArticlesPage() {
	const navigate = useNavigate()
	const [articles, setArticles] = useState<AdminArticleItem[]>([])
	const [loading, setLoading] = useState(true)
	const [statusFilter, setStatusFilter] = useState('all')
	const [categoryFilter, setCategoryFilter] = useState('all')
	const [searchQuery, setSearchQuery] = useState('')
	const [articlePendingDelete, setArticlePendingDelete] = useState<AdminArticleItem | null>(null)
	const [deleting, setDeleting] = useState(false)

	const fetchArticles = async () => {
		setLoading(true)
		try {
			const res = await listAdminArticles()
			setArticles(res.data || [])
		} catch (err) {
			console.error('Error fetching articles:', err)
			toast.error('Failed to load articles')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchArticles()
	}, [])

	const handleOpenCreate = () => {
		navigate(ROUTES.ADMIN.ARTICLE_CREATE)
	}

	const handleOpenEdit = (article: AdminArticleItem) => {
		navigate(ROUTES.ADMIN.ARTICLE_EDIT.replace(':id', article.id))
	}

	const handleConfirmDelete = async () => {
		if (!articlePendingDelete) return
		setDeleting(true)
		try {
			await deleteAdminArticle(articlePendingDelete.id)
			toast.success('Article deleted successfully')
			setArticles((prev) => prev.filter((a) => a.id !== articlePendingDelete.id))
			setArticlePendingDelete(null)
		} catch (err) {
			console.error('Error deleting article:', err)
			toast.error('Failed to delete article')
		} finally {
			setDeleting(false)
		}
	}

	const filteredArticles = articles.filter((art) => {
		// Status filter
		if (statusFilter === 'published' && art.status !== 'published') return false
		if (statusFilter === 'draft' && art.status !== 'draft') return false

		// Category filter
		if (categoryFilter !== 'all' && art.category !== categoryFilter) return false

		// Search query filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim()
			const matchesTitle = art.title.toLowerCase().includes(query)
			const matchesSummary = art.summary?.toLowerCase().includes(query)
			const matchesAuthor = art.author?.toLowerCase().includes(query)
			const matchesTags = art.tags?.toLowerCase().includes(query)
			return matchesTitle || matchesSummary || matchesAuthor || matchesTags
		}

		return true
	})

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return '—'
		try {
			return new Date(dateStr).toLocaleDateString('en-IN', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			})
		} catch {
			return dateStr
		}
	}

	const columns: Column<AdminArticleItem>[] = [
		{
			field: 'title',
			label: 'Article',
			render: (_, art) => {
				const style = CATEGORY_COLORS[art.category] || { bg: '#f1f5f9', color: '#475569' }
				const coverImg = art.cover_image || art.coverImage
				const tagList = art.tags
					? art.tags.split(',').map((t) => t.trim()).filter(Boolean)
					: []

				return (
					<Stack direction="row" spacing={1.5} alignItems="flex-start">
						{coverImg ? (
							<Avatar
								src={coverImg}
								variant="rounded"
								sx={{ width: 44, height: 44, borderRadius: 1.5, flexShrink: 0, border: '1px solid #e2e8f0' }}
							/>
						) : (
							<Avatar
								variant="rounded"
								sx={{
									bgcolor: style.bg,
									color: style.color,
									width: 44,
									height: 44,
									borderRadius: 1.5,
									flexShrink: 0,
								}}
							>
								<MenuBookIcon sx={{ fontSize: 22 }} />
							</Avatar>
						)}
						<Box sx={{ minWidth: 0 }}>
							<Typography fontWeight={700} color="#0f172a" fontSize={13.5} noWrap>
								{art.title}
							</Typography>
							<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 360, mb: 0.5 }}>
								{art.summary}
							</Typography>
							{tagList.length > 0 && (
								<Stack direction="row" flexWrap="wrap" gap={0.5}>
									{tagList.slice(0, 3).map((tag) => (
										<Chip
											key={tag}
											label={tag}
											size="small"
											sx={{
												bgcolor: '#f1f5f9',
												color: '#475569',
												fontWeight: 600,
												fontSize: '0.62rem',
												height: 18,
												borderRadius: '4px',
											}}
										/>
									))}
									{tagList.length > 3 && (
										<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
											+{tagList.length - 3} more
										</Typography>
									)}
								</Stack>
							)}
						</Box>
					</Stack>
				)
			},
		},
		{
			field: 'category',
			label: 'Category',
			render: (_, art) => {
				const style = CATEGORY_COLORS[art.category] || { bg: '#f1f5f9', color: '#475569' }
				return (
					<Chip
						label={art.category}
						size="small"
						sx={{
							bgcolor: style.bg,
							color: style.color,
							fontWeight: 700,
							fontSize: '0.68rem',
							borderRadius: '6px',
							height: 22,
						}}
					/>
				)
			},
		},
		{
			field: 'author',
			label: 'Author',
			render: (_, art) => (
				<Typography variant="body2" color="#0f172a" fontWeight={600}>
					{art.author || 'Admin'}
				</Typography>
			),
		},
		{
			field: 'status',
			label: 'Status',
			render: (_, art) => (
				<StatusBadge
					status={art.status}
					label={art.status.toUpperCase()}
				/>
			),
		},
		{
			field: 'publish_date',
			label: 'Publish Date',
			render: (_, art) => (
				<Typography variant="caption" color="text.secondary" fontWeight={500}>
					{formatDate(art.publish_date || art.publishDate)}
				</Typography>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_, art) => (
				<Stack direction="row" spacing={0.75} justifyContent="flex-end">
					<Tooltip title="Edit article">
						<IconButton
							size="small"
							onClick={() => handleOpenEdit(art)}
							sx={{
								border: '1px solid #e2e8f0',
								borderRadius: 1.5,
								color: '#0d9488',
								'&:hover': { bgcolor: 'rgba(13,148,136,0.06)' },
							}}
						>
							<EditIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete article">
						<IconButton
							size="small"
							onClick={() => setArticlePendingDelete(art)}
							sx={{
								border: '1px solid #fecaca',
								borderRadius: 1.5,
								color: '#dc2626',
								bgcolor: '#fff1f2',
								'&:hover': { bgcolor: '#fee2e2' },
							}}
						>
							<DeleteIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
				</Stack>
			),
		},
	]

	return (
		<Box>
			{/* Page Header */}
			<AdminPageHeader
				title="Healthcare Articles"
				subtitle="Draft, edit, publish, and manage medical articles, patient education guides, and clinical insights."
				count={filteredArticles.length}
				countLabel="articles"
				actions={
					<>
						<Tooltip title="Refresh articles list">
							<IconButton
								onClick={fetchArticles}
								sx={{
									border: '1px solid #e2e8f0',
									borderRadius: 1.5,
									color: '#64748b',
									'&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
								}}
							>
								<RefreshIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<AppButton
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleOpenCreate}
							label="Add Article"
							sx={{
								bgcolor: '#0d9488',
								fontWeight: 700,
								'&:hover': { bgcolor: '#0f766e' },
							}}
						/>
					</>
				}
			/>

			{/* Filter Controls Row */}
			<Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
				{/* Status Tabs */}
				<Grid size={{ xs: 12, md: 6 }}>
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<Tabs
							value={statusFilter}
							onChange={(_, v) => setStatusFilter(v)}
							sx={{
								minHeight: 40,
								'& .MuiTabs-indicator': { bgcolor: '#0d9488' },
								'& .MuiTab-root': {
									textTransform: 'none',
									fontWeight: 700,
									fontSize: '0.85rem',
									minHeight: 40,
									py: 0,
									'&.Mui-selected': { color: '#0d9488' },
								},
							}}
						>
							<Tab label={`All (${articles.length})`} value="all" />
							<Tab
								label={`Published (${articles.filter((a) => a.status === 'published').length})`}
								value="published"
							/>
							<Tab
								label={`Drafts (${articles.filter((a) => a.status === 'draft').length})`}
								value="draft"
							/>
						</Tabs>
					</Box>
				</Grid>

				{/* Search & Category Filter */}
				<Grid size={{ xs: 12, md: 6 }}>
					<Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
						<AppInput
							placeholder="Search articles..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							startIcon={<SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />}
							enableVoiceSearch
							onVoiceResult={(text) => setSearchQuery(text)}
							sx={{ width: { xs: '100%', sm: 260 } }}
						/>
						<AppSelect
							value={categoryFilter}
							onChange={(e: any) => setCategoryFilter(e.target.value)}
							options={[
								{ value: 'all', label: 'All Categories' },
								...ARTICLE_CATEGORIES,
							]}
							sx={{ minWidth: 160 }}
						/>
					</Stack>
				</Grid>
			</Grid>

			{/* Main Articles Table */}
			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading healthcare articles...
					</Typography>
				</Stack>
			) : (
				<AppTable<AdminArticleItem>
					columns={columns}
					rows={filteredArticles}
					emptyMessage='No healthcare articles found matching your criteria. Click "+ Add Article" to write one.'
				/>
			)}

			<ConfirmModal
				open={articlePendingDelete !== null}
				onClose={() => setArticlePendingDelete(null)}
				onConfirm={handleConfirmDelete}
				title="Delete Article"
				description={`Are you sure you want to delete "${articlePendingDelete?.title}"? This action cannot be undone.`}
				variant="delete"
				confirmLabel="Delete Article"
				loading={deleting}
			/>
		</Box>
	)
}
