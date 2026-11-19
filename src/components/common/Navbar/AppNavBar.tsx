import React, { useEffect, useMemo, useState } from 'react'
import {
	AppBar,
	Toolbar,
	Typography,
	Box,
	Button,
	IconButton,
	Drawer,
	List,
	ListItemButton,
	ListItemText,
	useMediaQuery,
	Avatar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import AppButton from '../Button/AppButton'
import LocationPickerModal from './LocationPickerModal'
import { useAuth } from '../../../hooks/useAuth'
import NotificationPanel from '../../../features/referrals/NotificationPanel'

const navItems = [
	{ label: 'Home', href: '/#home' },
	{ label: 'Services', href: '/#services' },
	{ label: 'Find doctors', href: '/doctors/search' },
	{ label: 'Lab tests', href: '/lab-tests' },
	{ label: 'Community', href: '/communities' },
	{ label: 'Blogs', href: '/blogs' },
	{ label: 'Contact', href: '/#contact' },
]

const hashSectionIds = navItems.filter((item) => item.href.startsWith('/#')).map((item) => item.href.replace('/#', ''))

interface AppNavBarProps {
	onProfileClick?: () => void
	avatarSrc?: string
}

const AppNavBar: React.FC<AppNavBarProps> = ({ onProfileClick, avatarSrc }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const theme = useTheme()
	const isMdUp = useMediaQuery(theme.breakpoints.up('md'))

	const [mobileOpen, setMobileOpen] = useState(false)
	const [locationOpen, setLocationOpen] = useState(false)
	// "Area, City" once an area is confirmed, a bare city name or "Current location".
	const [pickedLocation, setPickedLocation] = useState('Bengaluru')
	// Only used while scrolling on the home page
	const [scrollActiveHref, setScrollActiveHref] = useState<string>('/#home')

	const { accessToken } = useAuth()
	const isAuthenticated = Boolean(accessToken)

	const resolveHref = (href: string) => {
		if (!isAuthenticated) return href
		if (href === '/#home') return '/portal#home'
		if (href.startsWith('/#')) return `/portal${href.slice(1)}`
		return href
	}

	//  Derive activeHref from location — no setState inside effect
	const activeHref = useMemo(() => {
		if (location.pathname === '/portal') {
			if (!location.hash) return '/#home'
			return `/${location.hash}`
		}
		// every page of the lab flow (cart, review, order ...) keeps the Lab tests link lit
		if (location.pathname.startsWith('/lab-tests')) return '/lab-tests'
		const current = `${location.pathname}${location.hash || ''}`
		if (location.pathname !== '/') return current
		if (location.hash) return `/${location.hash}`
		// On home page with no hash, use scroll tracking result
		return scrollActiveHref
	}, [location.pathname, location.hash, scrollActiveHref])

	// Scroll tracking — only runs on home page
	useEffect(() => {
		if (location.pathname !== '/' && location.pathname !== '/portal') return
		let ticking = false
		const updateActive = () => {
			if (ticking) return
			ticking = true
			window.requestAnimationFrame(() => {
				const offset = isMdUp ? 96 : 80
				let current = '/#home'
				for (const id of hashSectionIds) {
					const el = document.getElementById(id)
					if (!el) continue
					const top = el.getBoundingClientRect().top
					if (top - offset <= 0) current = `/#${id}`
				}
				setScrollActiveHref(current)
				ticking = false
			})
		}
		window.addEventListener('scroll', updateActive, { passive: true })
		window.addEventListener('resize', updateActive)
		updateActive()
		return () => {
			window.removeEventListener('scroll', updateActive)
			window.removeEventListener('resize', updateActive)
		}
	}, [isMdUp, location.pathname])

	useEffect(() => {
		if ((location.pathname !== '/' && location.pathname !== '/portal') || !location.hash) return
		window.requestAnimationFrame(() => {
			const target = document.getElementById(location.hash.slice(1))
			if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
		})
	}, [location.pathname, location.hash])

	const handleDrawerToggle = () => setMobileOpen((prev) => !prev)

	const handleNavClick = (href: string) => {
		if (href === '#') return
		const nextHref = resolveHref(href)
		if (nextHref.includes('#')) {
			const [nextPath, targetId] = nextHref.split('#')
			if (location.pathname === nextPath) {
				const target = document.getElementById(targetId)
				if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
				window.history.replaceState(null, '', nextHref)
				return
			}
			navigate(nextHref)
			return
		}
		navigate(nextHref)
	}

	return (
		<AppBar position="sticky" sx={{ bgcolor: 'primary.dark', padding: 1, boxShadow: 'none' }}>
			<Box
				sx={{
					border: '1px solid rgba(255,255,255,0.25)',
					borderRadius: '10px',
					background: 'rgba(255,255,255,0.07)',
					backdropFilter: 'blur(10px)',
					WebkitBackdropFilter: 'blur(10px)',
				}}
			>
				<Toolbar sx={{ justifyContent: 'space-between', minHeight: '52px !important', px: 2 }}>
					{/* Left: Logo + Divider + Nav Links */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
						<Box
							sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
							onClick={() => navigate(isAuthenticated ? '/portal' : '/')}
						>
							<Typography
								variant="h6"
								sx={{ fontWeight: 700, fontStyle: 'italic', color: 'white', letterSpacing: '-0.01em' }}
							>
								Whisper AI
							</Typography>
						</Box>

						{isMdUp && <Box sx={{ width: '1px', height: '22px', bgcolor: 'rgba(255,255,255,0.3)' }} />}

						{isMdUp && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
								{navItems.map((item) => (
									<Typography
										key={item.href}
										variant="body2"
										sx={{
											cursor: 'pointer',
											color: activeHref === item.href ? '#13C0C5' : 'rgba(255,255,255,0.88)',
											fontWeight: activeHref === item.href ? 600 : 400,
											fontSize: '14.5px',
											'&:hover': { color: '#13C0C5' },
											transition: 'color 0.15s',
										}}
										onClick={() => handleNavClick(item.href)}
									>
										{item.label}
									</Typography>
								))}
							</Box>
						)}
					</Box>

					{/* Right */}
					{isMdUp ? (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
							{/* Location pill: opens the city picker */}
							<Box
								onClick={() => setLocationOpen(true)}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 0.5,
									borderRadius: '10px',
									px: 1.5,
									py: 0.5,
									cursor: 'pointer',
									bgcolor: locationOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
									'&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
									transition: 'background 0.15s',
									userSelect: 'none',
								}}
							>
								<LocationOnIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', flexShrink: 0 }} />
								<Typography
									variant="body2"
									sx={{
										fontSize: '13px',
										fontWeight: 500,
										color: '#fff',
										whiteSpace: 'nowrap',
										maxWidth: 200,
										overflow: 'hidden',
										textOverflow: 'ellipsis',
									}}
								>
									{pickedLocation}
								</Typography>
								<KeyboardArrowDownIcon sx={{ fontSize: 15, color: '#fff' }} />
							</Box>

							<LocationPickerModal
								open={locationOpen}
								selected={pickedLocation}
								onClose={() => setLocationOpen(false)}
								onSelect={setPickedLocation}
							/>

							{/* Notification bell for authenticated users */}
							{accessToken && <NotificationPanel iconColor="#fff" />}

							{/* Avatar for authenticated patient — triggers profile dropdown */}
							{accessToken && onProfileClick && (
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 0.5,
										cursor: 'pointer',
										borderRadius: '20px',
										px: 0.5,
										py: 0.25,
										'&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
										transition: 'background 0.15s',
									}}
									onClick={onProfileClick}
								>
									<Avatar
										src={avatarSrc}
										sx={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.5)' }}
									/>
									<KeyboardArrowDownIcon sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 18 }} />
								</Box>
							)}

							{!accessToken && (
								<>
									<Box sx={{ width: '1px', height: '22px', bgcolor: 'rgba(255,255,255,0.3)' }} />

									<Button
										onClick={() => navigate('/login')}
										variant="text"
										sx={{
											color: 'rgba(255,255,255,0.88)',
											textTransform: 'none',
											fontWeight: 400,
											fontSize: '14.5px',
											'&:hover': { color: '#fff', bgcolor: 'transparent' },
											'&:focus': { outline: 'none' },
										}}
									>
										Log In
									</Button>

									<Box sx={{ width: '1px', height: '22px', bgcolor: 'rgba(255,255,255,0.3)' }} />

									<AppButton
										variant="text"
										label="Sign up"
										onClick={() => navigate('/register')}
										borderRadius="20px"
									/>
								</>
							)}
						</Box>
					) : (
						<IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }} aria-label="Open menu">
							<MenuIcon />
						</IconButton>
					)}
				</Toolbar>
			</Box>

			{/* Mobile Drawer */}
			<Drawer
				anchor="right"
				open={mobileOpen}
				onClose={handleDrawerToggle}
				PaperProps={{ sx: { width: 280, bgcolor: 'primary.dark', color: 'white', px: 2 } }}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
					<Typography sx={{ fontWeight: 700, fontStyle: 'italic' }}>Whisper AI</Typography>
					<IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }} aria-label="Close menu">
						<CloseIcon />
					</IconButton>
				</Box>
				<List sx={{ mb: 2 }}>
					{navItems.map((item) => (
						<ListItemButton
							key={item.href}
							onClick={() => {
								handleDrawerToggle()
								handleNavClick(item.href)
							}}
							sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
						>
							<ListItemText
								primary={item.label}
								primaryTypographyProps={{
									fontSize: '14px',
									fontWeight: activeHref === item.href ? 600 : 400,
									color: activeHref === item.href ? '#13C0C5' : 'rgba(255,255,255,0.88)',
								}}
							/>
						</ListItemButton>
					))}
				</List>
				{!accessToken && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2 }}>
						<Button
							onClick={() => {
								handleDrawerToggle()
								navigate('/login')
							}}
							variant="text"
							sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'none' }}
						>
							Log In
						</Button>
						<AppButton
							variant="text"
							label="Sign up"
							onClick={() => {
								handleDrawerToggle()
								navigate('/register')
							}}
							borderRadius="20px"
						/>
					</Box>
				)}
			</Drawer>
		</AppBar>
	)
}

export default AppNavBar
