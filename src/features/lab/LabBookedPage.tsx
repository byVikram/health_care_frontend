// src/features/lab/LabBookedPage.tsx
//
// Step 3, "Booking confirmed" (desktop designs 4 and "Visit a lab · 4"): a teal hero, the when / where / tests / order id strip, what happens
// next, what is to be paid at collection, and the way on (back to the tests, add to the calendar, view the order). It shows the order the
// Review page just placed (in the booking store); with none, there is nothing to show and the page goes back to the tests.
import { Box } from '@mui/material'
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import { ROUTES } from '../../constants/routes'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import { downloadVisitCalendar } from '../booking/visitCalendar'
import { labBooking, useLabBooking } from './labBookingStore'
import { commaDate, inr, plural } from '../booking/bookingFormat'
import PatientPageShell from '../../components/layout/PatientPageShell'

const capsSx = { fontSize: 12, lineHeight: '16px', fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary } as const

function Fact({ label, title, sub, last = false }: { label: string; title: string; sub: string; last?: boolean }) {
	return (
		<Box
			sx={{
				p: '18px 20px',
				borderRight: last ? 0 : `1px solid ${DESK.lineSoft}`,
				display: 'flex',
				flexDirection: 'column',
				gap: '2px',
				minWidth: 0,
			}}
		>
			<Box component="span" sx={capsSx}>
				{label}
			</Box>
			<Box component="b" sx={{ fontSize: 16, overflowWrap: 'anywhere' }}>
				{title}
			</Box>
			<Box component="span" sx={{ fontSize: 13, color: DESK.muted, overflowWrap: 'anywhere' }}>
				{sub}
			</Box>
		</Box>
	)
}

function NextStep({ n, title, sub, tone }: { n: number; title: string; sub: string; tone: 'amber' | 'teal' }) {
	return (
		<Box sx={{ flex: 1, p: '16px', borderRadius: '14px', bgcolor: DESK.page, display: 'flex', flexDirection: 'column', gap: '6px' }}>
			<Box
				component="span"
				sx={{
					width: 30,
					height: 30,
					borderRadius: '9999px',
					bgcolor: tone === 'amber' ? DESK.warningSoft : DESK.primarySoft,
					color: tone === 'amber' ? DESK.warning : DESK.primary,
					fontSize: 13,
					fontWeight: 800,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{n}
			</Box>
			<Box component="b" sx={{ fontSize: 15 }}>
				{title}
			</Box>
			<Box component="span" sx={{ fontSize: 13, lineHeight: '19px', color: DESK.muted }}>
				{sub}
			</Box>
		</Box>
	)
}

export default function LabBookedPage() {
	const navigate = useNavigate()
	const { order } = useLabBooking()
	// Set when the person leaves by a button: clearing the booking then must not send them to the lab home instead.
	const [leaving, setLeaving] = useState(false)

	// Nothing was just booked (a refresh, or the page opened directly): the order itself is at its own address, the tests are here.
	if (!order) return leaving ? null : <Navigate to={ROUTES.LAB.HOME} replace />

	const isHome = order.where === 'home'
	const visit = order.visits[0]
	const date = visit ? commaDate(visit.date) : ''
	const time = visit?.time ?? ''
	const savings = Math.max(0, order.mrpTotal - order.total)
	const names = order.items.map((i) => i.name)
	const tat = order.labTatHours ? `within ${plural(order.labTatHours, 'hour', 'hours')}` : 'usually within 24 hours'
	const where = isHome ? 'At home' : (order.labName ?? order.addressTitle)

	const startFresh = (to: string) => {
		setLeaving(true)
		navigate(to)
		labBooking.startOver()
	}

	const addToCalendar = () => {
		const ok = downloadVisitCalendar({
			orderId: order.id,
			title: isHome ? 'Lab tests · home sample collection' : `Lab tests · ${where}`,
			date: visit?.date ?? '',
			time,
			location: isHome ? order.addressSub : [where, order.addressSub].filter(Boolean).join(', '),
			notes: `Karolahealth order ${order.id}. For ${order.patientName}.`,
		})
		if (ok) toast.success('Calendar file downloaded')
		else toast.info('There is no visit time to add yet')
	}

	return (
		<PatientPageShell maxWidth={960}>
			<Box
				component="section"
				sx={{
					position: 'relative',
					overflow: 'hidden',
					borderRadius: '24px',
					background:
						'radial-gradient(55% 75% at 92% 0%, #2B6F71 0%, #2B6F7100 70%), radial-gradient(50% 70% at 0% 45%, #1F5E7AE6 0%, #1F5E7A00 70%), #12373E',
					color: '#FFFFFF',
					p: '36px 40px',
					display: 'flex',
					alignItems: 'center',
					gap: '28px',
				}}
			>
				<Box
					component="span"
					sx={{
						flexShrink: 0,
						width: 96,
						height: 96,
						borderRadius: '9999px',
						bgcolor: '#1E7A4E33',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Box
						component="span"
						sx={{
							width: 70,
							height: 70,
							boxSizing: 'border-box',
							borderRadius: '9999px',
							bgcolor: DESK.success,
							border: `4px solid ${DESK.mint}`,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<DeskIcon d={DESK_ICONS.check} size={34} strokeWidth={2.8} />
					</Box>
				</Box>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
					<Box
						component="span"
						sx={{
							alignSelf: 'flex-start',
							p: '4px 12px',
							borderRadius: '9999px',
							bgcolor: DESK.mint,
							color: DESK.ink,
							fontSize: 12,
							fontWeight: 800,
						}}
					>
						{isHome ? 'Booking confirmed · pay at collection' : 'Booking confirmed · pay at the lab'}
					</Box>
					<Box component="h1" sx={{ m: 0, fontSize: 30, lineHeight: '38px', fontWeight: 800 }}>
						Your tests are booked
					</Box>
					<Box component="p" sx={{ m: 0, fontSize: 16, lineHeight: '24px', color: DESK.primarySoft }}>
						{isHome
							? `A phlebotomist will visit your home on ${date} at ${time}.`
							: `See you at ${where} on ${date} at ${time}.`}
					</Box>
				</Box>
			</Box>

			<Box
				component="section"
				sx={{
					bgcolor: DESK.raised,
					border: `1px solid ${DESK.cardLine}`,
					borderRadius: '18px',
					display: 'grid',
					gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
				}}
			>
				<Fact label="WHEN" title={time} sub={date} />
				<Fact label="WHERE" title={where} sub={order.addressSub} />
				<Fact label="TESTS" title={plural(order.items.length, 'lab test', 'lab tests')} sub={names.join(', ')} />
				<Fact label="ORDER ID" title={order.id} sub={`For ${order.patientName}`} last />
			</Box>

			<Box
				component="section"
				sx={{
					bgcolor: DESK.raised,
					border: `1px solid ${DESK.cardLine}`,
					borderRadius: '18px',
					p: '22px 24px',
					display: 'flex',
					flexDirection: 'column',
					gap: '14px',
				}}
			>
				<Box component="b" sx={{ fontSize: 18 }}>
					What happens next
				</Box>
				<Box sx={{ display: 'flex', gap: '12px' }}>
					{order.fasting ? (
						<NextStep
							n={1}
							tone="amber"
							title="Fast before your slot"
							sub="No food for 10–12 hours before your slot. Water is fine."
						/>
					) : (
						<NextStep n={1} tone="amber" title="Check the preparation" sub="Some tests need fasting. The lab will tell you if yours does before your slot." />
					)}
					<NextStep
						n={2}
						tone="teal"
						title={isHome ? 'Sample collection at home' : 'Visit the lab'}
						sub={
							isHome
								? `Your phlebotomist will call before arriving on ${date}.`
								: 'Reach 10 minutes early and show your booking at the front desk.'
						}
					/>
					<NextStep n={3} tone="teal" title="Reports online" sub={`We’ll notify you when results are ready, ${tat}.`} />
				</Box>
			</Box>

			<Box
				component="section"
				sx={{
					bgcolor: DESK.raised,
					border: `1px solid ${DESK.cardLine}`,
					borderRadius: '18px',
					p: '16px 24px',
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
				}}
			>
				<Box component="span" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
					<Box component="b" sx={{ fontSize: 15 }}>
						{inr(order.total)} to pay {isHome ? 'at collection' : 'at the lab'}
					</Box>
					<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
						{isHome ? 'Cash or UPI when we visit. Nothing was charged online.' : 'Cash, card or UPI at the front desk. Nothing was charged online.'}
					</Box>
				</Box>
				{savings > 0 ? (
					<Box component="b" sx={{ fontSize: 14, color: DESK.success }}>
						You saved {inr(savings)}
					</Box>
				) : null}
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'center', gap: '12px', '& button, & a': { height: 44, fontSize: 15 } }}>
				<Box sx={{ minWidth: 170 }}>
					<DeskButton label="Back to lab tests" kind="secondary" onClick={() => startFresh(ROUTES.LAB.HOME)} />
				</Box>
				<Box sx={{ minWidth: 170 }}>
					<DeskButton label="Add to calendar" kind="secondary" icon={DESK_ICONS.calendar} onClick={addToCalendar} />
				</Box>
				<Box sx={{ minWidth: 150 }}>
					<DeskButton
						label="View order"
						kind="primary"
						onClick={() =>
							order.apiId
								? startFresh(ROUTES.LAB.ORDER.replace(':orderId', order.apiId))
								: startFresh(ROUTES.BOOKINGS)
						}
					/>
				</Box>
			</Box>
		</PatientPageShell>
	)
}
