// src/components/admin/ArticleForm.tsx
import { useState } from 'react'
import {
	Box,
	Typography,
	Stack,
	Grid,
	Card,
	CardContent,
	Divider,
	Paper,
	Chip,
	FormControlLabel,
} from '@mui/material'
import AppSwitch from '../common/Switch/AppSwitch'
import SaveIcon from '@mui/icons-material/Save'
import PublishIcon from '@mui/icons-material/Publish'
import { toast } from 'react-toastify'

import RichTextEditor from './RichTextEditor'
import AppInput from '../common/Input/AppInput'
import AppButton from '../common/Button/AppButton'
import AppSelect from '../common/Select/AppSelect'
import { ARTICLE_CATEGORIES } from '../../constants/constants'

export interface ArticleFormData {
	title: string
	summary?: string
	content: string
	category: string
	cover_image: string
	author: string
	tags: string
	status?: string
	publish_date: string
	is_featured?: boolean
}

export interface ArticleFormProps {
	initialData?: Partial<ArticleFormData>
	onSubmit: (data: ArticleFormData, statusOverride?: string) => Promise<void>
	onCancel: () => void
	isEdit?: boolean
	submitting?: boolean
}

export default function ArticleForm({
	initialData,
	onSubmit,
	onCancel,
	submitting = false,
}: ArticleFormProps) {
	const [title, setTitle] = useState(initialData?.title || '')
	const [content, setContent] = useState(initialData?.content || '')
	const [category, setCategory] = useState(initialData?.category || 'General Health')
	const [coverImage, setCoverImage] = useState(initialData?.cover_image || '')
	const [author, setAuthor] = useState(initialData?.author || 'Admin')
	const [tags, setTags] = useState(initialData?.tags || '')
	const [publishDate, setPublishDate] = useState(
		initialData?.publish_date
			? initialData.publish_date.split('T')[0]
			: new Date().toISOString().split('T')[0]
	)
	const [imgError, setImgError] = useState(false)
		const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false)

	// Clean tags preview helper (removes duplicates and empty items)
	const tagList = Array.from(
		new Set(
			tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)
		)
	)

	const handleSubmit = async (overrideStatus?: string) => {
		const finalTitle = title.trim()
		const finalContent = content.trim()

		if (!finalTitle) {
			toast.warning('Article Title is required.')
			return
		}
		if (!finalContent) {
			toast.warning('Article Content is required.')
			return
		}
		if (!category) {
			toast.warning('Category is required.')
			return
		}

		const formData: ArticleFormData = {
			title: finalTitle,
			summary: initialData?.summary || finalTitle,
			content: finalContent,
			category,
			cover_image: coverImage.trim(),
			author: author.trim() || 'Admin',
			tags: tagList.join(', '),
			status: overrideStatus || initialData?.status || 'published',
			publish_date: publishDate,
			is_featured: isFeatured,
		}

		await onSubmit(formData, overrideStatus)
	}

	return (
		<Grid container spacing={3} sx={{ mt: 1 }}>
			{/* Left Column: Editor Canvas (70% desktop / 100% mobile) */}
			<Grid size={{ xs: 12, md: 8.5 }}>
				<Stack spacing={3}>
					{/* Title Card */}
					<Paper
						variant="outlined"
						sx={{
							p: 3,
							borderRadius: 2,
							borderColor: '#cbd5e1',
							boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
							bgcolor: '#ffffff',
						}}
					>
						<Typography
							variant="caption"
							fontWeight={700}
							color="#0d9488"
							sx={{ letterSpacing: '0.05em', textTransform: 'uppercase', mb: 1, display: 'block' }}
						>
							Article Title *
						</Typography>
						<AppInput
							fullWidth
							placeholder="E.g., Understanding Cardiovascular Health & Daily Interventions..."
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							sx={{
								'& input': {
									fontSize: '1.4rem',
									fontWeight: 700,
									color: '#0f172a',
								},
							}}
						/>
					</Paper>

					{/* Rich Text Editor */}
					<Box>
						<Typography
							variant="caption"
							fontWeight={700}
							color="#0d9488"
							sx={{ letterSpacing: '0.05em', textTransform: 'uppercase', mb: 1, display: 'block' }}
						>
							Article Content *
						</Typography>
						<RichTextEditor
							value={content}
							onChange={(html) => setContent(html)}
							placeholder="Write your comprehensive healthcare article content here using formatting, headings, and bullet points..."
							minHeight={320}
						/>
					</Box>
				</Stack>
			</Grid>

			{/* Right Column: Settings Sidebar Pane (30% desktop / 100% mobile) */}
			<Grid size={{ xs: 12, md: 3.5 }}>
				<Stack spacing={3}>
					{/* Publishing Actions Pane */}
					<Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
								Publishing Actions
							</Typography>
							<Stack spacing={1.5}>
								<AppButton
									variant="contained"
									fullWidth
									disabled={submitting}
									startIcon={<PublishIcon />}
									onClick={() => handleSubmit('published')}
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
									onClick={() => handleSubmit('draft')}
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
									onClick={onCancel}
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
								{/* Category Select */}
								<AppSelect
									label="Specialty Category *"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									options={ARTICLE_CATEGORIES}
									fullWidth
								/>

								{/* Author Input */}
								<AppInput
									label="Author Name"
									placeholder="E.g., Dr. Sarah Jenkins"
									value={author}
									onChange={(e) => setAuthor(e.target.value)}
									fullWidth
								/>

								{/* Publish Date */}
								<AppInput
									type="date"
									label="Publish Date"
									value={publishDate}
									onChange={(e) => setPublishDate(e.target.value)}
									fullWidth
								/>

								{/* Featured Switch */}
									<FormControlLabel
										control={<AppSwitch checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />}
										label={
											<Box sx={{ ml: 1 }}>
												<Typography variant="body2" fontWeight={700} color="#0f172a">
													Feature Article
												</Typography>
												<Typography variant="caption" color="text.secondary" display="block">
													Show on the user dashboard
												</Typography>
											</Box>
										}
									/>

								<Divider />

								{/* Tags Input */}
								<Stack spacing={1}>
									<AppInput
										label="Tags (Comma separated)"
										placeholder="Cardiology, Heart, Prevention"
										value={tags}
										onChange={(e) => setTags(e.target.value)}
										fullWidth
									/>
									{tagList.length > 0 && (
										<Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ pt: 0.5 }}>
											{tagList.map((tag) => (
												<Chip
													key={tag}
													label={tag}
													size="small"
													sx={{
														bgcolor: '#ccfbf1',
														color: '#0f766e',
														fontWeight: 600,
														fontSize: '0.68rem',
														borderRadius: '6px',
														height: 22,
													}}
												/>
											))}
										</Stack>
									)}
								</Stack>

								<Divider />

								{/* Cover Image URL */}
								<Stack spacing={1.5}>
									<AppInput
										label="Cover Image URL"
										placeholder="https://images.unsplash.com/..."
										value={coverImage}
										onChange={(e) => {
											setCoverImage(e.target.value)
											setImgError(false)
										}}
										fullWidth
									/>
									{coverImage.trim() && !imgError && (
										<Box>
											<Typography
												variant="caption"
												fontWeight={700}
												color="text.secondary"
												sx={{ display: 'block', mb: 0.75 }}
											>
												Cover Live Preview
											</Typography>
											<Box
												component="img"
												src={coverImage}
												alt="Cover Preview"
												onError={() => setImgError(true)}
												sx={{
													width: '100%',
													height: 130,
													objectFit: 'cover',
													borderRadius: 2,
													border: '1px solid #e2e8f0',
												}}
											/>
										</Box>
									)}
									{imgError && coverImage.trim() && (
										<Typography variant="caption" color="error">
											Unable to load image from URL. Fallback image will be used.
										</Typography>
									)}
								</Stack>
							</Stack>
						</CardContent>
					</Card>
				</Stack>
			</Grid>
		</Grid>
	)
}
