// src/features/portal/readsHelpers.ts
//
// Constants, tones, text helpers and the ads hook shared by the Health reads / Communities / Ask a doctor pages
// (the components that use them are in readsKit.tsx).
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { joinCommunityGroup, leaveCommunityGroup } from '../../services/communityService'
import { getActiveAds, trackAdMetric, type AdPlacementConfig } from '../../services/adService'
import type { BlogPost } from '../../services/blogService'
import { DESK } from '../../styles/deskTokens'

export const PAGE_WIDTH = 1200

// ── Tones and icons ──────────────────────────────────────────────────────────

export type ToneKey = 'green' | 'amber' | 'blue' | 'purple' | 'orange' | 'teal' | 'pink'
/** [background, ink] */
export const TONES: Record<ToneKey, [string, string]> = {
	green: ['#E6F4EC', '#1E7A4E'],
	amber: ['#FBEFD5', '#8A5300'],
	blue: ['#DDEBFA', '#2463A8'],
	purple: ['#ECE6FA', '#6A4BB5'],
	orange: ['#FDE8DC', '#B4532A'],
	teal: ['#E3EFEF', '#2B6F71'],
	pink: ['#FCE7F3', '#A0306B'],
}

export const ICON_PATHS = {
	leaf: 'M12 7c-1-2-3-3-5-2-3 1-3 6-1 10 1 2 3 4 4 4s1.5-.5 2-.5 1 .5 2 .5 3-2 4-4c2-4 2-9-1-10-2-1-4 0-5 2zM12 7c0-2 1-4 3-4',
	drop: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
	heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
	shield: 'M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-4.5',
	mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
	video: 'M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM15 10l6-3v10l-6-3',
	moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
	baby: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 21a6 6 0 0 1 12 0M10 8h.01M14 8h.01',
	mind: 'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.5A3 3 0 0 0 8 17a3 3 0 0 0 4 3V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5.5A3 3 0 0 1 16 17a3 3 0 0 1-4 3',
	ribbon: 'M12 3a4 4 0 0 0-4 4c0 3 4 7 4 7s4-4 4-7a4 4 0 0 0-4-4zM9 12l-4 9 3-1 2 2 2-5M15 12l4 9-3-1-2 2-2-5',
	people: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a7 7 0 0 1 14 0v1M16 3.5a4 4 0 0 1 0 7M22 21v-1a7 7 0 0 0-4-6.3',
	flower: 'M12 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v6M12 14v8M2 12h6M14 12h8',
	search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
	chevron: 'M9 6l6 6-6 6',
	chevronLeft: 'M15 6l-6 6 6 6',
	down: 'M6 9l6 6 6-6',
	check: 'M5 12l5 5 9-10',
	clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
	lock: 'M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5z',
	bookmark: 'M6 3h12v18l-6-4-6 4z',
	share: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13',
	thumb: 'M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.3 20H7',
} as const
export type IconName = keyof typeof ICON_PATHS

/** Picks the tinted tone and icon for a category / specialty word (the API sends free text, the design needs a tint). */
export function topicStyle(topic = '', contentType?: string): { tone: ToneKey; icon: IconName } {
	if (contentType === 'podcast') return { tone: 'purple', icon: 'mic' }
	const t = topic.toLowerCase()
	if (/diabet|endocr|sugar|thyroid/.test(t)) return { tone: 'amber', icon: 'drop' }
	if (/heart|cardio|bp|blood pressure/.test(t)) return { tone: 'orange', icon: 'heart' }
	if (/nutri|diet|vitamin|food/.test(t)) return { tone: 'green', icon: 'leaf' }
	if (/women|gyn|pcos|pregnan/.test(t)) return { tone: 'pink', icon: 'flower' }
	if (/mental|sleep|anxiety|stress|psych/.test(t)) return { tone: 'purple', icon: 'moon' }
	if (/child|pedia|baby|new parent/.test(t)) return { tone: 'teal', icon: 'baby' }
	if (/cancer|onco/.test(t)) return { tone: 'purple', icon: 'ribbon' }
	if (/geriat|elder|caregiv|famil/.test(t)) return { tone: 'teal', icon: 'people' }
	if (/respir|lung|cough|asthma/.test(t)) return { tone: 'blue', icon: 'shield' }
	if (/skin|derm/.test(t)) return { tone: 'pink', icon: 'shield' }
	if (/digest|gastro|stomach/.test(t)) return { tone: 'purple', icon: 'shield' }
	return { tone: 'blue', icon: 'shield' }
}

// ── Text helpers ─────────────────────────────────────────────────────────────

/** Plain text of a post body (markdown or HTML). */
export function plainText(content = ''): string {
	return content
		.replace(/<[^>]*>/g, ' ')
		.replace(/[#*_`>[\]]+/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

export function excerpt(content = '', max = 120): string {
	const t = plainText(content)
	return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, '') + '…' : t
}

export function initials(name = ''): string {
	return (
		name
			.replace(/^dr\.?\s+/i, '')
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((w) => w[0]!.toUpperCase())
			.join('') || '?'
	)
}

export function readMeta(post: BlogPost): string {
	if (post.content_type === 'podcast' && post.media_duration_seconds) {
		return `Listen · ${Math.max(1, Math.round(post.media_duration_seconds / 60))} min`
	}
	return post.read_time_minutes ? `${post.read_time_minutes} min read` : ''
}

export const authorOf = (post: BlogPost) => post.author_name || post.author?.name || 'Karolahealth'

export function longDate(iso?: string): string {
	if (!iso) return ''
	const d = new Date(iso)
	return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function timeAgo(iso?: string): string {
	if (!iso) return ''
	const diff = Date.now() - new Date(iso).getTime()
	if (Number.isNaN(diff)) return ''
	const m = Math.floor(diff / 60000)
	if (m < 1) return 'just now'
	if (m < 60) return `${m} min ago`
	const h = Math.floor(m / 60)
	if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ago`
	const d = Math.floor(h / 24)
	if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`
	if (d < 30) return `${Math.floor(d / 7)} week${Math.floor(d / 7) === 1 ? '' : 's'} ago`
	return longDate(iso)
}

// ── Layout pieces ────────────────────────────────────────────────────────────

export const cardSx = {
	borderRadius: '20px',
	bgcolor: DESK.raised,
	border: `1px solid ${DESK.cardLine}`,
	boxShadow: '0 4px 14px #12373E0A',
} as const

export const hoverCardSx = {
	transition: 'box-shadow 160ms, transform 160ms',
	'&:hover': { boxShadow: '0 10px 28px #12373E14', transform: 'translateY(-1px)' },
	'@media (prefers-reduced-motion: reduce)': { transition: 'none' },
} as const

export const focusSx = { '&:focus-visible': { outline: 'none', boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${DESK.primary}` } } as const

export type SubNavKey = 'article' | 'blog' | 'podcast' | 'communities' | 'ask'

// ── Paging ───────────────────────────────────────────────────────────────────

/** The current page lives in the URL (?page=N), so a refresh, a shared link and Back all land on the same page of the server's list. */
export function useUrlPage(): [number, (page: number) => void] {
	const [params, setParams] = useSearchParams()
	const raw = Number(params.get('page'))
	const page = Number.isInteger(raw) && raw > 1 ? raw : 1
	// react-router makes a new setParams on every URL change; keep setPage's identity fixed, so putting it in an effect's
	// dependencies can never trigger an extra fetch of the list.
	const setParamsRef = useRef(setParams)
	useEffect(() => {
		setParamsRef.current = setParams
	}, [setParams])
	const setPage = useCallback((next: number) => {
		setParamsRef.current(
			(prev) => {
				const p = new URLSearchParams(prev)
				if (next > 1) p.set('page', String(next))
				else p.delete('page')
				return p
			},
			{ replace: next <= 1 }
		)
		window.scrollTo({ top: 0 })
	}, [])
	return [page, setPage]
}

// ── Sponsored slot (existing ads API) ────────────────────────────────────────

export function useAds(pageRoute: string, category?: string) {
	const [ads, setAds] = useState<AdPlacementConfig[]>([])
	useEffect(() => {
		let active = true
		const load = async () => {
			try {
				const res = await getActiveAds(pageRoute, category)
				if (!active) return
				setAds(res.data)
				res.data.forEach((p) => trackAdMetric(p.ad.id, 'impression').catch(() => undefined))
			} catch {
				// ads are optional: the page simply shows none
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [pageRoute, category])
	return ads
}

export const primaryBtnSx = {
	height: 40, px: '16px', borderRadius: '10px', border: 0, bgcolor: DESK.primary, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
	display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', fontFamily: 'inherit', '&:hover': { bgcolor: DESK.primaryDark }, ...focusSx,
} as const

export const outlineBtnSx = {
	height: 40, px: '14px', borderRadius: '10px', border: `1.5px solid ${DESK.lineStrong}`, bgcolor: '#fff', color: DESK.ink, fontSize: 14, fontWeight: 800, cursor: 'pointer',
	display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', ...focusSx,
} as const

// ── Join / leave a community group ───────────────────────────────────────────

/**
 * Join or leave a group (POST / DELETE /api/communities/{id}/join). A visitor who is not signed in gets the login pop-up
 * (`askLogin`, from `useLoginPrompt`) and the join goes through once they have signed in; without `askLogin` they go to the login page.
 */
export function useGroupJoin(askLogin?: (after: () => void) => void) {
	const { accessToken } = useAuth()
	const navigate = useNavigate()
	const [busy, setBusy] = useState(false)
	const toggle = async (groupId: string, joined: boolean, onChange: (joined: boolean) => void) => {
		if (!accessToken) {
			if (askLogin) askLogin(() => void run(groupId, joined, onChange))
			else navigate(ROUTES.AUTH.LOGIN)
			return
		}
		await run(groupId, joined, onChange)
	}
	const run = async (groupId: string, joined: boolean, onChange: (joined: boolean) => void) => {
		setBusy(true)
		try {
			if (joined) await leaveCommunityGroup(groupId)
			else await joinCommunityGroup(groupId)
			onChange(!joined)
		} catch {
			// ApiService already toasted the server's message
		} finally {
			setBusy(false)
		}
	}
	return { toggle, busy }
}
