// src/features/admin/pages/AdminDashboardPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Grid, Typography, Stack, CircularProgress, Alert, Divider, Button } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import EventNoteIcon from '@mui/icons-material/EventNote'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import StorefrontIcon from '@mui/icons-material/Storefront'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import TodayIcon from '@mui/icons-material/Today'

import { useAuth } from '../../../hooks/useAuth'
import { ROUTES } from '../../../constants/routes'
import { getDashboardStats } from '../adminService'
import AdminStatCard from '../../../components/admin/AdminStatCard'

export default function AdminDashboardPage() {
	const { user} = useAuth()
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [docCount, setDocCount] = useState(0)
	const [providerCount, setProviderCount] = useState(0)
	const [userCount, setUserCount] = useState(0)
	const [appointmentCount, setAppointmentCount] = useState(0)

	useEffect(() => {
		const loadStats = async () => {
			setLoading(true)
			setError(null)
			try {
				const res = await getDashboardStats()
				if (res.success && res.data) {
					setDocCount(res.data.pending_doctors)
					setProviderCount(res.data.pending_providers)
					setUserCount(res.data.total_users)
					setAppointmentCount(res.data.total_appointments)
				}
			} catch (err: unknown) {
				setError((err instanceof Error ? err.message : null) ?? 'Failed to fetch dashboard metrics')
			} finally {
				setLoading(false)
			}
		}
		void loadStats()
	}, [])

	const now = new Date()
	const greeting =
		now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

	return (
		<Box>
			{/* ── Hero Welcome Banner ── */}
			<Box
				sx={{
					p: { xs: 3, md: 4 },
					mb: 3.5,
					borderRadius: '16px',
					bgcolor: '#0f172a',
					color: '#ffffff',
					backgroundImage:
						'radial-gradient(at 90% 10%, rgba(13, 148, 136, 0.35) 0px, transparent 55%), radial-gradient(at 10% 90%, rgba(30, 58, 138, 0.25) 0px, transparent 55%)',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				{/* Subtle grid texture */}
				<Box
					sx={{
						position: 'absolute',
						inset: 0,
						backgroundImage:
							'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
						backgroundSize: '40px 40px',
						pointerEvents: 'none',
					}}
				/>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					justifyContent="space-between"
					alignItems={{ sm: 'center' }}
					spacing={2}
					sx={{ position: 'relative' }}
				>
					<Box>
						<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
							<TodayIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
							<Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
								{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
							</Typography>
						</Stack>
						<Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.6, lineHeight: 1.2 }}>
							{greeting},{' '}
							<Box component="span" sx={{ color: '#2dd4bf' }}>
								{user?.name?.split(' ')[0] || 'Admin'}
							</Box>
						</Typography>
						<Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.75 }}>
							System Oversight & Administrative Control — WhisperAI Healthcare
						</Typography>
					</Box>

					{/* <Stack direction="row" spacing={1} flexWrap="wrap">
						<Chip
							label={(role || 'SUPER ADMIN').replace(/_/g, ' ')}
							sx={{
								bgcolor: '#0d9488',
								color: '#ffffff',
								fontWeight: 700,
								fontSize: '0.7rem',
								height: 28,
								borderRadius: '8px',
							}}
						/>
						<Chip
							label="Live"
							sx={{
								bgcolor: 'rgba(16,185,129,0.15)',
								color: '#10b981',
								fontWeight: 700,
								fontSize: '0.7rem',
								height: 28,
								borderRadius: '8px',
								border: '1px solid rgba(16,185,129,0.3)',
							}}
						/>
					</Stack> */}
				</Stack>
			</Box>

			{error && (
				<Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
					{error}
				</Alert>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading administrative overview...
					</Typography>
				</Stack>
			) : (
				<>
					{/* ── KPI Stat Cards ── */}
					<Grid container spacing={2.5} sx={{ mb: 3.5 }}>
						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<AdminStatCard
								label="Pending Doctors"
								value={docCount}
								icon={<LocalHospitalIcon />}
								iconColor="#d97706"
								iconBg="rgba(217,119,6,0.12)"
								description="Awaiting verification review"
								onClick={() => navigate(`${ROUTES.ADMIN.VERIFICATIONS}?tab=doctors`)}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<AdminStatCard
								label="Pending Providers"
								value={providerCount}
								icon={<StorefrontIcon />}
								iconColor="#0d9488"
								iconBg="rgba(13,148,136,0.12)"
								description="Labs, Pharmacies & Radiology"
								onClick={() => navigate(`${ROUTES.ADMIN.VERIFICATIONS}?tab=providers`)}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<AdminStatCard
								label="Total Users"
								value={userCount}
								icon={<PeopleIcon />}
								iconColor="#2563eb"
								iconBg="rgba(37,99,235,0.1)"
								description="Registered accounts"
								onClick={() => navigate(ROUTES.ADMIN.USERS)}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<AdminStatCard
								label="Total Appointments"
								value={appointmentCount}
								icon={<EventNoteIcon />}
								iconColor="#7e22ce"
								iconBg="rgba(126,34,206,0.1)"
								description="All-time system appointments"
								onClick={() => navigate(ROUTES.ADMIN.APPOINTMENTS)}
							/>
						</Grid>
					</Grid>

					{/* ── Quick Actions Row ── */}
					<Box
						sx={{
							p: 2.5,
							borderRadius: '14px',
							border: '1px solid #e2e8f0',
							bgcolor: '#ffffff',
						}}
					>
						<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
							<Box>
								<Typography variant="subtitle1" fontWeight={800} color="#0f172a">
									Quick Actions
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Jump to the most frequently used admin workflows
								</Typography>
							</Box>
						</Stack>
						<Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />
						<Grid container spacing={1.5}>
							{[
								{
									label: 'Review Verifications',
									description: `${docCount + providerCount} pending`,
									icon: <VerifiedUserIcon />,
									color: '#d97706',
									bg: '#fef3c7',
									path: ROUTES.ADMIN.VERIFICATIONS,
								},
								{
									label: 'Manage Users',
									description: `${userCount.toLocaleString()} total accounts`,
									icon: <PeopleIcon />,
									color: '#2563eb',
									bg: '#dbeafe',
									path: ROUTES.ADMIN.USERS,
								},
								{
									label: 'View Appointments',
									description: `${appointmentCount.toLocaleString()} recorded`,
									icon: <EventNoteIcon />,
									color: '#7e22ce',
									bg: '#f3e8ff',
									path: ROUTES.ADMIN.APPOINTMENTS,
								},
								{
									label: 'Moderate Comments',
									description: 'Review pending queue',
									icon: <StorefrontIcon />,
									color: '#0d9488',
									bg: '#ccfbf1',
									path: ROUTES.ADMIN.COMMENTS,
								},
							].map((action) => (
								<Grid size={{ xs: 12, sm: 6, md: 3 }} key={action.label}>
									<Button
										fullWidth
										onClick={() => navigate(action.path)}
										sx={{
											p: 2,
											borderRadius: 2,
											border: '1px solid #e2e8f0',
											textAlign: 'left',
											justifyContent: 'flex-start',
											textTransform: 'none',
											transition: 'all 0.15s ease',
											'&:hover': {
												borderColor: action.color,
												bgcolor: action.bg,
												transform: 'translateY(-1px)',
											},
										}}
									>
										<Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
											<Box
												sx={{
													width: 36,
													height: 36,
													borderRadius: 1.5,
													bgcolor: action.bg,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													flexShrink: 0,
													'& .MuiSvgIcon-root': { color: action.color, fontSize: 20 },
												}}
											>
												{action.icon}
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
													{action.label}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{action.description}
												</Typography>
											</Box>
											<ArrowForwardIcon sx={{ fontSize: 16, color: '#94a3b8', flexShrink: 0 }} />
										</Stack>
									</Button>
								</Grid>
							))}
						</Grid>
					</Box>
				</>
			)}
		</Box>
	)
}
