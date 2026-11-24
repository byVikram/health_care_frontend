// src/features/dashboard/CommunityBlogsSection.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, Skeleton } from '@mui/material'
import AppButton from '../../../components/common/Button/AppButton'
import DashboardEmptyState from '../components/DashboardEmptyState'
import groupImage from '../../../assets/blog-and-community/community-1.svg'

import { listBlogs, BlogPost } from '../../../services/blogService'
import { listCommunityGroups, CommunityGroup } from '../../../services/communityService'

interface CommunityBlogsProps {
	variant?: string
}

export default function CommunityBlogsSection({ variant = 'row' }: CommunityBlogsProps) {
	const navigate = useNavigate()
	const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([])
	const [featuredCommunities, setFeaturedCommunities] = useState<CommunityGroup[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let active = true
		const load = async () => {
			setLoading(true)
			try {
				// Blogs: all published posts, featured first (the backend orders featured
				// before the rest, newest first). Communities: featured only.
				const [blogsRes, groupsRes] = await Promise.all([
					listBlogs(undefined, 1, 6, undefined, 'blog'),
					listCommunityGroups(true, { limit: 4 }),
				])
				if (!active) return
				setFeaturedBlogs(blogsRes.data)
				setFeaturedCommunities(groupsRes.data)
			} catch {
				// ApiService's shared axios interceptor already shows the error toast
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [])

	return (
		<Box>
			<Typography
				variant={'h3'}
				align={variant === 'column' ? 'left' : 'center'}
				mb={variant === 'column' ? 2 : 3}
				fontWeight={500}
				fontSize={variant === 'column' ? '16px' : '1.5rem'}
			>
				Community & Blogs
			</Typography>

			<Grid container spacing={3} alignItems="stretch">
				{/* Left: Community List */}
				<Grid container size={{ xs: 12, md: variant === 'column' ? 12 : 4 }} spacing={2}>
					<Grid container size={{ xs: 12 }} spacing={2}>
						{loading ? (
							Array.from({ length: 3 }).map((_, i) => (
								<Grid key={i} sx={{ width: '100%' }}>
									<Skeleton variant="rounded" height={72} />
								</Grid>
							))
						) : featuredCommunities.length === 0 ? (
							<DashboardEmptyState message="No featured networks configured." />
						) : (
							featuredCommunities.map((c) => (
								<Grid
									key={c.id}
									onClick={() => navigate(`/communities`)}
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 2,
										borderRadius: '12px',
										px: 2,
										py: 1.6,
										cursor: 'pointer',
										bgcolor: '#fff',
										height: 'fit-content',
										width: '100%',
										boxShadow: '0px 0px 9.65px 0px #00000029',
										transition: '0.2s',
										'&:hover': { transform: 'scale(1.01)' },
									}}
								>
									<Box
										component="img"
										src={groupImage}
										alt={c.name}
										sx={{
											width: 52,
											height: 52,
											borderRadius: '50%',
											objectFit: 'cover',
											flexShrink: 0,
										}}
									/>
									<Box sx={{ flex: 1 }}>
										<Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary' }}>
											{c.name}
										</Typography>
										<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
											{c.category} Forum
										</Typography>
									</Box>
									<AppButton
										variant="outlined"
										label="Join"
										borderRadius="30px"
										sx={{
											fontSize: '10px',
											px: 2,
											py: 0.6,
											fontWeight: '600',
											border: '0px',
											bgcolor: '#EDF1F1',
											color: 'text.primary',
											whiteSpace: 'nowrap',
										}}
									/>
								</Grid>
							))
						)}
					</Grid>
				</Grid>

				{/* Right: Blog Cards */}
				<Grid size={{ xs: 12, md: variant === 'column' ? 12 : 8 }}>
					<Grid container spacing={2}>
						{loading ? (
							Array.from({ length: 2 }).map((_, i) => (
								<Grid key={i} size={{ xs: 12, sm: 6 }}>
									<Skeleton variant="rounded" height={variant === 'column' ? 140 : 380} />
								</Grid>
							))
						) : featuredBlogs.length === 0 ? (
							<DashboardEmptyState message="No blog posts published yet." py={5} />
						) : (
							featuredBlogs.map((blog) => (
								<Grid
									key={blog.id}
									size={{ xs: 12, sm: 6 }}
									sx={{ display: 'flex' }}
								>
									<Box
										onClick={() => navigate(`/blogs/${blog.slug}`)}
										sx={{
											display: 'flex',
											flexDirection: 'column',
											flex: 1,
											bgcolor: '#fff',
											borderRadius: '6px',
											overflow: 'hidden',
											height: variant === 'column' ? '320px' : '380px',
											cursor: 'pointer',
											boxShadow: '0px 0px 9.65px 0px rgba(0,0,0,0.05)',
											'&:hover': { transform: 'scale(1.005)' },
											transition: 'transform 0.15s',
										}}
									>
										{/* Image */}
										<Box
											component="img"
											src={blog.image_url || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400'}
											alt={blog.title}
											sx={{
												width: '100%',
												objectFit: 'cover',
												height: variant === 'column' ? '140px' : '40%',
											}}
										/>

										{/* Content */}
										<Box
											sx={{
												p: 1.5,
												display: 'flex',
												flexDirection: 'column',
												gap: 1,
												flex: 1,
											}}
										>
											<Typography
												variant="body1"
												fontWeight={600}
												sx={{
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													minHeight: '48px',
												}}
											>
												{blog.title}
											</Typography>
											<Typography
												variant="body2"
												sx={{
													fontSize: '12px',
													display: '-webkit-box',
													WebkitLineClamp: variant === 'column' ? 2 : 5,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													flex: 1,
													lineHeight: 1.2,
												}}
											>
												{(blog.content ?? '').replace(/[#*`]/g, '')}
											</Typography>
											<Typography variant="body1" color="neutral.main">
												Read More
											</Typography>
											<Box
												sx={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
													mt: 'auto',
												}}
											>
												<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
													By {blog.author?.name ?? 'Unknown'}
												</Typography>
												<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
													{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : ''}
												</Typography>
											</Box>
										</Box>
									</Box>
								</Grid>
							))
						)}
					</Grid>
				</Grid>
			</Grid>
		</Box>
	)
}
