import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Divider, Chip } from '@mui/material'
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined'
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined'
import AppButton from '../Button/AppButton'
import ApiService from '../../../services/apiService'
import { API_ENDPOINTS } from '../../../constants/apiUrls'
import { customCardStyle } from '../../../styles/commonStyles'
import { toast } from 'react-toastify'
import { clearAuth } from '../../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface Session {
	id: string
	device_type: string
	device_name: string
	ip_address: string
	login_at: string
	last_active_at: string
	is_active: boolean
	is_current: boolean
}

// Simplistic UA parser – kept identical for consistency
function parseDeviceName(ua: string) {
	if (!ua) return { isMobile: false, label: 'Unknown Device' }
	const isMobile = /Mobile|Android|iP(hone|od|ad)/i.test(ua)
	let os = 'Unknown OS'
	if (/Windows NT/i.test(ua)) os = 'Windows'
	else if (/Mac OS X/i.test(ua)) os = 'macOS'
	else if (/Android/i.test(ua)) os = 'Android'
	else if (/Linux/i.test(ua)) os = 'Linux'
	else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS'

	let browser = 'Unknown Browser'
	if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome'
	else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
	else if (/Firefox/i.test(ua)) browser = 'Firefox'
	else if (/Edg/i.test(ua)) browser = 'Edge'

	return { isMobile, label: `${os} · ${browser}` }
}

export default function SessionsTab() {
	const [sessions, setSessions] = useState<Session[]>([])
	const [loading, setLoading] = useState(true)
	const [loggingOutId, setLoggingOutId] = useState<string | null>(null)
	const navigate = useNavigate()

	const fetchSessions = async () => {
		try {
			setLoading(true)
			const res = await ApiService.get<{ success: boolean; data: Session[] }>(API_ENDPOINTS.AUTH.SESSIONS)
			if (res.data?.success) {
				setSessions(res.data.data)
			}
		} catch (err) {
			console.error('Failed to fetch sessions', err)
			toast.error('Failed to load sessions')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchSessions()
	}, [])

	const handleLogout = async (session: Session) => {
		try {
			setLoggingOutId(session.id)
			await ApiService.delete(API_ENDPOINTS.AUTH.SESSION_LOGOUT(session.id))
			toast.success('Session logged out successfully')

			if (session.is_current) {
				clearAuth()
				navigate('/login', { replace: true })
			} else {
				fetchSessions()
			}
		} catch (err) {
			console.error('Logout failed', err)
			toast.error('Failed to logout session')
		} finally {
			setLoggingOutId(null)
		}
	}

	return (
		<Box sx={{ ...customCardStyle, p: 2.5 }}>
			<Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, color: 'text.primary' }}>
				Active Sessions
			</Typography>
			<Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
				Review and manage your active login sessions across all devices.
			</Typography>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
					<CircularProgress size={28} sx={{ color: 'primary.main' }} />
				</Box>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
					{sessions.length === 0 ? (
						<Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
							No active sessions found.
						</Typography>
					) : (
						sessions.map((session, index) => {
							const { isMobile, label } = parseDeviceName(session.device_name)
							return (
								<Box key={session.id}>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											py: 1.5,
											px: 1,
											gap: 2,
											flexWrap: { xs: 'wrap', sm: 'nowrap' },
											borderRadius: 2,
											transition: 'background-color 0.2s',
											'&:hover': {
												bgcolor: 'action.hover',
											},
										}}
									>
										{/* Device icon + info */}
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
											<Box
												sx={{
													p: 1,
													borderRadius: 1.5,
													bgcolor: 'rgba(43,111,113,0.08)',
													color: 'primary.main',
													display: 'flex',
													flexShrink: 0,
												}}
											>
												{session.device_type === 'mobile' || isMobile ? (
													<PhoneIphoneOutlinedIcon fontSize="small" />
												) : (
													<DesktopWindowsOutlinedIcon fontSize="small" />
												)}
											</Box>

											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
													<Typography
														variant="subtitle2"
														fontWeight={600}
														noWrap
														sx={{ maxWidth: { xs: '100%', sm: 280 } }}
													>
														{label}
													</Typography>
													{session.is_current && (
														<Chip
															label="Current"
															size="small"
															sx={{
																bgcolor: 'rgba(43,111,113,0.1)',
																color: 'primary.main',
																fontWeight: 600,
																fontSize: '0.65rem',
																height: 20,
																'& .MuiChip-label': { px: 0.8 },
															}}
														/>
													)}
												</Box>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.25, flexWrap: 'wrap' }}>
													<Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace' }}>
														{session.ip_address}
													</Typography>
													<Typography variant="caption" sx={{ color: 'text.disabled' }}>
														· Last active:{' '}
														{new Date(session.last_active_at).toLocaleString([], {
															dateStyle: 'medium',
															timeStyle: 'short',
														})}
													</Typography>
												</Box>
											</Box>
										</Box>

										{/* Logout button */}
										<Box sx={{ flexShrink: 0 }}>
											<AppButton
												variant="outlined"
												color="error"
												size="small"
												disabled={loggingOutId === session.id}
												onClick={() => handleLogout(session)}
												label={loggingOutId === session.id ? 'Logging out...' : 'Log out'}
												sx={{
													borderRadius: 1.5,
													borderWidth: 1,
													px: 2,
													fontWeight: 500,
													fontSize: '0.75rem',
												}}
											/>
										</Box>
									</Box>
									{index < sessions.length - 1 && <Divider />}
								</Box>
							)
						})
					)}
				</Box>
			)}
		</Box>
	)
}