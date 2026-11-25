// src/features/nursing/components/NursingVisitDialogs.tsx
//
// The two edits of a scheduled order, one visit at a time (the native app's CancelVisitsSheet and RescheduleVisitSheet):
// (Mount each dialog only while it is open: it starts from a clean choice every time.)
//   - Cancel visits: pick the visits to cancel (or all that are left) and a reason; all of them are cancelled or none. A visit that can't be
//     cancelled any more is shown locked with the reason.
//   - Reschedule a visit: another day (a day another open visit uses is greyed) and time, from the same hourly grid as booking; the visit keeps its length.
// The server decides what is allowed (can_cancel / can_reschedule on each visit); these dialogs only show it and send the choice.
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import DeskDialog from '../../../components/common/Modal/DeskDialog'
import { DESK } from '../../../styles/deskTokens'
import { dayNum, dowShort, monShort } from '../../booking/bookingFormat'
import { VISIT_CANCEL_REASONS } from '../nursingConstants'
import type { OrderVisit, VisitPolicy } from '../nursingService'
import { SLOT_GROUPS, bookingDays, chipTime, dayLabel, minutesOf, rangeLabel, slotTooSoon } from '../nursingTime'
import { isOpenVisit, lockedReason, visitTitle } from '../nursingVisit'
import { useCareService } from '../useCareService'

const chipSx = (on: boolean, disabled = false) =>
	({
		height: 38,
		px: '14px',
		borderRadius: '9999px',
		border: `1.5px solid ${on ? DESK.primary : DESK.lineChoice}`,
		bgcolor: on ? DESK.primaryTint : DESK.raised,
		color: on ? DESK.primary : DESK.ink,
		fontFamily: 'inherit',
		fontSize: 13,
		fontWeight: 800,
		cursor: disabled ? 'not-allowed' : 'pointer',
		opacity: disabled ? 0.5 : 1,
	}) as const

// ---------------------------------------------------------------------------------------------------------

interface CancelVisitsDialogProps {
	open: boolean
	visits: OrderVisit[]
	policy: VisitPolicy
	busy: boolean
	onClose: () => void
	onConfirm: (visitIds: string[], reason: string) => void
}

export function NursingCancelVisitsDialog({ open, visits, policy, busy, onClose, onConfirm }: CancelVisitsDialogProps) {
	const care = useCareService()
	const open_ = visits.filter(isOpenVisit)
	const cancellable = open_.filter((v) => v.can_cancel !== false)
	// The page mounts the dialog only while it is open, so each opening starts from here.
	const [picked, setPicked] = useState<string[]>(() => (cancellable.length === 1 ? [cancellable[0].visit_public_id] : []))
	const [reason, setReason] = useState('')

	const toggle = (id: string) => setPicked((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]))
	const allPicked = cancellable.length > 0 && cancellable.every((v) => picked.includes(v.visit_public_id))

	return (
		<DeskDialog
			open={open}
			title="Cancel visits"
			sub="Nothing is charged. A visit can be cancelled until shortly before it starts."
			okLabel={picked.length > 1 ? `Cancel ${picked.length} visits` : 'Cancel visit'}
			cancelLabel="Keep visits"
			danger
			busy={busy}
			okDisabled={picked.length === 0 || !reason}
			width={540}
			onClose={onClose}
			onOk={() => onConfirm(picked, reason)}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
				{cancellable.length > 1 ? (
					<Box
						component="label"
						sx={{ display: 'flex', alignItems: 'center', gap: '10px', p: '10px 12px', borderRadius: '10px', bgcolor: DESK.page, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
					>
						<Box component="input" type="checkbox" checked={allPicked} onChange={() => setPicked(allPicked ? [] : cancellable.map((v) => v.visit_public_id))} sx={{ width: 18, height: 18, m: 0, accentColor: DESK.primary }} />
						All remaining visits
					</Box>
				) : null}
				{open_.map((v, i) => {
					const locked = v.can_cancel === false
					return (
						<Box
							key={v.visit_public_id}
							component="label"
							sx={{ display: 'flex', alignItems: 'center', gap: '10px', p: '10px 12px', borderRadius: '10px', border: `1px solid ${DESK.lineSoft}`, opacity: locked ? 0.6 : 1, cursor: locked ? 'not-allowed' : 'pointer' }}
						>
							<Box component="input" type="checkbox" disabled={locked} checked={picked.includes(v.visit_public_id)} onChange={() => toggle(v.visit_public_id)} sx={{ width: 18, height: 18, m: 0, accentColor: DESK.primary }} />
							<Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
								<Box component="b" sx={{ fontSize: 14 }}>
									{visitTitle(v, i)}
								</Box>
								<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
									{locked ? lockedReason(v.status, !!v.provider, policy.cancelCutoffMinutes, care.noun) : rangeLabel(v.start_time, v.end_time)}
								</Box>
							</Box>
						</Box>
					)
				})}
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
				<Box component="span" sx={{ fontSize: 13, fontWeight: 600, color: DESK.inkSoft }}>
					Why are you cancelling?
				</Box>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{VISIT_CANCEL_REASONS.map((r) => (
						<Box key={r} component="button" type="button" aria-pressed={reason === r} onClick={() => setReason(r)} sx={chipSx(reason === r)}>
							{r}
						</Box>
					))}
				</Box>
			</Box>
		</DeskDialog>
	)
}

// ---------------------------------------------------------------------------------------------------------

interface RescheduleDialogProps {
	open: boolean
	/** The visit being moved (null = closed). */
	visit: OrderVisit | null
	/** All the order's visits: the days another open visit uses cannot be picked. */
	visits: OrderVisit[]
	policy: VisitPolicy
	busy: boolean
	onClose: () => void
	onConfirm: (date: string, time: string) => void
}

export function NursingRescheduleDialog({ open, visit, visits, policy, busy, onClose, onConfirm }: RescheduleDialogProps) {
	// The page mounts the dialog only while it is open, so each opening starts from here.
	const [date, setDate] = useState<string | null>(null)
	const [time, setTime] = useState<string | null>(null)
	const [now, setNow] = useState(() => new Date())

	// the "too soon" slots change as the minutes pass
	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 15_000)
		return () => clearInterval(id)
	}, [])

	const usedDays = new Set(visits.filter((v) => isOpenVisit(v) && v.visit_public_id !== visit?.visit_public_id).map((v) => v.date))
	const days = bookingDays(now)

	return (
		<DeskDialog
			open={open && !!visit}
			title="Reschedule visit"
			sub={visit ? `Now: ${dayLabel(visit.date)} · ${rangeLabel(visit.start_time, visit.end_time)}. The visit keeps its length.` : undefined}
			okLabel="Move visit"
			busy={busy}
			okDisabled={!date || !time}
			width={600}
			onClose={onClose}
			onOk={() => date && time && onConfirm(date, time)}
		>
			<Box role="group" aria-label="Days" sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px' }}>
				{days.map((iso, i) => {
					const used = usedDays.has(iso)
					const on = date === iso
					return (
						<Box
							key={iso}
							component="button"
							type="button"
							disabled={used}
							aria-pressed={on}
							aria-label={`${dowShort(iso)} ${dayNum(iso)} ${monShort(iso)}${used ? ', used by another visit' : ''}`}
							onClick={() => setDate(iso)}
							sx={{
								height: 62,
								borderRadius: '10px',
								border: `1.5px solid ${on ? DESK.primary : DESK.lineChoice}`,
								bgcolor: on ? DESK.primary : DESK.raised,
								color: on ? '#FFFFFF' : DESK.ink,
								fontFamily: 'inherit',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: used ? 'not-allowed' : 'pointer',
								opacity: used ? 0.4 : 1,
							}}
						>
							<Box component="span" sx={{ fontSize: 11, fontWeight: 700 }}>
								{i === 0 ? 'Today' : dowShort(iso)}
							</Box>
							<Box component="b" sx={{ fontSize: 17 }}>
								{dayNum(iso)}
							</Box>
						</Box>
					)
				})}
			</Box>
			{date
				? SLOT_GROUPS.map((group) => (
						<Box key={group.label} sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
							<Box component="span" sx={{ fontSize: 13, fontWeight: 800, color: DESK.inkSoft }}>
								{group.label}
							</Box>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
								{group.slots.map((slot) => {
									// too soon, or the visit's own day and time (moving a visit to where it already is does nothing)
									const current = !!visit && date === visit.date && minutesOf(slot) === minutesOf(visit.start_time)
									const soon = current || slotTooSoon(date, minutesOf(slot), policy.assignLeadMinutes, now)
									return (
										<Box key={slot} component="button" type="button" disabled={soon} aria-pressed={time === slot} onClick={() => setTime(slot)} sx={{ ...chipSx(time === slot, soon), textDecoration: soon ? 'line-through' : 'none' }}>
											{chipTime(slot)}
										</Box>
									)
								})}
							</Box>
						</Box>
					))
				: null}
		</DeskDialog>
	)
}
