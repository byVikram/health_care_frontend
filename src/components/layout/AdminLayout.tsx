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
	Stack,
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
import ArticleIcon from '@mui/icons-material/Article'
import CommentIcon from '@mui/icons-material/Comment'
import RateReviewIcon from '@mui/icons-material/RateReview'
import CampaignIcon from '@mui/icons-material/Campaign'
import GroupsIcon from '@mui/icons-material/Groups'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'

import { useAuth, clearAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import { customScrollbar } from '../../styles/commonStyles'

interface MenuItemDef {
	label: string
	path: string
	icon: React.ReactNode
}

interface NavGroup {
	groupLabel: string
	items: MenuItemDef[]
}

const getNavGroups = (userRole: string | null): NavGroup[] => {
	const groups: NavGroup[] = [
		{
			groupLabel: 'Overview',
			items: [
				{ label: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD, icon: <DashboardIcon /> },
			],
		},
		{
			groupLabel: 'Operations',
			items: [
				{ label: 'Verifications', path: ROUTES.ADMIN.VERIFICATIONS, icon: <VerifiedUserIcon /> },
				{ label: 'Users', path: ROUTES.ADMIN.USERS, icon: <PeopleIcon /> },
				{ label: 'Reviews', path: ROUTES.ADMIN.REVIEWS, icon: <RateReviewIcon /> },
				{ label: 'Appointments', path: ROUTES.ADMIN.APPOINTMENTS, icon: <EventNoteIcon /> },
				{ label: 'Ancillary Operations', path: ROUTES.ADMIN.ANCILLARY, icon: <MedicalServicesIcon /> },
				{ label: 'Billing', path: ROUTES.ADMIN.BILLING, icon: <ReceiptLongIcon /> },
			],
		},
		{
			groupLabel: 'Content',
			items: [
				{ label: 'Blog Posts', path: ROUTES.ADMIN.BLOGS, icon: <ArticleIcon /> },
				{ label: 'Articles', path: ROUTES.ADMIN.ARTICLES, icon: <MenuBookIcon /> },
				{ label: 'Communities', path: ROUTES.ADMIN.COMMUNITIES, icon: <GroupsIcon /> },
				{ label: 'Events', path: ROUTES.ADMIN.EVENTS, icon: <EventNoteIcon /> },
				{ label: 'Comments', path: ROUTES.ADMIN.COMMENTS, icon: <CommentIcon /> },
				{ label: 'Q&As', path: ROUTES.ADMIN.QA, icon: <QuestionAnswerIcon /> },
				{ label: 'Advertisements', path: ROUTES.ADMIN.ADS, icon: <CampaignIcon /> },
			],
		},
	]

	if (userRole === 'super_admin') {
		groups.push({
			groupLabel: 'Admins',
			items: [
				{ label: 'Admins', path: ROUTES.ADMIN.ADMINS, icon: <AdminPanelSettingsIcon /> },
			],
		})
	}

	groups.push({
		groupLabel: 'System',
		items: [
			{ label: 'Specialities', path: ROUTES.ADMIN.SPECIALITIES, icon: <CategoryIcon /> },
			{ label: 'Audit Logs', path: ROUTES.ADMIN.AUDITS, icon: <AssessmentIcon /> },
		],
	})

	return groups
}

export default function AdminLayout() {
	const navigate = useNavigate()
	const location = useLocation()
	const { user, role } = useAuth()
	const [mobileOpen, setMobileOpen] = useState(false)
	const [collapsed, setCollapsed] = useState(false)
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

	const navGroups = getNavGroups(role)
	const allItems = navGroups.flatMap((g) => g.items)


	const sidebarWidth = collapsed ? 76 : 260

	const handleLogout = () => {
		clearAuth()
		navigate(ROUTES.ADMIN.LOGIN, { replace: true })
	}

	const isActive = (path: string) =>
		path === ROUTES.ADMIN.DASHBOARD
			? location.pathname === path
			: location.pathname.startsWith(path)

	const drawerContent = (
		<Box
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				bgcolor: '#0f172a',
				color: '#f8fafc',
				transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
			}}
		>
			{/* ── Branding Header ── */}
			<Box
				sx={{
					p: collapsed ? 1.5 : 2.5,
					display: 'flex',
					alignItems: 'center',
					justifyContent: collapsed ? 'center' : 'space-between',
					borderBottom: '1px solid rgba(255,255,255,0.06)',
					minHeight: 64,
					boxSizing: 'border-box',
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
					<Avatar
						sx={{
							bgcolor: '#0d9488',
							color: '#ffffff',
							width: 36,
							height: 36,
							flexShrink: 0,
							boxShadow: '0 4px 12px rgba(13, 148, 136, 0.45)',
						}}
					>
						<AdminPanelSettingsIcon sx={{ fontSize: 18 }} />
					</Avatar>
					{!collapsed && (
						<Box sx={{ minWidth: 0 }}>
							<Typography
								variant="subtitle1"
								fontWeight={800}
								noWrap
								sx={{ color: '#ffffff', lineHeight: 1.2, letterSpacing: -0.3, fontSize: '0.95rem' }}
							>
								HealthAdmin
							</Typography>
							<Typography variant="caption" noWrap sx={{ color: '#64748b', fontWeight: 500, display: 'block', fontSize: '0.68rem' }}>
								Management Portal
							</Typography>
						</Box>
					)}
				</Box>

				{/* {!collapsed && (
					<IconButton
						onClick={() => setCollapsed(true)}
						size="small"
						sx={{ color: '#475569', '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.06)' } }}
					>
						<ChevronLeftIcon fontSize="small" />
					</IconButton>
				)} */}
			</Box>

			{/* ── Navigation Groups ── */}
			<Box sx={{ flex: 1, py: 2, px: collapsed ? 1 : 1.5, overflowY: 'auto', ...customScrollbar }}>
				{navGroups.map((group, gi) => (
					<Box key={group.groupLabel} sx={{ mb: collapsed ? 1.5 : 0.5 }}>
						{!collapsed && (
							<Typography
								variant="caption"
								sx={{
									px: 1.5,
									pb: 1,
									pt: gi === 0 ? 0 : 2,
									display: 'block',
									fontSize: '0.62rem',
									fontWeight: 700,
									color: '#475569',
									textTransform: 'uppercase',
									letterSpacing: '0.1em',
								}}
							>
								{group.groupLabel}
							</Typography>
						)}
						{collapsed && gi > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />}
						<List component="nav" disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
							{group.items.map((item) => {
								const active = isActive(item.path)
								return (
									<Tooltip
										key={item.path}
										title={collapsed ? item.label : ''}
										placement="right"
										arrow
									>
										<ListItemButton
											onClick={() => {
												navigate(item.path)
												setMobileOpen(false)
											}}
											sx={{
												borderRadius: 2,
												py: 1.1,
												px: collapsed ? 1.5 : 1.5,
												justifyContent: collapsed ? 'center' : 'initial',
												bgcolor: active ? 'rgba(13, 148, 136, 0.15)' : 'transparent',
												color: active ? '#2dd4bf' : '#94a3b8',
												borderLeft: active && !collapsed ? '3px solid #2dd4bf' : '3px solid transparent',
												transition: 'all 0.15s ease',
												'&:hover': {
													bgcolor: active
														? 'rgba(13, 148, 136, 0.22)'
														: 'rgba(255, 255, 255, 0.05)',
													color: '#f8fafc',
												},
											}}
										>
											<ListItemIcon
												sx={{
													color: 'inherit',
													minWidth: collapsed ? 'auto' : 34,
													justifyContent: 'center',
													'& .MuiSvgIcon-root': { fontSize: 19 },
												}}
											>
												{item.icon}
											</ListItemIcon>
											{!collapsed && (
												<ListItemText
													primary={item.label}
													primaryTypographyProps={{
														fontSize: 13,
														fontWeight: active ? 700 : 500,
														noWrap: true,
													}}
												/>
											)}
										</ListItemButton>
									</Tooltip>
								)
							})}
						</List>
					</Box>
				))}
			</Box>

			{/* ── User Profile Footer ── */}
			{/* <Box
				sx={{
					borderTop: '1px solid rgba(255,255,255,0.06)',
					bgcolor: 'rgba(0,0,0,0.2)',
					p: collapsed ? 1.5 : 2,
				}}
			>
				{!collapsed ? (
					<Stack direction="row" alignItems="center" justifyContent="space-between">
						<Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
							<Avatar
								sx={{ width: 32, height: 32, bgcolor: '#0d9488', fontSize: 12, fontWeight: 800, flexShrink: 0 }}
							>
								{(user?.name || user?.email || 'A').substring(0, 1).toUpperCase()}
							</Avatar>
							<Box sx={{ minWidth: 0 }}>
								<Typography
									variant="body2"
									fontWeight={700}
									noWrap
									sx={{ color: '#e2e8f0', fontSize: 12.5 }}
								>
									{user?.name || user?.email || 'Admin User'}
								</Typography>
								<Chip
									label={(role || 'ADMIN').replace('_', ' ')}
									size="small"
									sx={{
										height: 16,
										fontSize: '0.58rem',
										fontWeight: 700,
										bgcolor: 'rgba(13, 148, 136, 0.2)',
										color: '#2dd4bf',
										border: '1px solid rgba(45, 212, 191, 0.25)',
										borderRadius: '4px',
										mt: 0.25,
									}}
								/>
							</Box>
						</Stack>
						<Tooltip title="Sign Out">
							<IconButton
								onClick={handleLogout}
								size="small"
								sx={{
									color: '#475569',
									flexShrink: 0,
									transition: 'color 0.15s ease',
									'&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' },
								}}
							>
								<LogoutIcon sx={{ fontSize: 18 }} />
							</IconButton>
						</Tooltip>
					</Stack>
				) : (
					<Stack alignItems="center" spacing={1.5}>
						<Tooltip title={user?.name || 'Admin'} placement="right">
							<Avatar sx={{ width: 32, height: 32, bgcolor: '#0d9488', fontSize: 12, fontWeight: 800 }}>
								{(user?.name || user?.email || 'A').substring(0, 1).toUpperCase()}
							</Avatar>
						</Tooltip>
						<Tooltip title="Sign Out" placement="right">
							<IconButton
								onClick={handleLogout}
								size="small"
								sx={{ color: '#475569', '&:hover': { color: '#ef4444' } }}
							>
								<LogoutIcon sx={{ fontSize: 16 }} />
							</IconButton>
						</Tooltip>
					</Stack>
				)}
			</Box> */}
		</Box>
	)

	const currentPageLabel = allItems.find((m) => isActive(m.path))?.label || 'Admin Portal'

	return (
		<Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
			<CssBaseline />

			{/* ── Top Header Bar ── */}
			<AppBar
				position="fixed"
				elevation={0}
				sx={{
					width: { md: `calc(100% - ${sidebarWidth}px)` },
					ml: { md: `${sidebarWidth}px` },
					bgcolor: '#ffffff',
					color: '#0f172a',
					borderBottom: '1px solid #e2e8f0',
					zIndex: (theme) => theme.zIndex.drawer + 1,
					transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
				}}
			>
				<Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: '64px !important' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						{/* Mobile hamburger */}
						<IconButton
							color="inherit"
							edge="start"
							onClick={() => setMobileOpen(!mobileOpen)}
							sx={{ display: { md: 'none' } }}
						>
							<MenuIcon />
						</IconButton>

						{/* Desktop sidebar toggle */}
						<IconButton
							color="inherit"
							onClick={() => setCollapsed(!collapsed)}
							sx={{
								display: { xs: 'none', md: 'inline-flex' },
								color: '#64748b',
								'&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
							}}
						>
							{collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
						</IconButton>

						{/* Page title */}
						<Box>
							<Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a', lineHeight: 1.2, fontSize: '0.95rem' }}>
								{currentPageLabel}
							</Typography>
							<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
								HealthAdmin Portal
							</Typography>
						</Box>
					</Box>

					{/* Right side */}
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Chip
							label={(role || 'ADMIN').replace(/_/g, ' ')}
							size="small"
							sx={{
								bgcolor: '#0f172a',
								color: '#ffffff',
								fontWeight: 700,
								fontSize: '0.65rem',
								display: { xs: 'none', sm: 'inline-flex' },
								borderRadius: '6px',
								height: 24,
							}}
						/>
						<Tooltip title="Account options">
							<IconButton
								onClick={(e) => setAnchorEl(e.currentTarget)}
								sx={{ p: 0.5 }}
							>
								<Avatar
									sx={{
										width: 34,
										height: 34,
										bgcolor: '#0d9488',
										fontSize: 13,
										fontWeight: 800,
										boxShadow: '0 2px 8px rgba(13,148,136,0.35)',
									}}
								>
									{(user?.name || user?.email || 'A').substring(0, 1).toUpperCase()}
								</Avatar>
							</IconButton>
						</Tooltip>
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={() => setAnchorEl(null)}
							transformOrigin={{ horizontal: 'right', vertical: 'top' }}
							anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
							PaperProps={{
								sx: { borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,0.12)', minWidth: 200 },
							}}
						>
							<Box sx={{ px: 2, py: 1.5 }}>
								<Typography variant="subtitle2" fontWeight={700}>
									{user?.name || 'Administrator'}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{user?.email || 'admin@whisperai.com'}
								</Typography>
							</Box>
							<Divider />
							<MenuItem onClick={handleLogout} sx={{ color: '#ef4444', gap: 1, py: 1.25 }}>
								<LogoutIcon fontSize="small" />
								<Typography variant="body2" fontWeight={600}>
									Sign Out
								</Typography>
							</MenuItem>
						</Menu>
					</Stack>
				</Toolbar>
			</AppBar>

			{/* ── Sidebar ── */}
			<Box
				component="nav"
				sx={{
					width: { md: sidebarWidth },
					flexShrink: { md: 0 },
					transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
				}}
			>
				{/* Mobile drawer */}
				<Drawer
					variant="temporary"
					open={mobileOpen}
					onClose={() => setMobileOpen(false)}
					ModalProps={{ keepMounted: true }}
					sx={{
						display: { xs: 'block', md: 'none' },
						'& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260 },
					}}
				>
					{drawerContent}
				</Drawer>

				{/* Permanent desktop sidebar */}
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: 'none', md: 'block' },
						'& .MuiDrawer-paper': {
							boxSizing: 'border-box',
							width: sidebarWidth,
							borderRight: '1px solid #1e293b',
							transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
						},
					}}
					open
				>
					{drawerContent}
				</Drawer>
			</Box>

			{/* ── Main Content ── */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					width: 0,
					p: { xs: 2.5, md: 3.5 },
					mt: '64px',
					minHeight: 'calc(100vh - 64px)',
					boxSizing: 'border-box',
					transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
				}}
			>
				<Outlet />
			</Box>
		</Box>
	)
}
