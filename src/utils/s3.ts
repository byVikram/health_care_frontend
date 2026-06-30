const S3_BASE_URL = (import.meta.env.VITE_S3_BASE_URL as string | undefined) || ''

export const buildS3Url = (key?: string | null): string => {
	if (!key) return ''
	if (key.startsWith('http://') || key.startsWith('https://')) return key
	return `${S3_BASE_URL.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}
