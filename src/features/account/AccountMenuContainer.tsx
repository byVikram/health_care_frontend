// src/features/account/AccountMenuContainer.tsx
//
// The account menu under the navbar avatar, wired up: the rows come from the server by role (useAccountMenu) and are mapped to web pages
// (accountMenuItems), a patient's card and family come from the patient summary and the family list, and a click closes the menu and
// opens the page. The drawing is the shared AccountMenu.
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AccountMenu, { type AccountMenuGroup } from '../../components/common/AccountMenu/AccountMenu'
import { useAuth } from '../../hooks/useAuth'
import type { FamilyMemberOption } from '../../hooks/useFamilyMembers'
import { logout } from '../auth/authService'
import { buildS3Url } from '../../utils/s3'
import { USER_ROLES } from '../../constants/constants'
import { ROUTES } from '../../constants/routes'
import { FALLBACK_ICON, ICON_PATHS, targetOf } from './accountMenuItems'
import { useAccountMenu } from './useAccountMenu'

interface AccountMenuContainerProps {
	role: string
	/** The account holder as the navbar already knows them (shown until the summary arrives, and for a role with no summary). */
	account: { name: string; avatar?: string }
	/** The patient's family members (not the patient). */
	familyMembers: FamilyMemberOption[]
	/** Opens the family-member dialog: for that member, or empty (to add one) when no id is given. */
	onOpenMember: (memberId?: string) => void
	onClose: () => void
	topOffset: number
}

export default function AccountMenuContainer({
	role,
	account,
	familyMembers,
	onOpenMember,
	onClose,
	topOffset,
}: AccountMenuContainerProps) {
	const navigate = useNavigate()
	const { user } = useAuth()
	const { rows, summary } = useAccountMenu(true, role)
	const [loggingOut, setLoggingOut] = useState(false)
	const patient = role === USER_ROLES.PATIENT

	const open = (path: string) => {
		onClose()
		navigate(path)
	}

	// Consecutive rows with the same heading sit under it; a row the web has no page for is left out.
	const groups = useMemo(() => {
		const out: AccountMenuGroup[] = []
		for (const row of rows) {
			const target = targetOf(row.key, role)
			if (!target) continue
			const entry = {
				key: row.key,
				label: row.label,
				icon: ICON_PATHS[row.icon] ?? FALLBACK_ICON,
				onClick: () => open(target),
			}
			const last = out[out.length - 1]
			if (last && last.title === row.group) last.rows.push(entry)
			else out.push({ title: row.group, rows: [entry] })
		}
		return out
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rows, role])

	const handleLogout = async () => {
		if (loggingOut) return
		setLoggingOut(true)
		try {
			onClose()
			await logout()
			navigate('/login')
		} finally {
			setLoggingOut(false)
		}
	}

	const name = (patient ? summary?.name : undefined) || account.name || user?.name || ''
	const avatarSrc = (patient ? buildS3Url(summary?.avatar_url) : '') || account.avatar || undefined

	return (
		<AccountMenu
			name={name}
			avatarSrc={avatarSrc}
			idLine={patient && summary?.display_id ? `ID · ${summary.display_id}` : undefined}
			completion={patient && summary ? summary.profile_completion : null}
			onViewProfile={() => open(ROUTES.PORTAL.PROFILE)}
			family={
				patient
					? {
							members: familyMembers,
							onOpenMember: (id) => {
								onClose()
								onOpenMember(id)
							},
							onAdd: () => {
								onClose()
								onOpenMember()
							},
							onManage: () => open(ROUTES.PORTAL.PROFILE),
						}
					: null
			}
			groups={groups}
			onLogout={() => void handleLogout()}
			loggingOut={loggingOut}
			onClose={onClose}
			topOffset={topOffset}
		/>
	)
}
