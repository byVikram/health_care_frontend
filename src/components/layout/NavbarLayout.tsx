// src/components/layout/NavbarLayout.tsx
import React, { useState, useEffect, cloneElement } from 'react'
import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import DoctorNavBar from '../common/Navbar/DoctorNavBar'
import AppNavBar from '../common/Navbar/AppNavBar'
import { useAuth } from '../../hooks/useAuth'
import AccountMenuContainer from '../../features/account/AccountMenuContainer'
import type { LookupHospital } from '../../hooks/useAuth'
import { USER_ROLES } from '../../constants/constants'
import { useMemo } from 'react'
import ChatBot from '../ChatBot'
import AppFooter from './AppFooter'
import { buildS3Url } from '../../utils/s3'
import { getPatientDetails } from '../../features/patient/patientService'
import FamilyMemberModal from '../../features/patient/components/FamilyMemberModal'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { AVATAR_CHANGED_EVENT } from '../../hooks/useAvatarChange'

const NAVBAR_HEIGHT = 64

// ---- Layout ----
interface NavbarLayoutProps {
	children?: ReactNode
	showFooter?: boolean
}

export default function NavbarLayout({ children, showFooter = false }: NavbarLayoutProps) {
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
				<AccountMenuContainer
					role={role || 'patient'}
					account={{ name: profileAccount.name, avatar: profileAccount.avatar }}
					familyMembers={familyMembers}
					onOpenMember={(memberId) => setMemberModal({ memberId })}
					onClose={handleCloseAll}
					topOffset={NAVBAR_HEIGHT}
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
			{showFooter && <AppFooter />}
			<ChatBot />
		</Box>
	)
}
