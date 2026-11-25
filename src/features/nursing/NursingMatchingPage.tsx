// src/features/nursing/NursingMatchingPage.tsx
//
// "Finding a nurse near you" (Book now), the native app's ServiceMatchingPage: a dark hero with a searching ring and the time since the nurses were
// last asked, the request summary, the TIP card (+₹20 / +₹30 / +₹50 or another amount, up to ₹100 in all, raise-only; a raise asks the nurses again,
// those who declined too), and what happens next. When a nurse accepts (socket push or the status poll) the page moves to the order page, which
// then tracks the visit. If nobody accepts in 5 minutes it says nothing is charged and offers Search again or Schedule instead; the patient can
// cancel the request with a reason at any time.
import { Box, CircularProgress } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import ReasonDialog from '../../components/common/Modal/ReasonDialog'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import PatientPageShell from '../../components/layout/PatientPageShell'
import { inr } from '../booking/bookingFormat'
import { BOOKING_CARD } from '../booking/bookingStyles'
import { NO_ACCEPT_SECONDS, POPULAR_TIP, SEARCH_CANCEL_REASONS, TIP_MAX, TIP_OPTIONS } from './nursingConstants'
import { nursingBooking } from './nursingBookingStore'
import { restoreCartFromOrder } from './nursingRebook'
import {
	ASSIGNED_STATUSES,
	NO_MATCH_PATTERN,
	cancelOrder,
	nursingErrorCode,
	nursingErrorMessage,
	searchAgain,
	setTip,
	tipOf,
	totalWithTipOf,
} from './nursingService'
import { useNursingOrder } from './useNursingOrder'
import { carePath } from './careServices'
import { useCareService } from './useCareService'

const elapsedLabel = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function NursingMatchingPage() {
	const { requestId } = useParams()
	const navigate = useNavigate()
	const care = useCareService()
	const { order, loading, error, reconnecting, heardAt } = useNursingOrder(requestId, { live: true, pollMs: 2000, pollWithSocketMs: 6000, stopWhenDone: false })

	const [now, setNow] = useState(() => Date.now())
	const [mountMs] = useState(() => Date.now())
	const [clock, setClock] = useState<{ searching: number; sinceLast: number; at: number } | null>(null)
	const roundResetAt = useRef(0)
	const [tip, setTipState] = useState(0)
	const [pendingTip, setPendingTip] = useState(0)
	const [customOpen, setCustomOpen] = useState(false)
	const [customText, setCustomText] = useState('')
	const [tipBusy, setTipBusy] = useState(false)
	const [searchingAgain, setSearchingAgain] = useState(false)
	const [cancelOpen, setCancelOpen] = useState(false)
	const [busy, setBusy] = useState(false)
	const navigated = useRef(false)

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000)
		return () => clearInterval(id)
	}, [])

	// What the server says about the waiting time (searching_seconds since the request was made; since_last_search_seconds since the nurses were
	// last asked), and when this page heard it: the page counts on from there, so the time is right after a reload.
	useEffect(() => {
		if (!order || heardAt < roundResetAt.current) return
		const searching = order.searching_seconds
		const sinceLast = order.since_last_search_seconds
		if (typeof searching === 'number' && typeof sinceLast === 'number') setClock({ searching, sinceLast, at: heardAt })
		setTipState(tipOf(order))
	}, [order, heardAt])

	const status = String(order?.status ?? '').toUpperCase()
	const assigned = ASSIGNED_STATUSES.has(status)
	const endedByServer = NO_MATCH_PATTERN.test(status) || /CANCELLED/.test(status)

	// A nurse accepted: the order page tracks the visit from here.
	useEffect(() => {
		if (!assigned || !requestId || navigated.current) return
		navigated.current = true
		const id = setTimeout(() => navigate(carePath(care.key, 'order', requestId), { replace: true }), 400)
		return () => clearTimeout(id)
	}, [assigned, requestId, navigate, care.key])

	const STEPS = [
		[`Nearby ${care.nouns} are asked`, `The first ${care.noun} to accept comes to you.`],
		[`A ${care.noun} accepts`, 'You see their name, rating and start code.'],
		['Track the visit', 'See when they are on the way and arrive.'],
	]

	if (!requestId) return <Navigate to={carePath(care.key, 'home')} replace />

	const sinceHeard = clock ? Math.max(0, Math.floor((now - clock.at) / 1000)) : 0
	const searchingSeconds = clock ? clock.searching + sinceHeard : Math.max(0, Math.floor((now - mountMs) / 1000))
	const waited = clock ? clock.sinceLast + sinceHeard : searchingSeconds
	const noOneAccepted = !assigned && (endedByServer || waited >= NO_ACCEPT_SECONDS)
	const canSearchAgain = !endedByServer && !assigned

	// The nurses were just asked: a new round starts now, the waiting time carries on.
	const startNewRound = () => {
		roundResetAt.current = Date.now()
		setClock({ searching: searchingSeconds, sinceLast: 0, at: Date.now() })
	}

	const serviceName = order?.package?.name ?? order?.serviceName ?? order?.services?.map((s) => s.name).join(', ') ?? care.sentence
	const patientName = order?.patientName ?? order?.patient?.name ?? 'You'
	const addressText = order?.address?.street_address ?? ''
	const baseTotal = order?.totalAmount ?? order?.totals?.total ?? null
	const serverTotal = totalWithTipOf(order)

	const handleSearchAgain = async () => {
		if (searchingAgain || !canSearchAgain) return
		setSearchingAgain(true)
		try {
			const res = await searchAgain(requestId)
			if (res.notified > 0) {
				startNewRound()
				toast.success(res.message || `Asked nearby ${care.nouns} again`)
			} else {
				toast.info(res.message || `No ${care.nouns} are available near you right now`)
			}
		} catch (e) {
			const code = nursingErrorCode(e)
			if (code === 'ALREADY_ASSIGNED') toast.info(`A ${care.noun} has just accepted`)
			else toast.error(nursingErrorMessage(e, "Couldn't search again"))
		} finally {
			setSearchingAgain(false)
		}
	}

	const confirmTip = async () => {
		if (!pendingTip || tipBusy) return
		setTipBusy(true)
		try {
			await setTip(requestId, pendingTip)
			setTipState(pendingTip)
			setPendingTip(0)
			setCustomOpen(false)
			setCustomText('')
			// the nurses are asked again with the tip (also the ones who declined): a new 5 minutes
			startNewRound()
		} catch (e) {
			toast.error(nursingErrorMessage(e, `Couldn't add the tip. It may be too late: a ${care.noun} may have accepted already.`))
		} finally {
			setTipBusy(false)
		}
	}

	const pickTip = (add: number) => setPendingTip(add > 0 && tip + add <= TIP_MAX ? tip + add : 0)

	const handleCancel = async (reason: string) => {
		setBusy(true)
		try {
			await cancelOrder(requestId, reason)
			setCancelOpen(false)
			toast.success('Your request was cancelled')
			navigate(carePath(care.key, 'home'), { replace: true })
		} catch (e) {
			toast.error(nursingErrorMessage(e, 'Could not cancel the request. Please try again.'))
		} finally {
			setBusy(false)
		}
	}

	// Stop the instant request (best effort), then go to the scheduling step with the same services.
	const handleScheduleInstead = async () => {
		if (!order) return
		setBusy(true)
		try {
			if (!endedByServer) await cancelOrder(requestId, 'Scheduling instead')
		} catch {
			// already closed on the server, or it will expire on its own: scheduling must not be blocked
		}
		try {
			const { ok, missing } = await restoreCartFromOrder(order, care.key)
			if (!ok) {
				toast.info('Please pick the services again.')
				navigate(carePath(care.key, 'home'), { replace: true })
				return
			}
			if (missing > 0) toast.info(`${missing === 1 ? 'One service is' : `${missing} services are`} not available now, so it was left out.`)
			nursingBooking.set({ mode: 'later' })
			navigate(carePath(care.key, 'schedule'), { replace: true })
		} catch {
			// the request is already stopped: the catalogue could not be read, so the patient picks the services again
			toast.info('We could not load the services. Please pick them again.')
			navigate(carePath(care.key, 'home'), { replace: true })
		} finally {
			setBusy(false)
		}
	}

	const canRaise = tip < TIP_MAX
	const customValue = Number(customText) || 0
	const customTooHigh = customValue + tip > TIP_MAX

	return (
		<PatientPageShell maxWidth={900}>
			{reconnecting ? (
				<Box role="status" sx={{ p: '10px 14px', borderRadius: '12px', bgcolor: DESK.warningSoft, color: DESK.warning, fontSize: 13, fontWeight: 600 }}>
					Reconnecting… we are having trouble reaching the server and will keep trying.
				</Box>
			) : null}
			<Box
				component="section"
				sx={{
					borderRadius: '18px',
					overflow: 'hidden',
					color: '#FFFFFF',
					p: '32px 24px',
					textAlign: 'center',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '10px',
					bgcolor: DESK.primary,
				}}
			>
				<Box component="span" sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: DESK.mint }}>
					INSTANT BOOKING
				</Box>
				{assigned ? (
					<Box component="span" sx={{ display: 'flex', width: 64, height: 64, borderRadius: '9999px', bgcolor: DESK.success, alignItems: 'center', justifyContent: 'center' }}>
						<DeskIcon d={DESK_ICONS.check} size={30} strokeWidth={3} />
					</Box>
				) : (
					<Box sx={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						{noOneAccepted ? (
							<Box component="span" sx={{ display: 'flex', color: DESK.mint }}>
								<DeskIcon d={DESK_ICONS.clock} size={40} />
							</Box>
						) : (
							<>
								<CircularProgress size={64} thickness={2.4} sx={{ color: DESK.mint, position: 'absolute' }} />
								<Box component="span" sx={{ display: 'flex' }}>
									<DeskIcon d={DESK_ICONS.homeCare} size={28} />
								</Box>
							</>
						)}
					</Box>
				)}
				<Box component="h1" sx={{ m: 0, fontSize: 28, lineHeight: '34px', fontWeight: 800 }}>
					{assigned ? `A ${care.noun} is on the way` : noOneAccepted ? `No ${care.noun} has accepted yet` : `Finding a ${care.noun} near you`}
				</Box>
				<Box component="span" sx={{ fontSize: 15, color: DESK.mintText, maxWidth: 520 }}>
					{assigned
						? 'Opening your visit…'
						: noOneAccepted
							? endedByServer
								? `No ${care.noun} was available this time. Nothing is charged.`
								: 'Nothing is charged. You can search again or schedule a visit instead.'
							: `Searching ${elapsedLabel(Math.floor(waited))}${order?.asked_count ? ` · ${order.asked_count} nearby ${care.nouns} asked` : ''}`}
				</Box>
			</Box>

			{error && !order && !loading ? (
				<Box role="alert" sx={{ ...BOOKING_CARD, p: '18px', color: DESK.danger, fontSize: 14 }}>
					{error}
				</Box>
			) : null}

			<Box sx={{ ...BOOKING_CARD, p: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<Box component="b" sx={{ fontSize: 16 }}>
					Your request
				</Box>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: '12px 56px', fontSize: 14 }}>
					<Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
						<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
							Service
						</Box>
						<b>{serviceName}</b>
					</Box>
					<Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
						<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
							For
						</Box>
						<b>{patientName}</b>
					</Box>
					<Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
						<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
							To pay after the visit
						</Box>
						<b>{serverTotal > 0 ? inr(serverTotal) : baseTotal != null ? inr(baseTotal + tip) : '—'}</b>
						{tip > 0 ? (
							<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
								includes {inr(tip)} tip
							</Box>
						) : null}
					</Box>
				</Box>
				{addressText ? (
					<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 13, color: DESK.muted }}>
						<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
							<DeskIcon d={DESK_ICONS.pin} size={16} />
						</Box>
						{addressText}
					</Box>
				) : null}
			</Box>

			{!assigned && !endedByServer ? (
				<Box sx={{ ...BOOKING_CARD, p: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
					<Box sx={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
						<Box component="b" sx={{ fontSize: 16, flexGrow: 1 }}>
							Add a tip to get matched faster
						</Box>
						{tip > 0 ? (
							<Box component="span" sx={{ fontSize: 13, color: DESK.success, fontWeight: 800 }}>
								Tip added: {inr(tip)}
							</Box>
						) : null}
					</Box>
					<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
						The whole tip goes to the {care.noun}. A higher tip asks the nearby {care.nouns} again, including the ones who declined. The tip can be {inr(TIP_MAX)} at most and cannot be lowered.
					</Box>
					{canRaise ? (
						<>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
								{TIP_OPTIONS.map((v) => {
									const tooHigh = tip + v > TIP_MAX
									const on = pendingTip === tip + v && !customOpen
									return (
										<Box
											key={v}
											component="button"
											type="button"
											disabled={tooHigh}
											aria-pressed={on}
											onClick={() => {
												setCustomOpen(false)
												pickTip(v)
											}}
											sx={{
												height: 44,
												px: '18px',
												borderRadius: '12px',
												border: `1.5px solid ${on ? DESK.primary : DESK.lineChoice}`,
												bgcolor: on ? DESK.primaryTint : DESK.raised,
												color: DESK.ink,
												fontFamily: 'inherit',
												fontSize: 14,
												fontWeight: 800,
												cursor: tooHigh ? 'not-allowed' : 'pointer',
												opacity: tooHigh ? 0.45 : 1,
											}}
										>
											+{inr(v)}
											{v === POPULAR_TIP ? (
												<Box component="span" sx={{ ml: '6px', fontSize: 11, color: DESK.sand }}>
													Popular
												</Box>
											) : null}
										</Box>
									)
								})}
								<Box
									component="button"
									type="button"
									aria-pressed={customOpen}
									onClick={() => {
										setCustomOpen(true)
										setPendingTip(0)
									}}
									sx={{ height: 44, px: '18px', borderRadius: '12px', border: `1.5px solid ${customOpen ? DESK.primary : DESK.lineChoice}`, bgcolor: customOpen ? DESK.primaryTint : DESK.raised, color: DESK.ink, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
								>
									Other amount
								</Box>
							</Box>
							{customOpen ? (
								<Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
									<Box
										component="input"
										type="text"
										inputMode="numeric"
										value={customText}
										placeholder="Extra amount in ₹"
										aria-label="Extra tip amount"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											const digits = e.target.value.replace(/\D/g, '').slice(0, 3)
											setCustomText(digits)
											const add = Number(digits) || 0
											setPendingTip(add > 0 && tip + add <= TIP_MAX ? tip + add : 0)
										}}
										sx={{ width: 180, height: 44, px: '14px', border: `1.5px solid ${DESK.lineStrong}`, borderRadius: '12px', fontFamily: 'inherit', fontSize: 14, outline: 0, '&:focus': { borderColor: DESK.primary } }}
									/>
									{customTooHigh ? (
										<Box component="span" sx={{ fontSize: 13, color: DESK.danger }}>
											The tip can be {inr(TIP_MAX)} at most.
										</Box>
									) : null}
								</Box>
							) : null}
							{pendingTip > tip ? (
								<Box sx={{ width: 260 }}>
									<DeskButton label={`Add ${inr(pendingTip - tip)} tip`} kind="primary" onClick={() => void confirmTip()} loading={tipBusy} />
								</Box>
							) : null}
						</>
					) : (
						<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
							That is the largest tip ({inr(TIP_MAX)}).
						</Box>
					)}
				</Box>
			) : null}

			{noOneAccepted && !assigned ? (
				<Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
					{canSearchAgain ? (
						<Box sx={{ width: 220 }}>
							<DeskButton label="Search again" kind="primary" onClick={() => void handleSearchAgain()} loading={searchingAgain} />
						</Box>
					) : null}
					<Box sx={{ width: 240 }}>
						<DeskButton label="Schedule a visit instead" kind="secondary" onClick={() => void handleScheduleInstead()} loading={busy} />
					</Box>
				</Box>
			) : null}

			<Box sx={{ ...BOOKING_CARD, p: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<Box component="b" sx={{ fontSize: 16 }}>
					What happens next
				</Box>
				{STEPS.map(([title, text], i) => (
					<Box key={title} sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
						<Box component="span" sx={{ width: 26, height: 26, flexShrink: 0, borderRadius: '9999px', bgcolor: DESK.primarySoft, color: DESK.primary, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							{i + 1}
						</Box>
						<Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
							<b style={{ fontSize: 14 }}>{title}</b>
							<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
								{text}
							</Box>
						</Box>
					</Box>
				))}
			</Box>

			{!assigned && !endedByServer ? (
				<Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
					<Box sx={{ width: 'min(480px, 100%)', '& > button': { width: '100%', height: 54, fontSize: 16, borderRadius: '12px' } }}>
						<DeskButton label="Cancel request" kind="danger" onClick={() => setCancelOpen(true)} />
					</Box>
				</Box>
			) : endedByServer ? (
				<Box sx={{ alignSelf: 'center', width: 240 }}>
					<DeskButton label={`Back to ${care.sentence.toLowerCase()}`} kind="secondary" onClick={() => navigate(carePath(care.key, 'home'))} />
				</Box>
			) : null}

			<ReasonDialog
				open={cancelOpen}
				title="Cancel this request?"
				sub="Nothing is charged."
				reasons={SEARCH_CANCEL_REASONS}
				reasonLabel="Why are you cancelling?"
				okLabel="Cancel request"
				cancelLabel="Keep searching"
				danger
				busy={busy}
				onClose={() => setCancelOpen(false)}
				onConfirm={(reason) => void handleCancel(reason)}
			/>
		</PatientPageShell>
	)
}
