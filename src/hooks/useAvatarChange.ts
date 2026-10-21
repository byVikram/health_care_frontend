// "Change / remove photo" for the profile pages: shows the picked image right away, uploads it through the
// common avatar API and rolls back if the upload fails. Works the same for every role.
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { fetchCurrentAvatar, removeAvatar, uploadAvatar, validateAvatarFile } from '../services/avatarService'

/** Fired after the photo changes, so components that cache their own copy (the header) can follow. */
export const AVATAR_CHANGED_EVENT = 'avatar-changed'
const REFRESH_EVERY_MS = 50 * 60 * 1000 // the signed URL lasts an hour
const announce = (avatar: string) => window.dispatchEvent(new CustomEvent<string>(AVATAR_CHANGED_EVENT, { detail: avatar }))

type Options = {
	/** The photo currently shown (restored when a change fails). */
	current: string
	/** Called with the URL to show: a local preview first, then the signed URL, or '' after removal. */
	onChanged: (avatarUrl: string) => void
	/** Called only with a confirmed (server-side) URL, e.g. to refresh the signed-in user's avatar. */
	onSaved?: (avatarUrl: string) => void
}

const messageOf = (error: unknown): string => {
	const e = error as { response?: { data?: { message?: string; detail?: string } }; message?: string }
	return e?.response?.data?.message || e?.response?.data?.detail || e?.message || 'Please try again.'
}

export function useAvatarChange({ current, onChanged, onSaved }: Options) {
	const [busy, setBusy] = useState(false)
	const previewRef = useRef<string | null>(null)

	// The photo on screen is a signed URL that stops working after an hour. While the page stays open, swap in a fresh
	// one before that (and when the tab is shown again), so the picture never turns into initials.
	const latest = useRef({ current, busy, onChanged })
	useEffect(() => {
		latest.current = { current, busy, onChanged }
	})
	useEffect(() => {
		const refresh = async () => {
			const { current: shown, busy: working, onChanged: show } = latest.current
			if (working || !/^https?:/.test(shown)) return // nothing to renew (no photo, or a local preview)
			try {
				const url = await fetchCurrentAvatar()
				if (url && url !== shown) show(url)
			} catch {
				// keep what is shown; the next refresh tries again
			}
		}
		const timer = window.setInterval(refresh, REFRESH_EVERY_MS)
		const onVisible = () => {
			if (document.visibilityState === 'visible') void refresh()
		}
		document.addEventListener('visibilitychange', onVisible)
		return () => {
			window.clearInterval(timer)
			document.removeEventListener('visibilitychange', onVisible)
		}
	}, [])

	const releasePreview = () => {
		if (previewRef.current) URL.revokeObjectURL(previewRef.current)
		previewRef.current = null
	}

	const change = useCallback(
		async (file: File) => {
			const problem = validateAvatarFile(file)
			if (problem) {
				toast.error(problem)
				return
			}
			setBusy(true)
			releasePreview()
			previewRef.current = URL.createObjectURL(file)
			onChanged(previewRef.current)
			try {
				const url = await uploadAvatar(file)
				releasePreview()
				onChanged(url)
				onSaved?.(url)
				announce(url)
				toast.success('Profile photo updated')
			} catch (error) {
				releasePreview()
				onChanged(current)
				toast.error(`Photo not saved. ${messageOf(error)}`)
			} finally {
				setBusy(false)
			}
		},
		[current, onChanged, onSaved]
	)

	const remove = useCallback(async () => {
		setBusy(true)
		try {
			await removeAvatar()
			onChanged('')
			onSaved?.('')
			announce('')
			toast.success('Profile photo removed')
		} catch (error) {
			toast.error(`Photo not removed. ${messageOf(error)}`)
		} finally {
			setBusy(false)
		}
	}, [onChanged, onSaved])

	return { change, remove, busy }
}
