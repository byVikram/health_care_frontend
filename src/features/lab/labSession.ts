// src/features/lab/labSession.ts
//
// The web's counterpart of the native app's `utils/sessionCache.ts`: the lab caches (browsed items, the booking in progress) hold the
// patient's name, address and order, so they are cleared when the user logs out. The app announces every sign-in / sign-out with the
// `auth-changed` window event (hooks/useAuth.ts); a cache is cleared when it fires and there is no access token any more.
const clears = new Set<() => void>()
let listening = false

const onAuthChanged = () => {
	let signedIn = false
	try {
		signedIn = !!localStorage.getItem('access_token')
	} catch {
		signedIn = false
	}
	if (signedIn) return
	clears.forEach((clear) => clear())
}

export function registerSessionCache(clear: () => void): void {
	clears.add(clear)
	if (!listening && typeof window !== 'undefined') {
		listening = true
		window.addEventListener('auth-changed', onAuthChanged)
	}
}
