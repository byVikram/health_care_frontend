// src/features/nursing/NursingReviewPage.tsx
//
// Nursing care, step 2 "Review & confirm" (the native app's two Review & pay screens in one): the services, who / where / when, a note for the
// nurse, and the bill. Nothing is charged now: the patient pays after each visit. Confirming places the order:
//   - Book now:  POST /patient/requests -> "Finding a nurse" (409 ACTIVE_TASK_EXISTS resumes the request that is already open)
//   - Later:     POST /requests/scheduled (no nurse chosen; one is assigned to each visit an hour before it starts) -> Booked
// The server's refusal is shown in its own words (a time that is too soon, a paused account, the address ...).
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import LabCartSection from '../lab/components/LabCartSection'
import LabPageShell from '../lab/LabPageShell'
import { inr } from '../lab/labFormat'
import NursingStepper from './components/NursingStepper'
import NursingSummary from './components/NursingSummary'
import { instantFee, itemsSummary, nursingBooking, perVisitFee, selectionOf, visitsOf } from './nursingBookingStore'
import {
	MAX_NOTE_LENGTH,
	createInstantRequest,
	createScheduledOrder,
	fetchActiveRequestId,
	nursingErrorCode,
	nursingErrorMessage,
} from './nursingService'
import { chipTime, dayLabel, leadText, minutesOf, rangeLabel, slotTooSoon } from './nursingTime'
import { useBookingPeople, useBookingRestriction } from './useBookingPeople'
import { useNursingConfig } from './useNursingCatalogue'
import { resolveBookingAddress } from './useVisitAddress'
import { carePath } from './careServices'
import { useCareService } from './useCareService'

const rowSx = { display: 'flex', alignItems: 'flex-start', gap: '12px', py: '10px', borderTop: `1px solid ${DESK.lineSoft}` } as const

function Edit({ to }: { to: string }) {
	return (
		<Box component={Link} to={to} sx={{ fontSize: 13, fontWeight: 800, color: DESK.primary, textDecoration: 'none' }}>
			Edit
		</Box>
	)
}

export default function NursingReviewPage() {
	const navigate = useNavigate()
	const care = useCareService()
	// a cart is for one service: arriving here for another one starts it afresh
	useEffect(() => {
		nursingBooking.useService(care.key)
	}, [care.key])
	const { policy } = useNursingConfig()
	const restriction = useBookingRestriction()
	const { booking, patient, patientPublicId, address, addressesLoading } = useBookingPeople()
	const [busy, setBusy] = useState(false)

	const isNow = booking.mode === 'now'
	const visits = visitsOf(booking)
	const visitCount = isNow ? 1 : visits.length
	const perVisit = perVisitFee(booking.items)
	const total = isNow ? instantFee(booking.items) : perVisit * visitCount
	const incomplete = booking.items.length === 0 || (!isNow && visits.length === 0)

	// Nothing to review (a refresh with nothing stored, or the page opened directly): back to the start.
	if (incomplete) return <Navigate to={booking.items.length === 0 ? carePath(care.key, 'home') : carePath(care.key, 'schedule')} replace />

	const blocker = restriction.restricted ? 'Booking is paused' : !patient ? 'Choose who it is for' : !address && !addressesLoading ? 'Choose an address' : ''

	const confirm = async () => {
		if (busy) return
		if (!isNow && visits.some((v) => slotTooSoon(v.date, minutesOf(v.start_time), policy.assignLeadMinutes))) {
			toast.info('That time is too soon. Please pick a new one.')
			navigate(carePath(care.key, 'schedule'))
			return
		}
		setBusy(true)
		try {
			const place = await resolveBookingAddress(address)
			if (!place) return
			const selection = selectionOf(booking.items)
			const note = booking.note.trim()
			if (isNow) {
				try {
					const requestId = await createInstantRequest({ selection, patientPublicId, address: place, note })
					if (!requestId) throw new Error('The request was not created.')
					// go first, then clear: clearing the cart on this page would send it back to the browse page
					navigate(carePath(care.key, 'matching', requestId), { replace: true })
					nursingBooking.startOver()
				} catch (e) {
					// one live request at a time: carry on with the one that is already open
					if (nursingErrorCode(e) === 'ACTIVE_TASK_EXISTS') {
						const openId = await fetchActiveRequestId()
						if (openId) {
							toast.info('You already have a request open. Showing it.')
							navigate(carePath(care.key, 'matching', openId), { replace: true })
							return
						}
					}
					throw e
				}
				return
			}
			const order = await createScheduledOrder({ selection, visits, patientPublicId, address: place, note })
			navigate(carePath(care.key, 'booked', order.request_public_id), { replace: true })
			nursingBooking.startOver()
		} catch (e) {
			toast.error(nursingErrorMessage(e, 'We could not place your booking. Please try again.'))
		} finally {
			setBusy(false)
		}
	}

	return (
		<LabPageShell>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Box component={Link} to={carePath(care.key, 'schedule')} sx={{ width: 160, fontSize: 14, fontWeight: 800, textDecoration: 'none', color: DESK.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
					<DeskIcon d={DESK_ICONS.chevronLeft} size={16} strokeWidth={2.4} />
					Back
				</Box>
				<NursingStepper current={2} />
				<Box sx={{ width: 160 }} />
			</Box>
			{restriction.restricted ? (
				<Box role="alert" sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.dangerSoft, color: DESK.danger, fontSize: 14, fontWeight: 600 }}>
					{restriction.message || 'Booking is paused for now because of missed visits.'}
				</Box>
			) : null}
			<Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
				<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
					<LabCartSection title="Services" sub={itemsSummary(booking.items)} right={<Edit to={carePath(care.key, 'home')} />}>
						<Box sx={{ display: 'flex', flexDirection: 'column' }}>
							{booking.items.map((item, i) => (
								<Box key={item.id} sx={{ ...rowSx, borderTop: i === 0 ? 0 : rowSx.borderTop, alignItems: 'center' }}>
									<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
										<Box component="b" sx={{ fontSize: 14 }}>
											{item.name}
										</Box>
										<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
											{item.kind === 'package' ? 'Care package' : 'Nursing procedure'}
											{item.durationMinutes ? ` · ${item.durationMinutes} mins` : ''}
										</Box>
									</Box>
									<Box component="b" sx={{ fontSize: 14 }}>
										{inr(item.price)}
									</Box>
								</Box>
							))}
						</Box>
					</LabCartSection>

					<LabCartSection title="Visit details" right={<Edit to={carePath(care.key, 'schedule')} />}>
						<Box sx={{ display: 'flex', flexDirection: 'column' }}>
							<Box sx={{ ...rowSx, borderTop: 0 }}>
								<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
									<DeskIcon d={DESK_ICONS.user} size={18} />
								</Box>
								<Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
									<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
										Visit for
									</Box>
									<Box component="b" sx={{ fontSize: 14 }}>
										{patient ? `${patient.name}${patient.isSelf ? ' (you)' : ` · ${patient.relationship}`}` : booking.patientName}
									</Box>
								</Box>
							</Box>
							<Box sx={rowSx}>
								<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
									<DeskIcon d={DESK_ICONS.home} size={18} />
								</Box>
								<Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
									<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
										Address
									</Box>
									<Box component="b" sx={{ fontSize: 14 }}>
										{address?.label ?? booking.addressTag}
									</Box>
									<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
										{booking.addressLine}
									</Box>
								</Box>
							</Box>
							<Box sx={rowSx}>
								<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
									<DeskIcon d={DESK_ICONS.calendar} size={18} />
								</Box>
								<Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
									<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
										When
									</Box>
									{isNow ? (
										<>
											<Box component="b" sx={{ fontSize: 14 }}>
												Now · as soon as possible
											</Box>
											<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
												A nearby {care.noun} accepts your request, usually within a few minutes, and arrives in about 15–30 min.
											</Box>
										</>
									) : (
										visits.map((v, i) => (
											<Box key={v.date} component="b" sx={{ fontSize: 14 }}>
												{visits.length > 1 ? `Visit ${i + 1} · ` : ''}
												{dayLabel(v.date)} · {rangeLabel(v.start_time, v.end_time)}
											</Box>
										))
									)}
								</Box>
							</Box>
						</Box>
					</LabCartSection>

					<LabCartSection title={`Note for the ${care.noun}`} sub={`Optional. Anything the ${care.noun} should know before the visit.`}>
						<Box
							component="textarea"
							value={booking.note}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => nursingBooking.set({ note: e.target.value.slice(0, MAX_NOTE_LENGTH) })}
							placeholder="For example: ring the bell twice, the patient is on the 3rd floor"
							rows={3}
							aria-label={`Note for the ${care.noun}`}
							sx={{ width: '100%', boxSizing: 'border-box', p: '12px 14px', border: `1.5px solid ${DESK.lineStrong}`, borderRadius: '12px', fontFamily: 'inherit', fontSize: 14, color: DESK.ink, resize: 'vertical', outline: 0, '&:focus': { borderColor: DESK.primary } }}
						/>
						<Box component="span" sx={{ alignSelf: 'flex-end', fontSize: 12, color: DESK.muted, mt: '-8px' }}>
							{booking.note.length}/{MAX_NOTE_LENGTH}
						</Box>
					</LabCartSection>

					<LabCartSection title="Bill">
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 14 }}>
							{booking.items.map((item) => (
								<Box key={item.id} component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<span>{item.name}</span>
									<span>{inr(isNow ? item.price : perVisitFee([item]))}</span>
								</Box>
							))}
							{!isNow ? (
								<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.muted }}>
									<span>
										{visitCount} {visitCount === 1 ? 'visit' : 'visits'} × {inr(perVisit)}
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
								<b>To pay after {visitCount > 1 ? 'each visit' : 'the visit'}</b>
								<b>{inr(isNow ? total : perVisit)}</b>
							</Box>
						</Box>
						<Box sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.primarySoft, fontSize: 13, lineHeight: '19px', color: DESK.ink, display: 'flex', flexDirection: 'column', gap: '4px' }}>
							<span>
								<b>Nothing is charged now.</b> You pay the {care.noun} after the visit.
							</span>
							{isNow ? null : (
								<>
									<span>A {care.noun} is assigned {leadText(policy.assignLeadMinutes)} before each visit.</span>
									<span>Free cancellation up to {leadText(policy.cancelCutoffMinutes)} before each visit.</span>
								</>
							)}
						</Box>
					</LabCartSection>
				</Box>
				<NursingSummary
					forWho={patient ? `${patient.name}${patient.isSelf ? ' (you)' : ` · ${patient.relationship}`}` : null}
					where={address ? `${address.label} · ${address.city || address.address_line}` : booking.addressTag || null}
					when={isNow ? 'Now · as soon as possible' : visits.length === 1 ? `${dayLabel(visits[0].date)} · ${chipTime(visits[0].start_time)}` : `${visits.length} visits · ${visits.map((v) => v.date.slice(8)).join(', ')}`}
					whenMissing="Pick a time"
					items={booking.items}
					perVisit={perVisit}
					visits={visitCount}
					total={isNow ? total : total}
					blocker={blocker}
					buttonLabel={isNow ? `Confirm · find a ${care.noun}` : 'Confirm booking'}
					busy={busy}
					onContinue={() => void confirm()}
				/>
			</Box>
		</LabPageShell>
	)
}
