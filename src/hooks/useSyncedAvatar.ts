// Keeps the signed-in user's photo in the header / sidebar current. The login response carries one copy of it
// (stored in localStorage) and the bucket is private, so that copy is a signed URL that expires after about an
// hour. This asks the server for the current photo when a layout opens (and every so often), and updates the
// stored user, so the header, the sidebar and the profile page always show the same picture.
import { useEffect, useRef } from 'react'
import ApiService from '../services/apiService'
import { API_ENDPOINTS } from '../constants/apiUrls'
import { setAuth, useAuth } from './useAuth'

const ROLES_WITH_PHOTO = ['patient', 'doctor', 'pharmacy', 'radiology']
const REFRESH_EVERY_MS = 50 * 60 * 1000 // the signed URL lasts an hour

export function useSyncedAvatar() {
	const auth = useAuth()
	const latest = useRef(auth)
	const { role, accessToken } = auth

	useEffect(() => {
		latest.current = auth
	})

	useEffect(() => {
		if (!accessToken || !role || !ROLES_WITH_PHOTO.includes(role)) return
		let active = true

		const sync = async () => {
			try {
				const res = await ApiService.get<{ data?: { avatar_url?: string | null } }>(API_ENDPOINTS.UPLOADS.AVATAR)
				if (!active) return
				const avatar = res.data?.data?.avatar_url || ''
				const { role: r, user, accessToken: at, refreshToken: rt, lookupData } = latest.current
				if (!r || !user || !at || !rt) return

				const lookupChanged = lookupData?.patient_profiles?.some((p) => p.is_self && (p.avatar_s3_key || '') !== avatar)
				if ((user.avatar || '') === avatar && !lookupChanged) return

				setAuth(
					r,
					{ ...user, avatar: avatar || undefined },
					at,
					rt,
					lookupData && {
						...lookupData,
						// a patient's own entry in the account list is what the header shows first
						patient_profiles: lookupData.patient_profiles.map((p) =>
							p.is_self ? { ...p, avatar_s3_key: avatar || undefined } : p
						),
					}
				)
			} catch {
				// the header keeps what it has; the next refresh tries again
			}
		}

		void sync()
		const timer = window.setInterval(sync, REFRESH_EVERY_MS)
		return () => {
			active = false
			window.clearInterval(timer)
		}
	}, [role, accessToken])
}
