// src/features/admin/pages/AdminBlogsPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Box,
	Typography,
	Button,
	IconButton,
	Stack,
	Chip,
	CircularProgress,
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
// import SectionCard from '../../../components/common/Card/SectionCard'
import StatusBadge from '../../../components/admin/StatusBadge'
import {
	listAdminBlogs,
	deleteAdminBlog,
	AdminBlogItem,
} from '../adminService'
import { ROUTES } from '../../../constants/routes'
import { toast } from 'react-toastify'

export default function AdminBlogsPage() {
	const navigate = useNavigate()
	const [blogs, setBlogs] = useState<AdminBlogItem[]>([])
	const [loading, setLoading] = useState(true)

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
		navigate(ROUTES.ADMIN.BLOG_CREATE)
	}

	const handleOpenEdit = (blog: AdminBlogItem) => {
		navigate(ROUTES.ADMIN.BLOG_EDIT.replace(':id', blog.id))
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
		</Box>
	)
}
