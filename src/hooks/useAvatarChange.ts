// "Change / remove photo" for the profile pages: shows the picked image right away, uploads it through the
// common avatar API and rolls back if the upload fails. Works the same for every role.
import { useCallback, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { removeAvatar, uploadAvatar, validateAvatarFile } from '../services/avatarService'

/** Fired after the photo changes, so components that cache their own copy (the header) can follow. */
export const AVATAR_CHANGED_EVENT = 'avatar-changed'
const announce = (avatar: string) => window.dispatchEvent(new CustomEvent<string>(AVATAR_CHANGED_EVENT, { detail: avatar }))

type Options = {
	/** The photo currently shown (restored when a change fails). */
	current: string
	/** Called with the URL to show: a local preview first, then the signed URL, or '' after removal. */
	onChanged: (avatarUrl: string) => void
	/** Called only with a confirmed (server-side) URL, e.g. to update the signed-in user's avatar. */
	onSaved?: (avatarUrl: string) => void
}

const messageOf = (error: unknown): string => {
	const e = error as { response?: { data?: { message?: string; detail?: string } }; message?: string }
	return e?.response?.data?.message || e?.response?.data?.detail || e?.message || 'Please try again.'
}

export function useAvatarChange({ current, onChanged, onSaved }: Options) {
	const [busy, setBusy] = useState(false)
	const previewRef = useRef<string | null>(null)

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
