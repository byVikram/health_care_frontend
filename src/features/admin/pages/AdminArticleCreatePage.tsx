// src/features/admin/pages/AdminArticleCreatePage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { toast } from 'react-toastify'

import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AppButton from '../../../components/common/Button/AppButton'
import ArticleForm from '../../../components/admin/ArticleForm'
import type { ArticleFormData } from '../../../components/admin/ArticleForm'
import { createAdminArticle } from '../adminService'
import { ROUTES } from '../../../constants/routes'

export default function AdminArticleCreatePage() {
	const navigate = useNavigate()
	const [submitting, setSubmitting] = useState(false)

	const handleBack = () => navigate(ROUTES.ADMIN.ARTICLES)

	const handleSubmit = async (formData: ArticleFormData, statusOverride?: string) => {
		setSubmitting(true)
		try {
			const status = statusOverride || formData.status || 'published'
			await createAdminArticle({
				title: formData.title,
				summary: formData.summary || formData.title,
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
			toast.success(`Article successfully saved as ${status.toUpperCase()}!`)
			navigate(ROUTES.ADMIN.ARTICLES)
		} catch (err) {
			console.error('Error creating healthcare article:', err)
			toast.error('Failed to create healthcare article.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Box sx={{ pb: 6 }}>
			<AdminPageHeader
				title="Create Healthcare Article"
				subtitle="Write and compile a new medical guide, patient health advisory, or research summary for the portal library."
				actions={
					<AppButton
						variant="outlined"
						startIcon={<ArrowBackIcon />}
						onClick={handleBack}
						label="Back to Articles"
						sx={{
							borderColor: '#cbd5e1',
							color: '#64748b',
							'&:hover': { borderColor: '#0f172a', color: '#0f172a' },
						}}
					/>
				}
			/>

			<ArticleForm
				onSubmit={handleSubmit}
				onCancel={handleBack}
				submitting={submitting}
			/>
		</Box>
	)
}
