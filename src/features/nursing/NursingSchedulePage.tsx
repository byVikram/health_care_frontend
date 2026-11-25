// src/features/nursing/NursingSchedulePage.tsx
//
// Nursing care, step 1 "Who & when": who the visit is for, the address, and when (Book now, or the days and time of a scheduled visit) beside the
// booking summary. The Lab tests cart page with the native app's "Schedule a visit" rules: up to 7 days in a 14-day window, hourly times from
// 7 AM to 9 PM, and a time today must start at least an hour from now (Mumbai's clock).
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import PatientPageShell from '../../components/layout/PatientPageShell'
import { BOOKING_CARD } from '../booking/bookingStyles'
import AddressDialog from '../../components/common/Modal/AddressDialog'
import NursingSummary from './components/NursingSummary'
import NursingWhenSection from './components/NursingWhenSection'
import NursingWhereSection from './components/NursingWhereSection'
import WhoSection from '../booking/WhoSection'
import { instantFee, nursingBooking, perVisitFee, selectionOf, visitMinutes, visitsOf } from './nursingBookingStore'
import {
	MAX_NOTE_LENGTH,
	MAX_VISITS,
	createInstantRequest,
	createScheduledOrder,
	nursingErrorCode,
	nursingErrorMessage,
} from './nursingService'
import { chipTime, dayLabel, leadText, minutesOf, slotTooSoon } from './nursingTime'
import { useBookingPeople, useBookingRestriction } from './useBookingPeople'
import { useNursingConfig } from './useNursingCatalogue'
import { resolveBookingAddress } from './useVisitAddress'
import { bookingPatientKey } from '../booking/useBookingPatients'
import { carePath } from './careServices'
import { useCareService } from './useCareService'

export default function NursingSchedulePage() {
	const navigate = useNavigate()
	const care = useCareService()
	// a cart is for one service: arriving here for another one starts it afresh
	useEffect(() => {
		nursingBooking.useService(care.key)
	}, [care.key])
	const { policy } = useNursingConfig()
	const restriction = useBookingRestriction()
	const { booking, patients, patientsLoading, patient, patientPublicId, addresses, addressesLoading, addressError, address, selectPatient, selectAddress, saveAddress } = useBookingPeople()
	const [addressOpen, setAddressOpen] = useState(false)
	const [addressDeclined, setAddressDeclined] = useState(false)
	const [busy, setBusy] = useState(false)

	// The page can stay open for a long time: a minute counter re-runs the check below every 15 seconds.
	const [tick, setTick] = useState(0)
	useEffect(() => {
		const id = setInterval(() => setTick((t) => t + 1), 15_000)
		return () => clearInterval(id)
	}, [])

	// Forget a time that has gone by.
	useEffect(() => {
		const s = nursingBooking.get()
		const gone = (date: string, time: string | null | undefined) => !!time && slotTooSoon(date, minutesOf(time), policy.assignLeadMinutes)
		if (s.sameTime) {
			if (s.time && s.dates.some((d) => gone(d, s.time))) nursingBooking.set({ time: null })
		} else {
			const keep = Object.fromEntries(Object.entries(s.timesByDate).filter(([d, t]) => !gone(d, t)))
			if (Object.keys(keep).length !== Object.keys(s.timesByDate).length) nursingBooking.set({ timesByDate: keep })
		}
	}, [policy.assignLeadMinutes, tick])

	// A patient with no saved address is asked for one straight away.
	const askForAddress = !addressesLoading && addresses.length === 0 && booking.items.length > 0 && !addressDeclined
	const closeAddress = () => {
		setAddressOpen(false)
		setAddressDeclined(true)
	}

	const isNow = booking.mode === 'now'
	const visits = visitsOf(booking)
	const visitCount = isNow ? 1 : Math.max(booking.dates.length, 1)
	const perVisit = perVisitFee(booking.items)
	const total = isNow ? instantFee(booking.items) : perVisit * visitCount

	const timesMissing = booking.sameTime ? !booking.time : booking.dates.some((d) => !booking.timesByDate[d])
	const blocker = restriction.restricted
		? 'Booking is paused'
		: !patient
			? 'Choose who it is for'
			: !address
				? 'Choose an address'
				: isNow
					? ''
					: booking.dates.length === 0
						? 'Pick a day'
						: timesMissing
							? 'Pick a time'
							: ''

	const when = isNow
		? 'Now · as soon as possible'
		: booking.dates.length === 0 || timesMissing || visits.length === 0
			? null
			: visits.length === 1
				? `${dayLabel(visits[0].date)} · ${chipTime(visits[0].start_time)}`
				: `${visits.length} visits · ${visits.map((v) => v.date.slice(8)).join(', ')} · ${booking.sameTime ? chipTime(booking.time ?? '') : 'times per day'}`

	// Confirming places the order (nothing is charged now, the patient pays after each visit):
	//   - Book now:  POST /patient/requests -> "Finding a nurse" (409 ACTIVE_TASK_EXISTS resumes the request that is already open)
	//   - Later:     POST /requests/scheduled (no nurse chosen; one is assigned to each visit an hour before it starts) -> Booked
	// The server's refusal is shown in its own words (a time that is too soon, a paused account, the address ...).
	const confirm = async () => {
		if (busy) return
		if (!isNow && visits.length === 0) return
		// a time may have gone by while the page was open
		if (!isNow && visits.some((v) => slotTooSoon(v.date, minutesOf(v.start_time), policy.assignLeadMinutes))) {
			toast.info('That time is too soon. Please pick a new one.')
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
					// go first, then clear the cart (an empty cart on this page shows the empty state)
					navigate(carePath(care.key, 'matching', requestId), { replace: true })
					nursingBooking.startOver()
				} catch (e) {
					// one live request at a time: say so and stay here, instead of jumping to the older request (it may already have a nurse)
					if (nursingErrorCode(e) === 'ACTIVE_TASK_EXISTS') {
						toast.info(nursingErrorMessage(e, 'You already have a request in progress. Finish or cancel it from My bookings before booking another.'))
						return
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

	const backLink = (
		<Box component={Link} to={carePath(care.key, 'home')} sx={{ width: 160, fontSize: 14, fontWeight: 800, textDecoration: 'none', color: DESK.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
			<DeskIcon d={DESK_ICONS.chevronLeft} size={16} strokeWidth={2.4} />
			Continue browsing
		</Box>
	)

	if (booking.items.length === 0) {
		return (
			<PatientPageShell>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					{backLink}
				</Box>
				<Box sx={{ ...BOOKING_CARD, p: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
					<Box component="b" sx={{ fontSize: 20 }}>
						Your booking is empty
					</Box>
					<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
						Add a service or a care package to book a {care.noun} visit.
					</Box>
					<Box sx={{ mt: '6px', width: 200 }}>
						<DeskButton label="Browse services" kind="primary" onClick={() => navigate(carePath(care.key, 'home'))} />
					</Box>
				</Box>
			</PatientPageShell>
		)
	}

	return (
		<PatientPageShell>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				{backLink}
			</Box>
			{restriction.restricted ? (
				<Box role="alert" sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.dangerSoft, color: DESK.danger, fontSize: 14, fontWeight: 600 }}>
					{restriction.message || 'Booking is paused for now because of missed visits.'}
				</Box>
			) : null}
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: '24px', alignItems: { xs: 'stretch', lg: 'flex-start' } }}>
				<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
					<WhoSection title="Who is this visit for?" sub={`The ${care.noun} is told who to look after.`} patients={patients} loading={patientsLoading} selectedKey={patient ? bookingPatientKey(patient) : booking.patientKey} onSelect={selectPatient} />
					<NursingWhereSection
						addresses={addresses}
						loading={addressesLoading}
						error={addressError}
						addressId={booking.addressId}
						onAddress={selectAddress}
						onAddAddress={() => setAddressOpen(true)}
					/>
					<NursingWhenSection
						mode={booking.mode}
						onMode={(mode) => nursingBooking.set({ mode })}
						dates={booking.dates}
						onDates={(dates) => nursingBooking.set({ dates: dates.slice(0, MAX_VISITS) })}
						sameTime={booking.sameTime}
						onSameTime={(sameTime) => nursingBooking.set({ sameTime })}
						time={booking.time}
						onTime={(time) => nursingBooking.set({ time })}
						timesByDate={booking.timesByDate}
						onDayTime={(date, time) => nursingBooking.set({ timesByDate: { ...booking.timesByDate, [date]: time } })}
						leadMinutes={policy.assignLeadMinutes}
						visitMinutes={visitMinutes(booking.items)}
					/>
				</Box>
				<NursingSummary
					forWho={patient ? `${patient.name}${patient.isSelf ? ' (you)' : ` · ${patient.relationship}`}` : null}
					where={address ? `${address.label} · ${address.city || address.address_line}` : null}
					when={when}
					whenMissing={booking.dates.length === 0 ? 'Pick a day' : 'Pick a time'}
					items={booking.items}
					perVisit={perVisit}
					visits={visitCount}
					total={total}
					blocker={blocker}
					buttonLabel={isNow ? `Confirm · find a ${care.noun}` : 'Confirm booking'}
					busy={busy}
					onContinue={() => void confirm()}
					addMoreTo={carePath(care.key, 'home')}
					note={{ label: `Note for the ${care.noun}`, value: booking.note, max: MAX_NOTE_LENGTH, onChange: (note) => nursingBooking.set({ note }) }}
					footer={
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
					}
				/>
			</Box>
			{addressOpen || askForAddress ? <AddressDialog sub={`The ${care.noun} visits this address.`} hint={addresses[0]} isFirst={addresses.length === 0} onSave={saveAddress} onClose={closeAddress} /> : null}
		</PatientPageShell>
	)
}
