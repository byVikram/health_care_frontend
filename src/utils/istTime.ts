// src/utils/istTime.ts
//
// India Standard Time (Mumbai), in one place. Every booking time (Lab tests, home care) is India time and the server decides what can be
// booked, so the browser's own clock and zone must not decide which day is today. (The doctor and "My bookings" screens still read the
// browser's clock; they can move to these helpers one by one.)
export const IST_OFFSET_MS = 330 * 60_000

/** 'YYYY-MM-DD' in Mumbai at `now`. */
export const istTodayIso = (now: Date = new Date()): string => {
	const t = new Date(now.getTime() + IST_OFFSET_MS)
	return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`
}

/** Seconds since midnight in Mumbai at `now`. */
export const istSecondsNow = (now: Date = new Date()): number => {
	const t = new Date(now.getTime() + IST_OFFSET_MS)
	return t.getUTCHours() * 3600 + t.getUTCMinutes() * 60 + t.getUTCSeconds()
}

/** True when the browser is set to a time zone other than India's: the times on a booking page are still India time and the page says so. */
export const browserOutsideIndia = (): boolean => {
	try {
		const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
		return !!zone && zone !== 'Asia/Kolkata' && zone !== 'Asia/Calcutta'
	} catch {
		return false
	}
}
