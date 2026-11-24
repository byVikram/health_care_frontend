// src/features/portal/BlogArticlePage.tsx
//
// Desktop article / blog / podcast reader (design: Desktop · 5a). GET /api/blogs/{slug}, its comments, ads and the
// "Keep reading" list from GET /api/blogs. The design's Save, "Was this helpful?" and "Reviewed by" have no backend yet, so
// they are not shown; Share copies the link.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import { marked } from 'marked'
import { toast } from 'react-toastify'
import { DESK } from '../../styles/deskTokens'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { createBlogComment, getBlogComments, getBlogPost, listBlogs, type BlogComment, type BlogPost } from '../../services/blogService'
import { listCommunityGroups, type CommunityGroup } from '../../services/communityService'
import { AdSlot, Column, Crumbs, MiniRow, Note, PromoCard, ReadsPage, ReadsSubNav, SideCard, Spinner, Svg } from './readsKit'
import { TONES, authorOf, cardSx, focusSx, initials, longDate, outlineBtnSx, primaryBtnSx, readMeta, timeAgo, topicStyle, useAds, useGroupJoin, type SubNavKey } from './readsHelpers'
import DeskButton from '../../components/common/Button/DeskButton'
import { useLoginPrompt } from '../../components/common/AuthModal/useLoginPrompt'
import { safeUrl, sanitizeHtml } from '../../utils/sanitize'

const bodySx = {
	fontSize: 18, lineHeight: '30px', color: DESK.ink, wordBreak: 'break-word',
	'& p, & div': { m: '0 0 18px' },
	'& pre': { bgcolor: '#0f172a', color: '#e2e8f0', p: '16px', borderRadius: '12px', fontFamily: 'monospace', fontSize: 14, lineHeight: '22px', overflowX: 'auto', m: '0 0 18px', whiteSpace: 'pre-wrap' },
	'& hr': { border: 0, borderTop: `1px solid ${DESK.cardLine}`, m: '24px 0' },
	'& h1, & h2': { fontSize: 24, lineHeight: '32px', fontWeight: 800, m: '28px 0 12px' },
	'& h3, & h4': { fontSize: 20, lineHeight: '28px', fontWeight: 800, m: '24px 0 10px' },
	'& ul, & ol': { pl: '22px', m: '0 0 18px' },
	'& li': { mb: '6px' },
	'& a': { color: DESK.primary, fontWeight: 700 },
	'& img': { maxWidth: '100%', borderRadius: '14px' },
	'& blockquote': { m: '0 0 18px', p: '12px 18px', borderLeft: `4px solid ${DESK.primary}`, bgcolor: DESK.primarySoft, borderRadius: '0 12px 12px 0', color: DESK.inkSoft },
} as const

const renderBody = (content: string): string => {
	const raw = /<[a-z][\s\S]*>/i.test(content) ? content : (marked.parse(content, { async: false }) as string)
	return sanitizeHtml(raw)
}

export default function BlogArticlePage() {
	const { slug } = useParams<{ slug: string }>()
	const navigate = useNavigate()
	const { accessToken } = useAuth()
	const [post, setPost] = useState<BlogPost | null>(null)
	const [loading, setLoading] = useState(true)
	const [comments, setComments] = useState<BlogComment[]>([])
	const [related, setRelated] = useState<BlogPost[]>([])
	const [group, setGroup] = useState<CommunityGroup | null>(null)
	const [shared, setShared] = useState(false)
	const ads = useAds('/blogs/*', post?.category)

	useEffect(() => {
		if (!slug) return
		let active = true
		const load = async () => {
			setLoading(true)
			try {
				const res = await getBlogPost(slug)
				if (!active) return
				setPost(res.data)
				window.scrollTo({ top: 0 })
				try {
					const c = await getBlogComments(slug)
					if (active) setComments(c.data)
				} catch {
					// comments are secondary
				}
				try {
					const list = await listBlogs(undefined, 1, 8, undefined, res.data.content_type ?? 'blog')
					if (active) setRelated(list.data.filter((p) => p.slug !== slug).slice(0, 3))
				} catch {
					// keep reading stays empty
				}
				try {
					const g = await listCommunityGroups(undefined, { limit: 1 })
					if (active) setGroup(g.data[0] ?? null)
				} catch {
					// the community card stays hidden
				}
			} catch {
				// ApiService already toasted the server's message
				if (active) navigate(ROUTES.BLOGS.LIST)
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [slug, navigate])

	const html = useMemo(() => (post ? renderBody(post.content) : ''), [post])

	if (loading) {
		return (
			<ReadsPage>
				<Spinner />
			</ReadsPage>
		)
	}
	if (!post) return null

	const type = (post.content_type ?? 'blog') as SubNavKey
	const { tone, icon } = topicStyle(post.category, post.content_type)
	const [bg, ink] = TONES[tone]
	const author = authorOf(post)
	const meta = [longDate(post.published_at ?? post.created_at), readMeta(post)].filter(Boolean).join(' · ')
	const sidebarAd = ads.find((a) => a.placement_key === 'sidebar')
	const inFeedAd = ads.find((a) => a.placement_key === 'in-feed')
	const mediaUrl = safeUrl(post.media_url)
	const isVideo = !!mediaUrl && /\.(mp4|webm|mov)(\?|$)/i.test(mediaUrl)

	const share = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href)
			setShared(true)
			setTimeout(() => setShared(false), 2500)
		} catch {
			toast.info(window.location.href)
		}
	}

	return (
		<ReadsPage>
			<ReadsSubNav active={type} />
			<Column sx={{ pt: '24px', pb: '64px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '40px', alignItems: 'start' }}>
				<Box component="article" sx={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0 }}>
					<Crumbs items={[{ label: 'Health reads', to: ROUTES.BLOGS.LIST }, { label: post.category, to: `${ROUTES.BLOGS.LIST}?type=${type}` }, { label: post.title }]} />

					<Box aria-hidden="true" sx={{ position: 'relative', overflow: 'hidden', height: 300, borderRadius: '24px', bgcolor: bg, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						{post.image_url ? (
							<Box component="img" src={post.image_url} alt="" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
						) : (
							<>
								<Box sx={{ position: 'absolute', left: -60, bottom: -90, width: 300, height: 300, borderRadius: '9999px', bgcolor: '#FFFFFF80' }} />
								<Box sx={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: '9999px', bgcolor: '#FFFFFF66' }} />
								<Box sx={{ position: 'relative', display: 'flex' }}>
									<Svg name={icon} size={110} stroke={1.3} />
								</Box>
							</>
						)}
					</Box>

					<Box sx={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: ink, textTransform: 'uppercase' }}>{post.category}</Box>
					<Box component="h1" sx={{ m: 0, fontSize: 40, lineHeight: '50px', fontWeight: 800, letterSpacing: '-0.01em' }}>
						{post.title}
					</Box>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', pb: '18px', borderBottom: `1px solid ${DESK.cardLine}` }}>
						{post.author?.avatar_url ? (
							<Box component="img" src={post.author.avatar_url} alt="" sx={{ width: 44, height: 44, borderRadius: '9999px', objectFit: 'cover' }} />
						) : (
							<Box aria-hidden="true" sx={{ width: 44, height: 44, borderRadius: '9999px', bgcolor: DESK.primarySoft, color: DESK.primary, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								{initials(author)}
							</Box>
						)}
						<Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
							<Box component="b" sx={{ fontSize: 15 }}>{author}</Box>
							<Box sx={{ fontSize: 13, color: DESK.muted }}>{meta}</Box>
						</Box>
						<Box component="button" type="button" onClick={() => void share()} sx={outlineBtnSx}>
							<Svg name="share" size={18} />
							{shared ? 'Link copied' : 'Share'}
						</Box>
					</Box>

					{mediaUrl &&
						(isVideo ? (
							<Box component="video" controls src={mediaUrl} sx={{ width: '100%', borderRadius: '16px', bgcolor: '#000' }} />
						) : (
							<Box component="audio" controls src={mediaUrl} sx={{ width: '100%' }} />
						))}

					<Box sx={bodySx} dangerouslySetInnerHTML={{ __html: html }} />

					<AdSlot placement={inFeedAd} compact />

					<Note>This content is general information, not medical advice. Speak to a doctor before changing medicines or starting supplements.</Note>

					<Comments slug={post.slug} comments={comments} signedIn={!!accessToken} onReload={async () => setComments((await getBlogComments(post.slug)).data)} />
				</Box>

				<Box component="aside" sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: '16px', pt: '32px' }}>
					<AdSlot placement={sidebarAd} />
					<PromoCard to={ROUTES.DOCTORS.SEARCH} title="Want advice made for you?" text="Consult a doctor on video or in clinic." button="Find a doctor" />
					{related.length > 0 && (
						<SideCard title="Keep reading">
							<Box sx={{ display: 'flex', flexDirection: 'column' }}>
								{related.map((p) => (
									<MiniRow key={p.id} to={`/blogs/${p.slug}`} topic={p.category} contentType={p.content_type} title={p.title} meta={[authorOf(p), readMeta(p)].filter(Boolean).join(' · ')} size={52} />
								))}
							</Box>
						</SideCard>
					)}
					{group && <GroupCard group={group} />}
				</Box>
			</Column>
		</ReadsPage>
	)
}

function GroupCard({ group }: { group: CommunityGroup }) {
	const [joined, setJoined] = useState(!!group.is_joined)
	const login = useLoginPrompt('Login to join a community')
	const { toggle, busy } = useGroupJoin(login.prompt)
	const { tone, icon } = topicStyle(group.category || group.name)
	const [bg, ink] = TONES[tone]
	return (
		<SideCard>
			{login.modal}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				<Box sx={{ flexShrink: 0, width: 44, height: 44, borderRadius: '12px', bgcolor: bg, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<Svg name={icon} size={22} />
				</Box>
				<Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
					<Box component="b" sx={{ fontSize: 15 }}>{group.name}</Box>
					{!!group.member_count && <Box sx={{ fontSize: 12, color: DESK.muted }}>{group.member_count.toLocaleString('en-IN')} members</Box>}
				</Box>
			</Box>
			<DeskButton label={joined ? 'Joined' : 'Join group'} kind={joined ? 'secondary' : 'primary'} size="lg" fullWidth={!joined} loading={busy} onClick={() => void toggle(group.id, joined, setJoined)} />
		</SideCard>
	)
}

// ── Comments ─────────────────────────────────────────────────────────────────

function Comments({ slug, comments, signedIn, onReload }: { slug: string; comments: BlogComment[]; signedIn: boolean; onReload: () => Promise<void> }) {
	const [text, setText] = useState('')
	const [busy, setBusy] = useState(false)

	const send = async (content: string, parentId?: string) => {
		if (!content.trim()) {
			toast.warning('Please write something first')
			return false
		}
		setBusy(true)
		try {
			await createBlogComment(slug, content.trim(), parentId)
			toast.success('Thanks! Your comment will show once it is approved.')
			await onReload()
			return true
		} catch {
			return false
		} finally {
			setBusy(false)
		}
	}

	return (
		<Box component="section" aria-label="Comments" sx={{ ...cardSx, p: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
			<Box component="h2" sx={{ m: 0, fontSize: 20, fontWeight: 800 }}>
				Comments {comments.length > 0 && <span style={{ color: DESK.muted, fontWeight: 600, fontSize: 15 }}>· {comments.length}</span>}
			</Box>
			{signedIn ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<Box
						component="textarea"
						rows={3}
						value={text}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
						placeholder="Share your thoughts or ask the author"
						aria-label="Write a comment"
						sx={{ p: '12px 14px', borderRadius: '12px', border: `1.5px solid ${DESK.lineStrong}`, bgcolor: DESK.page, color: DESK.ink, fontSize: 15, lineHeight: '22px', resize: 'none', outline: 'none', fontFamily: 'inherit', '&:focus': { borderColor: DESK.primary } }}
					/>
					<Box
						component="button"
						type="button"
						disabled={busy}
						onClick={async () => {
							if (await send(text)) setText('')
						}}
						sx={{ ...primaryBtnSx, alignSelf: 'flex-end', opacity: busy ? 0.7 : 1 }}
					>
						Post comment
					</Box>
				</Box>
			) : (
				<Box sx={{ fontSize: 14, color: DESK.muted }}>
					<Box component={RouterLink} to={ROUTES.AUTH.LOGIN} sx={{ color: DESK.primary, fontWeight: 800 }}>
						Log in
					</Box>{' '}
					to join the conversation.
				</Box>
			)}
			{comments.map((c) => (
				<CommentNode key={c.id} comment={c} signedIn={signedIn} onReply={send} />
			))}
		</Box>
	)
}

function CommentNode({ comment, signedIn, onReply, depth = 0 }: { comment: BlogComment; signedIn: boolean; onReply: (content: string, parentId?: string) => Promise<boolean>; depth?: number }) {
	const [open, setOpen] = useState(false)
	const [text, setText] = useState('')
	const isDoctor = comment.user_role === 'doctor'
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', pl: depth ? '20px' : 0, borderLeft: depth ? `2px solid ${DESK.lineSoft}` : 0 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
				<Box aria-hidden="true" sx={{ width: 34, height: 34, borderRadius: '9999px', bgcolor: isDoctor ? DESK.primarySoft : DESK.chip, color: isDoctor ? DESK.primary : DESK.muted, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					{initials(comment.user_name)}
				</Box>
				<Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 14, fontWeight: 800 }}>
						{comment.user_name}
						{isDoctor && <Box sx={{ px: '8px', py: '1px', borderRadius: '6px', bgcolor: DESK.successSoft, color: DESK.success, fontSize: 11, fontWeight: 800 }}>Verified doctor</Box>}
					</Box>
					<Box sx={{ fontSize: 12, color: DESK.muted }}>{timeAgo(comment.created_at)}</Box>
				</Box>
				{signedIn && (
					<Box component="button" type="button" onClick={() => setOpen(!open)} sx={{ border: 0, bgcolor: 'transparent', color: DESK.primary, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', ...focusSx }}>
						Reply
					</Box>
				)}
			</Box>
			<Box sx={{ fontSize: 15, lineHeight: '23px', whiteSpace: 'pre-line' }}>{comment.content}</Box>
			{open && (
				<Box sx={{ display: 'flex', gap: '8px' }}>
					<Box
						component="input"
						value={text}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
						placeholder={`Reply to ${comment.user_name}`}
						aria-label="Write a reply"
						sx={{ flexGrow: 1, height: 40, px: '12px', borderRadius: '10px', border: `1.5px solid ${DESK.lineStrong}`, outline: 'none', fontSize: 14, fontFamily: 'inherit', color: DESK.ink, '&:focus': { borderColor: DESK.primary } }}
					/>
					<Box
						component="button"
						type="button"
						onClick={async () => {
							if (await onReply(text, comment.id)) {
								setText('')
								setOpen(false)
							}
						}}
						sx={primaryBtnSx}
					>
						Send
					</Box>
				</Box>
			)}
			{comment.replies?.map((r) => (
				<CommentNode key={r.id} comment={r} signedIn={signedIn} onReply={onReply} depth={depth + 1} />
			))}
		</Box>
	)
}
