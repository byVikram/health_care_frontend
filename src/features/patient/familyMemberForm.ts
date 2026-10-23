// What the "Add Family Member" dialog and the family member's own page share: the lists, the checks and the helpers.
// Everything here mirrors the mobile app (src/features/profile/config/profileOptions.ts and the family-member page).
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export const DATE_FORMAT = 'DD/MM/YYYY' // what the date picker shows and gives
export const API_DATE_FORMAT = 'YYYY-MM-DD'

export const FAMILY_RELATION_OPTIONS = [
	{ value: 'SPOUSE', label: 'Spouse' },
	{ value: 'FATHER', label: 'Father' },
	{ value: 'MOTHER', label: 'Mother' },
	{ value: 'SON', label: 'Son' },
	{ value: 'DAUGHTER', label: 'Daughter' },
	{ value: 'BROTHER', label: 'Brother' },
	{ value: 'SISTER', label: 'Sister' },
	{ value: 'GRANDPARENT', label: 'Grandparent' },
	{ value: 'OTHER', label: 'Other' },
]
// Older members (and the old booking form) were saved as Child / Parent / Sibling
const LEGACY_RELATION_LABELS: Record<string, string> = { CHILD: 'Child', PARENT: 'Parent', SIBLING: 'Sibling' }

export const GENDER_OPTIONS = ['Female', 'Male', 'Other', 'Prefer not to say'].map((v) => ({ value: v, label: v }))
export const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "Don't know"].map((v) => ({
	value: v,
	label: v,
}))
export const ALLERGY_OPTIONS = ['Penicillin', 'Sulfa drugs', 'Peanuts', 'Dust', 'Latex', 'Shellfish', 'Pollen'].map((v) => ({
	value: v,
	label: v,
}))
export const CONDITION_OPTIONS = [
	'Diabetes',
	'High BP',
	'High cholesterol',
	'Asthma',
	'Thyroid',
	'Heart disease',
	'Arthritis',
].map((v) => ({ value: v, label: v }))

/** A saved value that is not in the list (older records) is still offered, so the select does not show it as empty. */
export const withCurrent = (options: { value: string; label: string }[], current: string) =>
	current && !options.some((o) => o.value === current)
		? [...options, { value: current, label: LEGACY_RELATION_LABELS[current.toUpperCase()] ?? current }]
		: options

export const relationLabel = (value?: string | null) => {
	const key = (value || '').toUpperCase()
	return FAMILY_RELATION_OPTIONS.find((o) => o.value === key)?.label ?? LEGACY_RELATION_LABELS[key] ?? (value || 'Family')
}

export const isValidIndianMobile = (value: string) => /^(\+?91)?[6-9]\d{9}$/.test(value.replace(/[\s-]/g, ''))

export const numberOrUndefined = (value: string) => {
	const n = Number(value)
	return value.trim() && Number.isFinite(n) && n > 0 ? n : undefined
}

export interface BasicValues {
	name: string
	relation: string
	gender: string
	/** DD/MM/YYYY */
	dob: string
	mobile: string
}

export type BasicErrors = Partial<Record<keyof BasicValues, string>>

// The same checks, and messages, as the mobile app's family-member form
export const validateBasics = (v: BasicValues): BasicErrors => {
	const errors: BasicErrors = {}
	if (v.name.trim().length < 2) errors.name = 'Enter their full name'
	if (!v.relation) errors.relation = 'Choose how they are related to you'
	if (!v.gender) errors.gender = 'Choose a gender'
	if (!v.dob) errors.dob = 'Enter their date of birth'
	else if (dayjs(v.dob, DATE_FORMAT).isAfter(dayjs())) errors.dob = 'Date of birth cannot be in the future'
	if (v.mobile.trim() && !isValidIndianMobile(v.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number'
	return errors
}

export const toApiDate = (displayDate: string) => dayjs(displayDate, DATE_FORMAT).format(API_DATE_FORMAT)
export const fromApiDate = (apiDate?: string | null) => (apiDate ? dayjs(apiDate, API_DATE_FORMAT).format(DATE_FORMAT) : '')

export const messageOf = (error: unknown, fallback: string) =>
	(error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
