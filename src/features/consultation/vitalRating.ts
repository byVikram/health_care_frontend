import type { VitalRating } from '../../types/consultation'
import type { VitalRanges } from './consultationService'

// How a reading rates (normal / medium / high) is decided by the BACKEND (patients/vitals.py: the one table of cut-offs). A saved reading
// comes back with its `rating`, and while a value is typed the bands from GET /api/patients/vitals/ranges colour the field (rateTyped).
// No cut-off lives here. A clearly low reading is "high" too. Weight, height and the other measurements are not rated.

/** The key of each rated field of the Add Vitals form in the backend's ranges. */
export type RatedVital = 'systolic' | 'diastolic' | 'pulse_rate' | 'spo2' | 'temperature' | 'random'

/** How a typed value rates by the backend's bands; 'unset' when it is empty or not a number, or the bands are not known (the field is then not coloured). */
export function rateTyped(ranges: VitalRanges | null | undefined, key: RatedVital, raw: string): VitalRating {
	const bands = ranges?.[key]?.bands
	const n = raw.trim() === '' ? NaN : Number(raw)
	if (!bands?.length || Number.isNaN(n)) return 'unset'
	let rating: VitalRating = bands[0].rating
	for (const band of bands) {
		if (band.starts_at === null || n > band.starts_at || (band.inclusive && n === band.starts_at))
			rating = band.rating
	}
	return rating
}

/** Colours of a rating: the dot, the field's border and the value's text (green, amber, red). */
export const RATING_TONES: Record<VitalRating, { dot: string; border: string; ink: string }> = {
	high: { dot: '#d32f2f', border: '#f3b7ae', ink: '#d32f2f' },
	medium: { dot: '#e0a100', border: '#ebcb8b', ink: '#b26a00' },
	normal: { dot: '#388e3c', border: '', ink: '' },
	unset: { dot: '', border: '', ink: '' },
}

/** The rating in a word, for a screen reader only (nothing shows it as text). */
export const RATING_LABELS: Record<VitalRating, string> = {
	high: 'High',
	medium: 'Medium',
	normal: 'Normal',
	unset: '',
}
