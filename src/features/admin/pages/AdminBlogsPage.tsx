// src/features/admin/pages/AdminBlogsPage.tsx
import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Card,
	CardContent,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'

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
		setContent('') // We can leave content blank to preserve it unless edited, or let the user override
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
				// Update
				const payload: Record<string, any> = { title, category, status, image_url: imageUrl, is_featured: isFeatured }
				if (content.trim()) {
					payload.content = content
				}
				await updateAdminBlog(editingBlog.id, payload)
				toast.success('Blog article updated successfully!')
			} else {
				// Create
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

	return (
		<Box sx={{ p: 1 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
				<Box>
					<Typography variant="h5" fontWeight={800} color="#0f172a">
						Health Articles Library
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Draft, edit, publish, and delete blog posts for patient health education.
					</Typography>
				</Box>
				<Stack direction="row" spacing={2}>
					<IconButton onClick={fetchBlogs} sx={{ color: '#0d9488' }}>
						<RefreshIcon />
					</IconButton>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleOpenCreate}
						sx={{ bgcolor: '#0d9488', textTransform: 'none', borderRadius: 2.5, '&:hover': { bgcolor: '#0f766e' } }}
					>
						Create Article
					</Button>
				</Stack>
			</Stack>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
				</Box>
			) : (
				<TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
					<Table sx={{ minWidth: 650 }}>
						<TableHead sx={{ bgcolor: '#f8fafc' }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Title</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Category</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Author</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Comments Count</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Created At</TableCell>
								<TableCell align="right" sx={{ fontWeight: 700, color: '#475569', pr: 3 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{blogs.map((blog) => (
								<TableRow key={blog.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>
										<Stack direction="row" spacing={1} alignItems="center">
											<span>{blog.title}</span>
											{blog.is_featured && (
												<Chip
													label="Featured"
													size="small"
													sx={{
														bgcolor: '#fef3c7',
														color: '#d97706',
														fontWeight: 700,
														fontSize: '0.65rem',
														height: 18,
													}}
												/>
											)}
										</Stack>
										<Typography variant="caption" display="block" color="text.secondary">
											slug: {blog.slug}
										</Typography>
									</TableCell>
									<TableCell>{blog.category}</TableCell>
									<TableCell>{blog.author_name}</TableCell>
									<TableCell>
										<Chip
											label={blog.status.toUpperCase()}
											size="small"
											sx={{
												bgcolor: blog.status === 'published' ? '#ccfbf1' : '#f1f5f9',
												color: blog.status === 'published' ? '#0f766e' : '#475569',
												fontWeight: 700,
												fontSize: '0.65rem',
											}}
										/>
									</TableCell>
									<TableCell>{blog.comments_count}</TableCell>
									<TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
									<TableCell align="right" sx={{ pr: 3 }}>
										<Stack direction="row" spacing={1} justifyContent="flex-end">
											<IconButton color="primary" onClick={() => handleOpenEdit(blog)} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
												<EditIcon fontSize="small" />
											</IconButton>
											<IconButton color="error" onClick={() => handleDelete(blog.id)} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</Stack>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			{/* Create/Edit Blog Dialog */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle sx={{ fontWeight: 700 }}>
					{editingBlog ? 'Edit Blog Article' : 'Write a New Blog Article'}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ pt: 1.5 }}>
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
							label="Feature this article on the landing page"
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
				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}>
						Save Article
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
