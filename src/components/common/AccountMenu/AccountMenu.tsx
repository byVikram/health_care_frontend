// src/components/common/AccountMenu/AccountMenu.tsx
//
// The panel that opens under the avatar in the navbar (desktop design "account menu", the web's counterpart of the mobile drawer):
// a profile card (photo, name, id, "View profile", the profile-completion bar), for a patient the FAMILY row, the menu rows grouped
// under capitals headings, and Log out. It only draws: the page that owns it decides what each row opens (see features/account).
import { Box } from '@mui/material'
import DeskIcon from '../Icon/DeskIcon'
import AvatarTile from '../Avatar/AvatarTile'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'

export interface AccountMenuRow {
	key: string
	label: string
	/** SVG path of the icon (24x24). */
	icon: string
	/** A small green tag at the end of the row ("NEW"). */
	meta?: string
	onClick: () => void
}

export interface AccountMenuGroup {
	/** The capitals heading; null for a menu with no headings. */
	title: string | null
	rows: AccountMenuRow[]
}

export interface AccountMenuFamilyMember {
	id: string
	name: string
	relationship: string
	avatar?: string
}

interface AccountMenuProps {
	name: string
	avatarSrc?: string
	/** "ID · KH-000123" */
	idLine?: string
	/** 0-100; null hides the bar (a role with no completion figure). */
	completion?: number | null
	onViewProfile: () => void
	/** Shows the "MY QR" tile on the card. */
	onOpenQr?: () => void
	/** The patient's family; null for a role with none. */
	family?: {
		members: AccountMenuFamilyMember[]
		onOpenMember: (id: string) => void
		onAdd: () => void
		onManage: () => void
	} | null
	groups: AccountMenuGroup[]
	onLogout: () => void
	loggingOut?: boolean
	/** Closes the menu (the dimmed area outside it). */
	onClose: () => void
	/** The height of the navbar the panel hangs under. */
	topOffset: number
}

const capsSx = { fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: DESK.muted } as const
const linkButtonSx = {
	p: 0,
	border: 0,
	bgcolor: 'transparent',
	color: DESK.primary,
	fontFamily: 'inherit',
	fontSize: 13,
	fontWeight: 800,
	display: 'flex',
	alignItems: 'center',
	gap: '2px',
	cursor: 'pointer',
} as const

export default function AccountMenu({
	name,
	avatarSrc,
	idLine,
	completion = null,
	onViewProfile,
	onOpenQr,
	family = null,
	groups,
	onLogout,
	loggingOut = false,
	onClose,
	topOffset,
}: AccountMenuProps) {
	return (
		<>
			<Box
				component="button"
				type="button"
				onClick={onClose}
				aria-label="Close menu"
				sx={{
					position: 'fixed',
					inset: `${topOffset}px 0 0 0`,
					zIndex: 299,
					border: 0,
					p: 0,
					bgcolor: '#12373E1F',
					cursor: 'default',
				}}
			/>
			<Box
				role="menu"
				aria-label="Account"
				sx={{
					position: 'fixed',
					top: topOffset + 8,
					right: 24,
					zIndex: 300,
					width: 360,
					maxWidth: 'calc(100vw - 32px)',
					maxHeight: `calc(100vh - ${topOffset + 24}px)`,
					overflowY: 'auto',
					boxSizing: 'border-box',
					p: '8px',
					borderRadius: '18px',
					bgcolor: DESK.raised,
					border: '1px solid #E3EAEB',
					boxShadow: '0 24px 60px #12373E40',
					display: 'flex',
					flexDirection: 'column',
					color: DESK.ink,
					fontFamily: 'inherit',
				}}
			>
				{/* Profile card */}
				<Box sx={{ p: '14px', borderRadius: '14px', bgcolor: DESK.primarySoft, display: 'flex', flexDirection: 'column', gap: '12px' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<Box sx={{ flexShrink: 0, borderRadius: '9999px', border: '2px solid #FFFFFF', display: 'flex' }}>
							<AvatarTile
								src={avatarSrc}
								alt={name}
								initials={name.trim().charAt(0).toUpperCase()}
								size={48}
								radius="round"
								bg="#FFFFFF"
							/>
						</Box>
						<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
							<Box component="b" sx={{ fontSize: 17, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{name}
							</Box>
							{idLine ? (
								<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
									{idLine}
								</Box>
							) : null}
							<Box component="button" type="button" onClick={onViewProfile} sx={{ ...linkButtonSx, alignSelf: 'flex-start' }}>
								View profile
								<DeskIcon d={DESK_ICONS.chevronRight} size={14} strokeWidth={2.4} />
							</Box>
						</Box>
						{onOpenQr ? (
							<Box
								component="button"
								type="button"
								onClick={onOpenQr}
								sx={{
									flexShrink: 0,
									width: 56,
									height: 60,
									borderRadius: '10px',
									border: 0,
									bgcolor: '#FFFFFF',
									color: DESK.ink,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '2px',
									cursor: 'pointer',
								}}
							>
								<DeskIcon d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2M14 18h2v2M18 18h2v2" size={26} />
								<Box component="span" sx={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary }}>
									MY QR
								</Box>
							</Box>
						) : null}
					</Box>
					{completion !== null ? (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
							<Box sx={{ flexGrow: 1, height: 5, borderRadius: '9999px', bgcolor: '#FFFFFF' }}>
								<Box
									sx={{
										width: `${Math.max(0, Math.min(100, completion))}%`,
										height: '100%',
										borderRadius: '9999px',
										bgcolor: DESK.primary,
									}}
								/>
							</Box>
							<Box component="span" sx={{ fontSize: 12, fontWeight: 800 }}>
								{Math.round(completion)}%
							</Box>
							<Box component="span" sx={{ fontSize: 12, fontWeight: 700, color: DESK.primary }}>
								Complete
							</Box>
						</Box>
					) : null}
				</Box>

				{/* Family (patients) */}
				{family ? (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', p: '12px 10px 6px' }}>
						<Box component="span" sx={capsSx}>
							FAMILY
						</Box>
						<Box sx={{ display: 'flex', pl: '8px' }}>
							{family.members.map((member) => (
								<Box
									key={member.id}
									component="button"
									type="button"
									title={`${member.name} (${member.relationship})`}
									aria-label={`Open ${member.name}'s profile`}
									onClick={() => family.onOpenMember(member.id)}
									sx={{ p: 0, ml: '-8px', border: 0, bgcolor: 'transparent', borderRadius: '9999px', cursor: 'pointer', display: 'flex' }}
								>
									<Box sx={{ borderRadius: '9999px', border: '2px solid #FFFFFF', display: 'flex' }}>
										<AvatarTile
											src={member.avatar}
											alt={member.name}
											initials={member.name.trim().charAt(0).toUpperCase()}
											size={32}
											radius="round"
											bg="#ECE6FA"
											ink="#6A4BB5"
										/>
									</Box>
								</Box>
							))}
						</Box>
						<Box
							component="button"
							type="button"
							onClick={family.onAdd}
							aria-label="Add family member"
							sx={{
								ml: '4px',
								width: 32,
								height: 32,
								boxSizing: 'border-box',
								borderRadius: '9999px',
								border: `1.5px dashed ${DESK.primary}`,
								bgcolor: '#FFFFFF',
								color: DESK.primary,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
							}}
						>
							<DeskIcon d="M12 5v14M5 12h14" size={16} strokeWidth={2.4} />
						</Box>
						<Box sx={{ flexGrow: 1 }} />
						<Box component="button" type="button" onClick={family.onManage} sx={linkButtonSx}>
							Manage
							<DeskIcon d={DESK_ICONS.chevronRight} size={14} strokeWidth={2.4} />
						</Box>
					</Box>
				) : null}

				{/* Menu rows */}
				{groups.map((group) => (
					<Box key={group.title ?? 'rows'} sx={{ display: 'flex', flexDirection: 'column', pt: group.title ? 0 : '6px' }}>
						{group.title ? (
							<Box component="span" sx={{ ...capsSx, p: '10px 10px 2px' }}>
								{group.title}
							</Box>
						) : null}
						{group.rows.map((row) => (
							<Box
								key={row.key}
								component="button"
								type="button"
								role="menuitem"
								onClick={row.onClick}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
									width: '100%',
									height: 42,
									p: '0 10px',
									border: 0,
									borderRadius: '10px',
									bgcolor: 'transparent',
									color: DESK.ink,
									textAlign: 'left',
									fontFamily: 'inherit',
									cursor: 'pointer',
									'&:hover': { bgcolor: DESK.page },
								}}
							>
								<Box
									component="span"
									sx={{
										flexShrink: 0,
										width: 32,
										height: 32,
										borderRadius: '9px',
										bgcolor: '#EEF4F4',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<DeskIcon d={row.icon} size={17} />
								</Box>
								<Box component="span" sx={{ flexGrow: 1, fontSize: 14, fontWeight: 700 }}>
									{row.label}
								</Box>
								{row.meta ? (
									<Box
										component="span"
										sx={{ fontSize: 11, fontWeight: 800, color: DESK.success, bgcolor: DESK.successSoft, p: '2px 8px', borderRadius: '6px' }}
									>
										{row.meta}
									</Box>
								) : null}
								<Box component="span" sx={{ display: 'flex', color: DESK.fainter }}>
									<DeskIcon d={DESK_ICONS.chevronRight} />
								</Box>
							</Box>
						))}
					</Box>
				))}

				<Box sx={{ height: 1, m: '8px 4px', bgcolor: DESK.lineSoft }} />
				<Box
					component="button"
					type="button"
					role="menuitem"
					onClick={onLogout}
					disabled={loggingOut}
					sx={{
						alignSelf: 'flex-start',
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						height: 42,
						p: '0 10px',
						border: 0,
						borderRadius: '10px',
						bgcolor: 'transparent',
						color: DESK.danger,
						fontFamily: 'inherit',
						fontSize: 14,
						fontWeight: 800,
						cursor: 'pointer',
						'&:hover': { bgcolor: DESK.page },
					}}
				>
					<DeskIcon d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" size={18} />
					Log out
				</Box>
			</Box>
		</>
	)
}
