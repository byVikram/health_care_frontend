// src/features/dashboard/ArticleSection.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, Container, Chip, Divider } from '@mui/material'
import AppButton from '../../../components/common/Button/AppButton'
import AppModal from '../../../components/common/Modal/AppModal'
import AuthorInfoCard from '../../../components/common/AuthorInfoCard'
import { listBlogs, type BlogAuthor } from '../../../services/blogService'

export interface ArticleItem {
	id: number
	category: string
	categoryColor: string
	title: string
	author: string
	image: string
	content: string
	publishDate?: string
	authorData: BlogAuthor
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=450&fit=crop'

export default function ArticleSection() {
	const navigate = useNavigate()
	const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null)
	const [articles, setArticles] = useState<ArticleItem[]>([])

	useEffect(() => {
		let active = true
		const load = async () => {
			try {
				// Published articles; the backend lists featured ones first, then the rest.
				const res = await listBlogs(undefined, 1, 3, undefined, 'article')
				if (!active) return
				setArticles(
					res.data.map((p, i) => ({
						id: i + 1,
						category: p.category,
						categoryColor: '#0c7c7c',
						title: p.title,
						author: p.author?.name ?? p.author_name ?? 'Admin',
						image: p.image_url || FALLBACK_IMAGE,
						content: p.content,
						publishDate: new Date(p.published_at ?? p.created_at).toLocaleDateString(),
						authorData: p.author ?? { name: p.author_name ?? 'Admin' },
					}))
				)
			} catch (err) {
				console.error('Error loading dashboard articles:', err)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [])

	if (articles.length === 0) return null

	return (
		<Box sx={{ width: '100%', bgcolor: '#e5e9e9', py: 6 }}>
			<Container maxWidth="lg">
				<Grid container spacing={4} alignItems="center" sx={{ alignItems: { xs: 'stretch', md: 'center' } }}>
					{/* Left: Articles */}
					<Grid size={{ xs: 12, md: 8 }}>
						<Grid container spacing={3}>
							{articles.map((article) => (
								<Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
									<Box
										onClick={() => setSelectedArticle(article)}
										sx={{
											cursor: 'pointer',
											height: '100%',
											display: 'flex',
											flexDirection: 'column',
											'&:hover .article-img': { transform: 'scale(1.03)' },
										}}
									>
										{/* Image with rounded corners */}
										<Box
											sx={{
												borderRadius: '8px',
												overflow: 'hidden',
												height: { xs: 180, sm: 200 },
												mb: 1.5,
												boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
											}}
										>
											<Box
												component="img"
												src={article.image}
												alt={article.title}
												className="article-img"
												sx={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													display: 'block',
													transition: 'transform 0.3s ease',
												}}
											/>
										</Box>

										{/* Category */}
										<Typography
											variant="body2"
											sx={{
												color: '#0c7c7c',
												fontWeight: 700,
												fontSize: '11px',
												letterSpacing: '0.5px',
												mb: 0.5,
												textTransform: 'uppercase',
											}}
										>
											{article.category}
										</Typography>

										{/* Title */}
										<Typography variant="body1" fontWeight={600} sx={{ color: '#0f172a', lineHeight: 1.35 }}>
											{article.title}
										</Typography>

										{/* Author */}
										<Typography variant="body2" fontSize={'11px'} fontWeight={500} color="text.secondary" mt="auto" pt={1.5}>
											By {article.author}
										</Typography>
									</Box>
								</Grid>
							))}
						</Grid>
					</Grid>

					{/* Right: Text + Button */}
					<Grid size={{ xs: 12, md: 4 }}>
						<Box sx={{ pl: { md: 2 }, textAlign: { xs: 'center', md: 'left' } }}>
							<Typography variant="h3" sx={{ fontWeight: 600, color: '#0f172a' }}>
								Read top articles from health experts
							</Typography>
							<Typography variant="body2" sx={{ fontWeight: 400, color: 'text.secondary' }} my={3}>
								Health articles that keep you informed about good health practices and achieve your goals.
							</Typography>
							<AppButton
								label="See all articles"
								borderRadius="4px"
								onClick={() => navigate('/blogs')}
							/>
						</Box>
					</Grid>
				</Grid>
			</Container>

			{/* Article Reader Modal */}
			<AppModal
				open={Boolean(selectedArticle)}
				onClose={() => setSelectedArticle(null)}
				title={selectedArticle?.category ?? 'Health Article'}
				maxWidth="md"
				fullWidth
			>
				{selectedArticle && (
					<Box sx={{ pt: 1, pb: 2 }}>
						{/* Category Chip & Date */}
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
							<Chip
								label={selectedArticle.category}
								size="small"
								sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700, fontSize: '11px' }}
							/>
							{selectedArticle.publishDate && (
								<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
									{selectedArticle.publishDate}
								</Typography>
							)}
						</Box>

						{/* Title */}
						<Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ mb: 2.5, lineHeight: 1.3 }}>
							{selectedArticle.title}
						</Typography>

						{/* Cover Image */}
						<Box
							component="img"
							src={selectedArticle.image}
							alt={selectedArticle.title}
							sx={{
								width: '100%',
								maxHeight: 340,
								objectFit: 'cover',
								borderRadius: '10px',
								mb: 3,
							}}
						/>

						{/* Article Body Content */}
						<Box sx={{ color: '#334155', lineHeight: 1.8, fontSize: '0.975rem', mb: 3 }}>
							{selectedArticle.content.split('\n\n').map((para, idx) => (
								<Typography key={idx} variant="body1" sx={{ mb: 2, lineHeight: 1.7, color: '#334155' }}>
									{para}
								</Typography>
							))}
						</Box>

						{/* Author Information Section at the Bottom */}
						<AuthorInfoCard author={selectedArticle.authorData} />
					</Box>
				)}
			</AppModal>
		</Box>
	)
}
