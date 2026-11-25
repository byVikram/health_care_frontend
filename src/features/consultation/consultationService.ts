import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'

export interface VitalRecord {
	id: string
	vital_type: string
	recorded_at: string
	value: Record<string, unknown>
	/** How the reading rates, decided by the backend (patients/vitals.py): null for weight, height and others. */
	rating?: 'normal' | 'medium' | 'high' | null
	/** Only on the merged "others" rows of the history: the rating of each reading merged into the row, by its vital type. */
	ratings?: Record<string, 'normal' | 'medium' | 'high'>
	created_at: string
}

/** One band of a rated reading: a value is in the last band it has reached (equal to `starts_at` counts only when `inclusive`). */
export interface VitalBand {
	rating: 'normal' | 'medium' | 'high'
	starts_at: number | null
	inclusive: boolean
}

/** The bands per rated reading (systolic, diastolic, pulse_rate, spo2, temperature, random), lowest first. */
export type VitalRanges = Record<string, { label: string; unit: string; bands: VitalBand[] }>

export interface ReportRecord {
	id: string
	report_type: string
	report_date: string
	file_s3_key: string
	notes?: string
	created_at: string
}

export interface CreateVitalPayload {
	patient_public_id: string
	vital_type: string
	recorded_at: string
	value: Record<string, unknown>
}

export interface CreateReportPayload {
	patient_public_id: string
	report_type: string
	report_date: string
	file_s3_key: string
	notes: string | null
}

export interface VitalsHistoryParams {
	vital_type: string
	days?: number
}

interface PatientDetailsMetricsResponse {
	success: boolean
	data?: {
		personal?: {
			height?: string
			weight?: string
		}
	}
}

interface LatestVitalsApiResponse {
	success: boolean
	data: Record<string, VitalRecord | null>
}

interface VitalApiResponse {
	success: boolean
	data: VitalRecord[]
}

interface PatientMetrics {
	heightCm: number | null
	weightKg: number | null
}

// The vital types the "others" tab merges into one row per recorded time (pulse has a type of its own since the consultation vitals contract).
const OTHER_VITAL_TYPES = ['others', 'pulse', 'temperature', 'spo2'] as const

function hasValue(value: unknown): boolean {
	return value !== null && value !== undefined && value !== ''
}

function toNumber(value: unknown): number | null {
	if (!hasValue(value)) {
		return null
	}

	const numericValue = typeof value === 'number' ? value : Number(value)

	return Number.isFinite(numericValue) ? numericValue : null
}

function calculateBmi(weightKg: number | null, heightCm: number | null): number | null {
	if (!weightKg || !heightCm || heightCm <= 0) {
		return null
	}

	return Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1))
}

function normalizeVitalValue(
	vitalType: string,
	value: Record<string, unknown>,
	metrics?: PatientMetrics
): Record<string, unknown> {
	const normalizedValue = { ...value }

	switch (vitalType) {
		case 'glucose_level': {
			const randomValue = normalizedValue.random ?? normalizedValue.post_meal ?? normalizedValue.value

			if (hasValue(randomValue)) {
				normalizedValue.random = randomValue
				normalizedValue.post_meal = normalizedValue.post_meal ?? randomValue
			}

			normalizedValue.unit = normalizedValue.unit ?? 'mg/dL'
			return normalizedValue
		}

		case 'temperature': {
			const temperatureValue = normalizedValue.temperature ?? normalizedValue.value

			if (hasValue(temperatureValue)) {
				normalizedValue.temperature = temperatureValue
				normalizedValue.value = temperatureValue
			}

			normalizedValue.unit = normalizedValue.unit ?? 'F'
			return normalizedValue
		}

		case 'spo2': {
			const spo2Value = normalizedValue.spo2 ?? normalizedValue.value

			if (hasValue(spo2Value)) {
				normalizedValue.spo2 = spo2Value
				normalizedValue.value = spo2Value
			}

			normalizedValue.unit = normalizedValue.unit ?? '%'
			return normalizedValue
		}

		case 'weight': {
			const weightKg = toNumber(normalizedValue.value ?? normalizedValue.weight) ?? metrics?.weightKg ?? null
			const heightCm = toNumber(normalizedValue.height) ?? metrics?.heightCm ?? null
			const bmi = calculateBmi(weightKg, heightCm)

			if (weightKg !== null) {
				normalizedValue.value = weightKg
				normalizedValue.weight = weightKg
			}

			if (heightCm !== null) {
				normalizedValue.height = heightCm
			}

			if (bmi !== null) {
				normalizedValue.bmi = bmi
			}

			normalizedValue.unit = normalizedValue.unit ?? 'kg'
			return normalizedValue
		}

		default:
			return normalizedValue
	}
}

function normalizeVitalRecord(record: VitalRecord, metrics?: PatientMetrics): VitalRecord {
	return {
		...record,
		value: normalizeVitalValue(record.vital_type, record.value ?? {}, metrics),
	}
}

function sortByRecordedAtDesc(a: VitalRecord, b: VitalRecord): number {
	return new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
}

function mergeOtherVitals(records: VitalRecord[]): VitalRecord[] {
	const mergedRecords = new Map<string, VitalRecord>()

	for (const record of records) {
		const existingRecord = mergedRecords.get(record.recorded_at)

		const ratings = record.rating ? { [record.vital_type]: record.rating } : {}

		if (!existingRecord) {
			mergedRecords.set(record.recorded_at, {
				...record,
				vital_type: 'others',
				value: { ...record.value },
				ratings,
			})
			continue
		}

		mergedRecords.set(record.recorded_at, {
			...existingRecord,
			value: {
				...existingRecord.value,
				...record.value,
			},
			ratings: { ...existingRecord.ratings, ...ratings },
		})
	}

	return Array.from(mergedRecords.values()).sort(sortByRecordedAtDesc)
}

async function getPatientMetrics(
	patientPublicId: string,
	role?: string | null
): Promise<PatientMetrics> {
	const res =
		role === 'patient'
			? await ApiService.get<PatientDetailsMetricsResponse>(API_ENDPOINTS.PATIENT.ME, {
					params: { patient_id: patientPublicId },
				})
			: await ApiService.get<PatientDetailsMetricsResponse>(API_ENDPOINTS.PATIENT.GET_BY_ID(patientPublicId))
	const personal = res.data.data?.personal

	return {
		heightCm: toNumber(personal?.height) ?? null,
		weightKg: toNumber(personal?.weight) ?? null,
	}
}

async function fetchVitalsHistory(
	patientPublicId: string,
	params: VitalsHistoryParams
): Promise<VitalRecord[]> {
	const queryParams: Record<string, unknown> = { vital_type: params.vital_type }

	if (params.days !== undefined) {
		queryParams.days = params.days
	}

	const res = await ApiService.getWithParams<VitalApiResponse>(
		API_ENDPOINTS.PATIENT.VITALS_HISTORY(patientPublicId),
		queryParams
	)

	return res.data.data ?? []
}

// The heights measured at a patient's visits, for the BMI of each weight in the Weight tab. Kept for a minute per patient, so changing the
// tab's period does not fetch them again, and dropped when a reading is saved. A failure only means the profile's height is used: no toast.
const HEIGHT_CACHE_MS = 60_000
const heightHistory = new Map<string, { at: number; records: Promise<VitalRecord[]> }>()

async function fetchHeights(patientPublicId: string): Promise<VitalRecord[]> {
	try {
		const res = await ApiService.getWithParams<VitalApiResponse>(
			API_ENDPOINTS.PATIENT.VITALS_HISTORY(patientPublicId),
			{ vital_type: 'height' },
			{ suppressErrorToast: true }
		)
		return res.data.data ?? []
	} catch {
		heightHistory.delete(patientPublicId)
		return []
	}
}

function getHeightHistory(patientPublicId: string): Promise<VitalRecord[]> {
	const cached = heightHistory.get(patientPublicId)
	if (cached && Date.now() - cached.at < HEIGHT_CACHE_MS) return cached.records
	const records = fetchHeights(patientPublicId)
	heightHistory.set(patientPublicId, { at: Date.now(), records })
	return records
}

async function fetchVitalsByType(
	patientPublicId: string,
	vitalType: string,
	days?: number
): Promise<VitalRecord[]> {
	return fetchVitalsHistory(patientPublicId, { vital_type: vitalType, days })
}

/** The height measured at a visit (a `height` vital) wins over the one on the profile. */
function withMeasuredHeight(metrics: PatientMetrics | null, heightRecord?: VitalRecord | null): PatientMetrics | undefined {
	const measured = toNumber(heightRecord?.value?.height ?? heightRecord?.value?.value)
	if (measured === null) return metrics ?? undefined
	return { weightKg: metrics?.weightKg ?? null, heightCm: measured }
}

export const getLatestVitals = async (
	patientPublicId: string,
	role?: string | null
): Promise<Record<string, VitalRecord | null>> => {
	const [res, metrics] = await Promise.all([
		ApiService.get<LatestVitalsApiResponse>(API_ENDPOINTS.PATIENT.VITALS_LATEST(patientPublicId)),
		getPatientMetrics(patientPublicId, role).catch(() => null),
	])
	const latest = res.data.data ?? {}
	const bmiMetrics = withMeasuredHeight(metrics, latest.height)

	return Object.fromEntries(
		Object.entries(latest).map(([vitalType, record]) => [
			vitalType,
			record ? normalizeVitalRecord(record, bmiMetrics) : null,
		])
	)
}

export const getVitalsHistory = async (
	patientPublicId: string,
	params: VitalsHistoryParams,
	role?: string | null
): Promise<VitalRecord[]> => {
	const metricsPromise = getPatientMetrics(patientPublicId, role).catch(() => null)

	if (params.vital_type === 'others') {
		const [metrics, vitalGroups] = await Promise.all([
			metricsPromise,
			Promise.all(
				OTHER_VITAL_TYPES.map((vitalType) =>
					fetchVitalsByType(patientPublicId, vitalType, params.days)
				)
			),
		])

		return mergeOtherVitals(
			vitalGroups
				.flat()
				.map((record) => normalizeVitalRecord(record, metrics ?? undefined))
		)
	}

	if (params.vital_type === 'weight') {
		// BMI of each weight uses the height measured at (or before) that visit, then the profile's.
		const [metrics, records, heights] = await Promise.all([
			metricsPromise,
			fetchVitalsHistory(patientPublicId, params),
			getHeightHistory(patientPublicId),
		])
		const newestFirst = [...heights].sort(sortByRecordedAtDesc)

		return records.map((record) => {
			const at = new Date(record.recorded_at).getTime()
			const height = newestFirst.find((h) => new Date(h.recorded_at).getTime() <= at) ?? newestFirst[newestFirst.length - 1]
			return normalizeVitalRecord(record, withMeasuredHeight(metrics, height))
		})
	}

	const [metrics, records] = await Promise.all([
		metricsPromise,
		fetchVitalsHistory(patientPublicId, params),
	])

	return records.map((record) => normalizeVitalRecord(record, metrics ?? undefined))
}

/** The bands the backend rates a reading by, so a field can be coloured while it is typed (no numbers are kept here). */
export const getVitalRanges = async (): Promise<VitalRanges> => {
	const res = await ApiService.get<{ success: boolean; data: VitalRanges }>(API_ENDPOINTS.PATIENT.VITAL_RANGES, {
		suppressErrorToast: true, // a failure only means no colour while typing
	})
	return res.data.data ?? {}
}

export const createVital = async (payload: CreateVitalPayload): Promise<void> => {
	await ApiService.post(API_ENDPOINTS.PATIENT.VITALS_CREATE, payload)
	heightHistory.delete(payload.patient_public_id) // a saved height must show in the next Weight tab
}

export const getPatientReports = async (patientPublicId: string): Promise<ReportRecord[]> => {
	const res = await ApiService.get<{
		success: boolean
		data: ReportRecord[]
	}>(API_ENDPOINTS.PATIENT.REPORTS(patientPublicId))
	return res.data.data ?? []
}

export const createPatientReport = async (payload: CreateReportPayload): Promise<void> => {
	await ApiService.post(API_ENDPOINTS.PATIENT.REPORTS_CREATE, payload)
}
