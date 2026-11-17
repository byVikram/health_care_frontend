// src/features/schedule/ScheduleRow.tsx
//
// One appointment of the day list: time, round initials, the patient's name with In-clinic / Video, the reason, the status chip, the one
// main button (Check in / Start video / Start consult / Open consultation) and the three-dots menu.
import { Box } from '@mui/material'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import AvatarTile from '../../components/common/Avatar/AvatarTile'
import StatusPill from '../../components/common/StatusPill/StatusPill'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskMenu, { type DeskMenuItem } from '../../components/common/Menu/DeskMenu'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import type { ScheduleActions } from './useScheduleActions'
import type { ScheduleRowVM } from './scheduleView'

const MODE = {
	clinic: { label: 'In-clinic', icon: DESK_ICONS.clinic, ink: DESK.lilac },
	video: { label: 'Video', icon: DESK_ICONS.video, ink: DESK.info },
}

interface ScheduleRowProps {
	vm: ScheduleRowVM
	actions: ScheduleActions
	/** The row the page was opened on (?appointment_id=). */
	highlighted?: boolean
}

function menuItemsOf(vm: ScheduleRowVM, actions: ScheduleActions): DeskMenuItem[] {
	const items: DeskMenuItem[] = []
	const apt = vm.appt
	if (vm.canOpenSummary) {
		items.push({
			key: 'summary',
			label: 'Open visit summary',
			sub: 'Notes, prescription and vitals',
			icon: DESK_ICONS.file,
			tileBg: DESK.primarySoft,
			tileInk: DESK.primary,
			onSelect: () => actions.openSummary(apt),
		})
	}
	if (vm.canAskReschedule) {
		items.push({
			key: 'ask',
			label: 'Ask to reschedule',
			sub: 'Patient picks a new slot',
			icon: DESK_ICONS.calendar,
			tileBg: DESK.infoSoft,
			tileInk: DESK.info,
			onSelect: () => actions.askReschedule(apt),
		})
	}
	if (vm.canMarkNoShow) {
		items.push({
			key: 'noshow',
			label: 'Mark no-show',
			sub: vm.noShowHint,
			icon: DESK_ICONS.clock,
			tileBg: DESK.warningSoft,
			tileInk: DESK.warning,
			dimmed: !vm.noShowOpen,
			onSelect: () => actions.askNoShow(apt),
		})
	}
	if (vm.canCancel) {
		items.push({
			key: 'cancel',
			label: 'Cancel appointment',
			sub: 'Patient is notified',
			icon: DESK_ICONS.close,
			tileBg: DESK.dangerSoft,
			tileInk: DESK.danger,
			danger: true,
			onSelect: () => actions.askCancel(apt),
		})
	}
	return items
}

export default function ScheduleRow({ vm, actions, highlighted = false }: ScheduleRowProps) {
	const mode = vm.video ? MODE.video : MODE.clinic
	const items = menuItemsOf(vm, actions)
	const busy = actions.busyIds.has(vm.id)
	const border = highlighted
		? DESK.primary
		: vm.state === 'now'
			? DESK.info
			: vm.state === 'late'
				? DESK.dangerLine
				: DESK.line

	return (
		<Box
			id={`schedule-row-${vm.id}`}
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: '14px',
				p: '12px 14px',
				borderRadius: '12px',
				border: `1.5px solid ${border}`,
				bgcolor: vm.finished ? '#FBFCFC' : DESK.raised,
			}}
		>
			<Box component="span" sx={{ width: 62, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
				<Box component="b" sx={{ fontSize: 15, color: vm.finished ? DESK.faint : DESK.ink }}>
					{vm.time}
				</Box>
				<Box component="span" sx={{ fontSize: 11, fontWeight: 700, color: DESK.faint }}>
					{vm.ampm}
				</Box>
			</Box>
			<AvatarTile initials={vm.initials} size={38} radius="round" />
			<Box
				component="span"
				sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}
			>
				<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<Box component="b" sx={{ fontSize: 15, color: vm.finished ? DESK.muted : DESK.ink }}>
						{vm.name}
					</Box>
					<Box
						component="span"
						sx={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '4px',
							fontSize: 12,
							fontWeight: 700,
							color: mode.ink,
						}}
					>
						<DeskIcon d={mode.icon} size={13} />
						{mode.label}
					</Box>
				</Box>
				{vm.sub ? (
					<Box
						component="span"
						sx={{
							fontSize: 12,
							color: DESK.muted,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						{vm.sub}
					</Box>
				) : null}
			</Box>
			<StatusPill label={vm.label} tone={vm.tone} />
			{vm.main ? (
				<DeskButton
					label={vm.main.label}
					icon={vm.main.icon}
					kind={vm.main.kind === 'open' ? 'info' : vm.main.secondary ? 'secondary' : 'primary'}
					size="sm"
					fullWidth={false}
					loading={busy}
					onClick={() => actions.runMain(vm, vm.main as NonNullable<typeof vm.main>)}
				/>
			) : null}
			{items.length > 0 ? <DeskMenu items={items} ariaLabel={`More options for ${vm.name}`} /> : null}
		</Box>
	)
}
