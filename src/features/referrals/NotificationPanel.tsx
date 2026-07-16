// src/features/referrals/NotificationPanel.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import {
	Box,
	Typography,
	IconButton,
	Badge,
	Popper,
	Paper,
	Grow,
	ClickAwayListener,
	Divider,
} from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import CallMadeIcon from '@mui/icons-material/CallMade'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import { getNotifications, markNotificationRead } from '../../services/referralService'
import { AppNotification } from '../../types/referral'
import { customScrollbar } from '../../styles/commonStyles'
import { useNavigate } from 'react-router-dom'
import { fixDoubleDr } from '../../utils/Utils'

// ── Time helpers ──────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime()
	const mins = Math.floor(diff / 60000)
	if (mins < 1) return 'Just now'
	if (mins < 60) return `${mins}m ago`
	const hours = Math.floor(mins / 60)
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	return `${days}d ago`
}

// ── Single notification row ───────────────────────────────────────────────────

function NotificationRow({
	notification,
	onRead,
}: {
	notification: AppNotification
	onRead: (n: AppNotification) => void
}) {
	const isReferral = notification.type?.includes('referral')

	return (
		<Box
			onClick={() => onRead(notification)}
			sx={{
				px: 2,
				py: 1.5,
				display: 'flex',
				gap: 1.5,
				alignItems: 'flex-start',
				cursor: 'pointer',
				bgcolor: notification.is_read ? 'transparent' : 'rgba(12,124,124,0.04)',
				transition: 'background 0.15s',
				'&:hover': { bgcolor: 'action.hover' },
			}}
		>
			{/* Icon bubble */}
			<Box
				sx={{
					width: 36,
					height: 36,
					borderRadius: '10px',
					bgcolor: isReferral ? '#e8f4f8' : '#f3e5f5',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexShrink: 0,
				}}
			>
				<CallMadeIcon sx={{ fontSize: 16, color: isReferral ? '#0c7c7c' : '#8e24aa' }} />
			</Box>

			{/* Content */}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography fontSize={13} fontWeight={notification.is_read ? 500 : 700} color="text.primary" noWrap>
					{fixDoubleDr(notification.title)}
				</Typography>
				<Typography fontSize={12} color="text.secondary" sx={{ mt: 0.2, lineHeight: 1.4 }}>
					{fixDoubleDr(notification.message)}
				</Typography>
				<Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
					{timeAgo(notification.created_at)}
				</Typography>
			</Box>

			{/* Unread dot */}
			{!notification.is_read && (
				<Box
					sx={{
						width: 8,
						height: 8,
						borderRadius: '50%',
						bgcolor: '#0c7c7c',
						flexShrink: 0,
						mt: 0.5,
					}}
				/>
			)}
		</Box>
	)
}

// ── Main NotificationPanel ────────────────────────────────────────────────────

interface Props {
	iconColor?: string
}

export default function NotificationPanel({ iconColor = 'inherit' }: Props) {
	const [open, setOpen] = useState(false)
	const [notifications, setNotifications] = useState<AppNotification[]>([])
	const [loading, setLoading] = useState(false)
	const anchorRef = useRef<HTMLButtonElement>(null)
	const navigate = useNavigate()

	const unreadCount = notifications.filter((n) => !n.is_read).length

	const fetchNotifications = useCallback(async () => {
		setLoading(true)
		try {
			const data = await getNotifications()
			setNotifications(data)
		} catch {
			// Silent fail — global toast from ApiService covers 5xx errors
		} finally {
			setLoading(false)
		}
	}, [])

	// Fetch on mount and when panel opens
	useEffect(() => {
		fetchNotifications()
	}, [fetchNotifications])

	useEffect(() => {
		if (open) fetchNotifications()
	}, [open, fetchNotifications])

	const handleToggle = () => setOpen((prev) => !prev)
	const handleClose = () => setOpen(false)

	const handleRead = async (notification: AppNotification) => {
		// Optimistically mark as read
		setNotifications((prev) =>
			prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
		)
		try {
			await markNotificationRead(notification.id)
		} catch {
			// Revert on failure
			setNotifications((prev) =>
				prev.map((n) => (n.id === notification.id ? { ...n, is_read: false } : n))
			)
		}

		// Navigate based on redirect_type/redirect_id set by the backend
		handleClose()
		if (notification.redirect_type === 'doctor_availability' && notification.redirect_id) {
			const params = new URLSearchParams()
			if (notification.reference_type === 'referral' && notification.reference_id) {
				params.set('referral_id', notification.reference_id)
			}
			const query = params.toString()
			const url = query ? '/doctors/' + notification.redirect_id + '?' + query : '/doctors/' + notification.redirect_id
			navigate(url)
		} else if (notification.redirect_type === 'laboratory' && notification.redirect_id) {
			navigate(`/laboratory/search?open_lab_id=${notification.redirect_id}`)
		} else if (notification.redirect_type === 'radiology' && notification.redirect_id) {
			navigate(`/radiology/search?open_radiology_id=${notification.redirect_id}`)
		} else if (notification.redirect_type === 'pharmacy' && notification.redirect_id) {
			navigate(`/pharmacies?open_pharmacy_id=${notification.redirect_id}`)
		} else if (notification.redirect_type === 'appointment' && notification.redirect_id) {
			const role = localStorage.getItem('role')
			if (role === 'doctor') {
				navigate('/portal/appointments')
			} else {
				navigate(`/portal/appointments/${notification.redirect_id}`)
			}
		}
	}

	return (
		<>
			<IconButton
				ref={anchorRef}
				onClick={handleToggle}
				size="small"
				sx={{ color: iconColor, position: 'relative' }}
				aria-label="notifications"
			>
				<Badge
					badgeContent={unreadCount}
					color="error"
					max={9}
					sx={{
						'& .MuiBadge-badge': {
							fontSize: '10px',
							height: 16,
							minWidth: 16,
							padding: '0 3px',
						},
					}}
				>
					{unreadCount > 0 ? (
						<NotificationsActiveIcon sx={{ fontSize: 22 }} />
					) : (
						<NotificationsNoneIcon sx={{ fontSize: 22 }} />
					)}
				</Badge>
			</IconButton>

			<Popper
				open={open}
				anchorEl={anchorRef.current}
				placement="bottom-end"
				transition
				disablePortal={false}
				sx={{ zIndex: 1400 }}
			>
				{({ TransitionProps }) => (
					<Grow {...TransitionProps} style={{ transformOrigin: 'top right' }}>
						<Paper
							elevation={0}
							sx={{
								width: 360,
								maxWidth: '95vw',
								borderRadius: '16px',
								border: '1px solid',
								borderColor: 'divider',
								boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
								overflow: 'hidden',
								mt: 1,
							}}
						>
							<ClickAwayListener onClickAway={handleClose}>
								<Box>
									{/* Header */}
									<Box
										sx={{
											px: 2,
											py: 1.5,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
										}}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Typography fontWeight={700} fontSize={15} color="text.primary">
												Notifications
											</Typography>
											{unreadCount > 0 && (
												<Box
													sx={{
														bgcolor: '#0c7c7c',
														color: '#fff',
														fontSize: '11px',
														fontWeight: 700,
														borderRadius: '20px',
														px: 1,
														py: 0.2,
														lineHeight: 1.4,
													}}
												>
													{unreadCount} new
												</Box>
											)}
										</Box>
										{unreadCount > 0 && (
											<Box
												onClick={async () => {
													// Mark all as read optimistically
													setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
													try {
														await Promise.all(
															notifications
																.filter((n) => !n.is_read)
																.map((n) => markNotificationRead(n.id))
														)
													} catch {
														fetchNotifications()
													}
												}}
												sx={{
													display: 'flex',
													alignItems: 'center',
													gap: 0.4,
													cursor: 'pointer',
													color: '#0c7c7c',
													'&:hover': { opacity: 0.75 },
												}}
											>
												<DoneAllIcon sx={{ fontSize: 14 }} />
												<Typography fontSize={12} fontWeight={600} color="#0c7c7c">
													Mark all read
												</Typography>
											</Box>
										)}
									</Box>
									<Divider />

									{/* Content */}
									<Box
										sx={{
											maxHeight: 380,
											overflowY: 'auto',
											...customScrollbar,
										}}
									>
										{loading ? (
											<Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
												{[1, 2, 3].map((i) => (
													<Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
														<AppSkeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: '10px', flexShrink: 0 }} />
														<Box sx={{ flex: 1 }}>
															<AppSkeleton width="55%" height={14} sx={{ mb: 0.5 }} />
															<AppSkeleton width="80%" height={12} />
														</Box>
													</Box>
												))}
											</Box>
										) : notifications.length === 0 ? (
											<Box sx={{ textAlign: 'center', py: 5 }}>
												<NotificationsNoneIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
												<Typography variant="body2" color="text.disabled">
													No notifications yet
												</Typography>
											</Box>
										) : (
											notifications.map((n, i) => (
												<Box key={n.id}>
													<NotificationRow notification={n} onRead={handleRead} />
													{i < notifications.length - 1 && <Divider sx={{ mx: 2 }} />}
												</Box>
											))
										)}
									</Box>
								</Box>
							</ClickAwayListener>
						</Paper>
					</Grow>
				)}
			</Popper>
		</>
	)
}
