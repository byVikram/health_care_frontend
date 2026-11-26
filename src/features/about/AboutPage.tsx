// src/features/about/AboutPage.tsx
import type { ElementType, ReactNode } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, ButtonBase, Container, Typography } from '@mui/material'
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HeadphonesOutlinedIcon from '@mui/icons-material/HeadphonesOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined'
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import { ROUTES } from '../../constants/routes'
import { DESK, DESK_TONES } from '../../styles/deskTokens'

type IconType = ElementType

const OFFERS: { icon: IconType; title: string; text: string }[] = [
	{ icon: MedicalServicesOutlinedIcon, title: 'Doctor consultations', text: 'Book clinic visits or video consults with verified specialists.' },
	{ icon: BiotechOutlinedIcon, title: 'Lab tests at home', text: 'Home sample pickup with reports in your records, usually within 24 hours.' },
	{ icon: HomeOutlinedIcon, title: 'Nursing at home', text: 'Injections, IV, wound care and elder care by verified nurses.' },
	{ icon: MonitorHeartOutlinedIcon, title: 'Physiotherapy at home', text: 'Rehab after surgery, stroke or injury, at your pace and place.' },
	{ icon: DescriptionOutlinedIcon, title: 'Medical records', text: 'Prescriptions, reports and visit notes for every family member, in one place.' },
	{ icon: ChatBubbleOutlineIcon, title: 'Ask a doctor', text: 'Post a health question and get an answer from a verified doctor.' },
	{ icon: HeadphonesOutlinedIcon, title: 'Health reads & podcasts', text: 'Doctor-reviewed articles, audio and video for everyday health.' },
	{ icon: GroupsOutlinedIcon, title: 'Communities & events', text: 'Support groups, health camps and live Q&As near you.' },
]

const STATS: { icon: IconType; value: string; label: string }[] = [
	{ icon: LocationOnOutlinedIcon, value: '[X]', label: 'Cities served' },
	{ icon: FavoriteBorderIcon, value: '[X] lakh+', label: 'Families helped every year' },
	{ icon: VerifiedUserOutlinedIcon, value: '[X]+', label: 'Verified doctors & care providers' },
]

const STORIES: { tag: string; headline: string; from: string; to: string }[] = [
	{ tag: 'Home care', headline: '[Headline: how a family got care for a parent at home]', from: '#FBD3B8', to: '#F7E0A8' },
	{ tag: 'Lab tests', headline: '[Headline: catching a condition early with a routine test]', from: '#BCD8F3', to: '#A7D9D3' },
	{ tag: 'Video consult', headline: '[Headline: a late-night consult for a child’s fever]', from: '#D8D0F5', to: '#C3DAF7' },
]

const PRINCIPLES: { icon: IconType; title: string; text: string; tone: 'ok' | 'move' }[] = [
	{ icon: HomeOutlinedIcon, title: 'Access', text: 'Good care should be easy to reach — at a clinic, on video or at home — with clear prices before you book.', tone: 'ok' },
	{ icon: VerifiedUserOutlinedIcon, title: 'Trust', text: 'Every provider is checked by our team before their first booking, and reviewed after every visit.', tone: 'ok' },
	{ icon: VisibilityOutlinedIcon, title: 'Transparency', text: 'Plain words, honest prices and no hidden fees. You always know what happens next.', tone: 'move' },
]

const QUOTES: { quote: string; name: string; role: string }[] = [
	{ quote: '[Quote from a partner doctor about how Karolahealth fits into their practice.]', name: '[Doctor name]', role: '[Speciality · City]' },
	{ quote: '[Quote from a nurse or physiotherapist about home visits with Karolahealth.]', name: '[Provider name]', role: '[Role · City]' },
]

function Eyebrow({ children, align }: { children: ReactNode; align?: 'center' }) {
	return (
		<Typography
			sx={{ color: DESK.primary, fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: align }}
		>
			{children}
		</Typography>
	)
}

function Heading({ children, align, size = 36 }: { children: ReactNode; align?: 'center'; size?: number }) {
	return (
		<Typography
			component="h2"
			sx={{ color: DESK.ink, fontWeight: 800, fontSize: { xs: size * 0.75, md: size }, lineHeight: 1.2, textAlign: align }}
		>
			{children}
		</Typography>
	)
}

function IconTile({ icon: Icon, size = 40, dark = false }: { icon: IconType; size?: number; dark?: boolean }) {
	return (
		<Box
			sx={{
				flexShrink: 0,
				width: size,
				height: size,
				borderRadius: '12px',
				display: 'grid',
				placeItems: 'center',
				bgcolor: dark ? DESK.primary : DESK.primarySoft,
				color: dark ? '#fff' : DESK.primary,
			}}
		>
			<Icon sx={{ fontSize: size * 0.5 }} />
		</Box>
	)
}

function PillButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
	return (
		<ButtonBase
			onClick={onClick}
			sx={{
				px: 3,
				py: 1.5,
				borderRadius: '12px',
				bgcolor: DESK.primary,
				color: '#fff',
				fontWeight: 700,
				whiteSpace: 'nowrap',
				'&:hover': { bgcolor: DESK.primaryDark },
			}}
		>
			{children}
		</ButtonBase>
	)
}

function FloatingCard({ icon, title, text, sx }: { icon: IconType; title: string; text: string; sx: object }) {
	return (
		<Box sx={{ position: 'absolute', bgcolor: '#fff', borderRadius: '16px', p: 2, boxShadow: '0 12px 32px rgba(18,55,62,.15)', ...sx }}>
			<IconTile icon={icon} size={32} />
			<Typography sx={{ fontWeight: 700, fontSize: 14, color: DESK.ink, mt: 1 }}>{title}</Typography>
			<Typography sx={{ fontSize: 12, color: DESK.muted }}>{text}</Typography>
		</Box>
	)
}

function Banner({
	icon,
	eyebrow,
	title,
	text,
	button,
	onClick,
}: {
	icon: IconType
	eyebrow?: string
	title: string
	text: string
	button: string
	onClick: () => void
}) {
	return (
		<Box
			sx={{
				bgcolor: DESK.primarySoft,
				borderRadius: '20px',
				p: { xs: 3, md: 4 },
				display: 'flex',
				flexDirection: { xs: 'column', md: 'row' },
				alignItems: { md: 'center' },
				gap: 3,
			}}
		>
			<IconTile icon={icon} size={72} dark />
			<Box sx={{ flex: 1 }}>
				{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
				<Typography sx={{ fontWeight: 800, fontSize: 24, color: DESK.ink }}>{title}</Typography>
				<Typography sx={{ color: DESK.muted, mt: 0.5, maxWidth: 640 }}>{text}</Typography>
			</Box>
			<PillButton onClick={onClick}>{button}</PillButton>
		</Box>
	)
}

export default function AboutPage() {
	const navigate = useNavigate()

	return (
		<Box sx={{ bgcolor: '#fff' }}>
			{/* Hero */}
			<Box sx={{ background: `linear-gradient(180deg, ${DESK.primarySoft} 0%, ${DESK.primaryTint} 100%)`, py: { xs: 5, md: 8 } }}>
				<Container maxWidth="lg">
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, gap: 6, alignItems: 'center' }}>
						<Box>
							<Box sx={{ display: 'flex', gap: 1, fontSize: 14, color: DESK.muted, mb: 2 }}>
								<Box component={RouterLink} to={ROUTES.ROOT} sx={{ color: DESK.primary, fontWeight: 600, textDecoration: 'none' }}>
									Home
								</Box>
								<span>/</span>
								<span>About us</span>
							</Box>
							<Eyebrow>Our mission</Eyebrow>
							<Typography
								component="h1"
								sx={{ color: DESK.ink, fontWeight: 800, fontSize: { xs: 32, md: 44 }, lineHeight: 1.15, mt: 1.5, mb: 2.5 }}
							>
								Help every family get the right care, at the right time, close to home.
							</Typography>
							<Typography sx={{ color: DESK.inkSoft, fontSize: 17, lineHeight: 1.6, maxWidth: 520 }}>
								We connect people with verified doctors, labs, nurses and physiotherapists — and keep their health records, reminders and
								follow-ups in one safe place, so good care doesn’t stop after the first visit.
							</Typography>
						</Box>

						<Box sx={{ position: 'relative', height: { xs: 300, md: 360 }, display: { xs: 'none', sm: 'block' } }}>
							<Box
								sx={{
									position: 'absolute',
									right: 0,
									top: 30,
									width: '78%',
									height: '78%',
									borderRadius: '36px 36px 80px 36px',
									background: 'linear-gradient(135deg, #9CCFCB 0%, #2B6F71 100%)',
								}}
							/>
							<Box
								sx={{
									position: 'absolute',
									left: '28%',
									top: '34%',
									width: 110,
									height: 110,
									borderRadius: '50%',
									bgcolor: '#fff',
									display: 'grid',
									placeItems: 'center',
									border: '10px solid rgba(255,255,255,.35)',
									backgroundClip: 'padding-box',
									color: DESK.primary,
								}}
							>
								<FavoriteBorderIcon sx={{ fontSize: 44 }} />
							</Box>
							<FloatingCard icon={HomeOutlinedIcon} title="Care at home" text="Nurses and physios at your door" sx={{ right: 0, top: 0 }} />
							<FloatingCard
								icon={VerifiedUserOutlinedIcon}
								title="Verified providers"
								text="Checked by our team before their first booking"
								sx={{ left: '8%', bottom: 10, maxWidth: 200 }}
							/>
						</Box>
					</Box>
				</Container>
			</Box>

			{/* Habit */}
			<Container maxWidth="md" sx={{ py: { xs: 5, md: 8 }, textAlign: 'center' }}>
				<Heading align="center" size={30}>
					Care is a habit, not a one-off
				</Heading>
				<Typography sx={{ color: DESK.muted, fontSize: 17, lineHeight: 1.7, mt: 2 }}>
					Staying healthy is made of small things done regularly — the yearly check-up, the medicine taken on time, the follow-up you didn’t
					skip. Karolahealth is built to make those small things easy, so families can look after each other without the hassle.
				</Typography>
			</Container>

			{/* What we offer */}
			<Box sx={{ bgcolor: DESK.primaryTint, py: { xs: 5, md: 8 } }}>
				<Container maxWidth="lg">
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 6 }}>
						<Box>
							<Eyebrow>What we offer</Eyebrow>
							<Box sx={{ mt: 1.5, mb: 2 }}>
								<Heading>Everything your family needs, in one place</Heading>
							</Box>
							<Typography sx={{ color: DESK.muted }}>Available on the website and the Karolahealth app.</Typography>
						</Box>
						<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 4 }}>
							{OFFERS.map((o) => (
								<Box key={o.title} sx={{ display: 'flex', gap: 2, py: 2.25, borderBottom: `1px solid ${DESK.line}` }}>
									<IconTile icon={o.icon} size={36} />
									<Box>
										<Typography sx={{ fontWeight: 700, color: DESK.ink }}>{o.title}</Typography>
										<Typography sx={{ color: DESK.muted, fontSize: 14, mt: 0.25 }}>{o.text}</Typography>
									</Box>
								</Box>
							))}
						</Box>
					</Box>
				</Container>
			</Box>

			{/* Stats */}
			<Box sx={{ bgcolor: DESK.primary, py: 4 }}>
				<Container maxWidth="lg">
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
						{STATS.map((s) => (
							<Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<Box
									sx={{
										width: 56,
										height: 56,
										borderRadius: '14px',
										bgcolor: 'rgba(255,255,255,.14)',
										color: '#fff',
										display: 'grid',
										placeItems: 'center',
									}}
								>
									<s.icon />
								</Box>
								<Box>
									<Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 30, lineHeight: 1.1 }}>{s.value}</Typography>
									<Typography sx={{ color: 'rgba(255,255,255,.8)', fontSize: 14 }}>{s.label}</Typography>
								</Box>
							</Box>
						))}
					</Box>
				</Container>
			</Box>

			{/* Patient stories */}
			<Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
				<Eyebrow align="center">Patient stories</Eyebrow>
				<Heading align="center" size={32}>
					Real families, real care
				</Heading>
				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mt: 4 }}>
					{STORIES.map((s) => (
						<Box key={s.tag} sx={{ border: `1px solid ${DESK.lineSoft}`, borderRadius: '16px', overflow: 'hidden', bgcolor: '#fff' }}>
							<Box
								sx={{
									height: 200,
									display: 'grid',
									placeItems: 'center',
									background: `linear-gradient(135deg, ${s.from}, ${s.to})`,
									color: DESK.ink,
									fontWeight: 600,
									fontSize: 13,
								}}
							>
								[Photo, with consent]
							</Box>
							<Box sx={{ p: 2.5 }}>
								<Box
									component="span"
									sx={{ bgcolor: DESK.primarySoft, color: DESK.primary, fontSize: 11, fontWeight: 700, px: 1, py: 0.4, borderRadius: '6px' }}
								>
									{s.tag}
								</Box>
								<Typography sx={{ fontWeight: 700, color: DESK.ink, mt: 1.5, mb: 1.5 }}>{s.headline}</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', color: DESK.primary, fontWeight: 700, fontSize: 13 }}>
									Read full story <ChevronRightIcon sx={{ fontSize: 16 }} />
								</Box>
							</Box>
						</Box>
					))}
				</Box>
			</Container>

			{/* Approach */}
			<Box sx={{ bgcolor: DESK.primaryTint, py: { xs: 5, md: 8 } }}>
				<Container maxWidth="lg">
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 6 }}>
						<Box>
							<Eyebrow>Guiding principles</Eyebrow>
							<Box sx={{ mt: 1.5, mb: 2 }}>
								<Heading>Our approach to care</Heading>
							</Box>
							<Typography sx={{ color: DESK.muted }}>Three ideas shape every feature we build and every provider we work with.</Typography>
						</Box>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							{PRINCIPLES.map((p) => (
								<Box
									key={p.title}
									sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', bgcolor: '#fff', border: `1px solid ${DESK.lineSoft}`, borderRadius: '14px', p: 2.5 }}
								>
									<Box
										sx={{
											flexShrink: 0,
											width: 44,
											height: 44,
											borderRadius: '12px',
											display: 'grid',
											placeItems: 'center',
											bgcolor: DESK_TONES[p.tone].bg,
											color: DESK_TONES[p.tone].fg,
										}}
									>
										<p.icon />
									</Box>
									<Box>
										<Typography sx={{ fontWeight: 700, fontSize: 18, color: DESK.ink }}>{p.title}</Typography>
										<Typography sx={{ color: DESK.muted, mt: 0.5 }}>{p.text}</Typography>
									</Box>
								</Box>
							))}
						</Box>
					</Box>
				</Container>
			</Box>

			{/* Data security */}
			<Container maxWidth="lg" sx={{ pt: { xs: 5, md: 8 } }}>
				<Banner
					icon={LockOutlinedIcon}
					eyebrow="Data security"
					title="Your health data stays yours"
					text="Records are encrypted, shared only with the providers you book, and never sold. You can download or delete your data any time from Settings."
					button="Read our data journey"
					onClick={() => navigate(ROUTES.PUBLIC.DATA_SECURITY)}
				/>
			</Container>

			{/* Providers */}
			<Container maxWidth="lg" sx={{ pt: { xs: 5, md: 8 } }}>
				<Eyebrow>From our providers</Eyebrow>
				<Box sx={{ mt: 1, mb: 3 }}>
					<Heading size={32}>What doctors say about working with us</Heading>
				</Box>
				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
					{QUOTES.map((q) => (
						<Box key={q.name} sx={{ bgcolor: DESK.primaryTint, border: `1px solid ${DESK.lineSoft}`, borderRadius: '16px', p: 3 }}>
							<FormatQuoteIcon sx={{ color: DESK.primary, opacity: 0.5, fontSize: 36, transform: 'scaleX(-1)' }} />
							<Typography sx={{ color: DESK.ink, mt: 1, mb: 3 }}>{q.quote}</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<Box
									sx={{
										width: 40,
										height: 40,
										borderRadius: '50%',
										bgcolor: DESK.primarySoft,
										display: 'grid',
										placeItems: 'center',
										fontSize: 10,
										fontWeight: 700,
										color: DESK.ink,
									}}
								>
									Photo
								</Box>
								<Box>
									<Typography sx={{ fontWeight: 700, fontSize: 14, color: DESK.ink }}>{q.name}</Typography>
									<Typography sx={{ fontSize: 12, color: DESK.muted }}>{q.role}</Typography>
								</Box>
							</Box>
						</Box>
					))}
				</Box>
			</Container>

			{/* Careers */}
			<Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
				<Banner
					icon={WorkOutlineIcon}
					eyebrow="Careers"
					title="Build better healthcare with us"
					text="Engineering, design, operations and medical teams in Bengaluru."
					button="Contact us"
					onClick={() => navigate(ROUTES.PUBLIC.CONTACT)}
				/>
			</Container>
		</Box>
	)
}
