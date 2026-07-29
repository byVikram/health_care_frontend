// src/features/admin/pages/AdminDashboardPage.tsx
import { useEffect, useState } from 'react'
import { Box, Grid, Typography, Card, Stack, Avatar, Chip, CircularProgress, Alert } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import EventNoteIcon from '@mui/icons-material/EventNote'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import StorefrontIcon from '@mui/icons-material/Storefront'

import { useAuth } from '../../../hooks/useAuth'
import {
	getDoctorsVerificationQueue,
	getProvidersVerificationQueue,
	listUsers,
	listAdminAppointments,
} from '../adminService'

export default function AdminDashboardPage() {
	const { user, role } = useAuth()

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
				const [docsRes, provsRes, usersRes, apptsRes] = await Promise.allSettled([
					getDoctorsVerificationQueue(),
					getProvidersVerificationQueue(),
					listUsers(),
					listAdminAppointments(),
				])

				if (docsRes.status === 'fulfilled' && docsRes.value.success) {
					setDocCount(docsRes.value.data?.length || 0)
				}
				if (provsRes.status === 'fulfilled' && provsRes.value.success) {
					setProviderCount(provsRes.value.data?.length || 0)
				}
				if (usersRes.status === 'fulfilled' && usersRes.value.success) {
					setUserCount(usersRes.value.data?.total || 0)
				}
				if (apptsRes.status === 'fulfilled' && apptsRes.value.success) {
					setAppointmentCount(apptsRes.value.data?.total || 0)
				}
			} catch (err: any) {
				setError(err?.message || 'Failed to fetch dashboard metrics')
			} finally {
				setLoading(false)
			}
		}
		void loadStats()
	}, [])

	return (
		<Box>
			{/* Top Welcome Header */}
			<Box
				sx={{
					p: 3.5,
					mb: 3.5,
					borderRadius: 3,
					bgcolor: '#0f172a',
					color: '#ffffff',
					backgroundImage:
						'radial-gradient(at 90% 10%, rgba(13, 148, 136, 0.3) 0px, transparent 60%), radial-gradient(at 20% 80%, rgba(30, 58, 138, 0.3) 0px, transparent 60%)',
				}}
			>
				<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
					<Box>
						<Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
							Welcome back, {user?.name || 'Administrator'}
						</Typography>
						<Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
							System Oversight & Administrative Control Dashboard
						</Typography>
					</Box>
					<Chip
						label={(role || 'SUPER_ADMIN').replace('_', ' ').toUpperCase()}
						sx={{
							bgcolor: '#0d9488',
							color: '#ffffff',
							fontWeight: 700,
							px: 1,
							py: 2,
							borderRadius: 2,
							alignSelf: 'flex-start',
						}}
					/>
				</Stack>
			</Box>

			{error && (
				<Alert severity="warning" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading Administrative Overview...
					</Typography>
				</Stack>
			) : (
				<>
					{/* KPI Summary Grid */}
					<Grid container spacing={2.5}>
						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
									<Avatar sx={{ bgcolor: 'rgba(217, 119, 6, 0.12)', color: '#d97706', width: 48, height: 48 }}>
										<LocalHospitalIcon />
									</Avatar>
									<Chip label="Pending" size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700 }} />
								</Stack>
								<Typography variant="h4" fontWeight={800} color="#0f172a">
									{docCount}
								</Typography>
								<Typography variant="body2" color="text.secondary" fontWeight={500}>
									Pending Doctors
								</Typography>
							</Card>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
									<Avatar sx={{ bgcolor: 'rgba(13, 148, 136, 0.12)', color: '#0d9488', width: 48, height: 48 }}>
										<StorefrontIcon />
									</Avatar>
									<Chip label="Providers" size="small" sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700 }} />
								</Stack>
								<Typography variant="h4" fontWeight={800} color="#0f172a">
									{providerCount}
								</Typography>
								<Typography variant="body2" color="text.secondary" fontWeight={500}>
									Pending Providers (Labs/Pharm/Rad)
								</Typography>
							</Card>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
									<Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', width: 48, height: 48 }}>
										<PeopleIcon />
									</Avatar>
									<Chip label="Active" size="small" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }} />
								</Stack>
								<Typography variant="h4" fontWeight={800} color="#0f172a">
									{userCount}
								</Typography>
								<Typography variant="body2" color="text.secondary" fontWeight={500}>
									Total Registered Users
								</Typography>
							</Card>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
									<Avatar sx={{ bgcolor: 'rgba(147, 51, 234, 0.12)', color: '#7e22ce', width: 48, height: 48 }}>
										<EventNoteIcon />
									</Avatar>
									<Chip label="Total" size="small" sx={{ bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 700 }} />
								</Stack>
								<Typography variant="h4" fontWeight={800} color="#0f172a">
									{appointmentCount}
								</Typography>
								<Typography variant="body2" color="text.secondary" fontWeight={500}>
									Total System Appointments
								</Typography>
							</Card>
						</Grid>
					</Grid>
				</>
			)}
		</Box>
	)
}
