// src/features/booking/WhoSection.tsx
//
// Step 1 of the Lab tests cart and the home-care booking: who it is for. The signed-in patient and their family members as tiles, and "Add member" (the same
// family-member dialog the profile uses).
import { Avatar, Box } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS, DESK_TILES } from '../../styles/deskTokens'
import FamilyMemberModal from '../patient/components/FamilyMemberModal'
import { bookingPatientKey, type BookingPatient } from './useBookingPatients'
import { choiceSx } from './bookingStyles'
import CartSection from './CartSection'

const TINTS = [DESK_TILES.all, DESK_TILES.care, DESK_TILES.pharmacy, DESK_TILES.lab]

const initials = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase()

interface WhoSectionProps {
	/** The question ("Who is this test for?") and the line under it. */
	title: string
	sub: string
	patients: BookingPatient[]
	loading: boolean
	/** `bookingPatientKey` of the chosen person. */
	selectedKey: string
	onSelect: (patient: BookingPatient) => void
}

export default function WhoSection({ title, sub, patients, loading, selectedKey, onSelect }: WhoSectionProps) {
	const [adding, setAdding] = useState(false)
	// How many people there were when "Add member" was opened: when the list grows, the new person is chosen.
	const before = useRef<number | null>(null)

	useEffect(() => {
		if (before.current !== null && patients.length > before.current) {
			onSelect(patients[patients.length - 1])
			before.current = null
		}
	}, [patients, onSelect])

	return (
		<CartSection step={1} title={title} sub={sub}>
			<Box role="radiogroup" aria-label={title} sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' }, gap: '12px' }}>
				{patients.map((p, index) => {
					const on = bookingPatientKey(p) === selectedKey
					const tint = TINTS[index % TINTS.length]
					return (
						<Box
							key={p.id}
							component="button"
							type="button"
							role="radio"
							aria-checked={on}
							onClick={() => onSelect(p)}
							sx={{
								...choiceSx(on),
								position: 'relative',
								p: '14px 8px',
								borderRadius: '14px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: '8px',
								textAlign: 'center',
							}}
						>
							<Avatar src={p.avatar} alt="" sx={{ width: 48, height: 48, bgcolor: tint.bg, color: tint.ink, fontSize: 16, fontWeight: 800 }}>
								{initials(p.name)}
							</Avatar>
							<Box component="span" sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '100%' }}>
								<Box component="b" sx={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{p.name}
								</Box>
								<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
									{p.relationship}
								</Box>
							</Box>
							{on ? (
								<Box
									component="span"
									sx={{
										position: 'absolute',
										top: 8,
										right: 8,
										width: 20,
										height: 20,
										borderRadius: '9999px',
										bgcolor: DESK.primary,
										color: '#FFFFFF',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<DeskIcon d={DESK_ICONS.check} size={12} strokeWidth={3} />
								</Box>
							) : null}
						</Box>
					)
				})}
				{loading && patients.length === 0 ? (
					<Box component="span" sx={{ gridColumn: '1 / -1', fontSize: 14, color: DESK.muted }}>
						Loading your family…
					</Box>
				) : null}
				<Box
					component="button"
					type="button"
					onClick={() => {
						before.current = patients.length
						setAdding(true)
					}}
					sx={{
						p: '14px 8px',
						borderRadius: '14px',
						border: `1.5px dashed ${DESK.field}`,
						bgcolor: DESK.raised,
						color: DESK.ink,
						fontFamily: 'inherit',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '8px',
						cursor: 'pointer',
					}}
				>
					<Box
						component="span"
						sx={{
							width: 48,
							height: 48,
							borderRadius: '9999px',
							bgcolor: DESK.primarySoft,
							color: DESK.primary,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<DeskIcon d={DESK_ICONS.plus} size={22} strokeWidth={2.4} />
					</Box>
					<Box component="b" sx={{ fontSize: 14 }}>
						Add member
					</Box>
				</Box>
			</Box>
			{adding ? <FamilyMemberModal key="new" open onClose={() => setAdding(false)} /> : null}
		</CartSection>
	)
}
