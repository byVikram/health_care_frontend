// src/features/lab/components/LabBrowseHero.tsx
//
// The dark band at the top of the browse page: breadcrumb, title, the free-collection line, the search box and the four trust tiles.
import { Box } from '@mui/material'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { ROUTES } from '../../../constants/routes'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'

const TRUCK = 'M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a2 2 0 1 0 0-.01M17 19a2 2 0 1 0 0-.01'
const REPORT = 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h4'

const TRUST = [
	{ icon: DESK_ICONS.home, label: 'Free home collection' },
	{ icon: DESK_ICONS.shield, label: 'NABL-accredited labs' },
	{ icon: DESK_ICONS.user, label: 'Trained phlebotomists' },
	{ icon: REPORT, label: 'Reports in 24–48 hrs' },
]

interface LabBrowseHeroProps {
	search: string
	onSearch: (value: string) => void
}

export default function LabBrowseHero({ search, onSearch }: LabBrowseHeroProps) {
	return (
		<Box
			component="section"
			sx={{
				position: 'relative',
				overflow: 'hidden',
				color: '#FFFFFF',
				background: `radial-gradient(50% 120% at 100% 0%, ${DESK.primary} 0%, ${DESK.primary}00 70%), radial-gradient(40% 90% at 0% 100%, ${DESK.heroGlow} 0%, ${DESK.heroGlow}00 70%), ${DESK.hero}`,
			}}
		>
			<Box
				sx={{
					maxWidth: 1240,
					mx: 'auto',
					px: '24px',
					boxSizing: 'border-box',
					pt: '28px',
					pb: '30px',
					display: 'flex',
					alignItems: 'flex-end',
					gap: '40px',
				}}
			>
				<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<Box component="nav" aria-label="Breadcrumb" sx={{ fontSize: 13, color: DESK.mint }}>
						<Box
							component={Link}
							to={ROUTES.PORTAL.HOME}
							sx={{ color: DESK.mint, fontWeight: 700, textDecoration: 'none' }}
						>
							Home
						</Box>{' '}
						/ <Box component="span" sx={{ color: '#FFFFFF' }}>Lab tests</Box>
					</Box>
					<Box
						component="h1"
						sx={{ m: 0, fontSize: 36, lineHeight: '44px', fontWeight: 800, letterSpacing: '-0.02em' }}
					>
						Lab tests &amp; health packages
					</Box>
					<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 15, color: DESK.mintText }}>
						<Box component="span" sx={{ display: 'flex', color: DESK.mint }}>
							<DeskIcon d={TRUCK} size={18} />
						</Box>
						Free home sample collection · Pick a day and time that suits you
					</Box>
					<Box
						component="label"
						sx={{
							mt: '8px',
							width: 680,
							maxWidth: '100%',
							height: 56,
							boxSizing: 'border-box',
							pl: '16px',
							pr: '8px',
							borderRadius: '14px',
							bgcolor: DESK.raised,
							color: DESK.muted,
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
						}}
					>
						<DeskIcon d={DESK_ICONS.search} size={20} />
						<Box
							component="input"
							type="search"
							value={search}
							onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
							placeholder="Search tests, packages or health concerns — e.g. thyroid, HbA1c, vitamin D"
							aria-label="Search lab tests and packages"
							sx={{
								flexGrow: 1,
								minWidth: 0,
								height: 48,
								border: 0,
								outline: 0,
								bgcolor: 'transparent',
								fontFamily: 'inherit',
								fontSize: 16,
								color: DESK.ink,
								'&::placeholder': { color: DESK.faint },
								'&::-webkit-search-cancel-button': { display: 'none' },
							}}
						/>
						{search ? (
							<Box
								component="button"
								type="button"
								onClick={() => onSearch('')}
								aria-label="Clear search"
								sx={{
									width: 32,
									height: 32,
									border: 0,
									borderRadius: '8px',
									bgcolor: DESK.chip,
									color: DESK.inkSoft,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: 'pointer',
								}}
							>
								<DeskIcon d={DESK_ICONS.close} size={14} strokeWidth={2.4} />
							</Box>
						) : null}
					</Box>
				</Box>
				<Box
					sx={{
						flexShrink: 0,
						display: { xs: 'none', lg: 'grid' },
						gridTemplateColumns: '1fr 1fr',
						gap: '10px',
					}}
				>
					{TRUST.map((t) => (
						<Box
							key={t.label}
							component="span"
							sx={{
								width: 190,
								p: '12px 14px',
								boxSizing: 'border-box',
								borderRadius: '14px',
								bgcolor: '#FFFFFF14',
								border: '1px solid #FFFFFF26',
								display: 'flex',
								alignItems: 'center',
								gap: '10px',
								fontSize: 13,
								fontWeight: 700,
							}}
						>
							<Box component="span" sx={{ display: 'flex', color: DESK.mint }}>
								<DeskIcon d={t.icon} size={20} />
							</Box>
							{t.label}
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	)
}
