// src/features/lab/LabCartPage.tsx
//
// Lab tests, step 1 "Cart & slot": who the tests are for, home visit or visit a lab, the address, which lab, the day and time, the tests in
// the cart and the booking summary (design: Desktop 2 and Visit a lab 2). Labs and prices come from /availability and /quote for the chosen
// address; times from /slots. Choosing a time stores lab + slot + that lab's prices in the booking store, which the review page reads.
import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import { ROUTES } from '../../constants/routes'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import LabAddressDialog from './components/LabAddressDialog'
import LabBookingSummary from './components/LabBookingSummary'
import LabCartItems, { type LabCartLine } from './components/LabCartItems'
import LabChoiceList from './components/LabChoiceList'
import LabStepper from './components/LabStepper'
import LabWhenSection from './components/LabWhenSection'
import LabWhereSection, { type LabAvailabilityStatus } from './components/LabWhereSection'
import LabWhoSection from './components/LabWhoSection'
import { labBooking, needsFasting, totalsOf, useLabBooking, type LabWhere } from './labBookingStore'
import { addDays, longDate, plural, timeLabel, toIso } from './labFormat'
import type { ApiQuoteLab, LabServiceType } from './labService'
import { LAB_CARD } from './labStyles'
import LabPageShell from './LabPageShell'
import { addressLineOf, useLabAddresses } from './useLabAddresses'
import { useLabCartCheck } from './useLabCartCheck'
import { labPatientKey, useLabPatients, type LabPatient } from './useLabPatients'
import { useLabSlots } from './useLabSlots'

const DAY_COUNT = 14
const SERVICE_OF: Record<LabWhere, LabServiceType> = { home: 'HOME_SAMPLE', lab: 'CENTER_VISIT' }
const CLEARED_PICK = { lab: null, slot: null, lineAmounts: {}, quoteTotal: null } as const

export default function LabCartPage() {
	const navigate = useNavigate()
	const booking = useLabBooking()
	const { patients, loading: patientsLoading } = useLabPatients()
	const { addresses, loading: addressesLoading, add } = useLabAddresses()
	const [addressOpen, setAddressOpen] = useState(false)
	const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
	const [locating, setLocating] = useState(false)
	const [addressDeclined, setAddressDeclined] = useState(false)

	const days = useMemo(() => Array.from({ length: DAY_COUNT }, (_, i) => toIso(addDays(new Date(), i))), [])
	const [dayIdx, setDayIdx] = useState(() => Math.max(0, days.indexOf(booking.slot?.date ?? '')))
	// The lab the patient clicked (null = none yet: the saved pick, else the cheapest, is used).
	const [chosenLabId, setChosenLabId] = useState<number | null>(booking.lab?.id ?? null)

	// The page can stay open for a long time: drop a time that has gone by.
	useEffect(() => {
		labBooking.dropExpired()
	}, [])

	const patient = patients.find((p) => labPatientKey(p) === booking.patientKey) ?? patients[0]
	const address = addresses.find((a) => a.id === booking.addressId) ?? addresses[0]

	// Keep the booking store in step with who / where is shown as chosen (the review, booked and order pages read the store).
	const patientKey = patient ? labPatientKey(patient) : null
	const patientName = patient?.name
	const patientRelation = patient?.relationship
	const addressId = address?.id
	const addressTag = address?.label
	const addressText = address ? addressLineOf(address) : ''
	useEffect(() => {
		labBooking.set({
			...(patientKey && patientName ? { patientKey, patientName, patientRelation: patientRelation ?? 'Self' } : {}),
			// until the addresses have loaded `address` is missing: keep what the store holds
			...(addressId ? { addressId, addressTag: addressTag ?? '', addressLine: addressText } : {}),
		})
	}, [patientKey, patientName, patientRelation, addressId, addressTag, addressText])

	// A patient with no saved address is asked for one straight away.
	const askForAddress = !addressesLoading && addresses.length === 0 && booking.cart.length > 0 && !addressDeclined
	const closeAddress = () => {
		setAddressOpen(false)
		setAddressDeclined(true)
		setCoords(null)
	}

	// "Use current location": the browser's position starts a new address (the street and PIN code are still typed).
	const useCurrentLocation = () => {
		if (!navigator.geolocation) {
			toast.error('Your browser cannot share your location. Please type the address.')
			return
		}
		setLocating(true)
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setLocating(false)
				setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude })
				setAddressOpen(true)
			},
			() => {
				setLocating(false)
				toast.error('We could not get your location. Allow location access, or type the address.')
			},
			{ timeout: 10_000 }
		)
	}

	const { check, loading: checking, error: checkError, retry } = useLabCartCheck(booking.addressId, booking.cart)
	const isHome = booking.where === 'home'
	const service = SERVICE_OF[booking.where]
	const labs = useMemo<ApiQuoteLab[]>(
		() => (check ? check.quote.labs.filter((l) => l.services.includes(service)) : []),
		[check, service]
	)

	// The chosen lab, kept valid when the labs change (other cart, address or visit type): the click, else the saved pick, else the cheapest.
	const savedLabId = booking.lab?.id
	const labId = (() => {
		if (chosenLabId != null && labs.some((l) => l.lab_id === chosenLabId)) return chosenLabId
		if (savedLabId != null && labs.some((l) => l.lab_id === savedLabId)) return savedLabId
		return labs[0]?.lab_id ?? null
	})()

	const date = days[dayIdx]
	const slots = useLabSlots({
		addressId: booking.addressId,
		cart: booking.cart,
		service,
		date,
		nextDate: days[Math.min(dayIdx + 1, DAY_COUNT - 1)],
		enabled: labs.length > 0,
	})

	const selectedLab = labs.find((l) => l.lab_id === labId)
	const times = labId != null ? (slots.timesByLab[labId] ?? []) : []
	const picked = booking.lab && booking.slot && booking.quoteTotal != null ? { lab: booking.lab, slot: booking.slot } : null
	const selectedTime = booking.lab?.id === labId && booking.slot?.date === date ? booking.slot.time : null

	const pickLab = (lab: ApiQuoteLab) => {
		setChosenLabId(lab.lab_id)
		// the picked time belongs to the other lab: forget it so the summary never shows a lab and time that do not go together
		if (booking.lab && booking.lab.id !== lab.lab_id) labBooking.set({ ...CLEARED_PICK })
	}

	const pickSlot = (time: string) => {
		if (!selectedLab) return
		const lineAmounts: Record<string, { price: number; mrp: number }> = {}
		selectedLab.items.forEach((i) => {
			lineAmounts[i.item_id] = { price: Number(i.price), mrp: Number(i.mrp) }
		})
		labBooking.set({
			lab: {
				id: selectedLab.lab_id,
				name: selectedLab.lab_name ?? 'Lab',
				logoUrl: selectedLab.logo_url ?? slots.logos[selectedLab.lab_id] ?? null,
				distanceKm: slots.distances[selectedLab.lab_id] ?? null,
			},
			slot: { date, time },
			lineAmounts,
			quoteTotal: Number(selectedLab.total),
		})
	}

	const selectPatient = (p: LabPatient) =>
		labBooking.set({ patientKey: labPatientKey(p), patientName: p.name, patientRelation: p.relationship })

	const saveAddress = async (payload: Parameters<typeof add>[0]) => {
		const saved = await add(payload)
		if (saved) labBooking.set({ addressId: saved.id, addressTag: saved.label, addressLine: addressLineOf(saved) })
		return saved
	}

	// ---- derived text -------------------------------------------------------------------------------------

	const { items, total: pickedTotal, mrp: pickedMrp } = totalsOf(booking)
	const quoteLab = selectedLab ?? labs[0]
	const estimate = picked ? pickedTotal : quoteLab ? Number(quoteLab.total) : items.reduce((n, i) => n + i.price, 0)
	const estimateMrp = picked ? pickedMrp : quoteLab ? Number(quoteLab.total_mrp) : items.reduce((n, i) => n + i.mrp, 0)

	const lines: LabCartLine[] = items.map((item) => {
		if (picked) return { item, price: item.price, mrp: item.mrp, fromPrice: false }
		const here = quoteLab?.items.find((q) => q.item_id === item.id)
		return here
			? { item, price: Number(here.price), mrp: Number(here.mrp), fromPrice: false }
			: { item, price: item.price, mrp: item.mrp, fromPrice: true }
	})

	// Why nothing can be booked, in words: items no lab serves here, else "no one lab does all of these".
	const unserved = check ? check.availability.per_item.filter((p) => p.lab_ids.length === 0).map((p) => p.name) : []
	const status: LabAvailabilityStatus | null = (() => {
		if (!booking.addressId) return { kind: 'info', text: 'Choose an address to check availability.' }
		if (checking) return { kind: 'loading', text: 'Checking availability at your address…' }
		if (checkError) return { kind: 'error', text: checkError, onRetry: retry }
		if (!check) return null
		if (!check.availability.serviceable) {
			return {
				kind: 'warn',
				text: unserved.length
					? `Not available at your address: ${unserved.join(', ')}. Remove ${unserved.length === 1 ? 'it' : 'them'} to continue.`
					: 'No single lab can do all of these tests at your address. Try booking them separately.',
			}
		}
		if (labs.length === 0) {
			return {
				kind: 'warn',
				text: isHome
					? 'No lab offers home collection for these tests at your address. Try a lab visit.'
					: 'No lab offers a visit for these tests near your address. Try a home visit.',
			}
		}
		return {
			kind: 'ok',
			text: `${plural(labs.length, 'lab', 'labs')} can ${isHome ? 'collect the sample at your address' : 'see you'}.`,
		}
	})()

	const blocker = !patient
		? 'Choose who it is for'
		: !booking.addressId
			? 'Choose an address'
			: checking
				? 'Checking availability…'
				: labs.length === 0
					? 'No lab available'
					: !picked
						? 'Pick a time to continue'
						: ''

	const goNext = () => {
		const had = labBooking.get().slot
		labBooking.dropExpired()
		if (had && !labBooking.get().slot) {
			toast.info('That time has passed. Please pick a new one.')
			return
		}
		navigate(ROUTES.LAB.REVIEW)
	}

	const whenSub = isHome
		? 'Pick a day and a time. We will call before arriving.'
		: selectedLab
			? `Times at ${selectedLab.lab_name ?? 'this lab'}`
			: 'Choose a lab above to see its times.'

	const backLink = (
		<Box
			component={Link}
			to={ROUTES.LAB.HOME}
			sx={{ width: 160, fontSize: 14, fontWeight: 800, textDecoration: 'none', color: DESK.primary, display: 'flex', alignItems: 'center', gap: '6px' }}
		>
			<DeskIcon d={DESK_ICONS.chevronLeft} size={16} strokeWidth={2.4} />
			Continue browsing
		</Box>
	)

	if (booking.cart.length === 0) {
		return (
			<LabPageShell>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					{backLink}
					<LabStepper current={1} />
					<Box sx={{ width: 160 }} />
				</Box>
				<Box
					sx={{ ...LAB_CARD, p: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
				>
					<Box component="b" sx={{ fontSize: 20 }}>
						Your cart is empty
					</Box>
					<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
						Add a test or package to book a home collection or a lab visit.
					</Box>
					<Box sx={{ mt: '6px', width: 200 }}>
						<DeskButton label="Browse tests" kind="primary" onClick={() => navigate(ROUTES.LAB.HOME)} />
					</Box>
				</Box>
			</LabPageShell>
		)
	}

	return (
		<LabPageShell>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				{backLink}
				<LabStepper current={1} />
				<Box sx={{ width: 160 }} />
			</Box>
			<Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
				<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
					<LabWhoSection
						patients={patients}
						loading={patientsLoading}
						selectedKey={patient ? labPatientKey(patient) : booking.patientKey}
						onSelect={selectPatient}
					/>
					<LabWhereSection
						where={booking.where}
						onWhere={(where) => labBooking.set({ where })}
						addresses={addresses}
						addressesLoading={addressesLoading}
						addressId={booking.addressId}
						onAddress={(a) => labBooking.set({ addressId: a.id, addressTag: a.label, addressLine: addressLineOf(a) })}
						onAddAddress={() => setAddressOpen(true)}
						onUseCurrentLocation={useCurrentLocation}
						locating={locating}
						status={status}
					>
						<LabChoiceList labs={labs} labId={labId} onPick={pickLab} isHome={isHome} logos={slots.logos} distances={slots.distances} />
					</LabWhereSection>
					<LabWhenSection
						sub={whenSub}
						days={days}
						dayIdx={dayIdx}
						onDay={setDayIdx}
						fasting={needsFasting(booking)}
						hasLab={!!selectedLab}
						times={times}
						loading={slots.loading}
						error={slots.error}
						onRetry={slots.retry}
						selectedTime={selectedTime}
						onPick={pickSlot}
					/>
					<LabCartItems lines={lines} />
				</Box>
				<LabBookingSummary
					forWho={patient ? `${patient.name}${patient.isSelf ? ' (you)' : ` · ${patient.relationship}`}` : null}
					where={isHome ? (address ? `${address.label} · ${address.city || address.address_line}` : null) : (selectedLab?.lab_name ?? null)}
					when={picked ? `${longDate(picked.slot.date)} · ${timeLabel(picked.slot.time)}` : null}
					isHome={isHome}
					count={items.length}
					mrp={estimateMrp}
					savings={Math.max(0, estimateMrp - estimate)}
					total={estimate}
					blocker={blocker}
					onContinue={goNext}
				/>
			</Box>
			{addressOpen || askForAddress ? (
				<LabAddressDialog
					hint={addresses[0]}
					isFirst={addresses.length === 0}
					coords={coords}
					onSave={saveAddress}
					onClose={closeAddress}
				/>
			) : null}
		</LabPageShell>
	)
}
