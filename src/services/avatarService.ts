// Profile photo for every role. The server stores the file and links it to the caller's own profile
// (PUT /api/uploads/avatar), so the app never sends a storage key -- it only sends the picked image.
import ApiService from './apiService'
import { API_ENDPOINTS } from '../constants/apiUrls'

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
export const AVATAR_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type AvatarResponse = { data?: { avatar_s3_key?: string | null; avatar_url?: string | null } }

/** Returns an error message when the file can't be used as a photo, otherwise null. */
export function validateAvatarFile(file: File): string | null {
	if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) return 'Please choose a JPEG, PNG or WebP image.'
	if (file.size > AVATAR_MAX_BYTES) return 'The photo must be 5 MB or smaller.'
	return null
}

/** Upload a picked photo. Resolves with a signed URL that can be shown straight away. */
export async function uploadAvatar(file: File): Promise<string> {
	const form = new FormData()
	form.append('file', file)
	const res = await ApiService.put<AvatarResponse>(API_ENDPOINTS.UPLOADS.AVATAR, form)
	return res.data?.data?.avatar_url || res.data?.data?.avatar_s3_key || ''
}

export async function removeAvatar(): Promise<void> {
	await ApiService.delete(API_ENDPOINTS.UPLOADS.AVATAR)
}
