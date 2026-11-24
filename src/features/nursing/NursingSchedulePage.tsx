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
import LabPageShell from '../lab/LabPageShell'
import { LAB_CARD } from '../lab/labStyles'
import NursingAddressDialog from './components/NursingAddressDialog'
import NursingStepper from './components/NursingStepper'
import NursingSummary from './components/NursingSummary'
import NursingWhenSection from './components/NursingWhenSection'
import NursingWhereSection from './components/NursingWhereSection'
import NursingWhoSection from './components/NursingWhoSection'
import { instantFee, nursingBooking, perVisitFee, visitsOf } from './nursingBookingStore'
import { MAX_VISITS } from './nursingService'
import { chipTime, dayLabel, minutesOf, slotTooSoon } from './nursingTime'
import { useBookingPeople, useBookingRestriction } from './useBookingPeople'
import { useNursingConfig } from './useNursingCatalogue'
import { useCurrentLocation, type Coords } from './useVisitAddress'
import { labPatientKey } from '../lab/useLabPatients'
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
	const { booking, patients, patientsLoading, patient, addresses, addressesLoading, addressError, address, selectPatient, selectAddress, saveAddress } = useBookingPeople()
	const [addressOpen, setAddressOpen] = useState(false)
	const [coords, setCoords] = useState<Coords | null>(null)
	const [addressDeclined, setAddressDeclined] = useState(false)
	const { locating, start: startLocating } = useCurrentLocation((found) => {
		setCoords(found)
		setAddressOpen(true)
	})

	// The page can stay open for a long time: forget a time that has gone by.
	useEffect(() => {
		const s = nursingBooking.get()
		const gone = (date: string, time: string | null | undefined) => !!time && slotTooSoon(date, minutesOf(time), policy.assignLeadMinutes)
		if (s.sameTime) {
			if (s.time && s.dates.some((d) => gone(d, s.time))) nursingBooking.set({ time: null })
		} else {
			const keep = Object.fromEntries(Object.entries(s.timesByDate).filter(([d, t]) => !gone(d, t)))
			if (Object.keys(keep).length !== Object.keys(s.timesByDate).length) nursingBooking.set({ timesByDate: keep })
		}
	}, [policy.assignLeadMinutes])

	// A patient with no saved address is asked for one straight away.
	const askForAddress = !addressesLoading && addresses.length === 0 && booking.items.length > 0 && !addressDeclined
	const closeAddress = () => {
		setAddressOpen(false)
		setAddressDeclined(true)
		setCoords(null)
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

	const goNext = () => {
		if (!isNow && visits.length === 0) return
		// a time may have gone by while the page was open
		if (!isNow && visits.some((v) => slotTooSoon(v.date, minutesOf(v.start_time), policy.assignLeadMinutes))) {
			toast.info('That time is too soon. Please pick a new one.')
			return
		}
		navigate(carePath(care.key, 'review'))
	}

	const backLink = (
		<Box component={Link} to={carePath(care.key, 'home')} sx={{ width: 160, fontSize: 14, fontWeight: 800, textDecoration: 'none', color: DESK.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
			<DeskIcon d={DESK_ICONS.chevronLeft} size={16} strokeWidth={2.4} />
			Continue browsing
		</Box>
	)

	if (booking.items.length === 0) {
		return (
			<LabPageShell>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					{backLink}
					<NursingStepper current={1} />
					<Box sx={{ width: 160 }} />
				</Box>
				<Box sx={{ ...LAB_CARD, p: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
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
			</LabPageShell>
		)
	}

	return (
		<LabPageShell>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				{backLink}
				<NursingStepper current={1} />
				<Box sx={{ width: 160 }} />
			</Box>
			{restriction.restricted ? (
				<Box role="alert" sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.dangerSoft, color: DESK.danger, fontSize: 14, fontWeight: 600 }}>
					{restriction.message || 'Booking is paused for now because of missed visits.'}
				</Box>
			) : null}
			<Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
				<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
					<NursingWhoSection patients={patients} loading={patientsLoading} selectedKey={patient ? labPatientKey(patient) : booking.patientKey} onSelect={selectPatient} />
					<NursingWhereSection
						addresses={addresses}
						loading={addressesLoading}
						error={addressError}
						addressId={booking.addressId}
						onAddress={selectAddress}
						onAddAddress={() => setAddressOpen(true)}
						onUseCurrentLocation={() => void startLocating()}
						locating={locating}
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
					buttonLabel="Review booking"
					onContinue={goNext}
				/>
			</Box>
			{addressOpen || askForAddress ? <NursingAddressDialog hint={addresses[0]} isFirst={addresses.length === 0} coords={coords} onSave={saveAddress} onClose={closeAddress} /> : null}
		</LabPageShell>
	)
}
