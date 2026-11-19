// src/features/lab/LabReviewPage.tsx
//
// Step 2 of the lab booking, "Review & pay" (desktop designs 3 and "Visit a lab · 3"): what the patient pays with, and on the right the
// amount, when and where, who the tests are for and the bill. Payment is on collection only (the backend takes no online payment), so
// "Pay with" has the one option, the button places the order, and the order is booked without a payment step.
import { Box } from '@mui/material'
import axios from 'axios'
import { useEffect, useState, type ChangeEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import { ROUTES } from '../../constants/routes'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import LabReviewSummary from './components/LabReviewSummary'
import LabStepper from './components/LabStepper'
import { LAB_ICONS } from './labConstants'
import { commaDate, inr, timeLabel } from './labFormat'
import { labBooking, totalsOf, useLabBooking } from './labBookingStore'
import { orderFromApi } from './labOrder'
import { labErrorMessage, placeOrder } from './labService'
import LabPageShell from './LabPageShell'

const NOTE_MAX = 300

export default function LabReviewPage() {
	const navigate = useNavigate()
	const booking = useLabBooking()
	const [note, setNote] = useState(() => labBooking.get().note)
	const [placing, setPlacing] = useState(false)
	const [problem, setProblem] = useState<{ message: string; conflict: boolean } | null>(null)

	// Re-check on open: the picked time may have gone by while the page was away. Payment is on collection, nothing to choose.
	useEffect(() => {
		const had = labBooking.get().slot
		labBooking.dropExpired()
		if (had && !labBooking.get().slot) toast.info('That time has passed. Please pick a new one.')
		if (labBooking.get().method !== 'later') labBooking.set({ method: 'later' })
	}, [])

	// An order already placed from this cart: never place a second one (Back from the confirmation lands here).
	if (booking.order) return <Navigate to={ROUTES.LAB.BOOKED} replace />
	if (booking.cart.length === 0) return <Navigate to={ROUTES.LAB.HOME} replace />
	if (!booking.addressId || !booking.lab || !booking.slot || booking.quoteTotal == null || !booking.patientName) {
		return <Navigate to={ROUTES.LAB.CART} replace />
	}

	const isHome = booking.where === 'home'
	const { items, total, savings } = totalsOf(booking)
	const { lab, slot } = booking
	const payLabel = isHome ? 'Pay at collection' : 'Pay at the lab'
	const paySub = isHome ? 'Cash or UPI when we visit' : 'Cash, card or UPI at the front desk'
	const payNote = isHome
		? `Your slot is held now. Keep ${inr(total)} ready for the phlebotomist · nothing to pay now.`
		: `Your slot is held now. Pay ${inr(total)} at ${lab.name} when you arrive · nothing to pay now.`

	const place = async () => {
		const b = labBooking.get()
		if (!b.lab || !b.slot || !b.addressId || b.quoteTotal == null || placing) return
		setPlacing(true)
		setProblem(null)
		try {
			const trimmed = note.trim()
			const api = await placeOrder({
				patientId: b.patientKey === 'self' ? undefined : b.patientKey,
				addressId: b.addressId,
				itemIds: b.cart,
				labId: b.lab.id,
				service: b.where === 'home' ? 'HOME_SAMPLE' : 'CENTER_VISIT',
				date: b.slot.date,
				time: b.slot.time,
				expectedTotal: b.quoteTotal,
				note: trimmed,
			})
			labBooking.set({ order: orderFromApi(api, { ...b, note: trimmed }) })
			// replace: Back from the confirmation must not return here and place a second order
			navigate(ROUTES.LAB.BOOKED, { replace: true })
		} catch (err) {
			setProblem({ message: labErrorMessage(err), conflict: axios.isAxiosError(err) && err.response?.status === 409 })
		} finally {
			setPlacing(false)
		}
	}

	return (
		<LabPageShell>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Box
					component={Link}
					to={ROUTES.LAB.CART}
					sx={{
						width: 160,
						fontSize: 14,
						fontWeight: 800,
						color: DESK.primary,
						textDecoration: 'none',
						display: 'flex',
						alignItems: 'center',
						gap: '4px',
					}}
				>
					<DeskIcon d={DESK_ICONS.chevronLeft} size={16} strokeWidth={2.4} />
					Back to cart &amp; slot
				</Box>
				<LabStepper current={2} />
				<Box sx={{ width: 160 }} />
			</Box>

			<Box sx={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
				<Box
					component="section"
					sx={{
						flexGrow: 1,
						minWidth: 0,
						bgcolor: DESK.raised,
						border: '1px solid #E3EAEB',
						borderRadius: '18px',
						p: '24px',
						display: 'flex',
						flexDirection: 'column',
						gap: '12px',
					}}
				>
					<Box component="h1" sx={{ m: '0 0 4px', fontSize: 24, fontWeight: 800 }}>
						Pay with
					</Box>
					<Box
						role="radiogroup"
						aria-label="Payment method"
						sx={{ borderRadius: '14px', border: `1.5px solid ${DESK.primary}`, bgcolor: '#FBFDFD', overflow: 'hidden' }}
					>
						<Box
							role="radio"
							aria-checked
							sx={{ p: '16px', display: 'flex', alignItems: 'center', gap: '14px', color: DESK.ink }}
						>
							<Box
								component="span"
								sx={{
									width: 42,
									height: 42,
									borderRadius: '11px',
									bgcolor: DESK.primarySoft,
									color: DESK.primary,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<DeskIcon d={LAB_ICONS.cash} size={20} />
							</Box>
							<Box component="span" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
								<Box component="b" sx={{ fontSize: 16 }}>
									{payLabel}
								</Box>
								<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
									{paySub}
								</Box>
							</Box>
							<Box
								component="span"
								sx={{ width: 22, height: 22, boxSizing: 'border-box', borderRadius: '9999px', border: `6px solid ${DESK.primary}` }}
							/>
						</Box>
						<Box component="p" sx={{ m: 0, p: '0 16px 18px 72px', fontSize: 14, lineHeight: '20px', color: DESK.muted }}>
							{payNote}
						</Box>
					</Box>

					<Box component="label" sx={{ mt: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 13, fontWeight: 700 }}>
						Note for the {isHome ? 'phlebotomist' : 'lab'} (optional)
						<Box
							component="textarea"
							rows={3}
							maxLength={NOTE_MAX}
							value={note}
							onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
							placeholder={isHome ? 'e.g. Ring the bell twice, third floor' : 'e.g. I need a wheelchair at the entrance'}
							sx={{
								boxSizing: 'border-box',
								width: '100%',
								p: '10px 12px',
								border: `1.5px solid ${DESK.field}`,
								borderRadius: '10px',
								fontFamily: 'inherit',
								fontSize: 15,
								lineHeight: '22px',
								color: DESK.ink,
								resize: 'vertical',
							}}
						/>
						<Box component="span" sx={{ fontSize: 12, fontWeight: 500, color: DESK.muted }}>
							Don&apos;t put health details here.
						</Box>
					</Box>
				</Box>

				<Box
					component="aside"
					sx={{ position: 'sticky', top: 88, width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}
				>
					<LabReviewSummary
						total={total}
						savings={savings}
						whenTime={timeLabel(slot.time)}
						whenDate={commaDate(slot.date)}
						whereTitle={isHome ? 'At home' : lab.name}
						whereSub={
							isHome
								? booking.addressLine
								: lab.distanceKm != null
									? `${lab.distanceKm.toFixed(1)} km away`
									: ''
						}
						patientName={booking.patientName}
						patientRelation={booking.patientRelation}
						items={items.map((i) => ({ id: i.id, name: i.name, price: i.price }))}
						isHome={isHome}
					/>
					{problem ? (
						<Box
							role="alert"
							sx={{
								p: '12px 14px',
								borderRadius: '12px',
								bgcolor: DESK.dangerSoft,
								color: DESK.danger,
								fontSize: 13,
								lineHeight: '18px',
								fontWeight: 600,
								display: 'flex',
								flexDirection: 'column',
								gap: '8px',
							}}
						>
							{problem.message}
							{problem.conflict ? (
								<Box
									component={Link}
									to={ROUTES.LAB.CART}
									sx={{ color: DESK.danger, fontWeight: 800, textDecoration: 'underline', alignSelf: 'flex-start' }}
								>
									Back to cart &amp; slot
								</Box>
							) : null}
						</Box>
					) : null}
					<Box sx={{ '& button': { height: 54, fontSize: 16, borderRadius: '12px' } }}>
						<DeskButton
							label={placing ? 'Placing your order…' : 'Place order'}
							kind="primary"
							icon={DESK_ICONS.check}
							loading={placing}
							onClick={() => void place()}
						/>
					</Box>
					<Box component="span" sx={{ textAlign: 'center', fontSize: 12, color: DESK.muted }}>
						By placing this order you agree to the booking terms.
					</Box>
				</Box>
			</Box>
		</LabPageShell>
	)
}
