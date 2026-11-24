// src/features/nursing/NursingBookedPage.tsx
//
// Nursing care, step 3 "Booked" (a Later order): the visits that were booked, what happens next (a nurse is assigned an hour before each visit, a
// start code is shown on the booking), "Add to calendar" for each visit, and the way on to the booking. The order is loaded by its id from the URL, so a refresh keeps it.
import { Box } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import { ROUTES } from '../../constants/routes'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import LabPageShell from '../lab/LabPageShell'
import { downloadVisitCalendar } from '../lab/labCalendar'
import { inr, plural, timeLabel } from '../lab/labFormat'
import { LAB_CARD } from '../lab/labStyles'
import NursingStepper from './components/NursingStepper'
import { dayLabel, leadText, rangeLabel } from './nursingTime'
import { orderPolicyOf } from './nursingVisit'
import { useNursingOrder } from './useNursingOrder'
import { carePath } from './careServices'
import { useCareService } from './useCareService'

export default function NursingBookedPage() {
	const { requestId } = useParams()
	const navigate = useNavigate()
	const care = useCareService()
	const { order, loading } = useNursingOrder(requestId, { pollMs: 30000, pollWithSocketMs: 30000 })

	if (loading && !order) {
		return (
			<LabPageShell maxWidth={820}>
				<AppSkeleton height={160} sx={{ borderRadius: '18px' }} />
			</LabPageShell>
		)
	}

	const visits = order?.visits ?? []
	const policy = orderPolicyOf(order)
	const serviceName = order?.package?.name ?? order?.services?.map((s) => s.name).join(', ') ?? care.sentence

	return (
		<LabPageShell maxWidth={820}>
			<NursingStepper current={3} />
			<Box component="section" sx={{ ...LAB_CARD, p: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
				<Box component="span" sx={{ width: 64, height: 64, borderRadius: '9999px', bgcolor: DESK.success, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<DeskIcon d={DESK_ICONS.check} size={30} strokeWidth={3} />
				</Box>
				<Box component="h1" sx={{ m: 0, fontSize: 28, lineHeight: '34px', fontWeight: 800 }}>
					{visits.length > 1 ? 'Your visits are booked' : 'Your visit is booked'}
				</Box>
				<Box component="span" sx={{ fontSize: 15, color: DESK.muted, maxWidth: 520 }}>
					{serviceName}. A {care.noun} is assigned {leadText(policy.assignLeadMinutes)} before each visit, and you will be told as soon as one accepts.
				</Box>
			</Box>

			{visits.length > 0 ? (
				<Box sx={{ ...LAB_CARD, p: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<Box component="b" sx={{ fontSize: 18 }}>
						{plural(visits.length, 'visit', 'visits')}
					</Box>
					{visits.map((v) => (
						<Box key={v.visit_public_id} sx={{ display: 'flex', alignItems: 'center', gap: '12px', p: '12px 14px', borderRadius: '12px', bgcolor: DESK.page }}>
							<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
								<DeskIcon d={DESK_ICONS.calendar} size={18} />
							</Box>
							<Box component="span" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
								<Box component="b" sx={{ fontSize: 14 }}>
									{dayLabel(v.date)}
								</Box>
								<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
									{rangeLabel(v.start_time, v.end_time)}
								</Box>
							</Box>
							<Box
								component="button"
								type="button"
								onClick={() =>
									downloadVisitCalendar({
										orderId: `${order?.request_public_id.slice(0, 8).toUpperCase()}-${v.index}`,
										title: `${care.sentence} visit · ${serviceName}`,
										date: v.date,
										time: timeLabel(v.start_time),
										location: order?.address?.street_address,
										notes: `A ${care.noun} is assigned an hour before the visit. Pay after the visit.`,
									})
								}
								sx={{ border: 0, p: 0, bgcolor: 'transparent', color: DESK.primary, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
							>
								Add to calendar
							</Box>
						</Box>
					))}
					{order?.totals ? (
						<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', pt: '10px', borderTop: `1px dashed ${DESK.lineStrong}`, fontSize: 15 }}>
							<b>To pay after each visit</b>
							<b>{inr(order.totals.per_visit)}</b>
						</Box>
					) : null}
					<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
						Nothing is charged now. Free cancellation up to {leadText(policy.cancelCutoffMinutes)} before each visit.
					</Box>
				</Box>
			) : null}

			<Box sx={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
				<Box sx={{ width: 220 }}>
					<DeskButton label="View booking" kind="primary" onClick={() => requestId && navigate(carePath(care.key, 'order', requestId))} />
				</Box>
				<Box sx={{ width: 220 }}>
					<DeskButton label="Book another visit" kind="secondary" onClick={() => navigate(carePath(care.key, 'home'))} />
				</Box>
			</Box>
			<Box component={Link} to={`${ROUTES.BOOKINGS}?category=ancillary`} sx={{ alignSelf: 'center', fontSize: 14, fontWeight: 800, color: DESK.primary, textDecoration: 'none' }}>
				Go to my bookings
			</Box>
		</LabPageShell>
	)
}
