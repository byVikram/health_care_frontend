// src/components/layout/NavbarLayout.tsx
import React, { useState, useRef, useEffect, ReactNode, cloneElement } from 'react'
import {
	Box,
	Paper,
	MenuItem,
	Divider,
	Typography,
	Stack,
	IconButton,
	Avatar,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
} from '@mui/material'
import {
	SwapHoriz as SwapIcon,
	Check as CheckIcon,
	PersonAdd as PersonAddIcon,
	Close as CloseIcon,
} from '@mui/icons-material'
import DoctorNavBar from '../common/Navbar/DoctorNavBar'
import AppNavBar from '../common/Navbar/AppNavBar'
import { clearAuth, useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { USER_ROLES } from '../../constants/constants'
import { useMemo } from 'react'
import { LookupHospital, PatientProfile } from '../../hooks/useAuth'
import { toast } from 'react-toastify'
import ChatBot from '../ChatBot'

const NAVBAR_HEIGHT = 64

type ProfileAccount = {
	id: string
	name: string
	email?: string
	relation: string
	avatar?: string
}

type ProfileMenuItem = { label: string; path: string; danger?: true; special?: 'add-user' } | { divider: true }

function isDividerMenuItem(item: ProfileMenuItem): item is { divider: true } {
	return 'divider' in item && item.divider === true
}

const PATIENT_PROFILE_MENU_ITEMS: readonly ProfileMenuItem[] = [
	{ label: 'Add User', path: '#add-user', special: 'add-user' },
	{ divider: true },
	{ label: 'My Appointments', path: '/portal/appointments' },
	{ label: 'My Tests', path: '#' },
	{ label: 'My Medicine Orders', path: '#' },
	{ label: 'My Medical Records', path: '#' },
	{ label: 'My Favourite Doctors', path: '/portal/favourites' },
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

// ---- Add User Modal ----
function AddUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
	const [name, setName] = useState('')
	const [role, setRole] = useState('')
	const [nameError, setNameError] = useState(false)
	const [roleError, setRoleError] = useState(false)

	const handleAdd = () => {
		const hasNameError = name.trim() === ''
		const hasRoleError = role.trim() === ''
		setNameError(hasNameError)
		setRoleError(hasRoleError)
		if (hasNameError || hasRoleError) return
		// TODO: wire to your API
		console.log('Add user:', { name: name.trim(), role: role.trim() })
		toast.success('User added successfully!')
		handleClose()
	}

	const handleClose = () => {
		setName('')
		setRole('')
		setNameError(false)
		setRoleError(false)
		onClose()
	}

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
			<DialogTitle
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					py: 1.25,
					px: 2,
					borderBottom: '1px solid',
					borderColor: 'divider',
				}}
			>
				<Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '15px' }}>
					Add User
				</Typography>
				<IconButton
					onClick={handleClose}
					size="small"
					sx={{
						color: 'text.secondary',
						'&:hover': { bgcolor: 'action.hover' },
						'&:focus': { outline: 'none' },
					}}
				>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ pt: '14px !important', px: 2, pb: 1 }}>
				<TextField
					label="Name"
					placeholder="Enter full name"
					value={name}
					onChange={(e) => {
						setName(e.target.value)
						setNameError(false)
					}}
					error={nameError}
					helperText={nameError ? 'Name is required' : ''}
					fullWidth
					size="small"
					sx={{ mb: 2 }}
				/>
				<TextField
					label="Role"
					placeholder="Enter role"
					value={role}
					onChange={(e) => {
						setRole(e.target.value)
						setRoleError(false)
					}}
					error={roleError}
					helperText={roleError ? 'Role is required' : ''}
					fullWidth
					size="small"
				/>
			</DialogContent>

			<DialogActions
				sx={{
					px: 2,
					pb: 2,
					pt: 1,
					borderTop: '1px solid',
					borderColor: 'divider',
					gap: 1,
					justifyContent: 'flex-end',
				}}
			>
				<Button
					onClick={handleClose}
					variant="outlined"
					size="medium"
					sx={{
						minWidth: 100,
						fontSize: 14,
						fontWeight: 400,
						borderRadius: '8px',
						boxShadow: 'none',
						border: '2px solid',
						textTransform: 'none',
						'&:focus': { outline: 'none' },
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={handleAdd}
					variant="contained"
					size="medium"
					sx={{
						minWidth: 100,
						fontSize: 14,
						fontWeight: 400,
						borderRadius: '8px',
						boxShadow: 'none',
						textTransform: 'none',
						'&:focus': { outline: 'none' },
					}}
				>
					Add
				</Button>
			</DialogActions>
		</Dialog>
	)
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
						'&:hover': { bgcolor: 'action.hover' },
					}}
				>
					<Stack direction="row" spacing={2} alignItems="center" flex={1}>
						<Avatar
							src={account.avatar_s3_key || undefined}
							sx={{ width: 40, height: 40, fontSize: '1rem' }}
						>
							{account.name.charAt(0)}
						</Avatar>
						<Box flex={1}>
							<Typography variant="body2" fontWeight={500}>
								{account.name}
							</Typography>
							<Typography
								variant="caption"
								sx={{
									display: 'block',
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
	onOpenAddUser,
	role = 'patient',
}: {
	onClose: () => void
	currentAccount: ProfileAccount
	onOpenAccountSwitcher: () => void
	onOpenAddUser: () => void
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

	const handleClick = (item: ProfileMenuItem) => {
		if (isDividerMenuItem(item)) return
		if (item.special === 'add-user') {
			onClose()
			onOpenAddUser()
			return
		}
		onClose()
		if (item.path === '/logout') {
			clearAuth()
			navigate('/login')
		} else {
			navigate(item.path)
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
			{/* Header */}
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
							'&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.05)' },
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
				const isAddUser = item.special === 'add-user'
				return (
					<MenuItem
						key={item.path}
						onClick={() => handleClick(item)}
						sx={{
							py: 1,
							px: 2,
							fontSize: '0.875rem',
							color: item.danger ? 'error.main' : isAddUser ? 'primary.main' : 'text.primary',
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							'&:hover': {
								bgcolor: item.danger
									? 'error.lighter'
									: isAddUser
										? 'rgba(43,111,113,0.06)'
										: 'action.hover',
								color: item.danger ? 'error.dark' : 'primary.main',
							},
						}}
					>
						{isAddUser && <PersonAddIcon sx={{ fontSize: 16 }} />}
						{item.label}
					</MenuItem>
				)
			})}
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
	const [addUserOpen, setAddUserOpen] = useState(false)

	const availableAccounts = useMemo(() => lookupData?.patient_profiles ?? [], [lookupData])
	const currentAccount = useMemo(() => {
		if (!lookupData?.patient_profiles?.length) return null
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
			{/* <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200 }}>
				<DoctorNavBar
					onProfileClick={() => {
						setAccountSwitcherOpen(false)
						setDropdownOpen((prev) => !prev)
					}}
					onHospitalChange={handleHospitalChange}
					avatarSrc={role === 'patient' ? (profileAccount.avatar || undefined) : (user?.avatar || undefined)}
				/>
			</Box> */}
			<Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200 }}>
				{role === USER_ROLES.PATIENT ? (
					<AppNavBar
						onProfileClick={() => { 
							setAccountSwitcherOpen(false)
							setDropdownOpen((prev) => !prev)
						}}
						avatarSrc={profileAccount.avatar || undefined}
					/>
				) : (
					<DoctorNavBar
						onProfileClick={() => {
							setAccountSwitcherOpen(false)
							setDropdownOpen((prev) => !prev)
						}}
						onHospitalChange={handleHospitalChange}
						avatarSrc={user?.avatar || undefined}
					/>
				)}
			</Box>

			{dropdownOpen && (
				<ProfileDropdown
					onClose={handleCloseAll}
					currentAccount={profileAccount}
					onOpenAccountSwitcher={handleOpenAccountSwitcher}
					onOpenAddUser={() => setAddUserOpen(true)}
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

			<AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} />

			<Box sx={{ flex: 1, mt: `${NAVBAR_HEIGHT}px` }}>
				{children &&
					cloneElement(children as React.ReactElement<{ activeHospital: LookupHospital | null }>, {
						activeHospital,
					})}
			</Box>
			<ChatBot />
		</Box>
	)
}
