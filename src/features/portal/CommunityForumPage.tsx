// src/features/portal/CommunityForumPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Box,
	Container,
	Typography,
	Grid,
	Card,
	CardContent,
	CardMedia,
	Chip,
	Button,
	CircularProgress,
	Stack,
	Divider,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import AddCommentIcon from '@mui/icons-material/AddComment'
import PushPinIcon from '@mui/icons-material/PushPin'
import VerifiedIcon from '@mui/icons-material/Verified'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'

import {
	listCommunityGroups,
	listCommunityPosts,
	createCommunityPost,
	CommunityGroup,
	CommunityPost,
} from '../../services/communityService'
import { getActiveAds, trackAdMetric, AdPlacementConfig } from '../../services/adService'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'react-toastify'

export default function CommunityForumPage() {
	const navigate = useNavigate()
	const { accessToken } = useAuth()
	const [groups, setGroups] = useState<CommunityGroup[]>([])
	const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
	const [posts, setPosts] = useState<CommunityPost[]>([])
	const [ads, setAds] = useState<AdPlacementConfig[]>([])
	const [loadingGroups, setLoadingGroups] = useState(true)
	const [loadingPosts, setLoadingPosts] = useState(false)
	const [dialogOpen, setDialogOpen] = useState(false)

	// New thread form state
	const [threadTitle, setThreadTitle] = useState('')
	const [threadContent, setThreadContent] = useState('')

	useEffect(() => {
		const fetchGroups = async () => {
			setLoadingGroups(true)
			try {
				const res = await listCommunityGroups()
				setGroups(res.data)
				if (res.data.length > 0) {
					setActiveGroupId(res.data[0].id)
				}
				const adsRes = await getActiveAds('/communities')
				setAds(adsRes.data)
				adsRes.data.forEach((p) => trackAdMetric(p.ad.id, 'impression').catch(console.error))
			} catch (err) {
				console.error('Error fetching community groups:', err)
			} finally {
				setLoadingGroups(false)
			}
		}
		fetchGroups()
	}, [])

	useEffect(() => {
		if (!activeGroupId) return
		const fetchPosts = async () => {
			setLoadingPosts(true)
			try {
				const res = await listCommunityPosts(activeGroupId)
				setPosts(res.data)
			} catch (err) {
				console.error('Error fetching group posts:', err)
			} finally {
				setLoadingPosts(false)
			}
		}
		fetchPosts()
	}, [activeGroupId])

	const handleCreateThread = async () => {
		if (!activeGroupId) return
		if (!threadTitle.trim() || !threadContent.trim()) {
			toast.warning('Please complete all fields')
			return
		}
		try {
			await createCommunityPost(activeGroupId, threadTitle, threadContent)
			toast.success('Discussion thread created successfully!')
			setThreadTitle('')
			setThreadContent('')
			setDialogOpen(false)
			// Reload posts
			const res = await listCommunityPosts(activeGroupId)
			setPosts(res.data)
		} catch (err) {
			console.error('Error creating post:', err)
		}
	}

	const handleAdClick = (adId: string, url: string) => {
		trackAdMetric(adId, 'click').catch(console.error)
		if (url.startsWith('/')) {
			navigate(url)
		} else {
			window.open(url, '_blank')
		}
	}

	if (loadingGroups) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
				<CircularProgress sx={{ color: '#0d9488' }} />
			</Box>
		)
	}

	const activeGroup = groups.find((g) => g.id === activeGroupId)

	return (
		<Box sx={{ minHeight: '100vh', py: 5, bgcolor: '#f8fafc' }}>
			<Container maxWidth="lg">
				{/* Welcome Header */}
				<Box sx={{ mb: 5, textAlign: 'left' }}>
					<Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
						Community Support Forums
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
						Share insights, find encouragement, and connect with patient support groups and verified medical professionals.
					</Typography>
				</Box>

				<Grid container spacing={4}>
					{/* Left Sidebar: Groups list */}
					<Grid size={{ xs: 12, md: 4, lg: 3 }}>
						<Typography variant="subtitle2" fontWeight={700} color="#475569" sx={{ mb: 2, px: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
							Support Networks
						</Typography>
						<Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', overflow: 'hidden' }}>
							<List sx={{ p: 0 }}>
								{groups.map((group) => {
									const isActive = group.id === activeGroupId
									return (
										<ListItemButton
											key={group.id}
											selected={isActive}
											onClick={() => setActiveGroupId(group.id)}
											sx={{
												py: 2,
												px: 2.5,
												borderLeft: isActive ? '4px solid #0d9488' : '4px solid transparent',
												bgcolor: isActive ? 'rgba(13, 148, 136, 0.05) !important' : 'transparent',
												'&:hover': { bgcolor: 'rgba(13, 148, 136, 0.02)' },
											}}
										>
											<ListItemIcon sx={{ color: isActive ? '#0d9488' : '#64748b', minWidth: 36 }}>
												<GroupIcon fontSize="small" />
											</ListItemIcon>
											<ListItemText
												primary={group.name}
												primaryTypographyProps={{
													fontSize: '13.5px',
													fontWeight: isActive ? 700 : 500,
													color: isActive ? '#0f766e' : '#334155',
												}}
											/>
										</ListItemButton>
									)
								})}
							</List>
						</Card>
					</Grid>

					{/* Center Section: Discussion Threads */}
					<Grid size={{ xs: 12, md: 8, lg: 6 }}>
						{activeGroup && (
							<Box sx={{ mb: 4, p: 3, bgcolor: 'white', borderRadius: 4, border: '1px solid #e2e8f0' }}>
								<Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
									<Box>
										<Chip
											label={activeGroup.category}
											size="small"
											sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, mb: 1, fontSize: '0.7rem' }}
										/>
										<Typography variant="h5" fontWeight={800} color="#0f172a">
											{activeGroup.name}
										</Typography>
									</Box>
									{accessToken ? (
										<Button
											variant="contained"
											startIcon={<AddCommentIcon />}
											onClick={() => setDialogOpen(true)}
											sx={{ bgcolor: '#0d9488', textTransform: 'none', borderRadius: 2.5, '&:hover': { bgcolor: '#0f766e' } }}
										>
											New Thread
										</Button>
									) : (
										<Button
											variant="outlined"
											onClick={() => navigate('/login')}
											sx={{ textTransform: 'none', color: '#0d9488', borderColor: '#0d9488' }}
										>
											Login to Post
										</Button>
									)}
								</Stack>
								<Typography variant="body2" color="text.secondary">
									{activeGroup.description}
								</Typography>
							</Box>
						)}

						{/* Threads list */}
						{loadingPosts ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
								<CircularProgress sx={{ color: '#0d9488' }} />
							</Box>
						) : posts.length === 0 ? (
							<Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: 4, border: '1px solid #e2e8f0' }}>
								<Typography variant="body1" color="text.secondary" fontWeight={600}>
									No discussions started yet
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
									Be the first to create a discussion thread in this support group!
								</Typography>
							</Box>
						) : (
							<Stack spacing={2.5}>
								{posts.map((post) => {
									const isDoctor = post.user_role === 'doctor'
									return (
										<Card
											key={post.id}
											onClick={() => navigate(`/communities/threads/${post.id}`)}
											sx={{
												borderRadius: 4,
												border: '1px solid #e2e8f0',
												boxShadow: '0 4px 15px rgba(15, 23, 42, 0.02)',
												cursor: 'pointer',
												transition: 'transform 0.15s, box-shadow 0.15s',
												'&:hover': {
													transform: 'translateY(-2px)',
													boxShadow: '0 8px 25px rgba(15, 23, 42, 0.05)',
												},
											}}
										>
											<CardContent sx={{ p: 3 }}>
												<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
													{post.is_pinned && <PushPinIcon sx={{ color: '#ef4444', fontSize: 16 }} />}
													<Typography variant="caption" color="text.secondary">
														Posted on {new Date(post.created_at).toLocaleDateString()} by
													</Typography>
													<Typography variant="caption" fontWeight={700} color="#0f172a">
														{post.user_name}
													</Typography>
													{isDoctor && (
														<VerifiedIcon sx={{ fontSize: 13, color: '#0d9488' }} />
													)}
												</Stack>
												<Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ mb: 1, lineHeight: 1.3 }}>
													{post.title}
												</Typography>
												<Typography variant="body2" color="text.secondary" sx={{ lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2 }}>
													{post.content}
												</Typography>
												<Divider sx={{ my: 1.5 }} />
												<Stack direction="row" spacing={2} sx={{ color: '#0d9488', fontSize: '0.85rem' }}>
													<Stack direction="row" spacing={0.5} alignItems="center">
														<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
														<Typography variant="caption" fontWeight={600}>
															Join Discussion
														</Typography>
													</Stack>
												</Stack>
											</CardContent>
										</Card>
									)
								})}
							</Stack>
						)}
					</Grid>

					{/* Right Sidebar: Active Sponsor Ads */}
					<Grid size={{ xs: 12, md: 12, lg: 3 }}>
						<Typography variant="subtitle2" fontWeight={700} color="#475569" sx={{ mb: 2, px: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
							Sponsor Spotlights
						</Typography>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
							{ads.filter((p) => p.placement_key === 'sidebar').map((placement) => (
								<Card
									key={placement.id}
									sx={{
										borderRadius: 3,
										overflow: 'hidden',
										boxShadow: 'none',
										border: '1px solid #cbd5e1',
										cursor: 'pointer',
										'&:hover': { transform: 'scale(1.005)' },
										transition: 'transform 0.15s',
									}}
									onClick={() => handleAdClick(placement.ad.id, placement.ad.target_url)}
								>
									<Box sx={{ position: 'relative' }}>
										<CardMedia component="img" image={placement.ad.image_url} alt={placement.ad.title} sx={{ height: 180 }} />
										<Chip
											label="Sponsored"
											size="small"
											sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.6rem' }}
										/>
									</Box>
									<CardContent sx={{ p: 2, bgcolor: '#0f172a', color: 'white' }}>
										<Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
											{placement.ad.title}
										</Typography>
									</CardContent>
								</Card>
							))}

							{/* Static Hospital Help Center */}
							<Card sx={{ p: 2.5, bgcolor: '#e2e8f0', borderRadius: 3, boxShadow: 'none', border: '1px solid #cbd5e1' }}>
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, color: '#0f766e' }}>
									<MedicalServicesIcon sx={{ fontSize: 18 }} />
									<Typography variant="subtitle2" fontWeight={700}>
										Medical Advice Warning
									</Typography>
								</Stack>
								<Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
									Discussion boards are for peer support. Consult a verified physician or use the portal chat assistant for diagnostic queries.
								</Typography>
							</Card>
						</Box>
					</Grid>
				</Grid>
			</Container>

			{/* Create Thread Modal */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Start a New Discussion</DialogTitle>
				<DialogContent>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Ask a question, post a health experience, or seek advice from support group peers.
					</Typography>
					<TextField
						fullWidth
						label="Title"
						placeholder="E.g., Tips for managing diabetic glucose spikes after meals"
						value={threadTitle}
						onChange={(e) => setThreadTitle(e.target.value)}
						sx={{ mb: 3 }}
					/>
					<TextField
						fullWidth
						multiline
						rows={5}
						label="Content"
						placeholder="Provide details about your query or experience..."
						value={threadContent}
						onChange={(e) => setThreadContent(e.target.value)}
					/>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						onClick={handleCreateThread}
						sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
					>
						Publish Post
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
