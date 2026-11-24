// src/features/portal/BlogListPage.tsx
//
// Desktop "Health reads" (design: Desktop · 5). Articles, blogs and podcasts from GET /api/blogs?content_type=..., with the
// search, topic chips and paging done by the server (the page is in the URL as ?page=); only the editor's pick is a separate call.
import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { DESK } from '../../styles/deskTokens'
import { ROUTES } from '../../constants/routes'
import { listBlogCategories, listBlogs, type BlogContentType, type BlogPost } from '../../services/blogService'
import { listCommunityGroups, type CommunityGroup } from '../../services/communityService'
import { AdSlot, Chip, Column, EmptyBox, Hero, MiniRow, Pager, PromoCard, ReadsPage, ReadsSubNav, SearchPill, SideCard, Spinner, Svg } from './readsKit'
import { TONES, authorOf, cardSx, excerpt, focusSx, hoverCardSx, initials, outlineBtnSx, readMeta, topicStyle, useAds, useUrlPage } from './readsHelpers'
import VoiceMicButton from '../../components/common/Voice/VoiceMicButton'

const PER_PAGE = 6
const POPULAR = ['diabetes', 'BP', 'sleep', 'PCOS']
const ALL_TOPICS = 'All topics'

const asType = (v: string | null): BlogContentType => (v === 'blog' || v === 'podcast' ? v : 'article')

export default function BlogListPage() {
	const [params, setParams] = useSearchParams()
	const type = asType(params.get('type'))
	// The topic lives in the URL (?topic=Coronavirus) so it can be shared, bookmarked and used with the back button.
	const topic = params.get('topic') || ALL_TOPICS
	const setTopic = (t: string) =>
		setParams((prev) => {
			const p = new URLSearchParams(prev)
			if (t === ALL_TOPICS) p.delete('topic')
			else p.set('topic', t)
			p.delete('page')
			return p
		})
	const [posts, setPosts] = useState<BlogPost[]>([])
	// The editor's pick is kept out of the paged list, so every page is a full grid of PER_PAGE cards.
	const [editorPick, setEditorPick] = useState<BlogPost | null>(null)
	const [pickReady, setPickReady] = useState(false)
	const [pages, setPages] = useState(1)
	const [categories, setCategories] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [failed, setFailed] = useState(false)
	const [reloadKey, setReloadKey] = useState(0)
	const [groups, setGroups] = useState<CommunityGroup[]>([])
	const [q, setQ] = useState('')
	const [needle, setNeedle] = useState('')
	const [page, setPage] = useUrlPage()
	const needleRef = useRef('')
	const ads = useAds('/blogs')

	// Switching Articles / Blogs / Podcasts clears the filters in the same render, so the posts are fetched once, not twice.
	// (The sub-nav links carry no ?page=, so the page goes back to 1 with the URL.)
	const [prevType, setPrevType] = useState(type)
	if (type !== prevType) {
		setPrevType(type)
		setEditorPick(null)
		setPickReady(false)
		setQ('')
		setNeedle('')
		needleRef.current = ''
	}

	// The search text goes to the server a moment after typing stops; the page only resets when the search really changed.
	useEffect(() => {
		const t = setTimeout(() => {
			const v = q.trim()
			if (v === needleRef.current) return
			needleRef.current = v
			setNeedle(v)
			setPage(1)
		}, 350)
		return () => clearTimeout(t)
	}, [q, setPage])

	// Topic chips: the categories that have published posts of this type, from the server.
	useEffect(() => {
		let active = true
		const load = async () => {
			try {
				const cats = await listBlogCategories(type)
				if (active) setCategories(cats)
			} catch {
				if (active) setCategories([])
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [type])

	// The editor's pick: the newest featured post of this type.
	useEffect(() => {
		let active = true
		const load = async () => {
			try {
				const res = await listBlogs(undefined, 1, 1, true, type)
				if (active) setEditorPick(res.data[0] ?? null)
			} catch {
				if (active) setEditorPick(null)
			} finally {
				if (active) setPickReady(true)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [type])

	const unfiltered = topic === ALL_TOPICS && !needle
	const excludeId = unfiltered ? editorPick?.id : undefined

	// One page of published posts, filtered and searched by the server (featured first, then newest).
	useEffect(() => {
		if (!pickReady) {
			setLoading(true)
			return
		}
		let active = true
		const load = async () => {
			setLoading(true)
			setFailed(false)
			try {
				const res = await listBlogs(topic === ALL_TOPICS ? undefined : topic, page, PER_PAGE, undefined, type, undefined, needle, excludeId)
				if (!active) return
				const lastPage = Math.max(1, res.meta.pages)
				// A link to a page that no longer exists (?page=99) falls back to the last real page.
				if (page > lastPage) {
					setPage(lastPage)
					return
				}
				setPosts(res.data)
				setPages(lastPage)
			} catch {
				if (active) {
					setPosts([])
					setPages(1)
					setFailed(true)
				}
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [type, topic, needle, page, reloadKey, pickReady, excludeId, setPage])

	useEffect(() => {
		let active = true
		const load = async () => {
			try {
				const res = await listCommunityGroups(undefined, { limit: 2 })
				if (active) setGroups(res.data)
			} catch {
				// the side card just stays empty
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [])

	const topics = [ALL_TOPICS, ...categories]

	// Shown above the grid on the unfiltered first page only.
	const pick = page === 1 && unfiltered ? (editorPick ?? undefined) : undefined
	const shown = posts
	const cur = page
	const mostRead = posts.slice(0, 3)

	const reset = () => {
		setTopic(ALL_TOPICS)
		setQ('')
		setNeedle('')
		needleRef.current = ''
		setPage(1)
	}

	const sidebarAd = ads.find((a) => a.placement_key === 'sidebar')

	return (
		<ReadsPage>
			<ReadsSubNav active={type} />
			<Hero
				eyebrow="HEALTH READS"
				title="Read up, from doctors you can trust"
				subtitle="Articles, blogs and podcasts written and reviewed by verified doctors."
				crumbs={[{ label: 'Health reads' }]}
			>
				<SearchPill
					value={q}
					onChange={(v) => {
						setQ(v)
						setPage(1)
					}}
					placeholder="Search “diabetes diet”, “BP at home”, “sleep”…"
					label="Search health reads"
				/>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 13, color: DESK.muted, flexWrap: 'wrap' }}>
					Popular:
					{POPULAR.map((p) => (
						<Box
							key={p}
							component="button"
							type="button"
							onClick={() => {
								setQ(p)
								setPage(1)
							}}
							sx={{ height: 30, px: '12px', borderRadius: '9999px', border: `1px solid ${DESK.lineStrong}`, bgcolor: '#fff', color: DESK.ink, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', ...focusSx }}
						>
							{p}
						</Box>
					))}
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

					{loading ? (
						<Spinner />
					) : failed ? (
						<EmptyBox title="We couldn’t load the reads" text="Check your connection and try again." action={<Box component="button" type="button" onClick={() => setReloadKey((k) => k + 1)} sx={{ ...outlineBtnSx, borderColor: DESK.primary, color: DESK.primary }}>Retry</Box>} />
					) : (
						<>
							{pick && <EditorsPick post={pick} />}
							<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
								{shown.map((p) => (
									<ReadCard key={p.id} post={p} />
								))}
							</Box>
							{posts.length === 0 && (
								<EmptyBox
									title="Nothing here yet for this topic"
									text="Try another topic, or ask a doctor directly."
									action={
										<Box component="button" type="button" onClick={reset} sx={{ ...outlineBtnSx, borderColor: DESK.primary, color: DESK.primary }}>
											Show all reads
										</Box>
									}
								/>
							)}
							<Pager page={cur} pages={pages} onChange={setPage} />
						</>
					)}
				</Box>

				<Box component="aside" sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: '16px' }}>
					<AdSlot placement={sidebarAd} />
					{mostRead.length > 0 && (
						<SideCard title="Most read this week" subtitle="What people are reading on KarolaHealth">
							<Box sx={{ display: 'flex', flexDirection: 'column' }}>
								{mostRead.map((p) => (
									<MiniRow key={p.id} to={`/blogs/${p.slug}`} topic={p.category} contentType={p.content_type} title={p.title} meta={readMeta(p)} />
								))}
							</Box>
						</SideCard>
					)}
					<PromoCard to={ROUTES.PUBLIC.HEALTH_QUESTIONS} title="Didn’t find your answer?" text="Ask a verified doctor, free. Only your age and gender are shown." cta="Ask a doctor" />
					{groups.length > 0 && (
						<SideCard title="Join a community" subtitle="Talk to people going through the same thing">
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
								{groups.map((g) => (
									<MiniRow key={g.id} to={ROUTES.COMMUNITIES.LIST} topic={g.category || g.name} title={g.name} meta={g.member_count ? `${g.member_count.toLocaleString('en-IN')} members` : g.category} size={40} />
								))}
							</Box>
							<Box component={RouterLink} to={ROUTES.COMMUNITIES.LIST} sx={{ fontSize: 14, fontWeight: 800, color: DESK.primary, textDecoration: 'none' }}>
								All communities ›
							</Box>
						</SideCard>
					)}
				</Box>
			</Column>
		</ReadsPage>
	)
}

/** The cover of a card: the post's picture when it has one, otherwise the tinted tile with the topic icon. */
function Cover({ post, height, iconSize }: { post: BlogPost; height: number | string; iconSize: number }) {
	const { tone, icon } = topicStyle(post.category, post.content_type)
	const [bg, ink] = TONES[tone]
	return (
		<Box aria-hidden="true" sx={{ position: 'relative', overflow: 'hidden', height, minHeight: typeof height === 'number' ? height : undefined, bgcolor: bg, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			{post.image_url ? (
				<Box component="img" src={post.image_url} alt="" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
			) : (
				<>
					<Box sx={{ position: 'absolute', right: -30, top: -40, width: 120, height: 120, borderRadius: '9999px', bgcolor: '#FFFFFF66' }} />
					<Box sx={{ position: 'relative', display: 'flex' }}>
						<Svg name={icon} size={iconSize} stroke={1.4} />
					</Box>
				</>
			)}
		</Box>
	)
}

function ReadCard({ post }: { post: BlogPost }) {
	const { tone } = topicStyle(post.category, post.content_type)
	const ink = TONES[tone][1]
	return (
		<Box component={RouterLink} to={`/blogs/${post.slug}`} sx={{ ...cardSx, ...hoverCardSx, borderRadius: '18px', overflow: 'hidden', color: DESK.ink, textDecoration: 'none', display: 'flex', flexDirection: 'column', ...focusSx }}>
			<Box sx={{ position: 'relative' }}>
				<Cover post={post} height={120} iconSize={48} />
			</Box>
			<Box sx={{ p: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
				<Box sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: ink, textTransform: 'uppercase' }}>{post.category}</Box>
				<Box sx={{ fontSize: 17, lineHeight: '24px', fontWeight: 800 }}>{post.title}</Box>
				<Box sx={{ fontSize: 13, lineHeight: '19px', color: DESK.muted }}>{excerpt(post.content, 110)}</Box>
				<Box sx={{ mt: '4px', fontSize: 12, color: DESK.muted }}>
					<b style={{ color: DESK.ink }}>{authorOf(post)}</b>
					{readMeta(post) && ` · ${readMeta(post)}`}
				</Box>
			</Box>
		</Box>
	)
}

function EditorsPick({ post }: { post: BlogPost }) {
	const { tone } = topicStyle(post.category, post.content_type)
	const ink = TONES[tone][1]
	return (
		<Box component={RouterLink} to={`/blogs/${post.slug}`} sx={{ ...cardSx, ...hoverCardSx, borderRadius: '22px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', color: DESK.ink, textDecoration: 'none', ...focusSx }}>
			<Cover post={post} height="100%" iconSize={88} />
			<Box sx={{ p: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Box sx={{ alignSelf: 'flex-start', px: '10px', py: '3px', borderRadius: '6px', bgcolor: DESK.ink, color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}>EDITOR’S PICK</Box>
				<Box sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: ink, textTransform: 'uppercase' }}>{post.category}</Box>
				<Box sx={{ fontSize: 26, lineHeight: '34px', fontWeight: 800 }}>{post.title}</Box>
				<Box sx={{ fontSize: 15, lineHeight: '23px', color: DESK.muted }}>{excerpt(post.content, 190)}</Box>
				<Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
					<Box aria-hidden="true" sx={{ width: 36, height: 36, borderRadius: '9999px', bgcolor: DESK.primarySoft, color: DESK.primary, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						{initials(authorOf(post))}
					</Box>
					<Box sx={{ flexGrow: 1, fontSize: 13, color: DESK.muted }}>
						<b style={{ color: DESK.ink }}>{authorOf(post)}</b>
						{readMeta(post) && ` · ${readMeta(post)}`}
					</Box>
					<Box sx={{ height: 40, px: '16px', borderRadius: '10px', bgcolor: DESK.primary, color: '#fff', fontSize: 14, fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>Read now</Box>
				</Box>
			</Box>
		</Box>
	)
}

