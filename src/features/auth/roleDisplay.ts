// features/auth/roleDisplay.ts
//
// The "healthcare provider" sign-up role (the backend's `ancillary` role): the kinds of provider that can register and what each
// is called. Mirrors the mobile app's features/auth/roleDisplay.ts, so a nurse picks the same thing on both.

/** What a healthcare provider picks while registering. `key` is the specialty the backend stores (`specialty_id`). */
export const PROVIDER_KINDS = [
	{ key: 'nursing-care', label: 'Nurse' },
	{ key: 'physiotherapy', label: 'Physiotherapist' },
	{ key: 'home-care', label: 'Care attendant' },
	{ key: 'rehab-care', label: 'Rehab therapist' },
] as const

/** The role the backend calls "ancillary" (its label arrives as "Ancillary"). */
export const isProviderRole = (label: string): boolean => label.trim().toLowerCase() === 'ancillary'

/** "Nurse", ... for a specialty key; undefined for anything else. */
export const providerKindLabel = (key?: string): string | undefined => PROVIDER_KINDS.find((kind) => kind.key === key)?.label
