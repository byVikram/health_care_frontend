// src/features/portal/readsKit.tsx
//
// Shared pieces of the desktop "Health reads / Communities / Ask a doctor" pages (design: blogs-communities-v2, desktop
// frames): the pill sub-navigation, the hero band, breadcrumbs, side cards, sponsored slots, tinted topic icons and the
// small helpers that turn what the API returns (category, content, author) into what the cards show.
import type { ReactNode } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { DESK } from '../../styles/deskTokens'
import { ROUTES } from '../../constants/routes'
import { trackAdMetric, type AdPlacementConfig } from '../../services/adService'
import { ICON_PATHS, PAGE_WIDTH, TONES, cardSx, focusSx, hoverCardSx, topicStyle, type IconName, type SubNavKey } from './readsHelpers'

export function Svg({ name, size = 20, stroke = 2, fill = 'none' }: { name: IconName; size?: number; stroke?: number; fill?: string }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill={fill}
			stroke="currentColor"
			strokeWidth={stroke}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d={ICON_PATHS[name]} />
		</svg>
	)
}

export function TopicTile({ topic, contentType, size = 48, radius = 12 }: { topic?: string; contentType?: string; size?: number; radius?: number }) {
	const { tone, icon } = topicStyle(topic, contentType)
	const [bg, ink] = TONES[tone]
	return (
		<Box
			aria-hidden="true"
			sx={{ flexShrink: 0, width: size, height: size, borderRadius: `${radius}px`, bgcolor: bg, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
		>
			<Svg name={icon} size={Math.round(size * 0.46)} stroke={1.8} />
		</Box>
	)
}

/** The page background and the centred 1200px column every frame uses. */
export function ReadsPage({ children }: { children: ReactNode }) {
	return <Box sx={{ bgcolor: DESK.page, color: DESK.ink, minHeight: 'calc(100vh - 64px)', fontFamily: 'inherit' }}>{children}</Box>
}

export function Column({ children, sx }: { children: ReactNode; sx?: object }) {
	return <Box sx={{ width: PAGE_WIDTH, maxWidth: 'calc(100% - 48px)', mx: 'auto', ...sx }}>{children}</Box>
}

const SUB_NAV = [
	{ key: 'article', label: 'Articles', to: `${ROUTES.BLOGS.LIST}?type=article` },
	{ key: 'blog', label: 'Blogs', to: `${ROUTES.BLOGS.LIST}?type=blog` },
	{ key: 'podcast', label: 'Podcasts & videos', to: `${ROUTES.BLOGS.LIST}?type=podcast` },
	{ key: 'communities', label: 'Communities', to: ROUTES.COMMUNITIES.LIST },
	{ key: 'ask', label: 'Ask a doctor', to: ROUTES.PUBLIC.HEALTH_QUESTIONS },
] as const
export function ReadsSubNav({ active }: { active: SubNavKey }) {
	return (
		<Box sx={{ bgcolor: DESK.raised, borderBottom: `1px solid ${DESK.cardLine}` }}>
			<Column sx={{ height: 64, pt: '12px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
				<Box component="nav" aria-label="Articles, blogs, podcasts, communities and Ask a doctor" sx={{ display: 'flex', gap: '6px' }}>
					{SUB_NAV.map((n) => {
						const on = n.key === active
						return (
							<Box
								key={n.key}
								component={RouterLink}
								to={n.to}
								aria-current={on ? 'page' : undefined}
								sx={{
									height: 36, px: '14px', borderRadius: '9999px', fontSize: 14, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap',
									display: 'inline-flex', alignItems: 'center', bgcolor: on ? DESK.ink : DESK.chip, color: on ? '#fff' : DESK.ink, ...focusSx,
								}}
							>
								{n.label}
							</Box>
						)
					})}
				</Box>
			</Column>
		</Box>
	)
}

export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
	return (
		<Box component="nav" aria-label="Breadcrumb" sx={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, color: DESK.muted, flexWrap: 'wrap' }}>
			{[{ label: 'Home', to: ROUTES.ROOT }, ...items].map((c, i, arr) => (
				<Box key={`${c.label}-${i}`} sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
					{c.to && i < arr.length - 1 ? (
						<Box component={RouterLink} to={c.to} sx={{ color: DESK.primary, textDecoration: 'none', fontWeight: 700 }}>
							{c.label}
						</Box>
					) : (
						<span aria-current="page">{c.label}</span>
					)}
					{i < arr.length - 1 && <span aria-hidden="true">›</span>}
				</Box>
			))}
		</Box>
	)
}

/** The tinted band under the sub-nav with the eyebrow, headline and (optionally) a search pill. */
export function Hero({ eyebrow, title, subtitle, crumbs, children }: { eyebrow: string; title: string; subtitle: string; crumbs: { label: string; to?: string }[]; children?: ReactNode }) {
	return (
		<Box component="section" sx={{ background: 'linear-gradient(120deg, #FFFFFF 0%, #FFFFFF 40%, #E3EFEF 100%)', borderBottom: `1px solid ${DESK.cardLine}` }}>
			<Column sx={{ pt: '28px', pb: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Crumbs items={crumbs} />
				<Box sx={{ fontSize: 13, lineHeight: '16px', fontWeight: 800, letterSpacing: '0.08em', color: DESK.primary }}>{eyebrow}</Box>
				<Box component="h1" sx={{ m: 0, fontSize: 36, lineHeight: '44px', fontWeight: 800, letterSpacing: '-0.01em' }}>
					{title}
				</Box>
				<Box component="p" sx={{ m: 0, maxWidth: 640, fontSize: 16, lineHeight: '24px', color: DESK.muted }}>
					{subtitle}
				</Box>
				{children}
			</Column>
		</Box>
	)
}

export function SearchPill({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
	return (
		<Box
			component="label"
			sx={{
				mt: '8px', width: 640, maxWidth: '100%', height: 54, boxSizing: 'border-box', pl: '18px', pr: '8px', borderRadius: '9999px', bgcolor: '#fff',
				border: `1px solid ${DESK.lineStrong}`, boxShadow: '0 6px 18px #12373E0F', display: 'flex', alignItems: 'center', gap: '10px', color: DESK.muted,
				'&:focus-within': { borderColor: DESK.primary },
			}}
		>
			<Svg name="search" size={20} stroke={2.2} />
			<Box
				component="input"
				type="search"
				value={value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
				placeholder={placeholder}
				aria-label={label}
				sx={{ flexGrow: 1, minWidth: 0, height: 50, border: 0, outline: 'none', bgcolor: 'transparent', fontSize: 16, color: DESK.ink, fontFamily: 'inherit' }}
			/>
		</Box>
	)
}

export function Chip({ label, on, onClick, height = 36 }: { label: string; on: boolean; onClick: () => void; height?: number }) {
	return (
		<Box
			component="button"
			type="button"
			aria-pressed={on}
			onClick={onClick}
			sx={{
				flexShrink: 0, height, px: '14px', borderRadius: '9999px', border: `1.5px solid ${on ? DESK.ink : DESK.lineStrong}`, bgcolor: on ? DESK.ink : '#fff',
				color: on ? '#fff' : DESK.ink, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit', ...focusSx,
			}}
		>
			{label}
		</Box>
	)
}

export function SideCard({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
	return (
		<Box component="section" sx={{ ...cardSx, p: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
			{title && (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
					<Box component="h2" sx={{ m: 0, fontSize: 20, lineHeight: '28px', fontWeight: 800 }}>
						{title}
					</Box>
					{subtitle && <Box sx={{ fontSize: 13, color: DESK.muted }}>{subtitle}</Box>}
				</Box>
			)}
			{children}
		</Box>
	)
}

/** A gradient call-to-action card ("Didn't find your answer?"). */
export function PromoCard({ to, title, text, cta, button }: { to: string; title: string; text: string; cta?: string; button?: string }) {
	return (
		<Box
			component={RouterLink}
			to={to}
			sx={{
				p: '22px', borderRadius: '20px', background: 'linear-gradient(135deg, #FFFFFF 0%, #E3EFEF 100%)', border: `1px solid ${DESK.lineStrong}`,
				boxShadow: '0 4px 14px #12373E0A', color: DESK.ink, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px', ...hoverCardSx, ...focusSx,
			}}
		>
			<Box component="b" sx={{ fontSize: 18, lineHeight: '24px' }}>{title}</Box>
			<Box sx={{ fontSize: 14, lineHeight: '20px', color: DESK.muted }}>{text}</Box>
			{cta && (
				<Box sx={{ mt: '4px', fontSize: 14, fontWeight: 800, color: DESK.primary, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
					{cta}
					<Svg name="chevron" size={16} stroke={2.4} />
				</Box>
			)}
			{button && (
				<Box sx={{ mt: '6px', alignSelf: 'flex-start', height: 40, px: '16px', borderRadius: '10px', bgcolor: DESK.primary, color: '#fff', fontSize: 14, fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>
					{button}
				</Box>
			)}
		</Box>
	)
}

/** One row of a "Most read" / "Keep reading" / "Related" list. */
export function MiniRow({ to, topic, contentType, title, meta, size = 48 }: { to: string; topic?: string; contentType?: string; title: string; meta?: string; size?: number }) {
	return (
		<Box
			component={RouterLink}
			to={to}
			sx={{ mx: '-10px', p: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: DESK.ink, textDecoration: 'none', '&:hover': { bgcolor: DESK.page }, ...focusSx }}
		>
			<TopicTile topic={topic} contentType={contentType} size={size} />
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
				<Box component="b" sx={{ fontSize: 14, lineHeight: '19px' }}>{title}</Box>
				{meta && <Box sx={{ fontSize: 12, color: DESK.muted }}>{meta}</Box>}
			</Box>
		</Box>
	)
}

export function Note({ children }: { children: ReactNode }) {
	return (
		<Box role="note" sx={{ p: '14px 16px', borderRadius: '14px', border: `1px solid ${DESK.lineStrong}`, fontSize: 14, lineHeight: '21px', color: DESK.muted }}>
			{children}
		</Box>
	)
}

export function EmptyBox({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
	return (
		<Box sx={{ p: '36px', ...cardSx, borderRadius: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
			<Box component="b" sx={{ fontSize: 17 }}>{title}</Box>
			{text && <Box sx={{ fontSize: 14, color: DESK.muted }}>{text}</Box>}
			{action}
		</Box>
	)
}

export function Spinner() {
	return (
		<Box role="status" aria-label="Loading" sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
			<Box sx={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${DESK.primarySoft}`, borderTopColor: DESK.primary, animation: 'khSpin 0.8s linear infinite', '@keyframes khSpin': { to: { transform: 'rotate(360deg)' } } }} />
		</Box>
	)
}

export function AdSlot({ placement, compact = false }: { placement?: AdPlacementConfig; compact?: boolean }) {
	const navigate = useNavigate()
	if (!placement) return null
	const open = () => {
		trackAdMetric(placement.ad.id, 'click').catch(() => undefined)
		navigate(ROUTES.PORTAL.HOME)
	}
	return (
		<Box component="section" aria-label="Advertisement" sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '2px' }}>
				<Box sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: DESK.muted }}>SPONSORED</Box>
				<Box sx={{ px: '6px', py: '1px', borderRadius: '4px', border: '1px solid #C9D6D7', fontSize: 10, fontWeight: 800, color: DESK.muted }}>Ad</Box>
			</Box>
			<Box
				component="button"
				type="button"
				onClick={open}
				sx={{ p: 0, border: 0, bgcolor: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: DESK.ink, display: 'flex', flexDirection: 'column', gap: '10px', ...hoverCardSx, ...focusSx }}
			>
				<Box
					component="img"
					src={placement.ad.image_url}
					alt={placement.ad.title}
					sx={{ width: '100%', aspectRatio: compact ? '4 / 1' : '2 / 1', objectFit: 'cover', borderRadius: compact ? '18px' : '14px', bgcolor: DESK.primary }}
				/>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', px: '2px' }}>
					<Box component="b" sx={{ fontSize: 14, lineHeight: '19px' }}>{placement.ad.title}</Box>
					<Box sx={{ fontSize: 13, fontWeight: 800, color: DESK.primary, whiteSpace: 'nowrap' }}>Learn more</Box>
				</Box>
			</Box>
		</Box>
	)
}

function PageBtn({ children, label, current, disabled, onClick }: { children: ReactNode; label: string; current?: boolean; disabled?: boolean; onClick: () => void }) {
	return (
		<Box
			component="button"
			type="button"
			aria-label={label}
			aria-current={current ? 'page' : undefined}
			disabled={disabled}
			onClick={onClick}
			sx={{
				minWidth: 40, height: 40, px: '10px', borderRadius: '10px', border: `1px solid ${current ? DESK.ink : DESK.lineStrong}`, bgcolor: current ? DESK.ink : '#fff',
				color: current ? '#fff' : disabled ? '#A3B0B2' : DESK.ink, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
				cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit', ...focusSx,
			}}
		>
			{children}
		</Box>
	)
}

/** Centered pager: previous, 1 … current-1 current current+1 … last, next. Hidden when there is only one page. */
export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
	if (pages <= 1) return null
	const shown = Array.from(new Set([1, pages, page - 1, page, page + 1])).filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
	const items: (number | 'gap')[] = []
	shown.forEach((n, i) => {
		if (i > 0 && n - shown[i - 1] > 1) items.push('gap')
		items.push(n)
	})
	return (
		<Box component="nav" aria-label="Pages" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', pt: '4px' }}>
			<PageBtn label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}>
				<Svg name="chevronLeft" size={18} stroke={2.2} />
			</PageBtn>
			{items.map((n, i) =>
				n === 'gap' ? (
					<Box key={`gap-${i}`} aria-hidden="true" sx={{ minWidth: 20, textAlign: 'center', color: DESK.muted, fontWeight: 800 }}>…</Box>
				) : (
					<PageBtn key={n} label={`Page ${n}`} current={n === page} onClick={() => onChange(n)}>
						{n}
					</PageBtn>
				)
			)}
			<PageBtn label="Next page" disabled={page === pages} onClick={() => onChange(page + 1)}>
				<Svg name="chevron" size={18} stroke={2.2} />
			</PageBtn>
		</Box>
	)
}
