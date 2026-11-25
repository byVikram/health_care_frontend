// src/features/nursing/NursingOrderPage.tsx
//
// A nursing booking, kept live (the native app's Booking details + Track visit screens in one page, in the Lab order page's layout):
//   - the status strip, decided by the server;
//   - a Book now order: the nurse (name, rating, experience, call), the start code to read out at the door, the completion code, the ETA;
//   - a Later order: one card per visit with its day, time, who comes and what can still be done (Reschedule, cancel visits), and the
//     code of the visit that is on (View visit);
//   - cancelling (a request that is still searching or one nurse-less order with a reason, or chosen visits of a scheduled order), Book again,
//     and a rating once a visit is completed.
// What can be done comes from the server (`can_cancel` / `can_reschedule` on each visit, `visit_edits` on the order): the page only shows it.
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import DeskDialog from '../../components/common/Modal/DeskDialog'
import ReasonDialog from '../../components/common/Modal/ReasonDialog'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import FactList from '../../components/common/FactList/FactList'
import StatusPill from '../../components/common/StatusPill/StatusPill'
import { ROUTES } from '../../constants/routes'
import { DESK, DESK_ICONS, type DeskTone } from '../../styles/deskTokens'
import PatientPageShell from '../../components/layout/PatientPageShell'
import { commaDate, dayNum, dowShort, inr, monShort, plural } from '../booking/bookingFormat'
import { BOOKING_CARD } from '../booking/bookingStyles'
import NursingStatusStrip from './components/NursingStatusStrip'
import { NursingCancelVisitsDialog, NursingRescheduleDialog } from './components/NursingVisitDialogs'
import { nursingBooking } from './nursingBookingStore'
import { SEARCH_CANCEL_REASONS } from './nursingConstants'
import { restoreCartFromOrder } from './nursingRebook'
import {
	cancelOrder,
	cancelVisits,
	fetchReview,
	isScheduled,
	nursingErrorMessage,
	rescheduleVisit,
	submitReview,
	tipOf,
	totalWithTipOf,
	type NursingReview,
	type OrderVisit,
} from './nursingService'
import { dayLabel, rangeLabel } from './nursingTime'
import {
	assignLine,
	currentVisitOf,
	fallbackTimeline,
	isCancelledStatus,
	isDoneStatus,
	isMissedStatus,
	isOpenVisit,
	nextVisitId,
	orderPolicyOf,
	visitChip,
} from './nursingVisit'
import { useNursingOrder } from './useNursingOrder'
import { carePath } from './careServices'
import { useCareService } from './useCareService'

const statusLabels = (noun: string): Record<string, [string, DeskTone]> => {
	const N = noun.charAt(0).toUpperCase() + noun.slice(1)
	return {
		SEARCHING: [`Finding a ${noun}`, 'wait'],
		REQUESTED: [`Finding a ${noun}`, 'wait'],
		SCHEDULED_PENDING: ['Booked', 'ok'],
		SCHEDULED_CONFIRMED: ['Confirmed', 'ok'],
		ASSIGNED: [`${N} assigned`, 'ok'],
		NURSE_ASSIGNED: [`${N} assigned`, 'ok'],
		EN_ROUTE: [`${N} on the way`, 'move'],
		ARRIVED: [`${N} arrived`, 'move'],
		IN_PROGRESS: ['In progress', 'move'],
		VERIFICATION_PENDING: ['In progress', 'move'],
		COMPLETED: ['Completed', 'done'],
		NO_SHOW: ['Visit missed', 'bad'],
		UNASSIGNED: [`No ${noun} available`, 'bad'],
		EXPIRED: ['Expired', 'bad'],
		FAILED: ['Failed', 'bad'],
	}
}

const statusOf = (status: string, noun: string): [string, DeskTone] =>
	/CANCEL/.test(status) ? ['Cancelled', 'bad'] : (statusLabels(noun)[status] ?? [status.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase()), 'quiet'])

const refOf = (id: string) => id

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
	return (
		<Box role="radiogroup" aria-label="Rating" sx={{ display: 'flex', gap: '6px' }}>
			{[1, 2, 3, 4, 5].map((n) => (
				<Box
					key={n}
					component="button"
					type="button"
					role="radio"
					aria-checked={value === n}
					aria-label={`${n} star${n === 1 ? '' : 's'}`}
					disabled={!onChange}
					onClick={() => onChange?.(n)}
					sx={{ border: 0, p: 0, bgcolor: 'transparent', fontSize: 30, lineHeight: 1, color: n <= value ? '#F5A623' : '#D5DCDD', cursor: onChange ? 'pointer' : 'default' }}
				>
					★
				</Box>
			))}
		</Box>
	)
}

export default function NursingOrderPage() {
	const { requestId } = useParams()
	const [search] = useSearchParams()
	const navigate = useNavigate()
	const care = useCareService()
	const { order, loading, error, reconnecting, reload } = useNursingOrder(requestId, { live: true, pollMs: 5000, pollWithSocketMs: 10000 })

	const [focusId, setFocusId] = useState<string | null>(search.get('visit'))
	const [cancelVisitsOpen, setCancelVisitsOpen] = useState(false)
	const [cancelAllOpen, setCancelAllOpen] = useState(false)
	const [moving, setMoving] = useState<OrderVisit | null>(null)
	const [busy, setBusy] = useState(false)
	const [review, setReview] = useState<NursingReview | null>(null)
	const [rateOpen, setRateOpen] = useState(false)
	const [rating, setRating] = useState(0)
	const [comment, setComment] = useState('')

	const status = String(order?.status ?? '').toUpperCase()
	const scheduled = isScheduled(order)
	const visits = order?.visits ?? []
	const focused = currentVisitOf(visits, focusId)
	const completed = visits.some((v) => isDoneStatus(v.status)) || status === 'COMPLETED'
	const policy = orderPolicyOf(order)

	// The rating of a completed visit, if the patient already gave one.
	useEffect(() => {
		if (!requestId || !completed) return
		let alive = true
		void (async () => {
			const r = await fetchReview(requestId)
			if (alive) setReview(r)
		})()
		return () => {
			alive = false
		}
	}, [requestId, completed])

	if (loading && !order) {
		return (
			<PatientPageShell>
				<AppSkeleton height={120} sx={{ borderRadius: '18px' }} />
				<AppSkeleton height={260} sx={{ borderRadius: '18px' }} />
			</PatientPageShell>
		)
	}

	if (!order) {
		return (
			<PatientPageShell maxWidth={720}>
				<Box sx={{ ...BOOKING_CARD, p: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
					<Box component="b" sx={{ fontSize: 20 }}>
						We could not find this booking
					</Box>
					<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
						{error ?? 'It may have been removed.'}
					</Box>
					<Box sx={{ mt: '6px', width: 220 }}>
						<DeskButton label="Back to my bookings" kind="primary" onClick={() => navigate(`${ROUTES.BOOKINGS}?category=ancillary`)} />
					</Box>
				</Box>
			</PatientPageShell>
		)
	}

	const serviceName = order.package?.name ?? order.serviceName ?? (order.services?.map((s) => s.name).join(', ') || care.sentence)
	const [statusLabel, statusTone] = statusOf(status, care.noun)
	const timeline = (focused?.timeline ?? order.timeline ?? fallbackTimeline(status)) as NonNullable<typeof order.timeline>
	const next = nextVisitId(visits)
	const openVisits = visits.filter(isOpenVisit)
	const legacy = order.visit_edits === false
	const provider = order.assignedProvider ?? null
	const startCode = focused?.start_code ?? order.verificationOtp ?? null
	const completionCode = focused?.completion_code ?? order.completionPin ?? null
	const cancelled = /CANCEL|EXPIRED|FAILED/.test(status)
	// nothing more can happen: cancelled / expired, or (scheduled) every visit is done, cancelled, missed or without a nurse
	const ended = cancelled || (scheduled && visits.length > 0 && openVisits.length === 0)
	const patientName = order.patient?.name ?? order.patientName ?? ''
	const patientRelation = order.patient?.relation ?? order.patientRelationship ?? ''
	const addressText = order.address?.street_address ?? ''
	const tip = tipOf(order)
	const totalWithTip = totalWithTipOf(order)
	const total = order.totals?.total ?? order.totalAmount ?? 0

	// ---- actions --------------------------------------------------------------------------------------------

	const run = async (action: () => Promise<void>, done: string) => {
		setBusy(true)
		try {
			await action()
			toast.success(done)
			// the action worked: a refresh that fails (a short network drop) must not look like the action failing
			void reload().catch(() => undefined)
			return true
		} catch (e) {
			toast.error(nursingErrorMessage(e))
			// the server may have refused because something changed: show what is true now
			void reload().catch(() => undefined)
			return false
		} finally {
			setBusy(false)
		}
	}

	const handleCancelVisits = async (ids: string[], reason: string) => {
		if (await run(() => cancelVisits(order.request_public_id, ids, reason), ids.length > 1 ? 'Visits cancelled' : 'Visit cancelled')) setCancelVisitsOpen(false)
	}
	const handleCancelAll = async (reason: string) => {
		if (await run(() => cancelOrder(order.request_public_id, reason), 'Your booking was cancelled')) setCancelAllOpen(false)
	}
	const handleMove = async (date: string, time: string) => {
		if (!moving) return
		if (await run(() => rescheduleVisit(order.request_public_id, moving.visit_public_id, date, time), 'Visit moved')) setMoving(null)
	}

	const bookAgain = async () => {
		setBusy(true)
		try {
			const { ok, missing } = await restoreCartFromOrder(order, care.key)
			if (!ok) toast.info('Those services are not available now. Pick again.')
			else {
				nursingBooking.set({ mode: 'later' })
				if (missing > 0) toast.info(`${missing === 1 ? 'One service is' : `${missing} services are`} not available now, so it was left out.`)
			}
			navigate(ok ? carePath(care.key, 'schedule') : carePath(care.key, 'home'))
		} catch (e) {
			toast.error(nursingErrorMessage(e, 'We could not load the services. Please try again.'))
		} finally {
			setBusy(false)
		}
	}

	const sendRating = async () => {
		if (!rating) return
		setBusy(true)
		try {
			await submitReview(order.request_public_id, rating, comment)
			setReview({ id: 'new', rating, comment })
			setRateOpen(false)
			toast.success('Thanks for your feedback')
		} catch (e) {
			toast.error(nursingErrorMessage(e, 'We could not save your rating.'))
		} finally {
			setBusy(false)
		}
	}

	const canCancelInstant = !scheduled && !ended && !completed && !/IN_PROGRESS|ARRIVED|VERIFICATION|NO_SHOW/.test(status)
	const canCancelVisits = scheduled && !legacy && openVisits.some((v) => v.can_cancel !== false)
	const canCancelLegacy = scheduled && legacy && !ended && !completed
	const noNurse = visits.some((v) => v.status === 'UNASSIGNED') || ended

	const facts = [
		{ label: 'Booking ID', value: refOf(order.request_public_id) },
		...(patientName ? [{ label: 'For', value: patientRelation && !/self/i.test(patientRelation) ? `${patientName} · ${patientRelation}` : patientName }] : []),
		...(addressText ? [{ label: 'Address', value: order.address?.label ? `${order.address.label} · ${addressText}` : addressText }] : []),
		...(order.note ? [{ label: 'Note', value: order.note }] : []),
	]

	return (
		<PatientPageShell>
			{reconnecting ? (
				<Box role="status" sx={{ p: '10px 14px', borderRadius: '12px', bgcolor: DESK.warningSoft, color: DESK.warning, fontSize: 13, fontWeight: 600 }}>
					Reconnecting… we are having trouble reaching the server and will keep trying.
				</Box>
			) : null}
			<Box component={Link} to={`${ROUTES.BOOKINGS}?category=ancillary`} sx={{ width: 220, fontSize: 14, fontWeight: 800, textDecoration: 'none', color: DESK.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
				<DeskIcon d={DESK_ICONS.chevronLeft} size={16} strokeWidth={2.4} />
				My bookings
			</Box>

			<Box sx={{ ...BOOKING_CARD, p: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
				<Box component="span" sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: DESK.primarySoft, color: DESK.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
					<DeskIcon d={DESK_ICONS.homeCare} size={26} />
				</Box>
				<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
					<Box component="span" sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary }}>
						{care.title.toUpperCase()} · {scheduled ? 'SCHEDULED' : 'INSTANT'}
					</Box>
					<Box component="h1" sx={{ m: 0, fontSize: 22, lineHeight: '28px', fontWeight: 800 }}>
						{serviceName}
					</Box>
					<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
						{refOf(order.request_public_id)}
						{scheduled ? ` · ${plural(visits.length, 'visit', 'visits')}` : ''}
					</Box>
				</Box>
				<StatusPill label={statusLabel} tone={statusTone} />
			</Box>

			<NursingStatusStrip timeline={timeline} />

			{/* a grid: the first card on the left and the booking details share the first row, so they are the same height; the other cards go below on the left */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 380px' }, columnGap: '24px', rowGap: '18px', alignItems: 'stretch' }}>
				<Box sx={{ display: 'contents', '& > *': { gridColumn: 1, minWidth: 0 }, '& > :first-child': { gridRow: { lg: 1 } } }}>
					{/* Book now: the provider and the codes */}
					{!scheduled && provider ? (
						<Box sx={{ ...BOOKING_CARD, p: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
							<Box component="b" sx={{ fontSize: 18 }}>
								Your {care.noun}
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
								<Box
									component="span"
									sx={{ width: 56, height: 56, borderRadius: '9999px', bgcolor: DESK.primarySoft, color: DESK.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, overflow: 'hidden', flexShrink: 0 }}
								>
									{provider.avatar ? <Box component="img" src={provider.avatar} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : provider.name.slice(0, 1)}
								</Box>
								<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
									<Box component="b" sx={{ fontSize: 17 }}>
										{provider.name}
									</Box>
									<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
										{[provider.qualifications || provider.specialization || provider.role, provider.experienceYears ? `${provider.experienceYears} yrs experience` : '', provider.rating ? `★ ${provider.rating}` : '', provider.totalVisits ? `${provider.totalVisits} visits` : ''].filter(Boolean).join(' · ')}
									</Box>
									{order.etaMinutes != null && /EN_ROUTE/.test(status) ? (
										<Box component="span" sx={{ fontSize: 13, color: DESK.primary, fontWeight: 800 }}>
											About {order.etaMinutes} min away
										</Box>
									) : null}
								</Box>
								{provider.phone ? (
									<Box sx={{ width: 150 }}>
										<DeskButton label={`Call ${care.noun}`} kind="secondary" icon={DESK_ICONS.phone} href={`tel:${provider.phone.replace(/[^+\d]/g, '')}`} />
									</Box>
								) : null}
							</Box>
							{startCode || completionCode ? (
								<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '12px' }}>
									{startCode && !completed ? (
										<Box sx={{ p: '14px', borderRadius: '14px', bgcolor: DESK.primaryTint, display: 'flex', flexDirection: 'column', gap: '4px' }}>
											<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
												Start code · read it to the {care.noun} when they arrive
											</Box>
											<Box component="b" sx={{ fontSize: 28, letterSpacing: '0.2em' }}>
												{startCode}
											</Box>
										</Box>
									) : null}
									{completionCode && /IN_PROGRESS|VERIFICATION|COMPLETED/.test(status) ? (
										<Box sx={{ p: '14px', borderRadius: '14px', bgcolor: DESK.warningSoft, display: 'flex', flexDirection: 'column', gap: '4px' }}>
											<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
												Completion code · share it once the visit is done
											</Box>
											<Box component="b" sx={{ fontSize: 28, letterSpacing: '0.2em' }}>
												{completionCode}
											</Box>
										</Box>
									) : null}
								</Box>
							) : null}
						</Box>
					) : null}

					{/* tasks of the visit that is on */}
					{focused?.tasks && focused.tasks.length > 0 ? (
						<Box sx={{ ...BOOKING_CARD, p: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<Box component="b" sx={{ fontSize: 16 }}>
								Care checklist
							</Box>
							{focused.tasks.map((t) => (
								<Box key={t.label} sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 14, color: t.done ? DESK.ink : DESK.muted }}>
									<Box component="span" sx={{ display: 'flex', color: t.done ? DESK.success : DESK.fainter }}>
										<DeskIcon d={DESK_ICONS.tick} size={15} strokeWidth={2.6} />
									</Box>
									{t.label}
								</Box>
							))}
						</Box>
					) : null}

					{/* Later: one card per visit */}
					{scheduled ? (
						<Box sx={{ ...BOOKING_CARD, p: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Box component="b" sx={{ fontSize: 18, flexGrow: 1 }}>
									{visits.length > 1 ? 'Your visits' : 'Your visit'}
								</Box>
								<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
									A {care.noun} is assigned {policy.assignLeadMinutes / 60 >= 1 ? `${policy.assignLeadMinutes / 60} hr` : `${policy.assignLeadMinutes} min`} before each visit
								</Box>
							</Box>
							{visits.map((v) => {
								const chip = visitChip(v, v.visit_public_id === next, care.noun)
								const isFocus = focused?.visit_public_id === v.visit_public_id
								const open = isOpenVisit(v)
								return (
									<Box
										key={v.visit_public_id}
										sx={{ border: `1.5px solid ${isFocus ? DESK.primary : DESK.cardLine}`, borderRadius: '14px', p: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', opacity: isCancelledStatus(v.status) ? 0.7 : 1 }}
									>
										<Box component="span" sx={{ width: 54, height: 58, borderRadius: '12px', bgcolor: DESK.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
											<Box component="span" sx={{ fontSize: 11, fontWeight: 700, color: DESK.muted }}>
												{dowShort(v.date)}
											</Box>
											<Box component="b" sx={{ fontSize: 20, lineHeight: '22px' }}>
												{dayNum(v.date)}
											</Box>
											<Box component="span" sx={{ fontSize: 10, color: DESK.muted }}>
												{monShort(v.date)}
											</Box>
										</Box>
										<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
												<Box component="b" sx={{ fontSize: 15 }}>
													{rangeLabel(v.start_time, v.end_time)}
												</Box>
												<StatusPill label={chip.label} bg={chip.bg} fg={chip.fg} />
											</Box>
											<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
												{assignLine(v, policy.assignLeadMinutes, care.noun)}
											</Box>
										</Box>
										<Box sx={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
											{open && v.can_reschedule && !legacy ? (
												<Box sx={{ width: 120 }}>
													<DeskButton label="Reschedule" kind="secondary" size="md" onClick={() => setMoving(v)} />
												</Box>
											) : null}
											<Box sx={{ width: 110 }}>
												<DeskButton label={isFocus ? 'Viewing' : 'View visit'} kind="secondary" size="md" disabled={isFocus} onClick={() => setFocusId(v.visit_public_id)} />
											</Box>
										</Box>
									</Box>
								)
							})}
							{/* the code of the visit that is on */}
							{focused && (focused.start_code || focused.completion_code) && focused.provider ? (
								<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '12px', mt: '4px' }}>
									{focused.start_code && !isDoneStatus(focused.status) ? (
										<Box sx={{ p: '14px', borderRadius: '14px', bgcolor: DESK.primaryTint, display: 'flex', flexDirection: 'column', gap: '4px' }}>
											<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
												Start code · {focused.provider.name}
											</Box>
											<Box component="b" sx={{ fontSize: 26, letterSpacing: '0.2em' }}>
												{focused.start_code}
											</Box>
										</Box>
									) : null}
									{focused.completion_code && /IN_PROGRESS|VERIFICATION|COMPLETED/.test(focused.status) ? (
										<Box sx={{ p: '14px', borderRadius: '14px', bgcolor: DESK.warningSoft, display: 'flex', flexDirection: 'column', gap: '4px' }}>
											<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
												Completion code
											</Box>
											<Box component="b" sx={{ fontSize: 26, letterSpacing: '0.2em' }}>
												{focused.completion_code}
											</Box>
										</Box>
									) : null}
								</Box>
							) : null}
							{focused?.provider?.phone && !isDoneStatus(focused.status) && !isCancelledStatus(focused.status) ? (
								<Box sx={{ width: 180 }}>
									<DeskButton label={`Call ${focused.provider.name.split(' ')[0]}`} kind="secondary" size="md" icon={DESK_ICONS.phone} href={`tel:${focused.provider.phone.replace(/[^+\d]/g, '')}`} />
								</Box>
							) : null}
						</Box>
					) : null}

					{visits.some((v) => isMissedStatus(v.status)) || status === 'NO_SHOW' ? (
						<Box role="status" sx={{ p: '14px 16px', borderRadius: '14px', bgcolor: DESK.dangerSoft, color: DESK.danger, fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>
							The {care.noun} reached your address but could not meet you, so this visit was marked missed. Nothing is charged. Please keep the phone you booked with nearby for your next visit.
						</Box>
					) : null}
				</Box>

				<Box component="aside" sx={{ ...BOOKING_CARD, gridColumn: { xs: 1, lg: 2 }, gridRow: { lg: 1 }, width: { xs: '100%', lg: 380 }, flexShrink: 0, p: '22px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px' }}>
					<Box component="b" sx={{ fontSize: 18 }}>
						Booking details
					</Box>
					<FactList facts={facts} />
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 14 }}>
						{scheduled && order.totals ? (
							<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.muted }}>
								<span>
									{inr(order.totals.per_visit)} × {plural(order.totals.visits_count, 'visit', 'visits')}
								</span>
								<span>{inr(order.totals.total)}</span>
							</Box>
						) : null}
						{tip > 0 ? (
							<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.muted }}>
								<span>Tip for the {care.noun}</span>
								<span>{inr(tip)}</span>
							</Box>
						) : null}
						<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', pt: '10px', borderTop: `1px dashed ${DESK.lineStrong}`, fontSize: 17 }}>
							<b>{scheduled && visits.length > 1 ? 'To pay after the visits' : 'To pay after the visit'}</b>
							<b>{inr(totalWithTip > 0 ? totalWithTip : total + tip)}</b>
						</Box>
						<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
							Nothing is charged until after the visit{cancelled ? '. This booking is cancelled, so you will not be charged.' : '.'}
						</Box>
					</Box>

					{completed && !review ? <DeskButton label={`Rate your ${care.noun}`} kind="primary" onClick={() => setRateOpen(true)} /> : null}
					{review ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
							<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
								Your rating
							</Box>
							<Stars value={review.rating} />
							{review.comment ? (
								<Box component="span" sx={{ fontSize: 13, color: DESK.inkSoft }}>
									{review.comment}
								</Box>
							) : null}
						</Box>
					) : null}
					{noNurse || completed || ended ? <DeskButton label="Book again" kind="secondary" loading={busy} onClick={() => void bookAgain()} /> : null}
					{scheduled && openVisits.length > 0 && !legacy ? (
						<Box component="span" sx={{ fontSize: 12, color: DESK.muted, lineHeight: '17px' }}>
							Free cancellation up to {policy.cancelCutoffMinutes / 60} hrs before each visit. A visit can be moved until a {care.noun} is assigned.
						</Box>
					) : null}
					{/* a Book now order has no day or time yet: only a dated visit is shown here */}
					{focused?.date && focused.start_time ? (
						<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
							Showing {dayLabel(focused.date)} · {rangeLabel(focused.start_time, focused.end_time)}
							{order.created_at ?? order.createdAt ? ` · booked ${commaDate(String(order.created_at ?? order.createdAt).slice(0, 10))}` : ''}
						</Box>
					) : null}
				</Box>
			</Box>

			{canCancelInstant || canCancelLegacy || canCancelVisits ? (
				<Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
					{canCancelInstant || canCancelLegacy ? (
						<Box sx={{ width: 'min(480px, 100%)', '& > button': { width: '100%', height: 54, fontSize: 16, borderRadius: '12px' } }}>
							<DeskButton label="Cancel booking" kind="danger" onClick={() => setCancelAllOpen(true)} />
						</Box>
					) : null}
					{canCancelVisits ? (
						<Box sx={{ width: 'min(480px, 100%)', '& > button': { width: '100%', height: 54, fontSize: 16, borderRadius: '12px' } }}>
							<DeskButton label="Cancel visits" kind="danger" onClick={() => setCancelVisitsOpen(true)} />
						</Box>
					) : null}
				</Box>
			) : null}

			{cancelVisitsOpen ? <NursingCancelVisitsDialog open visits={visits} policy={policy} busy={busy} onClose={() => setCancelVisitsOpen(false)} onConfirm={(ids, reason) => void handleCancelVisits(ids, reason)} /> : null}
			{moving ? <NursingRescheduleDialog open visit={moving} visits={visits} policy={policy} busy={busy} onClose={() => setMoving(null)} onConfirm={(date, time) => void handleMove(date, time)} /> : null}
			<ReasonDialog
				open={cancelAllOpen}
				title="Cancel this booking?"
				sub="Nothing is charged."
				reasons={SEARCH_CANCEL_REASONS}
				reasonLabel="Why are you cancelling?"
				okLabel="Cancel booking"
				cancelLabel="Keep booking"
				danger
				busy={busy}
				onClose={() => setCancelAllOpen(false)}
				onConfirm={(reason) => void handleCancelAll(reason)}
			/>
			<DeskDialog open={rateOpen} title={`Rate your ${care.noun}`} sub="Your feedback helps other patients." okLabel="Submit" busy={busy} okDisabled={!rating} onClose={() => setRateOpen(false)} onOk={() => void sendRating()}>
				<Stars value={rating} onChange={setRating} />
				<Box
					component="textarea"
					value={comment}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value.slice(0, 1000))}
					placeholder="Tell us about the visit (optional)"
					rows={3}
					aria-label="Comment"
					sx={{ width: '100%', boxSizing: 'border-box', p: '12px 14px', border: `1.5px solid ${DESK.lineStrong}`, borderRadius: '12px', fontFamily: 'inherit', fontSize: 14, resize: 'vertical', outline: 0, '&:focus': { borderColor: DESK.primary } }}
				/>
			</DeskDialog>
		</PatientPageShell>
	)
}
