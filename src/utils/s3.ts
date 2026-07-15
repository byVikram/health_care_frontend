const S3_BASE_URL = (import.meta.env.VITE_S3_BASE_URL as string | undefined) || ''
const API_BASE_URL = (import.meta.env.VITE_API_ENDPOINT as string | undefined) || ''

export const buildS3Url = (key?: string | null): string => {
	if (!key) return ''
	if (/^(https?:|blob:|data:)/.test(key)) return key
	const baseUrl = S3_BASE_URL || API_BASE_URL
	if (!baseUrl) return key
	return `${baseUrl.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}
