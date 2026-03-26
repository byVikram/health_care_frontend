// src/components/common/ProfileSidebar/AppProfileSidebar.tsx
import { useRef } from 'react'
import { Box, Typography, Avatar, LinearProgress, IconButton, Divider } from '@mui/material'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { useNavigate } from 'react-router-dom'

export interface SidebarNavItem {
	id: string
	label: string
	icon?: React.ReactNode
}

export interface AppProfileSidebarProps {
	avatar?: string
	name?: string
	subTitle?: string
	completionPercent: number
	backLabel?: string
	navItems: SidebarNavItem[]
	activeTab: string
	onTabChange: (id: string) => void
	onAvatarChange?: (file: File) => void
	onLogout?: () => void
}

export default function AppProfileSidebar({
	avatar,
	name,
	subTitle,
	completionPercent,
	backLabel = 'Profile',
	navItems,
	activeTab,
	onTabChange,
	onAvatarChange,
	onLogout,
}: AppProfileSidebarProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const navigate = useNavigate()

	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '16px',
				overflow: 'hidden',
				position: { md: 'sticky' },
				top: { md: 24 },
			}}
		>
			{/* Back nav */}
			<Box
				onClick={() => navigate(-1)}
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					px: 2,
					py: 1.5,
					cursor: 'pointer',
					'&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
				}}
			>
				<ArrowBackIosNewIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
				<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
					{backLabel}
				</Typography>
			</Box>

			<Divider />

			{/* Avatar + info */}
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3, pb: 2, px: 2 }}>
				<Box sx={{ position: 'relative', mb: 2 }}>
					<Avatar
						src={avatar}
						alt={name}
						sx={{
							width: 150,
							height: 160,
							bgcolor: '#e0e7ef',
							border: '3px solid',
							borderColor: 'primary.main',
							borderRadius: '10px',
						}}
					/>

					<IconButton
						size="small"
						onClick={() => fileInputRef.current?.click()}
						sx={{
							position: 'absolute',
							bottom: 2,
							right: 2,
							bgcolor: 'transparent',
							color: 'primary.main',
							width: 38,
							height: 38,
							'&:hover': { bgcolor: 'primary.dark' },
							'&:focus': { outline: 'none' },
						}}
					>
						<CameraAltOutlinedIcon sx={{ fontSize: 24 }} />
					</IconButton>

					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						hidden
						onChange={(e) => {
							const f = e.target.files?.[0]
							if (f) onAvatarChange?.(f)
						}}
					/>
				</Box>
				<Box
					sx={{
						bgcolor: '#2B982B29',
						color: '#2B982B',
						fontSize: '14px',
						fontWeight: 500,
						px: 2,
						py: 0.6,
						borderRadius: '4px',
						whiteSpace: 'nowrap',
					}}
				>
					{completionPercent}% Profile completed
				</Box>

				<LinearProgress
					variant="determinate"
					value={completionPercent}
					sx={{
						width: '100%',
						height: 4,
						borderRadius: 4,
						mt: 2,
						mb: 1.5,
						bgcolor: '#e0e7ef',
						'& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 4 },
					}}
				/>

				<Typography
					variant="h6"
					sx={{ fontWeight: 700, color: 'text.primary', textAlign: 'center', fontSize: '15px' }}
				>
					{name || 'Your Name'}
				</Typography>

				{subTitle && (
					<Typography
						variant="caption"
						sx={{ color: 'text.secondary', fontSize: '12px', textAlign: 'center' }}
					>
						{subTitle}
					</Typography>
				)}
			</Box>

			<Divider />

			{/* Nav items */}
			<Box sx={{ py: 1 }}>
				{navItems.map((item) => {
					const isActive = activeTab === item.id
					return (
						<Box
							key={item.id}
							onClick={() => onTabChange(item.id)}
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1.5,
								px: 2.5,
								py: 1.2,
								cursor: 'pointer',
								borderLeft: '3px solid',
								borderColor: isActive ? 'primary.main' : 'transparent',
								bgcolor: isActive ? 'rgba(43,111,113,0.05)' : 'transparent',
								color: isActive ? 'primary.main' : 'text.secondary',
								transition: 'all 0.15s',
								'&:hover': { bgcolor: 'rgba(43,111,113,0.04)', color: 'primary.main' },
							}}
						>
							{item.icon && (
								<Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit', flexShrink: 0 }}>
									{item.icon}
								</Box>
							)}
							<Typography
								variant="body2"
								sx={{ fontSize: '13.5px', fontWeight: isActive ? 600 : 400, color: 'inherit' }}
							>
								{item.label}
							</Typography>
						</Box>
					)
				})}

				<Divider sx={{ my: 1 }} />

				<Box
					onClick={onLogout}
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						px: 2.5,
						py: 1.2,
						cursor: 'pointer',
						color: 'error.main',
						'&:hover': { bgcolor: 'rgba(211,47,47,0.05)' },
						transition: 'all 0.15s',
					}}
				>
					<LogoutIcon fontSize="small" />
					<Typography variant="body2" sx={{ fontSize: '13.5px', fontWeight: 500, color: 'inherit' }}>
						Log Out
					</Typography>
				</Box>
			</Box>
		</Box>
	)
}


