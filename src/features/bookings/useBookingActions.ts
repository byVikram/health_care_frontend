// src/features/bookings/useBookingActions.tsx
//
// What the buttons of a booking's detail panel do on the WEB. Only bookings that have a web page get buttons:
//   doctor appointment (still open)  Get directions / View details, Reschedule (the drawer), Cancel (a reason, then the status call)
//   doctor appointment (closed)      the server's own buttons: Visit summary / View details -> the appointment page, Book again -> search
//   pharmacy order                   View order / Track / View report -> the order page
//   lab booking                      View / Track / Reschedule / Cancel -> the lab order page; View report -> its report page;
//                                    Book again -> the lab tests
//   home care the web books          nursing, physiotherapy, rehab, home care, medical equipment: Track / View details / Book again -> that service's order page
//   other home care                  nothing to press: managed in the app (the panel says so)
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ROUTES } from '../../constants/routes'
import { carePath, careKeyOf, type CareServiceKey } from '../nursing/careServices'
import { getAppointmentById, getAppointmentStatusId, updateAppointmentsStatus } from '../../services/appointmentService'
import { DESK_ICONS } from '../../styles/deskTokens'
import type { DeskButtonKind } from '../../components/common/Button/DeskButton'
import type { BookingAction, BookingItem } from './bookingsTypes'
import { bookingKey, isChangeableAppointment, mapsUrl, placeOf } from './bookingListUtils'
import { useRescheduleFlow } from './useRescheduleFlow'

export interface PanelAction {
	key: string
	label: string
	kind: DeskButtonKind
	icon?: string
	/** A link (opened in a new tab) instead of a click handler. */
	href?: string
	run?: () => void
	loading?: boolean
}

/** The home-care service of a booking when the web has a booking flow for it (nursing, physiotherapy, rehab, home care, medical equipment), else null. */
export const careKeyOfBooking = (item: BookingItem) => (item.category === 'ancillary' ? careKeyOf(item.service?.key) : null)
export const isNursing = (item: BookingItem) => careKeyOfBooking(item) !== null

export const CANCEL_REASONS = [
	'Feeling better',
	'Booked by mistake',
	'Found another time',
	'Doctor not convenient',
	'Other reason',
] as const

// Medicines are ordered through LabStack now and no pincode is served yet.
const MEDICINES_SOON = 'Medicine delivery is coming soon in your area.'

export function useBookingActions(onChanged: () => void) {
	const navigate = useNavigate()
	const reschedule = useRescheduleFlow(onChanged)
	const [busyKey, setBusyKey] = useState<string | null>(null)
	const [cancelItem, setCancelItem] = useState<BookingItem | null>(null)
	const [cancelBusy, setCancelBusy] = useState(false)

	const openDetail = (item: BookingItem) => {
		if (item.category === 'pharmacy') toast.info(MEDICINES_SOON)
		else if (item.category === 'lab') navigate(ROUTES.LAB.ORDER.replace(':orderId', item.target.id))
		else if (careKeyOfBooking(item)) navigate(carePath(careKeyOfBooking(item) as CareServiceKey, 'order', item.target.id))
		else navigate(ROUTES.PORTAL.APPOINTMENT_DETAIL.replace(':appointmentId', item.target.id))
	}

	const startReschedule = async (item: BookingItem) => {
		const key = `${bookingKey(item)}:reschedule`
		setBusyKey(key)
		try {
			reschedule.start(await getAppointmentById(item.target.id))
		} catch (err) {
			// the shared API client has already shown the server's reason
			if (!axios.isAxiosError(err)) toast.error('Could not open the reschedule options. Please try again.')
		} finally {
			setBusyKey(null)
		}
	}

	const confirmCancel = async (reason: string, note: string) => {
		if (!cancelItem) return
		setCancelBusy(true)
		try {
			const res = await updateAppointmentsStatus(
				cancelItem.target.id,
				await getAppointmentStatusId('cancelled'),
				note ? `${reason}: ${note}` : reason
			)
			if (res.success) {
				toast.success(res.message || 'Booking cancelled')
				setCancelItem(null)
				onChanged()
			} else {
				toast.error(res.message || 'Failed to cancel the booking')
			}
		} catch (err) {
			if (!axios.isAxiosError(err)) toast.error('Something went wrong. Please try again.')
		} finally {
			setCancelBusy(false)
		}
	}

	/** One of the server's own buttons, mapped to what it does on the web. */
	const serverAction = (item: BookingItem, action: BookingAction, kind: DeskButtonKind): PanelAction => {
		if (action.key === 'book_again') {
			if (item.category === 'pharmacy') return { key: action.key, label: action.label, kind, run: () => toast.info(MEDICINES_SOON) }
			const careKey = careKeyOfBooking(item)
			const to = item.category === 'lab' ? ROUTES.LAB.HOME : careKey ? carePath(careKey, 'home') : ROUTES.DOCTORS.SEARCH
			return { key: action.key, label: action.label, kind, run: () => navigate(to) }
		}
		if (action.key === 'view_report' && item.category === 'lab') {
			return {
				key: action.key,
				label: action.label,
				kind,
				run: () => navigate(ROUTES.LAB.REPORT.replace(':orderId', item.target.id)),
			}
		}
		return { key: action.key, label: action.label, kind, run: () => openDetail(item) }
	}

	const directionsOf = (item: BookingItem): string | null => {
		const asked = [item.actions.primary?.key, item.actions.secondary?.key].includes('directions')
		const place = placeOf(item.where)
		return asked && place ? mapsUrl(place) : null
	}

	/** The buttons of the detail panel, top to bottom. Empty when the booking is managed in the app. */
	const actionsFor = (item: BookingItem): PanelAction[] => {
		if (item.category === 'doctor' && isChangeableAppointment(item)) {
			const directions = directionsOf(item)
			const first: PanelAction = directions
				? { key: 'directions', label: 'Get directions ↗', kind: 'primary', href: directions }
				: { key: 'view', label: 'View details', kind: 'primary', run: () => openDetail(item) }
			return [
				first,
				{
					key: 'reschedule',
					label: 'Reschedule',
					kind: 'secondary',
					loading: busyKey === `${bookingKey(item)}:reschedule`,
					run: () => void startReschedule(item),
				},
				{
					key: 'cancel',
					label: 'Cancel',
					kind: 'danger',
					icon: DESK_ICONS.close,
					run: () => setCancelItem(item),
				},
			]
		}
		if (item.category === 'doctor' || item.category === 'pharmacy' || item.category === 'lab' || isNursing(item)) {
			const out: PanelAction[] = []
			if (item.actions.primary) out.push(serverAction(item, item.actions.primary, 'primary'))
			if (item.actions.secondary) out.push(serverAction(item, item.actions.secondary, 'secondary'))
			// a lab or nursing booking always has its order page to open
			if ((item.category === 'lab' || isNursing(item)) && out.length === 0) {
				out.push({ key: 'view', label: item.category === 'lab' ? 'View order' : 'View booking', kind: 'primary', run: () => openDetail(item) })
			}
			return out
		}
		return []
	}

	/** A small "View details" link under the buttons, for an open appointment whose first button is Get directions. */
	const detailLinkFor = (item: BookingItem): (() => void) | null =>
		item.category === 'doctor' && isChangeableAppointment(item) && directionsOf(item)
			? () => openDetail(item)
			: null

	return {
		actionsFor,
		detailLinkFor,
		openDetail,
		cancel: {
			item: cancelItem,
			busy: cancelBusy,
			close: () => setCancelItem(null),
			confirm: confirmCancel,
		},
		drawerProps: reschedule.drawerProps,
	}
}
