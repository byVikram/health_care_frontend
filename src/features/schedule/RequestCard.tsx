// src/features/schedule/RequestCard.tsx
//
// One booking request in the right column: who and when, the reason the patient gave, a red "may need urgent care" note with a Refer link
// when they marked it severe, and Decline / Accept (the three dots hold Accept, Ask to reschedule, Refer and Decline).
import { Box } from '@mui/material'
import AvatarTile from '../../components/common/Avatar/AvatarTile'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import DeskMenu, { type DeskMenuItem } from '../../components/common/Menu/DeskMenu'
import StatusReasonNote from '../appointments/components/StatusReasonNote'
import { RESCHEDULE_ASK_STATUSES } from '../doctor/appointmentRules'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import type { Appointment } from '../../types/appointment'
import type { ScheduleActions } from './useScheduleActions'
import { requestWho } from './scheduleView'
import { initialsOf, isUrgentRequest, isVideoMode, reasonOf, slotWhenOf, statusLabelOf } from './scheduleUtils'

interface RequestCardProps {
	appt: Appointment
	actions: ScheduleActions
}

export default function RequestCard({ appt, actions }: RequestCardProps) {
	const flag = isUrgentRequest(appt)
	const busy = actions.busyIds.has(appt.id)
	const reason = reasonOf(appt)
	const status = statusLabelOf(appt).toLowerCase()
	const items: DeskMenuItem[] = [
		{
			key: 'accept',
			label: 'Accept',
			sub: 'Confirm the booking · patient is notified',
			icon: DESK_ICONS.check,
			tileBg: DESK.successSoft,
			tileInk: DESK.success,
			onSelect: () => actions.accept(appt),
		},
		...(RESCHEDULE_ASK_STATUSES.includes(status)
			? [
					{
						key: 'ask',
						label: 'Ask to reschedule',
						sub: 'Patient picks a new slot',
						icon: DESK_ICONS.calendar,
						tileBg: DESK.infoSoft,
						tileInk: DESK.info,
						onSelect: () => actions.askReschedule(appt),
					},
				]
			: []),
		{
			key: 'refer',
			label: 'Refer to another doctor',
			sub: "Share another doctor's profile",
			icon: DESK_ICONS.refer,
			tileBg: DESK.lilacSoft,
			tileInk: DESK.lilac,
			onSelect: () => actions.askRefer(appt),
		},
		{
			key: 'decline',
			label: 'Decline',
			sub: 'The patient is shown other doctors',
			icon: DESK_ICONS.close,
			tileBg: DESK.dangerSoft,
			tileInk: DESK.danger,
			onSelect: () => actions.askDecline(appt),
		},
	]

	return (
		<Box
			sx={{
				p: '14px',
				borderRadius: '14px',
				border: `1.5px solid ${flag ? DESK.dangerLine : DESK.line}`,
				bgcolor: DESK.raised,
				display: 'flex',
				flexDirection: 'column',
				gap: '10px',
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
				<AvatarTile initials={initialsOf(appt.patient?.name)} size={36} radius="round" />
				<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
					<Box component="b" sx={{ fontSize: 14 }}>
						{appt.patient?.name ?? 'Patient'}
					</Box>
					<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
						{requestWho(appt)}
					</Box>
				</Box>
				<DeskMenu items={items} ariaLabel={`More options for ${appt.patient?.name ?? 'this request'}`} bare />
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, fontWeight: 700 }}>
				<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
					<DeskIcon d={DESK_ICONS.calendar} size={14} />
				</Box>
				{slotWhenOf(appt)}
				<Box component="span" sx={{ fontWeight: 500, color: DESK.muted }}>
					· {isVideoMode(appt.appointment_mode) ? 'Video consult' : 'Pay at clinic'}
				</Box>
			</Box>
			{reason ? (
				<Box component="p" sx={{ m: 0, fontSize: 13, lineHeight: '19px', color: DESK.inkSoft }}>
					<b>Reason · </b>
					{reason}
				</Box>
			) : null}
			{status === 'rescheduled' ? (
				<StatusReasonNote
					status={status}
					title={appt.status_reason_title}
					reason={appt.status_reason}
					compact
				/>
			) : null}
			{flag ? (
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
						p: '8px 10px',
						borderRadius: '9px',
						bgcolor: DESK.dangerSoft,
						color: DESK.danger,
						fontSize: 12,
						fontWeight: 700,
					}}
				>
					<Box component="span" sx={{ flexGrow: 1 }}>
						May need urgent in-person care. Consider referring.
					</Box>
					<Box
						component="button"
						type="button"
						onClick={() => actions.askRefer(appt)}
						sx={{
							p: 0,
							border: 0,
							bgcolor: 'transparent',
							color: DESK.danger,
							fontFamily: 'inherit',
							fontSize: 12,
							fontWeight: 800,
							textDecoration: 'underline',
							cursor: 'pointer',
						}}
					>
						Refer
					</Box>
				</Box>
			) : null}
			<Box sx={{ display: 'flex', gap: '8px' }}>
				<Box sx={{ flex: 1 }}>
					<DeskButton
						label="Decline"
						kind="danger"
						size="md"
						disabled={busy}
						onClick={() => actions.askDecline(appt)}
					/>
				</Box>
				<Box sx={{ flex: 1 }}>
					<DeskButton
						label="Accept"
						kind="primary"
						size="md"
						icon={DESK_ICONS.check}
						loading={busy}
						onClick={() => actions.accept(appt)}
					/>
				</Box>
			</Box>
		</Box>
	)
}
