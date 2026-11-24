// src/features/portal/CommunityForumPage.tsx
//
// Desktop "Communities" (design: Desktop · 6). GET /api/communities (with member_count and is_joined) and the join / leave
// calls. The community's own page (posts, doctor answers, events) is a separate design and is not part of this screen.
import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import { DESK } from '../../styles/deskTokens'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import { listCommunityCategories, listCommunityGroups, type CommunityGroup } from '../../services/communityService'
import { Chip, Column, EmptyBox, Hero, Pager, ReadsPage, ReadsSubNav, SearchPill, SideCard, Svg } from './readsKit'
import { TONES, cardSx, focusSx, hoverCardSx, topicStyle, useGroupJoin, useUrlPage } from './readsHelpers'
import DeskButton from '../../components/common/Button/DeskButton'
import { useLoginPrompt } from '../../components/common/AuthModal/useLoginPrompt'

const ALL = 'All'
const PER_PAGE = 6
const members = (n?: number) => `${(n ?? 0).toLocaleString('en-IN')} ${n === 1 ? 'member' : 'members'}`

export default function CommunityForumPage() {
	const login = useLoginPrompt('Login to join a community')
	const { toggle: toggleJoin, busy: joinBusy } = useGroupJoin(login.prompt)
	const { accessToken } = useAuth()
	const [list, setGroups] = useState<CommunityGroup[]>([])
	const [mine, setMine] = useState<CommunityGroup[]>([])
	const [categories, setCategories] = useState<string[]>([])
	const [pages, setPages] = useState(1)
	const [page, setPage] = useUrlPage()
	const needleRef = useRef('')
	const [loading, setLoading] = useState(true)
	const [failed, setFailed] = useState(false)
	const [q, setQ] = useState('')
	const [needle, setNeedle] = useState('')
	const [cat, setCat] = useState(ALL)

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

	// Category chips and "Your communities" (the groups this user joined) come from the server once.
	useEffect(() => {
		let active = true
		const load = async () => {
			try {
				// Only a signed-in user can have joined groups, so a visitor skips that call.
				const [cats, joined] = await Promise.all([
					listCommunityCategories(),
					accessToken ? listCommunityGroups(undefined, { joinedOnly: true }) : Promise.resolve(null),
				])
				if (!active) return
				setCategories(cats)
				setMine(joined?.data ?? [])
			} catch {
				// the chips and the joined row just stay empty
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [accessToken])

	// One page of groups, filtered and searched by the server.
	useEffect(() => {
		let active = true
		const load = async () => {
			setLoading(true)
			setFailed(false)
			try {
				const res = await listCommunityGroups(undefined, { category: cat === ALL ? undefined : cat, search: needle, limit: PER_PAGE, page })
				if (!active) return
				const lastPage = Math.max(1, res.meta.pages)
				// A link to a page that no longer exists falls back to the last real page.
				if (page > lastPage) {
					setPage(lastPage)
					return
				}
				setGroups(res.data)
				setPages(lastPage)
			} catch {
				if (active) setFailed(true)
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [cat, needle, page, setPage])

	const setJoined = (id: string, joined: boolean) => {
		const bump = (g: CommunityGroup): CommunityGroup => ({ ...g, is_joined: joined, member_count: Math.max(0, (g.member_count ?? 0) + (joined ? 1 : -1)) })
		setGroups((prev) => prev.map((g) => (g.id === id ? bump(g) : g)))
		setMine((prev) => {
			if (!joined) return prev.filter((g) => g.id !== id)
			const g = list.find((x) => x.id === id)
			return g && !prev.some((x) => x.id === id) ? [...prev, bump(g)] : prev
		})
	}

	return (
		<ReadsPage>
			{login.modal}
			<ReadsSubNav active="communities" />
			<Hero eyebrow="COMMUNITIES" title="Talk to people who get it" subtitle="Support groups for conditions and caregiving, moderated by verified doctors." crumbs={[{ label: 'Communities' }]}>
				<SearchPill value={q} onChange={setQ} placeholder="Search by condition or topic" label="Search communities" />
			</Hero>

			<Column sx={{ pt: '28px', pb: '64px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '28px', alignItems: 'start' }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '28px', minWidth: 0 }}>
					{loading ? null : failed ? (
						<EmptyBox title="We couldn’t load the communities" text="Check your connection and try again." />
					) : (
						<>
							{mine.length > 0 && (
								<Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
									<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
										<Box component="h2" sx={{ m: 0, fontSize: 22, fontWeight: 800 }}>Your communities</Box>
									</Box>
									<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }}>
										{mine.map((g) => {
											const [bg, ink] = TONES[topicStyle(g.category || g.name).tone]
											const { icon } = topicStyle(g.category || g.name)
											return (
												<Box key={g.id} sx={{ p: '18px', borderRadius: '18px', bgcolor: bg, color: DESK.ink, display: 'flex', flexDirection: 'column', gap: '10px', ...hoverCardSx }}>
													<Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#fff', color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
														<Svg name={icon} size={22} />
													</Box>
													<Box component="b" sx={{ fontSize: 16, lineHeight: '22px' }}>{g.name}</Box>
													<Box sx={{ fontSize: 13, fontWeight: 700, color: ink }}>{members(g.member_count)}</Box>
												</Box>
											)
										})}
									</Box>
								</Box>
							)}

							<Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
									<Box component="h2" sx={{ m: 0, fontSize: 22, fontWeight: 800 }}>Discover communities</Box>
									<Box role="group" aria-label="Category" sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
										{[ALL, ...categories].map((c) => (
											<Chip key={c} label={c} on={c === cat} onClick={() => { setCat(c); setPage(1) }} />
										))}
									</Box>
								</Box>
								<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
									{list.map((g) => {
										const { tone, icon } = topicStyle(g.category || g.name)
										const [bg, ink] = TONES[tone]
										return (
											<Box key={g.id} sx={{ ...cardSx, ...hoverCardSx, p: '20px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
												<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
													<Box sx={{ flexShrink: 0, width: 52, height: 52, borderRadius: '14px', bgcolor: bg, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
														<Svg name={icon} size={26} />
													</Box>
													<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
														<Box component="b" sx={{ fontSize: 17, lineHeight: '23px' }}>{g.name}</Box>
														{g.description && <Box sx={{ fontSize: 14, lineHeight: '20px', color: DESK.muted }}>{g.description}</Box>}
													</Box>
												</Box>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
													<Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, color: DESK.muted }}>
														<Box sx={{ display: 'flex', color: DESK.success }}><Svg name="check" size={15} /></Box>
														Doctor moderated · {members(g.member_count)}
													</Box>
													<DeskButton label={g.is_joined ? 'Joined' : 'Join'} kind={g.is_joined ? 'secondary' : 'primary'} size="md" fullWidth={false} disabled={joinBusy} onClick={() => void toggleJoin(g.id, !!g.is_joined, (j) => setJoined(g.id, j))} />
												</Box>
											</Box>
										)
									})}
								</Box>
								{list.length === 0 && <EmptyBox title={needle ? `No communities match “${needle}”` : 'No communities yet'} text="Try a condition like diabetes or BP." />}
									<Pager page={page} pages={pages} onChange={setPage} />
							</Box>
						</>
					)}
				</Box>

				<Box component="aside" sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: '16px' }}>
					<SideCard title="How communities work">
						<Box component="ul" sx={{ m: 0, pl: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 14, lineHeight: '20px', color: DESK.inkSoft }}>
							<li>Posts are visible to members only.</li>
							<li>A verified doctor moderates every group and answers questions.</li>
							<li>Advice here doesn’t replace a consultation.</li>
						</Box>
					</SideCard>
					<Box component={RouterLink} to={ROUTES.PUBLIC.HEALTH_QUESTIONS} sx={{ ...cardSx, ...hoverCardSx, p: '20px 22px', color: DESK.ink, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', ...focusSx }}>
						<Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
							<Box component="b" sx={{ fontSize: 15 }}>Need a private answer?</Box>
							<Box sx={{ fontSize: 13, color: DESK.muted }}>Ask a doctor, free</Box>
						</Box>
						<Box sx={{ display: 'flex', color: DESK.primary }}><Svg name="chevron" size={18} /></Box>
					</Box>
				</Box>
			</Column>
		</ReadsPage>
	)
}
