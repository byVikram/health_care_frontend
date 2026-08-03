// src/features/portal/BlogArticlePage.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	Box,
	Container,
	Typography,
	Card,
	CardContent,
	CardMedia,
	Chip,
	Button,
	CircularProgress,
	Stack,
	Divider,
	TextField,
	Avatar,
	Paper,
	Grid,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import SendIcon from '@mui/icons-material/Send'
import ReplyIcon from '@mui/icons-material/Reply'
import VerifiedIcon from '@mui/icons-material/Verified'

import { getBlogPost, getBlogComments, createBlogComment, BlogPost, BlogComment } from '../../services/blogService'
import { getActiveAds, trackAdMetric, AdPlacementConfig } from '../../services/adService'
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth'

const renderInFeedAd = (matchingAd: AdPlacementConfig, idx: number, onAdClick: (adId: string, url: string) => void) => (
	<Card
		key={`ad-card-${idx}`}
		sx={{
			my: 4,
			mx: 'auto',
			maxWidth: '100%',
			borderRadius: 2,
			border: '1px solid #cbd5e1',
			overflow: 'hidden',
			boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
			cursor: 'pointer',
			'&:hover': { transform: 'scale(1.005)' },
			transition: 'transform 0.15s',
		}}
		onClick={() => onAdClick(matchingAd.ad.id, matchingAd.ad.target_url)}
	>
		<Grid container>
			<Grid size={{ xs: 12, sm: 4 }}>
				<CardMedia component="img" image={matchingAd.ad.image_url} alt={matchingAd.ad.title} sx={{ height: 140 }} />
			</Grid>
			<Grid size={{ xs: 12, sm: 8 }} sx={{ display: 'flex', alignItems: 'center' }}>
				<CardContent sx={{ p: 3, width: '100%' }}>
					<Chip
						label="Sponsored"
						size="small"
						sx={{ mb: 1, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#e2e8f0' }}
					/>
					<Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a', mb: 1 }}>
						{matchingAd.ad.title}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Click to learn more about this service.
					</Typography>
				</CardContent>
			</Grid>
		</Grid>
	</Card>
)

// Simple custom renderer for Markdown or WYSIWYG HTML content
const renderContentParagraphs = (content: string, ads: AdPlacementConfig[], onAdClick: (adId: string, url: string) => void) => {
	const isHtml = /<[a-z][\s\S]*>/i.test(content)

	if (!isHtml) {
		const paragraphs = content.split('\n\n').filter((p) => p.trim() !== '')
		return paragraphs.map((para, idx) => {
			let element = null
			if (para.startsWith('#### ')) {
				element = (
					<Typography key={idx} variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1, color: '#0f172a' }}>
						{para.replace('#### ', '')}
					</Typography>
				)
			} else if (para.startsWith('### ')) {
				element = (
					<Typography key={idx} variant="h5" fontWeight={800} sx={{ mt: 4, mb: 1.5, color: '#0f172a' }}>
						{para.replace('### ', '')}
					</Typography>
				)
			} else if (para.startsWith('- ')) {
				const items = para.split('\n').map((line) => line.replace('- ', '').trim())
				element = (
					<Box key={idx} component="ul" sx={{ pl: 3, mb: 2, color: '#334155' }}>
						{items.map((item, i) => (
							<li key={i} style={{ marginBottom: '8px' }}>
								<Typography variant="body1">{item}</Typography>
							</li>
						))}
					</Box>
				)
			} else {
				element = (
					<Typography key={idx} variant="body1" sx={{ mb: 2.5, lineHeight: 1.7, color: '#334155' }}>
						{para}
					</Typography>
				)
			}

			const matchingAd = ads.find((ad) => ad.placement_key === 'in-feed' && ad.paragraph_index === idx + 1)
			if (matchingAd) {
				return (
					<Box key={`para-ad-${idx}`}>
						{element}
						{renderInFeedAd(matchingAd, idx, onAdClick)}
					</Box>
				)
			}
			return element
		})
	}

	const parts = content.split('</p>')
	const paragraphs = parts.map((part, idx) => {
		if (idx === parts.length - 1 && part.trim() === '') return ''
		return part.trim() ? part + '</p>' : ''
	}).filter((p) => p !== '')

	return paragraphs.map((paraHtml, idx) => {
		const element = (
			<Box
				key={idx}
				dangerouslySetInnerHTML={{ __html: paraHtml }}
				sx={{
					color: '#334155',
					lineHeight: 1.8,
					fontSize: '1.05rem',
					mb: 2.5,
					'& h1': { fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', mt: 3, mb: 1.5 },
					'& h2': { fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', mt: 3, mb: 1.5 },
					'& h3': { fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', mt: 2, mb: 1 },
					'& blockquote': {
						borderLeft: '4px solid #0d9488',
						pl: 2,
						ml: 0,
						my: 2,
						color: '#475569',
						fontStyle: 'italic',
						bgcolor: '#f0fdf4',
						py: 1,
						borderRadius: '0 8px 8px 0',
					},
					'& a': { color: '#0d9488', textDecoration: 'underline', fontWeight: 700 },
					'& ul, & ol': { pl: 3, mb: 2 },
					'& li': { mb: 1 },
				}}
			/>
		)

		const matchingAd = ads.find((ad) => ad.placement_key === 'in-feed' && ad.paragraph_index === idx + 1)
		if (matchingAd) {
			return (
				<Box key={`para-ad-${idx}`}>
					{element}
					{renderInFeedAd(matchingAd, idx, onAdClick)}
				</Box>
			)
		}
		return element
	})
}

// Recursive Comment Node Component
const CommentNode = ({
	comment,
	onReplyTrigger,
	activeReplyId,
	replyContent,
	setReplyContent,
	onReplySubmit,
}: {
	comment: BlogComment
	onReplyTrigger: (id: string) => void
	activeReplyId: string | null
	replyContent: string
	setReplyContent: (val: string) => void
	onReplySubmit: (parentId: string) => void
}) => {
	const isDoctor = comment.user_role === 'doctor'
	const isReplyFormOpen = activeReplyId === comment.id

	return (
		<Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
			<Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
				<Avatar sx={{ bgcolor: isDoctor ? '#0d9488' : '#64748b' }}>
					{comment.user_name.charAt(0).toUpperCase()}
				</Avatar>
				<Box flex={1}>
					<Stack direction="row" spacing={1} alignItems="center">
						<Typography variant="subtitle2" fontWeight={700} color="#0f172a">
							{comment.user_name}
						</Typography>
						{isDoctor && (
							<Chip
								icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#0d9488' }} />}
								label="Verified Medical Doctor"
								size="small"
								sx={{
									height: 20,
									fontSize: '0.7rem',
									fontWeight: 700,
									bgcolor: '#ccfbf1',
									color: '#0f766e',
									border: '1px solid rgba(45, 212, 191, 0.4)',
								}}
							/>
						)}
					</Stack>
					<Typography variant="caption" color="text.secondary">
						{new Date(comment.created_at).toLocaleDateString()}
					</Typography>
				</Box>
				<Button
					startIcon={<ReplyIcon />}
					size="small"
					onClick={() => onReplyTrigger(comment.id)}
					sx={{ textTransform: 'none', color: '#0d9488' }}
				>
					Reply
				</Button>
			</Stack>
			<Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.5, pl: 0.5 }}>
				{comment.content}
			</Typography>

			{/* Reply Form */}
			{isReplyFormOpen && (
				<Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #0d9488' }}>
					<TextField
						fullWidth
						multiline
						rows={2}
						size="small"
						placeholder={`Reply to ${comment.user_name}...`}
						value={replyContent}
						onChange={(e) => setReplyContent(e.target.value)}
						sx={{ bgcolor: 'white', borderRadius: 2 }}
					/>
					<Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
						<Button size="small" color="inherit" onClick={() => onReplyTrigger('')}>
							Cancel
						</Button>
						<Button
							size="small"
							variant="contained"
							onClick={() => onReplySubmit(comment.id)}
							sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
						>
							Submit
						</Button>
					</Stack>
				</Box>
			)}

			{/* Nested Replies */}
			{comment.replies && comment.replies.length > 0 && (
				<Box sx={{ pl: { xs: 2, sm: 4 }, mt: 2, borderLeft: '1px dashed #cbd5e1' }}>
					{comment.replies.map((reply) => (
						<CommentNode
							key={reply.id}
							comment={reply}
							onReplyTrigger={onReplyTrigger}
							activeReplyId={activeReplyId}
							replyContent={replyContent}
							setReplyContent={setReplyContent}
							onReplySubmit={onReplySubmit}
						/>
					))}
				</Box>
			)}
		</Paper>
	)
}

export default function BlogArticlePage() {
	const { slug } = useParams<{ slug: string }>()
	const navigate = useNavigate()
	const { accessToken } = useAuth()
	const [blog, setBlog] = useState<BlogPost | null>(null)
	const [comments, setComments] = useState<BlogComment[]>([])
	const [ads, setAds] = useState<AdPlacementConfig[]>([])
	const [loading, setLoading] = useState(true)
	const [commentText, setCommentText] = useState('')
	const [replyTargetId, setReplyTargetId] = useState<string | null>(null)
	const [replyText, setReplyText] = useState('')

	const fetchComments = async (blogSlug: string) => {
		try {
			const res = await getBlogComments(blogSlug)
			setComments(res.data)
		} catch (err) {
			console.error('Error fetching comments:', err)
		}
	}

	useEffect(() => {
		if (!slug) return
		const fetchData = async () => {
			setLoading(true)
			try {
				const blogRes = await getBlogPost(slug)
				setBlog(blogRes.data)

				// Fetch contextual ads matching this category
				const adsRes = await getActiveAds("/blogs/*", blogRes.data.category)
				setAds(adsRes.data)

				// Log impression metrics
				adsRes.data.forEach((ad) => {
					trackAdMetric(ad.ad.id, 'impression').catch(console.error)
				})

				await fetchComments(slug)
			} catch (err) {
				console.error('Error fetching article:', err)
				toast.error('Article not found')
				navigate('/blogs')
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [slug])

	const handleAdClick = (adId: string, url: string) => {
		trackAdMetric(adId, 'click').catch(console.error)
		if (url.startsWith('/')) {
			navigate(url)
		} else {
			window.open(url, '_blank')
		}
	}

	const handleCommentSubmit = async () => {
		if (!slug) return
		if (!commentText.trim()) {
			toast.warning('Please enter comment text')
			return
		}
		try {
			const res = await createBlogComment(slug, commentText)
			toast.success('Comment posted successfully!')
			setCommentText('')
			await fetchComments(slug)
		} catch (err) {
			console.error('Error posting comment:', err)
		}
	}

	const handleReplySubmit = async (parentId: string) => {
		if (!slug) return
		if (!replyText.trim()) {
			toast.warning('Please enter reply text')
			return
		}
		try {
			const res = await createBlogComment(slug, replyText, parentId)
			toast.success('Reply posted successfully!')
			setReplyText('')
			setReplyTargetId(null)
			await fetchComments(slug)
		} catch (err) {
			console.error('Error posting reply:', err)
		}
	}

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
				<CircularProgress sx={{ color: '#0d9488' }} />
			</Box>
		)
	}

	if (!blog) return null

	const rightSidebarAds = ads.filter((placement) => placement.placement_key === 'sidebar')

	return (
		<Box sx={{ minHeight: '100vh', py: 5, bgcolor: '#f8fafc' }}>
			<Container maxWidth="lg">
				{/* Back Button */}
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/blogs')}
					sx={{ mb: 4, textTransform: 'none', color: '#0f172a', fontWeight: 600 }}
				>
					Back to articles
				</Button>

				<Grid container spacing={4}>
					{/* Article Main Content */}
					<Grid size={{ xs: 12, lg: 8 }}>
						<Card sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', mb: 5 }}>
							<CardMedia
								component="img"
								height="380"
								image={blog.image_url || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800'}
								alt={blog.title}
							/>
							<CardContent sx={{ p: { xs: 3, md: 5 } }}>
								<Box sx={{ mb: 3 }}>
									<Chip
										label={blog.category}
										sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700, mb: 2 }}
									/>
									<Typography variant="h3" fontWeight={800} color="#0f172a" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem' }, lineHeight: 1.2, mb: 2.5 }}>
										{blog.title}
									</Typography>
									<Stack direction="row" spacing={3} sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
										<Stack direction="row" spacing={0.5} alignItems="center">
											<PersonIcon sx={{ fontSize: 16 }} />
											<Typography variant="body2" fontWeight={600}>
												{blog.author.name}
											</Typography>
										</Stack>
										<Stack direction="row" spacing={0.5} alignItems="center">
											<CalendarTodayIcon sx={{ fontSize: 14 }} />
											<Typography variant="body2">
												{new Date(blog.created_at).toLocaleDateString()}
											</Typography>
										</Stack>
									</Stack>
								</Box>

								<Divider sx={{ my: 3 }} />

								{/* Dynamic Paragraphs + In-Feed Ad Injections */}
								<Box className="article-body">
									{renderContentParagraphs(blog.content, ads, handleAdClick)}
								</Box>
							</CardContent>
						</Card>

						{/* Comments Header */}
						<Box sx={{ mb: 4 }}>
							<Typography variant="h5" fontWeight={800} color="#0f172a">
								Discussion & Comments
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Join the discussion. Patient comments are moderated to verify medical compliance.
							</Typography>
						</Box>

						{/* Add Comment Box */}
						{accessToken ? (
							<Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
								<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#0f172a' }}>
									Share your thoughts
								</Typography>
								<TextField
									fullWidth
									multiline
									rows={3}
									placeholder="Write your comment here..."
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
									sx={{ mb: 2 }}
								/>
								<Stack direction="row" justifyContent="flex-end">
									<Button
										variant="contained"
										endIcon={<SendIcon />}
										onClick={handleCommentSubmit}
										sx={{ bgcolor: '#0d9488', textTransform: 'none', borderRadius: 2.5, '&:hover': { bgcolor: '#0f766e' } }}
									>
										Post Comment
									</Button>
								</Stack>
							</Paper>
						) : (
							<Paper elevation={0} sx={{ p: 3, mb: 4, textAlign: 'center', bgcolor: '#f1f5f9', borderRadius: 2 }}>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
									You must be logged in to post or reply to comments.
								</Typography>
								<Button
									variant="outlined"
									onClick={() => navigate('/login')}
									sx={{ textTransform: 'none', color: '#0d9488', borderColor: '#0d9488' }}
								>
									Log In
								</Button>
							</Paper>
						)}

						{/* Comments List */}
						<Box>
							{comments.length === 0 ? (
								<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
									No comments yet. Be the first to comment!
								</Typography>
							) : (
								comments.map((comment) => (
									<CommentNode
										key={comment.id}
										comment={comment}
										onReplyTrigger={(id) => setReplyTargetId(id)}
										activeReplyId={replyTargetId}
										replyContent={replyText}
										setReplyContent={setReplyText}
										onReplySubmit={handleReplySubmit}
									/>
								))
							)}
						</Box>
					</Grid>

					{/* Right Sidebar Advertisements */}
					<Grid size={{ xs: 12, lg: 4 }}>
						<Box sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 4 }}>
							{rightSidebarAds.length > 0 ? (
								rightSidebarAds.map((placement) => (
									<Card
										key={placement.id}
										sx={{
											borderRadius: 2,
											overflow: 'hidden',
											boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
											border: '1px solid #cbd5e1',
											cursor: 'pointer',
											transition: 'transform 0.2s',
											'&:hover': { transform: 'scale(1.015)' },
										}}
										onClick={() => handleAdClick(placement.ad.id, placement.ad.target_url)}
									>
										<Box sx={{ position: 'relative' }}>
											<CardMedia
												component="img"
												image={placement.ad.image_url}
												alt={placement.ad.title}
												sx={{ height: 260 }}
											/>
											<Chip
												label="Sponsored"
												size="small"
												sx={{
													position: 'absolute',
													top: 12,
													right: 12,
													bgcolor: 'rgba(15, 23, 42, 0.75)',
													color: 'white',
													fontWeight: 700,
													fontSize: '0.65rem',
													backdropFilter: 'blur(4px)',
												}}
											/>
										</Box>
										<CardContent sx={{ p: 2.5, bgcolor: '#0f172a', color: 'white' }}>
											<Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, lineHeight: 1.2 }}>
												{placement.ad.title}
											</Typography>
											<Button
												variant="contained"
												fullWidth
												sx={{
													mt: 1,
													bgcolor: '#0d9488',
													textTransform: 'none',
													borderRadius: 2.5,
													'&:hover': { bgcolor: '#0f766e' },
												}}
											>
												Learn More
											</Button>
										</CardContent>
									</Card>
								))
							) : (
								<Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
									<Typography variant="body2" color="text.secondary">
										Health advertisements align with your interests.
									</Typography>
								</Paper>
							)}
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
