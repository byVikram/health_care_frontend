// src/features/portal/CommunityThreadPage.tsx
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

import {
	getCommunityPostDetails,
	getCommunityPostComments,
	createCommunityComment,
	CommunityPost,
	CommunityComment,
} from '../../services/communityService'
import { getActiveAds, trackAdMetric, AdPlacementConfig } from '../../services/adService'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'react-toastify'

const CommentNode = ({
	comment,
	onReplyTrigger,
	activeReplyId,
	replyContent,
	setReplyContent,
	onReplySubmit,
}: {
	comment: CommunityComment
	onReplyTrigger: (id: string) => void
	activeReplyId: string | null
	replyContent: string
	setReplyContent: (val: string) => void
	onReplySubmit: (parentId: string) => void
}) => {
	const isDoctor = comment.user_role === 'doctor'
	const isReplyFormOpen = activeReplyId === comment.id

	return (
		<Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
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
								label="Verified MD"
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

export default function CommunityThreadPage() {
	const { threadId } = useParams<{ threadId: string }>()
	const navigate = useNavigate()
	const { accessToken } = useAuth()
	const [post, setPost] = useState<CommunityPost | null>(null)
	const [comments, setComments] = useState<CommunityComment[]>([])
	const [ads, setAds] = useState<AdPlacementConfig[]>([])
	const [loading, setLoading] = useState(true)
	const [commentText, setCommentText] = useState('')
	const [replyTargetId, setReplyTargetId] = useState<string | null>(null)
	const [replyText, setReplyText] = useState('')

	const fetchComments = async (postId: string) => {
		try {
			const res = await getCommunityPostComments(postId)
			setComments(res.data)
		} catch (err) {
			console.error('Error fetching comments:', err)
		}
	}

	useEffect(() => {
		if (!threadId) return
		const fetchData = async () => {
			setLoading(true)
			try {
				const postRes = await getCommunityPostDetails(threadId)
				setPost(postRes.data)

				const adsRes = await getActiveAds(`/communities/threads/${threadId}`)
				setAds(adsRes.data)
				adsRes.data.forEach((p) => trackAdMetric(p.ad.id, 'impression').catch(console.error))

				await fetchComments(threadId)
			} catch (err) {
				console.error('Error fetching thread:', err)
				toast.error('Discussion thread not found')
				navigate('/communities')
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [threadId])

	const handleAdClick = (adId: string, url: string) => {
		trackAdMetric(adId, 'click').catch(console.error)
		if (url.startsWith('/')) {
			navigate(url)
		} else {
			window.open(url, '_blank')
		}
	}

	const handleCommentSubmit = async () => {
		if (!threadId) return
		if (!commentText.trim()) {
			toast.warning('Please enter your reply')
			return
		}
		try {
			await createCommunityComment(threadId, commentText)
			toast.success('Reply posted successfully!')
			setCommentText('')
			await fetchComments(threadId)
		} catch (err) {
			console.error('Error posting comment:', err)
		}
	}

	const handleReplySubmit = async (parentId: string) => {
		if (!threadId) return
		if (!replyText.trim()) {
			toast.warning('Please enter reply text')
			return
		}
		try {
			await createCommunityComment(threadId, replyText, parentId)
			toast.success('Reply posted successfully!')
			setReplyText('')
			setReplyTargetId(null)
			await fetchComments(threadId)
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

	if (!post) return null

	const sidebarAds = ads.filter((p) => p.placement_key === 'sidebar')

	return (
		<Box sx={{ minHeight: '100vh', py: 5, bgcolor: '#f8fafc' }}>
			<Container maxWidth="lg">
				{/* Back Button */}
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/communities')}
					sx={{ mb: 4, textTransform: 'none', color: '#0f172a', fontWeight: 600 }}
				>
					Back to discussions
				</Button>

				<Grid container spacing={4}>
					{/* Main Thread Content */}
					<Grid size={{ xs: 12, lg: 8 }}>
						<Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', mb: 5 }}>
							<CardContent sx={{ p: { xs: 3, md: 5 } }}>
								{/* Thread Header */}
								<Box sx={{ mb: 3 }}>
									<Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ lineHeight: 1.3, mb: 2 }}>
										{post.title}
									</Typography>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
										<Stack direction="row" spacing={0.5} alignItems="center">
											<PersonIcon sx={{ fontSize: 16 }} />
											<Typography variant="body2" fontWeight={600} color="#475569">
												{post.user_name}
											</Typography>
											{post.user_role === 'doctor' && (
												<VerifiedIcon sx={{ fontSize: 14, color: '#0d9488' }} />
											)}
										</Stack>
										<Stack direction="row" spacing={0.5} alignItems="center">
											<CalendarTodayIcon sx={{ fontSize: 14 }} />
											<Typography variant="body2">
												{new Date(post.created_at).toLocaleDateString()}
											</Typography>
										</Stack>
									</Stack>
								</Box>

								<Divider sx={{ my: 3 }} />

								{/* Thread Body */}
								<Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
									{post.content}
								</Typography>
							</CardContent>
						</Card>

						{/* Discussion Head */}
						<Box sx={{ mb: 4 }}>
							<Typography variant="h5" fontWeight={800} color="#0f172a">
								Replies
							</Typography>
						</Box>

						{/* Post Comment Box */}
						{accessToken ? (
							<Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
								<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#0f172a' }}>
									Join the discussion
								</Typography>
								<TextField
									fullWidth
									multiline
									rows={3}
									placeholder="Write your response here..."
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
										Post Reply
									</Button>
								</Stack>
							</Paper>
						) : (
							<Paper elevation={0} sx={{ p: 3, mb: 4, textAlign: 'center', bgcolor: '#f1f5f9', borderRadius: 4 }}>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
									You must be logged in to post responses.
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

						{/* Comments tree list */}
						<Box>
							{comments.length === 0 ? (
								<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
									No responses yet. Start the conversation!
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

					{/* Right Sidebar Ads */}
					<Grid size={{ xs: 12, lg: 4 }}>
						<Box sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 4 }}>
							{sidebarAds.map((placement) => (
								<Card
									key={placement.id}
									sx={{
										borderRadius: 4,
										overflow: 'hidden',
										boxShadow: 'none',
										border: '1px solid #cbd5e1',
										cursor: 'pointer',
										'&:hover': { transform: 'scale(1.015)' },
										transition: 'transform 0.15s',
									}}
									onClick={() => handleAdClick(placement.ad.id, placement.ad.target_url)}
								>
									<Box sx={{ position: 'relative' }}>
										<CardMedia component="img" image={placement.ad.image_url} alt={placement.ad.title} sx={{ height: 240 }} />
										<Chip
											label="Sponsored"
											size="small"
											sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.65rem' }}
										/>
									</Box>
									<CardContent sx={{ p: 2, bgcolor: '#0f172a', color: 'white' }}>
										<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
											{placement.ad.title}
										</Typography>
									</CardContent>
								</Card>
							))}
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
