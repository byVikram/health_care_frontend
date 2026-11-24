// src/utils/sanitize.ts
//
// Untrusted HTML / URL handling for article bodies, editor links and podcast media.
import DOMPurify from 'dompurify'

/** Only absolute http(s) URLs (plus mailto when `allowMailto`). Returns the normalised URL or null. */
export const safeUrl = (raw: string | null | undefined, allowMailto = false): string | null => {
	const value = (raw ?? '').trim()
	if (!value) return null
	try {
		const u = new URL(value)
		if (u.protocol === 'http:' || u.protocol === 'https:') return u.href
		if (allowMailto && u.protocol === 'mailto:') return u.href
	} catch {
		// not an absolute URL
	}
	return null
}

// Links: http, https, mailto. Images: http(s) only (no data:, javascript:, relative).
const LINK_RE = /^(?:https?:|mailto:)/i
const IMG_RE = /^https?:\/\//i

let hooked = false
const ensureHooks = () => {
	if (hooked) return
	hooked = true
	DOMPurify.addHook('afterSanitizeAttributes', (node) => {
		if (node.tagName === 'A') {
			const href = node.getAttribute('href')
			if (href !== null && !LINK_RE.test(href.trim())) node.removeAttribute('href')
			if (node.getAttribute('target') === '_blank' || node.hasAttribute('href')) {
				node.setAttribute('target', '_blank')
				node.setAttribute('rel', 'noopener noreferrer nofollow')
			}
		}
		if (node.tagName === 'IMG') {
			const src = node.getAttribute('src')
			if (!src || !IMG_RE.test(src.trim())) node.parentNode?.removeChild(node)
		}
	})
}

export const sanitizeHtml = (html: string): string => {
	ensureHooks()
	return DOMPurify.sanitize(html, {
		USE_PROFILES: { html: true },
		FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'iframe', 'object', 'embed', 'svg', 'math'],
		FORBID_ATTR: ['style'],
		ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
	})
}
