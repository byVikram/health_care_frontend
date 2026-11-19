// src/features/lab/LabOrderPage.tsx
//
// "Lab order" (desktop design 5): the order's status and progress, the tests in it, the details (pickup, lab, phlebotomist, patient,
// address, order id), what to do before the visit, and on the right the payment and Manage this order (reschedule, add more tests, cancel).
// The order is read from the server (GET /api/laboratory/orders/{id}) on open and whenever the tab is shown again, so it follows what the
// lab does. The order just placed (in the booking store) lends the details the server does not echo (the patient's relation, test lines).
import { Box } from '@mui/material'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import ReasonDialog from '../../components/common/Modal/ReasonDialog'
import StatusPill from '../../components/common/StatusPill/StatusPill'
import { ROUTES } from '../../constants/routes'
import { DESK, DESK_ICONS, type DeskTone } from '../../styles/deskTokens'
import LabOrderTimeline from './components/LabOrderTimeline'
import LabRescheduleDialog from './components/LabRescheduleDialog'
import { labBooking, type LabOrder } from './labBookingStore'
import { downloadVisitCalendar } from './labCalendar'
import { CANCEL_REASONS, LAB_ICONS } from './labConstants'
import { commaDate, inr, longDate, plural } from './labFormat'
import { applyApi, orderFromApi } from './labOrder'
import { cancelOrder, fetchOrder, labErrorMessage, type ApiOrder } from './labService'
import LabPageShell from './LabPageShell'

const STATUS: Record<string, { label: string; tone: DeskTone }> = {
	placed: { label: 'Order placed', tone: 'move' },
	scheduled: { label: 'Scheduled', tone: 'move' },
	on_the_way: { label: 'On the way', tone: 'move' },
	sample_collected: { label: 'Sample collected', tone: 'ok' },
	processing: { label: 'Processing', tone: 'wait' },
	report_ready: { label: 'Report ready', tone: 'ok' },
	needs_attention: { label: 'Needs attention', tone: 'bad' },
	cancelled: { label: 'Cancelled', tone: 'bad' },
	cancel_requested: { label: 'Cancellation requested', tone: 'wait' },
	reschedule_requested: { label: 'Reschedule requested', tone: 'wait' },
}

// What the patient is told when the visit could not be completed (the same words as the app).
const ATTENTION_TEXT: Record<string, { title: string; body: string }> = {
	missed: {
		title: 'We missed you at your visit',
		body: 'We couldn’t collect your sample because no one was available. You can book again, or contact support if this is a mistake.',
	},
	no_show: {
		title: 'Your phlebotomist couldn’t make the visit',
		body: 'We’re sorry. You can book again, or contact support and we’ll help.',
	},
	sample_rejected: {
		title: 'Your sample couldn’t be used',
		body: 'The lab couldn’t use it, so it needs to be collected again. You can book again, or contact support.',
	},
}
const ATTENTION_FALLBACK = {
	title: 'We couldn’t complete your lab visit',
	body: 'You can book again, or contact support and we’ll help.',
}

const card = { bgcolor: DESK.raised, border: `1px solid ${DESK.cardLine}`, borderRadius: '18px', p: '22px 24px' } as const
const capsSx = { fontSize: 12, lineHeight: '16px', fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary } as const

function Card({ title, children }: { title: string; children: ReactNode }) {
	return (
		<Box component="section" sx={{ ...card, display: 'flex', flexDirection: 'column', gap: '8px' }}>
			<Box component="h2" sx={{ m: '0 0 4px', fontSize: 18, fontWeight: 800 }}>
				{title}
			</Box>
			{children}
		</Box>
	)
}

function Banner({ tone, title, body }: { tone: 'danger' | 'warning' | 'success'; title: string; body: string }) {
	const ink = tone === 'danger' ? DESK.danger : tone === 'warning' ? DESK.warning : DESK.success
	const bg = tone === 'danger' ? DESK.dangerSoft : tone === 'warning' ? DESK.warningSoft : DESK.successSoft
	return (
		<Box role={tone === 'danger' ? 'alert' : 'status'} sx={{ p: '14px 18px', borderRadius: '14px', bgcolor: bg, display: 'flex', flexDirection: 'column', gap: '2px' }}>
			<Box component="b" sx={{ fontSize: 15, color: ink }}>
				{title}
			</Box>
			<Box component="span" sx={{ fontSize: 14, lineHeight: '20px', color: DESK.inkSoft }}>
				{body}
			</Box>
		</Box>
	)
}

function DetailRow({
	icon,
	label,
	value,
	sub,
	action,
	last = false,
}: {
	icon: string
	label: string
	value: string
	sub?: string
	action?: ReactNode
	last?: boolean
}) {
	return (
		<Box sx={{ py: '12px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: last ? 0 : `1px solid ${DESK.lineSoft}` }}>
			<Box
				component="span"
				sx={{
					flexShrink: 0,
					width: 38,
					height: 38,
					borderRadius: '10px',
					bgcolor: DESK.primarySoft,
					color: DESK.primary,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<DeskIcon d={icon} size={18} />
			</Box>
			<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
				<Box component="span" sx={capsSx}>
					{label}
				</Box>
				<Box component="b" sx={{ fontSize: 15, overflowWrap: 'anywhere' }}>
					{value}
				</Box>
				{sub ? (
					<Box component="span" sx={{ fontSize: 13, color: DESK.muted, overflowWrap: 'anywhere' }}>
						{sub}
					</Box>
				) : null}
			</Box>
			{action}
		</Box>
	)
}

const linkSx = {
	flexShrink: 0,
	p: 0,
	border: 0,
	bgcolor: 'transparent',
	fontFamily: 'inherit',
	fontSize: 14,
	fontWeight: 800,
	color: DESK.primary,
	textDecoration: 'none',
	cursor: 'pointer',
} as const

function TextAction({ label, onClick, href }: { label: string; onClick?: () => void; href?: string }) {
	if (href) {
		return (
			<Box component="a" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" sx={linkSx}>
				{label}
			</Box>
		)
	}
	return (
		<Box component="button" type="button" onClick={onClick} sx={linkSx}>
			{label}
		</Box>
	)
}

function Tip({ n, title, body }: { n: number; title: string; body: string }) {
	return (
		<Box sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
			<Box
				component="span"
				sx={{
					flexShrink: 0,
					width: 26,
					height: 26,
					borderRadius: '9999px',
					bgcolor: DESK.primarySoft,
					color: DESK.primary,
					fontSize: 12,
					fontWeight: 800,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{n}
			</Box>
			<Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
				<Box component="b" sx={{ fontSize: 15 }}>
					{title}
				</Box>
				<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
					{body}
				</Box>
			</Box>
		</Box>
	)
}

function PayRow({ label, value, tone }: { label: string; value: string; tone?: 'free' }) {
	return (
		<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: 14 }}>
			<Box component="span" sx={{ color: DESK.muted }}>
				{label}
			</Box>
			<Box component="b" sx={{ color: tone === 'free' ? DESK.success : DESK.ink }}>
				{value}
			</Box>
		</Box>
	)
}

export default function LabOrderPage() {
	const navigate = useNavigate()
	const { orderId = '' } = useParams()
	const [order, setOrder] = useState<LabOrder | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [reload, setReload] = useState(0)
	const [rescheduling, setRescheduling] = useState(false)
	const [rescheduled, setRescheduled] = useState(false)
	const [cancelling, setCancelling] = useState(false)
	const [busy, setBusy] = useState(false)

	// The order placed a moment ago (same id) lends its details; a refresh keeps them through `prev`.
	const merge = useCallback(
		(api: ApiOrder, prev: LabOrder | null): LabOrder => {
			const lent = labBooking.get().order
			const base = prev ?? (lent?.apiId === api.id ? lent : null)
			return base ? applyApi(base, api) : orderFromApi(api)
		},
		[],
	)

	useEffect(() => {
		let active = true
		const load = async () => {
			setLoading(true)
			setError('')
			try {
				const api = await fetchOrder(orderId)
				if (active) setOrder((prev) => merge(api, prev?.apiId === api.id ? prev : null))
			} catch (err) {
				if (active) setError(labErrorMessage(err))
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [orderId, reload, merge])

	// Follow what the lab does: read again when the tab is shown after being away.
	useEffect(() => {
		const onShow = () => {
			if (document.visibilityState === 'visible') setReload((n) => n + 1)
		}
		document.addEventListener('visibilitychange', onShow)
		return () => document.removeEventListener('visibilitychange', onShow)
	}, [])

	const goCatalogue = () => {
		labBooking.startOver()
		navigate(ROUTES.LAB.HOME)
	}

	const share = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href)
			toast.success('Link copied')
		} catch {
			toast.error('Could not copy the link')
		}
	}

	const confirmCancel = async (reason: string) => {
		if (!order?.apiId) return
		setBusy(true)
		try {
			const api = await cancelOrder(order.apiId, reason)
			setOrder((prev) => (prev ? applyApi(prev, api) : prev))
			setCancelling(false)
			toast.success(api.status === 'cancel_requested' ? 'Cancellation requested' : 'Order cancelled')
		} catch (err) {
			toast.error(labErrorMessage(err))
			setReload((n) => n + 1) // what is allowed may have changed
		} finally {
			setBusy(false)
		}
	}

	if (!order) {
		return (
			<LabPageShell>
				<Box component={Link} to={ROUTES.BOOKINGS} sx={{ alignSelf: 'flex-start', fontSize: 14, fontWeight: 800, color: DESK.primary, textDecoration: 'none' }}>
					‹ Back to my bookings
				</Box>
				{loading ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
						<AppSkeleton height={44} width={420} />
						<AppSkeleton height={110} />
						<AppSkeleton height={260} />
					</Box>
				) : (
					<Box sx={{ ...card, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
						<Box component="b" sx={{ fontSize: 18 }}>
							We couldn’t open this order
						</Box>
						<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
							{error || 'Something went wrong. Please try again.'}
						</Box>
						<DeskButton label="Try again" kind="primary" fullWidth={false} onClick={() => setReload((n) => n + 1)} />
					</Box>
				)}
			</LabPageShell>
		)
	}

	const isHome = order.where === 'home'
	const visit = order.visits[0]
	const placed = order.placedAt.slice(0, 10)
	const savings = Math.max(0, order.mrpTotal - order.total)
	const status = STATUS[order.status ?? ''] ?? { label: 'Order placed', tone: 'move' as DeskTone }
	const cancelled = order.status === 'cancelled'
	const cancelRequested = order.status === 'cancel_requested'
	const rescheduleRequested = order.status === 'reschedule_requested'
	const needsAttention = order.status === 'needs_attention'
	const live = !cancelled && !cancelRequested
	const active = live && !needsAttention
	const attention = ATTENTION_TEXT[order.attentionReason ?? ''] ?? ATTENTION_FALLBACK
	const canCancel = live && !!order.apiId && !!order.canCancel
	const canReschedule = active && !!order.apiId && !!order.canReschedule
	const when = visit?.date ? `${commaDate(visit.date)}, ${visit.time}` : 'To be confirmed'
	const timeline = order.timeline ?? []
	const apiId = order.apiId

	const addToCalendar = () => {
		const ok = downloadVisitCalendar({
			orderId: order.id,
			title: isHome ? 'Lab tests · home sample collection' : `Lab tests · ${order.addressTitle}`,
			date: visit?.date ?? '',
			time: visit?.time ?? '',
			location: isHome ? order.addressSub : [order.addressTitle, order.addressSub].filter(Boolean).join(', '),
			notes: `Karolahealth order ${order.id}. For ${order.patientName}.`,
		})
		if (ok) toast.success('Calendar file downloaded')
		else toast.info('There is no visit time to add yet')
	}

	return (
		<LabPageShell>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Box
					component={Link}
					to={ROUTES.BOOKINGS}
					sx={{ alignSelf: 'flex-start', fontSize: 14, fontWeight: 800, color: DESK.primary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
				>
					<DeskIcon d={DESK_ICONS.chevronLeft} size={16} strokeWidth={2.4} />
					Back to my bookings
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
					<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
							<Box component="h1" sx={{ m: 0, fontSize: 26, lineHeight: '34px', fontWeight: 800 }}>
								Lab order {order.id}
							</Box>
							<StatusPill label={status.label} tone={status.tone} />
						</Box>
						<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
							Placed on {longDate(placed)} · {plural(order.items.length, 'test', 'tests')} · {order.patientName}
						</Box>
					</Box>
					<Box sx={{ width: 120 }}>
						<DeskButton label="Share" kind="secondary" icon={LAB_ICONS.share} onClick={() => void share()} />
					</Box>
				</Box>
			</Box>

			{timeline.length > 0 ? <LabOrderTimeline steps={timeline} /> : null}

			{cancelled ? (
				<Banner
					tone="danger"
					title="Cancelled"
					body="Nothing was charged. You can book again any time."
				/>
			) : null}
			{needsAttention ? <Banner tone="danger" title={attention.title} body={attention.body} /> : null}
			{rescheduled && live ? (
				<Banner tone="success" title="Rescheduled" body="Your fasting reminder moves with the new pickup time." />
			) : null}
			{cancelRequested || rescheduleRequested ? (
				<Banner
					tone="warning"
					title={cancelRequested ? 'Cancellation requested' : 'Reschedule requested'}
					body={
						cancelRequested
							? 'The lab has not confirmed yet. We’ll update this order when it does.'
							: 'The lab has not confirmed the new time yet. Your current time stands until it does.'
					}
				/>
			) : null}
			{active && order.fasting ? (
				<Banner tone="warning" title="Fast for 10–12 hours" body="Stop eating by 9 PM the night before. Plain water is fine." />
			) : null}

			<Box sx={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
				<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
					<Card title="Tests in this order">
						{order.items.map((item, index) => (
							<Box
								key={item.id}
								sx={{
									py: '10px',
									display: 'flex',
									alignItems: 'center',
									gap: '14px',
									borderBottom: index < order.items.length - 1 ? `1px solid ${DESK.lineSoft}` : 0,
								}}
							>
								<Box
									component="span"
									sx={{
										flexShrink: 0,
										width: 42,
										height: 42,
										borderRadius: '11px',
										bgcolor: item.kind === 'package' ? DESK.lilacSoft : DESK.primarySoft,
										color: item.kind === 'package' ? DESK.lilac : DESK.primary,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<DeskIcon d={item.kind === 'package' ? LAB_ICONS.order : LAB_ICONS.flask} size={20} />
								</Box>
								<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
									<Box component="b" sx={{ fontSize: 15 }}>
										{item.name}
									</Box>
									<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
										{item.sub}
									</Box>
								</Box>
								<Box component="b" sx={{ fontSize: 15 }}>
									{inr(item.price)}
								</Box>
							</Box>
						))}
					</Card>

					<Card title="Details">
						<DetailRow
							icon={LAB_ICONS.calendar}
							label={isHome ? 'SAMPLE PICKUP' : 'LAB VISIT'}
							value={when}
							sub={isHome ? 'At your home' : order.addressTitle}
							action={visit?.date ? <TextAction label="Add to calendar" onClick={addToCalendar} /> : undefined}
						/>
						{order.labName ? (
							<DetailRow
								icon={LAB_ICONS.flask}
								label="LAB"
								value={order.labName}
								sub={[
									isHome ? 'Home sample collection' : 'Visit the lab',
									order.labTatHours != null ? `Reports in ${order.labTatHours} hrs` : null,
								]
									.filter(Boolean)
									.join(' · ')}
							/>
						) : null}
						{isHome ? (
							<DetailRow
								icon={LAB_ICONS.person}
								label="PHLEBOTOMIST"
								value={order.phleboName || 'Not assigned yet'}
								sub={
									order.phleboName
										? (order.phleboNumber ?? '')
										: 'We’ll share their name and number once the lab assigns one'
								}
								action={
									order.phleboNumber && live ? (
										<TextAction label="Call" href={`tel:${order.phleboNumber}`} />
									) : order.trackingLink && live ? (
										<TextAction label="Track" href={order.trackingLink} />
									) : undefined
								}
							/>
						) : null}
						<DetailRow icon={LAB_ICONS.user} label="PATIENT" value={order.patientName} sub={order.patientRelation} />
						{isHome ? (
							<DetailRow icon={LAB_ICONS.home} label="COLLECTION ADDRESS" value={order.addressTitle} sub={order.addressSub} />
						) : null}
						<DetailRow icon={LAB_ICONS.order} label="ORDER ID" value={order.id} sub={`Placed on ${longDate(placed)}`} last />
					</Card>

					{active ? (
						<Card title={isHome ? 'Before the pickup' : 'Before your visit'}>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
								{(
									[
										order.fasting
											? { title: 'Fast from 9 PM the night before', body: 'No food, tea or coffee. Water is fine.' }
											: null,
										{ title: 'Take regular medicines', body: 'Unless your doctor told you otherwise.' },
										{
											title: 'Keep a photo ID ready',
											body: isHome ? 'The phlebotomist checks it before collecting.' : 'The lab checks it before collecting.',
										},
									] as ({ title: string; body: string } | null)[]
								)
									.filter((tip): tip is { title: string; body: string } => tip !== null)
									.map((tip, index) => (
										<Tip key={tip.title} n={index + 1} title={tip.title} body={tip.body} />
									))}
							</Box>
						</Card>
					) : null}
				</Box>

				<Box
					component="aside"
					sx={{ position: 'sticky', top: 88, width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}
				>
					<Card title="Payment">
						<PayRow label={`Tests (${order.items.length}, MRP)`} value={inr(order.mrpTotal)} />
						{savings > 0 ? <PayRow label="Package discount" value={`−${inr(savings)}`} tone="free" /> : null}
						{isHome ? <PayRow label="Home collection" value="Free" tone="free" /> : null}
						<Box sx={{ mt: '6px', pt: '12px', borderTop: `1px dashed ${DESK.field}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
							<Box component="b" sx={{ fontSize: 15 }}>
								{cancelled ? 'Nothing was charged' : isHome ? 'To pay at collection' : 'To pay at the lab'}
							</Box>
							<Box component="b" sx={{ fontSize: 22 }}>
								{cancelled ? inr(0) : inr(order.total)}
							</Box>
						</Box>
					</Card>

					<Card title="Manage this order">
						{order.status === 'report_ready' && apiId ? (
							<DeskButton
								label="View report"
								kind="primary"
								icon={LAB_ICONS.document}
								onClick={() => navigate(ROUTES.LAB.REPORT.replace(':orderId', apiId))}
							/>
						) : null}
						{active ? (
							<>
								<DeskButton
									label="Reschedule pickup"
									kind="secondary"
									icon={LAB_ICONS.calendar}
									disabled={!canReschedule}
									onClick={() => setRescheduling(true)}
								/>
								<DeskButton label="Add more tests" kind="primary" icon={LAB_ICONS.plus} onClick={goCatalogue} />
							</>
						) : cancelled || needsAttention ? (
							<DeskButton label="Book again" kind="primary" onClick={goCatalogue} />
						) : null}
						{canCancel ? <DeskButton label="Cancel order" kind="danger" onClick={() => setCancelling(true)} /> : null}
						{!active && !cancelled && !needsAttention ? (
							<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
								Waiting for the lab to confirm. This page updates when it does.
							</Box>
						) : null}
					</Card>
				</Box>
			</Box>

			{rescheduling && apiId ? (
				<LabRescheduleDialog
					orderId={apiId}
					current={{ date: visit?.date ?? '', time: visit?.time ?? '' }}
					subtitle={`${isHome ? 'Home sample collection' : 'Lab visit'} · ${plural(order.items.length, 'test', 'tests')}`}
					onClose={() => setRescheduling(false)}
					onRescheduled={(api) => {
						setOrder((prev) => (prev ? applyApi(prev, api) : prev))
						setRescheduled(api.status !== 'reschedule_requested')
						setRescheduling(false)
						toast.success(api.status === 'reschedule_requested' ? 'Reschedule requested' : 'Pickup rescheduled')
					}}
				/>
			) : null}

			<ReasonDialog
				open={cancelling}
				title="Cancel this order?"
				sub={order.id}
				body="Nothing has been charged. Tell us why so we can improve."
				reasons={CANCEL_REASONS}
				okLabel="Cancel order"
				cancelLabel="Keep order"
				danger
				busy={busy}
				onClose={() => setCancelling(false)}
				onConfirm={(reason) => void confirmCancel(reason)}
			/>
		</LabPageShell>
	)
}
