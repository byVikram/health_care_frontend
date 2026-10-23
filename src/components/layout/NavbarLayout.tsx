// src/components/layout/NavbarLayout.tsx
import React, { useState, useRef, useEffect, cloneElement } from 'react'
import type { ReactNode } from 'react'
import {
	Avatar,
	Box,
	IconButton,
	Paper,
	MenuItem,
	Divider,
	Tooltip,
	Typography,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import DoctorNavBar from '../common/Navbar/DoctorNavBar'
import AppNavBar from '../common/Navbar/AppNavBar'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../features/auth/authService'
import type { LookupHospital } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { USER_ROLES } from '../../constants/constants'
import { ROUTES } from '../../constants/routes'
import { useMemo } from 'react'
import ChatBot from '../ChatBot'
import { buildS3Url } from '../../utils/s3'
import { getPatientDetails } from '../../features/patient/patientService'
import FamilyMemberModal from '../../features/patient/components/FamilyMemberModal'
import { useFamilyMembers, type FamilyMemberOption } from '../../hooks/useFamilyMembers'
import { AVATAR_CHANGED_EVENT } from '../../hooks/useAvatarChange'

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
	{ label: 'My Appointments', path: ROUTES.APPOINTMENTS },
	{ label: 'Medicine Orders', path: ROUTES.PHARMACY.ORDERS },
	{ label: 'Radiology Bookings', path: ROUTES.RADIOLOGY.BOOKINGS },
	{ label: 'My Favourite Doctors', path: ROUTES.PORTAL.FAVOURITES },
	{ label: 'Book a Cab', path: ROUTES.PORTAL.TRANSPORTATION },
	{ label: 'My Feedback', path: '#' },
	{ divider: true },
	{ label: 'Profile', path: ROUTES.PORTAL.PROFILE },
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

// ---- Profile Dropdown ----
function ProfileDropdown({
	onClose,
	currentAccount,
	familyMembers,
	onOpenMember,
	role = 'patient',
}: {
	onClose: () => void
	currentAccount: ProfileAccount
	/** The signed-in patient's family members (not the patient) */
	familyMembers: FamilyMemberOption[]
	/** Opens the family-member dialog: for that member, or empty (to add one) when no id is given */
	onOpenMember: (memberId?: string) => void
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

	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const handleClick = async (item: ProfileMenuItem) => {
		if (isDividerMenuItem(item)) return
		if (item.path === '/logout') {
			if (isLoggingOut) return
			setIsLoggingOut(true)
			try {
				onClose()
				await logout()
				navigate('/login')
			} finally {
				setIsLoggingOut(false)
			}
		} else {
			onClose()
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
			</Box>

			{role === USER_ROLES.PATIENT && (
				<Box sx={{ px: '20px', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
					<Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.6, color: 'text.secondary' }}>
						FAMILY
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 1 }}>
						{familyMembers.map((member) => (
							<Tooltip key={member.id} title={`${member.name} (${member.relationship})`}>
								<IconButton
									size="small"
									aria-label={`Open ${member.name}'s profile`}
									onClick={() => {
										onClose()
										onOpenMember(member.id)
									}}
									sx={{ p: 0.25, '&:focus': { outline: 'none' } }}
								>
									<Avatar src={member.avatar} alt={member.name} sx={{ width: 36, height: 36, fontSize: 15 }}>
										{member.name.charAt(0).toUpperCase()}
									</Avatar>
								</IconButton>
							</Tooltip>
						))}
						<Tooltip title="Add family member">
							<IconButton
								size="small"
								aria-label="Add family member"
								onClick={() => {
									onClose()
									onOpenMember()
								}}
								sx={{
									width: 36,
									height: 36,
									border: '1.5px dashed',
									borderColor: 'primary.main',
									color: 'primary.main',
									'&:focus': { outline: 'none' },
								}}
							>
								<AddIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</Box>
				</Box>
			)}

			{getProfileMenuItems(role).map((item, idx) => {
				if (isDividerMenuItem(item)) {
					return <Divider key={`divider-${idx}`} sx={{ my: 0.5 }} />
				}
				return (
					<MenuItem
						key={`${item.path}-${idx}`}
						onClick={() => handleClick(item)}
						sx={{
							py: 1,
							px: 2,
							fontSize: '0.875rem',
							color: item.danger ? 'error.main' : 'text.primary',
							display: 'flex',
							alignItems: 'center',
							gap: 1,
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
		</Paper>
	)
}

// ---- Layout ----
interface NavbarLayoutProps {
	children?: ReactNode
}

export default function NavbarLayout({ children }: NavbarLayoutProps) {
	const { role, user, lookupData } = useAuth()
	const { members } = useFamilyMembers() // the signed-in patient and their family (a patient only)
	const familyMembers = members.filter((m) => !m.isSelf)
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const [activeHospital, setActiveHospital] = useState<LookupHospital | null>(null)
	// the family-member dialog: `{}` adds a member, `{ memberId }` views / edits one; null = closed
	const [memberModal, setMemberModal] = useState<{ memberId?: string } | null>(null)
	const [patientAvatarKey, setPatientAvatarKey] = useState('')

	// The signed-in patient is always the account holder; family members are chosen on the pages that need one
	// (booking, profile), never by switching the whole app to them.
	const currentAccount = useMemo(() => {
		if (!lookupData?.patient_profiles?.length) return null
		return lookupData.patient_profiles.find((profile) => profile.is_self) || lookupData.patient_profiles[0]
	}, [lookupData])

	useEffect(() => {
		// an earlier version stored the "active" family member here: forget it so nothing acts as that member
		localStorage.removeItem('patient_id')
	}, [])

	useEffect(() => {
		const userId = user?.id
		if (role !== USER_ROLES.PATIENT || !userId) return

		const patientId = userId as string
		let active = true
		const fetchPatientAvatar = async () => {
			try {
				const res = await getPatientDetails(patientId)
				if (active) {
					setPatientAvatarKey(res.data.personal.avatar || '')
				}
			} catch {
				if (active) setPatientAvatarKey('')
			}
		}

		fetchPatientAvatar()
		// the profile page announces a new or removed photo; follow it without a reload
		const onAvatarChanged = (e: Event) => setPatientAvatarKey((e as CustomEvent<string>).detail || '')
		window.addEventListener(AVATAR_CHANGED_EVENT, onAvatarChanged)
		return () => {
			active = false
			window.removeEventListener(AVATAR_CHANGED_EVENT, onAvatarChanged)
		}
	}, [role, user?.id])

	const profileAccount = {
		id: currentAccount?.id || '',
		name: currentAccount?.name || '',
		email: user?.email || '',
		relation: currentAccount?.relation || '',
		avatar: buildS3Url(currentAccount?.avatar_s3_key || user?.avatar || patientAvatarKey),
	}

	const handleCloseAll = () => {
		setDropdownOpen(false)
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
								setDropdownOpen((prev) => !prev)
						}}
						avatarSrc={profileAccount.avatar || undefined}
					/>
				) : (
					<DoctorNavBar
						onProfileClick={() => {
								setDropdownOpen((prev) => !prev)
						}}
						onHospitalChange={handleHospitalChange}
						avatarSrc={buildS3Url(user?.avatar) || undefined}
					/>
				)}
			</Box>

			{dropdownOpen && (
				<ProfileDropdown
					onClose={handleCloseAll}
					currentAccount={profileAccount}
					familyMembers={familyMembers}
					onOpenMember={(memberId) => setMemberModal({ memberId })}
					role={role || 'patient'}
				/>
			)}

			{memberModal && (
				<FamilyMemberModal
					key={memberModal.memberId ?? 'new'}
					open
					memberId={memberModal.memberId}
					onClose={() => setMemberModal(null)}
				/>
			)}

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
