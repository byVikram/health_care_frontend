// src/components/layout/NavbarLayout.tsx
import React, { useState, useRef, useEffect, ReactNode, cloneElement } from 'react'
import { Box, Paper, MenuItem, Divider, Typography, Stack, IconButton, Avatar } from '@mui/material'
import { SwapHoriz as SwapIcon, Check as CheckIcon } from '@mui/icons-material'
import DoctorNavBar from '../common/Navbar/DoctorNavBar'
import { clearAuth, useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { USER_ROLES } from '../../constants/constants'
import { useMemo } from 'react'
import { LookupHospital, PatientProfile } from '../../hooks/useAuth'

const NAVBAR_HEIGHT = 64

type ProfileAccount = {
	id: string
	name: string
	email?: string
	relation: string
	avatar?: string
}

type ProfileMenuItem = { label: string; path: string; danger?: true } | { divider: true }

function isDividerMenuItem(item: ProfileMenuItem): item is { divider: true } {
	return 'divider' in item && item.divider === true
}
const PATIENT_PROFILE_MENU_ITEMS: readonly ProfileMenuItem[] = [
	{ label: 'My Appointments', path: '#' },
	{ label: 'My Tests', path: '#' },
	{ label: 'My Medicine Orders', path: '#' },
	{ label: 'My Medical Records', path: '#' },
	{ label: 'My Online Consultations', path: '#' },
	{ label: 'My Feedback', path: '#' },
	{ divider: true },
	{ label: 'Profile', path: '/profile' },
	{ label: 'Settings', path: '#' },
	{ label: 'Help Line', path: '#help-line' },
	{ divider: true },
	{ label: 'Logout', path: '/logout', danger: true },
]

const DOCTOR_PROFILE_MENU_ITEMS: readonly ProfileMenuItem[] = [
	{ label: 'My Appointments', path: '#' },
	{ label: 'My Consultations', path: '#' },
	{ label: 'My Patients', path: '#' },
	{ divider: true },
	{ label: 'Profile', path: '/profile' },
	{ label: 'Settings', path: '/profile?tab=settings' },
	{ label: 'Help Line', path: '#help-line' },
	{ divider: true },
	{ label: 'Logout', path: '/logout', danger: true },
]

const getProfileMenuItems = (role: string): readonly ProfileMenuItem[] => {
	if (role === USER_ROLES.DOCTOR) return DOCTOR_PROFILE_MENU_ITEMS
	return PATIENT_PROFILE_MENU_ITEMS
}

// ---- Account Switcher Dropdown ----
function AccountSwitcher({
	accounts,
	currentAccount,
	onSwitchAccount,
	onClose,
}: {
	accounts: PatientProfile[]
	currentAccount: PatientProfile | null
	onSwitchAccount: (account: PatientProfile) => void
	onClose: () => void
}) {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onClose()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [onClose])

	const handleSwitch = (account: PatientProfile) => {
		onSwitchAccount(account)
		onClose()
	}

	// const getRoleColor = (role: string) => {
	// 	switch (role) {
	// 		case 'doctor':
	// 			return '#2196f3'
	// 		case 'patient':
	// 			return '#4caf50'
	// 		case 'admin':
	// 			return '#ff9800'
	// 		default:
	// 			return '#9e9e9e'
	// 	}
	// }

	return (
		<Paper
			ref={ref}
			elevation={3}
			sx={{
				position: 'fixed',
				top: `${NAVBAR_HEIGHT}px`,
				right: 16,
				minWidth: 280,
				borderRadius: 2,
				overflow: 'hidden',
				zIndex: 300,
				animation: 'navDropdownFadeIn 0.15s ease',
				'@keyframes navDropdownFadeIn': {
					from: { opacity: 0, transform: 'translateY(-6px)' },
					to: { opacity: 1, transform: 'translateY(0)' },
				},
			}}
		>
			{/* Header */}
			<Box
				sx={{
					padding: '12px 16px',
					borderBottom: '1px solid',
					borderColor: 'divider',
					bgcolor: 'action.hover',
				}}
			>
				<Typography variant="subtitle2" color="text.secondary">
					Switch Account
				</Typography>
			</Box>

			{/* Account List */}
			{accounts.map((account) => (
				<MenuItem
					key={account.id}
					onClick={() => handleSwitch(account)}
					sx={{
						py: 1.5,
						px: 2,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						'&:hover': {
							bgcolor: 'action.hover',
						},
					}}
				>
					<Stack direction="row" spacing={2} alignItems="center" flex={1}>
						<Avatar
							src={account.avatar_s3_key || undefined}
							sx={{
								// bgcolor: getRoleColor(account.role),
								width: 40,
								height: 40,
								fontSize: '1rem',
							}}
						>
							{account.name.charAt(0)}
						</Avatar>
						<Box flex={1}>
							<Typography variant="body2" fontWeight={500}>
								{account.name}
								{/* {account.relation} */}
							</Typography>
							<Typography
								variant="caption"
								sx={{
									display: 'block',
									// color: getRoleColor(account.role),
									fontSize: '0.7rem',
									textTransform: 'capitalize',
								}}
							>
								{account.relation}
							</Typography>
						</Box>
					</Stack>
					{currentAccount?.id === account.id && <CheckIcon fontSize="small" color="primary" />}
				</MenuItem>
			))}
		</Paper>
	)
}

// ---- Profile Dropdown ----
function ProfileDropdown({
	onClose,
	currentAccount,
	onOpenAccountSwitcher,
	role = 'patient',
}: {
	onClose: () => void
	currentAccount: ProfileAccount
	onOpenAccountSwitcher: () => void
	role: string
}) {
	const navigate = useNavigate()
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onClose()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [onClose])

	const handleClick = (path: string) => {
		onClose()
		if (path === '/logout') {
			clearAuth()
			navigate('/login')
		} else {
			navigate(path)
		}
	}

	return (
		<Paper
			ref={ref}
			elevation={3}
			sx={{
				position: 'fixed',
				top: `${NAVBAR_HEIGHT}px`,
				right: 16,
				minWidth: 280,
				borderRadius: 1,
				overflow: 'hidden',
				zIndex: 300,
				animation: 'navDropdownFadeIn 0.15s ease',
				'@keyframes navDropdownFadeIn': {
					from: { opacity: 0, transform: 'translateY(-6px)' },
					to: { opacity: 1, transform: 'translateY(0)' },
				},
			}}
		>
			{/* Header with Account Switcher button */}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '14px 20px',
					borderBottom: '1px solid',
					borderColor: 'divider',
					bgcolor: 'action.hover',
				}}
			>
				<Box>
					<Typography variant="body2" fontWeight={700} color="text.primary">
						{currentAccount.name}
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
						{currentAccount.email}
					</Typography>
					{role === USER_ROLES.PATIENT && (
						<Typography
							variant="caption"
							sx={{
								display: 'inline-block',
								mt: 0.5,
								fontSize: '0.7rem',
								textTransform: 'capitalize',
								px: 1,
								py: 0.25,
								borderRadius: 1,
							}}
						>
							{currentAccount.relation}
						</Typography>
					)}
				</Box>

				{role === USER_ROLES.PATIENT && (
					<IconButton
						onClick={onOpenAccountSwitcher}
						size="small"
						sx={{
							bgcolor: 'primary.main',
							color: 'white',
							'&:hover': {
								bgcolor: 'primary.dark',
								transform: 'scale(1.05)',
							},
							transition: 'all 0.2s ease',
						}}
					>
						<SwapIcon fontSize="small" />
					</IconButton>
				)}
			</Box>

			{getProfileMenuItems(role).map((item, idx) => {
				if (isDividerMenuItem(item)) {
					return <Divider key={`divider-${idx}`} sx={{ my: 0.5 }} />
				}
				return (
					<MenuItem
						key={item.path}
						onClick={() => handleClick(item.path)}
						sx={{
							py: 1,
							px: 2,
							fontSize: '0.875rem',
							color: item.danger ? 'error.main' : 'text.primary',
							'&:hover': {
								bgcolor: item.danger ? 'error.lighter' : 'action.hover',
								color: item.danger ? 'error.dark' : 'primary.main',
							},
						}}
					>
						{item.label}
					</MenuItem>
				)
			})}

			{/* Edit Profile at bottom */}
			{/* <Divider sx={{ my: 0.5 }} />
			<MenuItem
				onClick={handleEditProfile}
				sx={{
					py: 1.5,
					px: 2,
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					color: 'primary.main',
					'&:hover': {
						bgcolor: 'primary.lighter',
					},
				}}
			>
				<EditIcon fontSize="small" />
				<Typography variant="body2" fontWeight={500}>
					Edit Profile
				</Typography>
			</MenuItem> */}
		</Paper>
	)
}

// ---- Layout ----
interface NavbarLayoutProps {
	children?: ReactNode
}

export default function NavbarLayout({ children }: NavbarLayoutProps) {
	const { role, user, lookupData } = useAuth()
	const navigate = useNavigate()
	const activePatientId = localStorage.getItem('patient_id')
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const [activeHospital, setActiveHospital] = useState<LookupHospital | null>(null)
	const [accountSwitcherOpen, setAccountSwitcherOpen] = useState(false)

	// Replace with actual current account from your auth context
	const availableAccounts = useMemo(() => lookupData?.patient_profiles ?? [], [lookupData])
	const currentAccount = useMemo(() => {
		if (!lookupData?.patient_profiles?.length) {
			return null
		}

		return (
			lookupData.patient_profiles.find((profile) => profile.id === activePatientId) ||
			lookupData.patient_profiles[0]
		)
	}, [lookupData, activePatientId])

	useEffect(() => {
		if (!localStorage.getItem('patient_id') && lookupData?.patient_profiles?.length) {
			const selfProfile = lookupData.patient_profiles.find((profile) => profile.is_self)

			if (selfProfile) {
				localStorage.setItem('patient_id', selfProfile.id)
			}
		}
	}, [lookupData])

	const profileAccount = {
		id: currentAccount?.id || '',
		name: currentAccount?.name || '',
		email: user?.email || '',
		relation: currentAccount?.relation || '',
		avatar: currentAccount?.avatar_s3_key || '',
	}

	const handleSwitchAccount = (account: PatientProfile) => {
		localStorage.setItem('patient_id', account.id)

		window.dispatchEvent(new Event('auth-changed'))
		navigate(0)
	}

	const handleOpenAccountSwitcher = () => {
		setDropdownOpen(false)
		setAccountSwitcherOpen(true)
	}

	const handleCloseAll = () => {
		setDropdownOpen(false)
		setAccountSwitcherOpen(false)
	}

	const handleHospitalChange = (e: LookupHospital | null) => {
		setActiveHospital(e)
		if (e) {
			localStorage.setItem('active_hospital_id', e.id)
			window.dispatchEvent(new Event('hospital-changed'))
		}
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
				bgcolor: 'background.default',
				position: 'relative',
			}}
		>
			{/* Navbar fixed full width */}
			<Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200 }}>
				<DoctorNavBar
					onProfileClick={() => {
						setAccountSwitcherOpen(false)
						setDropdownOpen((prev) => !prev)
					}}
				onHospitalChange={handleHospitalChange}
				avatarSrc={role === 'patient' ? (profileAccount.avatar || undefined) : (user?.avatar || undefined)}
				/>
			</Box>

			{/* Dropdowns */}
			{dropdownOpen && (
				<ProfileDropdown
					onClose={handleCloseAll}
					currentAccount={profileAccount}
					onOpenAccountSwitcher={handleOpenAccountSwitcher}
					role={role || 'patient'}
				/>
			)}

			{accountSwitcherOpen && (
				<AccountSwitcher
					accounts={availableAccounts}
					currentAccount={currentAccount}
					onSwitchAccount={handleSwitchAccount}
					onClose={handleCloseAll}
				/>
			)}

			{/* Page content */}
			<Box sx={{ flex: 1, mt: `${NAVBAR_HEIGHT}px` }}>
				{children &&
					cloneElement(children as React.ReactElement<{ activeHospital: LookupHospital | null }>, {
						activeHospital,
					})}
			</Box>
		</Box>
	)
}
