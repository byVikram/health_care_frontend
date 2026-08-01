// src/features/admin/pages/AdminBlogsPage.tsx
import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Button,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Stack,
	Chip,
	CircularProgress,
	MenuItem,
	Grid,
	Switch,
	FormControlLabel,
	Tooltip,
	Avatar,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import ArticleIcon from '@mui/icons-material/Article'
import StarIcon from '@mui/icons-material/Star'

import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import SectionCard from '../../../components/common/Card/SectionCard'
import StatusBadge from '../../../components/admin/StatusBadge'
import {
	listAdminBlogs,
	createAdminBlog,
	updateAdminBlog,
	deleteAdminBlog,
	AdminBlogItem,
} from '../adminService'
import { toast } from 'react-toastify'

const BLOG_CATEGORIES = ['Endocrinology', 'Oncology', 'Geriatrics', 'Physical Therapy', 'General']

export default function AdminBlogsPage() {
	const [blogs, setBlogs] = useState<AdminBlogItem[]>([])
	const [loading, setLoading] = useState(true)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingBlog, setEditingBlog] = useState<AdminBlogItem | null>(null)

	// Form State
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [category, setCategory] = useState('General')
	const [status, setStatus] = useState('draft')
	const [imageUrl, setImageUrl] = useState('')
	const [isFeatured, setIsFeatured] = useState(false)

	const fetchBlogs = async () => {
		setLoading(true)
		try {
			const res = await listAdminBlogs()
			setBlogs(res.data)
		} catch (err) {
			console.error('Error fetching blogs:', err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchBlogs()
	}, [])

	const handleOpenCreate = () => {
		setEditingBlog(null)
		setTitle('')
		setContent('')
		setCategory('General')
		setStatus('draft')
		setImageUrl('')
		setIsFeatured(false)
		setDialogOpen(true)
	}

	const handleOpenEdit = (blog: AdminBlogItem) => {
		setEditingBlog(blog)
		setTitle(blog.title)
		setContent('')
		setCategory(blog.category)
		setStatus(blog.status)
		setImageUrl(blog.image_url || '')
		setIsFeatured(blog.is_featured || false)
		setDialogOpen(true)
	}

	const handleSubmit = async () => {
		if (!title.trim()) {
			toast.warning('Title is required')
			return
		}
		try {
			if (editingBlog) {
				const payload: Record<string, any> = { title, category, status, image_url: imageUrl, is_featured: isFeatured }
				if (content.trim()) {
					payload.content = content
				}
				await updateAdminBlog(editingBlog.id, payload)
				toast.success('Blog article updated successfully!')
			} else {
				if (!content.trim()) {
					toast.warning('Article content is required')
					return
				}
				await createAdminBlog({ title, content, category, status, image_url: imageUrl, is_featured: isFeatured })
				toast.success('Blog article created successfully!')
			}
			setDialogOpen(false)
			await fetchBlogs()
		} catch (err) {
			console.error('Error saving blog:', err)
		}
	}

	const handleDelete = async (id: string) => {
		if (!window.confirm('Are you sure you want to delete this blog post?')) return
		try {
			await deleteAdminBlog(id)
			toast.success('Blog post deleted successfully')
			setBlogs((prev) => prev.filter((b) => b.id !== id))
		} catch (err) {
			console.error('Error deleting blog:', err)
		}
	}

	const columns: Column<AdminBlogItem>[] = [
		{
			field: 'title',
			label: 'Article',
			render: (_, blog) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar sx={{ bgcolor: 'rgba(13,148,136,0.12)', color: '#0d9488', width: 36, height: 36, flexShrink: 0 }}>
						<ArticleIcon sx={{ fontSize: 18 }} />
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Stack direction="row" spacing={1} alignItems="center">
							<Typography fontWeight={700} color="#0f172a" fontSize={13} noWrap>
								{blog.title}
							</Typography>
							{blog.is_featured && (
								<Chip
									icon={<StarIcon sx={{ fontSize: '11px !important', color: '#d97706 !important' }} />}
									label="Featured"
									size="small"
									sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
								/>
							)}
						</Stack>
						<Typography variant="caption" display="block" color="text.secondary" noWrap>
							slug: {blog.slug}
						</Typography>
					</Box>
				</Stack>
			),
		},
		{
			field: 'category',
			label: 'Category',
			render: (_, blog) => (
				<Chip
					label={blog.category}
					size="small"
					sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.68rem', borderRadius: '6px', height: 22 }}
				/>
			),
		},
		{
			field: 'author_name',
			label: 'Author',
			render: (_, blog) => (
				<Typography variant="body2" color="#0f172a" fontWeight={600}>
					{blog.author_name}
				</Typography>
			),
		},
		{
			field: 'status',
			label: 'Status',
			render: (_, blog) => (
				<StatusBadge
					status={blog.status}
					label={blog.status.toUpperCase()}
				/>
			),
		},
		{
			field: 'comments_count',
			label: 'Comments',
			render: (_, blog) => (
				<Typography variant="body2" color="text.secondary" fontWeight={600}>
					{blog.comments_count}
				</Typography>
			),
		},
		{
			field: 'created_at',
			label: 'Created At',
			render: (_, blog) => (
				<Typography variant="caption" color="text.secondary">
					{new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
				</Typography>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_, blog) => (
				<Stack direction="row" spacing={0.75} justifyContent="flex-end">
					<Tooltip title="Edit article">
						<IconButton
							size="small"
							onClick={() => handleOpenEdit(blog)}
							sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#0d9488', '&:hover': { bgcolor: 'rgba(13,148,136,0.06)' } }}
						>
							<EditIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete article">
						<IconButton
							size="small"
							onClick={() => handleDelete(blog.id)}
							sx={{ border: '1px solid #fecaca', borderRadius: 1.5, color: '#dc2626', bgcolor: '#fff1f2', '&:hover': { bgcolor: '#fee2e2' } }}
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
			<AdminPageHeader
				title="Health Articles Library"
				subtitle="Draft, edit, publish, and manage blog posts for patient health education and medical insights."
				count={blogs.length}
				countLabel="articles"
				actions={
					<>
						<Tooltip title="Refresh list">
							<IconButton
								onClick={fetchBlogs}
								sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#64748b', '&:hover': { color: '#0f172a' } }}
							>
								<RefreshIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleOpenCreate}
							sx={{ bgcolor: '#0d9488', textTransform: 'none', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }}
						>
							Create Article
						</Button>
					</>
				}
			/>

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading blog articles...
					</Typography>
				</Stack>
			) : (
				<AppTable<AdminBlogItem>
					columns={columns}
					rows={blogs}
					emptyMessage="No blog articles found."
				/>
			)}

			{/* Create/Edit Blog Dialog */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
				<DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
					{editingBlog ? 'Edit Blog Article' : 'Write a New Blog Article'}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={2.5} sx={{ pt: 1.5 }}>
						<TextField
							fullWidth
							label="Article Title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
						<Grid container spacing={2}>
							<Grid size={{ xs: 6 }}>
								<TextField
									fullWidth
									select
									label="Category"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
								>
									{BLOG_CATEGORIES.map((cat) => (
										<MenuItem key={cat} value={cat}>
											{cat}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid size={{ xs: 6 }}>
								<TextField
									fullWidth
									select
									label="Publish Status"
									value={status}
									onChange={(e) => setStatus(e.target.value)}
								>
									<MenuItem value="draft">Draft</MenuItem>
									<MenuItem value="published">Published</MenuItem>
								</TextField>
							</Grid>
						</Grid>
						<TextField
							fullWidth
							label="Banner Image URL"
							placeholder="E.g., https://images.unsplash.com/... or leave empty for default"
							value={imageUrl}
							onChange={(e) => setImageUrl(e.target.value)}
						/>
						<FormControlLabel
							control={
								<Switch
									checked={isFeatured}
									onChange={(e) => setIsFeatured(e.target.checked)}
									color="primary"
								/>
							}
							label={<Typography variant="body2">Feature this article on the landing page</Typography>}
						/>
						<TextField
							fullWidth
							multiline
							rows={10}
							label="Content (Markdown)"
							placeholder="Write your article body here in Markdown format..."
							value={content}
							onChange={(e) => setContent(e.target.value)}
							helperText={editingBlog ? 'Leave blank to preserve the existing article content.' : ''}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1.5, gap: 1 }}>
					<Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Cancel</Button>
					<Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#0d9488', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }}>
						Save Article
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
