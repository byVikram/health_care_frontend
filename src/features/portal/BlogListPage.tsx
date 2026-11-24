// src/features/portal/BlogListPage.tsx
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
	TextField,
	InputAdornment,
	Button,
	CircularProgress,
	Stack,
	Divider,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { listBlogs, BlogPost } from '../../services/blogService'
import { getActiveAds, trackAdMetric, AdPlacementConfig } from '../../services/adService'
import VoiceMicButton from '../../components/common/Voice/VoiceMicButton'

const CATEGORIES = ['All', 'Endocrinology', 'Oncology', 'Geriatrics', 'General']

export default function BlogListPage() {
	const navigate = useNavigate()
	const [blogs, setBlogs] = useState<BlogPost[]>([])
	const [ads, setAds] = useState<AdPlacementConfig[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedCategory, setSelectedCategory] = useState('All')
	const [searchQuery, setSearchQuery] = useState('')

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			try {
				const catFilter = selectedCategory === 'All' ? undefined : selectedCategory
				const blogsRes = await listBlogs(catFilter, 1, 20)
				setBlogs(blogsRes.data)

				const adsRes = await getActiveAds('/blogs')
				setAds(adsRes.data)

				// Track impressions for loaded ads
				adsRes.data.forEach((placement) => {
					trackAdMetric(placement.ad.id, 'impression').catch(console.error)
				})
			} catch (err) {
				console.error('Error fetching blog data:', err)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [selectedCategory])

	const filteredBlogs = blogs.filter((blog) =>
		blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		blog.content.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const handleAdClick = (adId: string, targetUrl: string) => {
		trackAdMetric(adId, 'click').catch(console.error)
		if (targetUrl.startsWith('/')) {
			navigate(targetUrl)
		} else {
			window.open(targetUrl, '_blank')
		}
	}

	return (
		<Box sx={{ minHeight: '100vh', py: 6, bgcolor: '#f8fafc' }}>
			<Container maxWidth="lg">
				{/* Header Section */}
				<Box sx={{ mb: 6, textAlign: 'center' }}>
					<Typography
						variant="h3"
						fontWeight={800}
						sx={{
							background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							letterSpacing: '-0.02em',
							mb: 1.5,
						}}
					>
						Health & Wellness Library
					</Typography>
					<Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
						Browse medical articles, health updates, and wellness guides reviewed by certified healthcare professionals.
					</Typography>
				</Box>

				{/* Search & Filter Bar */}
				<Grid container spacing={3} sx={{ mb: 5, alignItems: 'center' }}>
					<Grid size={{ xs: 12, md: 5 }}>
						<TextField
							fullWidth
							placeholder="Search health articles..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: '#0d9488' }} />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">
										<VoiceMicButton onResult={(text) => setSearchQuery(text)} />
									</InputAdornment>
								),
								sx: { borderRadius: '12px', bgcolor: 'white' },
							}}
							size="medium"
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 7 }}>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { md: 'flex-end' } }}>
							{CATEGORIES.map((cat) => (
								<Chip
									key={cat}
									label={cat}
									onClick={() => setSelectedCategory(cat)}
									sx={{
										fontSize: '0.85rem',
										fontWeight: 600,
										px: 1,
										py: 2,
										borderRadius: '10px',
										cursor: 'pointer',
										bgcolor: selectedCategory === cat ? '#0d9488' : 'white',
										color: selectedCategory === cat ? 'white' : '#475569',
										border: '1px solid',
										borderColor: selectedCategory === cat ? '#0d9488' : '#e2e8f0',
										transition: 'all 0.2s',
										'&:hover': {
											bgcolor: selectedCategory === cat ? '#0f766e' : '#f1f5f9',
											borderColor: selectedCategory === cat ? '#0f766e' : '#cbd5e1',
										},
									}}
								/>
							))}
						</Box>
					</Grid>
				</Grid>

				{/* Main Content Layout */}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
						<CircularProgress sx={{ color: '#0d9488' }} />
					</Box>
				) : (
					<Grid container spacing={4}>
						{/* Blogs Grid */}
						<Grid size={{ xs: 12, lg: 8 }}>
							{filteredBlogs.length === 0 ? (
								<Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
									<Typography variant="h6" color="text.secondary" fontWeight={600}>
										No health articles found
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
										Try searching with different keywords or choosing another category.
									</Typography>
								</Box>
							) : (
								<Grid container spacing={3}>
									{filteredBlogs.map((blog) => (
										<Grid size={{ xs: 12, sm: 6 }} key={blog.id}>
											<Card
												sx={{
													height: '100%',
													display: 'flex',
													flexDirection: 'column',
													borderRadius: 2,
													boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
													border: '1px solid #e2e8f0',
													transition: 'transform 0.2s, box-shadow 0.2s',
													cursor: 'pointer',
													'&:hover': {
														transform: 'translateY(-4px)',
														boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
													},
												}}
												onClick={() => navigate(`/blogs/${blog.slug}`)}
											>
												<CardMedia
													component="img"
													height="160"
													image={blog.image_url || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400'}
													alt={blog.title}
												/>
												<CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
													<Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
														<Chip
															label={blog.category}
															size="small"
															sx={{
																bgcolor: '#ccfbf1',
																color: '#0f766e',
																fontWeight: 600,
																fontSize: '0.75rem',
															}}
														/>
													</Box>
													<Typography variant="h6" fontWeight={700} sx={{ lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1, lineHeight: 1.3, color: '#0f172a' }}>
														{blog.title}
													</Typography>
													<Typography variant="body2" color="text.secondary" sx={{ lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2, fontSize: '0.875rem' }}>
														{blog.content.replace(/[#*`]/g, '')}
													</Typography>
													<Box sx={{ mt: 'auto' }}>
														<Divider sx={{ my: 1.5 }} />
														<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
															<Stack direction="row" spacing={0.5} alignItems="center">
																<PersonIcon sx={{ fontSize: 14 }} />
																<Typography variant="caption" fontWeight={500}>
																	{blog.author.name}
																</Typography>
															</Stack>
															<Stack direction="row" spacing={0.5} alignItems="center">
																<CalendarTodayIcon sx={{ fontSize: 12 }} />
																<Typography variant="caption">
																	{new Date(blog.created_at).toLocaleDateString()}
																</Typography>
															</Stack>
														</Stack>
													</Box>
												</CardContent>
											</Card>
										</Grid>
									))}
								</Grid>
							)}
						</Grid>

						{/* Sidebar / Advertisements Column */}
						<Grid size={{ xs: 12, lg: 4 }}>
							<Box sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 4 }}>
								{/* Sidebar Ads */}
								{ads.filter((placement) => placement.placement_key === 'sidebar').map((placement) => (
									<Card
										key={placement.id}
										sx={{
											borderRadius: 2,
											overflow: 'hidden',
											boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
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
												endIcon={<ArrowForwardIcon />}
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
								))}
							</Box>
						</Grid>
					</Grid>
				)}
			</Container>
		</Box>
	)
}
