// src/features/schedule/SchedulePage.tsx
//
// The doctor's Schedule (desktop design "Desktop · Schedule"): on the left a month calendar and the clinic switcher, in the middle the
// picked day (stats, the appointments still to go, the finished ones folded away), on the right the Booking requests with the
// Auto-confirm switch. Reads and rules: useScheduleData, scheduleView; the actions: useScheduleActions (the same calls as the older
// appointments list). Only doctors see it; a patient is sent to My bookings.
import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import { USER_ROLES } from '../../constants/constants'
import MonthCalendar, { type DayMark } from '../../components/common/Calendar/MonthCalendar'
import RailItem from '../../components/common/Rail/RailItem'
import SegmentTabs from '../../components/common/Tabs/SegmentTabs'
import type { TabOption } from '../../components/common/Tabs/UnderlineTabs'
import SectionLabel from '../../components/common/SectionLabel/SectionLabel'
import StatusPill from '../../components/common/StatusPill/StatusPill'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import { DESK, DESK_ICONS, DESK_TILES } from '../../styles/deskTokens'
import { getAppointmentById } from '../../services/appointmentService'
import { clinicTodayIso } from '../doctor/appointmentRules'
import type { Appointment } from '../../types/appointment'
import useScheduleData from './useScheduleData'
import useScheduleActions from './useScheduleActions'
import ScheduleRow from './ScheduleRow'
import RequestCard from './RequestCard'
import AutoConfirmSwitch from './AutoConfirmSwitch'
import { buildRowVM, dayHeading, isListed } from './scheduleView'
import { getAutoConfirm, setAutoConfirm, type DoctorClinic } from './scheduleService'
import { dateLabelOf, isVideoMode, statusLabelOf } from './scheduleUtils'

type Scope = 'all' | 'video' | (string & {})
type Mode = 'all' | 'clinic' | 'video'

const MODE_TABS: TabOption<Mode>[] = [
	{ value: 'all', label: 'All' },
	{ value: 'clinic', label: 'In-clinic' },
	{ value: 'video', label: 'Video' },
]

const NAVBAR_HEIGHT = 64

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** The appointments that belong to a scope: every clinic and video, video only, or one clinic's in-clinic visits. */
const inScope = (apt: Appointment, scope: Scope): boolean => {
	if (scope === 'all') return true
	if (scope === 'video') return isVideoMode(apt.appointment_mode)
	return !isVideoMode(apt.appointment_mode) && apt.hospital?.id === scope
}

/** "7 in-clinic today · 5–8 PM" / "Not today · Mon, Wed 5–8 PM" from the clinics API. */
const clinicSub = (clinic: DoctorClinic): string => {
	if (clinic.patients_today > 0) {
		return `${clinic.patients_today} in-clinic today${clinic.timings ? ` · ${clinic.timings}` : ''}`
	}
	return clinic.timings ? `Not today · ${clinic.timings}` : 'Not today'
}

const dashedCard = {
	p: '40px 20px',
	borderRadius: '14px',
	border: `1.5px dashed ${DESK.lineStrong}`,
	bgcolor: DESK.raised,
	textAlign: 'center',
	display: 'flex',
	flexDirection: 'column',
	gap: '6px',
	alignItems: 'center',
} as const

export default function SchedulePage() {
	const { role } = useAuth()
	if (role !== USER_ROLES.DOCTOR) return <Navigate to={ROUTES.BOOKINGS} replace />
	return <DoctorSchedule />
}

function DoctorSchedule() {
	const todayIso = clinicTodayIso()
	const [searchParams] = useSearchParams()
	const openedId = searchParams.get('appointment_id')

	const [selectedIso, setSelectedIso] = useState(todayIso)
	const [shown, setShown] = useState(() => ({
		year: Number(todayIso.slice(0, 4)),
		month: Number(todayIso.slice(5, 7)) - 1,
	}))
	const [scope, setScope] = useState<Scope>('all')
	const [mode, setMode] = useState<Mode>('all')
	const [finishedOpen, setFinishedOpen] = useState(false)
	const [highlightId, setHighlightId] = useState<string | null>(null)
	const [autoOn, setAutoOn] = useState<boolean | null>(null)
	const [autoBusy, setAutoBusy] = useState(false)

	const data = useScheduleData(todayIso, selectedIso, shown.year, shown.month)
	const actions = useScheduleActions(data.refresh)

	// The Auto-confirm switch
	useEffect(() => {
		let cancelled = false
		const run = async () => {
			try {
				const state = await getAutoConfirm()
				if (!cancelled) setAutoOn(state.enabled)
			} catch {
				// The switch stays locked: nothing is shown as on or off on a guess.
			}
		}
		void run()
		return () => {
			cancelled = true
		}
	}, [])

	// ?appointment_id=: open the calendar on that appointment's day and mark its row
	useEffect(() => {
		if (!openedId) return
		let cancelled = false
		const run = async () => {
			try {
				const apt = await getAppointmentById(openedId)
				if (cancelled || !apt?.appointment_date) return
				const [year, month] = apt.appointment_date.split('-').map(Number)
				setSelectedIso(apt.appointment_date)
				setShown({ year, month: month - 1 })
				setHighlightId(apt.id)
			} catch {
				// An old link: the page simply opens on today.
			}
		}
		void run()
		return () => {
			cancelled = true
		}
	}, [openedId])

	const toggleAutoConfirm = async (enabled: boolean) => {
		setAutoBusy(true)
		try {
			const res = await setAutoConfirm(enabled)
			setAutoOn(res.enabled)
			const confirmed = enabled ? (res.confirmed_now ?? 0) : 0
			toast.success(
				!enabled
					? 'Auto-confirm off · you approve each booking'
					: confirmed
						? `Auto-confirm on · ${plural(confirmed, 'request')} confirmed`
						: 'Auto-confirm on · open slots confirm instantly'
			)
			if (confirmed) data.refresh()
		} catch {
			// The shared API client already showed the reason; the switch keeps its old position.
		} finally {
			setAutoBusy(false)
		}
	}

	// ── the picked day ─────────────────────────────────────────────────────────────────────────────────

	const isToday = selectedIso === todayIso
	const dayVMs = useMemo(
		() =>
			(data.dayRows ?? [])
				.filter((apt) => isListed(apt, data.referred) && inScope(apt, scope))
				.sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))
				.map((apt) => buildRowVM(apt, data.referred, todayIso)),
		[data.dayRows, data.referred, scope, todayIso]
	)
	const shownVMs = dayVMs.filter((vm) => mode === 'all' || (mode === 'video') === vm.video)
	const openVMs = shownVMs.filter((vm) => !vm.finished)
	const finishedVMs = shownVMs.filter((vm) => vm.finished)
	const seen = dayVMs.filter((vm) => vm.state === 'done').length
	const noShows = dayVMs.filter((vm) => vm.state === 'noshow').length
	const finishedShown = finishedOpen || openVMs.length === 0

	// Today's counts for the clinic list (every clinic and video, whatever is chosen)
	const todayListed = useMemo(
		() =>
			(data.todayRows ?? []).filter(
				(apt) => isListed(apt, data.referred) && statusLabelOf(apt).toLowerCase() !== 'cancelled'
			),
		[data.todayRows, data.referred]
	)
	const videoToday = todayListed.filter((apt) => isVideoMode(apt.appointment_mode)).length

	// The dots of the calendar: the days of the shown month that have appointments in this scope
	const markedDays = useMemo(() => {
		const days = new Set<string>()
		data.monthRows
			.filter(
				(apt) =>
					isListed(apt, data.referred) &&
					statusLabelOf(apt).toLowerCase() !== 'cancelled' &&
					inScope(apt, scope)
			)
			.forEach((apt) => days.add(apt.appointment_date))
		return days
	}, [data.monthRows, data.referred, scope])
	const markOf = (iso: string): DayMark => (markedDays.has(iso) ? (iso < todayIso ? 'past' : 'upcoming') : 'none')

	// Scroll to the row the page was opened on
	useEffect(() => {
		if (!highlightId || !data.dayRows) return
		document.getElementById(`schedule-row-${highlightId}`)?.scrollIntoView({ block: 'center' })
	}, [highlightId, data.dayRows])

	const scopeName =
		scope === 'all'
			? 'all clinics & video'
			: scope === 'video'
				? 'Video consults'
				: (data.clinics.find((c) => c.id === scope)?.name ?? 'this clinic')
	const dayTitle = dayHeading(selectedIso, todayIso, dateLabelOf(selectedIso))
	const daySub = `${plural(shownVMs.length, 'appointment')} · ${scopeName}`

	const jumpToToday = () => {
		setSelectedIso(todayIso)
		setShown({ year: Number(todayIso.slice(0, 4)), month: Number(todayIso.slice(5, 7)) - 1 })
	}
	const moveMonth = (delta: number) =>
		setShown(({ year, month }) => {
			const next = month + delta
			return next < 0
				? { year: year - 1, month: 11 }
				: next > 11
					? { year: year + 1, month: 0 }
					: { year, month: next }
		})

	const loadingDay = data.dayRows === null && !data.dayError
	const dayFailed = data.dayRows === null && !!data.dayError

	return (
		<Box
			sx={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, bgcolor: DESK.page, color: DESK.ink, overflow: 'hidden' }}
		>
			<Box
				sx={{
					height: '100%',
					boxSizing: 'border-box',
					maxWidth: 1376,
					mx: 'auto',
					px: '24px',
					py: '20px',
					display: 'flex',
					gap: '20px',
				}}
			>
				{/* Left: calendar and clinics */}
				<Box
					component="aside"
					sx={{
						width: 290,
						flexShrink: 0,
						display: 'flex',
						flexDirection: 'column',
						gap: '14px',
						overflowY: 'auto',
					}}
				>
					<MonthCalendar
						year={shown.year}
						month={shown.month}
						selectedIso={selectedIso}
						todayIso={todayIso}
						markOf={markOf}
						onSelect={setSelectedIso}
						onPrevMonth={() => moveMonth(-1)}
						onNextMonth={() => moveMonth(1)}
						onJumpToToday={jumpToToday}
					/>
					<Box
						component="section"
						sx={{
							bgcolor: DESK.raised,
							border: `1px solid ${DESK.line}`,
							borderRadius: '16px',
							p: '8px',
							display: 'flex',
							flexDirection: 'column',
							gap: '2px',
						}}
					>
						<Box
							component="span"
							sx={{
								p: '8px 10px 4px',
								fontSize: 11,
								fontWeight: 800,
								letterSpacing: '0.06em',
								color: DESK.muted,
							}}
						>
							WHERE YOU’RE CONSULTING
						</Box>
						{data.clinics.map((clinic, index) => (
							<RailItem
								key={clinic.id}
								size="clinic"
								label={clinic.name}
								sub={clinicSub(clinic)}
								icon={DESK_ICONS.clinic}
								tileBg={(index === 0 ? DESK_TILES.clinic : DESK_TILES.clinicAlt).bg}
								tileInk={(index === 0 ? DESK_TILES.clinic : DESK_TILES.clinicAlt).ink}
								selected={scope === clinic.id}
								selectedBg={DESK.primaryTint}
								tickWhenSelected
								onClick={() => setScope(clinic.id)}
							/>
						))}
						<RailItem
							size="clinic"
							label="Video consults"
							sub={`${plural(videoToday, 'video consult')} today`}
							icon={DESK_ICONS.video}
							tileBg={DESK_TILES.video.bg}
							tileInk={DESK_TILES.video.ink}
							selected={scope === 'video'}
							selectedBg={DESK.primaryTint}
							tickWhenSelected
							onClick={() => setScope('video')}
						/>
						<RailItem
							size="clinic"
							label="All clinics & video"
							sub={`${plural(todayListed.length, 'appointment')} today`}
							icon={DESK_ICONS.calendar}
							tileBg={DESK_TILES.all.bg}
							tileInk={DESK_TILES.all.ink}
							selected={scope === 'all'}
							selectedBg={DESK.primaryTint}
							tickWhenSelected
							onClick={() => setScope('all')}
						/>
					</Box>
				</Box>

				{/* Middle: the day */}
				<Box
					component="section"
					sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}
				>
					<Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
						<Box sx={{ flexGrow: 1 }}>
							<Box component="h1" sx={{ m: 0, fontSize: 24, lineHeight: '30px', fontWeight: 800 }}>
								{dayTitle}
							</Box>
							<Box component="p" sx={{ m: '2px 0 0', fontSize: 14, color: DESK.muted }}>
								{daySub}
							</Box>
						</Box>
						<SegmentTabs value={mode} options={MODE_TABS} onChange={setMode} ariaLabel="Visit type" />
					</Box>

					{isToday && !loadingDay && !dayFailed ? (
						<Box sx={{ display: 'flex', gap: '10px' }}>
							{[
								{ n: seen, label: 'seen', fg: DESK.success },
								{ n: noShows, label: 'no-show', fg: DESK.warning },
								{ n: openVMs.length, label: 'to go', fg: DESK.primary },
							].map((stat) => (
								<Box
									key={stat.label}
									sx={{
										flex: 1,
										p: '12px 14px',
										borderRadius: '12px',
										bgcolor: DESK.raised,
										border: `1px solid ${DESK.line}`,
										display: 'flex',
										alignItems: 'baseline',
										gap: '8px',
									}}
								>
									<Box component="b" sx={{ fontSize: 22, color: stat.fg }}>
										{stat.n}
									</Box>
									<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
										{stat.label}
									</Box>
								</Box>
							))}
						</Box>
					) : null}

					<Box
						sx={{
							flexGrow: 1,
							minHeight: 0,
							overflowY: 'auto',
							display: 'flex',
							flexDirection: 'column',
							gap: '8px',
							p: '2px 4px 20px 2px',
						}}
					>
						{loadingDay ? (
							[1, 2, 3, 4].map((i) => (
								<AppSkeleton key={i} height={64} sx={{ borderRadius: '12px', flexShrink: 0 }} />
							))
						) : dayFailed ? (
							<Box sx={dashedCard}>
								<Box component="b" sx={{ fontSize: 15 }}>
									Couldn’t load this day
								</Box>
								<Box component="span" sx={{ fontSize: 13, color: DESK.muted, mb: '6px' }}>
									{data.dayError}
								</Box>
								<DeskButton
									label="Retry"
									kind="secondary"
									size="md"
									fullWidth={false}
									onClick={data.refresh}
								/>
							</Box>
						) : (
							<>
								{openVMs.length > 0 ? (
									<>
										<Box
											component="span"
											sx={{
												pt: '4px',
												fontSize: 11,
												fontWeight: 800,
												letterSpacing: '0.06em',
												color: DESK.muted,
											}}
										>
											{isToday ? 'UP NEXT' : 'APPOINTMENTS'} · {openVMs.length}
										</Box>
										{openVMs.map((vm) => (
											<ScheduleRow
												key={vm.id}
												vm={vm}
												actions={actions}
												highlighted={vm.id === highlightId}
											/>
										))}
									</>
								) : null}
								{finishedVMs.length > 0 ? (
									<>
										<SectionLabel
											label={`${isToday ? 'EARLIER TODAY' : 'FINISHED'} · ${finishedVMs.length}`}
											onToggle={() => setFinishedOpen((open) => !open)}
											expanded={finishedShown}
										/>
										{finishedShown
											? finishedVMs.map((vm) => (
													<ScheduleRow
														key={vm.id}
														vm={vm}
														actions={actions}
														highlighted={vm.id === highlightId}
													/>
												))
											: null}
									</>
								) : null}
								{shownVMs.length === 0 ? (
									<Box sx={dashedCard}>
										<Box component="b" sx={{ fontSize: 15 }}>
											No appointments
										</Box>
										<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
											{scope === 'all'
												? 'Nothing booked for this day yet.'
												: `Nothing booked at ${scopeName} on this day.`}
										</Box>
									</Box>
								) : null}
							</>
						)}
					</Box>
				</Box>

				{/* Right: booking requests */}
				<Box
					component="aside"
					sx={{
						width: 340,
						flexShrink: 0,
						minHeight: 0,
						bgcolor: DESK.raised,
						border: `1px solid ${DESK.line}`,
						borderRadius: '16px',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Box
						sx={{
							p: '16px 16px 12px',
							borderBottom: `1px solid ${DESK.lineSoft}`,
							display: 'flex',
							flexDirection: 'column',
							gap: '10px',
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<Box component="b" sx={{ flexGrow: 1, fontSize: 16 }}>
								Booking requests
							</Box>
							<StatusPill
								label={`${data.requests.length} waiting`}
								tone={data.requests.length > 0 || data.requestsFailed ? 'wait' : 'ok'}
							/>
						</Box>
						<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
							Answer within 6 hours. Unanswered requests are offered to other doctors.
						</Box>
						<AutoConfirmSwitch
							enabled={autoOn}
							busy={autoBusy}
							onChange={(on) => void toggleAutoConfirm(on)}
						/>
					</Box>
					<Box
						sx={{
							flexGrow: 1,
							minHeight: 0,
							overflowY: 'auto',
							p: '12px',
							display: 'flex',
							flexDirection: 'column',
							gap: '10px',
						}}
					>
						{data.requestsLoading ? (
							[1, 2].map((i) => (
								<AppSkeleton key={i} height={180} sx={{ borderRadius: '14px', flexShrink: 0 }} />
							))
						) : (
							<>
								{data.requests.map((apt) => (
									<RequestCard key={apt.id} appt={apt} actions={actions} />
								))}
								{data.requestsFailed ? (
									<Box
										sx={{
											p: '16px 12px',
											textAlign: 'center',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: '8px',
										}}
									>
										<Box component="b" sx={{ fontSize: 14 }}>
											Couldn’t load the requests
										</Box>
										<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
											What is listed may be out of date.
										</Box>
										<DeskButton
											label="Retry"
											kind="secondary"
											size="md"
											fullWidth={false}
											onClick={data.refresh}
										/>
									</Box>
								) : data.requests.length === 0 ? (
									<Box
										sx={{
											p: '30px 12px',
											textAlign: 'center',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: '8px',
										}}
									>
										<Box
											component="span"
											sx={{
												width: 44,
												height: 44,
												borderRadius: '9999px',
												bgcolor: DESK.successSoft,
												color: DESK.success,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<DeskIcon d={DESK_ICONS.check} size={20} strokeWidth={2.6} />
										</Box>
										<Box component="b" sx={{ fontSize: 14 }}>
											All caught up
										</Box>
										<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
											New requests show up here.
										</Box>
									</Box>
								) : null}
							</>
						)}
					</Box>
				</Box>
			</Box>
			{actions.dialogs}
		</Box>
	)
}
