import React, { useState } from 'react'
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
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import AppButton from '../Button/AppButton'

const navItems = ['Home', 'About', 'Services', 'Community', 'Blog & Media', 'Events', 'Contact']

const AppNavBar: React.FC = () => {
	const navigate = useNavigate()
	const theme = useTheme()
	const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
	const [mobileOpen, setMobileOpen] = useState(false)

	const handleDrawerToggle = () => setMobileOpen((prev) => !prev)

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
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
										key={item}
										variant="body2"
										sx={{
											cursor: 'pointer',
											color: item === 'Home' ? '#13C0C5' : 'rgba(255,255,255,0.88)',
											fontWeight: item === 'Home' ? 600 : 400,
											fontSize: '14.5px',
											'&:hover': { color: '#13C0C5' },
											transition: 'color 0.15s',
										}}
									>
										{item}
									</Typography>
								))}
							</Box>
						)}
					</Box>

					{/* Right: Log In | Sign up */}
					{isMdUp ? (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
							key={item}
							onClick={() => {
								handleDrawerToggle()
							}}
							sx={{
								borderRadius: 1,
								'&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
							}}
						>
							<ListItemText
								primary={item}
								primaryTypographyProps={{
									fontSize: '14px',
									fontWeight: item === 'Home' ? 600 : 400,
									color: item === 'Home' ? '#13C0C5' : 'rgba(255,255,255,0.88)',
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
