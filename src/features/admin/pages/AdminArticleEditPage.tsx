// src/features/admin/pages/AdminArticleEditPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Stack, CircularProgress, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { toast } from 'react-toastify'

import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import ArticleForm from '../../../components/admin/ArticleForm'
import type { ArticleFormData } from '../../../components/admin/ArticleForm'
import { getAdminArticle, updateAdminArticle, type AdminArticleItem } from '../adminService'
import { ROUTES } from '../../../constants/routes'

export default function AdminArticleEditPage() {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [article, setArticle] = useState<AdminArticleItem | null>(null)

	useEffect(() => {
		if (!id) return
		setLoading(true)
		getAdminArticle(id)
			.then((res) => {
				if (res.success && res.data) {
					setArticle(res.data)
				} else {
					toast.error('Failed to load article details.')
				}
			})
			.catch((err) => {
				console.error('Error fetching article details:', err)
				toast.error('Failed to retrieve article details.')
			})
			.finally(() => {
				setLoading(false)
			})
	}, [id])

	const handleBack = () => navigate(ROUTES.ADMIN.ARTICLES)

	const handleSubmit = async (formData: ArticleFormData, statusOverride?: string) => {
		if (!id) return
		setSubmitting(true)
		try {
			const status = statusOverride || formData.status || article?.status || 'published'
			await updateAdminArticle(id, {
				title: formData.title,
				summary: formData.summary || article?.summary || formData.title,
				content: formData.content,
				category: formData.category,
				cover_image: formData.cover_image || undefined,
				coverImage: formData.cover_image || undefined,
				author: formData.author || 'Admin',
				tags: formData.tags || undefined,
				status,
				publish_date: formData.publish_date || undefined,
				publishDate: formData.publish_date || undefined,
				is_featured: !!formData.is_featured,
			})
			toast.success(`Article successfully updated as ${status.toUpperCase()}!`)
			navigate(ROUTES.ADMIN.ARTICLES)
		} catch (err) {
			console.error('Error updating article:', err)
			toast.error('Failed to update article.')
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<Stack alignItems="center" justifyContent="center" sx={{ py: 15 }}>
				<CircularProgress sx={{ color: '#0d9488' }} />
				<Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>
					Loading Healthcare Article details...
				</Typography>
			</Stack>
		)
	}

	const initialFormData: Partial<ArticleFormData> = article
		? {
				title: article.title,
				summary: article.summary,
				content: article.content,
				category: article.category,
				cover_image: article.cover_image || article.coverImage || '',
				author: article.author,
				tags: article.tags || '',
				status: article.status,
				publish_date: article.publish_date || article.publishDate || '',
				is_featured: article.is_featured,
		  }
		: {}

	return (
		<Box sx={{ pb: 6 }}>
			<AdminPageHeader
				title="Edit Healthcare Article"
				subtitle="Modify content, update category, or change publishing status for this healthcare guide."
				leading={
					<IconButton
						onClick={handleBack}
						size="small"
						sx={{
							color: '#475569',
							border: '1px solid #e2e8f0',
							borderRadius: 1.5,
							bgcolor: '#ffffff',
							p: 0.75,
							'&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
						}}
					>
						<ArrowBackIcon sx={{ fontSize: 18 }} />
					</IconButton>
				}
			/>

			<ArticleForm
				initialData={initialFormData}
				onSubmit={handleSubmit}
				onCancel={handleBack}
				isEdit
				submitting={submitting}
			/>
		</Box>
	)
}
