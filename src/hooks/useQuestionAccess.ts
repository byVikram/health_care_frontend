// src/hooks/useQuestionAccess.ts
//
// What the signed-in user may do in the health Q&A, by persona:
//   patient (or a visitor, who is sent to log in when they ask)  -> asks questions
//   doctor an admin has verified                                  -> answers questions and replies
//   doctor still awaiting verification                            -> reads only
//   any other role (pharmacy, radiology, ...)                     -> reads; neither asks nor answers
// The server enforces the same rules (POST /api/qa/questions is patient-only; answers and a doctor's replies need a
// verified doctor), so this only decides what the UI offers.
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { USER_ROLES } from '../constants/constants'
import { getDoctorStatus } from '../features/doctor/doctorService'

export interface QuestionAccess {
	canAsk: boolean
	/** A verified doctor: may post an answer. */
	canAnswer: boolean
	/** May reply under an answer (everyone but a doctor who is not verified yet). */
	canReply: boolean
	/** A doctor whose verification is pending (or could not be confirmed): show why they cannot answer. */
	awaitingVerification: boolean
}

export function useQuestionAccess(): QuestionAccess {
	const { role } = useAuth()
	const isDoctor = role === USER_ROLES.DOCTOR
	// Fail closed: a doctor counts as unverified until the status says otherwise.
	const [verified, setVerified] = useState(false)
	const [checked, setChecked] = useState(false)

	useEffect(() => {
		if (!isDoctor) return
		let active = true
		const checkVerification = async () => {
			try {
				const status = await getDoctorStatus()
				if (active) setVerified(status.is_verified)
			} catch {
				if (active) setVerified(false)
			} finally {
				if (active) setChecked(true)
			}
		}
		void checkVerification()
		return () => {
			active = false
		}
	}, [isDoctor])

	return {
		canAsk: !role || role === USER_ROLES.PATIENT,
		canAnswer: isDoctor && verified,
		canReply: !isDoctor || verified,
		awaitingVerification: isDoctor && checked && !verified,
	}
}
