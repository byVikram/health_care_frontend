// src/features/legal/DataSecurityPage.tsx
//
// Desktop "Data security": hero, the journey of an uploaded report, what we always / never do, and a link to the privacy policy.
// Only the page body: the navbar and footer come from the layout the route sits in.
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { DESK } from '../../styles/deskTokens'
import { ROUTES } from '../../constants/routes'

const PATHS = {
	check: 'M5 12.5l4.5 4.5L19 7.5',
	cross: 'M6 6l12 12M18 6L6 18',
	person: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21v-1a7 7 0 0 1 14 0v1',
	lock: 'M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5zM12 14v3',
	server: 'M4 5h16v6H4zM4 13h16v6H4zM8 8h.01M8 16h.01',
	steth: 'M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-2M20 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
	shield: 'M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-4.5',
	sliders: 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4',
}

function Icon({ d, size, stroke = 2 }: { d: string; size: number; stroke?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d={d} />
		</svg>
	)
}

const eyebrowSx = { fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', color: DESK.primary } as const
const wrapSx = { maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 0 } } as const

const PROMISES = ['We never sell your data', 'Support staff can’t open your medical records', 'You can download or delete everything, any time']

const STEPS = [
	{ icon: PATHS.person, title: 'You add a record', text: 'A report, prescription or note, from the app or website.' },
	{ icon: PATHS.lock, title: 'Encrypted instantly', text: 'Locked with AES-256 before it leaves your device’s connection (TLS 1.2+).' },
	{ icon: PATHS.server, title: 'Stored securely', text: 'Kept on protected servers in [India], with encrypted backups.' },
	{ icon: PATHS.steth, title: 'Shared only with your care team', text: 'Only the doctor, lab or nurse you book — and only when you allow it.' },
]

const ALWAYS = [
	'Encrypt your data in transit and at rest',
	'Log every time staff access your account',
	'Ask before sharing records with a provider',
	'Use masked numbers for provider calls',
	'Follow India’s DPDP Act, 2023',
]

const NEVER = [
	'Sell or rent your personal or health data',
	'Show your records to advertisers',
	'Record your video consults',
	'Let support staff read your reports',
	'Keep your data after you delete your account, beyond what the law requires',
]

function Corner({ d, sx }: { d: string; sx: object }) {
	return (
		<Box
			sx={{
				position: 'absolute',
				width: 64,
				height: 64,
				borderRadius: '20px',
				bgcolor: '#FFFFFF',
				color: DESK.primary,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxShadow: '0 12px 24px -12px #12373E59',
				...sx,
			}}
		>
			<Icon d={d} size={28} />
		</Box>
	)
}

function ChecklistCard({ title, items, tone, mark }: { title: string; items: string[]; tone: { bg: string; ink: string }; mark: ReactNode }) {
	return (
		<Box sx={{ p: 4, borderRadius: '24px', bgcolor: tone.bg, display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Typography sx={{ fontSize: 22, fontWeight: 700, color: tone.ink }}>{title}</Typography>
			{items.map((t) => (
				<Box key={t} sx={{ display: 'flex', gap: 1.5, fontSize: 15, lineHeight: '22px', color: DESK.ink }}>
					<Box sx={{ flexShrink: 0, color: tone.ink, display: 'flex' }}>{mark}</Box>
					{t}
				</Box>
			))}
		</Box>
	)
}

export default function DataSecurityPage() {
	return (
		<Box sx={{ color: DESK.ink }}>
			{/* Hero */}
			<Box sx={{ bgcolor: '#FFFFFF', borderBottom: `1px solid ${DESK.cardLine}` }}>
				<Box
					sx={{
						...wrapSx,
						pt: { xs: 3, md: '28px' },
						pb: { xs: 5, md: 8 },
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
						gap: { xs: 4, md: 8 },
						alignItems: 'center',
					}}
				>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						<Box sx={{ display: 'flex', gap: 0.75, fontSize: 13, color: DESK.muted }}>
							<Box component={RouterLink} to={ROUTES.ROOT} sx={{ color: DESK.primary, fontWeight: 700, textDecoration: 'none' }}>
								Home
							</Box>
							<span aria-hidden="true">/</span>
							<span aria-current="page">Data security</span>
						</Box>
						<Typography sx={{ ...eyebrowSx, mt: 2.5 }}>DATA SECURITY</Typography>
						<Typography component="h1" sx={{ fontSize: { xs: 34, md: 50 }, lineHeight: { xs: '42px', md: '58px' }, fontWeight: 800, letterSpacing: '-0.02em' }}>
							Safe by design. Private by default.
						</Typography>
						<Typography sx={{ fontSize: 18, lineHeight: '28px', color: DESK.inkSoft }}>
							We built Karolahealth so your health information is protected at every step {'—'} and only ever seen by the people you choose.
						</Typography>
						<Box component="ul" sx={{ m: 0, mt: 1, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
							{PROMISES.map((t) => (
								<Box component="li" key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontSize: 16, fontWeight: 600 }}>
									<Box sx={{ width: 26, height: 26, borderRadius: '9999px', bgcolor: DESK.successSoft, color: DESK.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
										<Icon d={PATHS.check} size={14} stroke={3} />
									</Box>
									{t}
								</Box>
							))}
						</Box>
					</Box>

					<Box aria-hidden="true" sx={{ height: 360, borderRadius: '32px', bgcolor: DESK.primarySoft, position: 'relative', overflow: 'hidden' }}>
						<Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 260, height: 260, borderRadius: '9999px', border: `2px dashed ${DESK.mint}` }} />
						<Box
							sx={{
								position: 'absolute',
								left: '50%',
								top: '50%',
								transform: 'translate(-50%, -50%)',
								width: 120,
								height: 120,
								borderRadius: '36px',
								bgcolor: DESK.primary,
								color: '#FFFFFF',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Icon d={PATHS.shield} size={58} stroke={1.8} />
						</Box>
						<Corner d={PATHS.person} sx={{ left: 72, top: 52 }} />
						<Corner d={PATHS.lock} sx={{ right: 72, top: 52 }} />
						<Corner d={PATHS.server} sx={{ left: 72, bottom: 52 }} />
						<Corner d={PATHS.steth} sx={{ right: 72, bottom: 52 }} />
					</Box>
				</Box>
			</Box>

			{/* The journey of your data */}
			<Box sx={{ bgcolor: DESK.page }}>
				<Box sx={{ ...wrapSx, py: { xs: 5, md: 10 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
					<Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1.25, alignItems: 'center' }}>
						<Typography sx={eyebrowSx}>THE JOURNEY OF YOUR DATA</Typography>
						<Typography component="h2" sx={{ fontSize: { xs: 26, md: 32 }, lineHeight: { xs: '34px', md: '40px' }, fontWeight: 800, letterSpacing: '-0.015em' }}>
							What happens to a report you upload
						</Typography>
					</Box>
					<Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, rowGap: 4 }}>
						{STEPS.map((s, i) => (
							<Box component="li" key={s.title} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.75, textAlign: 'center', px: 2 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
									<Box sx={{ flexGrow: 1, height: 2, bgcolor: i === 0 ? 'transparent' : DESK.mint }} />
									<Box
										sx={{
											flexShrink: 0,
											width: 72,
											height: 72,
											borderRadius: '22px',
											bgcolor: '#FFFFFF',
											border: `2px solid ${DESK.primary}`,
											color: DESK.primary,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<Icon d={s.icon} size={30} />
									</Box>
									<Box sx={{ flexGrow: 1, height: 2, bgcolor: i === STEPS.length - 1 ? 'transparent' : DESK.mint }} />
								</Box>
								<Box sx={{ height: 26, px: 1.25, borderRadius: '9999px', bgcolor: DESK.primary, color: '#FFFFFF', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>
									Step {i + 1}
								</Box>
								<Typography component="b" sx={{ fontSize: 18, fontWeight: 700 }}>
									{s.title}
								</Typography>
								<Typography sx={{ fontSize: 14, lineHeight: '21px', color: DESK.muted }}>{s.text}</Typography>
							</Box>
						))}
					</Box>
				</Box>
			</Box>

			{/* Always / never */}
			<Box sx={{ bgcolor: '#FFFFFF' }}>
				<Box sx={{ ...wrapSx, py: { xs: 5, md: 10 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
					<ChecklistCard
						title="What we always do"
						items={ALWAYS}
						tone={{ bg: DESK.successSoft, ink: DESK.success }}
						mark={<Icon d={PATHS.check} size={20} stroke={2.6} />}
					/>
					<ChecklistCard
						title="What we never do"
						items={NEVER}
						tone={{ bg: DESK.dangerSoft, ink: DESK.danger }}
						mark={<Icon d={PATHS.cross} size={20} stroke={2.6} />}
					/>
				</Box>
			</Box>

			{/* Your controls */}
			<Box sx={{ bgcolor: DESK.page }}>
				<Box sx={{ ...wrapSx, py: { xs: 4, md: 7 } }}>
					<Box
						sx={{
							px: { xs: 3, md: 5 },
							py: { xs: 3, md: 4.5 },
							borderRadius: '28px',
							bgcolor: DESK.primarySoft,
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: '88px 1fr auto' },
							gap: { xs: 2.5, md: 3.5 },
							alignItems: 'center',
						}}
					>
						<Box sx={{ width: 88, height: 88, borderRadius: '26px', bgcolor: DESK.primary, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<Icon d={PATHS.sliders} size={42} />
						</Box>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
							<Typography sx={eyebrowSx}>YOUR CONTROLS</Typography>
							<Typography component="h2" sx={{ fontSize: 24, lineHeight: '31px', fontWeight: 800 }}>
								You{'’'}re in control
							</Typography>
							<Typography sx={{ fontSize: 15, lineHeight: '24px', color: DESK.inkSoft }}>
								Read our privacy policy to see what information we collect, why we need it, and how we keep it safe.
							</Typography>
						</Box>
						<Box
							component={RouterLink}
							to={ROUTES.PUBLIC.PRIVACY}
							sx={{
								height: 48,
								px: 2.5,
								borderRadius: '12px',
								bgcolor: DESK.primary,
								color: '#FFFFFF',
								fontSize: 15,
								fontWeight: 800,
								textDecoration: 'none',
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								whiteSpace: 'nowrap',
								'&:hover': { bgcolor: DESK.primaryDark },
							}}
						>
							Privacy policy
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
