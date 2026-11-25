// src/features/dashboard/sections/CommunityBlogsSection.tsx
//
// "Community & Blogs" on the portal home: featured communities (with Join) next to a scrolling row of the same blog
// cards the Health reads page (/blogs?type=blog) uses.
import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Grid, Skeleton, Typography } from '@mui/material'
import AppButton from '../../../components/common/Button/AppButton'
import DeskButton from '../../../components/common/Button/DeskButton'
import { useLoginPrompt } from '../../../components/common/AuthModal/useLoginPrompt'
import DashboardEmptyState from '../components/DashboardEmptyState'
import { DESK } from '../../../styles/deskTokens'
import { ROUTES } from '../../../constants/routes'
import { listBlogs, type BlogPost } from '../../../services/blogService'
import { listCommunityGroups, type CommunityGroup } from '../../../services/communityService'
import { ReadCard } from '../../portal/BlogListPage'
import { TONES, focusSx, initials, topicStyle, useGroupJoin } from '../../portal/readsHelpers'

interface CommunityBlogsProps {
	variant?: string
}

const CARD_WIDTH = 300

export default function CommunityBlogsSection({ variant = 'row' }: CommunityBlogsProps) {
	const stacked = variant === 'column'
	const navigate = useNavigate()
	const [blogs, setBlogs] = useState<BlogPost[]>([])
	const [groups, setGroups] = useState<CommunityGroup[]>([])
	const login = useLoginPrompt('Login to join a community')
	const { toggle: toggleJoin, busy: joinBusy } = useGroupJoin(login.prompt)
	const [loading, setLoading] = useState(true)
	const trackRef = useRef<HTMLDivElement>(null)
	const [atEnd, setAtEnd] = useState(false)

	useEffect(() => {
		let active = true
		const load = async () => {
			setLoading(true)
			try {
				// Blogs: only featured posts of type "blog", newest first. Communities: featured only.
				const [blogsRes, groupsRes] = await Promise.all([
					listBlogs(undefined, 1, 6, true, 'blog'),
					listCommunityGroups(true, { limit: 4 }),
				])
				if (!active) return
				setBlogs(blogsRes.data)
				setGroups(groupsRes.data)
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

	const updateEnd = () => {
		const el = trackRef.current
		if (el) setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
	}

	useEffect(() => {
		updateEnd()
	}, [blogs, loading])

	const scrollNext = () => {
		const el = trackRef.current
		if (!el) return
		if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
		else el.scrollBy({ left: CARD_WIDTH + 16, behavior: 'smooth' })
	}

	const setJoined = (id: string, isJoined: boolean) =>
		setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, is_joined: isJoined } : g)))


	return (
		<Box>
			{login.modal}
			<Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: stacked ? 'space-between' : 'center', mb: stacked ? 2 : 3 }}>
				<Typography component="h3" sx={{ fontWeight: 800, fontSize: stacked ? 18 : 28, color: DESK.ink }}>
					Community & Blogs
				</Typography>
				{/* The one "View All" for the whole section */}
				<Grid size={{ xs: 12, md: 2 }} sx={stacked ? { minWidth: 110 } : { position: 'absolute', right: 0, width: { xs: 'auto', md: `${(2 / 12) * 100}%` }, minWidth: { xs: 110, md: 0 } }}>
					<AppButton
						fullWidth
						variant="outlined"
						label="View All"
						borderRadius="30px"
						sx={{ mt: { xs: 2, md: 0 } }}
						onClick={() => navigate(`${ROUTES.BLOGS.LIST}?type=blog`)}
					/>
				</Grid>
			</Box>
			

			<Box sx={{ display: 'grid', gridTemplateColumns: stacked ? 'minmax(0, 1fr)' : { xs: 'minmax(0, 1fr)', md: '380px minmax(0, 1fr)' }, gap: '28px', alignItems: 'stretch' }}>
				{/* Communities */}
				<Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
						{loading ? (
							Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rounded" height={84} />)
						) : groups.length === 0 ? (
							<DashboardEmptyState message="No featured networks configured." />
						) : (
							groups.map((g) => {
								const { tone } = topicStyle(g.category || g.name)
								const [bg, ink] = TONES[tone]
								const isJoined = !!g.is_joined
								return (
									<Box key={g.id} sx={{ display: 'flex', alignItems: 'center', gap: '16px', bgcolor: '#fff', borderRadius: '14px', p: '16px 20px', flex: stacked ? 'none' : 1, boxShadow: '0 1px 4px #12373E14' }}>
										<Box
											component={RouterLink}
											to={ROUTES.COMMUNITIES.LIST}
											sx={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0, color: 'inherit', textDecoration: 'none', ...focusSx }}
										>
											<Box aria-hidden="true" sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: bg, color: ink, fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
												{initials(g.name)}
											</Box>
											<Box sx={{ minWidth: 0 }}>
												<Box sx={{ fontSize: 15, fontWeight: 700, color: DESK.ink, lineHeight: '19px' }}>{g.name}</Box>
												<Box sx={{ fontSize: 13, color: DESK.muted }}>{g.category} Forum</Box>
											</Box>
										</Box>
										<DeskButton label={isJoined ? 'Joined' : 'Join'} kind={isJoined ? 'secondary' : 'primary'} size="md" fullWidth={false} disabled={joinBusy} onClick={() => void toggleJoin(g.id, isJoined, (j) => setJoined(g.id, j))} />
									</Box>
								)
							})
						)}
					</Box>
				</Box>

				{/* Featured blogs */}
				<Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
					{loading ? (
						<Skeleton variant="rounded" height={300} />
					) : blogs.length === 0 ? (
						<DashboardEmptyState message="No featured blogs yet." py={5} />
					) : (
						<Box sx={{ position: 'relative', flex: 1, display: 'flex', minHeight: 0 }}>
							<Box
								ref={trackRef}
								onScroll={updateEnd}
								sx={{ display: 'flex', flex: 1, minWidth: 0, gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
							>
								{blogs.map((b) => (
									<Box key={b.id} sx={{ flex: `0 0 ${CARD_WIDTH}px`, scrollSnapAlign: 'start', display: 'flex', '& > *': { flex: 1 }, '& > a > div:first-of-type': { flex: 1, display: 'flex' }, '& > a > div:first-of-type > div': { height: '100% !important', flex: 1 } }}>
										<ReadCard post={b} />
									</Box>
								))}
							</Box>
							{blogs.length > 1 && (
								<Box
									component="button"
									type="button"
									aria-label={atEnd ? 'Back to first blog' : 'Next blogs'}
									onClick={scrollNext}
									sx={{ position: 'absolute', right: 8, top: '40%', width: 42, height: 42, borderRadius: '50%', border: 0, bgcolor: '#fff', color: DESK.ink, fontSize: 24, lineHeight: 1, cursor: 'pointer', boxShadow: '0 2px 10px #12373E33', ...focusSx }}
								>
									{atEnd ? '‹' : '›'}
								</Box>
							)}
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	)
}
