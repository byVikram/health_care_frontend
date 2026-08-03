// src/features/admin/pages/AdminBlogCreatePage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Box,
	Typography,
	Stack,
	Grid,
	FormControlLabel,
	Card,
	CardContent,
	Divider,
	InputBase,
	Paper,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import PublishIcon from '@mui/icons-material/Publish'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { toast } from 'react-toastify'

import AppSwitch from '../../../components/common/Switch/AppSwitch'
import RichTextEditor from '../../../components/admin/RichTextEditor'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import SectionCard from '../../../components/common/Card/SectionCard'
import { createAdminBlog } from '../adminService'
import { ROUTES } from '../../../constants/routes'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'
import AppSelect from '../../../components/common/Select/AppSelect'

const BLOG_CATEGORIES = ['Endocrinology', 'Oncology', 'Geriatrics', 'Physical Therapy', 'General']

export default function AdminBlogCreatePage() {
	const navigate = useNavigate()
	const [submitting, setSubmitting] = useState(false)

	// Form State
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [category, setCategory] = useState('General')
	const [status, setStatus] = useState('draft')
	const [imageUrl, setImageUrl] = useState('')
	const [isFeatured, setIsFeatured] = useState(false)

	const handleBack = () => navigate(ROUTES.ADMIN.BLOGS)

	const handleSave = async (overrideStatus?: string) => {
		const finalStatus = overrideStatus || status
		const trimmedTitle = title.trim()
		if (!trimmedTitle) {
			toast.warning('Please enter an article title')
			return
		}
		if (!content.trim()) {
			toast.warning('Please write some content for the article')
			return
		}

		setSubmitting(true)
		try {
			await createAdminBlog({
				title: trimmedTitle,
				content,
				category,
				status: finalStatus,
				image_url: imageUrl.trim() || undefined,
				is_featured: isFeatured,
			})
			toast.success(`Blog article successfully saved as ${finalStatus.toUpperCase()}!`)
			navigate(ROUTES.ADMIN.BLOGS)
		} catch (err) {
			console.error('Error creating blog article:', err)
			toast.error('Failed to create blog article.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Box sx={{ pb: 6 }}>
			{/* Page Header */}
			<AdminPageHeader
				title="Create Health Article"
				subtitle="Write and compile a new medical guide, case study, or health alert for the portal library."
				actions={
					<AppButton
						variant="outlined"
						startIcon={<ArrowBackIcon />}
						onClick={handleBack}
						label="Back to Library"
						sx={{
							borderColor: '#cbd5e1',
							color: '#64748b',
							'&:hover': { borderColor: '#0f172a', color: '#0f172a' },
						}}
					/>
				}
			/>

			{/* CMS 2-Column Workspace Layout */}
			<Grid container spacing={3} sx={{ mt: 1 }}>
				{/* Left Column: Editor Canvas (72% width) */}
				<Grid size={{ xs: 12, md: 8.5 }}>
					<Stack spacing={3}>
						{/* Title input card */}
						<Paper
							variant="outlined"
							sx={{
								p: 3,
								borderRadius: 2,
								borderColor: '#cbd5e1',
								boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
							}}
						>
							<Typography variant="caption" fontWeight={700} color="#0d9488" sx={{ letterSpacing: '0.05em', textTransform: 'uppercase', mb: 1, display: 'block' }}>
								Article Title
							</Typography>
							<InputBase
								fullWidth
								placeholder="Enter a descriptive title..."
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								sx={{
									fontSize: '2rem',
									fontWeight: 800,
									color: '#0f172a',
									lineHeight: 1.2,
									'& input::placeholder': { color: '#94a3b8', opacity: 1 },
								}}
							/>
						</Paper>

						{/* Rich Text Editor */}
						<Box>
							<RichTextEditor
								value={content}
								onChange={(html) => setContent(html)}
								placeholder="Begin writing your medical article content here..."
							/>
						</Box>
					</Stack>
				</Grid>

				{/* Right Column: Settings Sidebar Pane (28% width) */}
				<Grid size={{ xs: 12, md: 3.5 }}>
					<Stack spacing={3}>
						{/* Actions Pane */}
						<Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
							<CardContent sx={{ p: 3 }}>
								<Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
									Publish Actions
								</Typography>
								<Stack spacing={1.5}>
									<AppButton
										variant="contained"
										fullWidth
										disabled={submitting}
										startIcon={<PublishIcon />}
										onClick={() => handleSave('published')}
										label="Publish Instantly"
										sx={{
											bgcolor: '#0d9488',
											fontWeight: 700,
											py: 1.25,
											'&:hover': { bgcolor: '#0f766e' },
										}}
									/>
									<AppButton
										variant="outlined"
										fullWidth
										disabled={submitting}
										startIcon={<SaveIcon />}
										onClick={() => handleSave('draft')}
										label="Save as Draft"
										sx={{
											borderColor: '#0d9488',
											color: '#0d9488',
											fontWeight: 700,
											py: 1.25,
											'&:hover': { bgcolor: 'rgba(13,148,136,0.04)', borderColor: '#0d9488' },
										}}
									/>
									<AppButton
										fullWidth
										variant="text"
										onClick={handleBack}
										label="Discard"
										sx={{
											fontWeight: 600,
											color: '#64748b',
										}}
									/>
								</Stack>
							</CardContent>
						</Card>

						{/* Settings Pane */}
						<Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
							<CardContent sx={{ p: 3 }}>
								<Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 2.5 }}>
									Article Settings
								</Typography>
								<Stack spacing={2.5}>
									{/* Category */}
									<AppSelect
										label="Specialty Category"
										value={category}
										onChange={(e) => setCategory(e.target.value)}
										options={BLOG_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
										fullWidth
									/>

									{/* Status */}
									<AppSelect
										label="Save Status"
										value={status}
										onChange={(e) => setStatus(e.target.value)}
										options={[
											{ value: 'draft', label: 'Draft' },
											{ value: 'published', label: 'Published' },
										]}
										fullWidth
									/>

									{/* Featured Switch */}
									<Box sx={{ px: 0.5 }}>
										<FormControlLabel
											control={
												<AppSwitch
													checked={isFeatured}
													onChange={(e) => setIsFeatured(e.target.checked)}
												/>
											}
											label={
												<Box sx={{ ml: 1 }}>
													<Typography variant="body2" fontWeight={700} color="#0f172a">
														Feature Article
													</Typography>
													<Typography variant="caption" color="text.secondary" display="block">
														Promote to landing page banner
													</Typography>
												</Box>
											}
										/>
									</Box>

									<Divider />

									{/* Banner Image URL */}
									<Stack spacing={1.5}>
										<AppInput
											label="Banner Image URL"
											placeholder="https://images.unsplash.com/..."
											value={imageUrl}
											onChange={(e) => setImageUrl(e.target.value)}
											fullWidth
										/>
										{imageUrl.trim() && (
											<Box>
												<Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
													Banner Preview
												</Typography>
												<Box
													component="img"
													src={imageUrl}
													alt="Banner Preview"
													onError={(e) => {
														;(e.target as HTMLElement).style.display = 'none'
													}}
													sx={{
														width: '100%',
														height: 120,
														objectFit: 'cover',
														borderRadius: 2,
														border: '1px solid #e2e8f0',
													}}
												/>
											</Box>
										)}
									</Stack>
								</Stack>
							</CardContent>
						</Card>
					</Stack>
				</Grid>
			</Grid>
		</Box>
	)
}

