// src/components/layout/AdminLayout.tsx
import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
	Box,
	Drawer,
	AppBar,
	Toolbar,
	Typography,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Avatar,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Divider,
	Tooltip,
	CssBaseline,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import PeopleIcon from '@mui/icons-material/People'
import EventNoteIcon from '@mui/icons-material/EventNote'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import AssessmentIcon from '@mui/icons-material/Assessment'
import CategoryIcon from '@mui/icons-material/Category'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'

import { useAuth, clearAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../constants/routes'

const SIDEBAR_WIDTH = 260

interface MenuItemDef {
	label: string
	path: string
	icon: React.ReactNode
}

const MENU_ITEMS: MenuItemDef[] = [
	{ label: 'Overview', path: ROUTES.ADMIN.DASHBOARD, icon: <DashboardIcon /> },
	{ label: 'Verifications', path: ROUTES.ADMIN.VERIFICATIONS, icon: <VerifiedUserIcon /> },
	{ label: 'User Moderation', path: ROUTES.ADMIN.USERS, icon: <PeopleIcon /> },
	{ label: 'Appointments', path: ROUTES.ADMIN.APPOINTMENTS, icon: <EventNoteIcon /> },
	{ label: 'Billing & Transactions', path: ROUTES.ADMIN.BILLING, icon: <ReceiptLongIcon /> },
	{ label: 'Audits & Chatbot Logs', path: ROUTES.ADMIN.AUDITS, icon: <AssessmentIcon /> },
	{ label: 'Specialities Catalog', path: ROUTES.ADMIN.SPECIALITIES, icon: <CategoryIcon /> },
]

export default function AdminLayout() {
	const navigate = useNavigate()
	const location = useLocation()
	const { user, role } = useAuth()
	const [mobileOpen, setMobileOpen] = useState(false)
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

	const handleLogout = () => {
		clearAuth()
		navigate(ROUTES.ADMIN.LOGIN, { replace: true })
	}

	const drawerContent = (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a', color: '#f8fafc' }}>
			{/* Sidebar Branding Header */}
			<Box
				sx={{
					p: 2.5,
					display: 'flex',
					alignItems: 'center',
					gap: 1.5,
					borderBottom: '1px solid rgba(255,255,255,0.08)',
				}}
			>
				<Avatar
					sx={{
						bgcolor: '#0d9488',
						color: '#ffffff',
						width: 42,
						height: 42,
						boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)',
					}}
				>
					<AdminPanelSettingsIcon />
				</Avatar>
				<Box>
					<Typography variant="subtitle1" fontWeight={800} sx={{ color: '#ffffff', lineHeight: 1.2, letterSpacing: -0.2 }}>
						HealthAdmin
					</Typography>
					<Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
						Management Portal
					</Typography>
				</Box>
			</Box>

			{/* Navigation Links */}
			<Box sx={{ flex: 1, py: 2.5, px: 1.5, overflowY: 'auto' }}>
				<Typography
					variant="caption"
					sx={{
						px: 1.5,
						pb: 1,
						display: 'block',
						fontSize: 10,
						fontWeight: 700,
						color: '#64748b',
						textTransform: 'uppercase',
						letterSpacing: '0.08em',
					}}
				>
					Main Navigation
				</Typography>
				<List component="nav" disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
					{MENU_ITEMS.map((item) => {
						const active = location.pathname === item.path
						return (
							<ListItemButton
								key={item.path}
								onClick={() => {
									navigate(item.path)
									setMobileOpen(false)
								}}
								sx={{
									borderRadius: 2.5,
									py: 1.25,
									px: 2,
									bgcolor: active ? 'rgba(13, 148, 136, 0.15)' : 'transparent',
									color: active ? '#2dd4bf' : '#94a3b8',
									borderLeft: active ? '3px solid #2dd4bf' : '3px solid transparent',
									transition: 'all 0.15s ease',
									'&:hover': {
										bgcolor: active ? 'rgba(13, 148, 136, 0.22)' : 'rgba(255, 255, 255, 0.05)',
										color: '#f8fafc',
									},
								}}
							>
								<ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
								<ListItemText
									primary={item.label}
									primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 700 : 500 }}
								/>
							</ListItemButton>
						)
					})}
				</List>
			</Box>

			{/* Sidebar Footer User Card */}
			<Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', bgcolor: '#0b1329' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Box sx={{ overflow: 'hidden', mr: 1 }}>
						<Typography variant="body2" fontWeight={700} noWrap sx={{ color: '#ffffff', fontSize: 13 }}>
							{user?.name || user?.email || 'Admin User'}
						</Typography>
						<Chip
							label={(role || 'ADMIN').replace('_', ' ').toUpperCase()}
							size="small"
							sx={{
								height: 18,
								fontSize: 9,
								fontWeight: 700,
								bgcolor: 'rgba(13, 148, 136, 0.2)',
								color: '#2dd4bf',
								border: '1px solid rgba(45, 212, 191, 0.3)',
								mt: 0.5,
							}}
						/>
					</Box>
					<Tooltip title="Sign Out">
						<IconButton onClick={handleLogout} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}>
							<LogoutIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			</Box>
		</Box>
	)

	return (
		<Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
			<CssBaseline />

			{/* Top Header Bar */}
			<AppBar
				position="fixed"
				elevation={0}
				sx={{
					width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
					ml: { md: `${SIDEBAR_WIDTH}px` },
					bgcolor: '#ffffff',
					color: '#0f172a',
					borderBottom: '1px solid #e2e8f0',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
			>
				<Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<IconButton
							color="inherit"
							edge="start"
							onClick={() => setMobileOpen(!mobileOpen)}
							sx={{ mr: 2, display: { md: 'none' } }}
						>
							<MenuIcon />
						</IconButton>

						<Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a', fontSize: '1.1rem' }}>
							{MENU_ITEMS.find((m) => m.path === location.pathname)?.label || 'Admin Portal'}
						</Typography>
					</Box>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Chip
							label={(role || 'ADMIN').replace('_', ' ').toUpperCase()}
							size="small"
							sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }}
						/>
						<IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
							<Avatar sx={{ width: 36, height: 36, bgcolor: '#0d9488', fontSize: 14, fontWeight: 700 }}>
								{(user?.name || user?.email || 'A').substring(0, 1).toUpperCase()}
							</Avatar>
						</IconButton>
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={() => setAnchorEl(null)}
							transformOrigin={{ horizontal: 'right', vertical: 'top' }}
							anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
						>
							<MenuItem disabled sx={{ opacity: '1 !important' }}>
								<Box>
									<Typography variant="subtitle2" fontWeight={700}>
										{user?.name || 'Administrator'}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{user?.email || 'admin@healthcare.com'}
									</Typography>
								</Box>
							</MenuItem>
							<Divider />
							<MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
								<LogoutIcon fontSize="small" sx={{ mr: 1 }} />
								Logout
							</MenuItem>
						</Menu>
					</Box>
				</Toolbar>
			</AppBar>

			{/* Sidebar Drawer Container */}
			<Box component="nav" sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}>
				{/* Mobile Drawer */}
				<Drawer
					variant="temporary"
					open={mobileOpen}
					onClose={() => setMobileOpen(false)}
					ModalProps={{ keepMounted: true }}
					sx={{
						display: { xs: 'block', md: 'none' },
						'& .MuiDrawer-paper': { boxSizing: 'border-box', width: SIDEBAR_WIDTH },
					}}
				>
					{drawerContent}
				</Drawer>

				{/* Permanent Desktop Sidebar */}
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: 'none', md: 'block' },
						'& .MuiDrawer-paper': {
							boxSizing: 'border-box',
							width: SIDEBAR_WIDTH,
							borderRight: '1px solid #1e293b',
						},
					}}
					open
				>
					{drawerContent}
				</Drawer>
			</Box>

			{/* Main Content View Container */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					width: 0,
					p: { xs: 2.5, md: 4 },
					mt: '64px',
					minHeight: 'calc(100vh - 64px)',
					boxSizing: 'border-box',
				}}
			>
				<Outlet />
			</Box>
		</Box>
	)
}
