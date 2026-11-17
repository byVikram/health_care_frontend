// src/features/schedule/useScheduleActions.tsx
//
// What a doctor can do from the Schedule page, in one place: check a patient in, start a consultation, mark a no-show, cancel, ask the
// patient to reschedule, accept / decline / refer a booking request. Every call reuses the service functions the older appointments list
// uses; the server decides each one and answers with the reason when it refuses. The hook returns the handlers and the `dialogs` element
// (the confirmations) that the page renders once. `onChanged` is called after anything that changed an appointment, to read the lists again.
import { useState, type ReactElement } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import type { Appointment } from '../../types/appointment'
import {
	askPatientToReschedule,
	getAppointmentStatusId,
	setAppointmentCheckIn,
	updateAppointmentsStatus,
} from '../../services/appointmentService'
import AppointmentActionDialog, { type ActionMode } from '../doctor/components/AppointmentActionDialog'
import AskPatientRescheduleDialog from '../doctor/components/AskPatientRescheduleDialog'
import ReasonDialog from '../../components/common/Modal/ReasonDialog'
import useStartConsultation from '../doctor/useStartConsultation'
import ReferDialog from './ReferDialog'
import { dayLabel, noShowWindow } from '../doctor/appointmentRules'
import { formatTime12h, isVideoMode } from './scheduleUtils'
import type { RowMain, ScheduleRowVM } from './scheduleView'

/** Why a booking request is declined: the doctor picks one and the patient sees it. */
const DECLINE_REASONS = [
	'Not my speciality',
	'Refer to another doctor',
	'Needs emergency care, not a clinic visit',
	'Fully booked that day',
	'Other reason',
] as const

const slotLabelOf = (apt: Appointment | null) =>
	apt
		? `${dayLabel(apt.appointment_date)}, ${formatTime12h(apt.start_time)} Â· ${isVideoMode(apt.appointment_mode) ? 'Video call' : 'In-clinic'}`
		: ''

// A failed call has already shown the server's reason (the shared API client toasts it); anything else gets a generic message.
const reportFailure = (err: unknown) => {
	if (!axios.isAxiosError(err)) toast.error('Something went wrong. Please try again.')
}
// An answer that is not an error but says it did not work: the doctor is told, never left looking at a button that did nothing.
const reportRefusal = (message?: string) => toast.error(message || 'That did not go through. Please try again.')

export interface ScheduleActions {
	/** The appointments with a call in flight (their buttons spin). */
	busyIds: Set<string>
	runMain: (vm: ScheduleRowVM, main: RowMain) => void
	openSummary: (apt: Appointment) => void
	askCancel: (apt: Appointment) => void
	askNoShow: (apt: Appointment) => void
	askReschedule: (apt: Appointment) => void
	accept: (apt: Appointment) => void
	askDecline: (apt: Appointment) => void
	askRefer: (apt: Appointment) => void
	dialogs: ReactElement
}

export default function useScheduleActions(onChanged: () => void): ScheduleActions {
	const consultation = useStartConsultation()
	const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
	const [actionTarget, setActionTarget] = useState<{ appt: Appointment; mode: ActionMode } | null>(null)
	const [actionBusy, setActionBusy] = useState(false)
	const [askTarget, setAskTarget] = useState<Appointment | null>(null)
	const [askBusy, setAskBusy] = useState(false)
	const [declineTarget, setDeclineTarget] = useState<Appointment | null>(null)
	const [declineBusy, setDeclineBusy] = useState(false)
	const [referTarget, setReferTarget] = useState<Appointment | null>(null)

	const markBusy = (id: string, busy: boolean) =>
		setBusyIds((ids) => {
			const next = new Set(ids)
			if (busy) next.add(id)
			else next.delete(id)
			return next
		})

	const checkIn = async (apt: Appointment): Promise<boolean> => {
		try {
			const res = await setAppointmentCheckIn(apt.id, true)
			if (res.success) {
				toast.success(res.message)
				return true
			}
			reportRefusal(res.message)
		} catch (err) {
			reportFailure(err)
		}
		return false
	}

	const runMain = async (vm: ScheduleRowVM, main: RowMain) => {
		const apt = vm.appt
		const patientId = apt.patient?.id
		markBusy(apt.id, true)
		try {
			if (main.kind === 'checkIn') {
				if (await checkIn(apt)) onChanged()
				return
			}
			if (!patientId) return
			if (main.kind === 'open') {
				consultation.goToConsultation(apt.id, patientId)
				return
			}
			// A consultation can only be started for a patient who has been checked in: a video visit has no front desk, so Start
			// video checks the patient in first.
			if (main.kind === 'startVideo' && !(await checkIn(apt))) return
			await consultation.start(apt.id, patientId)
			onChanged()
		} finally {
			markBusy(apt.id, false)
		}
	}

	const openSummary = (apt: Appointment) => {
		if (apt.patient?.id) consultation.goToConsultation(apt.id, apt.patient.id)
	}

	// Cancel or no-show: both are a status change; the cancel carries the doctor's reason.
	const changeStatus = async (label: 'cancelled' | 'no_show', reason?: string) => {
		if (!actionTarget) return
		const id = actionTarget.appt.id
		setActionBusy(true)
		try {
			const res = await updateAppointmentsStatus(id, await getAppointmentStatusId(label), reason)
			if (res.success) {
				toast.success(res.message)
				setActionTarget(null)
				onChanged()
			} else reportRefusal(res.message)
		} catch (err) {
			reportFailure(err)
		} finally {
			setActionBusy(false)
		}
	}

	// The doctor does not pick a slot: the patient is asked to choose a new time (the status becomes reschedule_required and the
	// patient is emailed); the doctor confirms the time they pick later, as for any patient reschedule.
	const askPatient = async (reason: string) => {
		if (!askTarget) return
		const id = askTarget.id
		setAskBusy(true)
		try {
			const res = await askPatientToReschedule(id, reason)
			if (res.success) {
				toast.success(res.message || 'The patient has been asked to choose a new time')
				setAskTarget(null)
				onChanged()
			} else reportRefusal(res.message)
		} catch (err) {
			reportFailure(err)
		} finally {
			setAskBusy(false)
		}
	}

	const accept = async (apt: Appointment) => {
		markBusy(apt.id, true)
		try {
			const res = await updateAppointmentsStatus(apt.id, await getAppointmentStatusId('confirmed'))
			if (res.success) {
				toast.success(res.message || `${apt.patient?.name ?? 'The patient'} confirmed`)
				onChanged()
			} else reportRefusal(res.message)
		} catch (err) {
			reportFailure(err)
		} finally {
			markBusy(apt.id, false)
		}
	}

	const decline = async (reason: string, note: string) => {
		if (!declineTarget) return
		const id = declineTarget.id
		setDeclineBusy(true)
		try {
			// The patient sees the reason (and is shown other doctors); the note is part of it.
			const text = note ? `${reason}: ${note}` : reason
			const res = await updateAppointmentsStatus(id, await getAppointmentStatusId('cancelled'), text)
			if (res.success) {
				toast.success(res.message || 'Request declined')
				setDeclineTarget(null)
				onChanged()
			} else reportRefusal(res.message)
		} catch (err) {
			reportFailure(err)
		} finally {
			setDeclineBusy(false)
		}
	}

	const noShowWindowOf = actionTarget ? noShowWindow(actionTarget.appt) : { canMark: false, hint: '' }

	const dialogs = (
		<>
			<AppointmentActionDialog
				open={!!actionTarget}
				mode={actionTarget?.mode ?? 'cancel'}
				patientName={actionTarget?.appt.patient?.name ?? 'Unknown Patient'}
				slotLabel={slotLabelOf(actionTarget?.appt ?? null)}
				noShowCanMark={noShowWindowOf.canMark}
				noShowHint={noShowWindowOf.hint}
				busy={actionBusy}
				onClose={() => setActionTarget(null)}
				onConfirmCancel={(reason) => void changeStatus('cancelled', reason)}
				onConfirmNoShow={() => void changeStatus('no_show')}
			/>
			<AskPatientRescheduleDialog
				open={!!askTarget}
				patientName={askTarget?.patient?.name ?? 'Unknown Patient'}
				slotLabel={slotLabelOf(askTarget)}
				busy={askBusy}
				onClose={() => setAskTarget(null)}
				onConfirm={(reason) => void askPatient(reason)}
			/>
			<ReasonDialog
				key={declineTarget?.id ?? 'none'}
				open={!!declineTarget}
				title={`Decline ${declineTarget?.patient?.name ?? 'this'}${declineTarget?.patient?.name ? "'s" : ''} request?`}
				sub={
					declineTarget
						? `${dayLabel(declineTarget.appointment_date)}, ${formatTime12h(declineTarget.start_time)}`
						: undefined
				}
				reasons={DECLINE_REASONS}
				help="The patient sees this and is shown other doctors."
				noteLabel="Note for the patient (optional)"
				okLabel="Decline request"
				danger
				busy={declineBusy}
				onClose={() => setDeclineTarget(null)}
				onConfirm={(reason, note) => void decline(reason, note)}
			/>
			<ReferDialog
				appointment={referTarget}
				onClose={() => setReferTarget(null)}
				onReferred={() => {
					setReferTarget(null)
					onChanged()
				}}
			/>
			{consultation.dialog}
		</>
	)

	return {
		busyIds,
		runMain: (vm, main) => void runMain(vm, main),
		openSummary,
		askCancel: (apt) => setActionTarget({ appt: apt, mode: 'cancel' }),
		askNoShow: (apt) => setActionTarget({ appt: apt, mode: 'no_show' }),
		askReschedule: (apt) => setAskTarget(apt),
		accept: (apt) => void accept(apt),
		askDecline: (apt) => setDeclineTarget(apt),
		askRefer: (apt) => setReferTarget(apt),
		dialogs,
	}
}
