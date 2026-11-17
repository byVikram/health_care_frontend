// src/features/doctor/useStartConsultation.tsx
//
// Starting a consultation, the way DoctorAppointments does it: the server sends the patient the access code (or says it was already
// given), the doctor asks the patient for it in the code dialog, and then the consultation page opens. The hook returns `start` and the
// `dialog` element the page has to render once.
import { useState, type ReactElement } from 'react'
import { Dialog, DialogContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import OtpForm from '../auth/components/OtpForm'

export interface StartConsultation {
	/** Starts the consultation of an appointment (opens the code dialog unless the patient's code was already given). */
	start: (appointmentId: string, patientId: string) => Promise<void>
	/** Opens the consultation page straight away (a finished or already verified appointment). */
	goToConsultation: (appointmentId: string, patientId: string) => void
	/** The appointment whose start call is in flight. */
	startingId: string | null
	/** The code dialog: render it once in the page. */
	dialog: ReactElement
}

export default function useStartConsultation(): StartConsultation {
	const navigate = useNavigate()
	const [startingId, setStartingId] = useState<string | null>(null)
	const [codeFor, setCodeFor] = useState<{ appointmentId: string; patientId: string } | null>(null)

	const goToConsultation = (appointmentId: string, patientId: string) =>
		navigate(`/consultation/${patientId}/${appointmentId}`)

	const start = async (appointmentId: string, patientId: string) => {
		setStartingId(appointmentId)
		try {
			const res = await ApiService.post<{ success: boolean; data?: { already_verified?: boolean } }>(
				`${API_ENDPOINTS.APPOINTMENTS.GET_BY_ID(appointmentId)}/start-consultation`,
				{}
			)
			if (!res.data.success) return
			if (res.data.data?.already_verified) {
				// The patient already gave the code for this appointment: no second code, straight in.
				goToConsultation(appointmentId, patientId)
				return
			}
			setCodeFor({ appointmentId, patientId })
		} catch {
			toast.error('Failed to generate OTP')
		} finally {
			setStartingId(null)
		}
	}

	const dialog = (
		<Dialog open={!!codeFor} onClose={() => setCodeFor(null)} maxWidth="xs" fullWidth>
			<DialogContent sx={{ pt: 3 }}>
				<OtpForm
					contactNumber=""
					mode="modal"
					onVerify={() => {
						const target = codeFor
						setCodeFor(null)
						if (target) goToConsultation(target.appointmentId, target.patientId)
					}}
					onCustomVerify={async (otp: string) => {
						if (!codeFor) return false
						const res = await ApiService.post<{ success: boolean }>(
							`${API_ENDPOINTS.APPOINTMENTS.GET_BY_ID(codeFor.appointmentId)}/verify-otp`,
							{ otp }
						)
						return res.data.success
					}}
				/>
			</DialogContent>
		</Dialog>
	)

	return { start, goToConsultation, startingId, dialog }
}
