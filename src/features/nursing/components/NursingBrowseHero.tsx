// src/features/nursing/components/NursingBrowseHero.tsx
//
// The dark band at the top of the browse page (the Lab tests hero, with the Nursing care at home design's words): breadcrumb, title, the one-line
// promise, the search box and the trust tiles.
import { Box } from '@mui/material'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { ROUTES } from '../../../constants/routes'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import VoiceMicButton from '../../../components/common/Voice/VoiceMicButton'
import { useCareService } from '../useCareService'

interface NursingBrowseHeroProps {
	search: string
	onSearch: (value: string) => void
}

export default function NursingBrowseHero({ search, onSearch }: NursingBrowseHeroProps) {
	const care = useCareService()
	return (
		<Box
			component="section"
			sx={{
				position: 'relative',
				overflow: 'hidden',
				color: '#FFFFFF',
				bgcolor: DESK.primary,
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
						<Box component={Link} to={ROUTES.PORTAL.HOME} sx={{ color: DESK.mint, fontWeight: 700, textDecoration: 'none' }}>
							Home
						</Box>{' '}
						/ <Box component="span">Care at home</Box> / <Box component="span" sx={{ color: '#FFFFFF' }}>{care.sentence}</Box>
					</Box>
					<Box component="h1" sx={{ m: 0, fontSize: 36, lineHeight: '44px', fontWeight: 800, letterSpacing: '-0.02em' }}>
						{care.title}
					</Box>
					<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 15, color: DESK.mintText }}>
						<Box component="span" sx={{ display: 'flex', color: DESK.mint }}>
							<DeskIcon d={DESK_ICONS.homeCare} size={18} />
						</Box>
						{care.tagline}
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
							placeholder={care.searchPlaceholder}
							aria-label={care.searchLabel}
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
						<VoiceMicButton onResult={onSearch} />
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
				<Box sx={{ flexShrink: 0, display: { xs: 'none', lg: 'grid' }, gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
					{care.trust.map((t) => (
						<Box
							key={t.label}
							component="span"
							sx={{
								width: 200,
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
								<DeskIcon d={DESK_ICONS[t.icon]} size={20} />
							</Box>
							{t.label}
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	)
}
