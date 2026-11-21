// src/components/common/PersonFilter/PersonFilter.tsx
//
// The "For Everyone" card of the desktop list pages (next to the search box): the stacked photos of the people on the account, "For" and
// who is chosen, and a menu with "Everyone", the account holder and every family member. It only reports the choice (`value` is a
// person's public id, or ALL_PEOPLE); the page decides what to filter. Nothing is shown when the account has just one person.
import { Box, Menu } from '@mui/material'
import { useState, type MouseEvent } from 'react'
import DeskIcon from '../Icon/DeskIcon'
import AvatarTile from '../Avatar/AvatarTile'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'

/** The value that means nobody in particular: every person on the account. */
export const ALL_PEOPLE = 'all'

export interface PersonOption {
	/** The person's public id. */
	id: string
	name: string
	/** 'Self' for the account holder, otherwise the relation (e.g. 'Spouse'). */
	relationship: string
	/** A photo link; the initials show when there is none. */
	avatar?: string
}

interface PersonFilterProps {
	people: PersonOption[]
	value: string
	onChange: (value: string) => void
}

const initialsOf = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('')

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name

const TONES = [
	{ bg: '#E3EFEF', ink: '#2B6F71' },
	{ bg: '#FDF1DC', ink: '#8A5300' },
	{ bg: '#ECE6FA', ink: '#6A4BB5' },
	{ bg: '#DDEBFA', ink: '#2463A8' },
]

function Person({ person, index, size }: { person: PersonOption; index: number; size: number }) {
	const tone = TONES[index % TONES.length]
	return (
		<AvatarTile
			src={person.avatar}
			alt={person.name}
			initials={initialsOf(person.name)}
			size={size}
			radius="round"
			bg={tone.bg}
			ink={tone.ink}
		/>
	)
}

export default function PersonFilter({ people, value, onChange }: PersonFilterProps) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null)
	if (people.length < 2) return null

	const chosen = people.find((person) => person.id === value) ?? null
	const open = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)
	const close = () => setAnchor(null)
	const pick = (next: string) => {
		close()
		onChange(next)
	}

	const row = (selected: boolean) => ({
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		p: '8px 10px',
		border: 0,
		borderRadius: '8px',
		bgcolor: selected ? DESK.primaryTint : 'transparent',
		color: DESK.ink,
		textAlign: 'left' as const,
		fontFamily: 'inherit',
		cursor: 'pointer',
		'&:hover': { bgcolor: DESK.page },
	})

	return (
		<>
			<Box
				component="button"
				type="button"
				onClick={open}
				aria-haspopup="menu"
				aria-expanded={!!anchor}
				aria-label={`Show bookings for: ${chosen ? chosen.name : 'everyone'}`}
				sx={{
					height: 42,
					boxSizing: 'border-box',
					px: '10px',
					borderRadius: '10px',
					border: `1px solid ${DESK.field}`,
					bgcolor: DESK.raised,
					color: DESK.ink,
					display: 'inline-flex',
					alignItems: 'center',
					gap: '8px',
					fontFamily: 'inherit',
					fontSize: 14,
					cursor: 'pointer',
					flexShrink: 0,
					'&:focus-visible': { outline: 'none', borderColor: DESK.primary, boxShadow: '0 0 0 3px #2B6F711F' },
				}}
			>
				<Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
					{(chosen ? [chosen] : people.slice(0, 3)).map((person, index) => (
						<Box
							key={person.id}
							component="span"
							sx={{
								display: 'inline-flex',
								ml: index === 0 ? 0 : '-8px',
								borderRadius: '9999px',
								border: `2px solid ${DESK.raised}`,
							}}
						>
							<Person person={person} index={people.indexOf(person)} size={26} />
						</Box>
					))}
				</Box>
				<Box component="span" sx={{ color: DESK.muted }}>
					For
				</Box>
				<Box component="b" sx={{ fontWeight: 800 }}>
					{chosen ? firstName(chosen.name) : 'Everyone'}
				</Box>
				<DeskIcon d={DESK_ICONS.chevronDown} size={14} strokeWidth={2.4} />
			</Box>
			<Menu
				anchorEl={anchor}
				open={!!anchor}
				onClose={close}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				slotProps={{
					paper: {
						sx: {
							mt: '4px',
							minWidth: 260,
							p: '6px',
							borderRadius: '12px',
							border: '1px solid #E3EAEB',
							boxShadow: DESK.shadowMenu,
						},
					},
					list: { sx: { p: 0, display: 'flex', flexDirection: 'column', gap: '2px' } },
				}}
			>
				<Box
					component="button"
					type="button"
					role="menuitemradio"
					aria-checked={!chosen}
					onClick={() => pick(ALL_PEOPLE)}
					sx={row(!chosen)}
				>
					<Box
						component="span"
						sx={{
							flexShrink: 0,
							width: 32,
							height: 32,
							borderRadius: '9999px',
							bgcolor: DESK.primarySoft,
							color: DESK.primary,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<DeskIcon d={DESK_ICONS.users} size={16} />
					</Box>
					<Box component="span" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
						<Box component="b" sx={{ fontSize: 13 }}>
							Everyone
						</Box>
						<Box component="span" sx={{ fontSize: 11, color: DESK.muted }}>
							You and your family
						</Box>
					</Box>
					{!chosen ? <DeskIcon d={DESK_ICONS.check} size={16} strokeWidth={2.4} /> : null}
				</Box>
				{people.map((person, index) => {
					const selected = person.id === value
					return (
						<Box
							key={person.id}
							component="button"
							type="button"
							role="menuitemradio"
							aria-checked={selected}
							onClick={() => pick(person.id)}
							sx={row(selected)}
						>
							<Person person={person} index={index} size={32} />
							<Box
								component="span"
								sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}
							>
								<Box component="b" sx={{ fontSize: 13 }}>
									{person.name}
								</Box>
								<Box component="span" sx={{ fontSize: 11, color: DESK.muted }}>
									{person.relationship}
								</Box>
							</Box>
							{selected ? <DeskIcon d={DESK_ICONS.check} size={16} strokeWidth={2.4} /> : null}
						</Box>
					)
				})}
			</Menu>
		</>
	)
}
