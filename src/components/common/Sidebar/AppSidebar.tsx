// src/components/common/Sidebar/AppSidebar.tsx
import { Box, Typography, Avatar, Divider, IconButton } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
// import LogoutIcon from '@mui/icons-material/Logout'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import { useNavigate } from 'react-router-dom'

import LogoutIcon from '../../../assets/icons/logout.svg'

// -- Types ---------------------------------------------------------------------
export interface SidebarMenuItem {
	id: string
	label: string
	icon: string
	path?: string
	onClick?: () => void
}

export interface SidebarCarePlan {
	title: string
	subtitle: string
	icon?: string
}

export interface AppSidebarUser {
	name: string
	avatar?: string
	profileCompletion?: number
	profilePath?: string
	showQr?: boolean
}

export interface AppSidebarProps {
	variant?: 'fixed' | 'sticky'
	user: AppSidebarUser
	carePlan?: SidebarCarePlan
	menuItems: SidebarMenuItem[]
	activeId?: string
	onLogout?: () => void
	footerText?: string
	width?: number
	topOffset?: number
}

// -- Component -----------------------------------------------------------------
export default function AppSidebar({
	user,
	carePlan,
	menuItems,
	activeId,
	onLogout,
	footerText = '\u00A9 2025 Whisper ai. All rights reserved.',
	width = 280,
	variant = 'fixed',
	topOffset = 0,
}: AppSidebarProps) {
	const navigate = useNavigate()

	return (
		<Box
			sx={{
				width,
				flexShrink: 0,
				bgcolor: 'background.paper',
				borderRight: '1px solid',
				borderColor: 'divider',
				height: variant === 'sticky' ? '100%' : `calc(100vh - ${topOffset}px)`,
				display: 'flex',
				flexDirection: 'column',
				position: variant === 'sticky' ? 'relative' : 'fixed',
				top: variant === 'sticky' ? 'auto' : topOffset,
				left: variant === 'sticky' ? 'auto' : 0,
				overflowY: 'auto',
				overflowX: 'hidden',
				'&::-webkit-scrollbar': { width: '4px' },
				'&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '4px' },
			}}
		>
			{/* -- User profile section -- */}
			<Box sx={{ px: 2, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Avatar
						src={user.avatar}
						alt={user.name}
						sx={{
							width: 48,
							height: 48,
							border: '2px solid',
							// borderColor: 'primary.main',
							borderRadius: '8px',
						}}
					/>
					<Box>
						<Typography sx={{ fontWeight: 700, fontSize: '15px', color: 'text.primary' }}>
							{user.name}
						</Typography>
						<Typography
							variant="body1"
							onClick={() => user.profilePath && navigate(user.profilePath)}
							sx={{ color: 'neutral.main' }}
						>
							View and Edit profile
						</Typography>
						{user.profileCompletion !== undefined && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
								<Typography variant="body1" sx={{ color: 'success.main' }}>
									{user.profileCompletion}% Profile completed
								</Typography>
							</Box>
						)}
					</Box>
				</Box>

				{user.showQr && (
					<IconButton
						size="small"
						sx={{
							bgcolor: 'rgba(43,111,113,0.08)',
							borderRadius: '8px',
							p: 0.8,
							'&:hover': { bgcolor: 'rgba(43,111,113,0.15)' },
							'&:focus': { outline: 'none' },
						}}
					>
						<QrCode2Icon sx={{ fontSize: 24, color: 'primary.main' }} />
					</IconButton>
				)}
			</Box>

			{/* -- Care plan banner -- */}
			{carePlan && (
				<Box sx={{ mx: 2, mb: 2 }}>
					<Box
						sx={{
							background: 'linear-gradient(135deg, #0f4c4c, #0c7c7c)',
							borderRadius: '12px',
							px: 1,
							py: 1.5,
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
							cursor: 'pointer',
							'&:hover': { opacity: 0.92 },
							transition: 'opacity 0.15s',
						}}
					>
						{/* {carePlan.icon && <Box sx={{ flexShrink: 0, color: '#ffd700' }}>{carePlan.icon}</Box>} */}
						{carePlan.icon && <img src={carePlan.icon} alt="icon" style={{ width: 28, height: 28 }} />}
						<Box sx={{ flex: 1 }}>
							<Typography sx={{ color: '#fff', fontWeight: 500, fontSize: '13px' }}>
								{carePlan.title}
							</Typography>
							<Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px' }}>
								{carePlan.subtitle}
							</Typography>
						</Box>
						<ChevronRightIcon sx={{ color: '#fff', fontSize: 20 }} />
					</Box>
				</Box>
			)}

			<Divider />

			{/* -- Menu items -- */}
			<Box sx={{ flex: 1, py: 1 }}>
				{menuItems.map((item) => {
					const isActive = activeId === item.id
					return (
						<Box
							key={item.id}
							onClick={() => {
								item.onClick?.()
								item.path && navigate(item.path)
							}}
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1.5,
								px: 2.5,
								py: 1.3,
								cursor: 'pointer',
								bgcolor: isActive ? 'rgba(43,111,113,0.06)' : 'transparent',
								borderLeft: '3px solid',
								borderColor: isActive ? 'primary.main' : 'transparent',
								transition: 'all 0.15s',
								'&:hover': { bgcolor: 'rgba(43,111,113,0.05)', color: 'primary.main' },
							}}
						>
							<Box
								sx={{
									color: isActive ? 'primary.main' : 'text.secondary',
									display: 'flex',
									alignItems: 'center',
									flexShrink: 0,
									fontSize: 22,
								}}
							>
								{/* {item.icon} */}
								<img src={item.icon} alt="icon" style={{ width: 22, height: 22 }} />
							</Box>
							<Typography
								sx={{
									flex: 1,
									fontSize: '13.5px',
									fontWeight: isActive ? 600 : 400,
									color: isActive ? 'primary.main' : 'text.primary',
								}}
							>
								{item.label}
							</Typography>
							<ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
						</Box>
					)
				})}
			</Box>

			<Divider />

			{/* -- Log out -- */}
			<Box
				onClick={onLogout}
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1.5,
					pr: 2.5,
					py: 1.8,
					pl: '22px',
					cursor: 'pointer',
					'&:hover': { bgcolor: 'rgba(211,47,47,0.04)' },
					transition: 'all 0.15s',
				}}
			>
				{/* <LogoutIcon sx={{ fontSize: 20, color: 'error.main' }} /> */}
				<img src={LogoutIcon} alt="icon" style={{ width: 22, height: 22 }} />
				<Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: 'error.main' }}>Log out</Typography>
			</Box>

			{/* -- Footer -- */}
			<Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
				<Typography sx={{ fontSize: '10.5px', color: 'text.disabled', textAlign: 'center' }}>
					{footerText}
				</Typography>
			</Box>
		</Box>
	)
}
