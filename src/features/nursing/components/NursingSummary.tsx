// src/features/nursing/components/NursingSummary.tsx
//
// The sticky "Booking summary" on the right of the booking pages (the Lab tests summary): For / Where / When (a missing one reads red), the
// services, the price lines and the button, which says what is still missing while the booking is not complete. The price is what the
// patient pays AFTER each visit; nothing is charged now.
import { Box } from '@mui/material'
import type { ChangeEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import { inr, plural } from '../../booking/bookingFormat'
import { BOOKING_CARD } from '../../booking/bookingStyles'
import type { NursingItem } from '../nursingService'

interface Row {
	icon: string
	label: string
	/** null = not chosen yet: `missing` is shown in red instead. */
	value: string | null
	missing: string
}

interface NursingSummaryProps {
	forWho: string | null
	where: string | null
	when: string | null
	whenMissing: string
	items: NursingItem[]
	/** What one visit costs, how many visits, and what it all comes to ('Book now' is one visit at the full price). */
	perVisit: number
	visits: number
	total: number
	/** Why the booking cannot continue yet ('' = it can). */
	blocker: string
	buttonLabel: string
	busy?: boolean
	onContinue: () => void
	/** The "Add another service" link under the services (the browse page). */
	addMoreTo?: string
	/** The optional note for the provider, written in the summary. */
	note?: { label: string; value: string; max: number; onChange: (value: string) => void }
	/** The policy notes shown above the button. */
	footer?: ReactNode
}

export default function NursingSummary({ forWho, where, when, whenMissing, items, perVisit, visits, total, blocker, buttonLabel, busy = false, onContinue, addMoreTo, note, footer }: NursingSummaryProps) {
	const rows: Row[] = [
		{ icon: DESK_ICONS.user, label: 'For', value: forWho, missing: 'Choose who it is for' },
		{ icon: DESK_ICONS.home, label: 'Where', value: where, missing: 'Choose an address' },
		{ icon: DESK_ICONS.calendar, label: 'When', value: when, missing: whenMissing },
	]
	const ready = !blocker && !busy
	return (
		<Box component="aside" aria-label="Booking summary" sx={{ ...BOOKING_CARD, position: { lg: 'sticky' }, top: 20, width: { xs: '100%', lg: 380 }, flexShrink: 0, p: '22px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px' }}>
			<Box component="b" sx={{ fontSize: 18 }}>
				Booking summary
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', borderRadius: '14px', bgcolor: DESK.page, overflow: 'hidden' }}>
				{rows.map((r, i) => (
					<Box key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: '12px', p: '12px 14px', borderTop: i > 0 ? `1px solid ${DESK.raised}` : 0 }}>
						<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
							<DeskIcon d={r.icon} size={18} />
						</Box>
						<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
							<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
								{r.label}
							</Box>
							<Box component="b" sx={{ fontSize: 14, color: r.value ? DESK.ink : DESK.danger }}>
								{r.value ?? r.missing}
							</Box>
						</Box>
					</Box>
				))}
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
				{items.map((item) => (
					<Box key={item.id} component="span" sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: 14 }}>
						<span>{item.name}</span>
						<b>{inr(item.price)}</b>
					</Box>
				))}
				{addMoreTo ? (
					<Box component={Link} to={addMoreTo} sx={{ alignSelf: 'flex-start', fontSize: 13, fontWeight: 800, color: DESK.primary, textDecoration: 'none' }}>
						+ Add another service
					</Box>
				) : null}
			</Box>
			{note ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
					<Box component="b" sx={{ fontSize: 14 }}>
						{note.label}
					</Box>
					<Box
						component="textarea"
						value={note.value}
						onChange={(e: ChangeEvent<HTMLTextAreaElement>) => note.onChange(e.target.value.slice(0, note.max))}
						placeholder="Optional. For example: ring the bell twice, the patient is on the 3rd floor"
						rows={3}
						aria-label={note.label}
						sx={{ width: '100%', boxSizing: 'border-box', p: '10px 12px', border: `1.5px solid ${DESK.lineStrong}`, borderRadius: '12px', fontFamily: 'inherit', fontSize: 13, color: DESK.ink, resize: 'vertical', outline: 0, '&:focus': { borderColor: DESK.primary } }}
					/>
					<Box component="span" sx={{ alignSelf: 'flex-end', fontSize: 12, color: DESK.muted }}>
						{note.value.length}/{note.max}
					</Box>
				</Box>
			) : null}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 14 }}>
				{visits > 1 ? (
					<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.muted }}>
						<span>
							{inr(perVisit)} × {plural(visits, 'visit', 'visits')}
						</span>
						<span>{inr(total)}</span>
					</Box>
				) : null}
				<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.muted }}>
					<span>Visit fee</span>
					<Box component="b" sx={{ color: DESK.success }}>
						Free
					</Box>
				</Box>
				<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', pt: '10px', borderTop: `1px dashed ${DESK.lineStrong}`, fontSize: 17 }}>
					<b>To pay after the visit{visits > 1 ? 's' : ''}</b>
					<b>{inr(total)}</b>
				</Box>
				<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
					Nothing is charged now.
				</Box>
			</Box>
			{footer}
			<Box
				component="button"
				type="button"
				onClick={ready ? onContinue : undefined}
				aria-disabled={!ready}
				sx={{
					height: 50,
					px: '20px',
					border: 0,
					borderRadius: '12px',
					bgcolor: ready ? DESK.primary : DESK.primaryDisabled,
					color: '#FFFFFF',
					fontFamily: 'inherit',
					fontSize: 15,
					fontWeight: 800,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '8px',
					cursor: ready ? 'pointer' : 'not-allowed',
					'&:hover': { filter: ready ? 'brightness(0.97)' : 'none' },
				}}
			>
				{busy ? 'Please wait…' : ready ? buttonLabel : blocker}
			</Box>
		</Box>
	)
}
