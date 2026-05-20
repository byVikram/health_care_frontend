import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'

export interface VitalRecord {
	id: string
	vital_type: string
	recorded_at: string
	value: Record<string, unknown>
	created_at: string
}

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

const OTHER_VITAL_TYPES = ['others', 'temperature', 'spo2'] as const

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

		if (!existingRecord) {
			mergedRecords.set(record.recorded_at, {
				...record,
				vital_type: 'others',
				value: { ...record.value },
			})
			continue
		}

		mergedRecords.set(record.recorded_at, {
			...existingRecord,
			value: {
				...existingRecord.value,
				...record.value,
			},
		})
	}

	return Array.from(mergedRecords.values()).sort(sortByRecordedAtDesc)
}

async function getPatientMetrics(patientPublicId: string): Promise<PatientMetrics> {
	const res = await ApiService.get<PatientDetailsMetricsResponse>(API_ENDPOINTS.PATIENT.GET_BY_ID(patientPublicId))
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

async function fetchVitalsByType(
	patientPublicId: string,
	vitalType: string,
	days?: number
): Promise<VitalRecord[]> {
	return fetchVitalsHistory(patientPublicId, { vital_type: vitalType, days })
}

export const getLatestVitals = async (
	patientPublicId: string
): Promise<Record<string, VitalRecord | null>> => {
	const [res, metrics] = await Promise.all([
		ApiService.get<LatestVitalsApiResponse>(API_ENDPOINTS.PATIENT.VITALS_LATEST(patientPublicId)),
		getPatientMetrics(patientPublicId).catch(() => null),
	])

	return Object.fromEntries(
		Object.entries(res.data.data ?? {}).map(([vitalType, record]) => [
			vitalType,
			record ? normalizeVitalRecord(record, metrics ?? undefined) : null,
		])
	)
}

export const getVitalsHistory = async (
	patientPublicId: string,
	params: VitalsHistoryParams
): Promise<VitalRecord[]> => {
	const metricsPromise = getPatientMetrics(patientPublicId).catch(() => null)

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

	const [metrics, records] = await Promise.all([
		metricsPromise,
		fetchVitalsHistory(patientPublicId, params),
	])

	return records.map((record) => normalizeVitalRecord(record, metrics ?? undefined))
}

export const createVital = async (payload: CreateVitalPayload): Promise<void> => {
	await ApiService.post(API_ENDPOINTS.PATIENT.VITALS_CREATE, payload)
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
