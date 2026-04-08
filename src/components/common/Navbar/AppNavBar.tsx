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
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import AppButton from '../Button/AppButton'

const navItems = [
	{ label: 'Home', href: '/#home' },
	// { label: 'About', href: '#about' },
	{ label: 'Services', href: '/#services' },
	{ label: 'Find doctors', href: '/doctors/search' },
	{ label: 'Community', href: '/#community' },
	// { label: 'Blog & Media', href: '/#blog-media' },
	// { label: 'Events', href: '#events' },
	{ label: 'Contact', href: '/#contact' },
	{ label: 'Demo', href: '#' },
]

const AppNavBar: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const theme = useTheme()
	const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
	const [mobileOpen, setMobileOpen] = useState(false)
	const [activeHref, setActiveHref] = useState<string>('/#home')

	const handleDrawerToggle = () => setMobileOpen((prev) => !prev)
	const handleNavClick = (href: string) => {
		setActiveHref(href)
		if (href === '#') return
		// debugger
		if (href.startsWith('/#')) {
			if (location.pathname === '/') {
				const targetId = href.replace('/#', '')
				const target = document.getElementById(targetId)
				if (target) {
					target.scrollIntoView({ behavior: 'smooth', block: 'start' })
				}
				window.history.replaceState(null, '', href)
				return
			}
			navigate('/')
			window.location.hash = href.replace('/#', '')
			return
		}

		navigate(href)
	}

	const hashSectionIds = useMemo(
		() => navItems.filter((item) => item.href.startsWith('/#')).map((item) => item.href.replace('/#', '')),
		[]
	)

	useEffect(() => {
		const current = `${location.pathname}${location.hash || ''}`
		if (current !== '/') {
			setActiveHref(current)
			return
		}

		if (location.hash) {
			setActiveHref(`/${location.hash}`)
		} else {
			setActiveHref('/#home')
		}
	}, [location.pathname, location.hash])

	useEffect(() => {
		if (location.pathname !== '/') return

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
					if (top - offset <= 0) {
						current = `/#${id}`
					}
				}

				setActiveHref(current)
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
	}, [hashSectionIds, isMdUp, location.pathname])

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
						{/* Logo */}
						<Box
							sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
							onClick={() => navigate('/')}
						>
							<Typography
								variant="h6"
								sx={{ fontWeight: 700, fontStyle: 'italic', color: 'white', letterSpacing: '-0.01em' }}
							>
								Whisper AI
							</Typography>
						</Box>

						{/* Vertical Divider */}
						{isMdUp && <Box sx={{ width: '1px', height: '22px', bgcolor: 'rgba(255,255,255,0.3)' }} />}

						{/* Nav Links */}
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

					{/* Right: Log In | Sign up */}
					{isMdUp ? (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						{/* Location pill */}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 0.5,
								border: '1px solid rgba(255,255,255,0.5)',
								borderRadius: '10px',
								px: 1.5,
								py: 0.5,
								cursor: 'pointer',
								color: 'rgba(255,255,255,0.88)',
								'&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
							}}
						>
							<LocationOnIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.8)' }} />
							<Typography variant='body2' sx={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>
								Bengaluru, KR Market
							</Typography>
							<KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
						</Box>

						{/* Vertical Divider */}
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

							{/* Vertical Divider */}
							<Box sx={{ width: '1px', height: '22px', bgcolor: 'rgba(255,255,255,0.3)' }} />

							{/* Sign Up Button */}
							<AppButton
								variant="text"
								label="Sign up"
								onClick={() => navigate('/register')}
								borderRadius="20px"
							/>
						</Box>
					) : (
						<IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }} aria-label="Open menu">
							<MenuIcon />
						</IconButton>
					)}
				</Toolbar>
			</Box>
			<Drawer
				anchor="right"
				open={mobileOpen}
				onClose={handleDrawerToggle}
				PaperProps={{
					sx: {
						width: 280,
						bgcolor: 'primary.dark',
						color: 'white',
						px: 2,
					},
				}}
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
							sx={{
								borderRadius: 1,
								'&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
							}}
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
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2 }}>
					<Button
						onClick={() => {
							handleDrawerToggle()
							navigate('/login')
						}}
						variant="text"
						sx={{
							color: 'rgba(255,255,255,0.9)',
							textTransform: 'none',
							// justifyContent: 'flex-start',
						}}
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
			</Drawer>
		</AppBar>
	)
}

export default AppNavBar
